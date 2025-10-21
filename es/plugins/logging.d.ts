/**
 * 日志与性能插件
 * - 请求前后打印日志（debug 环境）
 * - 计算耗时
 * - 可注入 X-Request-Id
 */
import type { ApiPlugin } from '../types';
export interface LoggingPluginOptions {
    enabled?: boolean;
    requestIdHeader?: string;
    requestIdFactory?: () => string;
    logLevel?: 'info' | 'debug' | 'warn' | 'error';
    /** 是否包含时间戳 */
    includeTimestamp?: boolean;
    /** 是否包含请求数据 */
    includeRequestData?: boolean;
    /** 是否包含响应数据 */
    includeResponseData?: boolean;
}
export declare function createLoggingPlugin(options?: LoggingPluginOptions): ApiPlugin;
