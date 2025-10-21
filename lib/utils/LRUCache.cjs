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

class LRUNode {
  constructor(key, value, expireTime) {
    this.prev = null;
    this.next = null;
    this.key = key;
    this.value = value;
    this.expireTime = expireTime;
  }
}
class LRUCache {
  constructor(config) {
    this.cache = /* @__PURE__ */ new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      memoryUsage: 0
    };
    this.lastCalculatedSize = 0;
    this.config = {
      cleanupInterval: 5 * 60 * 1e3,
      // 5分钟
      ...config
    };
    this.head = new LRUNode("__head__", null, 0);
    this.tail = new LRUNode("__tail__", null, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    if (this.config?.cleanupInterval > 0) {
      this.startCleanup();
    }
  }
  /**
   * 获取缓存值
   */
  get(key) {
    if (!this.config?.enabled) {
      return null;
    }
    const node = this.cache.get(key);
    if (!node) {
      this.stats.misses++;
      return null;
    }
    if (Date.now() > node.expireTime) {
      this.removeNode(node);
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      return null;
    }
    this.moveToHead(node);
    this.stats.hits++;
    return node.value;
  }
  /**
   * 设置缓存值
   */
  set(key, value, ttl) {
    if (!this.config?.enabled) {
      return;
    }
    const expireTime = Date.now() + (ttl ?? this.config?.defaultTTL);
    const existingNode = this.cache.get(key);
    if (existingNode) {
      existingNode.value = value;
      existingNode.expireTime = expireTime;
      this.moveToHead(existingNode);
    } else {
      const newNode = new LRUNode(key, value, expireTime);
      if (this.cache.size >= this.config?.maxSize) {
        this.evictLRU();
      }
      this.cache.set(key, newNode);
      this.addToHead(newNode);
    }
    this.updateMemoryUsage();
  }
  /**
   * 删除缓存项
   */
  delete(key) {
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }
    this.removeNode(node);
    this.cache.delete(key);
    this.updateMemoryUsage();
    return true;
  }
  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.evictions = 0;
    this.stats.memoryUsage = 0;
  }
  /**
   * 检查是否存在
   */
  has(key) {
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }
    if (Date.now() > node.expireTime) {
      this.removeNode(node);
      this.cache.delete(key);
      this.stats.evictions++;
      return false;
    }
    return true;
  }
  /**
   * 获取所有键
   */
  keys() {
    const keys = [];
    let current = this.head.next;
    while (current && current !== this.tail) {
      if (Date.now() <= current.expireTime) {
        keys.push(current.key);
      }
      current = current.next;
    }
    return keys;
  }
  /**
   * 获取缓存统计信息
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      maxSize: this.config?.maxSize,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      evictions: this.stats.evictions,
      memoryUsage: this.stats.memoryUsage
    };
  }
  /**
   * 批量设置
   */
  setMany(entries) {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }
  /**
   * 批量获取
   */
  getMany(keys) {
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
    entries.forEach(({ key, value, ttl }) => {
      if (!this.cache.has(key)) {
        this.set(key, value, ttl);
      }
    });
  }
  /**
   * 移动节点到头部
   */
  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }
  /**
   * 添加节点到头部
   */
  addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    if (this.head.next) {
      this.head.next.prev = node;
    }
    this.head.next = node;
  }
  /**
   * 移除节点
   */
  removeNode(node) {
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }
  }
  /**
   * 淘汰最少使用的节点
   */
  evictLRU() {
    const lru = this.tail.prev;
    if (lru && lru !== this.head) {
      this.removeNode(lru);
      this.cache.delete(lru.key);
      this.stats.evictions++;
    }
  }
  /**
   * 更新内存使用估算（优化版：增量更新而非全量计算）
   */
  updateMemoryUsage() {
    const shouldRecalculate = this.cache.size === 0 || this.cache.size === 1 || this.cache.size % 50 === 0 || Math.abs(this.cache.size - this.lastCalculatedSize) > 20;
    if (shouldRecalculate) {
      let usage = 0;
      if (this.cache.size > 100) {
        const sampleSize = Math.min(20, this.cache.size);
        const entries = Array.from(this.cache.entries());
        const step = Math.floor(this.cache.size / sampleSize);
        for (let i = 0; i < this.cache.size; i += step) {
          const [key, node] = entries[i];
          usage += (key.length * 2 + this.estimateValueSize(node.value) + 64) * step;
        }
      } else {
        this.cache.forEach((node, key) => {
          usage += key.length * 2;
          usage += this.estimateValueSize(node.value);
          usage += 64;
        });
      }
      this.stats.memoryUsage = usage;
      this.lastCalculatedSize = this.cache.size;
    }
  }
  /**
   * 估算值的内存大小（优化版：使用WeakMap缓存避免重复计算）
   */
  estimateValueSize(value) {
    if (value === null || value === void 0) {
      return 8;
    }
    if (typeof value === "string") {
      return Math.min(value.length * 2, 65536);
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return 8;
    }
    if (value instanceof Date) {
      return 24;
    }
    if (value instanceof RegExp) {
      return 48 + (value.source?.length || 0) * 2;
    }
    if (Array.isArray(value)) {
      const sampleSize = Math.min(10, value.length);
      let size = 24;
      for (let i = 0; i < sampleSize; i++) {
        size += this.estimateValueSize(value[i]);
      }
      if (value.length > sampleSize) {
        size = size / sampleSize * value.length;
      }
      return Math.min(size, 1048576);
    }
    if (typeof value === "object") {
      let size = 24;
      const keys = Object.keys(value);
      const sampleSize = Math.min(10, keys.length);
      for (let i = 0; i < sampleSize; i++) {
        const key = keys[i];
        size += key.length * 2 + 8;
        const val = value[key];
        if (typeof val === "string") {
          size += Math.min(val.length * 2, 1024);
        } else if (typeof val === "number" || typeof val === "boolean") {
          size += 8;
        } else {
          size += 64;
        }
      }
      if (keys.length > sampleSize) {
        size = size / sampleSize * keys.length;
      }
      return Math.min(size, 1048576);
    }
    return 64;
  }
  /**
   * 启动定期清理
   */
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
    }, this.config?.cleanupInterval);
  }
  /**
   * 清理过期项（优化版：直接删除，减少临时数组分配）
   */
  cleanupExpired() {
    const now = Date.now();
    let evictionCount = 0;
    for (const [key, node] of this.cache.entries()) {
      if (now > node.expireTime) {
        this.removeNode(node);
        this.cache.delete(key);
        evictionCount++;
      }
    }
    this.stats.evictions += evictionCount;
    if (evictionCount > 0) {
      this.updateMemoryUsage();
    }
  }
  /**
   * 销毁缓存
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = void 0;
    }
    this.clear();
  }
}

exports.LRUCache = LRUCache;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=LRUCache.cjs.map
