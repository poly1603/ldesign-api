/**
 * LRU 缓存实现
 *
 * 最近最少使用（Least Recently Used）缓存算法
 * 当缓存满时，移除最久未使用的条目
 */

/**
 * LRU 缓存选项
 */
export interface LRUCacheOptions {
  /** 最大缓存数量，默认 100 */
  maxSize?: number
  /** 默认 TTL（毫秒），默认 5 分钟 */
  defaultTTL?: number
  /** 是否在 TTL 过期后自动清理，默认 true */
  autoCleanup?: boolean
  /** 自动清理间隔（毫秒），默认 1 分钟 */
  cleanupInterval?: number
  /** 缓存条目被移除时的回调 */
  onEvict?: <T>(key: string, value: T) => void
}

/**
 * 缓存条目
 */
export interface CacheEntry<T> {
  /** 缓存值 */
  value: T
  /** 创建时间戳 */
  createdAt: number
  /** 过期时间戳 */
  expiresAt: number
  /** 上次访问时间戳 */
  lastAccessedAt: number
  /** 访问次数 */
  accessCount: number
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 当前条目数 */
  size: number
  /** 最大条目数 */
  maxSize: number
  /** 命中次数 */
  hits: number
  /** 未命中次数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 驱逐次数 */
  evictions: number
}

/**
 * LRU 缓存类
 *
 * @example
 * ```typescript
 * const cache = new LRUCache<string>({ maxSize: 100, defaultTTL: 60000 })
 *
 * // 设置缓存
 * cache.set('key1', 'value1')
 * cache.set('key2', 'value2', 30000) // 自定义 TTL
 *
 * // 获取缓存
 * const value = cache.get('key1') // 'value1'
 *
 * // 检查是否存在
 * cache.has('key1') // true
 *
 * // 删除缓存
 * cache.delete('key1')
 *
 * // 清空缓存
 * cache.clear()
 * ```
 */
export class LRUCache<T = unknown> {
  private readonly maxSize: number
  private readonly defaultTTL: number
  private readonly onEvict?: <V>(key: string, value: V) => void

  private cache: Map<string, CacheEntry<T>> = new Map()
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  // 统计信息
  private hits = 0
  private misses = 0
  private evictions = 0

  constructor(options: LRUCacheOptions = {}) {
    this.maxSize = options.maxSize ?? 100
    this.defaultTTL = options.defaultTTL ?? 5 * 60 * 1000 // 5 分钟
    this.onEvict = options.onEvict

    // 设置自动清理
    if (options.autoCleanup !== false) {
      const interval = options.cleanupInterval ?? 60 * 1000 // 1 分钟
      this.cleanupTimer = setInterval(() => this.cleanup(), interval)

      // 在 Node.js 中允许进程退出
      if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref()
      }
    }
  }

  /**
   * 获取缓存值
   *
   * @param key - 缓存键
   * @returns 缓存值或 undefined
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return undefined
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      this.misses++
      return undefined
    }

    // 更新访问信息
    entry.lastAccessedAt = Date.now()
    entry.accessCount++

    // 移动到末尾（最近使用）
    this.cache.delete(key)
    this.cache.set(key, entry)

    this.hits++
    return entry.value
  }

  /**
   * 设置缓存值
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - TTL（毫秒），可选
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now()
    const actualTTL = ttl ?? this.defaultTTL

    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // 检查是否需要驱逐
    while (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    // 创建新条目
    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      expiresAt: now + actualTTL,
      lastAccessedAt: now,
      accessCount: 0,
    }

    this.cache.set(key, entry)
  }

  /**
   * 检查缓存键是否存在且未过期
   *
   * @param key - 缓存键
   * @returns 是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存条目
   *
   * @param key - 缓存键
   * @returns 是否删除成功
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    this.cache.delete(key)

    if (this.onEvict) {
      this.onEvict(key, entry.value)
    }

    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    if (this.onEvict) {
      for (const [key, entry] of this.cache) {
        this.onEvict(key, entry.value)
      }
    }

    this.cache.clear()
    this.hits = 0
    this.misses = 0
    this.evictions = 0
  }

  /**
   * 获取缓存条目信息
   *
   * @param key - 缓存键
   * @returns 缓存条目信息或 undefined
   */
  getEntry(key: string): CacheEntry<T> | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      return undefined
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      return undefined
    }

    return { ...entry }
  }

  /**
   * 获取所有缓存键
   *
   * @returns 缓存键数组
   */
  keys(): string[] {
    const keys: string[] = []
    const now = Date.now()

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt > now) {
        keys.push(key)
      }
    }

    return keys
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 获取缓存统计信息
   *
   * @returns 统计信息
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      evictions: this.evictions,
    }
  }

  /**
   * 清理过期条目
   *
   * @returns 清理的条目数
   */
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt <= now) {
        this.delete(key)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * 更新条目的 TTL
   *
   * @param key - 缓存键
   * @param ttl - 新的 TTL（毫秒）
   * @returns 是否更新成功
   */
  touch(key: string, ttl?: number): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      return false
    }

    // 更新过期时间
    const actualTTL = ttl ?? this.defaultTTL
    entry.expiresAt = Date.now() + actualTTL
    entry.lastAccessedAt = Date.now()

    return true
  }

  /**
   * 获取或设置缓存值
   *
   * 如果缓存存在则返回，否则调用工厂函数创建值并缓存
   *
   * @param key - 缓存键
   * @param factory - 值工厂函数
   * @param ttl - TTL（毫秒），可选
   * @returns 缓存值
   */
  getOrSet(key: string, factory: () => T, ttl?: number): T {
    const existing = this.get(key)

    if (existing !== undefined) {
      return existing
    }

    const value = factory()
    this.set(key, value, ttl)
    return value
  }

  /**
   * 异步获取或设置缓存值
   *
   * @param key - 缓存键
   * @param factory - 异步值工厂函数
   * @param ttl - TTL（毫秒），可选
   * @returns 缓存值
   */
  async getOrSetAsync(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const existing = this.get(key)

    if (existing !== undefined) {
      return existing
    }

    const value = await factory()
    this.set(key, value, ttl)
    return value
  }

  /**
   * 销毁缓存
   *
   * 停止自动清理并清空缓存
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    this.clear()
  }

  /**
   * 驱逐最旧的条目
   */
  private evictOldest(): void {
    // Map 的第一个条目是最旧的
    const firstKey = this.cache.keys().next().value

    if (firstKey !== undefined) {
      const entry = this.cache.get(firstKey)
      this.cache.delete(firstKey)
      this.evictions++

      if (entry && this.onEvict) {
        this.onEvict(firstKey, entry.value)
      }
    }
  }
}
