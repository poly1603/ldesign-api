/**
 * API 管理器实现
 *
 * 提供统一的 API 注册、管理和调用功能
 * 支持多服务器、多种接口类型
 */

import type { HttpClient } from '@ldesign/http-core'
import { createHttpClient } from '@ldesign/http-core'
import type {
  ApiAdapter,
  ApiManager,
  ApiManagerConfig,
  ApiRequestOptions,
  ApiResult,
  ServerConfig,
  ServerType,
  UnifiedApiDefinition,
} from '../types'
import { createApiError } from '../types'
import { createLeapAdapter } from '../adapters/leap'
import { createRestfulAdapter } from '../adapters/restful'

/**
 * API 管理器实现类
 */
export class ApiManagerImpl implements ApiManager {
  private config: ApiManagerConfig
  private servers: Map<string, ServerConfig> = new Map()
  private apis: Map<string, UnifiedApiDefinition> = new Map()
  private adapters: Map<ServerType, ApiAdapter> = new Map()
  private httpClients: Map<string, HttpClient> = new Map()
  private defaultServerId: string | null = null
  private initialized = false

  constructor(config: ApiManagerConfig = {}) {
    this.config = config

    // 注册默认适配器
    this.adapters.set('restful', createRestfulAdapter())
    this.adapters.set('leap', createLeapAdapter())

    // 注册初始服务器
    if (config.servers) {
      for (const server of config.servers) {
        this.registerServer(server)
      }
    }

    // 设置默认服务器
    if (config.defaultServerId) {
      this.defaultServerId = config.defaultServerId
    }
  }

  // ==================== 服务器管理 ====================

  registerServer(config: ServerConfig): void {
    if (!config.id) {
      throw createApiError('Server ID is required')
    }

    this.servers.set(config.id, config)

    // 如果是第一个服务器，设为默认
    if (this.servers.size === 1 && !this.defaultServerId) {
      this.defaultServerId = config.id
    }
  }

  getServer(id: string): ServerConfig | undefined {
    return this.servers.get(id)
  }

  getServers(): ServerConfig[] {
    return Array.from(this.servers.values())
  }

  removeServer(id: string): boolean {
    const deleted = this.servers.delete(id)

    if (deleted) {
      // 清理相关的 HTTP 客户端
      this.httpClients.delete(id)

      // 如果删除的是默认服务器，重新设置
      if (this.defaultServerId === id) {
        this.defaultServerId = this.servers.size > 0
          ? this.servers.keys().next().value ?? null
          : null
      }
    }

    return deleted
  }

  setDefaultServer(id: string): void {
    if (!this.servers.has(id)) {
      throw createApiError(`Server not found: ${id}`)
    }
    this.defaultServerId = id
  }

  // ==================== API 注册 ====================

  register<TParams = unknown, TResponse = unknown>(
    api: UnifiedApiDefinition<TParams, TResponse>
  ): string {
    // 生成 ID
    const id = api.id || this.generateApiId(api as UnifiedApiDefinition)

    // 验证服务器存在
    if (!this.servers.has(api.serverId)) {
      throw createApiError(`Server not found: ${api.serverId}`)
    }

    // 验证适配器存在
    if (!this.adapters.has(api.type)) {
      throw createApiError(`Adapter not found for type: ${api.type}`)
    }

    // 注册 API（使用类型断言存储）
    this.apis.set(id, { ...api, id } as UnifiedApiDefinition)

    return id
  }

  registerAll(apis: UnifiedApiDefinition[]): string[] {
    return apis.map(api => this.register(api))
  }

  getApi(id: string): UnifiedApiDefinition | undefined {
    return this.apis.get(id)
  }

  getApis(): UnifiedApiDefinition[] {
    return Array.from(this.apis.values())
  }

  removeApi(id: string): boolean {
    return this.apis.delete(id)
  }

  // ==================== API 调用 ====================

  async call<TResponse = unknown>(
    idOrApi: string | UnifiedApiDefinition,
    options: ApiRequestOptions = {}
  ): Promise<ApiResult<TResponse>> {
    // 获取 API 定义
    let api: UnifiedApiDefinition | undefined

    if (typeof idOrApi === 'string') {
      api = this.apis.get(idOrApi)
      if (!api) {
        throw createApiError(`API not found: ${idOrApi}`)
      }
    } else {
      api = idOrApi
    }

    // 获取服务器配置
    const serverConfig = this.servers.get(api.serverId)
    if (!serverConfig) {
      throw createApiError(`Server not found: ${api.serverId}`)
    }

    // 获取适配器
    const adapter = this.adapters.get(api.type)
    if (!adapter) {
      throw createApiError(`Adapter not found for type: ${api.type}`)
    }

    // 获取 HTTP 客户端
    const httpClient = await this.getHttpClient(serverConfig)

    try {
      // 执行请求
      const result = await adapter.execute<TResponse>(
        api,
        options,
        httpClient,
        serverConfig
      )

      // 应用全局响应拦截器
      if (this.config.onResponse) {
        const transformedData = await this.config.onResponse(result)
        return {
          ...result,
          data: transformedData as TResponse,
        }
      }

      return result
    } catch (error) {
      // 应用全局错误处理器
      if (this.config.onError) {
        await this.config.onError(error as any)
      }
      throw error
    }
  }

  createCaller<TParams, TResponse>(
    api: UnifiedApiDefinition<TParams, TResponse>
  ): (params: TParams, options?: Omit<ApiRequestOptions, 'params' | 'body'>) => Promise<TResponse> {
    // 先注册 API
    const id = this.register(api)

    return async (params: TParams, options = {}) => {
      // 根据 API 类型构建请求选项
      let requestOptions: ApiRequestOptions

      if (api.type === 'leap') {
        requestOptions = {
          ...options,
          params: params as Record<string, unknown>,
        }
      } else {
        requestOptions = {
          ...options,
          body: params,
        }
      }

      const result = await this.call<TResponse>(id, requestOptions)
      return result.data
    }
  }

  // ==================== 生命周期 ====================

  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    // 预创建所有服务器的 HTTP 客户端
    const servers = this.getServers()
    await Promise.all(
      servers.map(server => this.getHttpClient(server))
    )

    this.initialized = true
  }

  destroy(): void {
    // 清理所有 HTTP 客户端
    this.httpClients.clear()
    this.apis.clear()
    this.servers.clear()
    this.initialized = false
  }

  // ==================== 私有方法 ====================

  /**
   * 获取或创建 HTTP 客户端
   */
  private async getHttpClient(serverConfig: ServerConfig): Promise<HttpClient> {
    const existing = this.httpClients.get(serverConfig.id)
    if (existing) {
      return existing
    }

    // 使用自定义工厂或默认创建
    let client: HttpClient

    if (this.config.httpClientFactory) {
      client = await this.config.httpClientFactory(serverConfig)
    } else {
      client = await createHttpClient({
        baseURL: serverConfig.baseUrl,
        timeout: serverConfig.timeout || 30000,
        headers: serverConfig.headers,
        withCredentials: serverConfig.withCredentials,
      })
    }

    this.httpClients.set(serverConfig.id, client)
    return client
  }

  /**
   * 生成 API ID
   */
  private generateApiId(api: UnifiedApiDefinition): string {
    const base = `${api.serverId}_${api.name}`
    return base.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
  }

  // ==================== 适配器管理 ====================

  /**
   * 注册自定义适配器
   */
  registerAdapter(type: ServerType, adapter: ApiAdapter): void {
    this.adapters.set(type, adapter)
  }

  /**
   * 获取适配器
   */
  getAdapter(type: ServerType): ApiAdapter | undefined {
    return this.adapters.get(type)
  }
}

/**
 * 创建 API 管理器
 */
export function createApiManager(config?: ApiManagerConfig): ApiManager {
  return new ApiManagerImpl(config)
}

/**
 * 创建并初始化 API 管理器
 */
export async function createApiManagerAsync(config?: ApiManagerConfig): Promise<ApiManager> {
  const manager = createApiManager(config)
  await manager.init()
  return manager
}
