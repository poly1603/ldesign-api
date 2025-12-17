/**
 * @ldesign/api-core 类型定义
 *
 * 定义 API 管理器的核心类型
 */

import type { HttpClient, RequestConfig } from '@ldesign/http-core'

// ============================================================================
// 服务器配置
// ============================================================================

/**
 * 服务器类型
 */
export type ServerType = 'restful' | 'leap' | 'custom'

/**
 * 服务器配置
 */
export interface ServerConfig {
  /** 服务器唯一标识 */
  id: string
  /** 服务器名称 */
  name?: string
  /** 服务器基础 URL */
  baseUrl: string
  /** 服务器类型 */
  type: ServerType
  /** 超时时间（毫秒） */
  timeout?: number
  /** 默认请求头 */
  headers?: Record<string, string>
  /** 是否携带凭证 */
  withCredentials?: boolean
  /** LEAP 特有配置 */
  leap?: LeapServerConfig
  /** 自定义配置 */
  custom?: Record<string, unknown>
}

/**
 * LEAP 服务器配置
 */
export interface LeapServerConfig {
  /** RPC 端点路径 */
  rpcPath?: string
  /** 系统前缀（如 LPOM、LROA 等） */
  systemPrefix?: string
  /** 默认服务名称 */
  defaultService?: string
  /** 会话 ID 获取函数 */
  getSid?: () => string | Promise<string>
  /** Lid 获取函数 */
  getLid?: () => string | Promise<string>
  /** 系统区域 */
  sysArea?: number
  /** 系统名称 */
  sysName?: string
}

// ============================================================================
// API 定义
// ============================================================================

/**
 * HTTP 方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

/**
 * API 定义基础接口
 */
export interface ApiDefinition<TParams = unknown, TResponse = unknown> {
  /** API 唯一标识（可选，自动生成） */
  id?: string
  /** API 名称 */
  name: string
  /** API 描述 */
  description?: string
  /** 所属服务器 ID */
  serverId: string
  /** API 类型 */
  type: ServerType
}

/**
 * RESTful API 定义
 */
export interface RestfulApiDefinition<TParams = unknown, TResponse = unknown>
  extends ApiDefinition<TParams, TResponse> {
  type: 'restful'
  /** 请求路径 */
  path: string
  /** HTTP 方法 */
  method: HttpMethod
  /** 路径参数定义（如 /users/:id 中的 id） */
  pathParams?: string[]
  /** 查询参数键 */
  queryKeys?: string[]
  /** 请求体转换器 */
  transformRequest?: (params: TParams) => unknown
  /** 响应转换器 */
  transformResponse?: (data: unknown) => TResponse
}

/**
 * LEAP API 定义
 */
export interface LeapApiDefinition<TParams = unknown, TResponse = unknown>
  extends ApiDefinition<TParams, TResponse> {
  type: 'leap'
  /** LEAP 方法名 */
  method: string
  /** 服务名称（覆盖服务器默认值） */
  service?: string
  /** 路由标识 */
  router?: string
  /** 请求类型 */
  requestType?: number
  /** 参数转换器 */
  transformParams?: (params: TParams) => Record<string, unknown>
  /** 响应转换器 */
  transformResponse?: (data: unknown) => TResponse
}

/**
 * 统一 API 定义类型
 */
export type UnifiedApiDefinition<TParams = unknown, TResponse = unknown> =
  | RestfulApiDefinition<TParams, TResponse>
  | LeapApiDefinition<TParams, TResponse>

// ============================================================================
// API 调用
// ============================================================================

/**
 * RESTful 请求选项
 */
export interface RestfulRequestOptions {
  /** 路径参数 */
  pathParams?: Record<string, string | number>
  /** 查询参数 */
  query?: Record<string, unknown>
  /** 请求体 */
  body?: unknown
  /** 附加请求头 */
  headers?: Record<string, string>
  /** 超时时间 */
  timeout?: number
  /** 取消信号 */
  signal?: AbortSignal
}

/**
 * LEAP 请求选项
 */
export interface LeapRequestOptions {
  /** 请求参数 */
  params?: Record<string, unknown>
  /** 扩展参数 */
  extend?: string
  /** 超时时间 */
  timeout?: number
  /** URL 附加参数 */
  urlParams?: Record<string, string>
  /** 是否返回 JSON */
  returnJson?: boolean
  /** 取消信号 */
  signal?: AbortSignal
}

/**
 * 统一请求选项
 */
export type ApiRequestOptions = RestfulRequestOptions | LeapRequestOptions

/**
 * API 调用结果
 */
export interface ApiResult<T = unknown> {
  /** 响应数据 */
  data: T
  /** HTTP 状态码 */
  status: number
  /** 响应头 */
  headers: Record<string, string>
  /** 原始响应（用于调试） */
  raw?: unknown
}

/**
 * API 错误
 */
export interface ApiError extends Error {
  /** 错误代码 */
  code?: string
  /** HTTP 状态码 */
  status?: number
  /** API 定义 */
  api?: UnifiedApiDefinition
  /** 请求选项 */
  options?: ApiRequestOptions
  /** 原始错误 */
  cause?: unknown
}

// ============================================================================
// API 管理器
// ============================================================================

/**
 * API 管理器配置
 */
export interface ApiManagerConfig {
  /** 默认服务器 ID */
  defaultServerId?: string
  /** 服务器列表 */
  servers?: ServerConfig[]
  /** 全局请求拦截器 */
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  /** 全局响应拦截器 */
  onResponse?: <T>(result: ApiResult<T>) => T | Promise<T>
  /** 全局错误处理器 */
  onError?: (error: ApiError) => void | Promise<void>
  /** HTTP 客户端工厂 */
  httpClientFactory?: (config: ServerConfig) => HttpClient | Promise<HttpClient>
}

/**
 * API 管理器接口
 */
export interface ApiManager {
  // ==================== 服务器管理 ====================

  /** 注册服务器 */
  registerServer(config: ServerConfig): void
  /** 获取服务器 */
  getServer(id: string): ServerConfig | undefined
  /** 获取所有服务器 */
  getServers(): ServerConfig[]
  /** 移除服务器 */
  removeServer(id: string): boolean
  /** 设置默认服务器 */
  setDefaultServer(id: string): void

  // ==================== API 注册 ====================

  /** 注册 API */
  register<TParams = unknown, TResponse = unknown>(
    api: UnifiedApiDefinition<TParams, TResponse>
  ): string
  /** 批量注册 API */
  registerAll(apis: UnifiedApiDefinition[]): string[]
  /** 获取 API 定义 */
  getApi(id: string): UnifiedApiDefinition | undefined
  /** 获取所有 API */
  getApis(): UnifiedApiDefinition[]
  /** 移除 API */
  removeApi(id: string): boolean

  // ==================== API 调用 ====================

  /** 调用 API */
  call<TResponse = unknown>(
    idOrApi: string | UnifiedApiDefinition,
    options?: ApiRequestOptions
  ): Promise<ApiResult<TResponse>>

  /** 创建类型安全的 API 调用器 */
  createCaller<TParams, TResponse>(
    api: UnifiedApiDefinition<TParams, TResponse>
  ): (params: TParams, options?: Omit<ApiRequestOptions, 'params' | 'body'>) => Promise<TResponse>

  // ==================== 生命周期 ====================

  /** 初始化 */
  init(): Promise<void>
  /** 销毁 */
  destroy(): void
}

// ============================================================================
// 适配器
// ============================================================================

/**
 * API 适配器接口
 */
export interface ApiAdapter {
  /** 适配器类型 */
  readonly type: ServerType
  /** 执行请求 */
  execute<TResponse = unknown>(
    api: UnifiedApiDefinition,
    options: ApiRequestOptions,
    httpClient: HttpClient,
    serverConfig: ServerConfig
  ): Promise<ApiResult<TResponse>>
}

// ============================================================================
// 代理配置
// ============================================================================

/**
 * 代理配置
 */
export interface ProxyConfig {
  /** 代理路径前缀 */
  path: string
  /** 目标服务器 URL */
  target: string
  /** 是否改变源 */
  changeOrigin?: boolean
  /** 是否重写路径 */
  rewrite?: (path: string) => string
  /** 是否安全（HTTPS） */
  secure?: boolean
  /** WebSocket 支持 */
  ws?: boolean
  /** 附加请求头 */
  headers?: Record<string, string>
}

/**
 * 生成代理配置
 */
export interface ProxyGenerator {
  /** 从服务器配置生成代理 */
  fromServer(server: ServerConfig, pathPrefix: string): ProxyConfig
  /** 从多个服务器生成代理配置对象 */
  fromServers(servers: ServerConfig[]): Record<string, ProxyConfig>
}

// ============================================================================
// 类型守卫
// ============================================================================

/**
 * 判断是否为 RESTful API 定义
 */
export function isRestfulApi(api: UnifiedApiDefinition): api is RestfulApiDefinition {
  return api.type === 'restful'
}

/**
 * 判断是否为 LEAP API 定义
 */
export function isLeapApi(api: UnifiedApiDefinition): api is LeapApiDefinition {
  return api.type === 'leap'
}

/**
 * 判断是否为 API 错误
 */
export function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'name' in error &&
    (error as Error).name === 'ApiError'
  )
}

/**
 * 创建 API 错误
 */
export function createApiError(
  message: string,
  options?: Partial<ApiError>
): ApiError {
  const error = new Error(message) as ApiError
  error.name = 'ApiError'

  if (options) {
    error.code = options.code
    error.status = options.status
    error.api = options.api
    error.options = options.options
    error.cause = options.cause
  }

  return error
}
