/**
 * 离线缓存插件（持久化）
 * - 成功响应写入持久化存储（IndexedDB 优先，降级到 localStorage）
 * - 请求报错时（或离线）尝试返回持久化的旧数据，实现降级
 */
import type { ApiPlugin } from '../types';
export interface OfflineCachePluginOptions {
    /** 启用与否（默认启用） */
    enabled?: boolean;
    /** 生成缓存键（默认 methodName + JSON.stringify(params)） */
    keyGenerator?: (methodName: string, params?: unknown) => string;
    /** 缓存过期时间（毫秒，默认 10 分钟），<=0 表示不过期 */
    ttl?: number;
    /** 仅在这些方法上启用（缺省表示全部方法） */
    include?: string[];
    /** 在这些方法上禁用 */
    exclude?: string[];
    /** 仅当网络错误时才读取离线缓存（默认 true） */
    onlyOnNetworkError?: boolean;
}
export declare function createOfflineCachePlugin(options?: OfflineCachePluginOptions): ApiPlugin;
