/**
 * 认证中间件插件
 */
import type { ApiEngine, ApiPlugin } from '../types';
export interface AuthMiddlewaresOptions {
    getAccessToken?: () => string | null | undefined;
    setAccessToken?: (token: string | null | undefined) => void;
    getRefreshToken?: () => string | null | undefined;
    setRefreshToken?: (token: string | null | undefined) => void;
    headerName?: string;
    scheme?: string;
    isUnauthorized?: (error: unknown) => boolean;
    refresh?: (engine: ApiEngine) => Promise<void>;
}
export declare function createAuthMiddlewaresPlugin(options?: AuthMiddlewaresOptions): ApiPlugin;
export declare const authMiddlewaresPlugin: ApiPlugin;
