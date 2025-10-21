/**
 * 请求重复检测工具
 * 检测和防止短时间内的重复请求
 */
/**
 * 重复检测配置
 */
export interface DuplicateDetectorConfig {
    /** 检测时间窗口（毫秒） */
    timeWindow?: number;
    /** 时间窗口内允许的最大重复次数 */
    maxDuplicates?: number;
    /** 是否启用 */
    enabled?: boolean;
    /** 是否自动清理过期记录 */
    autoCleanup?: boolean;
    /** 清理间隔（毫秒） */
    cleanupInterval?: number;
}
/**
 * 重复检测统计
 */
export interface DuplicateStats {
    /** 总请求数 */
    totalRequests: number;
    /** 重复请求数 */
    duplicateRequests: number;
    /** 被阻止的请求数 */
    blockedRequests: number;
    /** 当前追踪的请求数 */
    trackedRequests: number;
    /** 重复率 */
    duplicateRate: number;
}
/**
 * 请求重复检测器
 */
export declare class DuplicateDetector {
    private config;
    private records;
    private stats;
    private cleanupTimer;
    constructor(config?: DuplicateDetectorConfig);
    /**
     * 检测请求是否重复
     */
    isDuplicate(key: string): boolean;
    /**
     * 标记请求完成
     */
    markComplete(_key: string): void;
    /**
     * 清除指定请求记录
     */
    clear(key: string): void;
    /**
     * 清除所有记录
     */
    clearAll(): void;
    /**
     * 获取统计信息
     */
    getStats(): DuplicateStats;
    /**
     * 重置统计
     */
    resetStats(): void;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<DuplicateDetectorConfig>): void;
    /**
     * 启动自动清理
     */
    private startCleanup;
    /**
     * 停止自动清理
     */
    private stopCleanup;
    /**
     * 清理过期记录
     */
    private cleanup;
    /**
     * 销毁检测器
     */
    destroy(): void;
}
/**
 * 创建重复检测器
 */
export declare function createDuplicateDetector(config?: DuplicateDetectorConfig): DuplicateDetector;
/**
 * 获取全局重复检测器
 */
export declare function getGlobalDuplicateDetector(): DuplicateDetector;
/**
 * 设置全局重复检测器
 */
export declare function setGlobalDuplicateDetector(detector: DuplicateDetector): void;
/**
 * 便捷函数：检测重复
 */
export declare function checkDuplicate(key: string): boolean;
