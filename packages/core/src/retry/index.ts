/**
 * 重试模块
 *
 * 提供请求重试策略和失败恢复功能
 *
 * @module @ldesign/api-core/retry
 */

export { RetryStrategy, createRetryStrategy } from './RetryStrategy'
export type {
  RetryOptions,
  RetryContext,
  RetryResult,
  ShouldRetryFn,
  OnRetryFn,
  DelayFn,
} from './RetryStrategy'
