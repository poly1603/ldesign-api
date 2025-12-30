/**
 * Vue 插件
 *
 * 提供 API 管理器的 Vue 插件集成
 */
import type { App, Plugin } from 'vue';
import type { ApiManager, ApiManagerConfig, ServerConfig, UnifiedApiDefinition } from '@ldesign/api-core';
/**
 * API 插件选项
 */
export interface ApiPluginOptions extends ApiManagerConfig {
    /** 是否自动初始化 */
    autoInit?: boolean;
    /** 初始化完成回调 */
    onReady?: (manager: ApiManager) => void;
    /** 预注册的 API 列表 */
    apis?: UnifiedApiDefinition[];
}
/**
 * 创建 API 插件
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { createApiPlugin } from '@ldesign/api-vue'
 *
 * const app = createApp(App)
 *
 * app.use(createApiPlugin({
 *   servers: [
 *     { id: 'jsonApi', baseUrl: 'https://jsonplaceholder.typicode.com', type: 'restful' },
 *     { id: 'lpom', baseUrl: 'https://pm.longrise.cn', type: 'leap', leap: { systemPrefix: '/LPOM' } }
 *   ],
 *   defaultServerId: 'jsonApi',
 *   apis: [getUserApi, getWorkdayApi]
 * }))
 * ```
 */
export declare function createApiPlugin(options?: ApiPluginOptions): Plugin;
/**
 * API 插件单例
 */
export declare const ApiPlugin: Plugin;
/**
 * 为 Engine 创建的 API 插件
 *
 * 用于与 @ldesign/engine-vue3 集成
 */
export interface ApiEnginePluginOptions {
    /** 服务器配置 */
    servers?: ServerConfig[];
    /** 默认服务器 ID */
    defaultServerId?: string;
    /** 预注册的 API */
    apis?: UnifiedApiDefinition[];
}
/**
 * 创建 Engine API 插件
 *
 * @example
 * ```typescript
 * import { createEngine } from '@ldesign/engine-vue3'
 * import { createApiEnginePlugin } from '@ldesign/api-vue'
 *
 * const engine = createEngine({
 *   plugins: [
 *     createApiEnginePlugin({
 *       servers: [jsonApi, leapServer]
 *     })
 *   ]
 * })
 * ```
 */
export declare function createApiEnginePlugin(options?: ApiEnginePluginOptions): {
    name: string;
    install(app: App): void;
};
declare module 'vue' {
    interface ComponentCustomProperties {
        $api: ApiManager;
    }
}
//# sourceMappingURL=plugin.d.ts.map