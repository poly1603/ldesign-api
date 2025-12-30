/**
 * @ldesign/api-vue
 *
 * Vue 3 集成的 API 管理库
 * 提供响应式组合函数和插件
 *
 * @module @ldesign/api-vue
 * @version 0.1.0
 * @author LDesign Team
 * @license MIT
 */

// ============================================================================
// 重新导出 Core
// ============================================================================

export * from '@ldesign/api-core'

// ============================================================================
// 注入键
// ============================================================================

export {
  API_MANAGER_KEY,
  API_CONFIG_KEY,
} from './constants/symbols'

// ============================================================================
// 组合函数
// ============================================================================

export {
  // API 管理器
  provideApiManager,
  injectApiManager,
  injectApiConfig,
  useApiManager,
  // 通用 API
  useApi,
  // LEAP API
  useLeapApi,
  createLeapCaller,
  // RESTful API
  useRestfulApi,
  createRestfulResource,
} from './composables'

export type {
  UseApiOptions,
  UseApiReturn,
  UseLeapApiOptions,
  UseLeapApiReturn,
  UseRestfulApiOptions,
  UseRestfulApiReturn,
} from './composables'

// ============================================================================
// 插件
// ============================================================================

export {
  createApiPlugin,
  ApiPlugin,
  createApiEnginePlugin,
} from './plugin'

export type {
  ApiPluginOptions,
  ApiEnginePluginOptions,
} from './plugin'

// ============================================================================
// 版本信息
// ============================================================================

export { version } from './constants/version'

// ============================================================================
// 默认导出
// ============================================================================

export { useApi as default } from './composables'
