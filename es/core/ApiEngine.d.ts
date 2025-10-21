/**
 * API 引擎核心实现
 * 提供插件系统、方法注册、调用机制等核心功能
 */
import type { HttpClient } from '@ldesign/http';
import type { ApiCallOptions, ApiEngine, ApiEngineConfig, ApiMethodConfig, ApiPlugin, CacheStats } from '../types';
import type { ErrorReporter } from '../utils/ErrorReporter';
import type { PerformanceMonitor } from '../utils/PerformanceMonitor';
/**
 * API 引擎实现类
 */
export declare class ApiEngineImpl implements ApiEngine {
    /** 配置 */
    readonly config: ApiEngineConfig;
    /** HTTP 客户端 */
    readonly httpClient: HttpClient;
    /** 已注册的插件 */
    readonly plugins: Map<string, ApiPlugin>;
    /** 已注册的方法 */
    readonly methods: Map<string, ApiMethodConfig>;
    /** 缓存管理器 */
    private readonly cacheManager;
    /** 防抖管理器 */
    private readonly debounceManager;
    /** 去重管理器 */
    private readonly deduplicationManager;
    /** 请求队列管理器（可选） */
    private requestQueueManager;
    /** 是否已销毁 */
    private destroyed;
    /** 断路器状态 */
    private readonly circuitStates;
    /** 对象池 - 用于复用常用对象（优化版：增加容量和类型） */
    private readonly objectPool;
    /** 错误报告器 */
    private errorReporter;
    /** 性能监控器 */
    private performanceMonitor;
    /** 断路器状态清理定时器 */
    private circuitStatesCleanupTimer;
    /** 中间件缓存 */
    private middlewareCache;
    constructor(config?: ApiEngineConfig);
    /**
     * 注册插件
     */
    use(plugin: ApiPlugin): Promise<void>;
    /**
     * 卸载插件
     */
    unuse(pluginName: string): Promise<void>;
    /**
     * 注册 API 方法
     */
    register(methodName: string, config: ApiMethodConfig): void;
    /**
     * 注册多个 API 方法
     */
    registerBatch(methods: Record<string, ApiMethodConfig>): void;
    /**
     * 取消注册 API 方法
     */
    unregister(methodName: string): void;
    /**
     * 检查缓存并返回缓存数据（如果存在）
     */
    private checkCache;
    /**
     * 构建重试配置
     */
    private buildRetryConfig;
    /**
     * 构建断路器配置
     */
    private buildCircuitBreakerConfig;
    /**
     * 检查断路器状态并抛出错误（如果需要）
     */
    private checkCircuitBreaker;
    /**
     * 处理断路器成功反馈
     */
    private handleCircuitBreakerSuccess;
    /**
     * 处理断路器失败反馈
     */
    private handleCircuitBreakerFailure;
    /**
     * 缓存成功结果
     */
    private cacheResult;
    /**
     * 调用成功回调
     */
    private invokeSuccessCallbacks;
    /**
     * 计算重试延迟（包括错动）
     */
    private calculateRetryDelay;
    /**
     * 调用 API 方法
     */
    call<T = unknown>(methodName: string, params?: unknown, options?: ApiCallOptions): Promise<T>;
    /**
     * 批量调用 API 方法
     */
    callBatch<T = unknown>(calls: Array<{
        methodName: string;
        params?: unknown;
        options?: ApiCallOptions;
    }>): Promise<T[]>;
    /**
     * 检查方法是否存在
     */
    hasMethod(methodName: string): boolean;
    /**
     * 获取所有方法名称
     */
    getMethodNames(): string[];
    /**
     * 清除缓存
     */
    clearCache(methodName?: string): void;
    /**
     * 获取缓存统计
     */
    getCacheStats(): CacheStats;
    /**
     * 销毁引擎
     */
    destroy(): void;
    /**
     * 缓存参数序列化结果，避免重复计算
     */
    private paramsStringCache;
    /**
     * 高效序列化参数（带缓存）
     */
    private serializeParams;
    /**
     * 生成缓存键（优化版：减少重复序列化）
     */
    private generateCacheKey;
    /**
     * 生成防抖键（优化版：减少重复序列化）
     */
    private generateDebounceKey;
    /**
     * 生成去重键（优化版：减少重复序列化）
     */
    private generateDeduplicationKey;
    /**
     * 判断是否应该使用缓存
     */
    private shouldUseCache;
    /**
     * 判断是否应该使用防抖
     */
    private shouldUseDebounce;
    /**
     * 判断是否应该使用去重
     */
    private shouldUseDeduplication;
    /**
     * 判断是否使用请求队列
     */
    private shouldUseQueue;
    /**
     * 将可能包含函数值的请求配置规范化
     */
    private normalizeRequestConfig;
    /**
     * 创建API错误对象
     */
    private createApiError;
    /**
     * 报告错误
     */
    private reportError;
    /**
     * 设置错误报告器
     */
    setErrorReporter(reporter: ErrorReporter | null): void;
    /**
     * 获取错误报告器
     */
    getErrorReporter(): ErrorReporter | null;
    /**
     * 设置性能监控器
     */
    setPerformanceMonitor(monitor: PerformanceMonitor | null): void;
    /**
     * 获取性能监控器
     */
    getPerformanceMonitor(): PerformanceMonitor | null;
    /**
     * 获取中间件数组（带缓存）
     */
    private getMiddlewares;
    /**
     * 合并中间件数组（优化版）
     */
    private concatMiddlewares;
    /**
     * 启动断路器状态清理定时器
     */
    private startCircuitBreakerCleanup;
    /**
     * 日志输出
     */
    private log;
}
