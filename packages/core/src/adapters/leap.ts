/**
 * LEAP API 适配器
 *
 * 处理 LEAP RPC 风格的请求，兼容老系统接口
 * 支持 LPOM、LROA 等系统前缀
 */

import type { HttpClient, RequestConfig } from '@ldesign/http-core'
import type {
  ApiAdapter,
  ApiResult,
  LeapApiDefinition,
  LeapRequestOptions,
  ServerConfig,
  UnifiedApiDefinition,
} from '../types'
import { createApiError, isLeapApi } from '../types'

/**
 * LEAP 适配器实现
 */
export class LeapAdapter implements ApiAdapter {
  readonly type = 'leap' as const

  async execute<TResponse = unknown>(
    api: UnifiedApiDefinition,
    options: LeapRequestOptions = {},
    httpClient: HttpClient,
    serverConfig: ServerConfig
  ): Promise<ApiResult<TResponse>> {
    if (!isLeapApi(api)) {
      throw createApiError(`Invalid API type: expected 'leap', got '${api.type}'`)
    }

    const leapApi = api as LeapApiDefinition
    const leapConfig = serverConfig.leap || {}

    // 构建请求 URL
    const url = this.buildUrl(leapApi, serverConfig)

    // 构建请求体
    const body = await this.buildRequestBody(leapApi, options, leapConfig)

    // 构建请求配置
    const requestConfig: RequestConfig = {
      url,
      method: 'POST',
      data: body,
      timeout: options.timeout ?? serverConfig.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...serverConfig.headers,
      },
      withCredentials: serverConfig.withCredentials !== false,
      responseType: 'text',
    }

    // 添加 LEAP 特有请求头
    if (leapConfig.sysArea !== undefined) {
      requestConfig.headers!['Lsys-Area'] = String(leapConfig.sysArea)
    }
    if (leapConfig.sysName) {
      requestConfig.headers!['Lsys-Name'] = leapConfig.sysName
    }

    // 添加取消信号
    if (options.signal) {
      requestConfig.signal = options.signal
    }

    try {
      const response = await httpClient.request<string>(requestConfig)

      // 解析响应
      const parsedData = this.parseResponse(response.data, options)

      // 转换响应数据
      const transformedData = leapApi.transformResponse
        ? leapApi.transformResponse(parsedData)
        : parsedData

      return {
        data: transformedData as TResponse,
        status: response.status,
        headers: response.headers,
        raw: response,
      }
    } catch (error) {
      throw createApiError(
        `LEAP request failed: ${leapApi.method}`,
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
   * 构建 LEAP 请求 URL
   */
  private buildUrl(
    api: LeapApiDefinition,
    serverConfig: ServerConfig
  ): string {
    const leapConfig = serverConfig.leap || {}
    const baseUrl = serverConfig.baseUrl.replace(/\/$/, '')
    const systemPrefix = leapConfig.systemPrefix || ''
    const rpcPath = leapConfig.rpcPath || '/LEAP/Service/RPC/RPC.DO'

    // 处理路由
    if (api.router && api.router !== 'leap') {
      const routerPath = `/LEAP/Service/RPC/${api.router}/RPC.DO`
      return `${baseUrl}${systemPrefix}${routerPath}`
    }

    return `${baseUrl}${systemPrefix}${rpcPath}`
  }

  /**
   * 构建 LEAP 请求体
   */
  private async buildRequestBody(
    api: LeapApiDefinition,
    options: LeapRequestOptions,
    leapConfig: NonNullable<ServerConfig['leap']>
  ): Promise<string> {
    const params: string[] = []

    // 方法名
    params.push(`method=${encodeURIComponent(api.method)}`)

    // 会话 ID
    if (leapConfig.getSid) {
      const sid = await leapConfig.getSid()
      if (sid) {
        params.push(`sid=${encodeURIComponent(sid)}`)
      }
    }

    // Lid
    if (leapConfig.getLid) {
      const lid = await leapConfig.getLid()
      if (lid) {
        params.push(`Lid=${encodeURIComponent(lid)}`)
      }
    }

    // 服务名称
    const service = api.service || leapConfig.defaultService
    if (service && service !== 'leap') {
      params.push(`callService=${encodeURIComponent(service)}`)
    }

    // 请求类型
    if (api.requestType && api.requestType !== 1) {
      params.push(`type=${api.requestType}`)
    }

    // 是否返回 JSON
    if (options.returnJson === false) {
      params.push('returnJSON=0')
    }

    // URL 附加参数
    if (options.urlParams) {
      for (const [key, value] of Object.entries(options.urlParams)) {
        if (value != null) {
          params.push(`u_${key}=${encodeURIComponent(value)}`)
        }
      }
    }

    // 扩展参数
    if (options.extend) {
      params.push(`extend=${encodeURIComponent(encodeURIComponent(escape(options.extend)))}`)
    }

    // 请求参数
    if (options.params) {
      const transformedParams = api.transformParams
        ? api.transformParams(options.params)
        : options.params

      if (transformedParams && typeof transformedParams === 'object') {
        const parJson = JSON.stringify(transformedParams)
        params.push(`par=${encodeURIComponent(parJson)}`)
      }
    }

    return params.join('&')
  }

  /**
   * 解析 LEAP 响应
   */
  private parseResponse<T>(
    responseText: string,
    options: LeapRequestOptions
  ): T {
    if (!responseText) {
      return null as T
    }

    // 如果不需要返回 JSON，直接返回原始文本
    if (options.returnJson === false) {
      return responseText as T
    }

    // 尝试解析 JSON
    try {
      return JSON.parse(responseText) as T
    } catch {
      // 解析失败，返回原始文本
      return responseText as T
    }
  }
}

/**
 * 创建 LEAP 适配器
 */
export function createLeapAdapter(): LeapAdapter {
  return new LeapAdapter()
}
