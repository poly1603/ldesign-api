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

class PerformanceMonitor {
  constructor(config = {}) {
    this.metrics = /* @__PURE__ */ new Map();
    this.callRecords = [];
    this.startTime = Date.now();
    this.config = {
      enabled: true,
      collectDetailedMetrics: true,
      maxRecords: 1e3,
      reportInterval: 6e4,
      // 1分钟
      slowQueryThreshold: 1e3,
      // 1秒
      logWarnings: true,
      ...config
    };
    if (this.config?.enabled && this.config?.reportInterval > 0) {
      this.startReporting();
    }
  }
  /**
   * 开始监控API调用
   */
  startCall(methodName, params) {
    if (!this.config?.enabled) {
      return () => {
      };
    }
    const startTime = performance.now();
    return (error) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordCall({
        methodName,
        startTime,
        endTime,
        duration,
        success: !error,
        error,
        params: this.config?.collectDetailedMetrics ? params : void 0
      });
    };
  }
  /**
   * 记录调用结果
   */
  recordCall(record) {
    this.updateMethodMetrics(record);
    if (this.config?.collectDetailedMetrics) {
      this.callRecords.push(record);
      if (this.callRecords.length > this.config?.maxRecords) {
        this.callRecords.shift();
      }
    }
    if (record.duration > this.config?.slowQueryThreshold && this.config?.logWarnings) {
      console.warn(`\u{1F40C} Slow API call detected: ${record.methodName} took ${record.duration.toFixed(2)}ms`, record.params ? { params: record.params } : "");
    }
    if (!record.success && this.config?.logWarnings) {
      console.warn(`\u274C API call failed: ${record.methodName}`, record.error);
    }
  }
  /**
   * 更新方法性能指标
   */
  updateMethodMetrics(record) {
    const existing = this.metrics.get(record.methodName);
    if (existing) {
      existing.callCount++;
      existing.totalTime += record.duration;
      existing.averageTime = existing.totalTime / existing.callCount;
      existing.minTime = Math.min(existing.minTime, record.duration);
      existing.maxTime = Math.max(existing.maxTime, record.duration);
      existing.lastCallTime = Date.now();
      if (record.success) {
        existing.successCount++;
      } else {
        existing.errorCount++;
      }
      existing.successRate = existing.successCount / existing.callCount;
    } else {
      this.metrics.set(record.methodName, {
        methodName: record.methodName,
        callCount: 1,
        totalTime: record.duration,
        averageTime: record.duration,
        minTime: record.duration,
        maxTime: record.duration,
        successCount: record.success ? 1 : 0,
        errorCount: record.success ? 0 : 1,
        successRate: record.success ? 1 : 0,
        lastCallTime: Date.now()
      });
    }
  }
  /**
   * 获取性能指标
   */
  getMetrics(methodName) {
    if (methodName) {
      const metric = this.metrics.get(methodName);
      return metric ? [metric] : [];
    }
    return Array.from(this.metrics.values());
  }
  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    if (typeof performance !== "undefined" && "memory" in performance) {
      const memory = performance.memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        usage: memory.usedJSHeapSize / memory.totalJSHeapSize
      };
    }
    if (typeof process !== "undefined" && process.memoryUsage) {
      const memory = process.memoryUsage();
      return {
        used: memory.heapUsed,
        total: memory.heapTotal,
        usage: memory.heapUsed / memory.heapTotal
      };
    }
    return {
      used: 0,
      total: 0,
      usage: 0
    };
  }
  /**
   * 生成性能报告
   */
  generateReport() {
    const now = Date.now();
    const methods = this.getMetrics();
    const memory = this.getMemoryUsage();
    const totalCalls = methods.reduce((sum, m) => sum + m.callCount, 0);
    const totalTime = methods.reduce((sum, m) => sum + m.totalTime, 0);
    const totalErrors = methods.reduce((sum, m) => sum + m.errorCount, 0);
    const overall = {
      totalCalls,
      totalTime,
      averageTime: totalCalls > 0 ? totalTime / totalCalls : 0,
      errorRate: totalCalls > 0 ? totalErrors / totalCalls : 0
    };
    const recommendations = this.generateRecommendations(methods, memory, overall);
    return {
      timeRange: {
        start: this.startTime,
        end: now,
        duration: now - this.startTime
      },
      overall,
      methods: methods.sort((a, b) => b.averageTime - a.averageTime),
      // 按平均耗时排序
      memory,
      recommendations
    };
  }
  /**
   * 生成性能建议
   */
  generateRecommendations(methods, memory, overall) {
    const recommendations = [];
    const slowMethods = methods.filter((m) => m.averageTime > this.config?.slowQueryThreshold);
    if (slowMethods.length > 0) {
      recommendations.push(`\u53D1\u73B0 ${slowMethods.length} \u4E2A\u6162\u65B9\u6CD5\uFF0C\u5EFA\u8BAE\u4F18\u5316: ${slowMethods.map((m) => m.methodName).join(", ")}`);
    }
    const highErrorMethods = methods.filter((m) => m.errorCount > 0 && m.successRate < 0.95);
    if (highErrorMethods.length > 0) {
      recommendations.push(`\u53D1\u73B0\u9AD8\u9519\u8BEF\u7387\u65B9\u6CD5\uFF0C\u5EFA\u8BAE\u68C0\u67E5: ${highErrorMethods.map((m) => `${m.methodName}(${(m.successRate * 100).toFixed(1)}%)`).join(", ")}`);
    }
    if (memory.usage > 0.8) {
      recommendations.push("\u5185\u5B58\u4F7F\u7528\u7387\u8F83\u9AD8\uFF0C\u5EFA\u8BAE\u68C0\u67E5\u5185\u5B58\u6CC4\u6F0F\u6216\u4F18\u5316\u7F13\u5B58\u7B56\u7565");
    }
    if (overall.averageTime > 500) {
      recommendations.push("API\u5E73\u5747\u54CD\u5E94\u65F6\u95F4\u8F83\u957F\uFF0C\u5EFA\u8BAE\u4F18\u5316\u7F51\u7EDC\u8BF7\u6C42\u6216\u670D\u52A1\u5668\u6027\u80FD");
    }
    if (overall.errorRate > 0.05) {
      recommendations.push("API\u9519\u8BEF\u7387\u8F83\u9AD8\uFF0C\u5EFA\u8BAE\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5\u548C\u670D\u52A1\u5668\u72B6\u6001");
    }
    const highFrequencyMethods = methods.filter((m) => m.callCount > 100);
    if (highFrequencyMethods.length > 0) {
      recommendations.push(`\u9AD8\u9891\u8C03\u7528\u65B9\u6CD5\u5EFA\u8BAE\u542F\u7528\u7F13\u5B58: ${highFrequencyMethods.map((m) => m.methodName).join(", ")}`);
    }
    if (recommendations.length === 0) {
      recommendations.push("\u6027\u80FD\u8868\u73B0\u826F\u597D\uFF0C\u65E0\u9700\u7279\u522B\u4F18\u5316");
    }
    return recommendations;
  }
  /**
   * 重置统计数据
   */
  reset() {
    this.metrics.clear();
    this.callRecords = [];
    this.startTime = Date.now();
  }
  /**
   * 启动定期报告
   */
  startReporting() {
    this.reportTimer = setInterval(() => {
      const report = this.generateReport();
      console.group("\u{1F4CA} API Performance Report");
      console.log(`Time Range: ${new Date(report.timeRange.start)} - ${new Date(report.timeRange.end)}`);
      console.log(`Total Calls: ${report.overall.totalCalls}`);
      console.log(`Average Time: ${report.overall.averageTime.toFixed(2)}ms`);
      console.log(`Error Rate: ${(report.overall.errorRate * 100).toFixed(1)}%`);
      console.groupEnd();
    }, this.config?.reportInterval);
  }
  /**
   * 销毁监控器
   */
  destroy() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = void 0;
    }
    this.reset();
  }
}
let globalMonitor = null;
function getGlobalPerformanceMonitor() {
  return globalMonitor;
}
function setGlobalPerformanceMonitor(monitor) {
  globalMonitor = monitor;
}
function createPerformanceMonitor(config) {
  return new PerformanceMonitor(config);
}

exports.PerformanceMonitor = PerformanceMonitor;
exports.createPerformanceMonitor = createPerformanceMonitor;
exports.getGlobalPerformanceMonitor = getGlobalPerformanceMonitor;
exports.setGlobalPerformanceMonitor = setGlobalPerformanceMonitor;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=PerformanceMonitor.cjs.map
