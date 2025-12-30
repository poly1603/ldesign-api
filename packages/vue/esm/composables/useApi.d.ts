/**
 * useApi 组合函数
 *
 * 提供响应式的 API 调用功能
 */
import type { Ref, ShallowRef } from 'vue';
import type { ApiRequestOptions, ApiResult, UnifiedApiDefinition } from '@ldesign/api-core';
/**
 * useApi 选项
 */
export interface UseApiOptions<TParams = unknown> {
    /** 初始参数 */
    params?: TParams;
    /** 是否立即执行 */
    immediate?: boolean;
    /** 是否监听参数变化自动重新请求 */
    watch?: boolean;
    /** 请求成功回调 */
    onSuccess?: (data: unknown) => void;
    /** 请求失败回调 */
    onError?: (error: Error) => void;
    /** 请求完成回调（无论成功失败） */
    onFinally?: () => void;
}
/**
 * useApi 返回值
 */
export interface UseApiReturn<TResponse = unknown, TParams = unknown> {
    /** 响应数据 */
    data: ShallowRef<TResponse | undefined>;
    /** 是否加载中 */
    loading: Ref<boolean>;
    /** 错误信息 */
    error: ShallowRef<Error | undefined>;
    /** 是否请求成功 */
    isSuccess: Ref<boolean>;
    /** 是否请求失败 */
    isError: Ref<boolean>;
    /** 完整响应 */
    response: ShallowRef<ApiResult<TResponse> | undefined>;
    /** 执行请求 */
    execute: (params?: TParams, options?: ApiRequestOptions) => Promise<TResponse>;
    /** 重新请求（使用上次参数） */
    refresh: () => Promise<TResponse>;
    /** 重置状态 */
    reset: () => void;
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
export declare function useApi<TResponse = unknown, TParams = unknown>(apiOrId: UnifiedApiDefinition<TParams, TResponse> | string, options?: UseApiOptions<TParams>): UseApiReturn<TResponse, TParams>;
//# sourceMappingURL=useApi.d.ts.map