/**
 * 内存保护工具
 * 提供内存监控、泄漏检测和自动降级功能
 */

import { MEMORY_CONSTANTS } from '../constants'

/**
 * 内存使用信息
 */
export interface MemoryInfo {
  /** 已使用内存（字节） */
  used: number
  /** 内存使用率（0-1） */
  usageRate: number
  /** 是否超过警告阈值 */
  isWarning: boolean
  /** 是否超过最大限制 */
  isOverLimit: boolean
  /** 估算的对象数量 */
  estimatedObjects: number
}

/**
 * 内存统计信息
 */
export interface MemoryStats {
  /** 当前内存使用 */
  current: MemoryInfo
  /** 峰值内存使用 */
  peak: MemoryInfo
  /** 平均内存使用 */
  average: MemoryInfo
  /** 降级次数 */
  degradationCount: number
  /** 检查次数 */
  checkCount: number
}

/**
 * 循环引用检测结果
 */
export interface CircularReferenceResult {
  /** 是否有循环引用 */
  hasCircular: boolean
  /** 循环引用路径 */
  paths: string[]
  /** 检测到的对象数量 */
  objectCount: number
}

/**
 * 内存保护配置
 */
export interface MemoryGuardConfig {
  /** 最大内存使用（字节） */
  maxMemory?: number
  /** 警告阈值（字节） */
  warningThreshold?: number
  /** 检查间隔（毫秒） */
  checkInterval?: number
  /** 是否启用自动降级 */
  enableAutoDegradation?: boolean
  /** 降级回调 */
  onDegradation?: (info: MemoryInfo) => void
  /** 警告回调 */
  onWarning?: (info: MemoryInfo) => void
}

/**
 * 内存保护器
 */
export class MemoryGuard {
  private config: Required<MemoryGuardConfig>
  private checkTimer: ReturnType<typeof setInterval> | null = null
  private stats: MemoryStats
  private totalUsage = 0
  private checkCount = 0
  private degradationCount = 0
  private peakUsage = 0

  constructor(config: MemoryGuardConfig = {}) {
    this.config = {
      maxMemory: config.maxMemory ?? MEMORY_CONSTANTS.MAX_MEMORY_USAGE,
      warningThreshold: config.warningThreshold ?? MEMORY_CONSTANTS.MEMORY_WARNING_THRESHOLD,
      checkInterval: config.checkInterval ?? MEMORY_CONSTANTS.MEMORY_CHECK_INTERVAL,
      enableAutoDegradation: config.enableAutoDegradation ?? true,
      onDegradation: config.onDegradation ?? (() => { }),
      onWarning: config.onWarning ?? (() => { }),
    }

    this.stats = this.createEmptyStats()
    this.startMonitoring()
  }

  /**
   * 创建空统计信息
   */
  private createEmptyStats(): MemoryStats {
    const emptyInfo: MemoryInfo = {
      used: 0,
      usageRate: 0,
      isWarning: false,
      isOverLimit: false,
      estimatedObjects: 0,
    }

    return {
      current: { ...emptyInfo },
      peak: { ...emptyInfo },
      average: { ...emptyInfo },
      degradationCount: 0,
      checkCount: 0,
    }
  }

  /**
   * 启动内存监控
   */
  private startMonitoring(): void {
    if (this.checkTimer) return

    this.checkTimer = setInterval(() => {
      this.checkMemory()
    }, this.config.checkInterval)
  }

  /**
   * 停止内存监控
   */
  private stopMonitoring(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer)
      this.checkTimer = null
    }
  }

  /**
   * 检查内存使用
   */
  checkMemory(): MemoryInfo {
    const used = this.estimateMemoryUsage()
    const usageRate = used / this.config.maxMemory
    const isWarning = used >= this.config.warningThreshold
    const isOverLimit = used >= this.config.maxMemory

    const info: MemoryInfo = {
      used,
      usageRate,
      isWarning,
      isOverLimit,
      estimatedObjects: this.estimateObjectCount(),
    }

    // 更新统计
    this.checkCount++
    this.totalUsage += used
    if (used > this.peakUsage) {
      this.peakUsage = used
      this.stats.peak = { ...info }
    }

    this.stats.current = info
    this.stats.average = {
      used: this.totalUsage / this.checkCount,
      usageRate: (this.totalUsage / this.checkCount) / this.config.maxMemory,
      isWarning: false,
      isOverLimit: false,
      estimatedObjects: 0,
    }
    this.stats.checkCount = this.checkCount
    this.stats.degradationCount = this.degradationCount

    // 触发警告
    if (isWarning && !isOverLimit) {
      this.config.onWarning(info)
    }

    // 触发降级
    if (isOverLimit && this.config.enableAutoDegradation) {
      this.degradationCount++
      this.config.onDegradation(info)
    }

    return info
  }

  /**
   * 估算内存使用（基于 performance.memory 或启发式）
   */
  private estimateMemoryUsage(): number {
    // 尝试使用 performance.memory（仅 Chrome）
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      if (memory && typeof memory.usedJSHeapSize === 'number') {
        return memory.usedJSHeapSize
      }
    }

    // 降级到估算（基于已知的缓存等）
    return 0 // 由外部组件提供估算值
  }

  /**
   * 估算对象数量
   */
  private estimateObjectCount(): number {
    // 简单估算：假设平均每个对象 1KB
    return Math.floor(this.estimateMemoryUsage() / 1024)
  }

  /**
   * 检测循环引用
   * @param obj 要检测的对象
   * @param maxDepth 最大深度
   */
  detectCircularReferences(obj: unknown, maxDepth: number = 10): CircularReferenceResult {
    const paths: string[] = []
    const seen = new WeakSet<object>()
    let objectCount = 0

    const detect = (value: unknown, path: string, depth: number): boolean => {
      // 深度限制
      if (depth > maxDepth) {
        return false
      }

      // 非对象类型
      if (typeof value !== 'object' || value === null) {
        return false
      }

      // 已访问过，发现循环
      if (seen.has(value)) {
        paths.push(path)
        return true
      }

      // 标记为已访问
      seen.add(value)
      objectCount++

      let hasCircular = false

      // 数组
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (detect(value[i], `${path}[${i}]`, depth + 1)) {
            hasCircular = true
          }
        }
      }
      // 对象
      else {
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            if (detect((value as any)[key], `${path}.${key}`, depth + 1)) {
              hasCircular = true
            }
          }
        }
      }

      return hasCircular
    }

    const hasCircular = detect(obj, '$', 0)

    return {
      hasCircular,
      paths,
      objectCount,
    }
  }

  /**
   * 获取内存统计
   */
  getStats(): MemoryStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = this.createEmptyStats()
    this.totalUsage = 0
    this.checkCount = 0
    this.degradationCount = 0
    this.peakUsage = 0
  }

  /**
   * 是否应该降级
   */
  shouldDegrade(): boolean {
    return this.stats.current.isOverLimit
  }

  /**
   * 是否应该警告
   */
  shouldWarn(): boolean {
    return this.stats.current.isWarning
  }

  /**
   * 更新外部内存估算
   * @param bytes 已使用的字节数
   */
  updateMemoryEstimate(bytes: number): void {
    // 这个方法允许外部组件报告其内存使用
    // 可以用于累加各个管理器的内存使用
    const info: MemoryInfo = {
      used: bytes,
      usageRate: bytes / this.config.maxMemory,
      isWarning: bytes >= this.config.warningThreshold,
      isOverLimit: bytes >= this.config.maxMemory,
      estimatedObjects: Math.floor(bytes / 1024),
    }

    this.stats.current = info

    if (bytes > this.peakUsage) {
      this.peakUsage = bytes
      this.stats.peak = { ...info }
    }
  }

  /**
   * 销毁内存保护器
   */
  destroy(): void {
    this.stopMonitoring()
    this.resetStats()
  }
}

/**
 * 全局内存保护器实例
 */
let globalMemoryGuard: MemoryGuard | null = null

/**
 * 获取全局内存保护器
 */
export function getGlobalMemoryGuard(): MemoryGuard {
  if (!globalMemoryGuard) {
    globalMemoryGuard = new MemoryGuard()
  }
  return globalMemoryGuard
}

/**
 * 设置全局内存保护器
 */
export function setGlobalMemoryGuard(guard: MemoryGuard | null): void {
  if (globalMemoryGuard) {
    globalMemoryGuard.destroy()
  }
  globalMemoryGuard = guard
}

/**
 * 检测对象是否有循环引用
 */
export function hasCircularReference(obj: unknown, maxDepth?: number): boolean {
  const guard = getGlobalMemoryGuard()
  const result = guard.detectCircularReferences(obj, maxDepth)
  return result.hasCircular
}

/**
 * 获取内存使用信息
 */
export function getMemoryInfo(): MemoryInfo {
  const guard = getGlobalMemoryGuard()
  return guard.checkMemory()
}

/**
 * 获取内存统计
 */
export function getMemoryStats(): MemoryStats {
  const guard = getGlobalMemoryGuard()
  return guard.getStats()
}


