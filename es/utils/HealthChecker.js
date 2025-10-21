/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class HealthChecker {
  constructor(config = {}) {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      activeRequests: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.checkTimer = null;
    this.lastStatus = null;
    this.listeners = [];
    this.config = {
      enabled: true,
      interval: 3e4,
      // 30秒
      timeoutThreshold: 5e3,
      // 5秒
      errorRateThreshold: 0.1,
      // 10%
      memoryThreshold: 100 * 1024 * 1024,
      // 100MB
      ...config
    };
    if (this.config?.enabled) {
      this.startHealthCheck();
    }
  }
  /**
   * 记录请求开始
   */
  requestStart() {
    this.metrics.activeRequests++;
    this.metrics.totalRequests++;
  }
  /**
   * 记录请求成功
   */
  requestSuccess(responseTime) {
    this.metrics.activeRequests--;
    this.metrics.successfulRequests++;
    this.metrics.totalResponseTime += responseTime;
  }
  /**
   * 记录请求失败
   */
  requestFailure(responseTime) {
    this.metrics.activeRequests--;
    this.metrics.failedRequests++;
    this.metrics.totalResponseTime += responseTime;
  }
  /**
   * 记录缓存命中
   */
  cacheHit() {
    this.metrics.cacheHits++;
  }
  /**
   * 记录缓存未命中
   */
  cacheMiss() {
    this.metrics.cacheMisses++;
  }
  /**
   * 执行健康检查
   */
  check() {
    const now = Date.now();
    const issues = [];
    const totalRequests = this.metrics.totalRequests || 1;
    const avgResponseTime = totalRequests > 0 ? this.metrics.totalResponseTime / totalRequests : 0;
    const errorRate = totalRequests > 0 ? this.metrics.failedRequests / totalRequests : 0;
    const cacheHitRate = this.metrics.cacheHits + this.metrics.cacheMisses > 0 ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) : 0;
    const memoryUsage = this.estimateMemoryUsage();
    if (avgResponseTime > this.config?.timeoutThreshold) {
      issues.push({
        severity: avgResponseTime > this.config?.timeoutThreshold * 2 ? "critical" : "warning",
        message: "Average response time is too high",
        metric: "avgResponseTime",
        value: avgResponseTime,
        threshold: this.config?.timeoutThreshold
      });
    }
    if (errorRate > this.config?.errorRateThreshold) {
      issues.push({
        severity: errorRate > this.config?.errorRateThreshold * 2 ? "critical" : "warning",
        message: "Error rate is too high",
        metric: "errorRate",
        value: errorRate,
        threshold: this.config?.errorRateThreshold
      });
    }
    if (memoryUsage > this.config?.memoryThreshold) {
      issues.push({
        severity: memoryUsage > this.config?.memoryThreshold * 1.5 ? "critical" : "warning",
        message: "Memory usage is too high",
        metric: "memoryUsage",
        value: memoryUsage,
        threshold: this.config?.memoryThreshold
      });
    }
    let status = "healthy";
    if (issues.length > 0) {
      const hasCritical = issues.some((issue) => issue.severity === "critical");
      status = hasCritical ? "unhealthy" : "degraded";
    }
    const healthStatus = {
      status,
      timestamp: now,
      details: {
        avgResponseTime,
        errorRate,
        memoryUsage,
        activeRequests: this.metrics.activeRequests,
        cacheHitRate
      },
      issues
    };
    this.lastStatus = healthStatus;
    this.notifyListeners(healthStatus);
    return healthStatus;
  }
  /**
   * 获取最后的健康状态
   */
  getLastStatus() {
    return this.lastStatus;
  }
  /**
   * 添加状态变化监听器
   */
  onStatusChange(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  /**
   * 通知所有监听器
   */
  notifyListeners(status) {
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error("Error in health status listener:", error);
      }
    });
  }
  /**
   * 启动健康检查
   */
  startHealthCheck() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
    this.check();
    this.checkTimer = setInterval(() => {
      this.check();
    }, this.config?.interval);
  }
  /**
   * 停止健康检查
   */
  stopHealthCheck() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }
  /**
   * 重置统计数据
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      activeRequests: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
  /**
   * 获取当前指标
   */
  getMetrics() {
    return { ...this.metrics };
  }
  /**
   * 更新配置
   */
  updateConfig(config) {
    Object.assign(this.config, config);
    if (config.enabled !== void 0) {
      if (config.enabled) {
        this.startHealthCheck();
      } else {
        this.stopHealthCheck();
      }
    } else if (config.interval !== void 0) {
      if (this.config?.enabled) {
        this.startHealthCheck();
      }
    }
  }
  /**
   * 估算内存使用（简化版）
   */
  estimateMemoryUsage() {
    if (typeof performance !== "undefined" && performance.memory) {
      return performance.memory.usedJSHeapSize || 0;
    }
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }
  /**
   * 生成健康报告
   */
  generateReport() {
    const status = this.lastStatus || this.check();
    const recommendations = [];
    status.issues.forEach((issue) => {
      switch (issue.metric) {
        case "avgResponseTime":
          recommendations.push("Consider enabling caching or optimizing slow API endpoints");
          break;
        case "errorRate":
          recommendations.push("Review error logs and implement retry strategies");
          break;
        case "memoryUsage":
          recommendations.push("Consider reducing cache size or implementing memory cleanup");
          break;
      }
    });
    const summary = `Health Status: ${status.status.toUpperCase()} - ${status.issues.length} issue(s) detected`;
    return {
      summary,
      status,
      recommendations: [...new Set(recommendations)]
      // 去重
    };
  }
  /**
   * 销毁健康检查器
   */
  destroy() {
    this.stopHealthCheck();
    this.listeners = [];
    this.resetMetrics();
  }
}
function createHealthChecker(config) {
  return new HealthChecker(config);
}

export { HealthChecker, createHealthChecker };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=HealthChecker.js.map
