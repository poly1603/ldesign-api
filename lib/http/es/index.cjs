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

Object.defineProperty(exports, '__esModule', { value: true });

var factory = require('./factory.cjs');
var index = require('./adapters/index.cjs');
var memory = require('./utils/memory.cjs');
var cancel = require('./utils/cancel.cjs');
var dedupManager = require('./utils/dedup-manager.cjs');
var requestDedup = require('./utils/request-dedup.cjs');
var rateLimit = require('./utils/rate-limit.cjs');
var error = require('./utils/error.cjs');
var monitor = require('./utils/monitor.cjs');
var pool = require('./utils/pool.cjs');
var priority = require('./utils/priority.cjs');
var index$1 = require('./devtools/index.cjs');
var plugin$1 = require('./engine/plugin.cjs');
require('./features/cache.cjs');
require('./features/retry.cjs');
var sse = require('./features/sse.cjs');
var websocket = require('./features/websocket.cjs');
var _debugger = require('./utils/debugger.cjs');
var logger = require('./utils/logger.cjs');
var network = require('./utils/network.cjs');
var smartRetry = require('./utils/smartRetry.cjs');
var trace = require('./utils/trace.cjs');
var transformer = require('./utils/transformer.cjs');
require('vue');

factory.createHttpClient();

exports.createHttpClient = factory.createHttpClient;
exports.default = factory.createHttpClient;
exports.AdapterFactory = index.AdapterFactory;
exports.createAdapter = index.createAdapter;
exports.MemoryMonitor = memory.MemoryMonitor;
exports.createMemoryMonitor = memory.createMemoryMonitor;
exports.CancelManager = cancel.CancelManager;
exports.CancelTokenSource = cancel.CancelTokenSource;
exports.createCancelTokenSource = cancel.createCancelTokenSource;
exports.globalCancelManager = cancel.globalCancelManager;
exports.DeduplicationManager = dedupManager.DeduplicationManager;
exports.RequestDeduplicator = dedupManager.DeduplicationManager;
exports.DeduplicationKeyGenerator = requestDedup.DeduplicationKeyGenerator;
exports.RequestDeduplicationKeyGenerator = requestDedup.DeduplicationKeyGenerator;
exports.RateLimitManager = rateLimit.RateLimitManager;
exports.ErrorHandler = error.ErrorHandler;
Object.defineProperty(exports, "ErrorType", {
	enumerable: true,
	get: function () { return error.ErrorType; }
});
exports.RetryManager = error.RetryManager;
exports.RequestMonitor = monitor.RequestMonitor;
exports.createRequestMonitor = monitor.createRequestMonitor;
exports.RequestPool = pool.RequestPool;
exports.createRequestPool = pool.createRequestPool;
Object.defineProperty(exports, "Priority", {
	enumerable: true,
	get: function () { return priority.Priority; }
});
exports.PriorityQueue = priority.PriorityQueue;
exports.determinePriority = priority.determinePriority;
exports.HttpDevTools = index$1.HttpDevTools;
exports.globalDevTools = index$1.globalDevTools;
exports.createHttpEnginePlugin = plugin$1.createHttpEnginePlugin;
exports.createHttpPlugin = plugin$1.createHttpEnginePlugin;
Object.defineProperty(exports, "SSEStatus", {
	enumerable: true,
	get: function () { return sse.SSEStatus; }
});
Object.defineProperty(exports, "WebSocketStatus", {
	enumerable: true,
	get: function () { return websocket.WebSocketStatus; }
});
Object.defineProperty(exports, "DebugLevel", {
	enumerable: true,
	get: function () { return _debugger.DebugLevel; }
});
Object.defineProperty(exports, "LogLevel", {
	enumerable: true,
	get: function () { return logger.LogLevel; }
});
exports.Logger = logger.Logger;
exports.logger = logger.logger;
Object.defineProperty(exports, "ConnectionType", {
	enumerable: true,
	get: function () { return network.ConnectionType; }
});
exports.NetworkMonitor = network.NetworkMonitor;
Object.defineProperty(exports, "NetworkStatus", {
	enumerable: true,
	get: function () { return network.NetworkStatus; }
});
exports.globalNetworkMonitor = network.globalNetworkMonitor;
Object.defineProperty(exports, "RetryStrategy", {
	enumerable: true,
	get: function () { return smartRetry.RetryStrategy; }
});
exports.SmartRetryManager = smartRetry.SmartRetryManager;
exports.RequestTracer = trace.RequestTracer;
exports.Span = trace.Span;
Object.defineProperty(exports, "SpanStatus", {
	enumerable: true,
	get: function () { return trace.SpanStatus; }
});
Object.defineProperty(exports, "SpanType", {
	enumerable: true,
	get: function () { return trace.SpanType; }
});
exports.Trace = trace.Trace;
exports.DataTransformer = transformer.DataTransformer;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
