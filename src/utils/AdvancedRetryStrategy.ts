/**
 * 高级重试策略
 * 提供多种退避算法和智能重试功能
 */

import type { RetryConfig } from '../types'
import { RETRY_CONSTANTS } from '../constants'

/**
 * 退避策略类型
 */
export type BackoffStrategy =
  | 'fixed'           // 固定延迟
  | 'exponential'     // 指数退避
  | 'fibonacci'       // 斐波那契退避
  | 'decorrelated'    // 去相关抖动（AWS推荐）
  | 'linear'          // 线性增长
  | 'polynomial'      // 多项式增长

/**
 * 高级重试配置
 */
export interface AdvancedRetryConfig extends RetryConfig {
  /** 退避策略 */
  backoffStrategy?: BackoffStrategy
  /** 多项式退避的指数（默认2，即平方） */
  polynomialDegree?: number
  /** 去相关抖动的基数 */
  decorrelatedBase?: number
  /** 智能重试：根据错误类型自动调整 */
  smartRetry?: boolean
  /** 重试预算（总重试时间上限，毫秒） */
  retryBudget?: number
  /** 错误分类器 */
  errorClassifier?: (error: any) => 'transient' | 'permanent' | 'unknown'
}

/**
 * 重试上下文
 */
export interface RetryContext {
  /** 当前尝试次数 */
  attempt: number
  /** 已消耗时间（毫秒） */
  elapsedTime: number
  /** 上次延迟 */
  lastDelay: number
  /** 错误历史 */
  errorHistory: any[]
}

/**
 * 高级重试策略计算器
 */
export class AdvancedRetryStrategy {
  private config: Required<AdvancedRetryConfig>
  private fibCache: number[] = [1, 1]

  constructor(config: AdvancedRetryConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      retries: config.retries ?? RETRY_CONSTANTS.DEFAULT_MAX_RETRIES,
      delay: config.delay ?? RETRY_CONSTANTS.DEFAULT_DELAY,
      backoff: config.backoff ?? 'exponential',
      backoffStrategy: config.backoffStrategy ?? 'exponential',
      maxDelay: config.maxDelay ?? RETRY_CONSTANTS.DEFAULT_MAX_DELAY,
      jitter: config.jitter ?? RETRY_CONSTANTS.DEFAULT_JITTER,
      polynomialDegree: config.polynomialDegree ?? 2,
      decorrelatedBase: config.decorrelatedBase ?? 3,
      smartRetry: config.smartRetry ?? true,
      retryBudget: config.retryBudget ?? 60000, // 默认1分钟
      retryOn: config.retryOn ?? (() => true),
      errorClassifier: config.errorClassifier ?? defaultErrorClassifier,
      circuitBreaker: config.circuitBreaker,
    }
  }

  /**
   * 计算下一次重试的延迟时间
   */
  calculateDelay(context: RetryContext, error?: any): number {
    const { attempt, elapsedTime, lastDelay } = context
    const baseDelay = this.config.delay

    // 检查重试预算
    if (this.config.retryBudget && elapsedTime >= this.config.retryBudget) {
      return -1 // 超出预算，不再重试
    }

    let delay = 0

    // 根据策略计算延迟
    switch (this.config.backoffStrategy) {
      case 'fixed':
        delay = baseDelay
        break

      case 'exponential':
        delay = baseDelay * Math.pow(2, attempt)
        break

      case 'fibonacci':
        delay = baseDelay * this.getFibonacci(attempt + 1)
        break

      case 'decorrelated':
        // AWS推荐的去相关抖动算法
        delay = Math.min(
          this.config.maxDelay,
          Math.random() * (lastDelay * this.config.decorrelatedBase),
        )
        break

      case 'linear':
        delay = baseDelay * (attempt + 1)
        break

      case 'polynomial':
        delay = baseDelay * Math.pow(attempt + 1, this.config.polynomialDegree)
        break

      default:
        delay = baseDelay
    }

    // 应用最大延迟限制
    if (this.config.maxDelay) {
      delay = Math.min(delay, this.config.maxDelay)
    }

    // 应用抖动
    if (this.config.jitter && this.config.jitter > 0) {
      const jitterRange = delay * this.config.jitter
      const randomJitter = (Math.random() - 0.5) * 2 * jitterRange
      delay = Math.max(0, delay + randomJitter)
    }

    // 智能重试：根据错误类型调整延迟
    if (this.config.smartRetry && error) {
      const errorType = this.config.errorClassifier(error)

      switch (errorType) {
        case 'transient':
          // 瞬时错误（如网络波动），缩短延迟
          delay = delay * 0.5
          break
        case 'permanent':
          // 永久错误（如404），不重试
          return -1
        case 'unknown':
          // 未知错误，使用正常延迟
          break
      }
    }

    // 检查剩余预算
    if (this.config.retryBudget) {
      const remainingBudget = this.config.retryBudget - elapsedTime
      if (delay > remainingBudget) {
        return -1 // 延迟超过剩余预算，不再重试
      }
    }

    return Math.floor(delay)
  }

  /**
   * 判断是否应该重试
   */
  shouldRetry(context: RetryContext, error?: any): boolean {
    if (!this.config.enabled) return false

    // 检查重试次数
    if (context.attempt >= this.config.retries) {
      return false
    }

    // 检查重试预算
    if (this.config.retryBudget && context.elapsedTime >= this.config.retryBudget) {
      return false
    }

    // 智能重试：检查错误类型
    if (this.config.smartRetry && error) {
      const errorType = this.config.errorClassifier(error)
      if (errorType === 'permanent') {
        return false // 永久错误不重试
      }
    }

    // 调用自定义重试判断
    if (this.config.retryOn) {
      return this.config.retryOn(error, context.attempt)
    }

    return true
  }

  /**
   * 获取斐波那契数列第n项
   */
  private getFibonacci(n: number): number {
    if (n < this.fibCache.length) {
      return this.fibCache[n]
    }

    // 计算并缓存
    for (let i = this.fibCache.length; i <= n; i++) {
      this.fibCache[i] = this.fibCache[i - 1] + this.fibCache[i - 2]
    }

    return this.fibCache[n]
  }

  /**
   * 重置斐波那契缓存
   */
  resetFibCache(): void {
    this.fibCache = [1, 1]
  }
}

/**
 * 默认错误分类器
 */
function defaultErrorClassifier(error: any): 'transient' | 'permanent' | 'unknown' {
  // HTTP状态码分类
  if (error.statusCode) {
    const code = error.statusCode

    // 瞬时错误（可重试）
    if ([408, 429, 500, 502, 503, 504].includes(code)) {
      return 'transient'
    }

    // 永久错误（不可重试）
    if ([400, 401, 403, 404, 405, 410].includes(code)) {
      return 'permanent'
    }
  }

  // 错误码分类
  if (error.code) {
    if (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT_ERROR' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT'
    ) {
      return 'transient'
    }

    if (
      error.code === 'VALIDATION_ERROR' ||
      error.code === 'NOT_FOUND' ||
      error.code === 'FORBIDDEN'
    ) {
      return 'permanent'
    }
  }

  return 'unknown'
}

/**
 * 创建重试策略
 */
export function createRetryStrategy(config: AdvancedRetryConfig = {}): AdvancedRetryStrategy {
  return new AdvancedRetryStrategy(config)
}

/**
 * 预定义的重试策略
 */
export const retryStrategies = {
  /**
   * 快速重试（适用于瞬时错误）
   */
  fast: createRetryStrategy({
    retries: 3,
    delay: 100,
    backoffStrategy: 'linear',
    maxDelay: 1000,
    jitter: 0.1,
  }),

  /**
   * 标准重试（适用于一般场景）
   */
  standard: createRetryStrategy({
    retries: 3,
    delay: 1000,
    backoffStrategy: 'exponential',
    maxDelay: 10000,
    jitter: 0.2,
  }),

  /**
   * 激进重试（适用于关键操作）
   */
  aggressive: createRetryStrategy({
    retries: 5,
    delay: 500,
    backoffStrategy: 'fibonacci',
    maxDelay: 30000,
    jitter: 0.3,
    retryBudget: 60000,
  }),

  /**
   * AWS风格重试（去相关抖动）
   */
  aws: createRetryStrategy({
    retries: 3,
    delay: 1000,
    backoffStrategy: 'decorrelated',
    maxDelay: 20000,
    decorrelatedBase: 3,
    jitter: 0.1,
  }),

  /**
   * 温和重试（适用于非关键操作）
   */
  gentle: createRetryStrategy({
    retries: 2,
    delay: 2000,
    backoffStrategy: 'fixed',
    maxDelay: 5000,
    jitter: 0.1,
  }),
}

/**
 * 执行带重试的异步函数
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  strategy: AdvancedRetryStrategy,
): Promise<T> {
  const context: RetryContext = {
    attempt: 0,
    elapsedTime: 0,
    lastDelay: strategy['config'].delay,
    errorHistory: [],
  }

  const startTime = Date.now()

  while (true) {
    try {
      const result = await fn()
      return result
    }
    catch (error) {
      context.errorHistory.push(error)
      context.elapsedTime = Date.now() - startTime

      // 判断是否应该重试
      if (!strategy.shouldRetry(context, error)) {
        throw error
      }

      // 计算延迟
      const delay = strategy.calculateDelay(context, error)
      if (delay < 0) {
        // 延迟为负表示不应重试
        throw error
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay))
      context.lastDelay = delay
      context.attempt++
    }
  }
}


