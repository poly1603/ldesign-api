/**
 * ID生成器工具
 * 提供多种ID生成策略：UUID、nanoid、递增、时间戳等
 */
/**
 * 生成UUID v4
 */
export declare function generateUUID(): string;
/**
 * 生成短ID（类似nanoid）
 */
export declare function generateShortId(length?: number): string;
export declare function generateNumericId(): string;
/**
 * 重置数字计数器
 */
export declare function resetNumericCounter(start?: number): void;
/**
 * 生成时间戳ID
 */
export declare function generateTimestampId(): string;
export declare function generateSnowflakeId(): string;
/**
 * 生成十六进制ID
 */
export declare function generateHexId(length?: number): string;
/**
 * 生成Base62 ID
 */
export declare function generateBase62Id(length?: number): string;
/**
 * ID生成策略类型
 */
export type IdGeneratorStrategy = 'uuid' | 'short' | 'numeric' | 'timestamp' | 'snowflake' | 'hex' | 'base62' | ((() => string));
/**
 * ID生成器配置
 */
export interface IdGeneratorConfig {
    strategy?: IdGeneratorStrategy;
    length?: number;
    prefix?: string;
    suffix?: string;
}
/**
 * ID生成器类
 */
export declare class IdGenerator {
    private strategy;
    private length;
    private prefix;
    private suffix;
    constructor(config?: IdGeneratorConfig);
    /**
     * 生成ID
     */
    generate(): string;
    /**
     * 批量生成ID
     */
    generateBatch(count: number): string[];
    /**
     * 更新配置
     */
    updateConfig(config: Partial<IdGeneratorConfig>): void;
}
/**
 * 创建ID生成器
 */
export declare function createIdGenerator(config?: IdGeneratorConfig): IdGenerator;
/**
 * 获取全局ID生成器
 */
export declare function getGlobalIdGenerator(): IdGenerator;
/**
 * 设置全局ID生成器
 */
export declare function setGlobalIdGenerator(generator: IdGenerator): void;
/**
 * 便捷函数：生成ID
 */
export declare function id(strategy?: IdGeneratorStrategy, length?: number): string;
