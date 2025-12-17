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

// ============================================================================
// 类型定义
// ============================================================================

export type {
  // 服务器配置
  ServerType,
  ServerConfig,
  LeapServerConfig,
  // API 定义
  HttpMethod,
  ApiDefinition,
  RestfulApiDefinition,
  LeapApiDefinition,
  UnifiedApiDefinition,
  // 请求选项
  RestfulRequestOptions,
  LeapRequestOptions,
  ApiRequestOptions,
  // 结果
  ApiResult,
  ApiError,
  // 管理器
  ApiManagerConfig,
  ApiManager,
  // 适配器
  ApiAdapter,
  // 代理
  ProxyConfig,
  ProxyGenerator,
} from './types'

export {
  // 类型守卫
  isRestfulApi,
  isLeapApi,
  isApiError,
  createApiError,
} from './types'

// ============================================================================
// 管理器
// ============================================================================

export {
  ApiManagerImpl,
  createApiManager,
  createApiManagerAsync,
} from './manager'

// ============================================================================
// 适配器
// ============================================================================

export {
  RestfulAdapter,
  createRestfulAdapter,
  LeapAdapter,
  createLeapAdapter,
} from './adapters'

// ============================================================================
// 注册表
// ============================================================================

export {
  // API 定义
  defineRestfulApi,
  defineLeapApi,
  defineApiModule,
  // 服务器定义
  defineServer,
  defineRestfulServer,
  defineLeapServer,
  // 快捷方法
  createCrudApis,
  createLeapApis,
} from './registry'

export type {
  RestfulApiBuilder,
  LeapApiBuilder,
  ApiModule,
} from './registry'

// ============================================================================
// 代理配置
// ============================================================================

export {
  ProxyGeneratorImpl,
  createProxyGenerator,
  generateViteProxyConfig,
  generateLeapProxyConfig,
} from './proxy'

// ============================================================================
// 版本信息
// ============================================================================

export { version } from './constants/version'

// ============================================================================
// 默认导出
// ============================================================================

export { createApiManager as default } from './manager'
