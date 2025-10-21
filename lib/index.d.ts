/**
 * @ldesign/api - 通用系统接口管理包
 * 统一导出核心工厂、类型、系统插件与 Vue 集成能力
 */
export { ApiEngineImpl } from './core/ApiEngine';
export { createApiEngine, createApiEngineByEnv, createApiEngineWithDefaults, createApiEngineWithPlugins, createDevelopmentApiEngine, createProductionApiEngine, createSingletonApiEngine, createSystemApiEngine, createSystemApiEngineByEnv, createTestApiEngine, destroySingletonApiEngine, } from './core/factory';
export { authMiddlewaresPlugin, createAuthMiddlewaresPlugin } from './plugins/auth';
export { batchCalls, createAutoBatchPlugin } from './plugins/autoBatch';
export type { AutoBatchConfig } from './plugins/autoBatch';
export { createCancellationPlugin, getCancellationAPI } from './plugins/cancellation';
export type { CancellationPluginAPI, CancellationPluginOptions } from './plugins/cancellation';
export { createErrorHandlingPlugin, errorHandlingPlugin, ErrorHandlingUtils, withErrorHandling, } from './plugins/errorHandling';
export { createGraphqlApiPlugin, gql } from './plugins/graphql';
export { createLoggingPlugin } from './plugins/logging';
export type { LoggingPluginOptions } from './plugins/logging';
export { createMockPlugin, MockHelpers } from './plugins/mock';
export type { MockPluginOptions, MockResponse, MockRule } from './plugins/mock';
export { createOfflineCachePlugin } from './plugins/offlineCache';
export { createPerformancePlugin, performancePlugin, PerformanceUtils, withPerformance, } from './plugins/performance';
export { createRateLimitPlugin } from './plugins/rateLimit';
export { createRestApiPlugin } from './plugins/rest';
export { createSmartRetryPlugin } from './plugins/smartRetry';
export type { SmartRetryOptions } from './plugins/smartRetry';
export { createCustomSystemApiPlugin, systemApiPlugin, } from './plugins/systemApi';
export type { ApiCallOptions, ApiEngine, ApiEngineConfig, ApiMethodConfig, ApiPlugin, CacheConfig, CacheItem, CacheStats, CaptchaInfo, DebounceConfig, DebounceManager, DeduplicationConfig, DeduplicationManager, LoginParams, LoginResult, MenuItem, SystemApiMethodName, UserInfo, } from './types';
export { SYSTEM_API_METHODS } from './types';
export type { TypedApiEngine } from './types/typed';
export { withTypedApi } from './types/typed';
export { CacheManager } from './utils/CacheManager';
export { CacheWarmer, createCacheWarmer, quickWarmup, } from './utils/CacheWarmer';
export type { CacheWarmerConfig, WarmupResult, WarmupStats, WarmupTask, } from './utils/CacheWarmer';
export { BuiltinTransformers, createDataTransformer, DataTransformer, deepClone, flatten, getGlobalTransformer, parseDates, parseNumbers, removeEmpty, setGlobalTransformer, stringifyDates, toCamelCase, toSnakeCase, transform, transformChain, } from './utils/DataTransformer';
export type { TransformerConfig, TransformerFn, } from './utils/DataTransformer';
export { DebounceManagerImpl } from './utils/DebounceManager';
export { createDebounceFunction, createKeyedDebounceFunction, debounce, keyedDebounce, } from './utils/DebounceManager';
export { DeduplicationManagerImpl } from './utils/DeduplicationManager';
export { classBasedDeduplicate, createDeduplicatedFunction, deduplicate, deduplicateGlobally, globalDeduplicationManager, } from './utils/DeduplicationManager';
/**
 * @ldesign/api 主入口文件
 * 导出所有公共 API
 */
export { checkDuplicate, createDuplicateDetector, DuplicateDetector, getGlobalDuplicateDetector, setGlobalDuplicateDetector, } from './utils/DuplicateDetector';
export type { DuplicateDetectorConfig, DuplicateStats, } from './utils/DuplicateDetector';
export { ApiErrorCode, ERROR_MESSAGES, ERROR_SUGGESTIONS, getErrorCodeByHttpStatus, getErrorSeverity, isAuthError, isRetryableError, } from './utils/ErrorCodes';
export { createHealthChecker, HealthChecker, } from './utils/HealthChecker';
export type { HealthCheckConfig, HealthMetrics, HealthStatus, } from './utils/HealthChecker';
export { createIdGenerator, generateBase62Id, generateHexId, generateNumericId, generateShortId, generateSnowflakeId, generateTimestampId, generateUUID, getGlobalIdGenerator, id, IdGenerator, resetNumericCounter, setGlobalIdGenerator, } from './utils/IdGenerator';
export type { IdGeneratorConfig, IdGeneratorStrategy } from './utils/IdGenerator';
export { LRUCache } from './utils/LRUCache';
export type { LRUCacheConfig, LRUCacheStats } from './utils/LRUCache';
export { renameKeysDeep, renameKeysShallow } from './utils/object';
export { createPerformanceMonitor, getGlobalPerformanceMonitor, PerformanceMonitor, setGlobalPerformanceMonitor } from './utils/PerformanceMonitor';
export { createRequestAnalytics, RequestAnalytics, } from './utils/RequestAnalytics';
export type { MethodStats, RequestAnalyticsConfig, RequestRecord, } from './utils/RequestAnalytics';
export { CancellationError, CancellationToken, createRequestCancellationManager, globalCancellationManager, isCancellationError, RequestCancellationManager, } from './utils/RequestCancellation';
export { createRequestThrottler, RequestThrottler, } from './utils/RequestThrottler';
export type { ThrottlerConfig, ThrottlerStats, } from './utils/RequestThrottler';
export { CachePriority, createSmartCacheStrategy, SmartCacheStrategy, } from './utils/SmartCacheStrategy';
export type { SmartCacheStrategyConfig } from './utils/SmartCacheStrategy';
/**
 * 版本信息
 */
export { version } from './version';
export { useApi, useApiCall, useApiCleanup, useApiPolling, useBatchApiCall, useInfiniteApi, useMutation, usePaginatedApi, useSystemApi, } from './vue/composables';
export type { ApiCallState, UseApiCallOptions } from './vue/composables';
export { vIntersect } from './vue/directives';
export { apiPlugin, createApiEnginePlugin, createApiEnginePluginByEnv, createDevelopmentApiEnginePlugin, createProductionApiEnginePlugin, defaultApiEnginePlugin, } from './vue/engine';
export type { ApiEnginePluginOptions } from './vue/engine';
export { API_ENGINE_INJECTION_KEY, ApiVuePlugin, createApiVuePlugin, getApiEngineFromApp, installApiVuePlugin, } from './vue/plugin';
export type { ApiVuePluginOptions } from './vue/plugin';
export { useIntersectionObserver } from './vue/utils';
