/**
 * 高性能LRU缓存实现
 * 使用双向链表 + HashMap 实现O(1)的get/set操作
 */
/**
 * LRU缓存配置
 */
export interface LRUCacheConfig {
    /** 最大缓存数量 */
    maxSize: number;
    /** 默认TTL (毫秒) */
    defaultTTL: number;
    /** 是否启用 */
    enabled: boolean;
    /** 过期检查间隔 (毫秒) */
    cleanupInterval?: number;
}
/**
 * LRU缓存统计信息
 */
export interface LRUCacheStats {
    /** 缓存命中次数 */
    hits: number;
    /** 缓存未命中次数 */
    misses: number;
    /** 当前缓存项数量 */
    size: number;
    /** 最大缓存数量 */
    maxSize: number;
    /** 命中率 */
    hitRate: number;
    /** 过期清理次数 */
    evictions: number;
    /** 内存使用估算 (字节) */
    memoryUsage: number;
}
/**
 * 高性能LRU缓存
 */
export declare class LRUCache<T = unknown> {
    private cache;
    private head;
    private tail;
    private config;
    private stats;
    private lastCalculatedSize;
    private cleanupTimer?;
    constructor(config: LRUCacheConfig);
    /**
     * 获取缓存值
     */
    get(key: string): T | null;
    /**
     * 设置缓存值
     */
    set(key: string, value: T, ttl?: number): void;
    /**
     * 删除缓存项
     */
    delete(key: string): boolean;
    /**
     * 清空缓存
     */
    clear(): void;
    /**
     * 检查是否存在
     */
    has(key: string): boolean;
    /**
     * 获取所有键
     */
    keys(): string[];
    /**
     * 获取缓存统计信息
     */
    getStats(): LRUCacheStats;
    /**
     * 批量设置
     */
    setMany(entries: Array<{
        key: string;
        value: T;
        ttl?: number;
    }>): void;
    /**
     * 批量获取
     */
    getMany(keys: string[]): Map<string, T>;
    /**
     * 预热缓存
     */
    warmup(entries: Array<{
        key: string;
        value: T;
        ttl?: number;
    }>): void;
    /**
     * 移动节点到头部
     */
    private moveToHead;
    /**
     * 添加节点到头部
     */
    private addToHead;
    /**
     * 移除节点
     */
    private removeNode;
    /**
     * 淘汰最少使用的节点
     */
    private evictLRU;
    /**
     * 更新内存使用估算（优化版：增量更新而非全量计算）
     */
    private updateMemoryUsage;
    /**
     * 估算值的内存大小（优化版：使用WeakMap缓存避免重复计算）
     */
    private estimateValueSize;
    /**
     * 启动定期清理
     */
    private startCleanup;
    /**
     * 清理过期项（优化版：直接删除，减少临时数组分配）
     */
    private cleanupExpired;
    /**
     * 销毁缓存
     */
    destroy(): void;
}
