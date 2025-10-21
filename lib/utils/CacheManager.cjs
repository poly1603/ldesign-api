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

var LRUCache = require('./LRUCache.cjs');

class MemoryCacheStorage {
  constructor() {
    this.storage = /* @__PURE__ */ new Map();
  }
  get(key) {
    return this.storage.get(key) || null;
  }
  set(key, value) {
    this.storage.set(key, value);
  }
  remove(key) {
    this.storage.delete(key);
  }
  clear() {
    this.storage.clear();
  }
  keys() {
    return Array.from(this.storage.keys());
  }
}
class WebStorageCacheStorage {
  constructor(storage, prefix = "ldesign_api_cache_") {
    this.storage = storage;
    this.prefix = prefix;
  }
  get(key) {
    try {
      return this.storage.getItem(this.prefix + key);
    } catch {
      return null;
    }
  }
  set(key, value) {
    try {
      this.storage.setItem(this.prefix + key, value);
    } catch {
    }
  }
  remove(key) {
    try {
      this.storage.removeItem(this.prefix + key);
    } catch {
    }
  }
  clear() {
    try {
      const keys = this.keys();
      keys.forEach((key) => this.remove(key));
    } catch {
    }
  }
  keys() {
    try {
      const keys = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch {
      return [];
    }
  }
}
class CacheManager {
  constructor(config) {
    this.stats = {
      hits: 0,
      misses: 0,
      totalItems: 0,
      size: 0
    };
    this.cleanupTimer = null;
    this.lastStatsUpdate = 0;
    this.statsUpdateInterval = 1e4;
    this.config = {
      enabled: true,
      ttl: 3e5,
      // 5分钟
      maxSize: 100,
      storage: "memory",
      keyGenerator: (methodName, params) => `${methodName}:${JSON.stringify(params || {})}`,
      prefix: "ldesign_api_cache_",
      ...config
    };
    const prefix = this.config?.prefix || "ldesign_api_cache_";
    switch (this.config?.storage) {
      case "localStorage":
        this.storage = new WebStorageCacheStorage(localStorage, prefix);
        break;
      case "sessionStorage":
        this.storage = new WebStorageCacheStorage(sessionStorage, prefix);
        break;
      case "lru":
        this.lruCache = new LRUCache.LRUCache({
          maxSize: this.config?.maxSize,
          defaultTTL: this.config?.ttl,
          enabled: this.config?.enabled
        });
        this.storage = new MemoryCacheStorage();
        break;
      default:
        this.storage = new MemoryCacheStorage();
    }
    this.startCleanupTimer();
  }
  /**
   * 获取缓存数据
   */
  get(key) {
    if (!this.config?.enabled) {
      return null;
    }
    if (this.lruCache) {
      const result = this.lruCache.get(key);
      if (result !== null) {
        this.stats.hits++;
        return result;
      } else {
        this.stats.misses++;
        return null;
      }
    }
    try {
      const itemStr = this.storage.get(key);
      if (!itemStr) {
        this.stats.misses++;
        return null;
      }
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expireTime) {
        this.storage.remove(key);
        this.stats.misses++;
        this.updateStats();
        return null;
      }
      item.accessCount++;
      item.lastAccessTime = Date.now();
      this.storage.set(key, JSON.stringify(item));
      this.stats.hits++;
      return item.data;
    } catch {
      this.stats.misses++;
      return null;
    }
  }
  /**
   * 设置缓存数据
   */
  set(key, data, ttl) {
    if (!this.config?.enabled) {
      return;
    }
    if (this.lruCache) {
      this.lruCache.set(key, data, ttl);
      return;
    }
    try {
      const now = Date.now();
      const item = {
        data,
        timestamp: now,
        expireTime: now + (ttl || this.config?.ttl),
        accessCount: 1,
        lastAccessTime: now
      };
      this.ensureCacheSize();
      this.storage.set(key, JSON.stringify(item));
      this.updateStats();
    } catch {
    }
  }
  /**
   * 删除缓存数据
   */
  remove(key) {
    this.storage.remove(key);
    this.updateStats();
  }
  /**
   * 清除所有缓存
   */
  clear() {
    this.storage.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.totalItems = 0;
    this.stats.size = 0;
  }
  /**
   * 根据模式清除缓存
   */
  clearByPattern(pattern) {
    const keys = this.storage.keys();
    keys.forEach((key) => {
      if (pattern.test(key)) {
        this.storage.remove(key);
      }
    });
    this.updateStats();
  }
  /**
   * 获取缓存统计信息
   */
  getStats() {
    this.updateStats();
    return {
      ...this.stats,
      hitRate: this.stats.hits + this.stats.misses > 0 ? this.stats.hits / (this.stats.hits + this.stats.misses) : 0
    };
  }
  /**
   * 获取所有缓存键
   */
  keys() {
    return this.storage.keys();
  }
  /**
   * 确保缓存大小不超过限制
   */
  ensureCacheSize() {
    const keys = this.storage.keys();
    if (keys.length >= this.config?.maxSize) {
      const items = [];
      keys.forEach((key) => {
        try {
          const itemStr = this.storage.get(key);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            items.push({ key, item });
          }
        } catch {
        }
      });
      items.sort((a, b) => a.item.lastAccessTime - b.item.lastAccessTime);
      const toRemove = items.slice(0, Math.floor(this.config?.maxSize * 0.1));
      toRemove.forEach(({ key }) => this.storage.remove(key));
    }
  }
  updateStats() {
    const now = Date.now();
    if (now - this.lastStatsUpdate < this.statsUpdateInterval) {
      return;
    }
    this.lastStatsUpdate = now;
    const keys = this.storage.keys();
    this.stats.totalItems = keys.length;
    let totalSize = 0;
    if (keys.length > 100) {
      const sampleSize = 20;
      const step = Math.floor(keys.length / sampleSize);
      for (let i = 0; i < keys.length; i += step) {
        const itemStr = this.storage.get(keys[i]);
        if (itemStr) {
          totalSize += itemStr.length * 2 * step;
        }
      }
    } else {
      keys.forEach((key) => {
        const itemStr = this.storage.get(key);
        if (itemStr) {
          totalSize += itemStr.length * 2;
        }
      });
    }
    this.stats.size = totalSize;
  }
  /**
   * 启动清理定时器
   */
  startCleanupTimer() {
    this.cleanupTimer = globalThis.setInterval(() => {
      this.cleanupExpiredItems();
    }, 5 * 60 * 1e3);
  }
  /**
   * 清理过期缓存项（优化版：批量处理，减少重复调用）
   */
  cleanupExpiredItems() {
    const now = Date.now();
    const keys = this.storage.keys();
    let cleanedCount = 0;
    for (const key of keys) {
      try {
        const itemStr = this.storage.get(key);
        if (itemStr) {
          const item = JSON.parse(itemStr);
          if (now > item.expireTime) {
            this.storage.remove(key);
            cleanedCount++;
          }
        }
      } catch {
        this.storage.remove(key);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
      this.updateStats();
    }
  }
  /**
   * 批量设置缓存
   */
  setMany(entries) {
    if (this.lruCache) {
      this.lruCache.setMany(entries.map((e) => ({ key: e.key, value: e.data, ttl: e.ttl })));
      return;
    }
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }
  /**
   * 批量获取缓存
   */
  getMany(keys) {
    if (this.lruCache) {
      return this.lruCache.getMany(keys);
    }
    const result = /* @__PURE__ */ new Map();
    keys.forEach((key) => {
      const value = this.get(key);
      if (value !== null) {
        result.set(key, value);
      }
    });
    return result;
  }
  /**
   * 预热缓存
   */
  warmup(entries) {
    if (this.lruCache) {
      this.lruCache.warmup(entries.map((e) => ({ key: e.key, value: e.data, ttl: e.ttl })));
      return;
    }
    entries.forEach(({ key, data, ttl }) => {
      if (!this.has(key)) {
        this.set(key, data, ttl);
      }
    });
  }
  /**
   * 检查缓存是否存在
   */
  has(key) {
    if (this.lruCache) {
      return this.lruCache.has(key);
    }
    try {
      const itemStr = this.storage.get(key);
      if (!itemStr) {
        return false;
      }
      const item = JSON.parse(itemStr);
      return Date.now() <= item.expireTime;
    } catch {
      return false;
    }
  }
  /**
   * 获取增强的缓存统计信息
   */
  getEnhancedStats() {
    const baseStats = this.getStats();
    if (this.lruCache) {
      return {
        ...baseStats,
        lruStats: this.lruCache.getStats()
      };
    }
    return baseStats;
  }
  /**
   * 销毁缓存管理器，清理定时器
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    if (this.lruCache) {
      this.lruCache.destroy();
    }
    this.clear();
  }
}

exports.CacheManager = CacheManager;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=CacheManager.cjs.map
