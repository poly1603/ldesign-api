/**
 * Vue 插件
 * 提供 Vue 3 集成功能
 */
import type { App, Plugin } from 'vue';
import type { ApiEngine, ApiEngineConfig } from '../types';
declare module 'vue' {
    interface App {
        _apiEngine?: ApiEngine;
    }
    interface ComponentCustomProperties {
        $api: ApiEngine;
    }
}
/**
 * Vue 插件选项
 */
export interface ApiVuePluginOptions {
    /** API 引擎实例 */
    engine?: ApiEngine;
    /** API 引擎配置 */
    config?: ApiEngineConfig;
    /** 全局属性名称 */
    globalPropertyName?: string;
    /** 是否注册组合式 API */
    registerComposables?: boolean;
    /** 是否提供依赖注入 */
    provideDependencyInjection?: boolean;
    /** 依赖注入键 */
    injectionKey?: string | symbol;
    /** 是否启用调试模式 */
    debug?: boolean;
    /** 是否在开发模式下显示安装信息 */
    showInstallInfo?: boolean;
}
/**
 * 默认依赖注入键
 */
export declare const API_ENGINE_INJECTION_KEY: unique symbol;
/**
 * Vue 插件实现
 */
export declare const ApiVuePlugin: Plugin;
/**
 * 创建 API Vue 插件
 *
 * @param options 插件选项
 * @returns Vue 插件
 *
 * @example
 * ```typescript
 * import { createApiVuePlugin } from '@ldesign/api/vue'
 *
 * const apiPlugin = createApiVuePlugin({
 *   config: {
 *     http: { baseURL: 'https://api.example.com' },
 *   },
 *   globalPropertyName: '$api',
 * })
 *
 * app.use(apiPlugin)
 * ```
 */
export declare function createApiVuePlugin(options?: ApiVuePluginOptions): Plugin;
/**
 * 安装 API Vue 插件的便捷函数
 *
 * @param app Vue 应用实例
 * @param options 插件选项
 *
 * @example
 * ```typescript
 * import { installApiVuePlugin } from '@ldesign/api/vue'
 *
 * installApiVuePlugin(app, {
 *   config: {
 *     http: { baseURL: 'https://api.example.com' },
 *   },
 * })
 * ```
 */
export declare function installApiVuePlugin(app: App, options?: ApiVuePluginOptions): void;
/**
 * 从 Vue 应用实例获取 API 引擎
 *
 * @param app Vue 应用实例
 * @returns API 引擎实例
 */
export declare function getApiEngineFromApp(app: App): ApiEngine | undefined;
