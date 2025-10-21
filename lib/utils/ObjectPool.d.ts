/**
 * 对象池 - 用于复用对象，减少GC压力
 */
/**
 * 对象池配置
 */
export interface ObjectPoolConfig {
    /** 最大池大小 */
    maxSize: number;
    /** 初始化大小 */
    initialSize?: number;
    /** 创建对象的工厂函数 */
    factory: () => any;
    /** 重置对象的函数 */
    reset: (obj: any) => void;
    /** 验证对象是否可用 */
    validate?: (obj: any) => boolean;
}
/**
 * 通用对象池
 */
export declare class ObjectPool<T extends object = any> {
    private pool;
    private inUse;
    private config;
    private stats;
    constructor(config: ObjectPoolConfig);
    /**
     * 初始化对象池
     */
    private initialize;
    /**
     * 从池中获取对象
     */
    acquire(): T;
    /**
     * 释放对象回池
     */
    release(obj: T): void;
    /**
     * 获取池状态
     */
    getStats(): {
        efficiency: number;
        created: number;
        borrowed: number;
        returned: number;
        destroyed: number;
        poolSize: number;
    };
    /**
     * 清空池
     */
    clear(): void;
    /**
     * 调整池大小
     */
    resize(newMaxSize: number): void;
}
/**
 * 专用配置对象池
 */
export declare class ConfigObjectPool {
    private static instance;
    private pool;
    private readonly maxSize;
    static getInstance(): ConfigObjectPool;
    acquire(): Record<string, any>;
    release(obj: Record<string, any>): void;
}
/**
 * 专用数组池
 */
export declare class ArrayPool<T = any> {
    private static pools;
    private pool;
    private readonly maxSize;
    static getInstance<T>(initialCapacity?: number): ArrayPool<T>;
    acquire(size?: number): T[];
    release(arr: T[]): void;
}
/**
 * Promise结果包装器池
 */
export declare class PromiseResultPool {
    private static instance;
    private pool;
    private readonly maxSize;
    static getInstance(): PromiseResultPool;
    acquire(): {
        value?: any;
        error?: any;
    };
    release(obj: {
        value?: any;
        error?: any;
    }): void;
}
/**
 * 字符串构建器池（用于高频字符串拼接）
 */
export declare class StringBuilderPool {
    private static instance;
    private pool;
    private readonly maxSize;
    static getInstance(): StringBuilderPool;
    acquire(): StringBuilder;
    release(builder: {
        parts: string[];
        length: number;
    }): void;
}
/**
 * 字符串构建器
 */
export declare class StringBuilder {
    private builder;
    private pool;
    constructor(builder: {
        parts: string[];
        length: number;
    }, pool: StringBuilderPool);
    append(str: string): this;
    toString(): string;
}
/**
 * 创建带对象池的函数包装器
 */
export declare function withObjectPool<T extends (...args: any[]) => any>(fn: T, poolConfig: Partial<ObjectPoolConfig>): T;
