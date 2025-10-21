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

class DebounceManagerImpl {
  constructor() {
    this.debounceItems = /* @__PURE__ */ new Map();
    this.maxItems = 1e3;
    this.cleanupTimer = null;
    this.startAutoCleanup();
  }
  /**
   * 执行防抖函数
   */
  async execute(key, fn, delay) {
    if (this.debounceItems.size >= this.maxItems) {
      this.cleanupOldest();
    }
    return new Promise((resolve, reject) => {
      this.cancel(key);
      const timerId = globalThis.setTimeout(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.debounceItems.delete(key);
        }
      }, delay);
      this.debounceItems.set(key, {
        timerId,
        resolve,
        reject,
        fn,
        createdAt: Date.now()
      });
    });
  }
  /**
   * 取消防抖
   */
  cancel(key) {
    const item = this.debounceItems.get(key);
    if (item) {
      clearTimeout(item.timerId);
      this.debounceItems.delete(key);
    }
  }
  /**
   * 清除所有防抖
   */
  clear() {
    this.debounceItems.forEach((item) => {
      clearTimeout(item.timerId);
    });
    this.debounceItems.clear();
  }
  /**
   * 获取防抖项数量
   */
  size() {
    return this.debounceItems.size;
  }
  /**
   * 检查是否存在防抖项
   */
  has(key) {
    return this.debounceItems.has(key);
  }
  /**
   * 获取所有防抖键
   */
  keys() {
    return Array.from(this.debounceItems.keys());
  }
  /**
   * 立即执行防抖函数（跳过延迟）
   */
  async flush(key) {
    const item = this.debounceItems.get(key);
    if (!item) {
      return void 0;
    }
    clearTimeout(item.timerId);
    try {
      const result = await item.fn();
      item.resolve(result);
      return result;
    } catch (error) {
      item.reject(error);
      throw error;
    } finally {
      this.debounceItems.delete(key);
    }
  }
  /**
   * 立即执行所有防抖函数
   */
  async flushAll() {
    const promises = Array.from(this.debounceItems.keys()).map((key) => this.flush(key).catch(() => {
    }));
    await Promise.all(promises);
  }
  /**
   * 获取防抖项信息
   */
  getInfo(key) {
    const item = this.debounceItems.get(key);
    if (!item) {
      return null;
    }
    return {
      createdAt: item.createdAt,
      delay: Date.now() - item.createdAt
    };
  }
  /**
   * 获取所有防抖项信息
   */
  getAllInfo() {
    const result = [];
    this.debounceItems.forEach((item, key) => {
      result.push({
        key,
        createdAt: item.createdAt,
        delay: Date.now() - item.createdAt
      });
    });
    return result;
  }
  /**
   * 清理过期的防抖项（超过指定时间未执行）
   */
  cleanup(maxAge = 6e4) {
    const now = Date.now();
    const toDelete = [];
    this.debounceItems.forEach((item, key) => {
      if (now - item.createdAt > maxAge) {
        clearTimeout(item.timerId);
        item.reject(new Error("Debounce timeout"));
        toDelete.push(key);
      }
    });
    toDelete.forEach((key) => {
      this.debounceItems.delete(key);
    });
  }
  /**
   * 清理最早的防抖项
   */
  cleanupOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();
    for (const [key, item] of this.debounceItems) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      this.cancel(oldestKey);
    }
  }
  /**
   * 启动自动清理
   */
  startAutoCleanup() {
    this.cleanupTimer = globalThis.setInterval(() => {
      this.cleanup();
    }, 6e4);
  }
  /**
   * 销毁管理器
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}
function createDebounceFunction(fn, delay, key) {
  const manager = new DebounceManagerImpl();
  const debounceKey = key || "default";
  return ((...args) => {
    return manager.execute(debounceKey, () => fn(...args), delay);
  });
}
function createKeyedDebounceFunction(fn, delay, keyGenerator) {
  const manager = new DebounceManagerImpl();
  return ((...args) => {
    const key = keyGenerator(...args);
    return manager.execute(key, () => fn(...args), delay);
  });
}
function debounce(delay, key) {
  return function(target, propertyKey, descriptor) {
    if (!descriptor.value) {
      return descriptor;
    }
    const originalMethod = descriptor.value;
    const manager = new DebounceManagerImpl();
    descriptor.value = function(...args) {
      const debounceKey = key || `${target.constructor.name}.${propertyKey}`;
      return manager.execute(debounceKey, () => originalMethod.apply(this, args), delay);
    };
    return descriptor;
  };
}
function keyedDebounce(delay, keyGenerator) {
  return function(target, propertyKey, descriptor) {
    if (!descriptor.value) {
      return descriptor;
    }
    const originalMethod = descriptor.value;
    const manager = new DebounceManagerImpl();
    descriptor.value = function(...args) {
      const key = keyGenerator(...args);
      return manager.execute(key, () => originalMethod.apply(this, args), delay);
    };
    return descriptor;
  };
}

exports.DebounceManagerImpl = DebounceManagerImpl;
exports.createDebounceFunction = createDebounceFunction;
exports.createKeyedDebounceFunction = createKeyedDebounceFunction;
exports.debounce = debounce;
exports.keyedDebounce = keyedDebounce;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=DebounceManager.cjs.map
