/**
 * 代理配置生成器
 *
 * 根据服务器配置自动生成开发服务器代理配置
 */
import type { ProxyConfig, ProxyGenerator, ServerConfig } from '../types';
/**
 * 代理配置生成器实现
 */
export declare class ProxyGeneratorImpl implements ProxyGenerator {
    /**
     * 从单个服务器配置生成代理
     */
    fromServer(server: ServerConfig, pathPrefix: string): ProxyConfig;
    /**
     * 从多个服务器生成代理配置对象
     */
    fromServers(servers: ServerConfig[]): Record<string, ProxyConfig>;
}
/**
 * 创建代理配置生成器
 */
export declare function createProxyGenerator(): ProxyGenerator;
/**
 * 生成 Vite 代理配置
 *
 * 将 ProxyConfig 转换为 Vite 可用的格式
 */
export declare function generateViteProxyConfig(servers: ServerConfig[]): Record<string, {
    target: string;
    changeOrigin: boolean;
    secure?: boolean;
    ws?: boolean;
    headers?: Record<string, string>;
    rewrite?: (path: string) => string;
}>;
/**
 * 生成 LEAP 系统专用代理配置
 *
 * 针对 LPOM、LROA 等 LEAP 系统生成代理
 */
export declare function generateLeapProxyConfig(servers: ServerConfig[]): Record<string, any>;
//# sourceMappingURL=generator.d.ts.map