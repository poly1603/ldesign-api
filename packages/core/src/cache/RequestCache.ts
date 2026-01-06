/**
 * 请求缓存
 *
 * 专门用于 API 请求结果的缓存
 */

import { LRUCache, type LRUCacheOptions } from './LRUCache'
import { generateRequestKey, type RequestKeyConfig, type RequestKeyOptions } from '../utils/hash'

/**
 * 请求缓存选项
 */
export interface RequestCacheOptions extends LRUCacheOptions {
  /** 请求键生成选项 */
  keyOptions?: RequestKeyOptions
  /** 是否缓存错误响应，默认 false */
  cacheErrors?: boolean
  /** 错误缓存 TTL（毫秒），默认 30 秒 */
  errorTTL?: number
  /** 哪些 HTTP 状态码应该被缓存 */
  cacheableStatuses?: number[]
  /** 哪些 HTTP 方法应该被缓存，默认 ['GET'] */
  cacheableMethods?: string[]
}

/**
 * 缓存的响应
 */
export interface CachedResponse<T = unknown> {
  /** 响应数据 */
  data: T
  /** HTTP 状态码 */
  status: number
  /** 响应头 */
  headers?: Record<string, string>
  /** 是否为错误响应 */
  isError: boolean
  /** 缓存时间戳 */
  cachedAt: number
}

/**
 * 请求缓存类
 *
 * @example
 * ```typescript
 * const cache = new RequestCache({
 *   maxSize: 200,
 *   defaultTTL: 5 * 60 * 1000, // 5 分钟
 *   cacheableMethods: ['GET', 'HEAD']
 * })
 *
 * // 检查是否应该缓存
 * if (cache.shouldCache({ method: 'GET', url: '/api/users' })) {
 *   // 尝试获取缓存
 *   const cached = cache.get({ method: 'GET', url: '/api/users' })
 *
 *   if (cached) {
 *     return cached.data
 *   }
 *
 *   // 发起请求并缓存
 *   const response = await fetch('/api/users')
 *   cache.set(
 *     { method: 'GET', url: '/api/users' },
 *     { data: response.data, status: 200, isError: false }
 *   )
 * }
 * ```
 */
export class RequestCache<T = unknown> {
  private readonly cache: LRUCache<CachedResponse<T>>
  private readonly keyOptions: RequestKeyOptions
  private readonly cacheErrors: boolean
  private readonly errorTTL: number
  private readonly cacheableStatuses: Set<number>
  private readonly cacheableMethods: Set<string>
  private readonly defaultTTL: number

  constructor(options: RequestCacheOptions = {}) {
    this.cache = new LRUCache<CachedResponse<T>>(options)
    this.keyOptions = options.keyOptions ?? {}
    this.cacheErrors = options.cacheErrors ?? false
    this.errorTTL = options.errorTTL ?? 30 * 1000 // 30 秒
    this.defaultTTL = options.defaultTTL ?? 5 * 60 * 1000 // 5 分钟

    // 可缓存的状态码
    this.cacheableStatuses = new Set(
      options.cacheableStatuses ?? [200, 201, 204, 301, 302, 304]
    )

    // 可缓存的方法
    this.cacheableMethods = new Set(
      (options.cacheableMethods ?? ['GET']).map(m => m.toUpperCase())
    )
  }

  /**
   * 检查请求是否应该被缓存
   *
   * @param config - 请求配置
   * @returns 是否应该缓存
   */
  shouldCache(config: RequestKeyConfig): boolean {
    const method = (config.method ?? 'GET').toUpperCase()
    return this.cacheableMethods.has(method)
  }

  /**
   * 生成缓存键
   *
   * @param config - 请求配置
   * @returns 缓存键
   */
  generateKey(config: RequestKeyConfig): string {
    return generateRequestKey(config, this.keyOptions)
  }

  /**
   * 获取缓存的响应
   *
   * @param config - 请求配置
   * @returns 缓存的响应或 undefined
   */
  get(config: RequestKeyConfig): CachedResponse<T> | undefined {
    const key = this.generateKey(config)
    return this.cache.get(key)
  }

  /**
   * 通过键直接获取缓存
   *
   * @param key - 缓存键
   * @returns 缓存的响应或 undefined
   */
  getByKey(key: string): CachedResponse<T> | undefined {
    return this.cache.get(key)
  }

  /**
   * 设置缓存
   *
   * @param config - 请求配置
   * @param response - 响应数据
   * @param ttl - TTL（毫秒），可选
   */
  set(
    config: RequestKeyConfig,
    response: Omit<CachedResponse<T>, 'cachedAt'>,
    ttl?: number
  ): void {
    // 检查是否应该缓存此响应
    if (!this.shouldCacheResponse(response)) {
      return
    }

    const key = this.generateKey(config)
    const actualTTL = response.isError ? this.errorTTL : (ttl ?? this.defaultTTL)

    this.cache.set(
      key,
      {
        ...response,
        cachedAt: Date.now(),
      },
      actualTTL
    )
  }

  /**
   * 通过键直接设置缓存
   *
   * @param key - 缓存键
   * @param response - 响应数据
   * @param ttl - TTL（毫秒），可选
   */
  setByKey(
    key: string,
    response: Omit<CachedResponse<T>, 'cachedAt'>,
    ttl?: number
  ): void {
    if (!this.shouldCacheResponse(response)) {
      return
    }

    const actualTTL = response.isError ? this.errorTTL : (ttl ?? this.defaultTTL)

    this.cache.set(
      key,
      {
        ...response,
        cachedAt: Date.now(),
      },
      actualTTL
    )
  }

  /**
   * 检查缓存是否存在
   *
   * @param config - 请求配置
   * @returns 是否存在
   */
  has(config: RequestKeyConfig): boolean {
    const key = this.generateKey(config)
    return this.cache.has(key)
  }

  /**
   * 删除缓存
   *
   * @param config - 请求配置
   * @returns 是否删除成功
   */
  delete(config: RequestKeyConfig): boolean {
    const key = this.generateKey(config)
    return this.cache.delete(key)
  }

  /**
   * 删除匹配的缓存
   *
   * @param predicate - 匹配函数
   * @returns 删除的条目数
   */
  deleteMatching(predicate: (key: string) => boolean): number {
    const keys = this.cache.keys()
    let deleted = 0

    for (const key of keys) {
      if (predicate(key)) {
        this.cache.delete(key)
        deleted++
      }
    }

    return deleted
  }

  /**
   * 删除特定 URL 前缀的所有缓存
   *
   * @param urlPrefix - URL 前缀
   * @returns 删除的条目数
   */
  invalidateByUrl(urlPrefix: string): number {
    return this.deleteMatching(key => key.includes(urlPrefix))
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return this.cache.getStats()
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    this.cache.destroy()
  }

  /**
   * 检查响应是否应该被缓存
   */
  private shouldCacheResponse(response: { isError: boolean; status: number }): boolean {
    // 错误响应
    if (response.isError) {
      return this.cacheErrors
    }

    // 检查状态码
    return this.cacheableStatuses.has(response.status)
  }
}
