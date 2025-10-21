/**
 * 请求取消插件
 * 提供请求取消、超时自动取消等功能
 */
import type { ApiPlugin } from '../types';
/**
 * 取消插件配置
 */
export interface CancellationPluginOptions {
    /** 是否启用 */
    enabled?: boolean;
    /** 全局超时时间（毫秒），0表示不设置 */
    globalTimeout?: number;
    /** 是否在页面卸载时取消所有请求 */
    cancelOnUnload?: boolean;
    /** 是否在路由切换时取消请求 */
    cancelOnRouteChange?: boolean;
    /** 取消回调 */
    onCancel?: (methodName: string, reason: string) => void;
}
/**
 * 创建请求取消插件
 */
export declare function createCancellationPlugin(options?: CancellationPluginOptions): ApiPlugin;
/**
 * 类型安全的取消插件API
 */
export interface CancellationPluginAPI {
    /** 取消所有请求 */
    cancelAll: (reason?: string) => void;
    /** 取消指定方法的所有请求 */
    cancelByMethod: (methodName: string, reason?: string) => void;
    /** 路由切换时调用 */
    onRouteChange: () => void;
}
/**
 * 从引擎获取取消插件API
 */
export declare function getCancellationAPI(engine: any): CancellationPluginAPI | null;
