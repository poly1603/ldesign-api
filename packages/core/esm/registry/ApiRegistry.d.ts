/**
 * API 注册表
 *
 * 提供声明式的 API 定义方式
 * 支持模块化组织和类型安全
 */
import type { HttpMethod, LeapApiDefinition, RestfulApiDefinition, ServerConfig, UnifiedApiDefinition } from '../types';
/**
 * RESTful API 构建器
 */
export interface RestfulApiBuilder<TParams = unknown, TResponse = unknown> {
    /** 设置描述 */
    describe(description: string): this;
    /** 设置路径参数 */
    pathParams(...params: string[]): this;
    /** 设置查询参数键 */
    queryKeys(...keys: string[]): this;
    /** 设置请求转换器 */
    transformRequest(fn: (params: TParams) => unknown): this;
    /** 设置响应转换器 */
    transformResponse(fn: (data: unknown) => TResponse): this;
    /** 构建 API 定义 */
    build(): RestfulApiDefinition<TParams, TResponse>;
}
/**
 * LEAP API 构建器
 */
export interface LeapApiBuilder<TParams = unknown, TResponse = unknown> {
    /** 设置描述 */
    describe(description: string): this;
    /** 设置服务名称 */
    service(name: string): this;
    /** 设置路由 */
    router(name: string): this;
    /** 设置请求类型 */
    requestType(type: number): this;
    /** 设置参数转换器 */
    transformParams(fn: (params: TParams) => Record<string, unknown>): this;
    /** 设置响应转换器 */
    transformResponse(fn: (data: unknown) => TResponse): this;
    /** 构建 API 定义 */
    build(): LeapApiDefinition<TParams, TResponse>;
}
/**
 * 定义 RESTful API
 */
export declare function defineRestfulApi<TParams = unknown, TResponse = unknown>(serverId: string, name: string, method: HttpMethod, path: string): RestfulApiBuilder<TParams, TResponse>;
/**
 * 定义 LEAP API
 */
export declare function defineLeapApi<TParams = unknown, TResponse = unknown>(serverId: string, name: string, method: string): LeapApiBuilder<TParams, TResponse>;
/**
 * API 模块
 */
export interface ApiModule {
    /** 模块名称 */
    name: string;
    /** 模块描述 */
    description?: string;
    /** API 列表 */
    apis: UnifiedApiDefinition[];
}
/**
 * 定义 API 模块
 */
export declare function defineApiModule(name: string, apis: UnifiedApiDefinition[], description?: string): ApiModule;
/**
 * 定义服务器配置
 */
export declare function defineServer(config: ServerConfig): ServerConfig;
/**
 * 定义 RESTful 服务器
 */
export declare function defineRestfulServer(id: string, baseUrl: string, options?: Partial<Omit<ServerConfig, 'id' | 'baseUrl' | 'type'>>): ServerConfig;
/**
 * 定义 LEAP 服务器
 */
export declare function defineLeapServer(id: string, baseUrl: string, options?: Partial<Omit<ServerConfig, 'id' | 'baseUrl' | 'type'>>): ServerConfig;
/**
 * 创建 RESTful CRUD API 集合
 */
export declare function createCrudApis<TEntity>(serverId: string, resourceName: string, basePath: string): {
    list: RestfulApiDefinition<void, TEntity[]>;
    get: RestfulApiDefinition<{
        id: string | number;
    }, TEntity>;
    create: RestfulApiDefinition<Partial<TEntity>, TEntity>;
    update: RestfulApiDefinition<{
        id: string | number;
    } & Partial<TEntity>, TEntity>;
    delete: RestfulApiDefinition<{
        id: string | number;
    }, void>;
};
/**
 * 创建 LEAP 方法集合
 */
export declare function createLeapApis<TMethods extends Record<string, {
    params?: unknown;
    response?: unknown;
}>>(serverId: string, methods: {
    [K in keyof TMethods]: {
        method: string;
        description?: string;
    };
}): {
    [K in keyof TMethods]: LeapApiDefinition<TMethods[K]['params'], TMethods[K]['response']>;
};
//# sourceMappingURL=ApiRegistry.d.ts.map