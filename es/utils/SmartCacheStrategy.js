/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
var CachePriority;
(function(CachePriority2) {
  CachePriority2[CachePriority2["LOW"] = 1] = "LOW";
  CachePriority2[CachePriority2["NORMAL"] = 2] = "NORMAL";
  CachePriority2[CachePriority2["HIGH"] = 3] = "HIGH";
  CachePriority2[CachePriority2["CRITICAL"] = 4] = "CRITICAL";
})(CachePriority || (CachePriority = {}));
class SmartCacheStrategy {
  constructor(config = {}) {
    this.accessStats = /* @__PURE__ */ new Map();
    this.priorityMap = /* @__PURE__ */ new Map();
    this.config = {
      enabled: true,
      minAccessThreshold: 3,
      hotDataTTLMultiplier: 2,
      coldDataTTLMultiplier: 0.5,
      statsWindowSize: 10,
      autoAdjustInterval: 5 * 60 * 1e3,
      // 5分钟
      ...config
    };
    if (this.config?.enabled && this.config?.autoAdjustInterval > 0) {
      this.startAutoAdjust();
    }
  }
  /**
   * 记录访问
   */
  recordAccess(key) {
    if (!this.config?.enabled) {
      return;
    }
    const now = Date.now();
    let stats = this.accessStats.get(key);
    if (!stats) {
      stats = {
        accessCount: 0,
        lastAccessTime: now,
        firstAccessTime: now,
        averageInterval: 0,
        accessTimestamps: []
      };
      this.accessStats.set(key, stats);
    }
    stats.accessCount++;
    stats.lastAccessTime = now;
    stats.accessTimestamps.push(now);
    if (stats.accessTimestamps.length > this.config?.statsWindowSize) {
      stats.accessTimestamps.shift();
    }
    if (stats.accessTimestamps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < stats.accessTimestamps.length; i++) {
        intervals.push(stats.accessTimestamps[i] - stats.accessTimestamps[i - 1]);
      }
      stats.averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }
    this.adjustPriority(key, stats);
  }
  /**
   * 获取建议的TTL
   */
  getSuggestedTTL(key, baseTTL) {
    if (!this.config?.enabled) {
      return baseTTL;
    }
    const priority = this.priorityMap.get(key) || CachePriority.NORMAL;
    switch (priority) {
      case CachePriority.CRITICAL:
        return baseTTL * 10;
      // 10倍TTL
      case CachePriority.HIGH:
        return baseTTL * this.config?.hotDataTTLMultiplier;
      case CachePriority.LOW:
        return baseTTL * this.config?.coldDataTTLMultiplier;
      default:
        return baseTTL;
    }
  }
  /**
   * 获取缓存优先级
   */
  getPriority(key) {
    return this.priorityMap.get(key) || CachePriority.NORMAL;
  }
  /**
   * 设置缓存优先级
   */
  setPriority(key, priority) {
    this.priorityMap.set(key, priority);
  }
  /**
   * 获取访问统计
   */
  getAccessStats(key) {
    return this.accessStats.get(key) || null;
  }
  /**
   * 获取所有统计信息
   */
  getAllStats() {
    return new Map(this.accessStats);
  }
  /**
   * 获取热点数据列表
   */
  getHotKeys(limit = 10) {
    const entries = Array.from(this.accessStats.entries());
    return entries.sort((a, b) => {
      const scoreA = a[1].accessCount / (a[1].averageInterval || 1);
      const scoreB = b[1].accessCount / (b[1].averageInterval || 1);
      return scoreB - scoreA;
    }).slice(0, limit).map(([key]) => key);
  }
  /**
   * 获取冷数据列表
   */
  getColdKeys(limit = 10) {
    const entries = Array.from(this.accessStats.entries());
    const now = Date.now();
    return entries.filter(([, stats]) => stats.accessCount < this.config?.minAccessThreshold).sort((a, b) => {
      return now - b[1].lastAccessTime - (now - a[1].lastAccessTime);
    }).slice(0, limit).map(([key]) => key);
  }
  /**
   * 清理统计信息
   */
  clearStats(key) {
    if (key) {
      this.accessStats.delete(key);
      this.priorityMap.delete(key);
    } else {
      this.accessStats.clear();
      this.priorityMap.clear();
    }
  }
  /**
   * 销毁策略管理器
   */
  destroy() {
    if (this.adjustTimer) {
      clearInterval(this.adjustTimer);
      this.adjustTimer = void 0;
    }
    this.clearStats();
  }
  /**
   * 调整缓存优先级
   */
  adjustPriority(key, stats) {
    const currentPriority = this.priorityMap.get(key) || CachePriority.NORMAL;
    if (currentPriority === CachePriority.CRITICAL) {
      return;
    }
    const accessScore = stats.accessCount;
    const frequencyScore = stats.averageInterval > 0 ? 1e3 / stats.averageInterval : 0;
    let newPriority = CachePriority.NORMAL;
    if (accessScore >= 10 && frequencyScore > 0.1) {
      newPriority = CachePriority.HIGH;
    } else if (accessScore < this.config?.minAccessThreshold) {
      newPriority = CachePriority.LOW;
    }
    if (newPriority !== currentPriority) {
      this.priorityMap.set(key, newPriority);
    }
  }
  /**
   * 启动自动调整
   */
  startAutoAdjust() {
    this.adjustTimer = setInterval(() => {
      this.performAutoAdjust();
    }, this.config?.autoAdjustInterval);
  }
  /**
   * 执行自动调整
   */
  performAutoAdjust() {
    const now = Date.now();
    const staleThreshold = 10 * 60 * 1e3;
    const toDelete = [];
    this.accessStats.forEach((stats, key) => {
      if (now - stats.lastAccessTime > staleThreshold) {
        toDelete.push(key);
      }
    });
    toDelete.forEach((key) => {
      this.clearStats(key);
    });
  }
}
function createSmartCacheStrategy(config) {
  return new SmartCacheStrategy(config);
}

export { CachePriority, SmartCacheStrategy, createSmartCacheStrategy };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=SmartCacheStrategy.js.map
