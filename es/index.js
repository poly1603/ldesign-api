/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
export { ApiEngineImpl } from './core/ApiEngine.js';
export { createApiEngine, createApiEngineByEnv, createApiEngineWithDefaults, createApiEngineWithPlugins, createDevelopmentApiEngine, createProductionApiEngine, createSingletonApiEngine, createSystemApiEngine, createSystemApiEngineByEnv, createTestApiEngine, destroySingletonApiEngine } from './core/factory.js';
export { authMiddlewaresPlugin, createAuthMiddlewaresPlugin } from './plugins/auth.js';
export { batchCalls, createAutoBatchPlugin } from './plugins/autoBatch.js';
export { createCancellationPlugin, getCancellationAPI } from './plugins/cancellation.js';
export { ErrorHandlingUtils, createErrorHandlingPlugin, errorHandlingPlugin, withErrorHandling } from './plugins/errorHandling.js';
export { createGraphqlApiPlugin, gql } from './plugins/graphql.js';
export { createLoggingPlugin } from './plugins/logging.js';
export { MockHelpers, createMockPlugin } from './plugins/mock.js';
export { createOfflineCachePlugin } from './plugins/offlineCache.js';
export { PerformanceUtils, createPerformancePlugin, performancePlugin, withPerformance } from './plugins/performance.js';
export { createRateLimitPlugin } from './plugins/rateLimit.js';
export { createRestApiPlugin } from './plugins/rest.js';
export { createSmartRetryPlugin } from './plugins/smartRetry.js';
export { createCustomSystemApiPlugin, systemApiPlugin } from './plugins/systemApi.js';
export { SYSTEM_API_METHODS } from './types/index.js';
export { withTypedApi } from './types/typed.js';
export { CacheManager } from './utils/CacheManager.js';
export { CacheWarmer, createCacheWarmer, quickWarmup } from './utils/CacheWarmer.js';
export { BuiltinTransformers, DataTransformer, createDataTransformer, deepClone, flatten, getGlobalTransformer, parseDates, parseNumbers, removeEmpty, setGlobalTransformer, stringifyDates, toCamelCase, toSnakeCase, transform, transformChain } from './utils/DataTransformer.js';
export { DebounceManagerImpl, createDebounceFunction, createKeyedDebounceFunction, debounce, keyedDebounce } from './utils/DebounceManager.js';
export { DeduplicationManagerImpl, classBasedDeduplicate, createDeduplicatedFunction, deduplicate, deduplicateGlobally, globalDeduplicationManager } from './utils/DeduplicationManager.js';
export { DuplicateDetector, checkDuplicate, createDuplicateDetector, getGlobalDuplicateDetector, setGlobalDuplicateDetector } from './utils/DuplicateDetector.js';
export { ApiErrorCode, ERROR_MESSAGES, ERROR_SUGGESTIONS, getErrorCodeByHttpStatus, getErrorSeverity, isAuthError, isRetryableError } from './utils/ErrorCodes.js';
export { HealthChecker, createHealthChecker } from './utils/HealthChecker.js';
export { IdGenerator, createIdGenerator, generateBase62Id, generateHexId, generateNumericId, generateShortId, generateSnowflakeId, generateTimestampId, generateUUID, getGlobalIdGenerator, id, resetNumericCounter, setGlobalIdGenerator } from './utils/IdGenerator.js';
export { LRUCache } from './utils/LRUCache.js';
export { renameKeysDeep, renameKeysShallow } from './utils/object.js';
export { PerformanceMonitor, createPerformanceMonitor, getGlobalPerformanceMonitor, setGlobalPerformanceMonitor } from './utils/PerformanceMonitor.js';
export { RequestAnalytics, createRequestAnalytics } from './utils/RequestAnalytics.js';
export { CancellationError, CancellationToken, RequestCancellationManager, createRequestCancellationManager, globalCancellationManager, isCancellationError } from './utils/RequestCancellation.js';
export { RequestThrottler, createRequestThrottler } from './utils/RequestThrottler.js';
export { CachePriority, SmartCacheStrategy, createSmartCacheStrategy } from './utils/SmartCacheStrategy.js';
export { version } from './version.js';
export { useApi, useApiCall, useApiCleanup, useApiPolling, useBatchApiCall, useInfiniteApi, useMutation, usePaginatedApi, useSystemApi } from './vue/composables.js';
export { vIntersect } from './vue/directives.js';
export { apiPlugin, createApiEnginePlugin, createApiEnginePluginByEnv, createDevelopmentApiEnginePlugin, createProductionApiEnginePlugin, defaultApiEnginePlugin } from './vue/engine.js';
export { API_ENGINE_INJECTION_KEY, ApiVuePlugin, createApiVuePlugin, getApiEngineFromApp, installApiVuePlugin } from './vue/plugin.js';
export { useIntersectionObserver } from './vue/utils.js';
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
