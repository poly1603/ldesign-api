/**
 * 简易请求队列管理器
 * - 支持并发上限
 * - 支持优先级（数值越大优先级越高）
 * - 支持最大排队长度
 */
export interface RequestQueueConfig {
    enabled?: boolean;
    concurrency?: number;
    maxQueue?: number;
}
export declare class RequestQueueManager {
    private config;
    private running;
    private queue;
    private idSeq;
    constructor(config: Required<RequestQueueConfig>);
    updateConfig(config: Partial<RequestQueueConfig>): void;
    enqueue<T>(fn: () => Promise<T>, priority?: number): Promise<T>;
    /**
     * 二分查找插入位置（优化版）
     * 按优先级降序，同优先级按 ID 升序（FIFO）
     */
    private findInsertIndex;
    private pump;
    size(): {
        running: number;
        queued: number;
        concurrency: number;
    };
    /**
     * 清空队列（优化版：拒绝所有待处理任务，防止内存泄漏）
     */
    clear(): void;
    /**
     * 销毁队列管理器
     */
    destroy(): void;
}
