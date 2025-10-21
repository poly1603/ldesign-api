/**
 * 请求批处理器 - 将多个请求合并为一个批量请求
 */
export interface BatchConfig {
    /** 批量大小 */
    maxBatchSize: number;
    /** 批处理延迟(毫秒) */
    batchDelay: number;
    /** 是否启用 */
    enabled: boolean;
}
export interface BatchRequest {
    id: string;
    method: string;
    params?: unknown;
    resolve: (result: any) => void;
    reject: (error: any) => void;
    timestamp: number;
}
/**
 * 请求批处理器
 */
export declare class RequestBatcher {
    private pendingRequests;
    private batchTimers;
    private config;
    private stats;
    constructor(config?: Partial<BatchConfig>);
    /**
     * 添加请求到批处理队列
     */
    add<T>(batchKey: string, requestId: string, method: string, params?: unknown, batchExecutor?: (requests: BatchRequest[]) => Promise<Map<string, any>>): Promise<T>;
    /**
     * 调度批处理执行
     */
    private scheduleBatch;
    /**
     * 执行批处理
     */
    private executeBatch;
    /**
     * 获取统计信息
     */
    getStats(): {
        pendingBatches: number;
        scheduledBatches: number;
        efficiency: number;
        totalRequests: number;
        batchedRequests: number;
        batchCount: number;
        averageBatchSize: number;
    };
    /**
     * 清空所有待处理的批次
     */
    clear(): void;
    /**
     * 强制执行所有待处理的批次
     */
    flush(executor?: (requests: BatchRequest[]) => Promise<Map<string, any>>): Promise<void>;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<BatchConfig>): void;
}
/**
 * GraphQL 请求合并器
 */
export declare class GraphQLBatcher {
    private batcher;
    constructor(config?: Partial<BatchConfig>);
    /**
     * 添加 GraphQL 查询到批处理
     */
    addQuery<T>(query: string, variables?: Record<string, any>, executor?: (queries: Array<{
        query: string;
        variables?: Record<string, any>;
    }>) => Promise<any[]>): Promise<T>;
    /**
     * 生成请求ID
     */
    private generateRequestId;
    /**
     * 获取统计信息
     */
    getStats(): {
        pendingBatches: number;
        scheduledBatches: number;
        efficiency: number;
        totalRequests: number;
        batchedRequests: number;
        batchCount: number;
        averageBatchSize: number;
    };
    /**
     * 清空批处理器
     */
    clear(): void;
}
/**
 * REST API 请求合并器
 */
export declare class RestBatcher {
    private batcher;
    constructor(config?: Partial<BatchConfig>);
    /**
     * 添加 REST 请求到批处理
     */
    addRequest<T>(url: string, method: string, data?: unknown, executor?: (requests: Array<{
        url: string;
        method: string;
        data?: unknown;
    }>) => Promise<any[]>): Promise<T>;
    /**
     * 获取批次键（相同端点的请求批量处理）
     */
    private getBatchKey;
    /**
     * 获取统计信息
     */
    getStats(): {
        pendingBatches: number;
        scheduledBatches: number;
        efficiency: number;
        totalRequests: number;
        batchedRequests: number;
        batchCount: number;
        averageBatchSize: number;
    };
    /**
     * 清空批处理器
     */
    clear(): void;
}
