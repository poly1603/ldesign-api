/**
 * API 引擎工厂函数
 * 提供创建 API 引擎实例的便捷方法
 */
import type { ApiEngine, ApiEngineConfig } from '../types';
/**
 * 创建 API 引擎实例
 *
 * @param config API 引擎配置
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createApiEngine } from '@ldesign/api'
 *
 * const apiEngine = createApiEngine({
 *   debug: true,
 *   http: {
 *     baseURL: 'https://api.example.com',
 *     timeout: 10000,
 *   },
 *   cache: {
 *     enabled: true,
 *     ttl: 300000, // 5分钟
 *   },
 * })
 * ```
 */
export declare function createApiEngine(config?: ApiEngineConfig): ApiEngine;
/**
 * 创建带有默认配置的 API 引擎
 *
 * @param baseURL API 基础地址
 * @param options 额外配置选项
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createApiEngineWithDefaults } from '@ldesign/api'
 *
 * const apiEngine = createApiEngineWithDefaults('https://api.example.com', {
 *   debug: true,
 *   cache: { ttl: 600000 }, // 10分钟缓存
 * })
 * ```
 */
export declare function createApiEngineWithDefaults(baseURL: string, options?: Omit<ApiEngineConfig, 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>;
}): ApiEngine;
/**
 * 创建开发环境的 API 引擎
 *
 * @param baseURL API 基础地址
 * @param options 额外配置选项
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createDevelopmentApiEngine } from '@ldesign/api'
 *
 * const apiEngine = createDevelopmentApiEngine('http://localhost:3000/api')
 * ```
 */
export declare function createDevelopmentApiEngine(baseURL: string, options?: Omit<ApiEngineConfig, 'debug' | 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>;
}): ApiEngine;
/**
 * 创建生产环境的 API 引擎
 *
 * @param baseURL API 基础地址
 * @param options 额外配置选项
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createProductionApiEngine } from '@ldesign/api'
 *
 * const apiEngine = createProductionApiEngine('https://api.example.com')
 * ```
 */
export declare function createProductionApiEngine(baseURL: string, options?: Omit<ApiEngineConfig, 'debug' | 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>;
}): ApiEngine;
/**
 * 创建测试环境的 API 引擎
 *
 * @param baseURL API 基础地址
 * @param options 额外配置选项
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createTestApiEngine } from '@ldesign/api'
 *
 * const apiEngine = createTestApiEngine('http://test-api.example.com')
 * ```
 */
export declare function createTestApiEngine(baseURL: string, options?: Omit<ApiEngineConfig, 'debug' | 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>;
}): ApiEngine;
/**
 * 根据环境变量创建 API 引擎
 *
 * @param baseURL API 基础地址
 * @param options 额外配置选项
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createApiEngineByEnv } from '@ldesign/api'
 *
 * // 根据 NODE_ENV 或 VITE_MODE 自动选择配置
 * const apiEngine = createApiEngineByEnv(import.meta.env?.VITE_API_BASE_URL)
 * ```
 */
export declare function createApiEngineByEnv(baseURL: string, options?: Omit<ApiEngineConfig, 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>;
}): ApiEngine;
/**
 * 创建带有预设插件的 API 引擎
 *
 * @param config API 引擎配置
 * @param plugins 要预装的插件列表
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createApiEngineWithPlugins, systemApiPlugin } from '@ldesign/api'
 *
 * const apiEngine = await createApiEngineWithPlugins(
 *   { http: { baseURL: 'https://api.example.com' } },
 *   [systemApiPlugin]
 * )
 * ```
 */
export declare function createApiEngineWithPlugins(config: ApiEngineConfig, plugins: Array<import('../types').ApiPlugin>): Promise<ApiEngine>;
/**
 * 创建包含系统 API 插件的引擎（便捷）
 */
export declare function createSystemApiEngine(baseURL: string, options?: Omit<ApiEngineConfig, 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>;
}): Promise<ApiEngine>;
/**
 * 根据环境创建包含系统 API 插件的引擎（便捷）
 */
export declare function createSystemApiEngineByEnv(baseURL: string, options?: Omit<ApiEngineConfig, 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>;
}): Promise<ApiEngine>;
/**
 * 创建单例 API 引擎
 *
 * @param config API 引擎配置
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createSingletonApiEngine } from '@ldesign/api'
 *
 * // 第一次调用创建实例
 * const engine1 = createSingletonApiEngine({ http: { baseURL: 'https://api.example.com' } })
 *
 * // 后续调用返回相同实例
 * const engine2 = createSingletonApiEngine() // 返回 engine1
 * ```
 */
export declare function createSingletonApiEngine(config?: ApiEngineConfig): ApiEngine;
/**
 * 销毁单例 API 引擎
 *
 * @example
 * ```typescript
 * import { destroySingletonApiEngine } from '@ldesign/api'
 *
 * destroySingletonApiEngine()
 * ```
 */
export declare function destroySingletonApiEngine(): void;
