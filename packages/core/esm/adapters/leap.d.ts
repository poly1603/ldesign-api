/**
 * LEAP API 适配器
 *
 * 处理 LEAP RPC 风格的请求，兼容老系统接口
 * 支持 LPOM、LROA 等系统前缀
 */
import type { HttpClient } from '@ldesign/http-core';
import type { ApiAdapter, ApiResult, LeapRequestOptions, ServerConfig, UnifiedApiDefinition } from '../types';
/**
 * LEAP 适配器实现
 */
export declare class LeapAdapter implements ApiAdapter {
    readonly type: "leap";
    execute<TResponse = unknown>(api: UnifiedApiDefinition, options: LeapRequestOptions, httpClient: HttpClient, serverConfig: ServerConfig): Promise<ApiResult<TResponse>>;
    /**
     * 构建 LEAP 请求 URL
     */
    private buildUrl;
    /**
     * 构建 LEAP 请求体
     */
    private buildRequestBody;
    /**
     * 解析 LEAP 响应
     */
    private parseResponse;
}
/**
 * 创建 LEAP 适配器
 */
export declare function createLeapAdapter(): LeapAdapter;
//# sourceMappingURL=leap.d.ts.map