/**
 * 重试策略实现
 *
 * 提供灵活的重试机制，支持指数退避、抖动等策略
 */

import { delay } from '../utils/timing'

/**
 * 重试上下文
 */
export interface RetryContext {
  /** 当前重试次数（从 0 开始） */
  attempt: number
  /** 上一次的错误 */
  error: Error
  /** 总共已用时间（毫秒） */
  elapsedTime: number
  /** 开始时间戳 */
  startTime: number
}

/**
 * 重试结果
 */
export interface RetryResult<T> {
  /** 是否成功 */
  success: boolean
  /** 成功时的数据 */
  data?: T
  /** 失败时的错误 */
  error?: Error
  /** 重试次数 */
  attempts: number
  /** 总耗时（毫秒） */
  totalTime: number
}

/**
 * 是否应该重试的判断函数
 */
export type ShouldRetryFn = (context: RetryContext) => boolean | Promise<boolean>

/**
 * 重试时的回调函数
 */
export type OnRetryFn = (context: RetryContext) => void | Promise<void>

/**
 * 延迟时间计算函数
 */
export type DelayFn = (attempt: number, context: RetryContext) => number

/**
 * 重试选项
 */
export interface RetryOptions {
  /** 最大重试次数，默认 3 */
  maxRetries?: number
  /** 初始延迟（毫秒），默认 1000 */
  initialDelay?: number
  /** 最大延迟（毫秒），默认 30000 */
  maxDelay?: number
  /** 退避因子（指数退避时使用），默认 2 */
  backoffFactor?: number
  /** 是否添加随机抖动，默认 true */
  jitter?: boolean
  /** 抖动因子（0-1），默认 0.1 */
  jitterFactor?: number
  /** 总超时时间（毫秒），可选 */
  timeout?: number
  /** 自定义是否重试的判断函数 */
  shouldRetry?: ShouldRetryFn
  /** 重试时的回调函数 */
  onRetry?: OnRetryFn
  /** 自定义延迟计算函数 */
  delayFn?: DelayFn
  /** 应该重试的错误类型 */
  retryableErrors?: Array<new (...args: unknown[]) => Error>
  /** 应该重试的 HTTP 状态码 */
  retryableStatuses?: number[]
}

/**
 * 默认应该重试的 HTTP 状态码
 */
const DEFAULT_RETRYABLE_STATUSES = [
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]

/**
 * 重试策略类
 *
 * @example
 * ```typescript
 * const retry = new RetryStrategy({
 *   maxRetries: 3,
 *   initialDelay: 1000,
 *   backoffFactor: 2,
 *   jitter: true
 * })
 *
 * const result = await retry.execute(async () => {
 *   const response = await fetch('/api/data')
 *   if (!response.ok) throw new Error('Request failed')
 *   return response.json()
 * })
 *
 * if (result.success) {
 *   console.log('Data:', result.data)
 * } else {
 *   console.error('Failed after', result.attempts, 'attempts:', result.error)
 * }
 * ```
 */
export class RetryStrategy {
  private readonly maxRetries: number
  private readonly initialDelay: number
  private readonly maxDelay: number
  private readonly backoffFactor: number
  private readonly jitter: boolean
  private readonly jitterFactor: number
  private readonly timeout?: number
  private readonly shouldRetry?: ShouldRetryFn
  private readonly onRetry?: OnRetryFn
  private readonly delayFn?: DelayFn
  private readonly retryableStatuses: Set<number>

  constructor(options: RetryOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3
    this.initialDelay = options.initialDelay ?? 1000
    this.maxDelay = options.maxDelay ?? 30000
    this.backoffFactor = options.backoffFactor ?? 2
    this.jitter = options.jitter ?? true
    this.jitterFactor = options.jitterFactor ?? 0.1
    this.timeout = options.timeout
    this.shouldRetry = options.shouldRetry
    this.onRetry = options.onRetry
    this.delayFn = options.delayFn
    this.retryableStatuses = new Set(
      options.retryableStatuses ?? DEFAULT_RETRYABLE_STATUSES
    )
  }

  /**
   * 执行带重试的操作
   *
   * @param fn - 要执行的异步函数
   * @returns 重试结果
   */
  async execute<T>(fn: () => Promise<T>): Promise<RetryResult<T>> {
    const startTime = Date.now()
    let lastError: Error | undefined
    let attempt = 0

    while (attempt <= this.maxRetries) {
      try {
        const data = await fn()
        return {
          success: true,
          data,
          attempts: attempt + 1,
          totalTime: Date.now() - startTime,
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        const context: RetryContext = {
          attempt,
          error: lastError,
          elapsedTime: Date.now() - startTime,
          startTime,
        }

        // 检查是否超时
        if (this.timeout && context.elapsedTime >= this.timeout) {
          break
        }

        // 检查是否已达到最大重试次数
        if (attempt >= this.maxRetries) {
          break
        }

        // 检查是否应该重试
        const shouldRetry = await this.checkShouldRetry(context)
        if (!shouldRetry) {
          break
        }

        // 执行重试回调
        if (this.onRetry) {
          await this.onRetry(context)
        }

        // 计算延迟时间
        const delayTime = this.calculateDelay(attempt, context)

        // 检查延迟后是否会超时
        if (this.timeout && context.elapsedTime + delayTime >= this.timeout) {
          break
        }

        // 等待
        await delay(delayTime)
        attempt++
      }
    }

    return {
      success: false,
      error: lastError ?? new Error('Unknown error'),
      attempts: attempt + 1,
      totalTime: Date.now() - startTime,
    }
  }

  /**
   * 包装函数，使其具有重试能力
   *
   * @param fn - 要包装的函数
   * @returns 包装后的函数
   */
  wrap<TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => Promise<TResult>
  ): (...args: TArgs) => Promise<RetryResult<TResult>> {
    return (...args: TArgs) => this.execute(() => fn(...args))
  }

  /**
   * 检查是否应该重试
   */
  private async checkShouldRetry(context: RetryContext): Promise<boolean> {
    // 使用自定义判断函数
    if (this.shouldRetry) {
      return this.shouldRetry(context)
    }

    // 默认判断逻辑
    return this.isRetryableError(context.error)
  }

  /**
   * 判断错误是否可重试
   */
  private isRetryableError(error: Error): boolean {
    // 检查是否有状态码
    const status = (error as { status?: number }).status

    if (status !== undefined) {
      return this.retryableStatuses.has(status)
    }

    // 检查是否为网络错误
    if (this.isNetworkError(error)) {
      return true
    }

    // 检查错误消息
    const message = error.message.toLowerCase()
    const retryableMessages = [
      'network',
      'timeout',
      'econnreset',
      'econnrefused',
      'enotfound',
      'socket hang up',
    ]

    return retryableMessages.some(msg => message.includes(msg))
  }

  /**
   * 判断是否为网络错误
   */
  private isNetworkError(error: Error): boolean {
    const errorName = error.name.toLowerCase()
    const networkErrors = ['networkerror', 'typeerror', 'aborterror']

    return networkErrors.includes(errorName)
  }

  /**
   * 计算延迟时间
   */
  private calculateDelay(attempt: number, context: RetryContext): number {
    // 使用自定义延迟函数
    if (this.delayFn) {
      return this.delayFn(attempt, context)
    }

    // 指数退避
    let delayTime = this.initialDelay * Math.pow(this.backoffFactor, attempt)

    // 添加抖动
    if (this.jitter) {
      const jitterRange = delayTime * this.jitterFactor
      const jitterValue = (Math.random() * 2 - 1) * jitterRange
      delayTime += jitterValue
    }

    // 限制最大延迟
    return Math.min(Math.max(0, delayTime), this.maxDelay)
  }
}

/**
 * 创建重试策略
 *
 * @param options - 重试选项
 * @returns 重试策略实例
 */
export function createRetryStrategy(options?: RetryOptions): RetryStrategy {
  return new RetryStrategy(options)
}

/**
 * 使用重试执行异步操作（便捷函数）
 *
 * @param fn - 要执行的异步函数
 * @param options - 重试选项
 * @returns 重试结果
 *
 * @example
 * ```typescript
 * const result = await retryAsync(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * )
 * ```
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<RetryResult<T>> {
  const strategy = createRetryStrategy(options)
  return strategy.execute(fn)
}
