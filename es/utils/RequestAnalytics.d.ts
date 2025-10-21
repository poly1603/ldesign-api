/**
 * 请求统计和分析
 * 提供详细的请求统计、性能分析和异常监控
 */
/**
 * 请求记录
 */
export interface RequestRecord {
    /** 请求ID */
    id: string;
    /** 方法名 */
    methodName: string;
    /** 开始时间 */
    startTime: number;
    /** 结束时间 */
    endTime?: number;
    /** 持续时间（毫秒） */
    duration?: number;
    /** 状态 */
    status: 'pending' | 'success' | 'error' | 'cancelled';
    /** 错误信息 */
    error?: string;
    /** 是否来自缓存 */
    fromCache?: boolean;
    /** 重试次数 */
    retryCount?: number;
    /** 请求大小（字节） */
    requestSize?: number;
    /** 响应大小（字节） */
    responseSize?: number;
}
/**
 * 方法统计
 */
export interface MethodStats {
    /** 方法名 */
    methodName: string;
    /** 总请求数 */
    totalRequests: number;
    /** 成功请求数 */
    successRequests: number;
    /** 失败请求数 */
    errorRequests: number;
    /** 取消请求数 */
    cancelledRequests: number;
    /** 缓存命中数 */
    cacheHits: number;
    /** 平均响应时间（毫秒） */
    averageResponseTime: number;
    /** 最小响应时间（毫秒） */
    minResponseTime: number;
    /** 最大响应时间（毫秒） */
    maxResponseTime: number;
    /** 成功率 */
    successRate: number;
    /** 最后请求时间 */
    lastRequestTime: number;
}
/**
 * 请求分析配置
 */
export interface RequestAnalyticsConfig {
    /** 是否启用 */
    enabled?: boolean;
    /** 最大记录数 */
    maxRecords?: number;
    /** 记录保留时间（毫秒） */
    recordRetention?: number;
    /** 是否记录请求详情 */
    recordDetails?: boolean;
    /** 自动清理间隔（毫秒） */
    cleanupInterval?: number;
}
/**
 * 请求分析器
 */
export declare class RequestAnalytics {
    private config;
    private records;
    private methodStats;
    private cleanupTimer?;
    constructor(config?: RequestAnalyticsConfig);
    /**
     * 开始记录请求
     */
    startRequest(id: string, methodName: string): void;
    /**
     * 结束请求（成功）
     */
    endRequest(id: string, options?: {
        fromCache?: boolean;
        retryCount?: number;
        requestSize?: number;
        responseSize?: number;
    }): void;
    /**
     * 结束请求（失败）
     */
    endRequestWithError(id: string, error: string): void;
    /**
     * 取消请求
     */
    cancelRequest(id: string): void;
    /**
     * 获取方法统计
     */
    getMethodStats(methodName: string): MethodStats | null;
    /**
     * 获取所有方法统计
     */
    getAllMethodStats(): MethodStats[];
    /**
     * 获取总体统计
     */
    getOverallStats(): {
        totalRequests: number;
        successRequests: number;
        errorRequests: number;
        cancelledRequests: number;
        cacheHits: number;
        averageResponseTime: number;
        successRate: number;
    };
    /**
     * 获取最慢的请求
     */
    getSlowestRequests(limit?: number): RequestRecord[];
    /**
     * 获取失败的请求
     */
    getFailedRequests(limit?: number): RequestRecord[];
    /**
     * 清除统计数据
     */
    clear(): void;
    /**
     * 销毁分析器
     */
    destroy(): void;
    /**
     * 查找记录
     */
    private findRecord;
    /**
     * 更新响应时间统计
     */
    private updateResponseTimeStats;
    /**
     * 更新成功率
     */
    private updateSuccessRate;
    /**
     * 启动清理
     */
    private startCleanup;
    /**
     * 清理过期记录
     */
    private cleanup;
}
/**
 * 创建请求分析器
 */
export declare function createRequestAnalytics(config?: RequestAnalyticsConfig): RequestAnalytics;
