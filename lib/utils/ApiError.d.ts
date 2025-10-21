/**
 * 增强的API错误处理系统
 * 提供更好的错误分类、调试信息和用户友好的错误消息
 */
/**
 * API错误类型枚举
 */
export declare enum ApiErrorType {
    /** 网络错误 */
    NETWORK_ERROR = "NETWORK_ERROR",
    /** 超时错误 */
    TIMEOUT_ERROR = "TIMEOUT_ERROR",
    /** 请求取消 */
    CANCELLED_ERROR = "CANCELLED_ERROR",
    /** 服务器错误 (5xx) */
    SERVER_ERROR = "SERVER_ERROR",
    /** 客户端错误 (4xx) */
    CLIENT_ERROR = "CLIENT_ERROR",
    /** 认证错误 (401) */
    AUTH_ERROR = "AUTH_ERROR",
    /** 权限错误 (403) */
    PERMISSION_ERROR = "PERMISSION_ERROR",
    /** 资源不存在 (404) */
    NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
    /** 数据验证错误 */
    VALIDATION_ERROR = "VALIDATION_ERROR",
    /** 插件错误 */
    PLUGIN_ERROR = "PLUGIN_ERROR",
    /** 配置错误 */
    CONFIG_ERROR = "CONFIG_ERROR",
    /** 未知错误 */
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
/**
 * 错误严重程度
 */
export declare enum ErrorSeverity {
    /** 低 - 用户可以继续操作 */
    LOW = "LOW",
    /** 中 - 影响部分功能 */
    MEDIUM = "MEDIUM",
    /** 高 - 严重影响用户体验 */
    HIGH = "HIGH",
    /** 严重 - 系统不可用 */
    CRITICAL = "CRITICAL"
}
/**
 * 错误上下文信息
 */
export interface ErrorContext {
    /** API方法名 */
    methodName?: string;
    /** 请求参数 */
    params?: unknown;
    /** 请求配置 */
    config?: unknown;
    /** 重试次数 */
    retryCount?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 用户代理 */
    userAgent?: string;
    /** 请求ID */
    requestId?: string;
}
/**
 * 增强的API错误类
 */
export declare class ApiError extends Error {
    /** 错误类型 */
    readonly type: ApiErrorType;
    /** 错误代码 */
    readonly code: string | number;
    /** 严重程度 */
    readonly severity: ErrorSeverity;
    /** 原始错误 */
    readonly originalError?: Error;
    /** 错误上下文 */
    readonly context: ErrorContext;
    /** 用户友好的错误消息 */
    readonly userMessage: string;
    /** 开发者错误消息 */
    readonly developerMessage: string;
    /** 建议的解决方案 */
    readonly suggestions: string[];
    /** 是否可重试 */
    readonly retryable: boolean;
    /** 时间戳 */
    readonly timestamp: number;
    constructor(options: {
        type: ApiErrorType;
        code?: string | number;
        message: string;
        userMessage?: string;
        developerMessage?: string;
        suggestions?: string[];
        severity?: ErrorSeverity;
        retryable?: boolean;
        originalError?: Error;
        context?: ErrorContext;
    });
    /**
     * 推断错误严重程度
     */
    private inferSeverity;
    /**
     * 生成用户友好的错误消息
     */
    private generateUserMessage;
    /**
     * 生成解决建议
     */
    private generateSuggestions;
    /**
     * 推断是否可重试
     */
    private inferRetryable;
    /**
     * 转换为JSON格式
     */
    toJSON(): {
        name: string;
        type: ApiErrorType;
        code: string | number;
        message: string;
        userMessage: string;
        developerMessage: string;
        severity: ErrorSeverity;
        suggestions: string[];
        retryable: boolean;
        context: ErrorContext;
        timestamp: number;
        stack: string | undefined;
    };
    /**
     * 转换为字符串
     */
    toString(): string;
}
/**
 * 错误工厂函数
 */
export declare class ApiErrorFactory {
    /**
     * 从HTTP响应创建错误
     */
    static fromHttpResponse(response: any, context?: ErrorContext): ApiError;
    /**
     * 从网络错误创建错误
     */
    static fromNetworkError(error: Error, context?: ErrorContext): ApiError;
    /**
     * 从验证错误创建错误
     */
    static fromValidationError(message: string, context?: ErrorContext): ApiError;
    /**
     * 从配置错误创建错误
     */
    static fromConfigError(message: string, context?: ErrorContext): ApiError;
    /**
     * 从插件错误创建错误
     */
    static fromPluginError(message: string, context?: ErrorContext): ApiError;
    /**
     * 从未知错误创建错误
     */
    static fromUnknownError(error: unknown, context?: ErrorContext): ApiError;
}
