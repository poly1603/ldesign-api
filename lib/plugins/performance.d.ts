/**
 * 性能优化插件
 * 提供缓存优化、性能监控和自动调优功能
 */
import type { ApiEngine, ApiPlugin } from '../types';
import type { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { createPerformanceMonitor } from '../utils/PerformanceMonitor';
/**
 * 性能优化插件配置
 */
export interface PerformancePluginConfig {
    /** 是否启用性能监控 */
    enableMonitoring?: boolean;
    /** 性能监控配置 */
    monitoring?: {
        /** 是否收集详细指标 */
        collectDetailedMetrics?: boolean;
        /** 最大保存的调用记录数 */
        maxRecords?: number;
        /** 性能报告生成间隔 (毫秒) */
        reportInterval?: number;
        /** 慢查询阈值 (毫秒) */
        slowQueryThreshold?: number;
        /** 是否在控制台输出性能警告 */
        logWarnings?: boolean;
    };
    /** 缓存优化配置 */
    cacheOptimization?: {
        /** 是否启用LRU缓存 */
        enableLRU?: boolean;
        /** 是否启用缓存预热 */
        enableWarmup?: boolean;
        /** 预热数据 */
        warmupData?: Array<{
            key: string;
            data: unknown;
            ttl?: number;
        }>;
        /** 是否启用智能缓存 */
        enableSmartCache?: boolean;
    };
    /** 自动调优配置 */
    autoTuning?: {
        /** 是否启用自动调优 */
        enabled?: boolean;
        /** 调优检查间隔 (毫秒) */
        checkInterval?: number;
        /** 性能阈值 */
        thresholds?: {
            /** 平均响应时间阈值 (毫秒) */
            averageResponseTime?: number;
            /** 错误率阈值 */
            errorRate?: number;
            /** 缓存命中率阈值 */
            cacheHitRate?: number;
        };
    };
}
/**
 * 性能优化插件
 */
export declare function createPerformancePlugin(config?: PerformancePluginConfig): ApiPlugin & {
    warmupCache: (engine: ApiEngine, warmupData: Array<{
        key: string;
        data: unknown;
        ttl?: number;
    }>) => void;
    startAutoTuning: (engine: ApiEngine, autoTuningConfig: NonNullable<PerformancePluginConfig['autoTuning']>) => void;
    performAutoTuning: (engine: ApiEngine, thresholds: any) => void;
};
/**
 * 默认性能优化插件实例
 */
export declare const performancePlugin: ApiPlugin & {
    warmupCache: (engine: ApiEngine, warmupData: Array<{
        key: string;
        data: unknown;
        ttl?: number;
    }>) => void;
    startAutoTuning: (engine: ApiEngine, autoTuningConfig: NonNullable<PerformancePluginConfig["autoTuning"]>) => void;
    performAutoTuning: (engine: ApiEngine, thresholds: any) => void;
};
/**
 * 创建带配置的性能优化插件
 */
export declare function withPerformance(config?: PerformancePluginConfig): ApiPlugin & {
    warmupCache: (engine: ApiEngine, warmupData: Array<{
        key: string;
        data: unknown;
        ttl?: number;
    }>) => void;
    startAutoTuning: (engine: ApiEngine, autoTuningConfig: NonNullable<PerformancePluginConfig["autoTuning"]>) => void;
    performAutoTuning: (engine: ApiEngine, thresholds: any) => void;
};
/**
 * 性能优化工具函数
 */
export declare const PerformanceUtils: {
    /**
     * 创建性能监控器
     */
    createMonitor: typeof createPerformanceMonitor;
    /**
     * 获取性能报告
     */
    getReport(monitor: PerformanceMonitor): import("../utils/PerformanceMonitor").PerformanceReport;
    /**
     * 重置性能统计
     */
    resetStats(monitor: PerformanceMonitor): void;
    /**
     * 检查是否为慢查询
     */
    isSlowQuery(duration: number, threshold?: number): boolean;
    /**
     * 格式化性能指标
     */
    formatMetrics(metrics: any): {
        averageTime: string;
        successRate: string;
        callCount: any;
    };
};
