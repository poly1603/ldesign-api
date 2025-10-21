/**
 * 系统 API 插件
 * 提供常用的系统接口方法，如登录、用户信息、菜单等
 */
import type { ApiMethodConfig, ApiPlugin } from '../types';
/**
 * 系统 API 插件
 */
export declare const systemApiPlugin: ApiPlugin;
/**
 * 创建自定义系统 API 插件
 *
 * @param customMethods 自定义方法配置
 * @param options 插件选项
 * @param options.name 插件名称
 * @param options.version 插件版本
 * @param options.overrideDefaults 是否覆盖默认方法
 * @returns 自定义系统 API 插件
 *
 * @example
 * ```typescript
 * import { createCustomSystemApiPlugin } from '@ldesign/api'
 *
 * const customPlugin = createCustomSystemApiPlugin({
 *   getProfile: {
 *     name: 'getProfile',
 *     config: { method: 'GET', url: '/profile' },
 *   },
 * })
 * ```
 */
export declare function createCustomSystemApiPlugin(customMethods: Record<string, ApiMethodConfig>, options?: {
    name?: string;
    version?: string;
    overrideDefaults?: boolean;
}): ApiPlugin;
