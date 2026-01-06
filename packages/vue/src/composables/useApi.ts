/**
 * useApi 组合函数
 *
 * 提供响应式的 API 调用功能
 */

import { ref, shallowRef, computed, watch, onUnmounted } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import type {
  ApiRequestOptions,
  ApiResult,
  UnifiedApiDefinition,
} from '@ldesign/api-core'
import { injectApiManager } from './useApiManager'

/**
 * useApi 选项
 */
export interface UseApiOptions<TParams = unknown> {
  /** 初始参数 */
  params?: TParams
  /** 是否立即执行 */
  immediate?: boolean
  /** 是否监听参数变化自动重新请求 */
  watch?: boolean
  /** 请求成功回调 */
  onSuccess?: (data: unknown) => void
  /** 请求失败回调 */
  onError?: (error: Error) => void
  /** 请求完成回调（无论成功失败） */
  onFinally?: () => void
}

/**
 * useApi 返回值
 */
export interface UseApiReturn<TResponse = unknown, TParams = unknown> {
  /** 响应数据 */
  data: ShallowRef<TResponse | undefined>
  /** 是否加载中 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: ShallowRef<Error | undefined>
  /** 是否请求成功 */
  isSuccess: Ref<boolean>
  /** 是否请求失败 */
  isError: Ref<boolean>
  /** 完整响应 */
  response: ShallowRef<ApiResult<TResponse> | undefined>
  /** 执行请求 */
  execute: (params?: TParams, options?: ApiRequestOptions) => Promise<TResponse>
  /** 重新请求（使用上次参数） */
  refresh: () => Promise<TResponse>
  /** 重置状态 */
  reset: () => void
}

/**
 * 使用 API
 *
 * @example
 * ```typescript
 * // 基础用法
 * const { data, loading, error, execute } = useApi(getUserApi)
 *
 * // 立即执行
 * const { data, loading } = useApi(getUserApi, {
 *   immediate: true,
 *   params: { id: 1 }
 * })
 *
 * // 监听参数变化
 * const userId = ref(1)
 * const { data } = useApi(getUserApi, {
 *   watch: true,
 *   params: computed(() => ({ id: userId.value }))
 * })
 * ```
 */
export function useApi<TResponse = unknown, TParams = unknown>(
  apiOrId: UnifiedApiDefinition<TParams, TResponse> | string,
  options: UseApiOptions<TParams> = {}
): UseApiReturn<TResponse, TParams> {
  const manager = injectApiManager()

  // 状态
  const data = shallowRef<TResponse | undefined>(undefined)
  const loading = ref(false)
  const error = shallowRef<Error | undefined>(undefined)
  const response = shallowRef<ApiResult<TResponse> | undefined>(undefined)

  // 计算属性
  const isSuccess = computed(() => !loading.value && !error.value && data.value !== undefined)
  const isError = computed(() => !loading.value && error.value !== undefined)

  // 上次请求参数
  let lastParams: TParams | undefined = options.params

  // 取消控制器
  let abortController: AbortController | null = null

  /**
   * 执行请求
   */
  async function execute(
    params?: TParams,
    requestOptions?: ApiRequestOptions
  ): Promise<TResponse> {
    // 取消之前的请求
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()
    lastParams = params ?? lastParams

    loading.value = true
    error.value = undefined

    try {
      // 构建请求选项
      let apiOptions: ApiRequestOptions

      if (typeof apiOrId === 'string') {
        const api = manager.getApi(apiOrId)
        if (!api) {
          throw new Error(`API not found: ${apiOrId}`)
        }

        if (api.type === 'leap') {
          apiOptions = {
            params: lastParams as Record<string, unknown>,
            signal: abortController.signal,
            ...requestOptions,
          }
        } else {
          apiOptions = {
            body: lastParams,
            signal: abortController.signal,
            ...requestOptions,
          }
        }
      } else {
        if (apiOrId.type === 'leap') {
          apiOptions = {
            params: lastParams as Record<string, unknown>,
            signal: abortController.signal,
            ...requestOptions,
          }
        } else {
          apiOptions = {
            body: lastParams,
            signal: abortController.signal,
            ...requestOptions,
          }
        }
      }

      const result = await manager.call<TResponse>(apiOrId as string | UnifiedApiDefinition, apiOptions)

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
      options.onFinally?.()
    }
  }

  /**
   * 刷新请求
   */
  function refresh(): Promise<TResponse> {
    return execute(lastParams)
  }

  /**
   * 重置状态
   */
  function reset(): void {
    data.value = undefined
    loading.value = false
    error.value = undefined
    response.value = undefined
    lastParams = options.params
  }

  // 立即执行
  if (options.immediate) {
    execute(options.params)
  }

  // 监听参数变化
  if (options.watch && options.params) {
    watch(
      () => options.params,
      (newParams) => {
        if (newParams !== undefined) {
          execute(newParams)
        }
      },
      { deep: true }
    )
  }

  // 组件卸载时取消请求
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
    isError,
    response,
    execute,
    refresh,
    reset,
  }
}
