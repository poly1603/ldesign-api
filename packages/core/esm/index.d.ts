/**
 * @ldesign/api-core
 *
 * 框架无关的 API 管理核心库
 * 支持多服务器、RESTful 和 LEAP 接口统一管理
 *
 * @module @ldesign/api-core
 * @version 0.1.0
 * @author LDesign Team
 * @license MIT
 */
export type { ServerType, ServerConfig, LeapServerConfig, HttpMethod, ApiDefinition, RestfulApiDefinition, LeapApiDefinition, UnifiedApiDefinition, RestfulRequestOptions, LeapRequestOptions, ApiRequestOptions, ApiResult, ApiError, ApiManagerConfig, ApiManager, ApiAdapter, ProxyConfig, ProxyGenerator, } from './types';
export { isRestfulApi, isLeapApi, isApiError, createApiError, } from './types';
export { ApiManagerImpl, createApiManager, createApiManagerAsync, } from './manager';
export { RestfulAdapter, createRestfulAdapter, LeapAdapter, createLeapAdapter, } from './adapters';
export { defineRestfulApi, defineLeapApi, defineApiModule, defineServer, defineRestfulServer, defineLeapServer, createCrudApis, createLeapApis, } from './registry';
export type { RestfulApiBuilder, LeapApiBuilder, ApiModule, } from './registry';
export { ProxyGeneratorImpl, createProxyGenerator, generateViteProxyConfig, generateLeapProxyConfig, } from './proxy';
export { version } from './constants/version';
export { createApiManager as default } from './manager';
//# sourceMappingURL=index.d.ts.map