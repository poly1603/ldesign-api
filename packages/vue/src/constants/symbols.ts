/**
 * Vue 注入键 (Injection Keys)
 * 用于 provide/inject
 */

import type { InjectionKey } from 'vue'
import type { ApiManager, ApiManagerConfig } from '@ldesign/api-core'

/**
 * API 管理器注入键
 */
export const API_MANAGER_KEY: InjectionKey<ApiManager> = Symbol('api-manager')

/**
 * API 配置注入键
 */
export const API_CONFIG_KEY: InjectionKey<ApiManagerConfig> = Symbol('api-config')
