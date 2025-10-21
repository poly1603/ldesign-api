import type { ApiCallOptions } from '../../types';
/**
 * 批量 API 调用（React 版）
 */
export declare function useBatchApiCall<T = unknown>(calls: Array<{
    methodName: string;
    params?: unknown;
    options?: ApiCallOptions;
}>, options?: Omit<ApiCallOptions, 'onSuccess' | 'onError'> & {
    immediate?: boolean;
    onSuccess?: (results: T[]) => void;
    onError?: (errors: (Error | null)[]) => void;
    onFinally?: () => void;
}): {
    data: T[];
    loading: boolean;
    errors: (Error | null)[];
    execute: () => Promise<T[]>;
    reset: () => void;
    isFinished: boolean;
    isSuccess: boolean;
    hasErrors: boolean;
};
