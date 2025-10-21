/**
 * 自动批处理插件
 * 自动将多个请求合并为一个批量请求
 */
import type { ApiPlugin } from '../types';
export interface AutoBatchConfig {
    /** 是否启用 */
    enabled?: boolean;
    /** 批处理端点 */
    batchEndpoint: string;
    /** 最大批处理大小 */
    maxBatchSize?: number;
    /** 批处理间隔（毫秒） */
    batchInterval?: number;
    /** 可批处理的方法名称（正则或字符串数组） */
    batchableMethods?: Array<string | RegExp>;
    /** 请求转换函数 */
    transformRequest?: (calls: BatchCall[]) => any;
    /** 响应转换函数 */
    transformResponse?: (response: any) => any[];
}
interface BatchCall {
    methodName: string;
    params: any;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}
/**
 * 创建自动批处理插件
 */
export declare function createAutoBatchPlugin(config: AutoBatchConfig): ApiPlugin;
/**
 * 批处理辅助函数
 * 用于手动批处理多个请求
 */
export declare function batchCalls<T = any>(engine: any, calls: Array<{
    methodName: string;
    params?: any;
}>, batchEndpoint: string): Promise<T[]>;
export {};
