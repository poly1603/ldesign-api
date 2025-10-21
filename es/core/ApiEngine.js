/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import '../http/es/index.js';
import { ApiError, ApiErrorFactory } from '../utils/ApiError.js';
import { CacheManager } from '../utils/CacheManager.js';
import { DebounceManagerImpl } from '../utils/DebounceManager.js';
import { DeduplicationManagerImpl } from '../utils/DeduplicationManager.js';
import { getGlobalErrorReporter } from '../utils/ErrorReporter.js';
import { LRUCache } from '../utils/LRUCache.js';
import { getGlobalPerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { RequestQueueManager } from '../utils/RequestQueue.js';
import { version } from '../version.js';
import { createHttpClient as r } from '../http/es/factory.js';

const DEFAULT_CONFIG = {
  HTTP_TIMEOUT: 1e4,
  CACHE_TTL: 3e5,
  // 5分钟
  CACHE_MAX_SIZE: 100,
  DEBOUNCE_DELAY: 300,
  DEFAULT_CONCURRENCY: 5,
  CIRCUIT_CLEANUP_INTERVAL: 36e5,
  // 1小时
  CIRCUIT_EXPIRE_TIME: 864e5
  // 24小时 (24 * 60 * 60 * 1000)
};
const DEFAULT_FAILURE_THRESHOLD = 5;
const DEFAULT_HALF_OPEN_AFTER = 3e4;
const DEFAULT_SUCCESS_THRESHOLD = 1;
class ApiEngineImpl {
  constructor(config = {}) {
    this.plugins = /* @__PURE__ */ new Map();
    this.methods = /* @__PURE__ */ new Map();
    this.requestQueueManager = null;
    this.destroyed = false;
    this.circuitStates = /* @__PURE__ */ new Map();
    this.objectPool = {
      contexts: [],
      configs: [],
      cacheKeys: [],
      // 缓存键字符串池
      arrays: [],
      // 通用数组池
      maxContexts: 200,
      // 上下文池最大容量
      maxConfigs: 200,
      // 配置池最大容量
      maxCacheKeys: 500,
      // 缓存键池最大容量
      maxArrays: 100
      // 数组池最大容量
    };
    this.errorReporter = null;
    this.performanceMonitor = null;
    this.circuitStatesCleanupTimer = null;
    this.paramsStringCache = /* @__PURE__ */ new WeakMap();
    this.config = {
      appName: "LDesign API",
      version: version,
      debug: false,
      ...config,
      http: {
        timeout: DEFAULT_CONFIG.HTTP_TIMEOUT,
        ...config.http || {}
      },
      cache: {
        enabled: true,
        ttl: DEFAULT_CONFIG.CACHE_TTL,
        maxSize: DEFAULT_CONFIG.CACHE_MAX_SIZE,
        storage: "memory",
        ...config.cache || {}
      },
      debounce: {
        enabled: true,
        delay: DEFAULT_CONFIG.DEBOUNCE_DELAY,
        ...config.debounce || {}
      },
      deduplication: {
        enabled: true,
        ...config.deduplication || {}
      }
    };
    this.httpClient = r(this.config.http);
    this.cacheManager = new CacheManager(this.config.cache);
    this.debounceManager = new DebounceManagerImpl();
    this.deduplicationManager = new DeduplicationManagerImpl();
    this.middlewareCache = new LRUCache({
      maxSize: 100,
      defaultTTL: 36e5,
      // 1小时
      enabled: true
    });
    if (this.config?.queue?.enabled) {
      const q = {
        enabled: true,
        concurrency: this.config?.queue.concurrency ?? DEFAULT_CONFIG.DEFAULT_CONCURRENCY,
        maxQueue: this.config?.queue.maxQueue ?? 0
      };
      this.requestQueueManager = new RequestQueueManager(q);
    }
    this.errorReporter = getGlobalErrorReporter();
    this.performanceMonitor = getGlobalPerformanceMonitor();
    this.startCircuitBreakerCleanup();
    this.log("API Engine initialized", this.config);
  }
  /**
   * 注册插件
   */
  async use(plugin) {
    if (this.destroyed) {
      throw new Error("API Engine has been destroyed");
    }
    if (this.plugins.has(plugin.name)) {
      this.log(`Plugin "${plugin.name}" already registered, skipping`);
      return;
    }
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin "${plugin.name}" depends on "${dep}", but it's not registered`);
        }
      }
    }
    if (plugin.apis) {
      for (const [methodName, methodConfig] of Object.entries(plugin.apis)) {
        this.register(methodName, methodConfig);
      }
    }
    if (plugin.install) {
      await plugin.install(this);
    }
    this.plugins.set(plugin.name, plugin);
    this.log(`Plugin "${plugin.name}" registered successfully`);
  }
  /**
   * 卸载插件
   */
  async unuse(pluginName) {
    if (this.destroyed) {
      throw new Error("API Engine has been destroyed");
    }
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      this.log(`Plugin "${pluginName}" not found, skipping`);
      return;
    }
    for (const [name, p] of this.plugins) {
      if (name !== pluginName && p.dependencies?.includes(pluginName)) {
        throw new Error(`Cannot uninstall plugin "${pluginName}" because "${name}" depends on it`);
      }
    }
    if (plugin.apis) {
      for (const methodName of Object.keys(plugin.apis)) {
        this.unregister(methodName);
      }
    }
    if (plugin.uninstall) {
      await plugin.uninstall(this);
    }
    this.plugins.delete(pluginName);
    this.log(`Plugin "${pluginName}" uninstalled successfully`);
  }
  /**
   * 注册 API 方法
   */
  register(methodName, config) {
    if (this.destroyed) {
      throw new Error("API Engine has been destroyed");
    }
    if (this.methods.has(methodName)) {
      this.log(`Method "${methodName}" already registered, overriding`);
    }
    this.methods.set(methodName, config);
    this.log(`Method "${methodName}" registered successfully`);
  }
  /**
   * 注册多个 API 方法
   */
  registerBatch(methods) {
    for (const [methodName, config] of Object.entries(methods)) {
      this.register(methodName, config);
    }
  }
  /**
   * 取消注册 API 方法
   */
  unregister(methodName) {
    if (this.destroyed) {
      throw new Error("API Engine has been destroyed");
    }
    if (this.methods.has(methodName)) {
      this.methods.delete(methodName);
      this.log(`Method "${methodName}" unregistered successfully`);
    }
  }
  /**
   * 检查缓存并返回缓存数据（如果存在）
   */
  checkCache(methodName, params, methodConfig, options, cacheKey) {
    if (!options.skipCache && this.shouldUseCache(methodConfig, options)) {
      const cachedData = this.cacheManager.get(cacheKey);
      if (cachedData !== null) {
        this.log(`Cache hit for method "${methodName}"`);
        return cachedData;
      }
    }
    return null;
  }
  /**
   * 构建重试配置
   */
  buildRetryConfig(methodConfig, options) {
    return {
      enabled: false,
      retries: 0,
      delay: 0,
      backoff: "fixed",
      maxDelay: void 0,
      retryOn: (_error, _attempt) => true,
      ...this.config?.retry,
      ...methodConfig.retry,
      ...options.retry
    };
  }
  /**
   * 构建断路器配置
   */
  buildCircuitBreakerConfig(methodConfig, options) {
    return {
      enabled: this.config?.retry?.circuitBreaker?.enabled || methodConfig.retry?.circuitBreaker?.enabled || options.retry?.circuitBreaker?.enabled || false,
      failureThreshold: options.retry?.circuitBreaker?.failureThreshold ?? methodConfig.retry?.circuitBreaker?.failureThreshold ?? this.config?.retry?.circuitBreaker?.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD,
      halfOpenAfter: options.retry?.circuitBreaker?.halfOpenAfter ?? methodConfig.retry?.circuitBreaker?.halfOpenAfter ?? this.config?.retry?.circuitBreaker?.halfOpenAfter ?? DEFAULT_HALF_OPEN_AFTER,
      successThreshold: options.retry?.circuitBreaker?.successThreshold ?? methodConfig.retry?.circuitBreaker?.successThreshold ?? this.config?.retry?.circuitBreaker?.successThreshold ?? DEFAULT_SUCCESS_THRESHOLD
    };
  }
  /**
   * 检查断路器状态并抛出错误（如果需要）
   */
  checkCircuitBreaker(methodName, methodConfig, options, cb) {
    if (!cb.enabled) {
      return;
    }
    const st = this.circuitStates.get(methodName);
    const now = Date.now();
    if (st?.state === "open" && now < st.nextTryAt) {
      const err = new Error(`Circuit breaker open for method "${methodName}"`);
      methodConfig.onError?.(err);
      options.onError?.(err);
      throw err;
    }
    if (st?.state === "open" && now >= st.nextTryAt) {
      this.circuitStates.set(methodName, {
        state: "half-open",
        failureCount: st.failureCount,
        successCount: 0,
        nextTryAt: now + cb.halfOpenAfter
      });
    }
  }
  /**
   * 处理断路器成功反馈
   */
  handleCircuitBreakerSuccess(methodName, cb) {
    if (!cb.enabled) {
      return;
    }
    const st = this.circuitStates.get(methodName);
    if (st?.state === "half-open") {
      const successCount = (st.successCount ?? 0) + 1;
      if (successCount >= cb.successThreshold) {
        this.circuitStates.set(methodName, {
          state: "closed",
          failureCount: 0,
          successCount: 0,
          nextTryAt: 0
        });
      } else {
        this.circuitStates.set(methodName, { ...st, successCount });
      }
    } else if (!st || st.state !== "closed") {
      this.circuitStates.set(methodName, {
        state: "closed",
        failureCount: 0,
        successCount: 0,
        nextTryAt: 0
      });
    }
  }
  /**
   * 处理断路器失败反馈
   */
  handleCircuitBreakerFailure(methodName, cb) {
    if (!cb.enabled) {
      return;
    }
    const st = this.circuitStates.get(methodName) ?? {
      state: "closed",
      failureCount: 0,
      successCount: 0,
      nextTryAt: 0
    };
    const failureCount = st.failureCount + 1;
    if (st.state === "half-open") {
      this.circuitStates.set(methodName, {
        state: "open",
        failureCount,
        successCount: 0,
        nextTryAt: Date.now() + cb.halfOpenAfter
      });
    } else if (failureCount >= cb.failureThreshold) {
      this.circuitStates.set(methodName, {
        state: "open",
        failureCount,
        successCount: 0,
        nextTryAt: Date.now() + cb.halfOpenAfter
      });
    } else {
      this.circuitStates.set(methodName, { ...st, failureCount });
    }
  }
  /**
   * 缓存成功结果
   */
  cacheResult(cacheKey, data, methodConfig, options) {
    if (!options.skipCache && this.shouldUseCache(methodConfig, options)) {
      const cacheConfig = {
        ...this.config?.cache,
        ...methodConfig.cache,
        ...options.cache
      };
      this.cacheManager.set(cacheKey, data, cacheConfig.ttl);
    }
  }
  /**
   * 调用成功回调
   */
  invokeSuccessCallbacks(data, methodConfig, options) {
    methodConfig.onSuccess?.(data);
    options.onSuccess?.(data);
  }
  /**
   * 计算重试延迟（包括错动）
   */
  calculateRetryDelay(attempt, retryConfig) {
    const baseDelay = retryConfig.delay || 0;
    let delay = baseDelay;
    if (retryConfig.backoff === "exponential") {
      delay = baseDelay * 2 ** attempt;
      if (retryConfig.maxDelay) {
        delay = Math.min(delay, retryConfig.maxDelay);
      }
    }
    const jitter = retryConfig.jitter ?? this.config?.retry?.jitter ?? 0;
    if (typeof jitter === "number" && jitter > 0) {
      const delta = delay * jitter;
      const min = Math.max(0, delay - delta);
      const max = delay + delta;
      delay = Math.floor(min + Math.random() * (max - min));
    }
    return delay;
  }
  /**
   * 调用 API 方法
   */
  async call(methodName, params, options = {}) {
    if (this.destroyed) {
      throw new Error("API Engine has been destroyed");
    }
    const methodConfig = this.methods.get(methodName);
    if (!methodConfig) {
      throw new Error(`Method "${methodName}" not found`);
    }
    const endMonitoring = this.performanceMonitor?.startCall(methodName, params) || (() => {
    });
    try {
      const cacheKey = this.generateCacheKey(methodName, params);
      const cachedData = this.checkCache(methodName, params, methodConfig, options, cacheKey);
      if (cachedData !== null) {
        endMonitoring();
        return cachedData;
      }
      const middlewares = this.getMiddlewares(methodName, methodConfig, options);
      const reqMiddlewares = middlewares.request;
      const resMiddlewares = middlewares.response;
      const errMiddlewares = middlewares.error;
      const retryConfig = this.buildRetryConfig(methodConfig, options);
      const ctx = this.objectPool.contexts.pop() || {};
      ctx.methodName = methodName;
      ctx.params = params;
      ctx.engine = this;
      const performOnce = async () => {
        const requestConfigRaw = typeof methodConfig.config === "function" ? methodConfig.config(params) : methodConfig.config;
        let requestConfig = this.normalizeRequestConfig(requestConfigRaw, params);
        for (const mw of reqMiddlewares) {
          requestConfig = await Promise.resolve(mw(requestConfig, ctx));
        }
        const useQueue = this.shouldUseQueue(methodConfig, options);
        const effectiveQueue = {
          enabled: this.config?.queue?.enabled ?? false,
          concurrency: this.config?.queue?.concurrency ?? 5,
          maxQueue: this.config?.queue?.maxQueue ?? 0,
          ...methodConfig.queue,
          ...options.queue
        };
        const send = () => this.httpClient.request(requestConfig);
        let response;
        if (useQueue) {
          if (!this.requestQueueManager) {
            this.requestQueueManager = new RequestQueueManager({
              enabled: true,
              concurrency: effectiveQueue.concurrency ?? 5,
              maxQueue: effectiveQueue.maxQueue ?? 0
            });
          } else {
            this.requestQueueManager.updateConfig({
              concurrency: effectiveQueue.concurrency,
              maxQueue: effectiveQueue.maxQueue
            });
          }
          response = await this.requestQueueManager.enqueue(send, options.priority ?? 0);
        } else {
          response = await send();
        }
        for (const mw of resMiddlewares) {
          response = await Promise.resolve(mw(response, { ...ctx, request: requestConfig }));
        }
        let data = response.data;
        if (methodConfig.transform) {
          data = methodConfig.transform(response);
        }
        if (methodConfig.validate && !methodConfig.validate(data)) {
          throw new Error(`Data validation failed for method "${methodName}"`);
        }
        return data;
      };
      const executeWithRetry = async () => {
        let attempt = 0;
        const cb = this.buildCircuitBreakerConfig(methodConfig, options);
        this.checkCircuitBreaker(methodName, methodConfig, options, cb);
        while (true) {
          try {
            const data = await performOnce();
            this.handleCircuitBreakerSuccess(methodName, cb);
            this.cacheResult(cacheKey, data, methodConfig, options);
            this.invokeSuccessCallbacks(data, methodConfig, options);
            endMonitoring();
            return data;
          } catch (err) {
            this.handleCircuitBreakerFailure(methodName, cb);
            let recovered;
            for (const mw of errMiddlewares) {
              const res = await Promise.resolve(mw(err, { ...ctx, attempt }));
              if (res && typeof res === "object" && "data" in res) {
                recovered = res;
                break;
              }
            }
            if (recovered) {
              let data = recovered.data;
              if (methodConfig.transform) {
                data = methodConfig.transform(recovered);
              }
              if (methodConfig.validate && !methodConfig.validate(data)) {
                throw new Error(`Data validation failed for method "${methodName}"`);
              }
              this.cacheResult(cacheKey, data, methodConfig, options);
              this.invokeSuccessCallbacks(data, methodConfig, options);
              return data;
            }
            const canRetry = retryConfig.enabled && attempt < (retryConfig.retries || 0) && (retryConfig.retryOn?.(err, attempt) ?? true);
            if (!canRetry) {
              methodConfig.onError?.(err);
              options.onError?.(err);
              throw err;
            }
            const delay = this.calculateRetryDelay(attempt, retryConfig);
            await new Promise((resolve) => globalThis.setTimeout(resolve, delay));
            attempt++;
          }
        }
      };
      if (!options.skipDeduplication && this.shouldUseDeduplication(methodConfig, options)) {
        const deduplicationKey = this.generateDeduplicationKey(methodName, params);
        return await this.deduplicationManager.execute(deduplicationKey, executeWithRetry);
      }
      if (!options.skipDebounce && this.shouldUseDebounce(methodConfig, options)) {
        const debounceKey = this.generateDebounceKey(methodName, params);
        const debounceConfig = {
          ...this.config?.debounce,
          ...methodConfig.debounce,
          ...options.debounce
        };
        return await this.debounceManager.execute(debounceKey, executeWithRetry, debounceConfig.delay);
      }
      const result = await executeWithRetry();
      if (this.objectPool.contexts.length < this.objectPool.maxContexts) {
        ctx.methodName = "";
        ctx.params = null;
        this.objectPool.contexts.push(ctx);
      }
      return result;
    } catch (error) {
      this.log(`Error calling method "${methodName}":`, error);
      const apiError = this.createApiError(error, {
        methodName,
        params,
        config: methodConfig,
        timestamp: Date.now(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Node.js"
      });
      this.reportError(apiError);
      endMonitoring(apiError);
      if (methodConfig.onError) {
        methodConfig.onError(apiError);
      }
      if (options.onError) {
        options.onError(apiError);
      }
      throw apiError;
    }
  }
  /**
   * 批量调用 API 方法
   */
  async callBatch(calls) {
    const promises = calls.map(({ methodName, params, options }) => this.call(methodName, params, options));
    return Promise.all(promises);
  }
  /**
   * 检查方法是否存在
   */
  hasMethod(methodName) {
    return this.methods.has(methodName);
  }
  /**
   * 获取所有方法名称
   */
  getMethodNames() {
    return Array.from(this.methods.keys());
  }
  /**
   * 清除缓存
   */
  clearCache(methodName) {
    if (methodName) {
      const pattern = new RegExp(`^${methodName}:`);
      this.cacheManager.clearByPattern(pattern);
    } else {
      this.cacheManager.clear();
    }
  }
  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return this.cacheManager.getStats();
  }
  /**
   * 销毁引擎
   */
  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    if (this.circuitStatesCleanupTimer) {
      clearInterval(this.circuitStatesCleanupTimer);
      this.circuitStatesCleanupTimer = null;
    }
    this.circuitStates.clear();
    this.middlewareCache.destroy();
    if (this.requestQueueManager) {
      this.requestQueueManager.clear();
      this.requestQueueManager = null;
    }
    if (typeof this.cacheManager.destroy === "function") {
      this.cacheManager.destroy();
    } else {
      this.cacheManager.clear();
    }
    this.debounceManager.clear();
    if (typeof this.deduplicationManager.destroy === "function") {
      this.deduplicationManager.destroy();
    } else {
      this.deduplicationManager.clear();
    }
    for (const [name, plugin] of this.plugins) {
      if (plugin.uninstall) {
        try {
          plugin.uninstall(this);
        } catch (err) {
          console.error(`Error uninstalling plugin ${name}:`, err);
        }
      }
    }
    this.plugins.clear();
    this.methods.clear();
    this.errorReporter = null;
    this.performanceMonitor = null;
    this.objectPool.contexts = [];
    this.objectPool.configs = [];
    this.objectPool.cacheKeys = [];
    this.objectPool.arrays = [];
    this.log("API Engine destroyed");
  }
  /**
   * 高效序列化参数（带缓存）
   */
  serializeParams(params) {
    if (!params)
      return "{}";
    if (typeof params !== "object" || params === null) {
      return String(params);
    }
    const cached = this.paramsStringCache.get(params);
    if (cached !== void 0)
      return cached;
    const serialized = JSON.stringify(params);
    this.paramsStringCache.set(params, serialized);
    return serialized;
  }
  /**
   * 生成缓存键（优化版：减少重复序列化）
   */
  generateCacheKey(methodName, params) {
    const keyGenerator = this.config?.cache?.keyGenerator;
    if (keyGenerator) {
      return keyGenerator(methodName, params);
    }
    return `${methodName}:${this.serializeParams(params)}`;
  }
  /**
   * 生成防抖键（优化版：减少重复序列化）
   */
  generateDebounceKey(methodName, params) {
    return `${methodName}:${this.serializeParams(params)}`;
  }
  /**
   * 生成去重键（优化版：减少重复序列化）
   */
  generateDeduplicationKey(methodName, params) {
    const keyGenerator = this.config?.deduplication?.keyGenerator;
    if (keyGenerator) {
      return keyGenerator(methodName, params);
    }
    return `${methodName}:${this.serializeParams(params)}`;
  }
  /**
   * 判断是否应该使用缓存
   */
  shouldUseCache(methodConfig, options) {
    const globalEnabled = this.config?.cache?.enabled ?? true;
    const methodEnabled = methodConfig.cache?.enabled ?? true;
    const optionEnabled = options.cache?.enabled ?? true;
    return globalEnabled && methodEnabled && optionEnabled;
  }
  /**
   * 判断是否应该使用防抖
   */
  shouldUseDebounce(methodConfig, options) {
    const globalEnabled = this.config?.debounce?.enabled ?? true;
    const methodEnabled = methodConfig.debounce?.enabled ?? true;
    const optionEnabled = options.debounce?.enabled ?? true;
    return globalEnabled && methodEnabled && optionEnabled;
  }
  /**
   * 判断是否应该使用去重
   */
  shouldUseDeduplication(methodConfig, _options) {
    const globalEnabled = this.config?.deduplication?.enabled ?? true;
    const methodEnabled = methodConfig.deduplication?.enabled ?? true;
    return globalEnabled && methodEnabled;
  }
  /**
   * 判断是否使用请求队列
   */
  shouldUseQueue(methodConfig, options) {
    const globalEnabled = this.config?.queue?.enabled ?? false;
    const methodEnabled = methodConfig.queue?.enabled ?? void 0;
    const optionEnabled = options.queue?.enabled ?? void 0;
    const decided = optionEnabled ?? methodEnabled ?? globalEnabled;
    return !!decided;
  }
  /**
   * 将可能包含函数值的请求配置规范化
   */
  normalizeRequestConfig(config, params) {
    const normalized = { ...config };
    if (typeof normalized.data === "function") {
      try {
        normalized.data = normalized.data.length > 0 ? normalized.data(params) : normalized.data();
      } catch {
      }
    }
    if (typeof normalized.params === "function") {
      try {
        normalized.params = normalized.params.length > 0 ? normalized.params(params) : normalized.params();
      } catch {
      }
    }
    if (normalized.headers && typeof normalized.headers === "object") {
      const headers = { ...normalized.headers };
      for (const key of Object.keys(headers)) {
        const val = headers[key];
        if (typeof val === "function") {
          try {
            ;
            headers[key] = val.length > 0 ? val(params) : val();
          } catch {
          }
        }
      }
      normalized.headers = headers;
    }
    return normalized;
  }
  /**
   * 创建API错误对象
   */
  createApiError(error, context) {
    if (error instanceof ApiError) {
      return error;
    }
    if (error && typeof error === "object" && "response" in error) {
      return ApiErrorFactory.fromHttpResponse(error, context);
    }
    if (error instanceof Error) {
      return ApiErrorFactory.fromNetworkError(error, context);
    }
    return ApiErrorFactory.fromUnknownError(error, context);
  }
  /**
   * 报告错误
   */
  reportError(error) {
    if (this.errorReporter) {
      this.errorReporter.report(error);
    }
  }
  /**
   * 设置错误报告器
   */
  setErrorReporter(reporter) {
    this.errorReporter = reporter;
  }
  /**
   * 获取错误报告器
   */
  getErrorReporter() {
    return this.errorReporter;
  }
  /**
   * 设置性能监控器
   */
  setPerformanceMonitor(monitor) {
    this.performanceMonitor = monitor;
  }
  /**
   * 获取性能监控器
   */
  getPerformanceMonitor() {
    return this.performanceMonitor;
  }
  /**
   * 获取中间件数组（带缓存）
   */
  getMiddlewares(methodName, methodConfig, options) {
    if (options.middlewares) {
      const globalRequest2 = this.config?.middlewares?.request;
      const methodRequest2 = methodConfig.middlewares?.request;
      const optionsRequest = options.middlewares?.request;
      const globalResponse2 = this.config?.middlewares?.response;
      const methodResponse2 = methodConfig.middlewares?.response;
      const optionsResponse = options.middlewares?.response;
      const globalError2 = this.config?.middlewares?.error;
      const methodError2 = methodConfig.middlewares?.error;
      const optionsError = options.middlewares?.error;
      return {
        request: this.concatMiddlewares(globalRequest2, methodRequest2, optionsRequest),
        response: this.concatMiddlewares(globalResponse2, methodResponse2, optionsResponse),
        error: this.concatMiddlewares(globalError2, methodError2, optionsError)
      };
    }
    const cacheKey = methodName;
    const cached = this.middlewareCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const globalRequest = this.config?.middlewares?.request;
    const methodRequest = methodConfig.middlewares?.request;
    const globalResponse = this.config?.middlewares?.response;
    const methodResponse = methodConfig.middlewares?.response;
    const globalError = this.config?.middlewares?.error;
    const methodError = methodConfig.middlewares?.error;
    const middlewares = {
      request: this.concatMiddlewares(globalRequest, methodRequest),
      response: this.concatMiddlewares(globalResponse, methodResponse),
      error: this.concatMiddlewares(globalError, methodError)
    };
    this.middlewareCache.set(cacheKey, middlewares);
    return middlewares;
  }
  /**
   * 合并中间件数组（优化版）
   */
  concatMiddlewares(...arrays) {
    let totalLength = 0;
    const validArrays = [];
    for (const arr of arrays) {
      if (arr && arr.length > 0) {
        totalLength += arr.length;
        validArrays.push(arr);
      }
    }
    if (totalLength === 0)
      return [];
    if (validArrays.length === 1)
      return validArrays[0];
    const result = new Array(totalLength);
    let index = 0;
    for (const arr of validArrays) {
      for (let i = 0; i < arr.length; i++) {
        result[index++] = arr[i];
      }
    }
    return result;
  }
  /**
   * 启动断路器状态清理定时器
   */
  startCircuitBreakerCleanup() {
    this.circuitStatesCleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [methodName, state] of this.circuitStates.entries()) {
        if (state.state === "closed" && state.failureCount === 0 && now - state.nextTryAt > DEFAULT_CONFIG.CIRCUIT_EXPIRE_TIME) {
          this.circuitStates.delete(methodName);
        }
      }
      this.log(`Circuit breaker cleanup completed, current states: ${this.circuitStates.size}`);
    }, DEFAULT_CONFIG.CIRCUIT_CLEANUP_INTERVAL);
  }
  /**
   * 日志输出
   */
  log(message, ...args) {
    if (this.config?.debug) {
      console.warn(`[API Engine] ${message}`, ...args);
    }
  }
}

export { ApiEngineImpl };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=ApiEngine.js.map
