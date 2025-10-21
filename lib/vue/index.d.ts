/**
 * Vue 集成模块入口
 * 导出所有 Vue 相关的功能和核心 API（便于 Vue 用户使用）
 */
export { createApiEngine, createApiEngineByEnv, createSingletonApiEngine, createSystemApiEngine, destroySingletonApiEngine, } from '../core/factory';
export { systemApiPlugin, } from '../plugins/systemApi';
export type { ApiCallOptions, ApiEngine, ApiEngineConfig, ApiPlugin, LoginParams, LoginResult, MenuItem, SystemApiMethodName, UserInfo, } from '../types';
export { SYSTEM_API_METHODS } from '../types';
export { version } from '../version';
export { useApi, useApiCall, useApiCleanup, useApiPolling, useBatchApiCall, useInfiniteApi, useMutation, usePaginatedApi, useRequest, useSystemApi, } from './composables';
export type { ApiCallState, UseApiCallOptions, UseMutationOptions, } from './composables';
export { vIntersect } from './directives';
export { apiPlugin, createApiEnginePlugin, createApiEnginePluginByEnv, createDevelopmentApiEnginePlugin, createProductionApiEnginePlugin, defaultApiEnginePlugin, } from './engine';
export type { ApiEnginePluginOptions } from './engine';
export { API_ENGINE_INJECTION_KEY, ApiVuePlugin, createApiVuePlugin, getApiEngineFromApp, installApiVuePlugin, } from './plugin';
export type { ApiVuePluginOptions } from './plugin';
export { useApiAvailable, useApiMethod, useApiStatus, useDebouncedRef, useIntersectionObserver, } from './utils';
export type { UseIntersectionOptions } from './utils';
