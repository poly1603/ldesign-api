/**
 * 性能监控工具
 * 提供API调用性能监控、内存使用监控和性能分析功能
 */
/**
 * 性能指标
 */
export interface PerformanceMetrics {
    /** 方法名 */
    methodName: string;
    /** 调用次数 */
    callCount: number;
    /** 总耗时 (毫秒) */
    totalTime: number;
    /** 平均耗时 (毫秒) */
    averageTime: number;
    /** 最小耗时 (毫秒) */
    minTime: number;
    /** 最大耗时 (毫秒) */
    maxTime: number;
    /** 成功次数 */
    successCount: number;
    /** 失败次数 */
    errorCount: number;
    /** 成功率 */
    successRate: number;
    /** 最近调用时间 */
    lastCallTime: number;
}
/**
 * 内存使用信息
 */
export interface MemoryUsage {
    /** 已使用内存 (字节) */
    used: number;
    /** 总内存 (字节) */
    total: number;
    /** 使用率 */
    usage: number;
    /** 垃圾回收次数 */
    gcCount?: number;
}
/**
 * 性能报告
 */
export interface PerformanceReport {
    /** 监控时间范围 */
    timeRange: {
        start: number;
        end: number;
        duration: number;
    };
    /** 总体统计 */
    overall: {
        totalCalls: number;
        totalTime: number;
        averageTime: number;
        errorRate: number;
    };
    /** 各方法性能指标 */
    methods: PerformanceMetrics[];
    /** 内存使用情况 */
    memory: MemoryUsage;
    /** 性能建议 */
    recommendations: string[];
}
/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
    /** 是否启用监控 */
    enabled: boolean;
    /** 是否收集详细指标 */
    collectDetailedMetrics: boolean;
    /** 最大保存的调用记录数 */
    maxRecords: number;
    /** 性能报告生成间隔 (毫秒) */
    reportInterval: number;
    /** 慢查询阈值 (毫秒) */
    slowQueryThreshold: number;
    /** 是否在控制台输出性能警告 */
    logWarnings: boolean;
}
/**
 * 性能监控器
 */
export declare class PerformanceMonitor {
    private config;
    private metrics;
    private callRecords;
    private startTime;
    private reportTimer?;
    constructor(config?: Partial<PerformanceMonitorConfig>);
    /**
     * 开始监控API调用
     */
    startCall(methodName: string, params?: unknown): (error?: Error) => void;
    /**
     * 记录调用结果
     */
    private recordCall;
    /**
     * 更新方法性能指标
     */
    private updateMethodMetrics;
    /**
     * 获取性能指标
     */
    getMetrics(methodName?: string): PerformanceMetrics[];
    /**
     * 获取内存使用情况
     */
    getMemoryUsage(): MemoryUsage;
    /**
     * 生成性能报告
     */
    generateReport(): PerformanceReport;
    /**
     * 生成性能建议
     */
    private generateRecommendations;
    /**
     * 重置统计数据
     */
    reset(): void;
    /**
     * 启动定期报告
     */
    private startReporting;
    /**
     * 销毁监控器
     */
    destroy(): void;
}
/**
 * 获取全局性能监控器
 */
export declare function getGlobalPerformanceMonitor(): PerformanceMonitor | null;
/**
 * 设置全局性能监控器
 */
export declare function setGlobalPerformanceMonitor(monitor: PerformanceMonitor | null): void;
/**
 * 创建性能监控器
 */
export declare function createPerformanceMonitor(config?: Partial<PerformanceMonitorConfig>): PerformanceMonitor;
