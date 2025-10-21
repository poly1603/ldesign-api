import type { ApiCallOptions } from '../../types';
/** 定时轮询（React 版） */
export declare function useApiPolling<T = unknown>(methodName: string, options?: ApiCallOptions & {
    interval: number;
    params?: unknown;
    autoStart?: boolean;
    immediate?: boolean;
    onSuccess?: (d: T) => void;
    onError?: (e: Error) => void;
    onFinally?: () => void;
}): {
    start: () => void;
    stop: () => void;
    isActive: boolean;
    data: T | null;
    loading: boolean;
    error: import("../../types").ApiError | null;
    execute: (params?: unknown, options?: ApiCallOptions) => Promise<T>;
    reset: () => void;
    isFinished: boolean;
    isSuccess: boolean;
    isError: boolean;
};
