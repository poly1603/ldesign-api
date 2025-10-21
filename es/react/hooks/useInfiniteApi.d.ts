import type { ApiCallOptions } from '../../types';
/** 无限滚动（React 版） */
export declare function useInfiniteApi<T = unknown>(methodName: string, options?: ApiCallOptions & {
    page?: number;
    pageSize?: number;
    extract?: (result: any) => {
        items: T[];
        total: number;
    };
    query?: Record<string, unknown>;
    auto?: boolean;
    root?: Element | null;
    rootMargin?: string;
    threshold?: number;
    immediate?: boolean;
}): {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    loading: boolean;
    error: import("../../types").ApiError | null;
    loadMore: () => Promise<T[]>;
    reset: () => void;
    hasMore: boolean;
    targetRef: {
        current: Element | null;
    };
};
