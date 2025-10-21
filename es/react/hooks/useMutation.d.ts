export declare function useMutation<TResult = unknown, TVars = unknown>(methodName: string, options?: {
    onMutate?: (variables: TVars) => void | (() => void);
    onSuccess?: (data: TResult, variables: TVars) => void;
    onError?: (error: Error, variables: TVars, rollback?: () => void) => void;
    onFinally?: () => void;
    optimistic?: {
        apply?: (variables: TVars) => void | (() => void);
        snapshot?: () => unknown;
        restore?: (snapshot: unknown) => void;
        rollbackOnError?: boolean;
        snapshotStrategy?: 'shallow' | 'deep';
        target?: {
            get: () => unknown;
            set: (v: unknown) => void;
        };
    };
    lockWhilePending?: boolean;
}): {
    data: TResult | null;
    loading: boolean;
    error: Error | null;
    mutate: (variables: TVars, callOptions?: Parameters<(<T = any>(methodName: string, params?: any, options?: import("..").ApiCallOptions) => Promise<T>)>[2]) => Promise<TResult>;
    reset: () => void;
    isFinished: boolean;
    isSuccess: boolean;
    isError: boolean;
};
