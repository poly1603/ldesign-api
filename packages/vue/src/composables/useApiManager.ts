/**
 * useApiManager 组合函数
 *
 * 提供对 API 管理器的访问
 */

import { inject, provide } from 'vue'
import type { ApiManager, ApiManagerConfig } from '@ldesign/api-core'
import { createApiManager } from '@ldesign/api-core'
import { API_CONFIG_KEY, API_MANAGER_KEY } from '../lib/symbols'

/**
 * 提供 API 管理器
 *
 * @example
 * ```typescript
 * // 在根组件中
 * const manager = provideApiManager({
 *   servers: [jsonApi, leapServer],
 *   defaultServerId: 'jsonApi'
 * })
 * ```
 */
export function provideApiManager(config?: ApiManagerConfig): ApiManager {
  const manager = createApiManager(config)

  provide(API_MANAGER_KEY, manager)
  if (config) {
    provide(API_CONFIG_KEY, config)
  }

  return manager
}

/**
 * 注入 API 管理器
 *
 * @example
 * ```typescript
 * const manager = injectApiManager()
 * const result = await manager.call('getUserInfo', { params: { id: 1 } })
 * ```
 */
export function injectApiManager(): ApiManager {
  const manager = inject(API_MANAGER_KEY)

  if (!manager) {
    throw new Error(
      '[useApiManager] API 管理器未提供，请在父组件中调用 provideApiManager() 或使用 createApiPlugin()'
    )
  }

  return manager
}

/**
 * 注入 API 配置
 */
export function injectApiConfig(): ApiManagerConfig | undefined {
  return inject(API_CONFIG_KEY)
}

/**
 * 使用 API 管理器
 *
 * 简写方法，等同于 injectApiManager
 */
export function useApiManager(): ApiManager {
  return injectApiManager()
}
