/**
 * useLeapApi 组合函数
 *
 * 专为 LEAP RPC 接口优化的组合函数
 */

import { ref, shallowRef, computed, onUnmounted } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import type {
  ApiResult,
  LeapApiDefinition,
  LeapRequestOptions,
} from '@ldesign/api-core'
import { injectApiManager } from './useApiManager'

/**
 * useLeapApi 选项
 */
export interface UseLeapApiOptions<TParams = unknown> {
  /** 初始参数 */
  params?: TParams
  /** 是否立即执行 */
  immediate?: boolean
  /** 请求成功回调 */
  onSuccess?: (data: unknown) => void
  /** 请求失败回调 */
  onError?: (error: Error) => void
}

/**
 * useLeapApi 返回值
 */
export interface UseLeapApiReturn<TResponse = unknown, TParams = unknown> {
  /** 响应数据 */
  data: ShallowRef<TResponse | undefined>
  /** 是否加载中 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: ShallowRef<Error | undefined>
  /** 是否成功 */
  isSuccess: Ref<boolean>
  /** 完整响应 */
  response: ShallowRef<ApiResult<TResponse> | undefined>
  /** 执行请求 */
  execute: (params?: TParams, options?: Omit<LeapRequestOptions, 'params'>) => Promise<TResponse>
  /** 刷新 */
  refresh: () => Promise<TResponse>
}

/**
 * 使用 LEAP API
 *
 * @example
 * ```typescript
 * // 定义 LEAP API
 * const getWorkdayApi = defineLeapApi<{ month: string }, WorkdayData>(
 *   'lpom', 'getMonthWorkday', 'loap_monthworkday'
 * ).build()
 *
 * // 使用
 * const { data, loading, execute } = useLeapApi(getWorkdayApi)
 *
 * // 调用
 * await execute({ month: '2025-01' })
 * ```
 */
export function useLeapApi<TResponse = unknown, TParams extends Record<string, unknown> = Record<string, unknown>>(
  api: LeapApiDefinition<TParams, TResponse>,
  options: UseLeapApiOptions<TParams> = {}
): UseLeapApiReturn<TResponse, TParams> {
  const manager = injectApiManager()

  // 注册 API
  const apiId = manager.register(api)

  // 状态
  const data = shallowRef<TResponse | undefined>(undefined)
  const loading = ref(false)
  const error = shallowRef<Error | undefined>(undefined)
  const response = shallowRef<ApiResult<TResponse> | undefined>(undefined)

  const isSuccess = computed(() => !loading.value && !error.value && data.value !== undefined)

  // 上次参数
  let lastParams: TParams | undefined = options.params

  // 取消控制器
  let abortController: AbortController | null = null

  /**
   * 执行请求
   */
  async function execute(
    params?: TParams,
    requestOptions?: Omit<LeapRequestOptions, 'params'>
  ): Promise<TResponse> {
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()
    lastParams = params ?? lastParams

    loading.value = true
    error.value = undefined

    try {
      const result = await manager.call<TResponse>(apiId, {
        params: lastParams,
        signal: abortController.signal,
        ...requestOptions,
      })

      data.value = result.data
      response.value = result

      options.onSuccess?.(result.data)

      return result.data
    } catch (err) {
      const apiError = err instanceof Error ? err : new Error(String(err))
      error.value = apiError
      options.onError?.(apiError)
      throw apiError
    } finally {
      loading.value = false
      abortController = null
    }
  }

  /**
   * 刷新
   */
  function refresh(): Promise<TResponse> {
    return execute(lastParams)
  }

  // 立即执行
  if (options.immediate && options.params) {
    execute(options.params)
  }

  // 清理
  onUnmounted(() => {
    if (abortController) {
      abortController.abort()
    }
  })

  return {
    data,
    loading,
    error,
    isSuccess,
    response,
    execute,
    refresh,
  }
}

/**
 * 创建 LEAP 方法调用器
 *
 * @example
 * ```typescript
 * const callLeap = createLeapCaller('lpom')
 *
 * // 调用
 * const result = await callLeap('loap_monthworkday', { month: '2025-01' })
 * ```
 */
export function createLeapCaller(serverId: string) {
  const manager = injectApiManager()

  return async function <TResponse = unknown>(
    method: string,
    params?: Record<string, unknown>,
    options?: Omit<LeapRequestOptions, 'params'>
  ): Promise<TResponse> {
    // 动态创建 API 定义
    const api: LeapApiDefinition = {
      name: method,
      serverId,
      type: 'leap',
      method,
    }

    const result = await manager.call<TResponse>(api, {
      params,
      ...options,
    })

    return result.data
  }
}
