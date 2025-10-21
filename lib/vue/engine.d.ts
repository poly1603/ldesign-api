/**
 * Engine 插件集成
 * 提供与 @ldesign/engine 的集成功能
 */
import type { Plugin as EnginePlugin } from '@ldesign/engine';
import type { ApiEngine, ApiEngineConfig } from '../types';
import type { ApiVuePluginOptions } from './plugin';
/**
 * API Engine 插件选项
 */
export interface ApiEnginePluginOptions extends ApiVuePluginOptions {
    /** 插件名称 */
    name?: string;
    /** 插件版本 */
    version?: string;
    /** API 引擎配置 */
    clientConfig?: ApiEngineConfig;
    /** 是否启用全局注入 */
    globalInjection?: boolean;
    /** 全局属性名称 */
    globalPropertyName?: string;
    /** 全局配置 */
    globalConfig?: ApiEngineConfig;
    /** API 引擎实例 */
    client?: ApiEngine;
}
/**
 * 创建 API Engine 插件
 *
 * @param options 插件选项
 * @returns Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createApiEnginePlugin } from '@ldesign/api'
 *
 * const apiPlugin = createApiEnginePlugin({
 *   name: 'api',
 *   version: '1.0.0',
 *   clientConfig: {
 *     http: {
 *       baseURL: 'https://api.example.com',
 *       timeout: 10000,
 *     },
 *   },
 *   globalInjection: true,
 *   globalPropertyName: '$api',
 * })
 *
 * await engine.use(apiPlugin)
 * ```
 */
export declare function createApiEnginePlugin(options?: ApiEnginePluginOptions): EnginePlugin;
/**
 * 默认 API Engine 插件
 */
export declare const defaultApiEnginePlugin: import("@ldesign/engine").EnginePlugin;
/**
 * API 插件（别名）
 */
export declare const apiPlugin: import("@ldesign/engine").EnginePlugin;
/**
 * 创建开发环境 API Engine 插件
 *
 * @param baseURL API 基础地址
 * @param options 额外选项
 * @returns Engine 插件实例
 */
export declare function createDevelopmentApiEnginePlugin(baseURL: string, options?: Omit<ApiEnginePluginOptions, 'clientConfig'> & {
    clientConfig?: Omit<ApiEngineConfig, 'debug' | 'http'> & {
        http?: Omit<ApiEngineConfig['http'], 'baseURL'>;
    };
}): EnginePlugin;
/**
 * 创建生产环境 API Engine 插件
 *
 * @param baseURL API 基础地址
 * @param options 额外选项
 * @returns Engine 插件实例
 */
export declare function createProductionApiEnginePlugin(baseURL: string, options?: Omit<ApiEnginePluginOptions, 'clientConfig'> & {
    clientConfig?: Omit<ApiEngineConfig, 'debug' | 'http'> & {
        http?: Omit<ApiEngineConfig['http'], 'baseURL'>;
    };
}): EnginePlugin;
/**
 * 根据环境创建 API Engine 插件
 *
 * @param baseURL API 基础地址
 * @param options 额外选项
 * @returns Engine 插件实例
 */
export declare function createApiEnginePluginByEnv(baseURL: string, options?: Omit<ApiEnginePluginOptions, 'clientConfig'> & {
    clientConfig?: Omit<ApiEngineConfig, 'http'> & {
        http?: Omit<ApiEngineConfig['http'], 'baseURL'>;
    };
}): EnginePlugin;
declare module '@ldesign/engine' {
    interface Engine {
        apiEngine?: ApiEngine;
    }
}
