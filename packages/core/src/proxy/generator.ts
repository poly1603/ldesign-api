/**
 * 代理配置生成器
 *
 * 根据服务器配置自动生成开发服务器代理配置
 */

import type { ProxyConfig, ProxyGenerator, ServerConfig } from '../types'

/**
 * 代理配置生成器实现
 */
export class ProxyGeneratorImpl implements ProxyGenerator {
  /**
   * 从单个服务器配置生成代理
   */
  fromServer(server: ServerConfig, pathPrefix: string): ProxyConfig {
    const normalizedPrefix = pathPrefix.startsWith('/')
      ? pathPrefix
      : `/${pathPrefix}`

    return {
      path: normalizedPrefix,
      target: server.baseUrl,
      changeOrigin: true,
      secure: server.baseUrl.startsWith('https'),
      ws: false,
      headers: server.headers,
      rewrite: (path: string) => {
        // 移除代理前缀
        return path.replace(new RegExp(`^${normalizedPrefix}`), '')
      },
    }
  }

  /**
   * 从多个服务器生成代理配置对象
   */
  fromServers(servers: ServerConfig[]): Record<string, ProxyConfig> {
    const proxyConfig: Record<string, ProxyConfig> = {}

    for (const server of servers) {
      // 使用服务器 ID 作为代理路径前缀
      const pathPrefix = `/${server.id}`
      proxyConfig[pathPrefix] = this.fromServer(server, pathPrefix)
    }

    return proxyConfig
  }
}

/**
 * 创建代理配置生成器
 */
export function createProxyGenerator(): ProxyGenerator {
  return new ProxyGeneratorImpl()
}

/**
 * 生成 Vite 代理配置
 *
 * 将 ProxyConfig 转换为 Vite 可用的格式
 */
export function generateViteProxyConfig(
  servers: ServerConfig[]
): Record<string, {
  target: string
  changeOrigin: boolean
  secure?: boolean
  ws?: boolean
  headers?: Record<string, string>
  rewrite?: (path: string) => string
}> {
  const generator = createProxyGenerator()
  const proxyConfigs = generator.fromServers(servers)

  const viteProxy: Record<string, any> = {}

  for (const [path, config] of Object.entries(proxyConfigs)) {
    viteProxy[path] = {
      target: config.target,
      changeOrigin: config.changeOrigin ?? true,
      secure: config.secure,
      ws: config.ws,
      headers: config.headers,
      rewrite: config.rewrite,
    }
  }

  return viteProxy
}

/**
 * 生成 LEAP 系统专用代理配置
 *
 * 针对 LPOM、LROA 等 LEAP 系统生成代理
 */
export function generateLeapProxyConfig(
  servers: ServerConfig[]
): Record<string, any> {
  const viteProxy: Record<string, any> = {}

  for (const server of servers) {
    if (server.type !== 'leap') {
      continue
    }

    const leapConfig = server.leap || {}
    const systemPrefix = leapConfig.systemPrefix || ''

    // LEAP RPC 代理
    const rpcPath = systemPrefix
      ? `${systemPrefix}/LEAP`
      : `/${server.id}/LEAP`

    viteProxy[rpcPath] = {
      target: server.baseUrl,
      changeOrigin: true,
      secure: server.baseUrl.startsWith('https'),
      rewrite: (path: string) => {
        if (systemPrefix) {
          // 如果有系统前缀，不需要重写
          return path
        }
        // 移除服务器 ID 前缀
        return path.replace(new RegExp(`^/${server.id}`), '')
      },
    }
  }

  return viteProxy
}
