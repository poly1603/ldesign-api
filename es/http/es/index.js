/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { createHttpClient as r } from './factory.js';
export { AdapterFactory, createAdapter } from './adapters/index.js';
export { MemoryMonitor, createMemoryMonitor } from './utils/memory.js';
export { CancelManager, CancelTokenSource, createCancelTokenSource, globalCancelManager } from './utils/cancel.js';
export { DeduplicationManager, DeduplicationManager as RequestDeduplicator } from './utils/dedup-manager.js';
export { DeduplicationKeyGenerator, DeduplicationKeyGenerator as RequestDeduplicationKeyGenerator } from './utils/request-dedup.js';
export { RateLimitManager } from './utils/rate-limit.js';
export { ErrorHandler, ErrorType, RetryManager } from './utils/error.js';
export { RequestMonitor, createRequestMonitor } from './utils/monitor.js';
export { RequestPool, createRequestPool } from './utils/pool.js';
export { Priority, PriorityQueue, determinePriority } from './utils/priority.js';
export { HttpDevTools, globalDevTools } from './devtools/index.js';
export { createHttpEnginePlugin, createHttpEnginePlugin as createHttpPlugin } from './engine/plugin.js';
import './features/cache.js';
import './features/retry.js';
export { SSEStatus } from './features/sse.js';
export { WebSocketStatus } from './features/websocket.js';
export { DebugLevel } from './utils/debugger.js';
export { LogLevel, Logger, logger } from './utils/logger.js';
export { ConnectionType, NetworkMonitor, NetworkStatus, globalNetworkMonitor } from './utils/network.js';
export { RetryStrategy, SmartRetryManager } from './utils/smartRetry.js';
export { RequestTracer, Span, SpanStatus, SpanType, Trace } from './utils/trace.js';
export { DataTransformer } from './utils/transformer.js';
import 'vue';

r();

export { r as createHttpClient, r as default };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
