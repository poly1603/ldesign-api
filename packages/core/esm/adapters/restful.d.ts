/**
 * RESTful API 适配器
 *
 * 处理标准 RESTful 风格的 HTTP 请求
 */
import type { HttpClient } from '@ldesign/http-core';
import type { ApiAdapter, ApiResult, RestfulRequestOptions, ServerConfig, UnifiedApiDefinition } from '../types';
/**
 * RESTful 适配器实现
 */
export declare class RestfulAdapter implements ApiAdapter {
    readonly type: "restful";
    execute<TResponse = unknown>(api: UnifiedApiDefinition, options: RestfulRequestOptions, httpClient: HttpClient, serverConfig: ServerConfig): Promise<ApiResult<TResponse>>;
    /**
     * 构建请求 URL
     */
    private buildUrl;
}
/**
 * 创建 RESTful 适配器
 */
export declare function createRestfulAdapter(): RestfulAdapter;
//# sourceMappingURL=restful.d.ts.map