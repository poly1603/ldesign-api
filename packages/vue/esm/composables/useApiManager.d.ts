/**
 * useApiManager 组合函数
 *
 * 提供对 API 管理器的访问
 */
import type { ApiManager, ApiManagerConfig } from '@ldesign/api-core';
/**
 * 提供 API 管理器
 *
 * @example
 * ```typescript
 * // 在根组件中
 * const manager = provideApiManager({
 *   servers: [jsonApi, leapServer],
 *   defaultServerId: 'jsonApi'
 * })
 * ```
 */
export declare function provideApiManager(config?: ApiManagerConfig): ApiManager;
/**
 * 注入 API 管理器
 *
 * @example
 * ```typescript
 * const manager = injectApiManager()
 * const result = await manager.call('getUserInfo', { params: { id: 1 } })
 * ```
 */
export declare function injectApiManager(): ApiManager;
/**
 * 注入 API 配置
 */
export declare function injectApiConfig(): ApiManagerConfig | undefined;
/**
 * 使用 API 管理器
 *
 * 简写方法，等同于 injectApiManager
 */
export declare function useApiManager(): ApiManager;
//# sourceMappingURL=useApiManager.d.ts.map