/**
 * RESTful API 适配器
 *
 * 处理标准 RESTful 风格的 HTTP 请求
 */

import type { HttpClient, RequestConfig } from '@ldesign/http-core'
import type {
  ApiAdapter,
  ApiResult,
  RestfulApiDefinition,
  RestfulRequestOptions,
  ServerConfig,
  UnifiedApiDefinition,
} from '../types'
import { createApiError, isRestfulApi } from '../types'

/**
 * RESTful 适配器实现
 */
export class RestfulAdapter implements ApiAdapter {
  readonly type = 'restful' as const

  async execute<TResponse = unknown>(
    api: UnifiedApiDefinition,
    options: RestfulRequestOptions = {},
    httpClient: HttpClient,
    serverConfig: ServerConfig
  ): Promise<ApiResult<TResponse>> {
    if (!isRestfulApi(api)) {
      throw createApiError(`Invalid API type: expected 'restful', got '${api.type}'`)
    }

    const restfulApi = api as RestfulApiDefinition
    const url = this.buildUrl(restfulApi, options, serverConfig)
    const method = restfulApi.method

    // 构建请求配置
    const requestConfig: RequestConfig = {
      url,
      method,
      timeout: options.timeout ?? serverConfig.timeout,
      headers: {
        ...serverConfig.headers,
        ...options.headers,
      },
      withCredentials: serverConfig.withCredentials,
    }

    // 添加请求体
    if (options.body !== undefined) {
      const transformedBody = restfulApi.transformRequest
        ? restfulApi.transformRequest(options.body)
        : options.body
      requestConfig.data = transformedBody
    }

    // 添加查询参数
    if (options.query) {
      requestConfig.params = options.query
    }

    // 添加取消信号
    if (options.signal) {
      requestConfig.signal = options.signal
    }

    try {
      const response = await httpClient.request<unknown>(requestConfig)

      // 转换响应数据
      const transformedData = restfulApi.transformResponse
        ? restfulApi.transformResponse(response.data)
        : response.data

      return {
        data: transformedData as TResponse,
        status: response.status,
        headers: response.headers,
        raw: response,
      }
    } catch (error) {
      throw createApiError(
        `RESTful request failed: ${restfulApi.method} ${url}`,
        {
          api,
          options,
          cause: error,
          status: (error as { status?: number }).status,
        }
      )
    }
  }

  /**
   * 构建请求 URL
   */
  private buildUrl(
    api: RestfulApiDefinition,
    options: RestfulRequestOptions,
    serverConfig: ServerConfig
  ): string {
    let path = api.path

    // 替换路径参数
    if (options.pathParams) {
      for (const [key, value] of Object.entries(options.pathParams)) {
        path = path.replace(`:${key}`, encodeURIComponent(String(value)))
        path = path.replace(`{${key}}`, encodeURIComponent(String(value)))
      }
    }

    // 检查是否还有未替换的路径参数
    const unreplacedParams = path.match(/[:{}]\w+/g)
    if (unreplacedParams) {
      throw createApiError(
        `Missing path parameters: ${unreplacedParams.join(', ')}`
      )
    }

    // 组合基础 URL
    const baseUrl = serverConfig.baseUrl.replace(/\/$/, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    return `${baseUrl}${normalizedPath}`
  }
}

/**
 * 创建 RESTful 适配器
 */
export function createRestfulAdapter(): RestfulAdapter {
  return new RestfulAdapter()
}
