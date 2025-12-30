/**
 * useLeapApi 组合函数
 *
 * 专为 LEAP RPC 接口优化的组合函数
 */
import type { Ref, ShallowRef } from 'vue';
import type { ApiResult, LeapApiDefinition, LeapRequestOptions } from '@ldesign/api-core';
/**
 * useLeapApi 选项
 */
export interface UseLeapApiOptions<TParams = unknown> {
    /** 初始参数 */
    params?: TParams;
    /** 是否立即执行 */
    immediate?: boolean;
    /** 请求成功回调 */
    onSuccess?: (data: unknown) => void;
    /** 请求失败回调 */
    onError?: (error: Error) => void;
}
/**
 * useLeapApi 返回值
 */
export interface UseLeapApiReturn<TResponse = unknown, TParams = unknown> {
    /** 响应数据 */
    data: ShallowRef<TResponse | undefined>;
    /** 是否加载中 */
    loading: Ref<boolean>;
    /** 错误信息 */
    error: ShallowRef<Error | undefined>;
    /** 是否成功 */
    isSuccess: Ref<boolean>;
    /** 完整响应 */
    response: ShallowRef<ApiResult<TResponse> | undefined>;
    /** 执行请求 */
    execute: (params?: TParams, options?: Omit<LeapRequestOptions, 'params'>) => Promise<TResponse>;
    /** 刷新 */
    refresh: () => Promise<TResponse>;
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
export declare function useLeapApi<TResponse = unknown, TParams extends Record<string, unknown> = Record<string, unknown>>(api: LeapApiDefinition<TParams, TResponse>, options?: UseLeapApiOptions<TParams>): UseLeapApiReturn<TResponse, TParams>;
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
export declare function createLeapCaller(serverId: string): <TResponse = unknown>(method: string, params?: Record<string, unknown>, options?: Omit<LeapRequestOptions, "params">) => Promise<TResponse>;
//# sourceMappingURL=useLeapApi.d.ts.map