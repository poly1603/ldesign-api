/**
 * API 注册表
 *
 * 提供声明式的 API 定义方式
 * 支持模块化组织和类型安全
 */

import type {
  HttpMethod,
  LeapApiDefinition,
  RestfulApiDefinition,
  ServerConfig,
  UnifiedApiDefinition,
} from '../types'

// ============================================================================
// API 定义构建器
// ============================================================================

/**
 * RESTful API 构建器
 */
export interface RestfulApiBuilder<TParams = unknown, TResponse = unknown> {
  /** 设置描述 */
  describe(description: string): this
  /** 设置路径参数 */
  pathParams(...params: string[]): this
  /** 设置查询参数键 */
  queryKeys(...keys: string[]): this
  /** 设置请求转换器 */
  transformRequest(fn: (params: TParams) => unknown): this
  /** 设置响应转换器 */
  transformResponse(fn: (data: unknown) => TResponse): this
  /** 构建 API 定义 */
  build(): RestfulApiDefinition<TParams, TResponse>
}

/**
 * LEAP API 构建器
 */
export interface LeapApiBuilder<TParams = unknown, TResponse = unknown> {
  /** 设置描述 */
  describe(description: string): this
  /** 设置服务名称 */
  service(name: string): this
  /** 设置路由 */
  router(name: string): this
  /** 设置请求类型 */
  requestType(type: number): this
  /** 设置参数转换器 */
  transformParams(fn: (params: TParams) => Record<string, unknown>): this
  /** 设置响应转换器 */
  transformResponse(fn: (data: unknown) => TResponse): this
  /** 构建 API 定义 */
  build(): LeapApiDefinition<TParams, TResponse>
}

// ============================================================================
// API 定义工厂
// ============================================================================

/**
 * 定义 RESTful API
 */
export function defineRestfulApi<TParams = unknown, TResponse = unknown>(
  serverId: string,
  name: string,
  method: HttpMethod,
  path: string
): RestfulApiBuilder<TParams, TResponse> {
  const api: RestfulApiDefinition<TParams, TResponse> = {
    name,
    serverId,
    type: 'restful',
    method,
    path,
  }

  const builder: RestfulApiBuilder<TParams, TResponse> = {
    describe(description: string) {
      api.description = description
      return this
    },
    pathParams(...params: string[]) {
      api.pathParams = params
      return this
    },
    queryKeys(...keys: string[]) {
      api.queryKeys = keys
      return this
    },
    transformRequest(fn) {
      api.transformRequest = fn
      return this
    },
    transformResponse(fn) {
      api.transformResponse = fn
      return this
    },
    build() {
      return api
    },
  }

  return builder
}

/**
 * 定义 LEAP API
 */
export function defineLeapApi<TParams = unknown, TResponse = unknown>(
  serverId: string,
  name: string,
  method: string
): LeapApiBuilder<TParams, TResponse> {
  const api: LeapApiDefinition<TParams, TResponse> = {
    name,
    serverId,
    type: 'leap',
    method,
  }

  const builder: LeapApiBuilder<TParams, TResponse> = {
    describe(description: string) {
      api.description = description
      return this
    },
    service(name: string) {
      api.service = name
      return this
    },
    router(name: string) {
      api.router = name
      return this
    },
    requestType(type: number) {
      api.requestType = type
      return this
    },
    transformParams(fn) {
      api.transformParams = fn
      return this
    },
    transformResponse(fn) {
      api.transformResponse = fn
      return this
    },
    build() {
      return api
    },
  }

  return builder
}

// ============================================================================
// API 模块定义
// ============================================================================

/**
 * API 模块
 */
export interface ApiModule {
  /** 模块名称 */
  name: string
  /** 模块描述 */
  description?: string
  /** API 列表 */
  apis: UnifiedApiDefinition[]
}

/**
 * 定义 API 模块
 */
export function defineApiModule(
  name: string,
  apis: UnifiedApiDefinition[],
  description?: string
): ApiModule {
  return {
    name,
    description,
    apis,
  }
}

// ============================================================================
// 服务器配置定义
// ============================================================================

/**
 * 定义服务器配置
 */
export function defineServer(config: ServerConfig): ServerConfig {
  return config
}

/**
 * 定义 RESTful 服务器
 */
export function defineRestfulServer(
  id: string,
  baseUrl: string,
  options?: Partial<Omit<ServerConfig, 'id' | 'baseUrl' | 'type'>>
): ServerConfig {
  return {
    id,
    baseUrl,
    type: 'restful',
    ...options,
  }
}

/**
 * 定义 LEAP 服务器
 */
export function defineLeapServer(
  id: string,
  baseUrl: string,
  options?: Partial<Omit<ServerConfig, 'id' | 'baseUrl' | 'type'>>
): ServerConfig {
  return {
    id,
    baseUrl,
    type: 'leap',
    timeout: options?.timeout ?? 30000,
    withCredentials: options?.withCredentials !== false,
    leap: {
      rpcPath: '/LEAP/Service/RPC/RPC.DO',
      defaultService: 'leap',
      ...options?.leap,
    },
    ...options,
  }
}

// ============================================================================
// 快捷 API 定义
// ============================================================================

/**
 * 创建 RESTful CRUD API 集合
 */
export function createCrudApis<TEntity>(
  serverId: string,
  resourceName: string,
  basePath: string
): {
  list: RestfulApiDefinition<void, TEntity[]>
  get: RestfulApiDefinition<{ id: string | number }, TEntity>
  create: RestfulApiDefinition<Partial<TEntity>, TEntity>
  update: RestfulApiDefinition<{ id: string | number } & Partial<TEntity>, TEntity>
  delete: RestfulApiDefinition<{ id: string | number }, void>
} {
  return {
    list: defineRestfulApi<void, TEntity[]>(serverId, `${resourceName}List`, 'GET', basePath)
      .describe(`获取${resourceName}列表`)
      .build(),

    get: defineRestfulApi<{ id: string | number }, TEntity>(
      serverId,
      `${resourceName}Get`,
      'GET',
      `${basePath}/:id`
    )
      .describe(`获取${resourceName}详情`)
      .pathParams('id')
      .build(),

    create: defineRestfulApi<Partial<TEntity>, TEntity>(
      serverId,
      `${resourceName}Create`,
      'POST',
      basePath
    )
      .describe(`创建${resourceName}`)
      .build(),

    update: defineRestfulApi<{ id: string | number } & Partial<TEntity>, TEntity>(
      serverId,
      `${resourceName}Update`,
      'PUT',
      `${basePath}/:id`
    )
      .describe(`更新${resourceName}`)
      .pathParams('id')
      .build(),

    delete: defineRestfulApi<{ id: string | number }, void>(
      serverId,
      `${resourceName}Delete`,
      'DELETE',
      `${basePath}/:id`
    )
      .describe(`删除${resourceName}`)
      .pathParams('id')
      .build(),
  }
}

/**
 * 创建 LEAP 方法集合
 */
export function createLeapApis<TMethods extends Record<string, { params?: unknown; response?: unknown }>>(
  serverId: string,
  methods: { [K in keyof TMethods]: { method: string; description?: string } }
): { [K in keyof TMethods]: LeapApiDefinition<TMethods[K]['params'], TMethods[K]['response']> } {
  const result = {} as any

  for (const [key, config] of Object.entries(methods)) {
    result[key] = defineLeapApi(serverId, key, config.method)
      .describe(config.description || '')
      .build()
  }

  return result
}
