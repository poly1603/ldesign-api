import type { ApiCallOptions } from '../../types';
/** 分页列表（React 版） */
export declare function usePaginatedApi<T = unknown>(methodName: string, options?: ApiCallOptions & {
    page?: number;
    pageSize?: number;
    extract?: (result: any) => {
        items: T[];
        total: number;
    };
    query?: Record<string, unknown>;
    immediate?: boolean;
    onSuccess?: (res: any) => void;
    onError?: (e: Error) => void;
    onFinally?: () => void;
}): {
    page: number;
    pageSize: number;
    total: number;
    items: T[];
    loading: boolean;
    error: import("../../types").ApiError | null;
    run: () => Promise<void>;
    setPage: (p: number) => void;
    setPageSize: (s: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    isFinished: boolean;
    hasMore: boolean;
};
