/**
 * 懒加载工厂函数
 * 减少初始内存占用，按需加载功能
 */

import type { ApiEngineConfig, ApiEngine } from '../types'

/**
 * 创建懒加载的 API 引擎
 * 延迟初始化插件和功能，减少启动时的内存占用
 */
export async function createLazyApiEngine(config?: ApiEngineConfig): Promise<ApiEngine> {
  // 动态导入核心模块
  const { ApiEngineImpl } = await import('./ApiEngine')

  // 创建引擎实例
  const engine = new ApiEngineImpl({
    ...config,
    // 禁用自动加载插件
    autoLoadPlugins: false,
  })

  return engine
}

/**
 * 创建带系统插件的懒加载 API 引擎
 */
export async function createLazySystemApiEngine(config?: ApiEngineConfig): Promise<ApiEngine> {
  const engine = await createLazyApiEngine(config)

  // 按需加载系统 API 插件
  const { systemApiPlugin } = await import('../plugins/systemApi')
  await engine.use(systemApiPlugin)

  return engine
}

/**
 * 懒加载插件映射
 */
const PLUGIN_LOADERS = {
  auth: () => import('../plugins/auth').then(m => m.authMiddlewaresPlugin),
  cache: () => import('../plugins/offlineCache').then(m => m.createOfflineCachePlugin()),
  performance: () => import('../plugins/performance').then(m => m.performancePlugin),
  logging: () => import('../plugins/logging').then(m => m.createLoggingPlugin()),
  retry: () => import('../plugins/smartRetry').then(m => m.createSmartRetryPlugin()),
  rateLimit: () => import('../plugins/rateLimit').then(m => m.createRateLimitPlugin()),
  mock: () => import('../plugins/mock').then(m => m.createMockPlugin()),
  graphql: () => import('../plugins/graphql').then(m => m.createGraphqlApiPlugin()),
  rest: () => import('../plugins/rest').then(m => m.createRestApiPlugin()),
  errorHandling: () => import('../plugins/errorHandling').then(m => m.errorHandlingPlugin),
  autoBatch: () => import('../plugins/autoBatch').then(m => m.createAutoBatchPlugin()),
  cancellation: () => import('../plugins/cancellation').then(m => m.createCancellationPlugin()),
} as const

/**
 * 按需加载插件
 */
export async function loadPlugin(engine: ApiEngine, pluginName: keyof typeof PLUGIN_LOADERS): Promise<void> {
  const loader = PLUGIN_LOADERS[pluginName]
  if (!loader) {
    throw new Error(`Unknown plugin: ${pluginName}`)
  }

  const plugin = await loader()
  await engine.use(plugin)
}

/**
 * 批量加载插件
 */
export async function loadPlugins(
  engine: ApiEngine,
  pluginNames: Array<keyof typeof PLUGIN_LOADERS>
): Promise<void> {
  const promises = pluginNames.map(name => loadPlugin(engine, name))
  await Promise.all(promises)
}

/**
 * 创建最小化的 API 引擎（仅核心功能）
 */
export async function createMinimalApiEngine(config?: ApiEngineConfig): Promise<ApiEngine> {
  const { ApiEngineImpl } = await import('./ApiEngine')

  return new ApiEngineImpl({
    ...config,
    // 禁用所有可选功能
    cache: { enabled: false },
    debounce: { enabled: false },
    deduplication: { enabled: false },
    queue: { enabled: false },
  })
}

/**
 * 预加载适配器（可选）
 */
export async function preloadAdapters(): Promise<void> {
  // 预加载常用的 HTTP 适配器
  await import('@ldesign/http').then(m => m.preloadAdapters?.())
}

