/**
 * REST 快速构建插件
 * 统一 CRUD 方法命名与缓存失效策略
 */
import type { ApiEngine, ApiPlugin } from '../types';
export interface RestPluginOptions<_TList = unknown, TItem = unknown, _TCreate = unknown, _TUpdate = Partial<TItem>> {
    /** 资源名（用于方法命名前缀，如 'user' => user.list/get/create/update/remove） */
    resource: string;
    /** 基础路径，如 '/users'，支持 ':id' 或 '{id}' 模板 */
    basePath: string;
    /** id 参数名（默认 'id'） */
    idParam?: string;
    /** 是否注册各方法 */
    methods?: {
        list?: boolean;
        get?: boolean;
        create?: boolean;
        update?: boolean;
        remove?: boolean;
    };
    /** 列表缓存 TTL（毫秒），默认 5 分钟 */
    listCacheTtl?: number;
    /** 是否给列表启用缓存，默认启用 */
    enableListCache?: boolean;
    /** 可选：成功后回调（比如埋点） */
    onSuccess?: (method: string, data: unknown, engine: ApiEngine) => void;
    /** 提供路径模板参数，支持多段占位符（如 /users/:uid/posts/{pid}） */
    pathParams?: (src: Record<string, unknown> | undefined) => Record<string, unknown> | undefined;
    map?: {
        listParams?: (params?: Record<string, unknown>) => Record<string, unknown> | undefined;
        getParams?: (params: Record<string, unknown>) => Record<string, unknown> | undefined;
        createData?: (data?: Record<string, unknown>) => Record<string, unknown> | undefined;
        updateData?: (data: Record<string, unknown>) => Record<string, unknown> | undefined;
        removeData?: (data: Record<string, unknown>) => Record<string, unknown> | undefined;
    };
    transform?: {
        list?: (response: any) => any;
        get?: (response: any) => any;
        create?: (response: any) => any;
        update?: (response: any) => any;
        remove?: (response: any) => any;
    };
    validate?: {
        list?: (data: any) => boolean;
        get?: (data: any) => boolean;
        create?: (data: any) => boolean;
        update?: (data: any) => boolean;
        remove?: (data: any) => boolean;
    };
}
export declare function createRestApiPlugin(options: RestPluginOptions): ApiPlugin;
