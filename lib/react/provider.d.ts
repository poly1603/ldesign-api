import type { ApiEngine, ApiEngineConfig } from '../types';
import { type ReactNode } from 'react';
/**
 * React 顶层 Provider
 * - 提供 ApiEngine 实例或通过 config 创建
 * - SSR 友好：不在构造阶段访问浏览器专有对象
 */
export declare const ApiEngineContext: any;
export interface ApiProviderProps {
    engine?: ApiEngine;
    config?: ApiEngineConfig;
    children?: ReactNode;
}
export declare function ApiProvider({ engine, config, children }: ApiProviderProps): JSX.Element;
/** 获取 ApiEngine 实例 */
export declare function useApi(): ApiEngine;
