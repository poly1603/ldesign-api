/**
 * 中间件组合器
 * 提供高性能的中间件组合和执行功能
 */

import type { RequestMiddleware, ResponseMiddleware, ErrorMiddleware } from '../types'

/**
 * 中间件组合配置
 */
export interface MiddlewareComposerConfig {
  /** 是否缓存组合结果 */
  enableCache?: boolean
  /** 缓存大小限制 */
  cacheSize?: number
}

/**
 * 组合的中间件函数类型
 */
type ComposedRequestMiddleware = (request: any, context: any) => Promise<any>
type ComposedResponseMiddleware = (response: any, context: any) => Promise<any>
type ComposedErrorMiddleware = (error: any, context: any) => Promise<any>

/**
 * 中间件组合器
 */
export class MiddlewareComposer {
  /** 请求中间件缓存 */
  private requestCache = new Map<string, ComposedRequestMiddleware>()
  /** 响应中间件缓存 */
  private responseCache = new Map<string, ComposedResponseMiddleware>()
  /** 错误中间件缓存 */
  private errorCache = new Map<string, ComposedErrorMiddleware>()

  constructor(private config: MiddlewareComposerConfig = {}) {
    this.config = {
      enableCache: true,
      cacheSize: 100,
      ...config,
    }
  }

  /**
   * 组合请求中间件（优化版）
   */
  composeRequestMiddlewares(
    middlewares: RequestMiddleware[],
    cacheKey?: string
  ): ComposedRequestMiddleware {
    // 无中间件时的快速路径
    if (middlewares.length === 0) {
      return async (request) => request
    }

    // 单个中间件的快速路径
    if (middlewares.length === 1) {
      return middlewares[0]
    }

    // 尝试从缓存获取
    if (this.config.enableCache && cacheKey) {
      const cached = this.requestCache.get(cacheKey)
      if (cached) {
        return cached
      }
    }

    // 组合多个中间件（避免递归，使用循环）
    const composed: ComposedRequestMiddleware = async (request, context) => {
      let result = request

      for (const middleware of middlewares) {
        result = await middleware(result, context)
      }

      return result
    }

    // 存入缓存
    if (this.config.enableCache && cacheKey) {
      this.limitCacheSize(this.requestCache)
      this.requestCache.set(cacheKey, composed)
    }

    return composed
  }

  /**
   * 组合响应中间件（优化版）
   */
  composeResponseMiddlewares(
    middlewares: ResponseMiddleware[],
    cacheKey?: string
  ): ComposedResponseMiddleware {
    // 无中间件时的快速路径
    if (middlewares.length === 0) {
      return async (response) => response
    }

    // 单个中间件的快速路径
    if (middlewares.length === 1) {
      return middlewares[0]
    }

    // 尝试从缓存获取
    if (this.config.enableCache && cacheKey) {
      const cached = this.responseCache.get(cacheKey)
      if (cached) {
        return cached
      }
    }

    // 组合多个中间件（避免递归，使用循环）
    const composed: ComposedResponseMiddleware = async (response, context) => {
      let result = response

      for (const middleware of middlewares) {
        result = await middleware(result, context)
      }

      return result
    }

    // 存入缓存
    if (this.config.enableCache && cacheKey) {
      this.limitCacheSize(this.responseCache)
      this.responseCache.set(cacheKey, composed)
    }

    return composed
  }

  /**
   * 组合错误中间件（优化版）
   */
  composeErrorMiddlewares(
    middlewares: ErrorMiddleware[],
    cacheKey?: string
  ): ComposedErrorMiddleware {
    // 无中间件时的快速路径
    if (middlewares.length === 0) {
      return async (error) => { throw error }
    }

    // 单个中间件的快速路径
    if (middlewares.length === 1) {
      return middlewares[0]
    }

    // 尝试从缓存获取
    if (this.config.enableCache && cacheKey) {
      const cached = this.errorCache.get(cacheKey)
      if (cached) {
        return cached
      }
    }

    // 组合多个中间件（支持错误恢复）
    const composed: ComposedErrorMiddleware = async (error, context) => {
      for (const middleware of middlewares) {
        const result = await middleware(error, context)

        // 如果中间件返回了恢复数据，立即返回
        if (result && typeof result === 'object' && 'data' in result) {
          return result
        }
      }

      // 没有中间件处理，继续抛出错误
      throw error
    }

    // 存入缓存
    if (this.config.enableCache && cacheKey) {
      this.limitCacheSize(this.errorCache)
      this.errorCache.set(cacheKey, composed)
    }

    return composed
  }

  /**
   * 限制缓存大小
   */
  private limitCacheSize(cache: Map<string, any>): void {
    if (cache.size >= this.config.cacheSize!) {
      // 删除最早的条目（FIFO）
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.requestCache.clear()
    this.responseCache.clear()
    this.errorCache.clear()
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      requestCacheSize: this.requestCache.size,
      responseCacheSize: this.responseCache.size,
      errorCacheSize: this.errorCache.size,
      totalCacheSize: this.requestCache.size + this.responseCache.size + this.errorCache.size,
    }
  }

  /**
   * 创建批处理中间件（减少异步调用开销）
   */
  static createBatchMiddleware<T extends (...args: any[]) => Promise<any>>(
    middlewares: T[]
  ): T {
    if (middlewares.length === 0) {
      return (async (...args) => args[0]) as T
    }

    if (middlewares.length === 1) {
      return middlewares[0]
    }

    // 批处理执行，使用 Promise.all 减少等待时间
    return (async (...args) => {
      const results = await Promise.all(
        middlewares.map(middleware => middleware(...args))
      )

      // 返回最后一个结果
      return results[results.length - 1]
    }) as T
  }
}

/**
 * 全局中间件组合器实例
 */
export const globalMiddlewareComposer = new MiddlewareComposer()


