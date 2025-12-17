/**
 * useRestfulApi 组合函数
 *
 * 专为 RESTful 接口优化的组合函数
 */

import { ref, shallowRef, computed, onUnmounted } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import type {
  ApiResult,
  RestfulApiDefinition,
  RestfulRequestOptions,
} from '@ldesign/api-core'
import { injectApiManager } from './useApiManager'

/**
 * useRestfulApi 选项
 */
export interface UseRestfulApiOptions {
  /** 是否立即执行 */
  immediate?: boolean
  /** 初始路径参数 */
  pathParams?: Record<string, string | number>
  /** 初始查询参数 */
  query?: Record<string, unknown>
  /** 初始请求体 */
  body?: unknown
  /** 请求成功回调 */
  onSuccess?: (data: unknown) => void
  /** 请求失败回调 */
  onError?: (error: Error) => void
}

/**
 * useRestfulApi 返回值
 */
export interface UseRestfulApiReturn<TResponse = unknown> {
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
  execute: (options?: RestfulRequestOptions) => Promise<TResponse>
  /** 刷新 */
  refresh: () => Promise<TResponse>
}

/**
 * 使用 RESTful API
 *
 * @example
 * ```typescript
 * // 定义 RESTful API
 * const getUserApi = defineRestfulApi<{ id: number }, User>(
 *   'jsonApi', 'getUser', 'GET', '/users/:id'
 * ).pathParams('id').build()
 *
 * // 使用
 * const { data, loading, execute } = useRestfulApi(getUserApi)
 *
 * // 调用
 * await execute({ pathParams: { id: 1 } })
 * ```
 */
export function useRestfulApi<TResponse = unknown, TParams = unknown>(
  api: RestfulApiDefinition<TParams, TResponse>,
  options: UseRestfulApiOptions = {}
): UseRestfulApiReturn<TResponse> {
  const manager = injectApiManager()

  // 注册 API
  const apiId = manager.register(api)

  // 状态
  const data = shallowRef<TResponse | undefined>(undefined)
  const loading = ref(false)
  const error = shallowRef<Error | undefined>(undefined)
  const response = shallowRef<ApiResult<TResponse> | undefined>(undefined)

  const isSuccess = computed(() => !loading.value && !error.value && data.value !== undefined)

  // 上次请求选项
  let lastOptions: RestfulRequestOptions = {
    pathParams: options.pathParams,
    query: options.query,
    body: options.body,
  }

  // 取消控制器
  let abortController: AbortController | null = null

  /**
   * 执行请求
   */
  async function execute(requestOptions?: RestfulRequestOptions): Promise<TResponse> {
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()

    // 合并选项
    lastOptions = {
      ...lastOptions,
      ...requestOptions,
    }

    loading.value = true
    error.value = undefined

    try {
      const result = await manager.call<TResponse>(apiId, {
        ...lastOptions,
        signal: abortController.signal,
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
    return execute(lastOptions)
  }

  // 立即执行
  if (options.immediate) {
    execute()
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
 * 创建 RESTful 资源调用器
 *
 * @example
 * ```typescript
 * const users = createRestfulResource<User>('jsonApi', '/users')
 *
 * // CRUD 操作
 * const allUsers = await users.list()
 * const user = await users.get(1)
 * const newUser = await users.create({ name: 'John' })
 * await users.update(1, { name: 'Jane' })
 * await users.delete(1)
 * ```
 */
export function createRestfulResource<TEntity>(
  serverId: string,
  basePath: string
) {
  const manager = injectApiManager()

  return {
    async list(query?: Record<string, unknown>): Promise<TEntity[]> {
      const api: RestfulApiDefinition = {
        name: 'list',
        serverId,
        type: 'restful',
        method: 'GET',
        path: basePath,
      }

      const result = await manager.call<TEntity[]>(api, { query })
      return result.data
    },

    async get(id: string | number, query?: Record<string, unknown>): Promise<TEntity> {
      const api: RestfulApiDefinition = {
        name: 'get',
        serverId,
        type: 'restful',
        method: 'GET',
        path: `${basePath}/:id`,
      }

      const result = await manager.call<TEntity>(api, {
        pathParams: { id },
        query,
      })
      return result.data
    },

    async create(data: Partial<TEntity>): Promise<TEntity> {
      const api: RestfulApiDefinition = {
        name: 'create',
        serverId,
        type: 'restful',
        method: 'POST',
        path: basePath,
      }

      const result = await manager.call<TEntity>(api, { body: data })
      return result.data
    },

    async update(id: string | number, data: Partial<TEntity>): Promise<TEntity> {
      const api: RestfulApiDefinition = {
        name: 'update',
        serverId,
        type: 'restful',
        method: 'PUT',
        path: `${basePath}/:id`,
      }

      const result = await manager.call<TEntity>(api, {
        pathParams: { id },
        body: data,
      })
      return result.data
    },

    async patch(id: string | number, data: Partial<TEntity>): Promise<TEntity> {
      const api: RestfulApiDefinition = {
        name: 'patch',
        serverId,
        type: 'restful',
        method: 'PATCH',
        path: `${basePath}/:id`,
      }

      const result = await manager.call<TEntity>(api, {
        pathParams: { id },
        body: data,
      })
      return result.data
    },

    async delete(id: string | number): Promise<void> {
      const api: RestfulApiDefinition = {
        name: 'delete',
        serverId,
        type: 'restful',
        method: 'DELETE',
        path: `${basePath}/:id`,
      }

      await manager.call(api, { pathParams: { id } })
    },
  }
}
