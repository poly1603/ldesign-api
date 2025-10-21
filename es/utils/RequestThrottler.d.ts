/**
 * 请求节流器 - 使用令牌桶算法
 * 提供精确的请求速率控制
 */
export interface ThrottlerConfig {
    /** 是否启用 */
    enabled?: boolean;
    /** 每秒允许的请求数 */
    requestsPerSecond?: number;
    /** 最大突发请求数 */
    maxBurst?: number;
    /** 令牌补充速率（毫秒） */
    refillRate?: number;
}
export interface ThrottlerStats {
    /** 当前令牌数 */
    currentTokens: number;
    /** 最大令牌数 */
    maxTokens: number;
    /** 总请求数 */
    totalRequests: number;
    /** 被限流的请求数 */
    throttledRequests: number;
    /** 等待中的请求数 */
    pendingRequests: number;
}
/**
 * 令牌桶实现的请求节流器
 */
export declare class RequestThrottler {
    private tokens;
    private lastRefillTime;
    private readonly config;
    private pendingQueue;
    private stats;
    private refillTimer;
    constructor(config?: ThrottlerConfig);
    /**
     * 获取执行权限（消耗一个令牌）
     */
    acquire(): Promise<void>;
    /**
     * 执行带节流的函数
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * 补充令牌
     */
    private refill;
    /**
     * 处理等待队列
     */
    private processPendingQueue;
    /**
     * 启动令牌补充定时器
     */
    private startRefillTimer;
    /**
     * 获取当前统计信息
     */
    getStats(): ThrottlerStats;
    /**
     * 重置节流器
     */
    reset(): void;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<ThrottlerConfig>): void;
    /**
     * 清理等待队列中超时的请求
     */
    clearStaleRequests(timeout?: number): void;
    /**
     * 销毁节流器
     */
    destroy(): void;
}
/**
 * 创建请求节流器
 */
export declare function createRequestThrottler(config?: ThrottlerConfig): RequestThrottler;
