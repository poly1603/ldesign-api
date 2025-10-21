/**
 * 请求速率限制插件（令牌桶）
 */
import type { ApiPlugin } from '../types';
export interface RateLimitPluginOptions {
    /** 每秒请求数（默认 10） */
    requestsPerSecond?: number;
    /** 最大突发请求数（默认等于 requestsPerSecond） */
    maxBurst?: number;
    /** 是否启用限流（默认 true） */
    enabled?: boolean;
    /** 分桶策略：按方法名或自定义键进行分桶（默认方法名） */
    bucketKey?: (methodName: string) => string;
}
export declare function createRateLimitPlugin(options?: RateLimitPluginOptions): ApiPlugin;
