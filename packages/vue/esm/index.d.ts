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
export * from '@ldesign/api-core';
export { API_MANAGER_KEY, API_CONFIG_KEY, } from './constants/symbols';
export { provideApiManager, injectApiManager, injectApiConfig, useApiManager, useApi, useLeapApi, createLeapCaller, useRestfulApi, createRestfulResource, } from './composables';
export type { UseApiOptions, UseApiReturn, UseLeapApiOptions, UseLeapApiReturn, UseRestfulApiOptions, UseRestfulApiReturn, } from './composables';
export { createApiPlugin, ApiPlugin, createApiEnginePlugin, } from './plugin';
export type { ApiPluginOptions, ApiEnginePluginOptions, } from './plugin';
export { version } from './constants/version';
export { useApi as default } from './composables';
//# sourceMappingURL=index.d.ts.map