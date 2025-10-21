/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class DuplicateDetector {
  constructor(config = {}) {
    this.records = /* @__PURE__ */ new Map();
    this.stats = {
      totalRequests: 0,
      duplicateRequests: 0,
      blockedRequests: 0
    };
    this.cleanupTimer = null;
    this.config = {
      timeWindow: 1e3,
      // 1秒
      maxDuplicates: 1,
      // 允许1次重复
      enabled: true,
      autoCleanup: true,
      cleanupInterval: 5e3,
      // 5秒清理一次
      ...config
    };
    if (this.config?.autoCleanup) {
      this.startCleanup();
    }
  }
  /**
   * 检测请求是否重复
   */
  isDuplicate(key) {
    if (!this.config?.enabled) {
      return false;
    }
    this.stats.totalRequests++;
    const now = Date.now();
    const record = this.records.get(key);
    if (!record) {
      this.records.set(key, {
        key,
        timestamp: now,
        count: 1
      });
      return false;
    }
    const elapsed = now - record.timestamp;
    if (elapsed > this.config?.timeWindow) {
      this.records.set(key, {
        key,
        timestamp: now,
        count: 1
      });
      return false;
    }
    record.count++;
    this.stats.duplicateRequests++;
    if (record.count > this.config?.maxDuplicates) {
      this.stats.blockedRequests++;
      return true;
    }
    return false;
  }
  /**
   * 标记请求完成
   */
  markComplete(_key) {
  }
  /**
   * 清除指定请求记录
   */
  clear(key) {
    this.records.delete(key);
  }
  /**
   * 清除所有记录
   */
  clearAll() {
    this.records.clear();
  }
  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      trackedRequests: this.records.size,
      duplicateRate: this.stats.totalRequests > 0 ? this.stats.duplicateRequests / this.stats.totalRequests : 0
    };
  }
  /**
   * 重置统计
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      duplicateRequests: 0,
      blockedRequests: 0
    };
  }
  /**
   * 更新配置
   */
  updateConfig(config) {
    Object.assign(this.config, config);
    if (config.autoCleanup !== void 0) {
      if (config.autoCleanup && !this.cleanupTimer) {
        this.startCleanup();
      } else if (!config.autoCleanup && this.cleanupTimer) {
        this.stopCleanup();
      }
    }
    if (config.cleanupInterval && this.cleanupTimer) {
      this.stopCleanup();
      this.startCleanup();
    }
  }
  /**
   * 启动自动清理
   */
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config?.cleanupInterval);
  }
  /**
   * 停止自动清理
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
  /**
   * 清理过期记录
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];
    for (const [key, record] of this.records.entries()) {
      if (now - record.timestamp > this.config?.timeWindow) {
        expiredKeys.push(key);
      }
    }
    expiredKeys.forEach((key) => this.records.delete(key));
  }
  /**
   * 销毁检测器
   */
  destroy() {
    this.stopCleanup();
    this.clearAll();
    this.resetStats();
  }
}
function createDuplicateDetector(config) {
  return new DuplicateDetector(config);
}
let globalDetector = null;
function getGlobalDuplicateDetector() {
  if (!globalDetector) {
    globalDetector = new DuplicateDetector();
  }
  return globalDetector;
}
function setGlobalDuplicateDetector(detector) {
  globalDetector = detector;
}
function checkDuplicate(key) {
  return getGlobalDuplicateDetector().isDuplicate(key);
}

export { DuplicateDetector, checkDuplicate, createDuplicateDetector, getGlobalDuplicateDetector, setGlobalDuplicateDetector };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=DuplicateDetector.js.map
