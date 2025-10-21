/**
 * @ldesign/api - UMD 构建专用入口文件
 * 为浏览器环境和库模式提供精简的 API 界面
 * 仅导出核心功能，不包含Vue/React特定集成
 */
export { ApiEngineImpl } from './core/ApiEngine';
export { createApiEngine, createSingletonApiEngine, createSystemApiEngine, destroySingletonApiEngine, } from './core/factory';
export { systemApiPlugin } from './plugins/systemApi';
export type { ApiCallOptions, ApiEngine, ApiEngineConfig, ApiMethodConfig, ApiPlugin, CacheConfig, CacheStats, LoginParams, LoginResult, MenuItem, SystemApiMethodName, UserInfo, } from './types';
export { SYSTEM_API_METHODS } from './types';
export type { TypedApiEngine } from './types/typed';
export { withTypedApi } from './types/typed';
export { CacheManager } from './utils/CacheManager';
export { version } from './version';
