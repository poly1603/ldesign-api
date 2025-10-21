/**
 * 智能缓存策略管理器
 * 基于访问频率和模式自动调整缓存策略
 */
/**
 * 缓存项访问统计
 */
interface CacheAccessStats {
    /** 访问次数 */
    accessCount: number;
    /** 最后访问时间 */
    lastAccessTime: number;
    /** 首次访问时间 */
    firstAccessTime: number;
    /** 平均访问间隔 */
    averageInterval: number;
    /** 访问时间戳列表（最近10次） */
    accessTimestamps: number[];
}
/**
 * 智能缓存策略配置
 */
export interface SmartCacheStrategyConfig {
    /** 是否启用 */
    enabled?: boolean;
    /** 最小访问次数阈值（低于此值的项优先淘汰） */
    minAccessThreshold?: number;
    /** 热点数据TTL倍数（访问频繁的数据缓存时间更长） */
    hotDataTTLMultiplier?: number;
    /** 冷数据TTL倍数（访问不频繁的数据缓存时间更短） */
    coldDataTTLMultiplier?: number;
    /** 统计窗口大小（保留最近N次访问记录） */
    statsWindowSize?: number;
    /** 自动调整间隔（毫秒） */
    autoAdjustInterval?: number;
}
/**
 * 缓存优先级
 */
export declare enum CachePriority {
    /** 低优先级 - 优先淘汰 */
    LOW = 1,
    /** 普通优先级 */
    NORMAL = 2,
    /** 高优先级 - 热点数据 */
    HIGH = 3,
    /** 最高优先级 - 永不淘汰 */
    CRITICAL = 4
}
/**
 * 智能缓存策略管理器
 */
export declare class SmartCacheStrategy {
    private config;
    private accessStats;
    private priorityMap;
    private adjustTimer?;
    constructor(config?: SmartCacheStrategyConfig);
    /**
     * 记录访问
     */
    recordAccess(key: string): void;
    /**
     * 获取建议的TTL
     */
    getSuggestedTTL(key: string, baseTTL: number): number;
    /**
     * 获取缓存优先级
     */
    getPriority(key: string): CachePriority;
    /**
     * 设置缓存优先级
     */
    setPriority(key: string, priority: CachePriority): void;
    /**
     * 获取访问统计
     */
    getAccessStats(key: string): CacheAccessStats | null;
    /**
     * 获取所有统计信息
     */
    getAllStats(): Map<string, CacheAccessStats>;
    /**
     * 获取热点数据列表
     */
    getHotKeys(limit?: number): string[];
    /**
     * 获取冷数据列表
     */
    getColdKeys(limit?: number): string[];
    /**
     * 清理统计信息
     */
    clearStats(key?: string): void;
    /**
     * 销毁策略管理器
     */
    destroy(): void;
    /**
     * 调整缓存优先级
     */
    private adjustPriority;
    /**
     * 启动自动调整
     */
    private startAutoAdjust;
    /**
     * 执行自动调整
     */
    private performAutoAdjust;
}
/**
 * 创建智能缓存策略
 */
export declare function createSmartCacheStrategy(config?: SmartCacheStrategyConfig): SmartCacheStrategy;
export {};
