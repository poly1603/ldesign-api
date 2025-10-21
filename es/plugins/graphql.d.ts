/**
 * GraphQL 插件
 * - 批量注册 GraphQL 操作（query/mutation）为方法名
 */
import type { ApiMethodConfig, ApiPlugin } from '../types';
export interface GraphQLOperation {
    /** GraphQL 文本 */
    query: string;
    /** query | mutation */
    type?: 'query' | 'mutation';
    /** 可选：对响应结果进行转换 */
    transform?: (response: any) => any;
    /** 可选：数据校验 */
    validate?: (data: any) => boolean;
    /** 方法级缓存配置 */
    cache?: ApiMethodConfig['cache'];
}
export interface GraphQLPluginOptions {
    /** GraphQL 端点地址 */
    endpoint: string;
    /** 统一 headers，支持函数值延迟求值 */
    headers?: Record<string, string | (() => string) | ((vars?: unknown) => string)>;
    /** 批量操作定义：方法名 -> 操作 */
    operations: Record<string, GraphQLOperation>;
    /** 变量映射器（可选） */
    mapVariables?: (variables?: Record<string, unknown>) => Record<string, unknown> | undefined;
}
/** 模板字符串语法糖 */
export declare function gql(chunks: TemplateStringsArray, ...exprs: any[]): string;
export declare function createGraphqlApiPlugin(options: GraphQLPluginOptions): ApiPlugin;
