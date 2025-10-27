/**
 * 统一错误处理中间件
 * 提供标准化的错误处理、重试、降级等功能
 */

import type { ErrorMiddleware, ResponseMiddleware } from '../types'
import { ApiError, ApiErrorFactory } from '../utils/ApiError'

/**
 * 错误处理配置
 */
export interface ErrorHandlingConfig {
  /** 是否启用错误日志 */
  enableLogging?: boolean
  /** 错误日志级别 */
  logLevel?: 'error' | 'warn' | 'info'
  /** 自定义错误处理器 */
  onError?: (error: ApiError, context: any) => void
  /** 错误上报函数 */
  reportError?: (error: ApiError) => void
  /** 是否启用错误降级 */
  enableFallback?: boolean
  /** 降级数据提供函数 */
  fallbackData?: (context: any) => any
  /** 需要重试的错误码 */
  retryableErrorCodes?: number[]
  /** 需要忽略的错误码 */
  ignoredErrorCodes?: number[]
}

/**
 * 创建错误处理中间件
 */
export function createErrorHandlingMiddleware(
  config: ErrorHandlingConfig = {},
): ErrorMiddleware {
  const {
    enableLogging = true,
    logLevel = 'error',
    onError,
    reportError,
    enableFallback = false,
    fallbackData,
    retryableErrorCodes = [408, 429, 500, 502, 503, 504],
    ignoredErrorCodes = [],
  } = config

  return async (error: any, context: any) => {
    // 转换为ApiError
    const apiError = error instanceof ApiError
      ? error
      : ApiErrorFactory.fromUnknownError(error, {
        methodName: context.methodName,
        params: context.params,
        timestamp: Date.now(),
      })

    // 检查是否忽略此错误
    if (apiError.statusCode && ignoredErrorCodes.includes(apiError.statusCode)) {
      // 忽略的错误不处理
      return
    }

    // 记录错误日志
    if (enableLogging) {
      logError(apiError, context, logLevel)
    }

    // 调用自定义错误处理器
    if (onError) {
      try {
        onError(apiError, context)
      }
      catch (handlerError) {
        console.error('[ErrorHandlingMiddleware] Error in custom handler:', handlerError)
      }
    }

    // 上报错误
    if (reportError) {
      try {
        reportError(apiError)
      }
      catch (reportError) {
        console.error('[ErrorHandlingMiddleware] Error in error reporting:', reportError)
      }
    }

    // 错误降级
    if (enableFallback && fallbackData) {
      try {
        const fallback = fallbackData(context)
        if (fallback !== undefined) {
          // 返回降级数据作为响应
          return {
            data: fallback,
            status: 200,
            statusText: 'OK (Fallback)',
            headers: {},
            config: {},
          }
        }
      }
      catch (fallbackError) {
        console.error('[ErrorHandlingMiddleware] Error in fallback:', fallbackError)
      }
    }

    // 不返回任何值，继续抛出错误
  }
}

/**
 * 记录错误日志
 */
function logError(error: ApiError, context: any, level: 'error' | 'warn' | 'info') {
  const message = `[API Error] ${error.message}`
  const details = {
    method: context.methodName,
    params: context.params,
    code: error.code,
    statusCode: error.statusCode,
    attempt: context.attempt,
  }

  switch (level) {
    case 'error':
      console.error(message, details, error)
      break
    case 'warn':
      console.warn(message, details)
      break
    case 'info':
      console.info(message, details)
      break
  }
}

/**
 * 创建网络错误降级中间件
 * 网络错误时返回缓存数据或默认值
 */
export function createNetworkFallbackMiddleware(
  fallbackStrategy: 'cache' | 'default' | ((context: any) => any),
  defaultValue?: any,
): ErrorMiddleware {
  return async (error: any, context: any) => {
    const apiError = error instanceof ApiError ? error : ApiErrorFactory.fromUnknownError(error, context)

    // 仅处理网络错误
    if (!isNetworkError(apiError)) {
      return
    }

    // 根据策略返回降级数据
    if (fallbackStrategy === 'cache') {
      // 尝试从缓存获取
      const cacheKey = `${context.methodName}:${JSON.stringify(context.params || {})}`
      // 注意：这里需要访问engine的cacheManager，实际使用时可能需要调整
      // const cached = context.engine?.cacheManager?.get(cacheKey)
      // if (cached !== null) {
      //   return { data: cached, status: 200, statusText: 'OK (Cache)', headers: {}, config: {} }
      // }
    }
    else if (fallbackStrategy === 'default') {
      return {
        data: defaultValue,
        status: 200,
        statusText: 'OK (Default)',
        headers: {},
        config: {},
      }
    }
    else if (typeof fallbackStrategy === 'function') {
      const fallback = fallbackStrategy(context)
      if (fallback !== undefined) {
        return {
          data: fallback,
          status: 200,
          statusText: 'OK (Custom Fallback)',
          headers: {},
          config: {},
        }
      }
    }
  }
}

/**
 * 判断是否为网络错误
 */
function isNetworkError(error: ApiError): boolean {
  return (
    error.code === 'NETWORK_ERROR' ||
    error.code === 'TIMEOUT_ERROR' ||
    error.message.includes('network') ||
    error.message.includes('timeout')
  )
}

/**
 * 创建重试过滤中间件
 * 根据错误类型决定是否应该重试
 */
export function createRetryFilterMiddleware(
  shouldRetry: (error: ApiError, attempt: number) => boolean,
): ErrorMiddleware {
  return async (error: any, context: any) => {
    const apiError = error instanceof ApiError ? error : ApiErrorFactory.fromUnknownError(error, context)
    const attempt = context.attempt || 0

    // 根据自定义逻辑决定是否重试
    if (!shouldRetry(apiError, attempt)) {
      // 如果不应该重试，记录日志
      console.warn(`[RetryFilter] Retry skipped for ${context.methodName} (attempt ${attempt})`, apiError.code)
    }

    // 不返回响应，让重试逻辑继续
  }
}

/**
 * 创建错误转换中间件
 * 将特定错误转换为业务友好的错误信息
 */
export function createErrorTransformMiddleware(
  transforms: Record<string, string | ((error: ApiError) => string)>,
): ErrorMiddleware {
  return async (error: any, _context: any) => {
    const apiError = error instanceof ApiError ? error : error

    // 根据错误码转换错误消息
    if (apiError.statusCode && transforms[apiError.statusCode]) {
      const transform = transforms[apiError.statusCode]
      apiError.message = typeof transform === 'function' ? transform(apiError) : transform
    }
    else if (apiError.code && transforms[apiError.code]) {
      const transform = transforms[apiError.code]
      apiError.message = typeof transform === 'function' ? transform(apiError) : transform
    }

    // 不返回响应，让错误继续传播
  }
}

/**
 * 预定义的错误处理中间件
 */
export const commonErrorMiddlewares = {
  /**
   * 标准错误日志中间件
   */
  logging: createErrorHandlingMiddleware({
    enableLogging: true,
    logLevel: 'error',
  }),

  /**
   * 网络错误降级中间件（返回空数据）
   */
  networkFallback: createNetworkFallbackMiddleware('default', null),

  /**
   * 用户友好的错误消息转换
   */
  friendlyMessages: createErrorTransformMiddleware({
    401: '登录已过期，请重新登录',
    403: '您没有权限访问此资源',
    404: '请求的资源不存在',
    429: '请求过于频繁，请稍后再试',
    500: '服务器错误，请稍后再试',
    502: '网关错误，请稍后再试',
    503: '服务暂时不可用，请稍后再试',
    NETWORK_ERROR: '网络连接失败，请检查网络设置',
    TIMEOUT_ERROR: '请求超时，请重试',
  }),

  /**
   * 智能重试过滤（只重试网络和服务器错误）
   */
  smartRetry: createRetryFilterMiddleware((error, attempt) => {
    // 超过3次不再重试
    if (attempt >= 3) return false

    // 客户端错误（4xx）不重试（除了408）
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return error.statusCode === 408 || error.statusCode === 429
    }

    // 网络错误和服务器错误重试
    return isNetworkError(error) || (error.statusCode && error.statusCode >= 500)
  }),
}

/**
 * 创建错误处理中间件链
 */
export function createErrorHandlingChain(
  configs: ErrorHandlingConfig[],
): ErrorMiddleware[] {
  return configs.map(config => createErrorHandlingMiddleware(config))
}


