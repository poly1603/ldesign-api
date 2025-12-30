/**
 * useRestfulApi 组合函数
 *
 * 专为 RESTful 接口优化的组合函数
 */
import type { Ref, ShallowRef } from 'vue';
import type { ApiResult, RestfulApiDefinition, RestfulRequestOptions } from '@ldesign/api-core';
/**
 * useRestfulApi 选项
 */
export interface UseRestfulApiOptions {
    /** 是否立即执行 */
    immediate?: boolean;
    /** 初始路径参数 */
    pathParams?: Record<string, string | number>;
    /** 初始查询参数 */
    query?: Record<string, unknown>;
    /** 初始请求体 */
    body?: unknown;
    /** 请求成功回调 */
    onSuccess?: (data: unknown) => void;
    /** 请求失败回调 */
    onError?: (error: Error) => void;
}
/**
 * useRestfulApi 返回值
 */
export interface UseRestfulApiReturn<TResponse = unknown> {
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
    execute: (options?: RestfulRequestOptions) => Promise<TResponse>;
    /** 刷新 */
    refresh: () => Promise<TResponse>;
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
export declare function useRestfulApi<TResponse = unknown, TParams = unknown>(api: RestfulApiDefinition<TParams, TResponse>, options?: UseRestfulApiOptions): UseRestfulApiReturn<TResponse>;
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
export declare function createRestfulResource<TEntity>(serverId: string, basePath: string): {
    list(query?: Record<string, unknown>): Promise<TEntity[]>;
    get(id: string | number, query?: Record<string, unknown>): Promise<TEntity>;
    create(data: Partial<TEntity>): Promise<TEntity>;
    update(id: string | number, data: Partial<TEntity>): Promise<TEntity>;
    patch(id: string | number, data: Partial<TEntity>): Promise<TEntity>;
    delete(id: string | number): Promise<void>;
};
//# sourceMappingURL=useRestfulApi.d.ts.map