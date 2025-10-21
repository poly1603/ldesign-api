/**
 * 请求取消管理器
 * 提供请求取消功能，支持单个取消、批量取消和自动取消
 */
/**
 * 取消令牌
 */
export declare class CancellationToken {
    private _isCancelled;
    private _reason;
    private _callbacks;
    /**
     * 是否已取消
     */
    get isCancelled(): boolean;
    /**
     * 取消原因
     */
    get reason(): string | undefined;
    /**
     * 取消请求
     */
    cancel(reason?: string): void;
    /**
     * 注册取消回调
     */
    onCancel(callback: (reason?: string) => void): () => void;
    /**
     * 抛出取消错误
     */
    throwIfCancelled(): void;
}
/**
 * 取消错误
 */
export declare class CancellationError extends Error {
    readonly name = "CancellationError";
    readonly isCancellation = true;
    constructor(message?: string);
}
/**
 * 检查是否为取消错误
 */
export declare function isCancellationError(error: unknown): error is CancellationError;
/**
 * 请求取消管理器
 */
export declare class RequestCancellationManager {
    private tokens;
    private groups;
    /**
     * 创建取消令牌
     */
    createToken(requestId: string, group?: string): CancellationToken;
    /**
     * 获取取消令牌
     */
    getToken(requestId: string): CancellationToken | null;
    /**
     * 取消请求
     */
    cancel(requestId: string, reason?: string): boolean;
    /**
     * 取消组内所有请求
     */
    cancelGroup(group: string, reason?: string): number;
    /**
     * 取消所有请求
     */
    cancelAll(reason?: string): number;
    /**
     * 检查请求是否已取消
     */
    isCancelled(requestId: string): boolean;
    /**
     * 清理已完成的请求
     */
    cleanup(requestId: string): void;
    /**
     * 清理组
     */
    cleanupGroup(group: string): void;
    /**
     * 清理所有
     */
    clear(): void;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalTokens: number;
        activeTokens: number;
        cancelledTokens: number;
        totalGroups: number;
    };
    /**
     * 获取组信息
     */
    getGroupInfo(group: string): {
        totalRequests: number;
        activeRequests: number;
        cancelledRequests: number;
    } | null;
    /**
     * 销毁管理器
     */
    destroy(): void;
}
/**
 * 创建请求取消管理器
 */
export declare function createRequestCancellationManager(): RequestCancellationManager;
/**
 * 全局请求取消管理器
 */
export declare const globalCancellationManager: RequestCancellationManager;
