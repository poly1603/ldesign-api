/**
 * 防抖管理器
 * 提供防抖功能，避免频繁的API调用
 */
import type { DebounceManager } from '../types';
/**
 * 防抖管理器实现
 */
export declare class DebounceManagerImpl implements DebounceManager {
    /** 防抖项映射 */
    private debounceItems;
    /** 最大防抖项数量 */
    private readonly maxItems;
    /** 自动清理定时器 */
    private cleanupTimer;
    constructor();
    /**
     * 执行防抖函数
     */
    execute<T>(key: string, fn: () => Promise<T>, delay: number): Promise<T>;
    /**
     * 取消防抖
     */
    cancel(key: string): void;
    /**
     * 清除所有防抖
     */
    clear(): void;
    /**
     * 获取防抖项数量
     */
    size(): number;
    /**
     * 检查是否存在防抖项
     */
    has(key: string): boolean;
    /**
     * 获取所有防抖键
     */
    keys(): string[];
    /**
     * 立即执行防抖函数（跳过延迟）
     */
    flush<T>(key: string): Promise<T | undefined>;
    /**
     * 立即执行所有防抖函数
     */
    flushAll(): Promise<void>;
    /**
     * 获取防抖项信息
     */
    getInfo(key: string): {
        createdAt: number;
        delay: number;
    } | null;
    /**
     * 获取所有防抖项信息
     */
    getAllInfo(): Array<{
        key: string;
        createdAt: number;
        delay: number;
    }>;
    /**
     * 清理过期的防抖项（超过指定时间未执行）
     */
    cleanup(maxAge?: number): void;
    /**
     * 清理最早的防抖项
     */
    private cleanupOldest;
    /**
     * 启动自动清理
     */
    private startAutoCleanup;
    /**
     * 销毁管理器
     */
    destroy(): void;
}
/**
 * 创建防抖函数
 */
export declare function createDebounceFunction<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, delay: number, key?: string): T;
/**
 * 创建带键的防抖函数
 */
export declare function createKeyedDebounceFunction<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, delay: number, keyGenerator: (...args: Parameters<T>) => string): T;
/**
 * 防抖装饰器
 */
export declare function debounce(delay: number, key?: string): <T extends (...args: unknown[]) => Promise<unknown>>(target: {
    constructor: {
        name: string;
    };
}, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
/**
 * 带键的防抖装饰器
 */
export declare function keyedDebounce<T extends (...args: unknown[]) => Promise<unknown>>(delay: number, keyGenerator: (...args: Parameters<T>) => string): (target: unknown, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
