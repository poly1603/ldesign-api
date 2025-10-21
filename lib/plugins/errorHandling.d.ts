/**
 * 错误处理插件
 * 提供统一的错误处理、报告和恢复机制
 */
import type { ApiPlugin } from '../types';
import { ApiError, ApiErrorType } from '../utils/ApiError';
/**
 * 错误处理插件配置
 */
export interface ErrorHandlingPluginConfig {
    /** 是否启用错误报告 */
    enableReporting?: boolean;
    /** 错误报告配置 */
    reporting?: {
        endpoint?: string;
        apiKey?: string;
        sampleRate?: number;
        enableInDevelopment?: boolean;
    };
    /** 自动重试配置 */
    autoRetry?: {
        /** 启用自动重试的错误类型 */
        retryableErrors?: ApiErrorType[];
        /** 最大重试次数 */
        maxRetries?: number;
        /** 重试延迟 */
        retryDelay?: number;
    };
    /** 错误恢复策略 */
    recovery?: {
        /** 网络错误时的降级响应 */
        networkFallback?: (error: ApiError) => any;
        /** 服务器错误时的降级响应 */
        serverFallback?: (error: ApiError) => any;
        /** 认证错误时的处理 */
        authErrorHandler?: (error: ApiError) => void;
    };
    /** 用户通知配置 */
    notification?: {
        /** 是否显示用户友好的错误消息 */
        showUserMessages?: boolean;
        /** 自定义通知函数 */
        notifyUser?: (error: ApiError) => void;
    };
}
/**
 * 错误处理插件
 */
export declare function createErrorHandlingPlugin(config?: ErrorHandlingPluginConfig): ApiPlugin;
/**
 * 默认错误处理插件实例
 */
export declare const errorHandlingPlugin: ApiPlugin;
/**
 * 创建带配置的错误处理插件
 */
export declare function withErrorHandling(config?: ErrorHandlingPluginConfig): ApiPlugin;
/**
 * 错误处理工具函数
 */
export declare const ErrorHandlingUtils: {
    /**
     * 检查错误是否可重试
     */
    isRetryable(error: ApiError): boolean;
    /**
     * 获取错误的用户友好消息
     */
    getUserMessage(error: ApiError): string;
    /**
     * 获取错误的建议解决方案
     */
    getSuggestions(error: ApiError): string[];
    /**
     * 检查错误严重程度
     */
    isCritical(error: ApiError): boolean;
    /**
     * 格式化错误信息用于日志
     */
    formatForLogging(error: ApiError): string;
};
