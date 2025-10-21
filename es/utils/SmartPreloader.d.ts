/**
 * 智能预加载器 - 基于使用模式预测和预加载数据
 */
export interface PreloadConfig {
    /** 是否启用预加载 */
    enabled: boolean;
    /** 最大预加载项数 */
    maxPreloadItems: number;
    /** 预加载阈值（访问频率） */
    preloadThreshold: number;
    /** 预测算法 */
    algorithm: 'frequency' | 'recency' | 'combined';
    /** 预加载延迟 */
    preloadDelay: number;
}
export interface AccessPattern {
    methodName: string;
    params: unknown;
    count: number;
    lastAccess: number;
    averageInterval: number;
    nextPredicted?: number;
}
/**
 * 智能预加载器
 */
export declare class SmartPreloader {
    private executor;
    private accessHistory;
    private preloadQueue;
    private preloadTimer;
    private config;
    private stats;
    constructor(executor: (methodName: string, params?: unknown) => Promise<any>, config?: Partial<PreloadConfig>);
    /**
     * 记录访问模式
     */
    recordAccess(methodName: string, params?: unknown): void;
    /**
     * 调度预加载分析
     */
    private schedulePreloadAnalysis;
    /**
     * 分析访问模式并预加载
     */
    private analyzeAndPreload;
    /**
     * 预加载单个项
     */
    private preloadItem;
    /**
     * 获取预测候选项
     */
    private getPredictionCandidates;
    /**
     * 基于访问频率的候选项
     */
    private getFrequencyBasedCandidates;
    /**
     * 基于最近访问的候选项
     */
    private getRecencyBasedCandidates;
    /**
     * 综合算法候选项
     */
    private getCombinedCandidates;
    /**
     * 生成缓存键
     */
    private generateKey;
    /**
     * 获取统计信息
     */
    getStats(): {
        hitRate: number;
        predictionAccuracy: number;
        patternCount: number;
        queueSize: number;
        totalAccesses: number;
        preloadedItems: number;
        hits: number;
        misses: number;
        predictions: number;
        accuratePredictions: number;
    };
    /**
     * 清理历史数据
     */
    cleanup(maxAge?: number): void;
    /**
     * 重置预加载器
     */
    reset(): void;
}
/**
 * 缓存预热器
 */
export declare class CacheWarmer {
    private executor;
    private warmupQueue;
    private isWarming;
    private stats;
    constructor(executor: (methodName: string, params?: unknown) => Promise<any>);
    /**
     * 添加预热项
     */
    addWarmupItem(methodName: string, params?: unknown, priority?: number): void;
    /**
     * 批量添加预热项
     */
    addBatchWarmupItems(items: Array<{
        methodName: string;
        params?: unknown;
        priority?: number;
    }>): void;
    /**
     * 执行预热
     */
    warm(options?: {
        concurrent?: number;
        onProgress?: (current: number, total: number) => void;
    }): Promise<void>;
    /**
     * 获取统计信息
     */
    getStats(): {
        successRate: number;
        queueSize: number;
        isWarming: boolean;
        totalWarmed: number;
        successfulWarms: number;
        failedWarms: number;
        warmupTime: number;
    };
    /**
     * 清空预热队列
     */
    clear(): void;
    /**
     * 重置预热器
     */
    reset(): void;
}
