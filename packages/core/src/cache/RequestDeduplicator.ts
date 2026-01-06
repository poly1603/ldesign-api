/**
 * 请求去重器
 *
 * 合并相同的并发请求，避免重复请求
 */

import { generateRequestKey, type RequestKeyConfig, type RequestKeyOptions } from '../utils/hash'

/**
 * 去重器选项
 */
export interface DeduplicatorOptions {
  /** 请求键生成选项 */
  keyOptions?: RequestKeyOptions
  /** 最大等待时间（毫秒），默认 30 秒 */
  maxWaitTime?: number
  /** 最大并发去重数，默认 100 */
  maxPending?: number
}

/**
 * 待处理的请求
 */
export interface PendingRequest<T = unknown> {
  /** 请求键 */
  key: string
  /** Promise */
  promise: Promise<T>
  /** 创建时间戳 */
  createdAt: number
  /** 请求数量（有多少个请求在等待） */
  requestCount: number
}

/**
 * 请求去重器
 *
 * 相同的并发请求只会执行一次，其他请求共享结果
 *
 * @example
 * ```typescript
 * const deduplicator = new RequestDeduplicator()
 *
 * // 在发起请求前检查
 * const key = deduplicator.generateKey({ method: 'GET', url: '/api/users' })
 *
 * // 尝试获取已有的请求
 * const pending = deduplicator.get(key)
 * if (pending) {
 *   return pending.promise // 复用已有请求
 * }
 *
 * // 发起新请求
 * const promise = fetch('/api/users')
 *
 * // 注册到去重器
 * deduplicator.set(key, promise)
 *
 * // 请求完成后自动移除
 * try {
 *   const result = await promise
 *   return result
 * } finally {
 *   deduplicator.delete(key)
 * }
 * ```
 */
export class RequestDeduplicator<T = unknown> {
  private readonly keyOptions: RequestKeyOptions
  private readonly maxWaitTime: number
  private readonly maxPending: number

  private pending: Map<string, PendingRequest<T>> = new Map()
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor(options: DeduplicatorOptions = {}) {
    this.keyOptions = options.keyOptions ?? {}
    this.maxWaitTime = options.maxWaitTime ?? 30 * 1000 // 30 秒
    this.maxPending = options.maxPending ?? 100

    // 定期清理超时的请求
    this.cleanupTimer = setInterval(() => this.cleanup(), 10 * 1000) // 10 秒

    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref()
    }
  }

  /**
   * 生成请求键
   *
   * @param config - 请求配置
   * @returns 请求键
   */
  generateKey(config: RequestKeyConfig): string {
    return generateRequestKey(config, this.keyOptions)
  }

  /**
   * 获取待处理的请求
   *
   * @param key - 请求键
   * @returns 待处理的请求或 undefined
   */
  get(key: string): PendingRequest<T> | undefined {
    const pending = this.pending.get(key)

    if (!pending) {
      return undefined
    }

    // 检查是否超时
    if (Date.now() - pending.createdAt > this.maxWaitTime) {
      this.pending.delete(key)
      return undefined
    }

    // 增加请求计数
    pending.requestCount++
    return pending
  }

  /**
   * 通过配置获取待处理的请求
   *
   * @param config - 请求配置
   * @returns 待处理的请求或 undefined
   */
  getByConfig(config: RequestKeyConfig): PendingRequest<T> | undefined {
    const key = this.generateKey(config)
    return this.get(key)
  }

  /**
   * 检查是否有待处理的请求
   *
   * @param key - 请求键
   * @returns 是否存在
   */
  has(key: string): boolean {
    return this.pending.has(key)
  }

  /**
   * 设置待处理的请求
   *
   * @param key - 请求键
   * @param promise - 请求 Promise
   * @returns 是否设置成功
   */
  set(key: string, promise: Promise<T>): boolean {
    // 检查是否已存在
    if (this.pending.has(key)) {
      return false
    }

    // 检查是否超过最大限制
    if (this.pending.size >= this.maxPending) {
      // 移除最旧的请求
      this.evictOldest()
    }

    const pending: PendingRequest<T> = {
      key,
      promise,
      createdAt: Date.now(),
      requestCount: 1,
    }

    this.pending.set(key, pending)

    // 请求完成后自动清理
    promise.finally(() => {
      this.pending.delete(key)
    })

    return true
  }

  /**
   * 通过配置设置待处理的请求
   *
   * @param config - 请求配置
   * @param promise - 请求 Promise
   * @returns 是否设置成功
   */
  setByConfig(config: RequestKeyConfig, promise: Promise<T>): boolean {
    const key = this.generateKey(config)
    return this.set(key, promise)
  }

  /**
   * 删除待处理的请求
   *
   * @param key - 请求键
   * @returns 是否删除成功
   */
  delete(key: string): boolean {
    return this.pending.delete(key)
  }

  /**
   * 执行去重请求
   *
   * 如果已有相同请求在进行中，则返回已有的 Promise
   * 否则执行提供的函数并注册
   *
   * @param config - 请求配置
   * @param executor - 请求执行函数
   * @returns 请求结果
   *
   * @example
   * ```typescript
   * const result = await deduplicator.execute(
   *   { method: 'GET', url: '/api/users' },
   *   () => fetch('/api/users').then(r => r.json())
   * )
   * ```
   */
  async execute(config: RequestKeyConfig, executor: () => Promise<T>): Promise<T> {
    const key = this.generateKey(config)

    // 检查是否有进行中的请求
    const pending = this.get(key)
    if (pending) {
      return pending.promise
    }

    // 执行新请求
    const promise = executor()
    this.set(key, promise)

    return promise
  }

  /**
   * 获取待处理请求数量
   */
  get size(): number {
    return this.pending.size
  }

  /**
   * 获取所有待处理的请求键
   *
   * @returns 请求键数组
   */
  keys(): string[] {
    return Array.from(this.pending.keys())
  }

  /**
   * 获取统计信息
   */
  getStats() {
    let totalRequestCount = 0
    const now = Date.now()
    let oldestAge = 0

    for (const pending of this.pending.values()) {
      totalRequestCount += pending.requestCount
      const age = now - pending.createdAt
      if (age > oldestAge) {
        oldestAge = age
      }
    }

    return {
      pendingCount: this.pending.size,
      totalRequestCount,
      oldestAge,
      maxPending: this.maxPending,
      maxWaitTime: this.maxWaitTime,
    }
  }

  /**
   * 清空所有待处理的请求
   */
  clear(): void {
    this.pending.clear()
  }

  /**
   * 销毁去重器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    this.pending.clear()
  }

  /**
   * 清理超时的请求
   */
  private cleanup(): void {
    const now = Date.now()

    for (const [key, pending] of this.pending) {
      if (now - pending.createdAt > this.maxWaitTime) {
        this.pending.delete(key)
      }
    }
  }

  /**
   * 移除最旧的请求
   */
  private evictOldest(): void {
    const firstKey = this.pending.keys().next().value
    if (firstKey !== undefined) {
      this.pending.delete(firstKey)
    }
  }
}
