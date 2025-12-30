/**
 * API 管理器实现
 *
 * 提供统一的 API 注册、管理和调用功能
 * 支持多服务器、多种接口类型
 */
import type { ApiAdapter, ApiManager, ApiManagerConfig, ApiRequestOptions, ApiResult, ServerConfig, ServerType, UnifiedApiDefinition } from '../types';
/**
 * API 管理器实现类
 */
export declare class ApiManagerImpl implements ApiManager {
    private config;
    private servers;
    private apis;
    private adapters;
    private httpClients;
    private defaultServerId;
    private initialized;
    constructor(config?: ApiManagerConfig);
    registerServer(config: ServerConfig): void;
    getServer(id: string): ServerConfig | undefined;
    getServers(): ServerConfig[];
    removeServer(id: string): boolean;
    setDefaultServer(id: string): void;
    register<TParams = unknown, TResponse = unknown>(api: UnifiedApiDefinition<TParams, TResponse>): string;
    registerAll(apis: UnifiedApiDefinition[]): string[];
    getApi(id: string): UnifiedApiDefinition | undefined;
    getApis(): UnifiedApiDefinition[];
    removeApi(id: string): boolean;
    call<TResponse = unknown>(idOrApi: string | UnifiedApiDefinition, options?: ApiRequestOptions): Promise<ApiResult<TResponse>>;
    createCaller<TParams, TResponse>(api: UnifiedApiDefinition<TParams, TResponse>): (params: TParams, options?: Omit<ApiRequestOptions, 'params' | 'body'>) => Promise<TResponse>;
    init(): Promise<void>;
    destroy(): void;
    /**
     * 获取或创建 HTTP 客户端
     */
    private getHttpClient;
    /**
     * 生成 API ID
     */
    private generateApiId;
    /**
     * 注册自定义适配器
     */
    registerAdapter(type: ServerType, adapter: ApiAdapter): void;
    /**
     * 获取适配器
     */
    getAdapter(type: ServerType): ApiAdapter | undefined;
}
/**
 * 创建 API 管理器
 */
export declare function createApiManager(config?: ApiManagerConfig): ApiManager;
/**
 * 创建并初始化 API 管理器
 */
export declare function createApiManagerAsync(config?: ApiManagerConfig): Promise<ApiManager>;
//# sourceMappingURL=ApiManager.d.ts.map