/**
 * 去重管理器
 * 提供请求去重功能，避免重复的API调用
 */
import type { DeduplicationManager } from '../types';
/**
 * 去重管理器实现
 */
export declare class DeduplicationManagerImpl implements DeduplicationManager {
    /** 去重项映射 */
    private deduplicationItems;
    /** 清理定时器 */
    private cleanupTimer;
    constructor();
    /**
     * 执行去重函数
     */
    execute<T>(key: string, fn: () => Promise<T>): Promise<T>;
    /**
     * 清除去重缓存
     */
    clear(): void;
    /**
     * 清除指定键的去重缓存
     */
    clearKey(key: string): void;
    /**
     * 获取去重项数量
     */
    size(): number;
    /**
     * 检查是否存在去重项
     */
    has(key: string): boolean;
    /**
     * 获取所有去重键
     */
    keys(): string[];
    /**
     * 获取去重项信息
     */
    getInfo(key: string): {
        createdAt: number;
        refCount: number;
        age: number;
    } | null;
    /**
     * 获取所有去重项信息
     */
    getAllInfo(): Array<{
        key: string;
        createdAt: number;
        refCount: number;
        age: number;
    }>;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalItems: number;
        totalRefCount: number;
        averageRefCount: number;
        oldestItemAge: number;
    };
    /**
     * 销毁管理器
     */
    destroy(): void;
    /**
     * 创建去重的 Promise
     */
    private createDeduplicatedPromise;
    /**
     * 启动清理定时器
     */
    private startCleanupTimer;
    /**
     * 清理过期的去重项
     */
    private cleanup;
    /**
     * 清理过早的去重项
     */
    private cleanupStale;
}
/**
 * 创建去重函数
 */
export declare function createDeduplicatedFunction<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, keyGenerator?: (...args: Parameters<T>) => string): T;
/**
 * 去重装饰器
 */
export declare function deduplicate(keyGenerator?: (...args: unknown[]) => string): <T extends (...args: unknown[]) => Promise<unknown>>(target: {
    constructor: {
        name: string;
    };
}, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
/**
 * 基于类的去重装饰器
 */
export declare function classBasedDeduplicate<T extends (...args: unknown[]) => Promise<unknown>>(keyGenerator?: (...args: Parameters<T>) => string): (target: unknown, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
/**
 * 全局去重管理器实例
 */
export declare const globalDeduplicationManager: DeduplicationManagerImpl;
/**
 * 使用全局去重管理器的便捷函数
 */
export declare function deduplicateGlobally<T>(key: string, fn: () => Promise<T>): Promise<T>;
