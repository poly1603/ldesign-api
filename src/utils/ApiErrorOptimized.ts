/**
 * 优化版 API 错误处理系统
 * 使用对象池和常量池减少内存占用
 */

import {
  ERROR_USER_MESSAGES,
  ERROR_SUGGESTIONS,
  ERROR_SEVERITY_MAP,
  RETRYABLE_ERROR_TYPES,
  HTTP_STATUS_MESSAGES
} from '../constants/error'
import { ApiError, ApiErrorType, ErrorSeverity, ErrorContext } from './ApiError'

/**
 * 轻量级错误对象（减少内存占用）
 */
export class ApiErrorLite {
  /** 错误类型 */
  public type: ApiErrorType
  /** 错误代码 */
  public code: string | number
  /** 错误消息 */
  public message: string
  /** 上下文（仅保留必要信息） */
  public context?: Partial<ErrorContext>
  /** 原始错误（弱引用） */
  private _originalError?: WeakRef<Error>

  constructor() {
    this.type = ApiErrorType.UNKNOWN_ERROR
    this.code = 'UNKNOWN'
    this.message = ''
  }

  /**
   * 重置错误对象（用于对象池）
   */
  reset(): void {
    this.type = ApiErrorType.UNKNOWN_ERROR
    this.code = 'UNKNOWN'
    this.message = ''
    this.context = undefined
    this._originalError = undefined
  }

  /**
   * 获取原始错误
   */
  get originalError(): Error | undefined {
    return this._originalError?.deref()
  }

  /**
   * 设置原始错误
   */
  set originalError(error: Error | undefined) {
    if (error) {
      this._originalError = new WeakRef(error)
    } else {
      this._originalError = undefined
    }
  }

  /**
   * 获取用户友好的错误消息（从常量池）
   */
  get userMessage(): string {
    return ERROR_USER_MESSAGES[this.type] || ERROR_USER_MESSAGES.UNKNOWN_ERROR
  }

  /**
   * 获取错误严重程度（从常量池）
   */
  get severity(): ErrorSeverity {
    return ERROR_SEVERITY_MAP[this.type] as ErrorSeverity || ErrorSeverity.MEDIUM
  }

  /**
   * 获取建议（从常量池）
   */
  get suggestions(): string[] {
    return ERROR_SUGGESTIONS[this.type] || ERROR_SUGGESTIONS.DEFAULT
  }

  /**
   * 判断是否可重试（从常量池）
   */
  get retryable(): boolean {
    return RETRYABLE_ERROR_TYPES.has(this.type)
  }

  /**
   * 转换为标准 ApiError（仅在需要时创建）
   */
  toApiError(): ApiError {
    return new ApiError({
      type: this.type,
      code: this.code,
      message: this.message,
      context: this.context as ErrorContext,
      originalError: this.originalError,
    })
  }

  /**
   * 转换为 JSON
   */
  toJSON() {
    return {
      type: this.type,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      severity: this.severity,
      suggestions: this.suggestions,
      retryable: this.retryable,
      context: this.context,
    }
  }
}

/**
 * 错误对象池
 */
class ApiErrorPool {
  private pool: ApiErrorLite[] = []
  private maxSize = 50

  /**
   * 获取错误对象
   */
  acquire(): ApiErrorLite {
    const error = this.pool.pop()
    if (error) {
      return error
    }
    return new ApiErrorLite()
  }

  /**
   * 释放错误对象
   */
  release(error: ApiErrorLite): void {
    if (this.pool.length < this.maxSize) {
      error.reset()
      this.pool.push(error)
    }
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool = []
  }
}

/**
 * 全局错误对象池
 */
const globalErrorPool = new ApiErrorPool()

/**
 * 优化版错误工厂
 */
export class ApiErrorFactoryOptimized {
  /**
   * 从 HTTP 响应创建轻量级错误
   */
  static fromHttpResponseLite(response: any, context?: Partial<ErrorContext>): ApiErrorLite {
    const error = globalErrorPool.acquire()

    const status = response?.status || response?.response?.status
    const statusText = response?.statusText || response?.response?.statusText
    const data = response?.data || response?.response?.data

    // 设置错误类型
    if (status >= 500) {
      error.type = ApiErrorType.SERVER_ERROR
    } else if (status === 401) {
      error.type = ApiErrorType.AUTH_ERROR
    } else if (status === 403) {
      error.type = ApiErrorType.PERMISSION_ERROR
    } else if (status === 404) {
      error.type = ApiErrorType.NOT_FOUND_ERROR
    } else if (status >= 400) {
      error.type = ApiErrorType.CLIENT_ERROR
    } else {
      error.type = ApiErrorType.UNKNOWN_ERROR
    }

    error.code = status || 'UNKNOWN'

    // 优先使用预定义消息
    if (status && HTTP_STATUS_MESSAGES[status as keyof typeof HTTP_STATUS_MESSAGES]) {
      error.message = HTTP_STATUS_MESSAGES[status as keyof typeof HTTP_STATUS_MESSAGES]
    } else if (data?.message) {
      error.message = data.message
    } else if (data?.error) {
      error.message = data.error
    } else {
      error.message = statusText || 'Unknown error'
    }

    // 仅保存必要的上下文
    if (context) {
      error.context = {
        methodName: context.methodName,
        timestamp: context.timestamp || Date.now(),
      }
    }

    return error
  }

  /**
   * 从网络错误创建轻量级错误
   */
  static fromNetworkErrorLite(err: Error, context?: Partial<ErrorContext>): ApiErrorLite {
    const error = globalErrorPool.acquire()

    if (err.name === 'AbortError' || err.message.includes('cancelled')) {
      error.type = ApiErrorType.CANCELLED_ERROR
    } else if (err.message.includes('timeout')) {
      error.type = ApiErrorType.TIMEOUT_ERROR
    } else {
      error.type = ApiErrorType.NETWORK_ERROR
    }

    error.code = err.name || 'NETWORK_ERROR'
    error.message = err.message || '网络错误'
    error.originalError = err

    // 仅保存必要的上下文
    if (context) {
      error.context = {
        methodName: context.methodName,
        timestamp: context.timestamp || Date.now(),
      }
    }

    return error
  }

  /**
   * 释放错误对象回池
   */
  static release(error: ApiErrorLite): void {
    globalErrorPool.release(error)
  }

  /**
   * 清空错误池
   */
  static clearPool(): void {
    globalErrorPool.clear()
  }
}

