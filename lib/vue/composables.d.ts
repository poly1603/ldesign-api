/**
 * Vue 组合式 API
 * 提供 Vue 3 组合式 API 钩子函数
 */
import type { ComputedRef, Ref } from 'vue';
import type { ApiCallOptions, ApiEngine, LoginResult, MenuItem, UserInfo } from '../types';
import { ApiError } from '../utils/ApiError';
/**
 * API 调用状态
 */
export interface ApiCallState<T = unknown> {
    /** 响应数据 */
    data: Ref<T | null>;
    /** 加载状态 */
    loading: Ref<boolean>;
    /** 错误信息 */
    error: Ref<ApiError | null>;
    /** 执行函数 */
    execute: (params?: unknown, options?: ApiCallOptions) => Promise<T>;
    /** 重置状态 */
    reset: () => void;
    /** 取消请求 */
    cancel: () => void;
    /** 是否已完成 */
    isFinished: ComputedRef<boolean>;
    /** 是否成功 */
    isSuccess: ComputedRef<boolean>;
    /** 是否失败 */
    isError: ComputedRef<boolean>;
}
/**
 * 变更类钩子：useMutation
 * - 封装创建/更新/删除等需要提交的操作
 * - 支持 onMutate（可返回回滚函数）、onSuccess/onError/onFinally
 */
/**
 * 变更操作选项
 */
export interface UseMutationOptions<TResult = unknown, TVars = unknown> extends Omit<UseApiCallOptions<TResult>, 'onSuccess' | 'onError'> {
    onMutate?: (variables: TVars) => void | (() => void);
    onSuccess?: (data: TResult, variables: TVars) => void;
    onError?: (error: ApiError, variables: TVars, rollback?: () => void) => void;
    optimistic?: {
        /** 直接应用变更，返回回滚函数 */
        apply?: (variables: TVars) => void | (() => void);
        /** 生成快照 */
        snapshot?: () => unknown;
        /** 从快照还原 */
        restore?: (snapshot: unknown) => void;
        /** 出错时是否回滚（默认 true） */
        rollbackOnError?: boolean;
        /** 内置快照策略：'shallow' | 'deep'（当未提供 snapshot/restore 且提供 target 时生效） */
        snapshotStrategy?: 'shallow' | 'deep';
        /** 目标读写器（与 snapshotStrategy 配合使用） */
        target?: {
            get: () => unknown;
            set: (v: unknown) => void;
        };
    };
    /** 是否在进行中时拒绝新的 mutate 调用（默认 false） */
    lockWhilePending?: boolean;
}
export declare function useMutation<TResult = unknown, TVars = unknown>(methodName: string, options?: UseMutationOptions<TResult, TVars>): {
    data: Ref<TResult | null>;
    loading: Ref<boolean, boolean>;
    error: Ref<Error | null, Error | null>;
    isFinished: ComputedRef<boolean>;
    isSuccess: ComputedRef<boolean>;
    isError: ComputedRef<boolean>;
    mutate: (variables: TVars, callOptions?: UseApiCallOptions) => Promise<TResult>;
    reset: () => void;
};
/**
 * API 调用选项
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
    /** 是否在组件卸载时自动取消请求 */
    autoCancel?: boolean;
}
/**
 * 获取 API 引擎实例
 *
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { useApi } from '@ldesign/api/vue'
 *
 * const apiEngine = useApi()
 * const result = await apiEngine.call('getUserInfo')
 * ```
 */
export declare function useApi(): ApiEngine;
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
 * import { useRequest } from '@ldesign/api/vue'
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
/**
 * API 调用钩子
 *
 * @param methodName API 方法名称
 * @param options 调用选项
 * @returns API 调用状态
 *
 * @example
 * ```typescript
 * import { useApiCall } from '@ldesign/api/vue'
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
 * 轮询式 API 调用钩子
 * 定时按间隔调用某个 API 方法，适合状态刷新、心跳等场景
 */
export declare function useApiPolling<T = unknown>(methodName: string, options?: UseApiCallOptions<T> & {
    interval: number;
    params?: unknown;
    autoStart?: boolean;
}): {
    start: () => void;
    stop: () => void;
    isActive: ComputedRef<boolean>;
    /** 响应数据 */
    data: Ref<T | null, T | null>;
    /** 加载状态 */
    loading: Ref<boolean>;
    /** 错误信息 */
    error: Ref<ApiError | null>;
    /** 执行函数 */
    execute: (params?: unknown, options?: ApiCallOptions) => Promise<T>;
    /** 重置状态 */
    reset: () => void;
    /** 取消请求 */
    cancel: () => void;
    /** 是否已完成 */
    isFinished: ComputedRef<boolean>;
    /** 是否成功 */
    isSuccess: ComputedRef<boolean>;
    /** 是否失败 */
    isError: ComputedRef<boolean>;
};
/**
 * 批量 API 调用钩子
 *
 * @param calls API 调用配置数组
 * @param options 调用选项
 * @returns 批量调用状态
 *
 * @example
 * ```typescript
 * import { useBatchApiCall } from '@ldesign/api/vue'
 *
 * const { data, loading, errors, execute } = useBatchApiCall([
 *   { methodName: 'getUserInfo' },
 *   { methodName: 'getMenus' },
 *   { methodName: 'getPermissions' },
 * ])
 * ```
 */
export declare function useInfiniteApi<T = unknown>(methodName: string, options?: UseApiCallOptions<{
    items: T[];
    total: number;
}> & {
    page?: number;
    pageSize?: number;
    extract?: (result: any) => {
        items: T[];
        total: number;
    };
    query?: Record<string, unknown>;
    auto?: boolean;
    target?: Ref<Element | null>;
    root?: Element | null;
    rootMargin?: string;
    threshold?: number;
}): {
    items: Ref<T[]>;
    total: Ref<number, number>;
    page: Ref<number, number>;
    pageSize: Ref<number, number>;
    loading: Ref<boolean, boolean>;
    error: Ref<ApiError | null, ApiError | null>;
    loadMore: () => Promise<T[]>;
    reset: () => void;
    hasMore: ComputedRef<boolean>;
};
export declare function useBatchApiCall<T = unknown>(calls: Array<{
    methodName: string;
    params?: unknown;
    options?: ApiCallOptions;
}>, options?: Omit<UseApiCallOptions, 'onSuccess' | 'onError'> & {
    onSuccess?: (results: T[]) => void;
    onError?: (errors: (Error | null)[]) => void;
}): {
    data: Ref<T[]>;
    loading: Ref<boolean>;
    errors: Ref<(Error | null)[]>;
    execute: () => Promise<T[]>;
    reset: () => void;
    isFinished: ComputedRef<boolean>;
    isSuccess: ComputedRef<boolean>;
    hasErrors: ComputedRef<boolean>;
};
/**
 * 系统 API 钩子
 *
 * @returns 系统 API 方法对象
 *
 * @example
 * ```typescript
 * import { useSystemApi } from '@ldesign/api/vue'
 *
 * const systemApi = useSystemApi()
 *
 * const { data: userInfo, loading, execute: fetchUserInfo } = systemApi.getUserInfo({
 *   immediate: true,
 * })
 *
 * const { execute: login } = systemApi.login({
 *   onSuccess: (result) => ,
 * })
 * ```
 */
export declare function useSystemApi(): {
    /**
     * 获取验证码
     */
    getCaptcha: (options?: UseApiCallOptions<import("../types").CaptchaInfo>) => ApiCallState<import("..").CaptchaInfo>;
    /**
     * 用户登录
     */
    login: (options?: UseApiCallOptions<LoginResult>) => ApiCallState<LoginResult>;
    /**
     * 用户登出
     */
    logout: (options?: UseApiCallOptions<void>) => ApiCallState<void>;
    /**
     * 获取用户信息
     */
    getUserInfo: (options?: UseApiCallOptions<UserInfo>) => ApiCallState<UserInfo>;
    /**
     * 更新用户信息
     */
    updateUserInfo: (options?: UseApiCallOptions<UserInfo>) => ApiCallState<UserInfo>;
    /**
     * 获取系统菜单
     */
    getMenus: (options?: UseApiCallOptions<MenuItem[]>) => ApiCallState<MenuItem[]>;
    /**
     * 获取用户权限
     */
    getPermissions: (options?: UseApiCallOptions<string[]>) => ApiCallState<string[]>;
    /**
     * 刷新令牌
     */
    refreshToken: (options?: UseApiCallOptions<LoginResult>) => ApiCallState<LoginResult>;
    /**
     * 修改密码
     */
    changePassword: (options?: UseApiCallOptions<void>) => ApiCallState<void>;
    /**
     * 获取系统配置
     */
    getSystemConfig: (options?: UseApiCallOptions<unknown>) => ApiCallState<unknown>;
};
/**
 * 分页列表钩子：usePaginatedApi
 * - 管理 page/pageSize/total/items 等状态
 * - 内置翻页与修改 pageSize 操作
 * - 通过 extract 适配不同返回结构
 */
export declare function usePaginatedApi<T = unknown>(methodName: string, options?: UseApiCallOptions<{
    items: T[];
    total: number;
}> & {
    /** 初始页码（从 1 开始） */
    page?: number;
    /** 每页条数 */
    pageSize?: number;
    /** 提取器，将接口返回值提取为 { items, total } */
    extract?: (result: any) => {
        items: T[];
        total: number;
    };
    /** 额外的查询参数（除 page/pageSize 外） */
    query?: Record<string, unknown>;
}): {
    page: Ref<number, number>;
    pageSize: Ref<number, number>;
    total: Ref<number, number>;
    items: Ref<T[]>;
    loading: Ref<boolean, boolean>;
    error: Ref<ApiError | null, ApiError | null>;
    run: () => Promise<void>;
    setPage: (p: number) => void;
    setPageSize: (s: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    isFinished: ComputedRef<boolean>;
    hasMore: ComputedRef<boolean>;
};
/**
 * 清理钩子，在组件卸载时自动清理资源
 */
export declare function useApiCleanup(): void;
