/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class DeduplicationManagerImpl {
  constructor() {
    this.deduplicationItems = /* @__PURE__ */ new Map();
    this.cleanupTimer = null;
    this.startCleanupTimer();
  }
  /**
   * 执行去重函数
   */
  async execute(key, fn) {
    const existingItem = this.deduplicationItems.get(key);
    if (existingItem) {
      existingItem.refCount++;
      return existingItem.promise;
    }
    if (this.deduplicationItems.size >= 500) {
      this.cleanupStale();
    }
    const promise = this.createDeduplicatedPromise(key, fn);
    this.deduplicationItems.set(key, {
      promise,
      createdAt: Date.now(),
      refCount: 1
    });
    return promise;
  }
  /**
   * 清除去重缓存
   */
  clear() {
    this.deduplicationItems.clear();
  }
  /**
   * 清除指定键的去重缓存
   */
  clearKey(key) {
    this.deduplicationItems.delete(key);
  }
  /**
   * 获取去重项数量
   */
  size() {
    return this.deduplicationItems.size;
  }
  /**
   * 检查是否存在去重项
   */
  has(key) {
    return this.deduplicationItems.has(key);
  }
  /**
   * 获取所有去重键
   */
  keys() {
    return Array.from(this.deduplicationItems.keys());
  }
  /**
   * 获取去重项信息
   */
  getInfo(key) {
    const item = this.deduplicationItems.get(key);
    if (!item) {
      return null;
    }
    return {
      createdAt: item.createdAt,
      refCount: item.refCount,
      age: Date.now() - item.createdAt
    };
  }
  /**
   * 获取所有去重项信息
   */
  getAllInfo() {
    const result = [];
    this.deduplicationItems.forEach((item, key) => {
      result.push({
        key,
        createdAt: item.createdAt,
        refCount: item.refCount,
        age: Date.now() - item.createdAt
      });
    });
    return result;
  }
  /**
   * 获取统计信息
   */
  getStats() {
    const items = Array.from(this.deduplicationItems.values());
    const now = Date.now();
    const totalItems = items.length;
    const totalRefCount = items.reduce((sum, item) => sum + item.refCount, 0);
    const averageRefCount = totalItems > 0 ? totalRefCount / totalItems : 0;
    const oldestItemAge = items.length > 0 ? Math.max(...items.map((item) => now - item.createdAt)) : 0;
    return {
      totalItems,
      totalRefCount,
      averageRefCount,
      oldestItemAge
    };
  }
  /**
   * 销毁管理器
   */
  destroy() {
    this.clear();
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
  /**
   * 创建去重的 Promise
   */
  createDeduplicatedPromise(key, fn) {
    return fn().then((result) => {
      this.deduplicationItems.delete(key);
      return result;
    }).catch((error) => {
      this.deduplicationItems.delete(key);
      throw error;
    });
  }
  /**
   * 启动清理定时器
   */
  startCleanupTimer() {
    this.cleanupTimer = globalThis.setInterval(() => {
      this.cleanup();
    }, 60 * 1e3);
  }
  /**
   * 清理过期的去重项
   */
  cleanup(maxAge = 5 * 60 * 1e3) {
    const now = Date.now();
    const toDelete = [];
    this.deduplicationItems.forEach((item, key) => {
      if (now - item.createdAt > maxAge) {
        toDelete.push(key);
      }
    });
    toDelete.forEach((key) => {
      this.deduplicationItems.delete(key);
    });
  }
  /**
   * 清理过早的去重项
   */
  cleanupStale() {
    const items = Array.from(this.deduplicationItems.entries());
    items.sort((a, b) => a[1].createdAt - b[1].createdAt);
    const removeCount = Math.ceil(items.length * 0.2);
    for (let i = 0; i < removeCount; i++) {
      this.deduplicationItems.delete(items[i][0]);
    }
  }
}
function createDeduplicatedFunction(fn, keyGenerator) {
  const manager = new DeduplicationManagerImpl();
  const defaultKeyGenerator = (...args) => JSON.stringify(args);
  return ((...args) => {
    const key = keyGenerator ? keyGenerator(...args) : defaultKeyGenerator(...args);
    return manager.execute(key, () => fn(...args));
  });
}
function deduplicate(keyGenerator) {
  return function(target, propertyKey, descriptor) {
    if (!descriptor.value) {
      return descriptor;
    }
    const originalMethod = descriptor.value;
    const manager = new DeduplicationManagerImpl();
    const defaultKeyGenerator = (...args) => `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;
    descriptor.value = function(...args) {
      const key = keyGenerator ? keyGenerator(...args) : defaultKeyGenerator(...args);
      return manager.execute(key, () => originalMethod.apply(this, args));
    };
    return descriptor;
  };
}
function classBasedDeduplicate(keyGenerator) {
  const manager = new DeduplicationManagerImpl();
  return function(target, propertyKey, descriptor) {
    if (!descriptor.value) {
      return descriptor;
    }
    const originalMethod = descriptor.value;
    const defaultKeyGenerator = (...args) => `${propertyKey}:${JSON.stringify(args)}`;
    descriptor.value = function(...args) {
      const key = keyGenerator ? keyGenerator(...args) : defaultKeyGenerator(...args);
      return manager.execute(key, () => originalMethod.apply(this, args));
    };
    return descriptor;
  };
}
const globalDeduplicationManager = new DeduplicationManagerImpl();
function deduplicateGlobally(key, fn) {
  return globalDeduplicationManager.execute(key, fn);
}

export { DeduplicationManagerImpl, classBasedDeduplicate, createDeduplicatedFunction, deduplicate, deduplicateGlobally, globalDeduplicationManager };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=DeduplicationManager.js.map
