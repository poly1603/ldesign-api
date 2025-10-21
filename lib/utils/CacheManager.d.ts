/**
 * 缓存管理器
 * 提供内存、localStorage、sessionStorage 等多种缓存策略
 */
import type { CacheConfig, CacheStats } from '../types';
/**
 * 缓存管理器实现
 */
export declare class CacheManager {
    private storage;
    private lruCache?;
    private config;
    private stats;
    private cleanupTimer;
    constructor(config: CacheConfig);
    /**
     * 获取缓存数据
     */
    get<T = unknown>(key: string): T | null;
    /**
     * 设置缓存数据
     */
    set<T = unknown>(key: string, data: T, ttl?: number): void;
    /**
     * 删除缓存数据
     */
    remove(key: string): void;
    /**
     * 清除所有缓存
     */
    clear(): void;
    /**
     * 根据模式清除缓存
     */
    clearByPattern(pattern: RegExp): void;
    /**
     * 获取缓存统计信息
     */
    getStats(): CacheStats;
    /**
     * 获取所有缓存键
     */
    keys(): string[];
    /**
     * 确保缓存大小不超过限制
     */
    private ensureCacheSize;
    /**
     * 更新统计信息（优化版：增量更新，避免频繁全量计算）
     */
    private lastStatsUpdate;
    private readonly statsUpdateInterval;
    private updateStats;
    /**
     * 启动清理定时器
     */
    private startCleanupTimer;
    /**
     * 清理过期缓存项（优化版：批量处理，减少重复调用）
     */
    private cleanupExpiredItems;
    /**
     * 批量设置缓存
     */
    setMany<T = unknown>(entries: Array<{
        key: string;
        data: T;
        ttl?: number;
    }>): void;
    /**
     * 批量获取缓存
     */
    getMany<T = unknown>(keys: string[]): Map<string, T>;
    /**
     * 预热缓存
     */
    warmup<T = unknown>(entries: Array<{
        key: string;
        data: T;
        ttl?: number;
    }>): void;
    /**
     * 检查缓存是否存在
     */
    has(key: string): boolean;
    /**
     * 获取增强的缓存统计信息
     */
    getEnhancedStats(): CacheStats & {
        lruStats?: any;
    };
    /**
     * 销毁缓存管理器，清理定时器
     */
    destroy(): void;
}
