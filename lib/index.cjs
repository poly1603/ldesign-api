/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var ApiEngine = require('./core/ApiEngine.cjs');
var factory = require('./core/factory.cjs');
var auth = require('./plugins/auth.cjs');
var autoBatch = require('./plugins/autoBatch.cjs');
var cancellation = require('./plugins/cancellation.cjs');
var errorHandling = require('./plugins/errorHandling.cjs');
var graphql = require('./plugins/graphql.cjs');
var logging = require('./plugins/logging.cjs');
var mock = require('./plugins/mock.cjs');
var offlineCache = require('./plugins/offlineCache.cjs');
var performance = require('./plugins/performance.cjs');
var rateLimit = require('./plugins/rateLimit.cjs');
var rest = require('./plugins/rest.cjs');
var smartRetry = require('./plugins/smartRetry.cjs');
var systemApi = require('./plugins/systemApi.cjs');
var index = require('./types/index.cjs');
var typed = require('./types/typed.cjs');
var CacheManager = require('./utils/CacheManager.cjs');
var CacheWarmer = require('./utils/CacheWarmer.cjs');
var DataTransformer = require('./utils/DataTransformer.cjs');
var DebounceManager = require('./utils/DebounceManager.cjs');
var DeduplicationManager = require('./utils/DeduplicationManager.cjs');
var DuplicateDetector = require('./utils/DuplicateDetector.cjs');
var ErrorCodes = require('./utils/ErrorCodes.cjs');
var HealthChecker = require('./utils/HealthChecker.cjs');
var IdGenerator = require('./utils/IdGenerator.cjs');
var LRUCache = require('./utils/LRUCache.cjs');
var object = require('./utils/object.cjs');
var PerformanceMonitor = require('./utils/PerformanceMonitor.cjs');
var RequestAnalytics = require('./utils/RequestAnalytics.cjs');
var RequestCancellation = require('./utils/RequestCancellation.cjs');
var RequestThrottler = require('./utils/RequestThrottler.cjs');
var SmartCacheStrategy = require('./utils/SmartCacheStrategy.cjs');
var version = require('./version.cjs');
var composables = require('./vue/composables.cjs');
var directives = require('./vue/directives.cjs');
var engine = require('./vue/engine.cjs');
var plugin = require('./vue/plugin.cjs');
var utils = require('./vue/utils.cjs');



exports.ApiEngineImpl = ApiEngine.ApiEngineImpl;
exports.createApiEngine = factory.createApiEngine;
exports.createApiEngineByEnv = factory.createApiEngineByEnv;
exports.createApiEngineWithDefaults = factory.createApiEngineWithDefaults;
exports.createApiEngineWithPlugins = factory.createApiEngineWithPlugins;
exports.createDevelopmentApiEngine = factory.createDevelopmentApiEngine;
exports.createProductionApiEngine = factory.createProductionApiEngine;
exports.createSingletonApiEngine = factory.createSingletonApiEngine;
exports.createSystemApiEngine = factory.createSystemApiEngine;
exports.createSystemApiEngineByEnv = factory.createSystemApiEngineByEnv;
exports.createTestApiEngine = factory.createTestApiEngine;
exports.destroySingletonApiEngine = factory.destroySingletonApiEngine;
exports.authMiddlewaresPlugin = auth.authMiddlewaresPlugin;
exports.createAuthMiddlewaresPlugin = auth.createAuthMiddlewaresPlugin;
exports.batchCalls = autoBatch.batchCalls;
exports.createAutoBatchPlugin = autoBatch.createAutoBatchPlugin;
exports.createCancellationPlugin = cancellation.createCancellationPlugin;
exports.getCancellationAPI = cancellation.getCancellationAPI;
exports.ErrorHandlingUtils = errorHandling.ErrorHandlingUtils;
exports.createErrorHandlingPlugin = errorHandling.createErrorHandlingPlugin;
exports.errorHandlingPlugin = errorHandling.errorHandlingPlugin;
exports.withErrorHandling = errorHandling.withErrorHandling;
exports.createGraphqlApiPlugin = graphql.createGraphqlApiPlugin;
exports.gql = graphql.gql;
exports.createLoggingPlugin = logging.createLoggingPlugin;
exports.MockHelpers = mock.MockHelpers;
exports.createMockPlugin = mock.createMockPlugin;
exports.createOfflineCachePlugin = offlineCache.createOfflineCachePlugin;
exports.PerformanceUtils = performance.PerformanceUtils;
exports.createPerformancePlugin = performance.createPerformancePlugin;
exports.performancePlugin = performance.performancePlugin;
exports.withPerformance = performance.withPerformance;
exports.createRateLimitPlugin = rateLimit.createRateLimitPlugin;
exports.createRestApiPlugin = rest.createRestApiPlugin;
exports.createSmartRetryPlugin = smartRetry.createSmartRetryPlugin;
exports.createCustomSystemApiPlugin = systemApi.createCustomSystemApiPlugin;
exports.systemApiPlugin = systemApi.systemApiPlugin;
exports.SYSTEM_API_METHODS = index.SYSTEM_API_METHODS;
exports.withTypedApi = typed.withTypedApi;
exports.CacheManager = CacheManager.CacheManager;
exports.CacheWarmer = CacheWarmer.CacheWarmer;
exports.createCacheWarmer = CacheWarmer.createCacheWarmer;
exports.quickWarmup = CacheWarmer.quickWarmup;
exports.BuiltinTransformers = DataTransformer.BuiltinTransformers;
exports.DataTransformer = DataTransformer.DataTransformer;
exports.createDataTransformer = DataTransformer.createDataTransformer;
exports.deepClone = DataTransformer.deepClone;
exports.flatten = DataTransformer.flatten;
exports.getGlobalTransformer = DataTransformer.getGlobalTransformer;
exports.parseDates = DataTransformer.parseDates;
exports.parseNumbers = DataTransformer.parseNumbers;
exports.removeEmpty = DataTransformer.removeEmpty;
exports.setGlobalTransformer = DataTransformer.setGlobalTransformer;
exports.stringifyDates = DataTransformer.stringifyDates;
exports.toCamelCase = DataTransformer.toCamelCase;
exports.toSnakeCase = DataTransformer.toSnakeCase;
exports.transform = DataTransformer.transform;
exports.transformChain = DataTransformer.transformChain;
exports.DebounceManagerImpl = DebounceManager.DebounceManagerImpl;
exports.createDebounceFunction = DebounceManager.createDebounceFunction;
exports.createKeyedDebounceFunction = DebounceManager.createKeyedDebounceFunction;
exports.debounce = DebounceManager.debounce;
exports.keyedDebounce = DebounceManager.keyedDebounce;
exports.DeduplicationManagerImpl = DeduplicationManager.DeduplicationManagerImpl;
exports.classBasedDeduplicate = DeduplicationManager.classBasedDeduplicate;
exports.createDeduplicatedFunction = DeduplicationManager.createDeduplicatedFunction;
exports.deduplicate = DeduplicationManager.deduplicate;
exports.deduplicateGlobally = DeduplicationManager.deduplicateGlobally;
exports.globalDeduplicationManager = DeduplicationManager.globalDeduplicationManager;
exports.DuplicateDetector = DuplicateDetector.DuplicateDetector;
exports.checkDuplicate = DuplicateDetector.checkDuplicate;
exports.createDuplicateDetector = DuplicateDetector.createDuplicateDetector;
exports.getGlobalDuplicateDetector = DuplicateDetector.getGlobalDuplicateDetector;
exports.setGlobalDuplicateDetector = DuplicateDetector.setGlobalDuplicateDetector;
Object.defineProperty(exports, "ApiErrorCode", {
	enumerable: true,
	get: function () { return ErrorCodes.ApiErrorCode; }
});
exports.ERROR_MESSAGES = ErrorCodes.ERROR_MESSAGES;
exports.ERROR_SUGGESTIONS = ErrorCodes.ERROR_SUGGESTIONS;
exports.getErrorCodeByHttpStatus = ErrorCodes.getErrorCodeByHttpStatus;
exports.getErrorSeverity = ErrorCodes.getErrorSeverity;
exports.isAuthError = ErrorCodes.isAuthError;
exports.isRetryableError = ErrorCodes.isRetryableError;
exports.HealthChecker = HealthChecker.HealthChecker;
exports.createHealthChecker = HealthChecker.createHealthChecker;
exports.IdGenerator = IdGenerator.IdGenerator;
exports.createIdGenerator = IdGenerator.createIdGenerator;
exports.generateBase62Id = IdGenerator.generateBase62Id;
exports.generateHexId = IdGenerator.generateHexId;
exports.generateNumericId = IdGenerator.generateNumericId;
exports.generateShortId = IdGenerator.generateShortId;
exports.generateSnowflakeId = IdGenerator.generateSnowflakeId;
exports.generateTimestampId = IdGenerator.generateTimestampId;
exports.generateUUID = IdGenerator.generateUUID;
exports.getGlobalIdGenerator = IdGenerator.getGlobalIdGenerator;
exports.id = IdGenerator.id;
exports.resetNumericCounter = IdGenerator.resetNumericCounter;
exports.setGlobalIdGenerator = IdGenerator.setGlobalIdGenerator;
exports.LRUCache = LRUCache.LRUCache;
exports.renameKeysDeep = object.renameKeysDeep;
exports.renameKeysShallow = object.renameKeysShallow;
exports.PerformanceMonitor = PerformanceMonitor.PerformanceMonitor;
exports.createPerformanceMonitor = PerformanceMonitor.createPerformanceMonitor;
exports.getGlobalPerformanceMonitor = PerformanceMonitor.getGlobalPerformanceMonitor;
exports.setGlobalPerformanceMonitor = PerformanceMonitor.setGlobalPerformanceMonitor;
exports.RequestAnalytics = RequestAnalytics.RequestAnalytics;
exports.createRequestAnalytics = RequestAnalytics.createRequestAnalytics;
exports.CancellationError = RequestCancellation.CancellationError;
exports.CancellationToken = RequestCancellation.CancellationToken;
exports.RequestCancellationManager = RequestCancellation.RequestCancellationManager;
exports.createRequestCancellationManager = RequestCancellation.createRequestCancellationManager;
exports.globalCancellationManager = RequestCancellation.globalCancellationManager;
exports.isCancellationError = RequestCancellation.isCancellationError;
exports.RequestThrottler = RequestThrottler.RequestThrottler;
exports.createRequestThrottler = RequestThrottler.createRequestThrottler;
Object.defineProperty(exports, "CachePriority", {
	enumerable: true,
	get: function () { return SmartCacheStrategy.CachePriority; }
});
exports.SmartCacheStrategy = SmartCacheStrategy.SmartCacheStrategy;
exports.createSmartCacheStrategy = SmartCacheStrategy.createSmartCacheStrategy;
exports.version = version.version;
exports.useApi = composables.useApi;
exports.useApiCall = composables.useApiCall;
exports.useApiCleanup = composables.useApiCleanup;
exports.useApiPolling = composables.useApiPolling;
exports.useBatchApiCall = composables.useBatchApiCall;
exports.useInfiniteApi = composables.useInfiniteApi;
exports.useMutation = composables.useMutation;
exports.usePaginatedApi = composables.usePaginatedApi;
exports.useSystemApi = composables.useSystemApi;
exports.vIntersect = directives.vIntersect;
exports.apiPlugin = engine.apiPlugin;
exports.createApiEnginePlugin = engine.createApiEnginePlugin;
exports.createApiEnginePluginByEnv = engine.createApiEnginePluginByEnv;
exports.createDevelopmentApiEnginePlugin = engine.createDevelopmentApiEnginePlugin;
exports.createProductionApiEnginePlugin = engine.createProductionApiEnginePlugin;
exports.defaultApiEnginePlugin = engine.defaultApiEnginePlugin;
exports.API_ENGINE_INJECTION_KEY = plugin.API_ENGINE_INJECTION_KEY;
exports.ApiVuePlugin = plugin.ApiVuePlugin;
exports.createApiVuePlugin = plugin.createApiVuePlugin;
exports.getApiEngineFromApp = plugin.getApiEngineFromApp;
exports.installApiVuePlugin = plugin.installApiVuePlugin;
exports.useIntersectionObserver = utils.useIntersectionObserver;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
