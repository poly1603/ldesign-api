/**
 * 智能重试策略插件
 * 根据错误类型自动选择重试策略
 */
import type { ApiPlugin } from '../types';
export interface SmartRetryOptions {
    /** 最大重试次数 */
    maxRetries?: number;
    /** 初始延迟（毫秒） */
    initialDelay?: number;
    /** 最大延迟（毫秒） */
    maxDelay?: number;
    /** 退避策略 */
    backoffStrategy?: 'exponential' | 'linear' | 'fibonacci';
    /** 抖动比例 (0-1) */
    jitter?: number;
    /** 自定义重试条件 */
    retryCondition?: (error: any, attempt: number) => boolean;
    /** 重试回调 */
    onRetry?: (attempt: number, error: any, delay: number) => void;
    /** 是否启用 */
    enabled?: boolean;
}
/**
 * 创建智能重试插件
 */
export declare function createSmartRetryPlugin(options?: SmartRetryOptions): ApiPlugin;
