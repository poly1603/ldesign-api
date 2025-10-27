/**
 * 高级性能监控器
 * 支持P50/P75/P90/P95/P99延迟分析、热点检测、性能趋势分析
 */

import { PERFORMANCE_CONSTANTS } from '../constants'

/**
 * 性能记录
 */
export interface PerformanceRecord {
  /** 方法名 */
  methodName: string
  /** 参数哈希（用于分组） */
  paramsHash?: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 持续时间（毫秒） */
  duration: number
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 缓存命中 */
  cacheHit?: boolean
  /** 重试次数 */
  retries?: number
}

/**
 * 方法性能统计
 */
export interface MethodPerformanceStats {
  /** 方法名 */
  methodName: string
  /** 调用次数 */
  count: number
  /** 成功次数 */
  successCount: number
  /** 失败次数 */
  errorCount: number
  /** 总耗时 */
  totalDuration: number
  /** 平均耗时 */
  avgDuration: number
  /** 最小耗时 */
  minDuration: number
  /** 最大耗时 */
  maxDuration: number
  /** P50延迟 */
  p50: number
  /** P75延迟 */
  p75: number
  /** P90延迟 */
  p90: number
  /** P95延迟 */
  p95: number
  /** P99延迟 */
  p99: number
  /** 成功率 */
  successRate: number
  /** 缓存命中率 */
  cacheHitRate: number
  /** 平均重试次数 */
  avgRetries: number
  /** 最后调用时间 */
  lastCallTime: number
  /** 调用频率（次/秒） */
  callFrequency: number
}

/**
 * 热点信息
 */
export interface HotspotInfo {
  /** 方法名 */
  methodName: string
  /** 调用次数 */
  callCount: number
  /** 总耗时 */
  totalDuration: number
  /** 平均耗时 */
  avgDuration: number
  /** 热度评分（综合调用次数和耗时） */
  hotness: number
}

/**
 * 性能趋势
 */
export interface PerformanceTrend {
  /** 方法名 */
  methodName: string
  /** 趋势方向 */
  direction: 'improving' | 'degrading' | 'stable'
  /** 变化率（百分比） */
  changeRate: number
  /** 当前平均耗时 */
  currentAvgDuration: number
  /** 历史平均耗时 */
  historicalAvgDuration: number
}

/**
 * 高级性能监控配置
 */
export interface AdvancedPerformanceMonitorConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 最大记录数 */
  maxRecords?: number
  /** 记录保留时间（毫秒） */
  retention?: number
  /** 是否启用热点检测 */
  enableHotspotDetection?: boolean
  /** 热点检测间隔（毫秒） */
  hotspotInterval?: number
  /** 是否启用趋势分析 */
  enableTrendAnalysis?: boolean
  /** 趋势分析窗口大小 */
  trendWindowSize?: number
  /** 慢请求阈值（毫秒） */
  slowThreshold?: number
  /** 性能警告回调 */
  onSlowRequest?: (record: PerformanceRecord) => void
  /** 热点警告回调 */
  onHotspot?: (hotspot: HotspotInfo) => void
}

/**
 * 高级性能监控器
 */
export class AdvancedPerformanceMonitor {
  private config: Required<AdvancedPerformanceMonitorConfig>
  private records: PerformanceRecord[] = []
  private methodStats = new Map<string, MethodPerformanceStats>()
  private hotspotTimer: ReturnType<typeof setInterval> | null = null

  constructor(config: AdvancedPerformanceMonitorConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      maxRecords: config.maxRecords ?? PERFORMANCE_CONSTANTS.MAX_RECORDS,
      retention: config.retention ?? PERFORMANCE_CONSTANTS.RECORD_RETENTION,
      enableHotspotDetection: config.enableHotspotDetection ?? true,
      hotspotInterval: config.hotspotInterval ?? 30000,
      enableTrendAnalysis: config.enableTrendAnalysis ?? true,
      trendWindowSize: config.trendWindowSize ?? 100,
      slowThreshold: config.slowThreshold ?? PERFORMANCE_CONSTANTS.SLOW_REQUEST_THRESHOLD,
      onSlowRequest: config.onSlowRequest ?? (() => { }),
      onHotspot: config.onHotspot ?? (() => { }),
    }

    if (this.config.enableHotspotDetection) {
      this.startHotspotDetection()
    }
  }

  /**
   * 开始性能监控
   */
  startCall(methodName: string, params?: unknown): () => void {
    if (!this.config.enabled) {
      return () => { }
    }

    const startTime = Date.now()
    const paramsHash = this.hashParams(params)

    return (error?: any) => {
      const endTime = Date.now()
      const duration = endTime - startTime

      const record: PerformanceRecord = {
        methodName,
        paramsHash,
        startTime,
        endTime,
        duration,
        success: !error,
        error: error?.message,
        cacheHit: false,
        retries: 0,
      }

      this.addRecord(record)

      // 慢请求警告
      if (duration > this.config.slowThreshold) {
        this.config.onSlowRequest(record)
      }
    }
  }

  /**
   * 添加性能记录
   */
  private addRecord(record: PerformanceRecord): void {
    // 添加记录
    this.records.push(record)

    // 限制记录数量
    if (this.records.length > this.config.maxRecords) {
      this.records.shift()
    }

    // 更新方法统计
    this.updateMethodStats(record)

    // 清理过期记录
    this.cleanupExpiredRecords()
  }

  /**
   * 更新方法统计
   */
  private updateMethodStats(record: PerformanceRecord): void {
    let stats = this.methodStats.get(record.methodName)

    if (!stats) {
      stats = {
        methodName: record.methodName,
        count: 0,
        successCount: 0,
        errorCount: 0,
        totalDuration: 0,
        avgDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        p50: 0,
        p75: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        successRate: 0,
        cacheHitRate: 0,
        avgRetries: 0,
        lastCallTime: 0,
        callFrequency: 0,
      }
      this.methodStats.set(record.methodName, stats)
    }

    // 更新基础统计
    stats.count++
    if (record.success) stats.successCount++
    else stats.errorCount++
    stats.totalDuration += record.duration
    stats.avgDuration = stats.totalDuration / stats.count
    stats.minDuration = Math.min(stats.minDuration, record.duration)
    stats.maxDuration = Math.max(stats.maxDuration, record.duration)
    stats.successRate = stats.successCount / stats.count
    stats.lastCallTime = record.endTime

    // 计算分位数（需要收集该方法的所有记录）
    const methodRecords = this.records
      .filter(r => r.methodName === record.methodName)
      .map(r => r.duration)
      .sort((a, b) => a - b)

    if (methodRecords.length > 0) {
      stats.p50 = this.calculatePercentile(methodRecords, 50)
      stats.p75 = this.calculatePercentile(methodRecords, 75)
      stats.p90 = this.calculatePercentile(methodRecords, 90)
      stats.p95 = this.calculatePercentile(methodRecords, 95)
      stats.p99 = this.calculatePercentile(methodRecords, 99)
    }

    // 计算调用频率
    if (stats.count > 1) {
      const timeSpan = (stats.lastCallTime - this.records.find(r => r.methodName === record.methodName)!.startTime) / 1000
      stats.callFrequency = stats.count / timeSpan
    }
  }

  /**
   * 计算分位数
   */
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0
    if (sortedValues.length === 1) return sortedValues[0]

    const index = (percentile / 100) * (sortedValues.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index - lower

    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight
  }

  /**
   * 生成参数哈希
   */
  private hashParams(params?: unknown): string {
    if (!params) return ''
    try {
      return JSON.stringify(params).substring(0, 50)
    }
    catch {
      return '[complex]'
    }
  }

  /**
   * 清理过期记录
   */
  private cleanupExpiredRecords(): void {
    const now = Date.now()
    const threshold = now - this.config.retention

    this.records = this.records.filter(record => record.endTime > threshold)
  }

  /**
   * 获取方法性能统计
   */
  getMethodStats(methodName: string): MethodPerformanceStats | null {
    return this.methodStats.get(methodName) || null
  }

  /**
   * 获取所有方法统计
   */
  getAllMethodStats(): MethodPerformanceStats[] {
    return Array.from(this.methodStats.values())
  }

  /**
   * 获取热点（调用最频繁或最耗时的方法）
   */
  getHotspots(limit: number = 10): HotspotInfo[] {
    const hotspots: HotspotInfo[] = []

    for (const stats of this.methodStats.values()) {
      // 热度评分 = 调用次数 * log(平均耗时)
      const hotness = stats.count * Math.log(stats.avgDuration + 1) * stats.callFrequency

      hotspots.push({
        methodName: stats.methodName,
        callCount: stats.count,
        totalDuration: stats.totalDuration,
        avgDuration: stats.avgDuration,
        hotness,
      })
    }

    // 按热度排序
    return hotspots.sort((a, b) => b.hotness - a.hotness).slice(0, limit)
  }

  /**
   * 获取性能趋势
   */
  getPerformanceTrends(): PerformanceTrend[] {
    if (!this.config.enableTrendAnalysis) return []

    const trends: PerformanceTrend[] = []
    const windowSize = this.config.trendWindowSize

    for (const [methodName, stats] of this.methodStats) {
      const methodRecords = this.records
        .filter(r => r.methodName === methodName)
        .slice(-windowSize * 2) // 取最近2倍窗口大小的记录

      if (methodRecords.length < windowSize) continue

      // 计算前半部分和后半部分的平均耗时
      const mid = Math.floor(methodRecords.length / 2)
      const firstHalf = methodRecords.slice(0, mid)
      const secondHalf = methodRecords.slice(mid)

      const historicalAvg = firstHalf.reduce((sum, r) => sum + r.duration, 0) / firstHalf.length
      const currentAvg = secondHalf.reduce((sum, r) => sum + r.duration, 0) / secondHalf.length

      // 计算变化率
      const changeRate = ((currentAvg - historicalAvg) / historicalAvg) * 100

      // 判断趋势方向
      let direction: PerformanceTrend['direction'] = 'stable'
      if (Math.abs(changeRate) > 10) {
        direction = changeRate > 0 ? 'degrading' : 'improving'
      }

      trends.push({
        methodName,
        direction,
        changeRate,
        currentAvgDuration: currentAvg,
        historicalAvgDuration: historicalAvg,
      })
    }

    return trends
  }

  /**
   * 获取慢请求列表
   */
  getSlowRequests(limit: number = 10): PerformanceRecord[] {
    return this.records
      .filter(r => r.duration > this.config.slowThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  /**
   * 启动热点检测
   */
  private startHotspotDetection(): void {
    this.hotspotTimer = setInterval(() => {
      const hotspots = this.getHotspots(5)
      if (hotspots.length > 0 && hotspots[0].hotness > 1000) {
        this.config.onHotspot(hotspots[0])
      }
    }, this.config.hotspotInterval)
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    overview: {
      totalCalls: number
      successRate: number
      avgDuration: number
      slowRequestCount: number
    }
    topMethods: MethodPerformanceStats[]
    hotspots: HotspotInfo[]
    trends: PerformanceTrend[]
    slowRequests: PerformanceRecord[]
  } {
    const allStats = this.getAllMethodStats()
    const totalCalls = allStats.reduce((sum, s) => sum + s.count, 0)
    const totalSuccess = allStats.reduce((sum, s) => sum + s.successCount, 0)
    const totalDuration = allStats.reduce((sum, s) => sum + s.totalDuration, 0)
    const slowRequests = this.getSlowRequests()

    return {
      overview: {
        totalCalls,
        successRate: totalCalls > 0 ? totalSuccess / totalCalls : 0,
        avgDuration: totalCalls > 0 ? totalDuration / totalCalls : 0,
        slowRequestCount: slowRequests.length,
      },
      topMethods: allStats.sort((a, b) => b.count - a.count).slice(0, 10),
      hotspots: this.getHotspots(),
      trends: this.getPerformanceTrends(),
      slowRequests,
    }
  }

  /**
   * 重置统计
   */
  reset(): void {
    this.records = []
    this.methodStats.clear()
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    if (this.hotspotTimer) {
      clearInterval(this.hotspotTimer)
      this.hotspotTimer = null
    }
    this.reset()
  }
}

/**
 * 全局性能监控器实例
 */
let globalAdvancedMonitor: AdvancedPerformanceMonitor | null = null

/**
 * 获取全局高级性能监控器
 */
export function getGlobalAdvancedPerformanceMonitor(): AdvancedPerformanceMonitor {
  if (!globalAdvancedMonitor) {
    globalAdvancedMonitor = new AdvancedPerformanceMonitor()
  }
  return globalAdvancedMonitor
}

/**
 * 设置全局高级性能监控器
 */
export function setGlobalAdvancedPerformanceMonitor(monitor: AdvancedPerformanceMonitor | null): void {
  if (globalAdvancedMonitor) {
    globalAdvancedMonitor.destroy()
  }
  globalAdvancedMonitor = monitor
}


