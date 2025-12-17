/**
 * Vue 插件
 *
 * 提供 API 管理器的 Vue 插件集成
 */

import type { App, Plugin } from 'vue'
import type { ApiManager, ApiManagerConfig, ServerConfig, UnifiedApiDefinition } from '@ldesign/api-core'
import { createApiManager } from '@ldesign/api-core'
import { API_CONFIG_KEY, API_MANAGER_KEY } from '../lib/symbols'

/**
 * API 插件选项
 */
export interface ApiPluginOptions extends ApiManagerConfig {
  /** 是否自动初始化 */
  autoInit?: boolean
  /** 初始化完成回调 */
  onReady?: (manager: ApiManager) => void
  /** 预注册的 API 列表 */
  apis?: UnifiedApiDefinition[]
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
export function createApiPlugin(options: ApiPluginOptions = {}): Plugin {
  return {
    install(app: App) {
      // 创建管理器
      const manager = createApiManager(options)

      // 预注册 API
      if (options.apis) {
        manager.registerAll(options.apis)
      }

      // 提供注入
      app.provide(API_MANAGER_KEY, manager)
      app.provide(API_CONFIG_KEY, options)

      // 添加全局属性
      app.config.globalProperties.$api = manager

      // 自动初始化
      if (options.autoInit !== false) {
        manager.init().then(() => {
          options.onReady?.(manager)
        })
      }

      // 应用卸载时清理
      const originalUnmount = app.unmount
      app.unmount = function () {
        manager.destroy()
        return originalUnmount.call(this)
      }
    },
  }
}

/**
 * API 插件单例
 */
export const ApiPlugin = createApiPlugin()

/**
 * 为 Engine 创建的 API 插件
 *
 * 用于与 @ldesign/engine-vue3 集成
 */
export interface ApiEnginePluginOptions {
  /** 服务器配置 */
  servers?: ServerConfig[]
  /** 默认服务器 ID */
  defaultServerId?: string
  /** 预注册的 API */
  apis?: UnifiedApiDefinition[]
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
export function createApiEnginePlugin(options: ApiEnginePluginOptions = {}) {
  return {
    name: 'api',
    install(app: App) {
      app.use(createApiPlugin({
        servers: options.servers,
        defaultServerId: options.defaultServerId,
        apis: options.apis,
      }))
    },
  }
}

// 声明全局属性类型
declare module 'vue' {
  interface ComponentCustomProperties {
    $api: ApiManager
  }
}
