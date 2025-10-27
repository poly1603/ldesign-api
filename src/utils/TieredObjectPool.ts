/**
 * 分级对象池
 * 实现热池+冷池的双层结构，提供更好的性能和内存管理
 */

import { OBJECT_POOL_CONSTANTS } from '../constants'

/**
 * 对象池统计信息
 */
export interface ObjectPoolStats {
  /** 热池大小 */
  hotPoolSize: number
  /** 冷池大小 */
  coldPoolSize: number
  /** 总大小 */
  totalSize: number
  /** 获取次数 */
  acquireCount: number
  /** 释放次数 */
  releaseCount: number
  /** 创建次数 */
  createCount: number
  /** 热池命中次数 */
  hotHits: number
  /** 冷池命中次数 */
  coldHits: number
  /** 未命中次数 */
  misses: number
  /** 命中率 */
  hitRate: number
}

/**
 * 对象池配置
 */
export interface ObjectPoolConfig<T> {
  /** 热池最大容量 */
  hotPoolMaxSize?: number
  /** 冷池最大容量 */
  coldPoolMaxSize?: number
  /** 对象工厂函数 */
  factory: () => T
  /** 对象重置函数 */
  reset?: (obj: T) => void
  /** 对象验证函数 */
  validate?: (obj: T) => boolean
  /** 预热数量 */
  prewarmCount?: number
}

/**
 * 分级对象池
 */
export class TieredObjectPool<T> {
  /** 热池（频繁访问的对象） */
  private hotPool: T[] = []
  /** 冷池（不常访问的对象） */
  private coldPool: T[] = []
  /** 配置 */
  private config: Required<Omit<ObjectPoolConfig<T>, 'reset' | 'validate'>> & {
    reset?: (obj: T) => void
    validate?: (obj: T) => boolean
  }
  /** 统计信息 */
  private stats = {
    acquireCount: 0,
    releaseCount: 0,
    createCount: 0,
    hotHits: 0,
    coldHits: 0,
    misses: 0,
  }

  constructor(config: ObjectPoolConfig<T>) {
    this.config = {
      hotPoolMaxSize: config.hotPoolMaxSize ?? OBJECT_POOL_CONSTANTS.HOT_POOL_MAX_SIZE,
      coldPoolMaxSize: config.coldPoolMaxSize ?? OBJECT_POOL_CONSTANTS.COLD_POOL_MAX_SIZE,
      factory: config.factory,
      reset: config.reset,
      validate: config.validate,
      prewarmCount: config.prewarmCount ?? OBJECT_POOL_CONSTANTS.PREWARM_COUNT,
    }

    // 预热
    this.prewarm()
  }

  /**
   * 预热对象池
   */
  private prewarm(): void {
    const count = Math.min(this.config.prewarmCount, this.config.hotPoolMaxSize)
    for (let i = 0; i < count; i++) {
      const obj = this.config.factory()
      this.stats.createCount++
      this.hotPool.push(obj)
    }
  }

  /**
   * 从对象池获取对象
   */
  acquire(): T {
    this.stats.acquireCount++

    // 1. 尝试从热池获取
    if (this.hotPool.length > 0) {
      const obj = this.hotPool.pop()!
      this.stats.hotHits++

      // 验证对象
      if (this.config.validate && !this.config.validate(obj)) {
        // 对象无效，创建新对象
        return this.createObject()
      }

      return obj
    }

    // 2. 尝试从冷池获取
    if (this.coldPool.length > 0) {
      const obj = this.coldPool.pop()!
      this.stats.coldHits++

      // 验证对象
      if (this.config.validate && !this.config.validate(obj)) {
        // 对象无效，创建新对象
        return this.createObject()
      }

      return obj
    }

    // 3. 创建新对象
    this.stats.misses++
    return this.createObject()
  }

  /**
   * 创建新对象
   */
  private createObject(): T {
    this.stats.createCount++
    return this.config.factory()
  }

  /**
   * 释放对象回池
   */
  release(obj: T): void {
    this.stats.releaseCount++

    // 验证对象
    if (this.config.validate && !this.config.validate(obj)) {
      // 对象无效，不放回池中
      return
    }

    // 重置对象
    if (this.config.reset) {
      this.config.reset(obj)
    }

    // 优先放入热池
    if (this.hotPool.length < this.config.hotPoolMaxSize) {
      this.hotPool.push(obj)
      return
    }

    // 热池满了，放入冷池
    if (this.coldPool.length < this.config.coldPoolMaxSize) {
      this.coldPool.push(obj)
      return
    }

    // 两个池都满了，丢弃对象（让GC回收）
  }

  /**
   * 批量获取对象
   */
  acquireBatch(count: number): T[] {
    const result: T[] = []
    for (let i = 0; i < count; i++) {
      result.push(this.acquire())
    }
    return result
  }

  /**
   * 批量释放对象
   */
  releaseBatch(objects: T[]): void {
    for (const obj of objects) {
      this.release(obj)
    }
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.hotPool = []
    this.coldPool = []
  }

  /**
   * 获取统计信息
   */
  getStats(): ObjectPoolStats {
    const total = this.stats.hotHits + this.stats.coldHits + this.stats.misses
    return {
      hotPoolSize: this.hotPool.length,
      coldPoolSize: this.coldPool.length,
      totalSize: this.hotPool.length + this.coldPool.length,
      acquireCount: this.stats.acquireCount,
      releaseCount: this.stats.releaseCount,
      createCount: this.stats.createCount,
      hotHits: this.stats.hotHits,
      coldHits: this.stats.coldHits,
      misses: this.stats.misses,
      hitRate: total > 0 ? (this.stats.hotHits + this.stats.coldHits) / total : 0,
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      acquireCount: 0,
      releaseCount: 0,
      createCount: 0,
      hotHits: 0,
      coldHits: 0,
      misses: 0,
    }
  }

  /**
   * 自适应调整池大小
   * 根据使用情况动态调整热池和冷池的大小
   */
  adjustPoolSize(): void {
    const stats = this.getStats()

    // 如果热池命中率很高，增加热池容量
    if (stats.hotHits > stats.coldHits * 2 && this.config.hotPoolMaxSize < 200) {
      this.config.hotPoolMaxSize = Math.min(200, this.config.hotPoolMaxSize + 10)
    }

    // 如果冷池命中率高，增加冷池容量
    if (stats.coldHits > stats.hotHits && this.config.coldPoolMaxSize < 200) {
      this.config.coldPoolMaxSize = Math.min(200, this.config.coldPoolMaxSize + 10)
    }

    // 如果未命中率高，可能需要预热更多对象
    if (stats.misses > (stats.hotHits + stats.coldHits) * 0.5) {
      this.prewarm()
    }
  }

  /**
   * 压缩对象池
   * 将冷池中的部分对象移到热池
   */
  compact(): void {
    const available = this.config.hotPoolMaxSize - this.hotPool.length
    if (available > 0 && this.coldPool.length > 0) {
      const moveCount = Math.min(available, this.coldPool.length)
      const movedObjects = this.coldPool.splice(0, moveCount)
      this.hotPool.push(...movedObjects)
    }
  }

  /**
   * 销毁对象池
   */
  destroy(): void {
    this.clear()
    this.resetStats()
  }
}

/**
 * 创建分级对象池
 */
export function createTieredObjectPool<T>(config: ObjectPoolConfig<T>): TieredObjectPool<T> {
  return new TieredObjectPool(config)
}

/**
 * 通用对象池工厂
 */
export class ObjectPoolFactory {
  /** 上下文对象池 */
  static createContextPool() {
    return createTieredObjectPool({
      factory: () => ({ methodName: '', params: null, engine: null as any }),
      reset: (obj) => {
        obj.methodName = ''
        obj.params = null
        // engine 保留以供复用
      },
      validate: (obj) => typeof obj === 'object' && obj !== null,
    })
  }

  /** 配置对象池 */
  static createConfigPool() {
    return createTieredObjectPool({
      factory: () => ({}),
      reset: (obj) => {
        // 清空对象的所有属性
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            delete obj[key]
          }
        }
      },
      validate: (obj) => typeof obj === 'object' && obj !== null,
    })
  }

  /** 数组对象池 */
  static createArrayPool<T = any>() {
    return createTieredObjectPool<T[]>({
      factory: () => [],
      reset: (arr) => {
        arr.length = 0
      },
      validate: (arr) => Array.isArray(arr),
    })
  }

  /** 字符串池（用于缓存键） */
  static createStringPool() {
    const cache = new Set<string>()

    return {
      intern(str: string): string {
        if (cache.has(str)) {
          return str
        }
        cache.add(str)
        return str
      },
      clear() {
        cache.clear()
      },
      size() {
        return cache.size
      },
    }
  }
}


