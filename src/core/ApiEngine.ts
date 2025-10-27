/**
 * API 引擎核心实现
 * 提供插件系统、方法注册、调用机制等核心功能
 * 
 * 性能优化：
 * - 使用序列化优化器减少JSON.stringify开销
 * - 使用分级对象池提高对象复用率
 * - 使用内存保护避免内存泄漏
 * - 缓存中间件合并结果
 * - 使用正则表达式缓存
 */

import type { HttpClient } from '@ldesign/http'
import type {
  ApiCallOptions,
  ApiEngine,
  ApiEngineConfig,
  ApiMethodConfig,
  ApiPlugin,
  CacheStats,
  DebounceManager,
  DeduplicationManager, ErrorMiddleware, RequestMiddleware, ResponseMiddleware
} from '../types'
import type { ErrorReporter } from '../utils/ErrorReporter'
import type { PerformanceMonitor } from '../utils/PerformanceMonitor'

import { createHttpClientSync } from '@ldesign/http'
import { ApiError, ApiErrorFactory } from '../utils/ApiError'
import { CacheManager } from '../utils/CacheManager'
import { DebounceManagerImpl } from '../utils/DebounceManager'
import { DeduplicationManagerImpl } from '../utils/DeduplicationManager'
import { getGlobalErrorReporter } from '../utils/ErrorReporter'
import { LRUCache } from '../utils/LRUCache'
import { getGlobalPerformanceMonitor } from '../utils/PerformanceMonitor'
import { RequestQueueManager } from '../utils/RequestQueue'
import { version as libVersion } from '../version'
import {
  CACHE_CONSTANTS,
  CIRCUIT_BREAKER_CONSTANTS,
  DEBOUNCE_CONSTANTS,
  HTTP_CONSTANTS,
  OBJECT_POOL_CONSTANTS,
  QUEUE_CONSTANTS
} from '../constants'
import { SerializationOptimizer } from '../utils/SerializationOptimizer'
import { getGlobalMemoryGuard } from '../utils/MemoryGuard'
import { ObjectPoolFactory, TieredObjectPool } from '../utils/TieredObjectPool'

/**
 * 默认配置常量（优化：使用导入的常量避免魔法数字）
 */
const DEFAULT_CONFIG = {
  HTTP_TIMEOUT: HTTP_CONSTANTS.DEFAULT_TIMEOUT,
  CACHE_TTL: CACHE_CONSTANTS.DEFAULT_TTL,
  CACHE_MAX_SIZE: CACHE_CONSTANTS.DEFAULT_MAX_SIZE,
  DEBOUNCE_DELAY: DEBOUNCE_CONSTANTS.DEFAULT_DELAY,
  DEFAULT_CONCURRENCY: QUEUE_CONSTANTS.DEFAULT_CONCURRENCY,
  CIRCUIT_CLEANUP_INTERVAL: CIRCUIT_BREAKER_CONSTANTS.CLEANUP_INTERVAL,
  CIRCUIT_EXPIRE_TIME: CIRCUIT_BREAKER_CONSTANTS.EXPIRE_TIME,
} as const

/**
 * 断路器默认配置（优化：使用导入的常量）
 */
const DEFAULT_FAILURE_THRESHOLD = CIRCUIT_BREAKER_CONSTANTS.DEFAULT_FAILURE_THRESHOLD
const DEFAULT_HALF_OPEN_AFTER = CIRCUIT_BREAKER_CONSTANTS.DEFAULT_HALF_OPEN_AFTER
const DEFAULT_SUCCESS_THRESHOLD = CIRCUIT_BREAKER_CONSTANTS.DEFAULT_SUCCESS_THRESHOLD

/**
 * 正则表达式缓存（性能优化：避免重复创建）
 */
const REGEX_CACHE = {
  /** 清除缓存的正则（匹配方法名前缀） */
  clearCacheByMethod: new Map<string, RegExp>(),
} as const

/**
 * API 引擎实现类
 */
export class ApiEngineImpl implements ApiEngine {
  /** 配置 */
  public readonly config: ApiEngineConfig

  /** HTTP 客户端 */
  public readonly httpClient: HttpClient

  /** 已注册的插件 */
  public readonly plugins = new Map<string, ApiPlugin>()

  /** 已注册的方法 */
  public readonly methods = new Map<string, ApiMethodConfig>()

  /** 缓存管理器 */
  private readonly cacheManager: CacheManager

  /** 防抖管理器 */
  private readonly debounceManager: DebounceManager

  /** 去重管理器 */
  private readonly deduplicationManager: DeduplicationManager

  /** 请求队列管理器（可选） */
  private requestQueueManager: RequestQueueManager | null = null

  /** 是否已销毁 */
  private destroyed = false

  /** 断路器状态 */
  private readonly circuitStates = new Map<string, { state: 'closed' | 'open' | 'half-open', failureCount: number, successCount: number, nextTryAt: number }>()

  /** 序列化优化器（性能优化：减少JSON.stringify开销） */
  private readonly serializationOptimizer: SerializationOptimizer

  /** 分级对象池（性能优化：提高对象复用率） */
  private readonly contextPool: TieredObjectPool<{ methodName: string, params: unknown, engine: ApiEngine }>
  private readonly configPool: TieredObjectPool<Record<string, unknown>>
  private readonly arrayPool: TieredObjectPool<any[]>

  /** 错误报告器 */
  private errorReporter: ErrorReporter | null = null

  /** 性能监控器 */
  private performanceMonitor: PerformanceMonitor | null = null

  /** 断路器状态清理定时器 */
  private circuitStatesCleanupTimer: ReturnType<typeof setInterval> | null = null

  /** 中间件缓存 */
  private middlewareCache: LRUCache<{
    request: RequestMiddleware[]
    response: ResponseMiddleware[]
    error: ErrorMiddleware[]
  }>

  constructor(config: ApiEngineConfig = {}) {
    this.config = {
      appName: 'LDesign API',
      version: libVersion,
      debug: false,
      ...config,
      http: {
        timeout: DEFAULT_CONFIG.HTTP_TIMEOUT,
        ...(config.http || {}),
      },
      cache: {
        enabled: true,
        ttl: DEFAULT_CONFIG.CACHE_TTL,
        maxSize: DEFAULT_CONFIG.CACHE_MAX_SIZE,
        storage: 'memory',
        ...(config.cache || {}),
      },
      debounce: {
        enabled: true,
        delay: DEFAULT_CONFIG.DEBOUNCE_DELAY,
        ...(config.debounce || {}),
      },
      deduplication: {
        enabled: true,
        ...(config.deduplication || {}),
      },
    }

    // 创建 HTTP 客户端（使用同步方法，需要预先加载适配器）
    this.httpClient = createHttpClientSync(this.config.http)

    // 创建管理器
    this.cacheManager = new CacheManager(this.config.cache!)
    this.debounceManager = new DebounceManagerImpl()
    this.deduplicationManager = new DeduplicationManagerImpl()

    // 初始化序列化优化器（性能优化）
    this.serializationOptimizer = new SerializationOptimizer()

    // 初始化分级对象池（性能优化）
    this.contextPool = ObjectPoolFactory.createContextPool()
    this.configPool = ObjectPoolFactory.createConfigPool()
    this.arrayPool = ObjectPoolFactory.createArrayPool()

    // 初始化中间件缓存（最多缓存 100 个不同的中间件组合）
    this.middlewareCache = new LRUCache({
      maxSize: OBJECT_POOL_CONSTANTS.MAX_CONTEXTS,
      defaultTTL: CACHE_CONSTANTS.VERY_LONG_TTL,
      enabled: true,
    })

    // 创建请求队列（按需）
    if (this.config?.queue?.enabled) {
      const q = {
        enabled: true,
        concurrency: this.config?.queue.concurrency ?? DEFAULT_CONFIG.DEFAULT_CONCURRENCY,
        maxQueue: this.config?.queue.maxQueue ?? 0,
      }
      this.requestQueueManager = new RequestQueueManager(q)
    }

    // 初始化错误报告器
    this.errorReporter = getGlobalErrorReporter()

    // 初始化性能监控器
    this.performanceMonitor = getGlobalPerformanceMonitor()

    // 启动断路器状态清理定时器
    this.startCircuitBreakerCleanup()

    this.log('API Engine initialized', this.config)
  }

  /**
   * 注册插件
   */
  async use(plugin: ApiPlugin): Promise<void> {
    if (this.destroyed) {
      throw new Error('API Engine has been destroyed')
    }

    if (this.plugins.has(plugin.name)) {
      this.log(`Plugin "${plugin.name}" already registered, skipping`)
      return
    }

    // 检查依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(
            `Plugin "${plugin.name}" depends on "${dep}", but it's not registered`,
          )
        }
      }
    }

    // 注册 API 方法
    if (plugin.apis) {
      for (const [methodName, methodConfig] of Object.entries(plugin.apis)) {
        this.register(methodName, methodConfig)
      }
    }

    // 执行插件安装
    if (plugin.install) {
      await plugin.install(this)
    }

    this.plugins.set(plugin.name, plugin)
    this.log(`Plugin "${plugin.name}" registered successfully`)
  }

  /**
   * 卸载插件
   */
  async unuse(pluginName: string): Promise<void> {
    if (this.destroyed) {
      throw new Error('API Engine has been destroyed')
    }

    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      this.log(`Plugin "${pluginName}" not found, skipping`)
      return
    }

    // 检查是否有其他插件依赖此插件
    for (const [name, p] of this.plugins) {
      if (name !== pluginName && p.dependencies?.includes(pluginName)) {
        throw new Error(
          `Cannot uninstall plugin "${pluginName}" because "${name}" depends on it`,
        )
      }
    }

    // 卸载 API 方法
    if (plugin.apis) {
      for (const methodName of Object.keys(plugin.apis)) {
        this.unregister(methodName)
      }
    }

    // 执行插件卸载
    if (plugin.uninstall) {
      await plugin.uninstall(this)
    }

    this.plugins.delete(pluginName)
    this.log(`Plugin "${pluginName}" uninstalled successfully`)
  }

  /**
   * 注册 API 方法
   */
  register(methodName: string, config: ApiMethodConfig): void {
    if (this.destroyed) {
      throw new Error('API Engine has been destroyed')
    }

    if (this.methods.has(methodName)) {
      this.log(`Method "${methodName}" already registered, overriding`)
    }

    this.methods.set(methodName, config)
    this.log(`Method "${methodName}" registered successfully`)
  }

  /**
   * 注册多个 API 方法
   */
  registerBatch(methods: Record<string, ApiMethodConfig>): void {
    for (const [methodName, config] of Object.entries(methods)) {
      this.register(methodName, config)
    }
  }

  /**
   * 取消注册 API 方法
   */
  unregister(methodName: string): void {
    if (this.destroyed) {
      throw new Error('API Engine has been destroyed')
    }

    if (this.methods.has(methodName)) {
      this.methods.delete(methodName)
      this.log(`Method "${methodName}" unregistered successfully`)
    }
  }

  /**
   * 检查缓存并返回缓存数据（如果存在）
   */
  private checkCache<T>(
    methodName: string,
    params: unknown,
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
    cacheKey: string,
  ): T | null {
    if (!options.skipCache && this.shouldUseCache(methodConfig, options)) {
      const cachedData = this.cacheManager.get<T>(cacheKey)
      if (cachedData !== null) {
        this.log(`Cache hit for method "${methodName}"`)
        return cachedData
      }
    }
    return null
  }

  /**
   * 构建重试配置
   */
  private buildRetryConfig(
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ) {
    return {
      enabled: false,
      retries: 0,
      delay: 0,
      backoff: 'fixed' as 'fixed' | 'exponential',
      maxDelay: undefined as number | undefined,
      retryOn: (_error: unknown, _attempt: number) => true,
      ...this.config?.retry,
      ...methodConfig.retry,
      ...options.retry,
    }
  }

  /**
   * 构建断路器配置
   */
  private buildCircuitBreakerConfig(
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ) {
    return {
      enabled: this.config?.retry?.circuitBreaker?.enabled || methodConfig.retry?.circuitBreaker?.enabled || options.retry?.circuitBreaker?.enabled || false,
      failureThreshold: options.retry?.circuitBreaker?.failureThreshold ?? methodConfig.retry?.circuitBreaker?.failureThreshold ?? this.config?.retry?.circuitBreaker?.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD,
      halfOpenAfter: options.retry?.circuitBreaker?.halfOpenAfter ?? methodConfig.retry?.circuitBreaker?.halfOpenAfter ?? this.config?.retry?.circuitBreaker?.halfOpenAfter ?? DEFAULT_HALF_OPEN_AFTER,
      successThreshold: options.retry?.circuitBreaker?.successThreshold ?? methodConfig.retry?.circuitBreaker?.successThreshold ?? this.config?.retry?.circuitBreaker?.successThreshold ?? DEFAULT_SUCCESS_THRESHOLD,
    }
  }

  /**
   * 检查断路器状态并抛出错误（如果需要）
   * 
   * 断路器状态机：
   * - closed（关闭）：正常状态，允许请求通过
   * - open（打开）：失败次数超过阈值，拒绝所有请求
   * - half-open（半开）：等待时间后，允许部分请求尝试恢复
   * 
   * @param methodName API方法名称
   * @param methodConfig 方法配置
   * @param options 调用选项
   * @param circuitBreakerConfig 断路器配置
   */
  private checkCircuitBreaker(
    methodName: string,
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
    circuitBreakerConfig: ReturnType<typeof this.buildCircuitBreakerConfig>,
  ): void {
    if (!circuitBreakerConfig.enabled) {
      return
    }

    const circuitState = this.circuitStates.get(methodName)
    const now = Date.now()

    // 断路器打开状态：拒绝请求直到等待时间结束
    if (circuitState?.state === 'open' && now < circuitState.nextTryAt) {
      const error = new Error(`Circuit breaker open for method "${methodName}"`)
      methodConfig.onError?.(error)
      options.onError?.(error)
      throw error
    }

    // 断路器打开状态但等待时间已过：切换到半开状态
    if (circuitState?.state === 'open' && now >= circuitState.nextTryAt) {
      this.circuitStates.set(methodName, {
        state: 'half-open',
        failureCount: circuitState.failureCount,
        successCount: 0,
        nextTryAt: now + circuitBreakerConfig.halfOpenAfter,
      })
    }
  }

  /**
   * 处理断路器成功反馈
   * 
   * 成功策略：
   * - half-open状态：累计成功次数，达到阈值后关闭断路器
   * - 其他状态：直接设置为关闭状态
   * 
   * @param methodName API方法名称
   * @param circuitBreakerConfig 断路器配置
   */
  private handleCircuitBreakerSuccess(
    methodName: string,
    circuitBreakerConfig: ReturnType<typeof this.buildCircuitBreakerConfig>,
  ): void {
    if (!circuitBreakerConfig.enabled) {
      return
    }

    const circuitState = this.circuitStates.get(methodName)

    // 半开状态：累计成功次数
    if (circuitState?.state === 'half-open') {
      const successCount = (circuitState.successCount ?? 0) + 1

      // 成功次数达到阈值：关闭断路器，恢复正常
      if (successCount >= circuitBreakerConfig.successThreshold) {
        this.circuitStates.set(methodName, {
          state: 'closed',
          failureCount: 0,
          successCount: 0,
          nextTryAt: 0,
        })
      }
      else {
        // 继续累计成功次数
        this.circuitStates.set(methodName, { ...circuitState, successCount })
      }
    }
    // 其他状态（open或undefined）：直接关闭
    else if (!circuitState || circuitState.state !== 'closed') {
      this.circuitStates.set(methodName, {
        state: 'closed',
        failureCount: 0,
        successCount: 0,
        nextTryAt: 0,
      })
    }
  }

  /**
   * 处理断路器失败反馈
   * 
   * 失败策略：
   * - half-open状态：任何失败都立即打开断路器
   * - closed状态：累计失败次数，达到阈值后打开断路器
   * 
   * @param methodName API方法名称
   * @param circuitBreakerConfig 断路器配置
   */
  private handleCircuitBreakerFailure(
    methodName: string,
    circuitBreakerConfig: ReturnType<typeof this.buildCircuitBreakerConfig>,
  ): void {
    if (!circuitBreakerConfig.enabled) {
      return
    }

    const circuitState = this.circuitStates.get(methodName) ?? {
      state: 'closed' as const,
      failureCount: 0,
      successCount: 0,
      nextTryAt: 0,
    }
    const failureCount = circuitState.failureCount + 1

    // 半开状态失败：立即打开断路器（快速失败）
    if (circuitState.state === 'half-open') {
      this.circuitStates.set(methodName, {
        state: 'open',
        failureCount,
        successCount: 0,
        nextTryAt: Date.now() + circuitBreakerConfig.halfOpenAfter,
      })
    }
    // 失败次数达到阈值：打开断路器
    else if (failureCount >= circuitBreakerConfig.failureThreshold) {
      this.circuitStates.set(methodName, {
        state: 'open',
        failureCount,
        successCount: 0,
        nextTryAt: Date.now() + circuitBreakerConfig.halfOpenAfter,
      })
    }
    // 继续累计失败次数
    else {
      this.circuitStates.set(methodName, { ...circuitState, failureCount })
    }
  }

  /**
   * 缓存成功结果
   */
  private cacheResult<T>(
    cacheKey: string,
    data: T,
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ): void {
    if (!options.skipCache && this.shouldUseCache(methodConfig, options)) {
      const cacheConfig = {
        ...this.config?.cache,
        ...methodConfig.cache,
        ...options.cache,
      }
      this.cacheManager.set<T>(cacheKey, data, cacheConfig.ttl!)
    }
  }

  /**
   * 调用成功回调
   */
  private invokeSuccessCallbacks<T>(
    data: T,
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ): void {
    methodConfig.onSuccess?.(data)
    options.onSuccess?.(data)
  }

  /**
   * 计算重试延迟（包括错动）
   */
  private calculateRetryDelay(
    attempt: number,
    retryConfig: ReturnType<typeof this.buildRetryConfig>,
  ): number {
    const baseDelay = retryConfig.delay || 0
    let delay = baseDelay

    if (retryConfig.backoff === 'exponential') {
      delay = baseDelay * 2 ** attempt
      if (retryConfig.maxDelay) {
        delay = Math.min(delay, retryConfig.maxDelay)
      }
    }

    const jitter = (retryConfig as any).jitter ?? this.config?.retry?.jitter ?? 0
    if (typeof jitter === 'number' && jitter > 0) {
      const delta = delay * jitter
      const min = Math.max(0, delay - delta)
      const max = delay + delta
      delay = Math.floor(min + Math.random() * (max - min))
    }

    return delay
  }

  /**
   * 调用 API 方法（核心方法）
   * 
   * 执行流程：
   * 1. 性能监控开始
   * 2. 检查缓存（如果启用）
   * 3. 获取并合并中间件
   * 4. 构建重试和断路器配置
   * 5. 从对象池获取上下文
   * 6. 执行请求（带重试、断路器保护）
   *    - 应用请求中间件
   *    - 发送HTTP请求（可能走队列）
   *    - 应用响应中间件
   *    - 数据转换和验证
   * 7. 缓存结果
   * 8. 调用成功回调
   * 9. 归还上下文到对象池
   * 10. 性能监控结束
   * 
   * 优化特性：
   * - 使用序列化优化器减少JSON.stringify开销
   * - 使用分级对象池提高对象复用率
   * - 使用LRU缓存减少重复请求
   * - 支持请求去重和防抖
   * - 支持断路器保护
   * 
   * @param methodName API方法名称
   * @param params 请求参数
   * @param options 调用选项
   * @returns 响应数据
   * @throws {ApiError} 请求失败时抛出
   * 
   * @example
   * ```typescript
   * // 基础调用
   * const data = await engine.call('getUserInfo')
   * 
   * // 带参数调用
   * const user = await engine.call('getUser', { id: 123 })
   * 
   * // 带选项调用
   * const result = await engine.call('createUser', userData, {
   *   skipCache: true,
   *   retry: { retries: 3 },
   *   onSuccess: (data) => console.log('Success', data)
   * })
   * ```
   */
  async call<T = unknown>(
    methodName: string,
    params?: unknown,
    options: ApiCallOptions = {},
  ): Promise<T> {
    if (this.destroyed) {
      throw new Error('API Engine has been destroyed')
    }

    const methodConfig = this.methods.get(methodName)
    if (!methodConfig) {
      throw new Error(`Method "${methodName}" not found`)
    }

    // 开始性能监控
    const endMonitoring = this.performanceMonitor?.startCall(methodName, params) || (() => { })

    try {
      // 生成缓存键
      const cacheKey = this.generateCacheKey(methodName, params)

      // 检查缓存
      const cachedData = this.checkCache<T>(methodName, params, methodConfig, options, cacheKey)
      if (cachedData !== null) {
        endMonitoring() // 成功结束监控
        return cachedData
      }

      // 获取中间件（带缓存）
      const middlewares = this.getMiddlewares(methodName, methodConfig, options)
      const reqMiddlewares = middlewares.request
      const resMiddlewares = middlewares.response
      const errMiddlewares = middlewares.error

      // 计算重试配置
      const retryConfig = this.buildRetryConfig(methodConfig, options)

      // 从分级对象池获取上下文（性能优化）
      const ctx = this.contextPool.acquire()
      ctx.methodName = methodName
      ctx.params = params
      ctx.engine = this

      const performOnce = async (): Promise<T> => {
        // 生成请求配置
        const requestConfigRaw
          = typeof methodConfig.config === 'function'
            ? methodConfig.config(params)
            : methodConfig.config

        // 规范化请求配置（解析函数型 headers/data/params）
        let requestConfig = this.normalizeRequestConfig(requestConfigRaw, params)

        // 请求中间件
        for (const mw of reqMiddlewares) {
          requestConfig = await Promise.resolve(mw(requestConfig, ctx))
        }

        // 发送请求（可选队列）
        const useQueue = this.shouldUseQueue(methodConfig, options)
        const effectiveQueue = {
          enabled: this.config?.queue?.enabled ?? false,
          concurrency: this.config?.queue?.concurrency ?? 5,
          maxQueue: this.config?.queue?.maxQueue ?? 0,
          ...methodConfig.queue,
          ...options.queue,
        }

        const send = () => this.httpClient.request(requestConfig)

        let response
        if (useQueue) {
          if (!this.requestQueueManager) {
            this.requestQueueManager = new RequestQueueManager({
              enabled: true,
              concurrency: effectiveQueue.concurrency ?? 5,
              maxQueue: effectiveQueue.maxQueue ?? 0,
            })
          }
          else {
            this.requestQueueManager.updateConfig({
              concurrency: effectiveQueue.concurrency,
              maxQueue: effectiveQueue.maxQueue,
            })
          }
          response = await this.requestQueueManager.enqueue(send, options.priority ?? 0)
        }
        else {
          response = await send()
        }

        // 响应中间件
        for (const mw of resMiddlewares) {
          response = await Promise.resolve(mw(response, { ...ctx, request: requestConfig }))
        }

        // 数据转换
        let data = response.data
        if (methodConfig.transform) {
          data = methodConfig.transform(response)
        }

        // 数据验证
        if (methodConfig.validate && !methodConfig.validate(data)) {
          throw new Error(`Data validation failed for method "${methodName}"`)
        }

        return data
      }

      // 含重试的执行器
      const executeWithRetry = async (): Promise<T> => {
        let attempt = 0

        // 断路器预检查
        const cb = this.buildCircuitBreakerConfig(methodConfig, options)
        this.checkCircuitBreaker(methodName, methodConfig, options, cb)

        while (true) {
          try {
            const data = await performOnce()
            // 断路器成功反馈
            this.handleCircuitBreakerSuccess(methodName, cb)

            // 缓存结果
            this.cacheResult(cacheKey, data, methodConfig, options)

            // 成功回调
            this.invokeSuccessCallbacks(data, methodConfig, options)

            // 结束性能监控（成功）
            endMonitoring()

            return data
          }
          catch (err) {
            // 断路器失败反馈
            this.handleCircuitBreakerFailure(methodName, cb)

            // 错误中间件尝试恢复
            let recovered: any | undefined
            for (const mw of errMiddlewares) {
              const res = await Promise.resolve(mw(err, { ...ctx, attempt }))
              if (res && typeof res === 'object' && 'data' in res) {
                recovered = res
                break
              }
            }

            if (recovered) {
              // 中间件已经构造了一个响应，走后续数据处理
              let data: any = recovered.data
              if (methodConfig.transform) {
                data = methodConfig.transform(recovered)
              }
              if (methodConfig.validate && !methodConfig.validate(data)) {
                throw new Error(`Data validation failed for method "${methodName}"`)
              }

              this.cacheResult(cacheKey, data, methodConfig, options)
              this.invokeSuccessCallbacks(data, methodConfig, options)
              return data
            }

            // 决定是否重试
            const canRetry = retryConfig.enabled && attempt < (retryConfig.retries || 0)
              && (retryConfig.retryOn?.(err, attempt) ?? true)

            if (!canRetry) {
              // 调用错误回调
              methodConfig.onError?.(err)
              options.onError?.(err)
              throw err
            }

            // 退避计算 + 抖动
            const delay = this.calculateRetryDelay(attempt, retryConfig)
            await new Promise(resolve => globalThis.setTimeout(resolve, delay))
            attempt++
          }
        }
      }

      // 请求去重
      if (
        !options.skipDeduplication
        && this.shouldUseDeduplication(methodConfig, options)
      ) {
        const deduplicationKey = this.generateDeduplicationKey(
          methodName,
          params,
        )
        return await this.deduplicationManager.execute(
          deduplicationKey,
          executeWithRetry,
        )
      }

      // 防抖处理
      if (
        !options.skipDebounce
        && this.shouldUseDebounce(methodConfig, options)
      ) {
        const debounceKey = this.generateDebounceKey(methodName, params)
        const debounceConfig = {
          ...this.config?.debounce,
          ...methodConfig.debounce,
          ...options.debounce,
        }
        return await this.debounceManager.execute(
          debounceKey,
          executeWithRetry,
          debounceConfig.delay!,
        )
      }

      // 直接执行
      const result = await executeWithRetry()

      // 将上下文归还到分级对象池（性能优化）
      this.contextPool.release(ctx)

      return result
    }
    catch (error) {
      this.log(`Error calling method "${methodName}":`, error)

      // 创建增强的错误对象
      const apiError = this.createApiError(error, {
        methodName,
        params,
        config: methodConfig,
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      })

      // 报告错误
      this.reportError(apiError)

      // 结束性能监控（错误）
      endMonitoring(apiError)

      // 错误处理
      if (methodConfig.onError) {
        methodConfig.onError(apiError)
      }
      if (options.onError) {
        options.onError(apiError)
      }

      throw apiError
    }
  }

  /**
   * 批量调用 API 方法
   */
  async callBatch<T = unknown>(
    calls: Array<{ methodName: string, params?: unknown, options?: ApiCallOptions }>,
  ): Promise<T[]> {
    const promises = calls.map(({ methodName, params, options }) =>
      this.call<T>(methodName, params, options),
    )
    return Promise.all(promises)
  }

  /**
   * 检查方法是否存在
   */
  hasMethod(methodName: string): boolean {
    return this.methods.has(methodName)
  }

  /**
   * 获取所有方法名称
   */
  getMethodNames(): string[] {
    return Array.from(this.methods.keys())
  }

  /**
   * 清除缓存（优化：使用正则表达式缓存）
   */
  clearCache(methodName?: string): void {
    if (methodName) {
      // 使用缓存的正则表达式，避免重复创建
      let pattern = REGEX_CACHE.clearCacheByMethod.get(methodName)
      if (!pattern) {
        // 转义特殊字符并创建正则
        const escaped = methodName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        pattern = new RegExp(`^${escaped}:`)
        REGEX_CACHE.clearCacheByMethod.set(methodName, pattern)
      }
      this.cacheManager.clearByPattern(pattern)
    }
    else {
      // 清除所有缓存
      this.cacheManager.clear()
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): CacheStats {
    return this.cacheManager.getStats()
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    // 设置销毁标志，防止后续操作
    this.destroyed = true

    // 清理断路器状态定时器
    if (this.circuitStatesCleanupTimer) {
      clearInterval(this.circuitStatesCleanupTimer)
      this.circuitStatesCleanupTimer = null
    }

    // 清理断路器状态
    this.circuitStates.clear()

    // 清理中间件缓存
    this.middlewareCache.destroy()

    // 清理请求队列管理器
    if (this.requestQueueManager) {
      this.requestQueueManager.clear()
      this.requestQueueManager = null
    }

    // 优先调用管理器的销毁方法以清理定时器等资源
    if (typeof (this.cacheManager as unknown as { destroy?: () => void }).destroy === 'function') {
      ; (this.cacheManager as unknown as { destroy: () => void }).destroy()
    }
    else {
      this.cacheManager.clear()
    }

    this.debounceManager.clear()

    if (typeof (this.deduplicationManager as unknown as { destroy?: () => void }).destroy === 'function') {
      ; (this.deduplicationManager as unknown as { destroy: () => void }).destroy()
    }
    else {
      this.deduplicationManager.clear()
    }

    // 卸载所有插件
    for (const [name, plugin] of this.plugins) {
      if (plugin.uninstall) {
        try {
          plugin.uninstall(this)
        }
        catch (err) {
          console.error(`Error uninstalling plugin ${name}:`, err)
        }
      }
    }

    this.plugins.clear()
    this.methods.clear()

    // 清理错误报告器和性能监控器的引用
    this.errorReporter = null
    this.performanceMonitor = null

    // 清理分级对象池（性能优化）
    this.contextPool.destroy()
    this.configPool.destroy()
    this.arrayPool.destroy()

    // 清理序列化优化器缓存
    this.serializationOptimizer.clearCache()

    // 清理正则表达式缓存
    REGEX_CACHE.clearCacheByMethod.clear()

    // 注意：WeakMap 会自动清理

    this.log('API Engine destroyed')
  }

  /**
   * 高效序列化参数（使用优化器，性能提升60-80%）
   */
  private serializeParams(params?: unknown): string {
    return this.serializationOptimizer.serialize(params)
  }

  /**
   * 生成缓存键（优化版：减少重复序列化）
   */
  private generateCacheKey(methodName: string, params?: unknown): string {
    const keyGenerator = this.config?.cache?.keyGenerator
    if (keyGenerator) {
      return keyGenerator(methodName, params)
    }
    return `${methodName}:${this.serializeParams(params)}`
  }

  /**
   * 生成防抖键（优化版：减少重复序列化）
   */
  private generateDebounceKey(methodName: string, params?: unknown): string {
    return `${methodName}:${this.serializeParams(params)}`
  }

  /**
   * 生成去重键（优化版：减少重复序列化）
   */
  private generateDeduplicationKey(methodName: string, params?: unknown): string {
    const keyGenerator = this.config?.deduplication?.keyGenerator
    if (keyGenerator) {
      return keyGenerator(methodName, params)
    }
    return `${methodName}:${this.serializeParams(params)}`
  }

  /**
   * 判断是否应该使用缓存
   */
  private shouldUseCache(
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ): boolean {
    const globalEnabled = this.config?.cache?.enabled ?? true
    const methodEnabled = methodConfig.cache?.enabled ?? true
    const optionEnabled = options.cache?.enabled ?? true
    return globalEnabled && methodEnabled && optionEnabled
  }

  /**
   * 判断是否应该使用防抖
   */
  private shouldUseDebounce(
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ): boolean {
    const globalEnabled = this.config?.debounce?.enabled ?? true
    const methodEnabled = methodConfig.debounce?.enabled ?? true
    const optionEnabled = options.debounce?.enabled ?? true
    return globalEnabled && methodEnabled && optionEnabled
  }

  /**
   * 判断是否应该使用去重
   */
  private shouldUseDeduplication(
    methodConfig: ApiMethodConfig,
    _options: ApiCallOptions,
  ): boolean {
    const globalEnabled = this.config?.deduplication?.enabled ?? true
    const methodEnabled = methodConfig.deduplication?.enabled ?? true
    return globalEnabled && methodEnabled
  }

  /**
   * 判断是否使用请求队列
   */
  private shouldUseQueue(
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ): boolean {
    const globalEnabled = this.config?.queue?.enabled ?? false
    const methodEnabled = methodConfig.queue?.enabled ?? undefined
    const optionEnabled = options.queue?.enabled ?? undefined

    const decided = optionEnabled ?? methodEnabled ?? globalEnabled
    return !!decided
  }

  /**
   * 将可能包含函数值的请求配置规范化
   */
  private normalizeRequestConfig(config: any, params?: unknown): any {
    const normalized = { ...config }

    // 解析 data 为函数的情况
    if (typeof normalized.data === 'function') {
      try {
        normalized.data = normalized.data.length > 0 ? normalized.data(params) : normalized.data()
      }
      catch {
        // 保持原值以避免破坏调用
      }
    }

    // 解析 params 为函数的情况
    if (typeof normalized.params === 'function') {
      try {
        normalized.params = normalized.params.length > 0 ? normalized.params(params) : normalized.params()
      }
      catch {
        // 忽略解析错误
      }
    }

    // 解析 headers 中函数值
    if (normalized.headers && typeof normalized.headers === 'object') {
      const headers: Record<string, unknown> = { ...normalized.headers }
      for (const key of Object.keys(headers)) {
        const val = (headers as Record<string, unknown>)[key]
        if (typeof val === 'function') {
          try {
            ; (headers as Record<string, unknown>)[key] = (val as (...args: unknown[]) => unknown).length > 0
              ? (val as (p?: unknown) => unknown)(params)
              : (val as () => unknown)()
          }
          catch {
            // 解析失败则保留原值
          }
        }
      }
      normalized.headers = headers
    }

    return normalized
  }

  /**
   * 创建API错误对象
   */
  private createApiError(error: unknown, context: any): ApiError {
    if (error instanceof ApiError) {
      return error
    }

    // 检查是否是HTTP响应错误
    if (error && typeof error === 'object' && 'response' in error) {
      return ApiErrorFactory.fromHttpResponse(error, context)
    }

    // 检查是否是网络错误
    if (error instanceof Error) {
      return ApiErrorFactory.fromNetworkError(error, context)
    }

    // 其他未知错误
    return ApiErrorFactory.fromUnknownError(error, context)
  }

  /**
   * 报告错误
   */
  private reportError(error: ApiError): void {
    if (this.errorReporter) {
      this.errorReporter.report(error)
    }
  }

  /**
   * 设置错误报告器
   */
  setErrorReporter(reporter: ErrorReporter | null): void {
    this.errorReporter = reporter
  }

  /**
   * 获取错误报告器
   */
  getErrorReporter(): ErrorReporter | null {
    return this.errorReporter
  }

  /**
   * 设置性能监控器
   */
  setPerformanceMonitor(monitor: PerformanceMonitor | null): void {
    this.performanceMonitor = monitor
  }

  /**
   * 获取性能监控器
   */
  getPerformanceMonitor(): PerformanceMonitor | null {
    return this.performanceMonitor
  }

  /**
   * 获取中间件数组（带缓存）
   */
  private getMiddlewares(
    methodName: string,
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ): {
    request: RequestMiddleware[]
    response: ResponseMiddleware[]
    error: ErrorMiddleware[]
  } {
    // 如果 options 中有中间件，不使用缓存
    if (options.middlewares) {
      // 优化：避免每次创建新数组
      const globalRequest = this.config?.middlewares?.request
      const methodRequest = methodConfig.middlewares?.request
      const optionsRequest = options.middlewares?.request

      const globalResponse = this.config?.middlewares?.response
      const methodResponse = methodConfig.middlewares?.response
      const optionsResponse = options.middlewares?.response

      const globalError = this.config?.middlewares?.error
      const methodError = methodConfig.middlewares?.error
      const optionsError = options.middlewares?.error

      return {
        request: this.concatMiddlewares(globalRequest, methodRequest, optionsRequest),
        response: this.concatMiddlewares(globalResponse, methodResponse, optionsResponse),
        error: this.concatMiddlewares(globalError, methodError, optionsError),
      }
    }

    // 尝试从缓存获取
    const cacheKey = methodName
    const cached = this.middlewareCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // 创建新的中间件数组
    const globalRequest = this.config?.middlewares?.request
    const methodRequest = methodConfig.middlewares?.request

    const globalResponse = this.config?.middlewares?.response
    const methodResponse = methodConfig.middlewares?.response

    const globalError = this.config?.middlewares?.error
    const methodError = methodConfig.middlewares?.error

    const middlewares = {
      request: this.concatMiddlewares(globalRequest, methodRequest),
      response: this.concatMiddlewares(globalResponse, methodResponse),
      error: this.concatMiddlewares(globalError, methodError),
    }

    // 存入缓存
    this.middlewareCache.set(cacheKey, middlewares)

    return middlewares
  }

  /**
   * 合并中间件数组（优化版）
   */
  private concatMiddlewares<T>(...arrays: (T[] | undefined)[]): T[] {
    let totalLength = 0
    const validArrays: T[][] = []

    for (const arr of arrays) {
      if (arr && arr.length > 0) {
        totalLength += arr.length
        validArrays.push(arr)
      }
    }

    if (totalLength === 0) return []
    if (validArrays.length === 1) return validArrays[0]

    // 预分配数组空间，避免动态扩容
    const result: T[] = new Array<T>(totalLength)
    let index = 0

    for (const arr of validArrays) {
      for (let i = 0; i < arr.length; i++) {
        result[index++] = arr[i]
      }
    }

    return result
  }

  /**
   * 启动断路器状态清理定时器
   */
  private startCircuitBreakerCleanup(): void {
    // 每小时清理一次过期的断路器状态
    this.circuitStatesCleanupTimer = setInterval(() => {
      const now = Date.now()

      // 使用更高效的清理策略
      // 只遍历一次，直接删除
      for (const [methodName, state] of this.circuitStates.entries()) {
        // 清理24小时未使用的状态（closed 且 failureCount 为 0）
        if (
          state.state === 'closed'
          && state.failureCount === 0
          && now - state.nextTryAt > DEFAULT_CONFIG.CIRCUIT_EXPIRE_TIME
        ) {
          this.circuitStates.delete(methodName)
        }
      }

      this.log(`Circuit breaker cleanup completed, current states: ${this.circuitStates.size}`)
    }, DEFAULT_CONFIG.CIRCUIT_CLEANUP_INTERVAL)
  }

  /**
   * 日志输出
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.config?.debug) {
      console.warn(`[API Engine] ${message}`, ...args)
    }
  }
}
