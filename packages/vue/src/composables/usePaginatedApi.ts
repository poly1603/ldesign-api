/**
 * usePaginatedApi 组合函数
 *
 * 用于处理分页数据查询
 */

import { ref, shallowRef, computed, watch, onUnmounted } from 'vue'
import type { Ref, ShallowRef, ComputedRef } from 'vue'
import type {
  ApiRequestOptions,
  ApiResult,
  UnifiedApiDefinition,
} from '@ldesign/api-core'
import { injectApiManager } from './useApiManager'

/**
 * 分页参数
 */
export interface PaginationParams {
  /** 当前页码（从 1 开始） */
  page: number
  /** 每页大小 */
  pageSize: number
  /** 排序字段 */
  sortBy?: string
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  items: T[]
  /** 总条数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页大小 */
  pageSize: number
  /** 总页数 */
  totalPages: number
}

/**
 * usePaginatedApi 选项
 */
export interface UsePaginatedApiOptions<TItem = unknown, TParams = unknown> {
  /** 初始页码，默认 1 */
  initialPage?: number
  /** 初始每页大小，默认 10 */
  initialPageSize?: number
  /** 初始排序字段 */
  initialSortBy?: string
  /** 初始排序方向 */
  initialSortOrder?: 'asc' | 'desc'
  /** 其他查询参数 */
  params?: TParams
  /** 是否立即执行 */
  immediate?: boolean
  /** 是否监听分页参数变化自动请求 */
  watchParams?: boolean
  /** 响应数据转换函数 */
  transformResponse?: (data: unknown) => PaginatedResponse<TItem>
  /** 请求成功回调 */
  onSuccess?: (data: PaginatedResponse<TItem>) => void
  /** 请求失败回调 */
  onError?: (error: Error) => void
}

/**
 * usePaginatedApi 返回值
 */
export interface UsePaginatedApiReturn<TItem = unknown, TParams = unknown> {
  /** 数据列表 */
  items: ShallowRef<TItem[]>
  /** 是否加载中 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: ShallowRef<Error | undefined>
  /** 当前页码 */
  page: Ref<number>
  /** 每页大小 */
  pageSize: Ref<number>
  /** 总条数 */
  total: Ref<number>
  /** 总页数 */
  totalPages: ComputedRef<number>
  /** 是否有下一页 */
  hasNextPage: ComputedRef<boolean>
  /** 是否有上一页 */
  hasPrevPage: ComputedRef<boolean>
  /** 是否第一页 */
  isFirstPage: ComputedRef<boolean>
  /** 是否最后一页 */
  isLastPage: ComputedRef<boolean>
  /** 排序字段 */
  sortBy: Ref<string | undefined>
  /** 排序方向 */
  sortOrder: Ref<'asc' | 'desc' | undefined>
  /** 执行查询 */
  execute: (params?: TParams, options?: ApiRequestOptions) => Promise<PaginatedResponse<TItem>>
  /** 刷新当前页 */
  refresh: () => Promise<PaginatedResponse<TItem>>
  /** 跳转到指定页 */
  goToPage: (page: number) => Promise<PaginatedResponse<TItem>>
  /** 下一页 */
  nextPage: () => Promise<PaginatedResponse<TItem>>
  /** 上一页 */
  prevPage: () => Promise<PaginatedResponse<TItem>>
  /** 第一页 */
  firstPage: () => Promise<PaginatedResponse<TItem>>
  /** 最后一页 */
  lastPage: () => Promise<PaginatedResponse<TItem>>
  /** 设置每页大小 */
  setPageSize: (size: number) => Promise<PaginatedResponse<TItem>>
  /** 设置排序 */
  setSort: (sortBy: string, sortOrder?: 'asc' | 'desc') => Promise<PaginatedResponse<TItem>>
  /** 重置分页 */
  reset: () => void
}

/**
 * 默认响应转换器
 */
function defaultTransformResponse<T>(data: unknown): PaginatedResponse<T> {
  // 尝试自动检测响应结构
  const obj = data as Record<string, unknown>

  // 常见的响应结构
  const items = (
    obj.items ??
    obj.data ??
    obj.list ??
    obj.records ??
    obj.rows ??
    []
  ) as T[]

  const total = (
    obj.total ??
    obj.totalCount ??
    obj.count ??
    obj.totalElements ??
    items.length
  ) as number

  const page = (
    obj.page ??
    obj.pageNum ??
    obj.currentPage ??
    obj.pageNumber ??
    1
  ) as number

  const pageSize = (
    obj.pageSize ??
    obj.size ??
    obj.limit ??
    obj.perPage ??
    10
  ) as number

  const totalPages = Math.ceil(total / pageSize)

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * 使用分页 API
 *
 * @example
 * ```typescript
 * // 定义 API
 * const getUsersApi = defineRestfulApi<{ page: number; pageSize: number }, UserListResponse>(
 *   'api', 'getUsers', 'GET', '/users'
 * ).queryKeys('page', 'pageSize').build()
 *
 * // 使用
 * const {
 *   items,
 *   loading,
 *   page,
 *   pageSize,
 *   total,
 *   totalPages,
 *   hasNextPage,
 *   nextPage,
 *   prevPage,
 *   goToPage,
 *   setPageSize
 * } = usePaginatedApi(getUsersApi, {
 *   initialPageSize: 20,
 *   immediate: true
 * })
 *
 * // 跳转到指定页
 * await goToPage(3)
 *
 * // 下一页
 * await nextPage()
 *
 * // 设置每页大小
 * await setPageSize(50)
 * ```
 */
export function usePaginatedApi<TItem = unknown, TParams extends Record<string, unknown> = Record<string, unknown>>(
  apiOrId: UnifiedApiDefinition<TParams & PaginationParams, unknown> | string,
  options: UsePaginatedApiOptions<TItem, TParams> = {}
): UsePaginatedApiReturn<TItem, TParams> {
  const manager = injectApiManager()

  // 状态
  const items = shallowRef<TItem[]>([])
  const loading = ref(false)
  const error = shallowRef<Error | undefined>(undefined)
  const page = ref(options.initialPage ?? 1)
  const pageSize = ref(options.initialPageSize ?? 10)
  const total = ref(0)
  const sortBy = ref<string | undefined>(options.initialSortBy)
  const sortOrder = ref<'asc' | 'desc' | undefined>(options.initialSortOrder)

  // 其他参数
  let currentParams: TParams | undefined = options.params

  // 取消控制器
  let abortController: AbortController | null = null

  // 计算属性
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)
  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPrevPage = computed(() => page.value > 1)
  const isFirstPage = computed(() => page.value === 1)
  const isLastPage = computed(() => page.value >= totalPages.value)

  /**
   * 执行查询
   */
  async function execute(
    params?: TParams,
    requestOptions?: ApiRequestOptions
  ): Promise<PaginatedResponse<TItem>> {
    // 取消之前的请求
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()

    if (params) {
      currentParams = params
    }

    loading.value = true
    error.value = undefined

    try {
      // 构建分页参数
      const paginationParams: PaginationParams = {
        page: page.value,
        pageSize: pageSize.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
      }

      // 合并参数
      const allParams = {
        ...currentParams,
        ...paginationParams,
      } as TParams & PaginationParams

      // 构建请求选项
      let apiOptions: ApiRequestOptions

      if (typeof apiOrId === 'string') {
        const api = manager.getApi(apiOrId)
        if (!api) {
          throw new Error(`API not found: ${apiOrId}`)
        }

        if (api.type === 'leap') {
          apiOptions = {
            params: allParams as unknown as Record<string, unknown>,
            signal: abortController.signal,
            ...requestOptions,
          }
        } else {
          apiOptions = {
            query: allParams as unknown as Record<string, unknown>,
            signal: abortController.signal,
            ...requestOptions,
          }
        }
      } else {
        if (apiOrId.type === 'leap') {
          apiOptions = {
            params: allParams as unknown as Record<string, unknown>,
            signal: abortController.signal,
            ...requestOptions,
          }
        } else {
          apiOptions = {
            query: allParams as unknown as Record<string, unknown>,
            signal: abortController.signal,
            ...requestOptions,
          }
        }
      }

      const result = await manager.call(apiOrId as string | UnifiedApiDefinition, apiOptions)

      // 转换响应
      const transformer = options.transformResponse ?? defaultTransformResponse
      const paginatedData = transformer(result.data) as PaginatedResponse<TItem>

      // 更新状态
      items.value = paginatedData.items
      total.value = paginatedData.total
      page.value = paginatedData.page
      pageSize.value = paginatedData.pageSize

      options.onSuccess?.(paginatedData)

      return paginatedData
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
   * 刷新当前页
   */
  function refresh(): Promise<PaginatedResponse<TItem>> {
    return execute()
  }

  /**
   * 跳转到指定页
   */
  function goToPage(targetPage: number): Promise<PaginatedResponse<TItem>> {
    page.value = Math.max(1, Math.min(targetPage, totalPages.value))
    return execute()
  }

  /**
   * 下一页
   */
  function nextPage(): Promise<PaginatedResponse<TItem>> {
    if (hasNextPage.value) {
      page.value++
      return execute()
    }
    return Promise.resolve({
      items: items.value,
      total: total.value,
      page: page.value,
      pageSize: pageSize.value,
      totalPages: totalPages.value,
    })
  }

  /**
   * 上一页
   */
  function prevPage(): Promise<PaginatedResponse<TItem>> {
    if (hasPrevPage.value) {
      page.value--
      return execute()
    }
    return Promise.resolve({
      items: items.value,
      total: total.value,
      page: page.value,
      pageSize: pageSize.value,
      totalPages: totalPages.value,
    })
  }

  /**
   * 第一页
   */
  function firstPage(): Promise<PaginatedResponse<TItem>> {
    page.value = 1
    return execute()
  }

  /**
   * 最后一页
   */
  function lastPage(): Promise<PaginatedResponse<TItem>> {
    page.value = totalPages.value
    return execute()
  }

  /**
   * 设置每页大小
   */
  function setPageSize(size: number): Promise<PaginatedResponse<TItem>> {
    pageSize.value = size
    page.value = 1 // 重置到第一页
    return execute()
  }

  /**
   * 设置排序
   */
  function setSort(
    newSortBy: string,
    newSortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<PaginatedResponse<TItem>> {
    sortBy.value = newSortBy
    sortOrder.value = newSortOrder
    page.value = 1 // 重置到第一页
    return execute()
  }

  /**
   * 重置
   */
  function reset(): void {
    items.value = []
    loading.value = false
    error.value = undefined
    page.value = options.initialPage ?? 1
    pageSize.value = options.initialPageSize ?? 10
    total.value = 0
    sortBy.value = options.initialSortBy
    sortOrder.value = options.initialSortOrder
    currentParams = options.params

    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  // 监听参数变化
  if (options.watchParams !== false) {
    watch(
      [page, pageSize, sortBy, sortOrder],
      () => {
        // 由于 goToPage 等函数已经调用了 execute，这里不需要重复调用
        // 这个 watch 主要用于外部直接修改 page/pageSize 时触发
      },
      { flush: 'post' }
    )
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
    items,
    loading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    isFirstPage,
    isLastPage,
    sortBy,
    sortOrder,
    execute,
    refresh,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    setSort,
    reset,
  }
}
