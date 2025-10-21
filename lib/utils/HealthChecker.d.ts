/**
 * API Engine 健康检查器
 * 提供系统健康状态监控和诊断功能
 */
export interface HealthCheckConfig {
    /** 是否启用 */
    enabled?: boolean;
    /** 检查间隔（毫秒） */
    interval?: number;
    /** 超时阈值（毫秒） */
    timeoutThreshold?: number;
    /** 错误率阈值（0-1） */
    errorRateThreshold?: number;
    /** 内存使用阈值（字节） */
    memoryThreshold?: number;
}
export interface HealthStatus {
    /** 健康状态 */
    status: 'healthy' | 'degraded' | 'unhealthy';
    /** 检查时间 */
    timestamp: number;
    /** 详细信息 */
    details: {
        /** 平均响应时间 */
        avgResponseTime: number;
        /** 错误率 */
        errorRate: number;
        /** 内存使用情况 */
        memoryUsage: number;
        /** 活跃请求数 */
        activeRequests: number;
        /** 缓存命中率 */
        cacheHitRate: number;
    };
    /** 问题列表 */
    issues: Array<{
        severity: 'warning' | 'critical';
        message: string;
        metric: string;
        value: number;
        threshold: number;
    }>;
}
export interface HealthMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalResponseTime: number;
    activeRequests: number;
    cacheHits: number;
    cacheMisses: number;
}
/**
 * 健康检查器实现
 */
export declare class HealthChecker {
    private config;
    private metrics;
    private checkTimer;
    private lastStatus;
    private listeners;
    constructor(config?: HealthCheckConfig);
    /**
     * 记录请求开始
     */
    requestStart(): void;
    /**
     * 记录请求成功
     */
    requestSuccess(responseTime: number): void;
    /**
     * 记录请求失败
     */
    requestFailure(responseTime: number): void;
    /**
     * 记录缓存命中
     */
    cacheHit(): void;
    /**
     * 记录缓存未命中
     */
    cacheMiss(): void;
    /**
     * 执行健康检查
     */
    check(): HealthStatus;
    /**
     * 获取最后的健康状态
     */
    getLastStatus(): HealthStatus | null;
    /**
     * 添加状态变化监听器
     */
    onStatusChange(listener: (status: HealthStatus) => void): () => void;
    /**
     * 通知所有监听器
     */
    private notifyListeners;
    /**
     * 启动健康检查
     */
    private startHealthCheck;
    /**
     * 停止健康检查
     */
    stopHealthCheck(): void;
    /**
     * 重置统计数据
     */
    resetMetrics(): void;
    /**
     * 获取当前指标
     */
    getMetrics(): HealthMetrics;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<HealthCheckConfig>): void;
    /**
     * 估算内存使用（简化版）
     */
    private estimateMemoryUsage;
    /**
     * 生成健康报告
     */
    generateReport(): {
        summary: string;
        status: HealthStatus;
        recommendations: string[];
    };
    /**
     * 销毁健康检查器
     */
    destroy(): void;
}
/**
 * 创建健康检查器
 */
export declare function createHealthChecker(config?: HealthCheckConfig): HealthChecker;
