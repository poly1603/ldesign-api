/**
 * 数据转换/序列化工具
 * 提供常用的数据转换、序列化、反序列化功能
 */
/**
 * 转换器函数类型
 */
export type TransformerFn<T = any, R = any> = (data: T) => R;
/**
 * 转换器配置
 */
export interface TransformerConfig {
    /** 转换器名称 */
    name: string;
    /** 转换函数 */
    transform: TransformerFn;
    /** 是否启用 */
    enabled?: boolean;
}
/**
 * 数据转换器
 */
export declare class DataTransformer {
    private transformers;
    /**
     * 注册转换器
     */
    register(config: TransformerConfig): void;
    /**
     * 批量注册
     */
    registerBatch(configs: TransformerConfig[]): void;
    /**
     * 移除转换器
     */
    unregister(name: string): void;
    /**
     * 执行转换
     */
    transform<T = any, R = any>(name: string, data: T): R;
    /**
     * 链式转换（依次应用多个转换器）
     */
    chain<T = any>(data: T, transformerNames: string[]): any;
    /**
     * 启用/禁用转换器
     */
    setEnabled(name: string, enabled: boolean): void;
    /**
     * 获取所有转换器名称
     */
    getTransformerNames(): string[];
    /**
     * 清空所有转换器
     */
    clear(): void;
}
/**
 * 内置转换器
 */
export declare const BuiltinTransformers: {
    /**
     * 驼峰命名转换
     */
    camelCase: {
        name: string;
        transform: (data: any) => any;
    };
    /**
     * 蛇形命名转换
     */
    snakeCase: {
        name: string;
        transform: (data: any) => any;
    };
    /**
     * 移除空值
     */
    removeEmpty: {
        name: string;
        transform: (data: any) => any;
    };
    /**
     * 日期字符串转Date对象
     */
    parseDates: {
        name: string;
        transform: (data: any) => any;
    };
    /**
     * Date对象转日期字符串
     */
    stringifyDates: {
        name: string;
        transform: (data: any) => any;
    };
    /**
     * 深拷贝
     */
    deepClone: {
        name: string;
        transform: (data: any) => any;
    };
    /**
     * 扁平化对象
     */
    flatten: {
        name: string;
        transform: (data: any, prefix?: string) => any;
    };
    /**
     * 数字字符串转数字
     */
    parseNumbers: {
        name: string;
        transform: (data: any) => any;
    };
};
/**
 * 创建数据转换器
 */
export declare function createDataTransformer(withBuiltin?: boolean): DataTransformer;
/**
 * 获取全局转换器
 */
export declare function getGlobalTransformer(): DataTransformer;
/**
 * 设置全局转换器
 */
export declare function setGlobalTransformer(transformer: DataTransformer): void;
/**
 * 便捷函数
 */
export declare function transform<T = any, R = any>(name: string, data: T): R;
export declare function transformChain<T = any>(data: T, transformerNames: string[]): any;
/**
 * 便捷的内置转换函数
 */
export declare const toCamelCase: (data: any) => any;
export declare const toSnakeCase: (data: any) => any;
export declare const removeEmpty: (data: any) => any;
export declare const parseDates: (data: any) => any;
export declare const stringifyDates: (data: any) => any;
export declare const deepClone: (data: any) => any;
export declare const flatten: (data: any) => any;
export declare const parseNumbers: (data: any) => any;
