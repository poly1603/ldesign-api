/**
 * useMutation 组合函数
 *
 * 用于处理数据变更操作（POST, PUT, DELETE 等）
 * 提供乐观更新、失败回滚等功能
 */

import { ref, shallowRef, computed, onUnmounted } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import type {
  ApiRequestOptions,
  ApiResult,
  UnifiedApiDefinition,
} from '@ldesign/api-core'
import { injectApiManager } from './useApiManager'

/**
 * Mutation 状态
 */
export type MutationStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * useMutation 选项
 */
export interface UseMutationOptions<TData = unknown, TParams = unknown, TContext = unknown> {
  /**
   * 变更前的回调，可用于乐观更新
   * 返回的值将作为 context 传递给 onError 和 onSettled
   */
  onMutate?: (params: TParams) => TContext | Promise<TContext>

  /**
   * 变更成功时的回调
   */
  onSuccess?: (data: TData, params: TParams, context: TContext | undefined) => void | Promise<void>

  /**
   * 变更失败时的回调，可用于回滚乐观更新
   */
  onError?: (error: Error, params: TParams, context: TContext | undefined) => void | Promise<void>

  /**
   * 变更结束时的回调（无论成功或失败）
   */
  onSettled?: (
    data: TData | undefined,
    error: Error | undefined,
    params: TParams,
    context: TContext | undefined
  ) => void | Promise<void>

  /**
   * 重试次数
   */
  retry?: number | ((failureCount: number, error: Error) => boolean)

  /**
   * 重试延迟（毫秒）
   */
  retryDelay?: number | ((failureCount: number, error: Error) => number)

  /**
   * 是否在组件卸载时取消请求
   */
  cancelOnUnmount?: boolean
}

/**
 * useMutation 返回值
 */
export interface UseMutationReturn<TData = unknown, TParams = unknown> {
  /** 响应数据 */
  data: ShallowRef<TData | undefined>

  /** 错误信息 */
  error: ShallowRef<Error | undefined>

  /** 变更状态 */
  status: Ref<MutationStatus>

  /** 是否加载中 */
  isLoading: Ref<boolean>

  /** 是否成功 */
  isSuccess: Ref<boolean>

  /** 是否失败 */
  isError: Ref<boolean>

  /** 是否空闲 */
  isIdle: Ref<boolean>

  /** 失败次数 */
  failureCount: Ref<number>

  /** 执行变更 */
  mutate: (params: TParams, options?: ApiRequestOptions) => void

  /** 执行变更（Promise 版本） */
  mutateAsync: (params: TParams, options?: ApiRequestOptions) => Promise<TData>

  /** 重置状态 */
  reset: () => void
}

/**
 * 使用 Mutation
 *
 * 用于处理数据变更操作，提供加载状态、错误处理、乐观更新等功能
 *
 * @example
 * ```typescript
 * // 定义 API
 * const createUserApi = defineRestfulApi<CreateUserParams, User>(
 *   'api', 'createUser', 'POST', '/users'
 * ).build()
 *
 * // 使用
 * const { mutate, mutateAsync, isLoading, error } = useMutation(createUserApi, {
 *   onSuccess: (user) => {
 *     console.log('User created:', user)
 *     // 可以在这里更新本地状态或缓存
 *   },
 *   onError: (error) => {
 *     console.error('Failed to create user:', error)
 *   }
 * })
 *
 * // 触发变更
 * mutate({ name: 'John', email: 'john@example.com' })
 *
 * // 或使用 async/await
 * const user = await mutateAsync({ name: 'John', email: 'john@example.com' })
 * ```
 *
 * @example
 * ```typescript
 * // 乐观更新示例
 * const { mutate } = useMutation(updateUserApi, {
 *   onMutate: async (params) => {
 *     // 保存之前的值用于回滚
 *     const previousUser = users.value.find(u => u.id === params.id)
 *
 *     // 乐观更新
 *     users.value = users.value.map(u =>
 *       u.id === params.id ? { ...u, ...params } : u
 *     )
 *
 *     return { previousUser }
 *   },
 *   onError: (error, params, context) => {
 *     // 失败时回滚
 *     if (context?.previousUser) {
 *       users.value = users.value.map(u =>
 *         u.id === params.id ? context.previousUser : u
 *       )
 *     }
 *   }
 * })
 * ```
 */
export function useMutation<TData = unknown, TParams = unknown, TContext = unknown>(
  apiOrId: UnifiedApiDefinition<TParams, TData> | string,
  options: UseMutationOptions<TData, TParams, TContext> = {}
): UseMutationReturn<TData, TParams> {
  const manager = injectApiManager()

  // 状态
  const data = shallowRef<TData | undefined>(undefined)
  const error = shallowRef<Error | undefined>(undefined)
  const status = ref<MutationStatus>('idle')
  const failureCount = ref(0)

  // 计算属性
  const isLoading = computed(() => status.value === 'loading')
  const isSuccess = computed(() => status.value === 'success')
  const isError = computed(() => status.value === 'error')
  const isIdle = computed(() => status.value === 'idle')

  // 取消控制器
  let abortController: AbortController | null = null

  // 获取重试次数
  const getRetryCount = (count: number, err: Error): boolean => {
    if (typeof options.retry === 'number') {
      return count < options.retry
    }
    if (typeof options.retry === 'function') {
      return options.retry(count, err)
    }
    return false
  }

  // 获取重试延迟
  const getRetryDelay = (count: number, err: Error): number => {
    if (typeof options.retryDelay === 'number') {
      return options.retryDelay
    }
    if (typeof options.retryDelay === 'function') {
      return options.retryDelay(count, err)
    }
    return 0
  }

  /**
   * 执行变更（内部实现）
   */
  async function executeMutation(
    params: TParams,
    requestOptions?: ApiRequestOptions
  ): Promise<TData> {
    // 取消之前的请求
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()

    // 执行 onMutate
    let context: TContext | undefined
    try {
      if (options.onMutate) {
        context = await options.onMutate(params)
      }
    } catch (e) {
      // onMutate 失败不阻止变更
      console.warn('[useMutation] onMutate error:', e)
    }

    status.value = 'loading'
    error.value = undefined

    let currentFailureCount = 0

    while (true) {
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
              params: params as Record<string, unknown>,
              signal: abortController.signal,
              ...requestOptions,
            }
          } else {
            apiOptions = {
              body: params,
              signal: abortController.signal,
              ...requestOptions,
            }
          }
        } else {
          if (apiOrId.type === 'leap') {
            apiOptions = {
              params: params as Record<string, unknown>,
              signal: abortController.signal,
              ...requestOptions,
            }
          } else {
            apiOptions = {
              body: params,
              signal: abortController.signal,
              ...requestOptions,
            }
          }
        }

        const result = await manager.call<TData>(apiOrId as string | UnifiedApiDefinition, apiOptions)

        // 成功
        data.value = result.data
        status.value = 'success'
        failureCount.value = 0

        // 执行 onSuccess
        if (options.onSuccess) {
          await options.onSuccess(result.data, params, context)
        }

        // 执行 onSettled
        if (options.onSettled) {
          await options.onSettled(result.data, undefined, params, context)
        }

        return result.data
      } catch (err) {
        const apiError = err instanceof Error ? err : new Error(String(err))

        currentFailureCount++
        failureCount.value = currentFailureCount

        // 检查是否应该重试
        if (getRetryCount(currentFailureCount, apiError)) {
          const delay = getRetryDelay(currentFailureCount, apiError)
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay))
          }
          continue
        }

        // 最终失败
        error.value = apiError
        status.value = 'error'

        // 执行 onError
        if (options.onError) {
          await options.onError(apiError, params, context)
        }

        // 执行 onSettled
        if (options.onSettled) {
          await options.onSettled(undefined, apiError, params, context)
        }

        throw apiError
      } finally {
        abortController = null
      }
    }
  }

  /**
   * 执行变更（fire-and-forget）
   */
  function mutate(params: TParams, requestOptions?: ApiRequestOptions): void {
    executeMutation(params, requestOptions).catch(() => {
      // 错误已在 executeMutation 中处理
    })
  }

  /**
   * 执行变更（Promise 版本）
   */
  async function mutateAsync(params: TParams, requestOptions?: ApiRequestOptions): Promise<TData> {
    return executeMutation(params, requestOptions)
  }

  /**
   * 重置状态
   */
  function reset(): void {
    data.value = undefined
    error.value = undefined
    status.value = 'idle'
    failureCount.value = 0

    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  // 组件卸载时取消请求
  if (options.cancelOnUnmount !== false) {
    onUnmounted(() => {
      if (abortController) {
        abortController.abort()
      }
    })
  }

  return {
    data,
    error,
    status,
    isLoading,
    isSuccess,
    isError,
    isIdle,
    failureCount,
    mutate,
    mutateAsync,
    reset,
  }
}
