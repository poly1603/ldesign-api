/**
 * Mock数据插件
 * 用于开发和测试环境模拟API响应
 */
import type { ApiPlugin } from '../types';
/**
 * Mock响应配置
 */
export interface MockResponse {
    /** 响应数据 */
    data?: any;
    /** HTTP状态码 */
    status?: number;
    /** 响应头 */
    headers?: Record<string, string>;
    /** 延迟时间（毫秒） */
    delay?: number;
    /** 错误配置 */
    error?: {
        message: string;
        code?: string;
        status?: number;
    };
}
/**
 * Mock规则
 */
export interface MockRule {
    /** 匹配模式：方法名、URL正则、或自定义函数 */
    match: string | RegExp | ((methodName: string, url: string) => boolean);
    /** Mock响应（可以是函数动态生成） */
    response: MockResponse | ((params: any, config: any) => MockResponse | Promise<MockResponse>);
    /** 是否启用 */
    enabled?: boolean;
}
/**
 * Mock插件配置
 */
export interface MockPluginOptions {
    /** 是否启用Mock */
    enabled?: boolean;
    /** Mock规则列表 */
    rules?: MockRule[];
    /** 默认延迟（毫秒） */
    defaultDelay?: number;
    /** 是否打印Mock日志 */
    logging?: boolean;
    /** 全局Mock开关（用于快速禁用所有Mock） */
    globalSwitch?: boolean;
}
/**
 * 创建Mock插件
 */
export declare function createMockPlugin(options?: MockPluginOptions): ApiPlugin;
/**
 * Mock数据生成辅助函数
 */
export declare const MockHelpers: {
    /**
     * 生成分页数据
     */
    paginate<T>(data: T[], page?: number, pageSize?: number): {
        data: T[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
    /**
     * 生成随机数
     */
    random(min?: number, max?: number): number;
    /**
     * 生成随机布尔值
     */
    randomBool(): boolean;
    /**
     * 从数组中随机选择
     */
    randomPick<T>(arr: T[]): T;
    /**
     * 生成随机字符串
     */
    randomString(length?: number): string;
    /**
     * 生成随机日期
     */
    randomDate(start?: Date, end?: Date): string;
    /**
     * 模拟加载延迟
     */
    delay(ms: number): Promise<void>;
};
