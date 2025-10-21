/**
 * Vue 工具函数
 */
import type { ComputedRef, Ref } from 'vue';
import type { ApiEngine } from '../types';
/**
 * IntersectionObserver 选项
 */
export interface UseIntersectionOptions {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number;
}
/**
 * 简单的 IntersectionObserver 工具
 *
 * @param target 观察的目标元素 Ref
 * @param onIntersect 进入可视区域时触发的回调
 * @param options 观察选项
 * @returns stop 函数用于停止观察
 */
export declare function useIntersectionObserver(target: Ref<Element | null>, onIntersect: (entry: IntersectionObserverEntry) => void, options?: UseIntersectionOptions): {
    stop: () => void;
};
/**
 * 创建防抖的 ref
 *
 * @param initialValue 初始值
 * @param delay 防抖延迟（毫秒）
 * @returns 防抖的 ref 和立即设置函数
 *
 * @example
 * ```typescript
 * import { useDebouncedRef } from '@ldesign/api/vue'
 *
 * const { debouncedValue, setValue } = useDebouncedRef('', 300)
 *
 * // 防抖更新
 * debouncedValue.value = 'new value'
 *
 * // 立即更新
 * setValue('immediate value')
 * ```
 */
export declare function useDebouncedRef<T>(initialValue: T, delay: number): {
    debouncedValue: Ref<T>;
    setValue: (value: T) => void;
};
/**
 * 创建响应式的API方法调用器
 *
 * @param methodName API 方法名称
 * @returns 响应式的API调用函数
 *
 * @example
 * ```typescript
 * import { useApiMethod } from '@ldesign/api/vue'
 *
 * const getUserInfo = useApiMethod<UserInfo>('getUserInfo')
 * const userInfo = await getUserInfo({ userId: 123 })
 * ```
 */
export declare function useApiMethod<T = unknown>(methodName: string): (params?: unknown, options?: any) => Promise<T>;
/**
 * 创建计算属性，用于检查API引擎是否可用
 *
 * @returns 计算属性，表示API引擎是否可用
 *
 * @example
 * ```typescript
 * import { useApiAvailable } from '@ldesign/api/vue'
 *
 * const isApiAvailable = useApiAvailable()
 *
 * if (isApiAvailable.value) {
 *   // API 可用
 * }
 * ```
 */
export declare function useApiAvailable(): ComputedRef<boolean>;
/**
 * 创建响应式的API状态检查器
 *
 * @returns API状态信息
 *
 * @example
 * ```typescript
 * import { useApiStatus } from '@ldesign/api/vue'
 *
 * const { isAvailable, engine, error } = useApiStatus()
 * ```
 */
export declare function useApiStatus(): {
    isAvailable: ComputedRef<boolean>;
    engine: ComputedRef<{
        readonly config: {
            appName?: string | undefined;
            version?: string | undefined;
            debug?: boolean | undefined;
            http?: import("@ldesign/http").HttpClientConfig | undefined;
            cache?: {
                enabled?: boolean | undefined;
                ttl?: number | undefined;
                maxSize?: number | undefined;
                storage?: "memory" | "localStorage" | "sessionStorage" | "lru" | undefined;
                prefix?: string | undefined;
                keyGenerator?: ((methodName: string, params?: any) => string) | undefined;
            } | undefined;
            debounce?: {
                enabled?: boolean | undefined;
                delay?: number | undefined;
            } | undefined;
            deduplication?: {
                enabled?: boolean | undefined;
                keyGenerator?: ((methodName: string, params?: any) => string) | undefined;
            } | undefined;
            retry?: {
                enabled?: boolean | undefined;
                retries?: number | undefined;
                delay?: number | undefined;
                backoff?: "fixed" | "exponential" | undefined;
                maxDelay?: number | undefined;
                jitter?: number | undefined;
                retryOn?: ((error: any, attempt: number) => boolean) | undefined;
                circuitBreaker?: {
                    enabled?: boolean | undefined;
                    failureThreshold?: number | undefined;
                    halfOpenAfter?: number | undefined;
                    successThreshold?: number | undefined;
                } | undefined;
            } | undefined;
            middlewares?: {
                request?: import("../types").RequestMiddleware[] | undefined;
                response?: import("../types").ResponseMiddleware[] | undefined;
                error?: import("../types").ErrorMiddleware[] | undefined;
            } | undefined;
            queue?: {
                enabled?: boolean | undefined;
                concurrency?: number | undefined;
                maxQueue?: number | undefined;
            } | undefined;
            smartCache?: {
                enabled?: boolean | undefined;
                minAccessThreshold?: number | undefined;
                hotDataTTLMultiplier?: number | undefined;
                coldDataTTLMultiplier?: number | undefined;
                statsWindowSize?: number | undefined;
                autoAdjustInterval?: number | undefined;
            } | undefined;
            analytics?: {
                enabled?: boolean | undefined;
                maxRecords?: number | undefined;
                recordRetention?: number | undefined;
                recordDetails?: boolean | undefined;
                cleanupInterval?: number | undefined;
            } | undefined;
            cancellation?: {
                enabled?: boolean | undefined;
                autoTimeout?: number | undefined;
            } | undefined;
        };
        readonly httpClient: import("@ldesign/http").HttpClient;
        readonly plugins: Map<string, {
            name: string;
            version?: string | undefined;
            dependencies?: string[] | undefined;
            apis?: Record<string, import("..").ApiMethodConfig> | undefined;
            install?: ((engine: ApiEngine) => void | Promise<void>) | undefined;
            uninstall?: ((engine: ApiEngine) => void | Promise<void>) | undefined;
        }> & Omit<Map<string, import("..").ApiPlugin>, keyof Map<any, any>>;
        readonly methods: Map<string, {
            name: string;
            config: import("@ldesign/http").RequestConfig | ((params?: any) => import("@ldesign/http").RequestConfig);
            transform?: ((response: import("@ldesign/http").ResponseData) => any) | undefined;
            validate?: ((data: any) => boolean) | undefined;
            onError?: ((error: any) => void) | undefined;
            onSuccess?: ((data: any) => void) | undefined;
            cache?: {
                enabled?: boolean | undefined;
                ttl?: number | undefined;
                maxSize?: number | undefined;
                storage?: "memory" | "localStorage" | "sessionStorage" | "lru" | undefined;
                prefix?: string | undefined;
                keyGenerator?: ((methodName: string, params?: any) => string) | undefined;
            } | undefined;
            debounce?: {
                enabled?: boolean | undefined;
                delay?: number | undefined;
            } | undefined;
            deduplication?: {
                enabled?: boolean | undefined;
                keyGenerator?: ((methodName: string, params?: any) => string) | undefined;
            } | undefined;
            retry?: {
                enabled?: boolean | undefined;
                retries?: number | undefined;
                delay?: number | undefined;
                backoff?: "fixed" | "exponential" | undefined;
                maxDelay?: number | undefined;
                jitter?: number | undefined;
                retryOn?: ((error: any, attempt: number) => boolean) | undefined;
                circuitBreaker?: {
                    enabled?: boolean | undefined;
                    failureThreshold?: number | undefined;
                    halfOpenAfter?: number | undefined;
                    successThreshold?: number | undefined;
                } | undefined;
            } | undefined;
            middlewares?: {
                request?: import("../types").RequestMiddleware[] | undefined;
                response?: import("../types").ResponseMiddleware[] | undefined;
                error?: import("../types").ErrorMiddleware[] | undefined;
            } | undefined;
            queue?: {
                enabled?: boolean | undefined;
                concurrency?: number | undefined;
                maxQueue?: number | undefined;
            } | undefined;
        }> & Omit<Map<string, import("..").ApiMethodConfig>, keyof Map<any, any>>;
        use: (plugin: import("..").ApiPlugin) => Promise<void>;
        unuse: (pluginName: string) => Promise<void>;
        register: (methodName: string, config: import("..").ApiMethodConfig) => void;
        registerBatch: (methods: Record<string, import("..").ApiMethodConfig>) => void;
        unregister: (methodName: string) => void;
        call: <T = any>(methodName: string, params?: any, options?: import("..").ApiCallOptions) => Promise<T>;
        callBatch: <T = any>(calls: Array<{
            methodName: string;
            params?: any;
            options?: import("..").ApiCallOptions;
        }>) => Promise<T[]>;
        hasMethod: (methodName: string) => boolean;
        getMethodNames: () => string[];
        clearCache: (methodName?: string) => void;
        getCacheStats: () => import("..").CacheStats;
        destroy: () => void;
    } | null>;
    error: ComputedRef<Error | null>;
};
