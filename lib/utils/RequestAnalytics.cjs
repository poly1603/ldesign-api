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

class RequestAnalytics {
  constructor(config = {}) {
    this.records = [];
    this.methodStats = /* @__PURE__ */ new Map();
    this.config = {
      enabled: true,
      maxRecords: 1e3,
      recordRetention: 60 * 60 * 1e3,
      // 1小时
      recordDetails: true,
      cleanupInterval: 5 * 60 * 1e3,
      // 5分钟
      ...config
    };
    if (this.config?.enabled && this.config?.cleanupInterval > 0) {
      this.startCleanup();
    }
  }
  /**
   * 开始记录请求
   */
  startRequest(id, methodName) {
    if (!this.config?.enabled) {
      return;
    }
    const record = {
      id,
      methodName,
      startTime: Date.now(),
      status: "pending"
    };
    if (this.config?.recordDetails) {
      this.records.push(record);
      if (this.records.length > this.config?.maxRecords) {
        this.records.shift();
      }
    }
    if (!this.methodStats.has(methodName)) {
      this.methodStats.set(methodName, {
        methodName,
        totalRequests: 0,
        successRequests: 0,
        errorRequests: 0,
        cancelledRequests: 0,
        cacheHits: 0,
        averageResponseTime: 0,
        minResponseTime: Number.POSITIVE_INFINITY,
        maxResponseTime: 0,
        successRate: 0,
        lastRequestTime: Date.now()
      });
    }
    const stats = this.methodStats.get(methodName);
    stats.totalRequests++;
    stats.lastRequestTime = Date.now();
  }
  /**
   * 结束请求（成功）
   */
  endRequest(id, options = {}) {
    if (!this.config?.enabled) {
      return;
    }
    const record = this.findRecord(id);
    if (!record) {
      return;
    }
    const endTime = Date.now();
    const duration = endTime - record.startTime;
    record.endTime = endTime;
    record.duration = duration;
    record.status = "success";
    record.fromCache = options.fromCache;
    record.retryCount = options.retryCount;
    record.requestSize = options.requestSize;
    record.responseSize = options.responseSize;
    const stats = this.methodStats.get(record.methodName);
    if (stats) {
      stats.successRequests++;
      if (options.fromCache) {
        stats.cacheHits++;
      }
      this.updateResponseTimeStats(stats, duration);
      this.updateSuccessRate(stats);
    }
  }
  /**
   * 结束请求（失败）
   */
  endRequestWithError(id, error) {
    if (!this.config?.enabled) {
      return;
    }
    const record = this.findRecord(id);
    if (!record) {
      return;
    }
    const endTime = Date.now();
    const duration = endTime - record.startTime;
    record.endTime = endTime;
    record.duration = duration;
    record.status = "error";
    record.error = error;
    const stats = this.methodStats.get(record.methodName);
    if (stats) {
      stats.errorRequests++;
      this.updateSuccessRate(stats);
    }
  }
  /**
   * 取消请求
   */
  cancelRequest(id) {
    if (!this.config?.enabled) {
      return;
    }
    const record = this.findRecord(id);
    if (!record) {
      return;
    }
    const endTime = Date.now();
    const duration = endTime - record.startTime;
    record.endTime = endTime;
    record.duration = duration;
    record.status = "cancelled";
    const stats = this.methodStats.get(record.methodName);
    if (stats) {
      stats.cancelledRequests++;
    }
  }
  /**
   * 获取方法统计
   */
  getMethodStats(methodName) {
    return this.methodStats.get(methodName) || null;
  }
  /**
   * 获取所有方法统计
   */
  getAllMethodStats() {
    return Array.from(this.methodStats.values());
  }
  /**
   * 获取总体统计
   */
  getOverallStats() {
    let totalRequests = 0;
    let successRequests = 0;
    let errorRequests = 0;
    let cancelledRequests = 0;
    let cacheHits = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    this.methodStats.forEach((stats) => {
      totalRequests += stats.totalRequests;
      successRequests += stats.successRequests;
      errorRequests += stats.errorRequests;
      cancelledRequests += stats.cancelledRequests;
      cacheHits += stats.cacheHits;
      if (stats.averageResponseTime > 0) {
        totalResponseTime += stats.averageResponseTime * stats.successRequests;
        responseTimeCount += stats.successRequests;
      }
    });
    return {
      totalRequests,
      successRequests,
      errorRequests,
      cancelledRequests,
      cacheHits,
      averageResponseTime: responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0,
      successRate: totalRequests > 0 ? successRequests / totalRequests : 0
    };
  }
  /**
   * 获取最慢的请求
   */
  getSlowestRequests(limit = 10) {
    return this.records.filter((r) => r.status === "success" && r.duration !== void 0).sort((a, b) => (b.duration || 0) - (a.duration || 0)).slice(0, limit);
  }
  /**
   * 获取失败的请求
   */
  getFailedRequests(limit) {
    const failed = this.records.filter((r) => r.status === "error");
    return limit ? failed.slice(0, limit) : failed;
  }
  /**
   * 清除统计数据
   */
  clear() {
    this.records = [];
    this.methodStats.clear();
  }
  /**
   * 销毁分析器
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = void 0;
    }
    this.clear();
  }
  /**
   * 查找记录
   */
  findRecord(id) {
    return this.records.find((r) => r.id === id);
  }
  /**
   * 更新响应时间统计
   */
  updateResponseTimeStats(stats, duration) {
    stats.minResponseTime = Math.min(stats.minResponseTime, duration);
    stats.maxResponseTime = Math.max(stats.maxResponseTime, duration);
    const count = stats.successRequests;
    stats.averageResponseTime = (stats.averageResponseTime * (count - 1) + duration) / count;
  }
  /**
   * 更新成功率
   */
  updateSuccessRate(stats) {
    const total = stats.successRequests + stats.errorRequests;
    stats.successRate = total > 0 ? stats.successRequests / total : 0;
  }
  /**
   * 启动清理
   */
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config?.cleanupInterval);
  }
  /**
   * 清理过期记录
   */
  cleanup() {
    const now = Date.now();
    const threshold = now - this.config?.recordRetention;
    this.records = this.records.filter((r) => r.startTime >= threshold);
  }
}
function createRequestAnalytics(config) {
  return new RequestAnalytics(config);
}

exports.RequestAnalytics = RequestAnalytics;
exports.createRequestAnalytics = createRequestAnalytics;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=RequestAnalytics.cjs.map
