/**
 * 缓存模块
 *
 * 提供 LRU 缓存、请求缓存和请求去重功能
 *
 * @module @ldesign/api-core/cache
 */

export { LRUCache } from './LRUCache'
export type { LRUCacheOptions, CacheEntry, CacheStats } from './LRUCache'

export { RequestCache } from './RequestCache'
export type { RequestCacheOptions, CachedResponse } from './RequestCache'

export { RequestDeduplicator } from './RequestDeduplicator'
export type { DeduplicatorOptions, PendingRequest } from './RequestDeduplicator'
