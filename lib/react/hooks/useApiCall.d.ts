import type { ApiCallOptions } from '../../types';
import { ApiError } from '../../utils/ApiError';
/**
 * React API 调用选项
 */
export interface UseApiCallOptions<T = unknown> extends ApiCallOptions {
    /** 是否立即执行 */
    immediate?: boolean;
    /** 成功回调 */
    onSuccess?: (data: T) => void;
    /** 错误回调 */
    onError?: (error: ApiError) => void;
    /** 完成回调 */
    onFinally?: () => void;
    /** 默认数据 */
    defaultData?: T;
}
/**
 * API 调用状态
 */
export interface ApiCallState<T = unknown> {
    /** 响应数据 */
    data: T | null;
    /** 加载状态 */
    loading: boolean;
    /** 错误信息 */
    error: ApiError | null;
    /** 执行函数 */
    execute: (params?: unknown, options?: ApiCallOptions) => Promise<T>;
    /** 重置状态 */
    reset: () => void;
    /** 是否已完成 */
    isFinished: boolean;
    /** 是否成功 */
    isSuccess: boolean;
    /** 是否失败 */
    isError: boolean;
}
/**
 * useApiCall（React 版）
 * 与 Vue 版行为保持一致：data/loading/error/execute/reset + immediate
 *
 * @param methodName API 方法名称
 * @param options 调用选项
 * @returns API 调用状态
 *
 * @example
 * ```typescript
 * import { useApiCall } from '@ldesign/api/react'
 *
 * // 基础用法
 * const { data, loading, error, execute } = useApiCall<UserInfo>('getUserInfo', {
 *   immediate: true,
 *   onSuccess: (data) => ,
 *   onError: (error) => console.error('Error:', error),
 * })
 *
 * // 带默认数据
 * const { data } = useApiCall<User[]>('getUsers', {
 *   defaultData: [],
 *   immediate: true,
 * })
 * ```
 */
export declare function useApiCall<T = unknown>(methodName: string, options?: UseApiCallOptions<T>): ApiCallState<T>;
/**
 * 简化的API调用钩子，自动推断类型
 *
 * @param methodName API 方法名称
 * @param params 请求参数
 * @param options 调用选项
 * @returns API 调用状态
 *
 * @example
 * ```typescript
 * import { useRequest } from '@ldesign/api/react'
 *
 * // 自动执行
 * const { data, loading, error } = useRequest<UserInfo>('getUserInfo')
 *
 * // 带参数
 * const { data, loading, error, execute } = useRequest<User[]>('getUsers', { page: 1 })
 *
 * // 手动执行
 * const { data, loading, error, execute } = useRequest<User>('createUser', null, { immediate: false })
 * ```
 */
export declare function useRequest<T = unknown>(methodName: string, params?: unknown, options?: UseApiCallOptions<T>): ApiCallState<T>;
