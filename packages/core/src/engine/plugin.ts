import type { ApiEnginePluginOptions } from './types'

export const apiStateKeys = {
  MANAGER: 'api:manager' as const,
} as const

export const apiEventKeys = {
  INSTALLED: 'api:installed' as const,
  UNINSTALLED: 'api:uninstalled' as const,
} as const

export function createApiEnginePlugin(options: ApiEnginePluginOptions = {}) {
  return {
    name: 'api',
    version: '1.0.0',
    dependencies: options.dependencies ?? [],
    async install(context: any) {
      const engine = context.engine || context
      engine.events?.emit(apiEventKeys.INSTALLED, { name: 'api' })
      engine.logger?.info('[Api Plugin] installed')
    },
    async uninstall(context: any) {
      const engine = context.engine || context
      engine.events?.emit(apiEventKeys.UNINSTALLED, {})
    },
  }
}
