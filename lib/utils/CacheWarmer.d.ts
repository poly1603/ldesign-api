/**
 * 缓存预热工具
 * 在应用启动时预加载关键数据到缓存
 */
/**
 * 预热任务配置
 */
export interface WarmupTask {
    /** 任务名称 */
    name: string;
    /** API方法名 */
    methodName: string;
    /** 调用参数 */
    params?: any;
    /** 优先级（数字越大越优先） */
    priority?: number;
    /** 是否必需（失败时是否中断预热流程） */
    required?: boolean;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 重试次数 */
    retries?: number;
}
/**
 * 预热配置
 */
export interface CacheWarmerConfig {
    /** 是否启用 */
    enabled?: boolean;
    /** 并发数 */
    concurrency?: number;
    /** 是否在启动时自动预热 */
    autoWarmup?: boolean;
    /** 预热失败时是否抛出错误 */
    throwOnError?: boolean;
    /** 预热超时时间（毫秒） */
    timeout?: number;
    /** 预热进度回调 */
    onProgress?: (completed: number, total: number, task: WarmupTask) => void;
    /** 预热完成回调 */
    onComplete?: (results: WarmupResult[]) => void;
    /** 预热错误回调 */
    onError?: (error: any, task: WarmupTask) => void;
}
/**
 * 预热结果
 */
export interface WarmupResult {
    /** 任务名称 */
    name: string;
    /** 是否成功 */
    success: boolean;
    /** 耗时（毫秒） */
    duration: number;
    /** 错误信息 */
    error?: any;
    /** 响应数据 */
    data?: any;
}
/**
 * 预热统计
 */
export interface WarmupStats {
    /** 总任务数 */
    total: number;
    /** 成功数 */
    succeeded: number;
    /** 失败数 */
    failed: number;
    /** 总耗时（毫秒） */
    totalDuration: number;
    /** 平均耗时（毫秒） */
    averageDuration: number;
}
/**
 * 缓存预热器
 */
export declare class CacheWarmer {
    private config;
    private tasks;
    private results;
    private isWarming;
    constructor(config?: CacheWarmerConfig);
    /**
     * 添加预热任务
     */
    addTask(task: WarmupTask): void;
    /**
     * 批量添加任务
     */
    addTasks(tasks: WarmupTask[]): void;
    /**
     * 清空任务
     */
    clearTasks(): void;
    /**
     * 执行预热
     */
    warmup(engine: any): Promise<WarmupResult[]>;
    /**
     * 并发执行任务
     */
    private executeTasksWithConcurrency;
    /**
     * 执行单个任务
     */
    private executeTask;
    /**
     * 获取预热统计
     */
    getStats(): WarmupStats;
    /**
     * 获取预热结果
     */
    getResults(): WarmupResult[];
    /**
     * 重置
     */
    reset(): void;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<CacheWarmerConfig>): void;
}
/**
 * 创建缓存预热器
 */
export declare function createCacheWarmer(config?: CacheWarmerConfig): CacheWarmer;
/**
 * 便捷函数：快速预热
 */
export declare function quickWarmup(engine: any, tasks: WarmupTask[]): Promise<WarmupResult[]>;
