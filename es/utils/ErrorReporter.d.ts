/**
 * 错误报告和监控系统
 * 提供错误收集、分析和上报功能
 */
import type { ApiError, ErrorSeverity } from './ApiError';
/**
 * 错误报告配置
 */
export interface ErrorReporterConfig {
    /** 是否启用错误报告 */
    enabled?: boolean;
    /** 报告端点URL */
    endpoint?: string;
    /** API密钥 */
    apiKey?: string;
    /** 采样率 (0-1) */
    sampleRate?: number;
    /** 最大错误缓存数量 */
    maxCacheSize?: number;
    /** 批量上报间隔 (毫秒) */
    batchInterval?: number;
    /** 是否在开发环境启用 */
    enableInDevelopment?: boolean;
    /** 自定义过滤器 */
    filter?: (error: ApiError) => boolean;
    /** 自定义转换器 */
    transform?: (error: ApiError) => any;
}
/**
 * 错误统计信息
 */
export interface ErrorStats {
    /** 总错误数 */
    total: number;
    /** 按类型分组的错误数 */
    byType: Record<string, number>;
    /** 按严重程度分组的错误数 */
    bySeverity: Record<ErrorSeverity, number>;
    /** 按方法名分组的错误数 */
    byMethod: Record<string, number>;
    /** 最近的错误 */
    recent: ApiError[];
    /** 统计时间范围 */
    timeRange: {
        start: number;
        end: number;
    };
}
/**
 * 错误报告器
 */
export declare class ErrorReporter {
    private config;
    private errorCache;
    private stats;
    private batchTimer?;
    private listeners;
    constructor(config?: ErrorReporterConfig);
    /**
     * 初始化统计信息
     */
    private initStats;
    /**
     * 报告错误
     */
    report(error: ApiError): void;
    /**
     * 判断是否应该报告错误
     */
    private shouldReport;
    /**
     * 更新统计信息
     */
    private updateStats;
    /**
     * 添加到缓存
     */
    private addToCache;
    /**
     * 通知监听器
     */
    private notifyListeners;
    /**
     * 输出到控制台
     */
    private logToConsole;
    /**
     * 获取控制台样式
     */
    private getConsoleStyle;
    /**
     * 开始批量报告
     */
    private startBatchReporting;
    /**
     * 刷新缓存，发送错误报告
     */
    private flushCache;
    /**
     * 发送报告
     */
    private sendReport;
    /**
     * 判断是否为开发环境
     */
    private isDevelopment;
    /**
     * 添加错误监听器
     */
    addListener(listener: (error: ApiError) => void): () => void;
    /**
     * 获取错误统计
     */
    getStats(): ErrorStats;
    /**
     * 清除统计信息
     */
    clearStats(): void;
    /**
     * 获取缓存的错误
     */
    getCachedErrors(): ApiError[];
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<ErrorReporterConfig>): void;
    /**
     * 销毁报告器
     */
    destroy(): void;
}
/**
 * 获取全局错误报告器
 */
export declare function getGlobalErrorReporter(): ErrorReporter | null;
/**
 * 设置全局错误报告器
 */
export declare function setGlobalErrorReporter(reporter: ErrorReporter | null): void;
/**
 * 创建错误报告器
 */
export declare function createErrorReporter(config?: ErrorReporterConfig): ErrorReporter;
