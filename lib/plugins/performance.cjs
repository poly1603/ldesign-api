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

var PerformanceMonitor = require('../utils/PerformanceMonitor.cjs');

function createPerformancePlugin(config = {}) {
  let performanceMonitor = null;
  let autoTuningTimer;
  return {
    name: "performance",
    version: "1.0.0",
    async install(engine) {
      if (config.enableMonitoring !== false) {
        performanceMonitor = PerformanceMonitor.createPerformanceMonitor({
          enabled: true,
          collectDetailedMetrics: config.monitoring?.collectDetailedMetrics ?? true,
          maxRecords: config.monitoring?.maxRecords ?? 1e3,
          reportInterval: config.monitoring?.reportInterval ?? 6e4,
          slowQueryThreshold: config.monitoring?.slowQueryThreshold ?? 1e3,
          logWarnings: config.monitoring?.logWarnings ?? true
        });
        PerformanceMonitor.setGlobalPerformanceMonitor(performanceMonitor);
        if ("setPerformanceMonitor" in engine) {
          engine.setPerformanceMonitor(performanceMonitor);
        }
      }
      if (config.cacheOptimization?.enableLRU) {
        if (engine.config.cache) {
          engine.config.cache.storage = "lru";
        }
      }
      if (config.cacheOptimization?.enableWarmup && config.cacheOptimization.warmupData) {
        setTimeout(() => {
          this.warmupCache(engine, config.cacheOptimization.warmupData);
        }, 1e3);
      }
      if (config.autoTuning?.enabled) {
        this.startAutoTuning(engine, config.autoTuning);
      }
      const existingRequestMiddlewares = engine.config.middlewares?.request || [];
      const existingResponseMiddlewares = engine.config.middlewares?.response || [];
      engine.config.middlewares = {
        ...engine.config.middlewares,
        request: [
          ...existingRequestMiddlewares,
          // 请求优化中间件
          async (config2) => {
            config2.__startTime = performance.now();
            return config2;
          }
        ],
        response: [
          ...existingResponseMiddlewares,
          // 响应优化中间件
          async (response) => {
            const startTime = response.config?.__startTime;
            if (startTime) {
              const responseTime = performance.now() - startTime;
              response.__responseTime = responseTime;
              if (responseTime > (config.monitoring?.slowQueryThreshold ?? 1e3)) {
                console.warn(`\u{1F40C} Slow response detected: ${responseTime.toFixed(2)}ms`);
              }
            }
            return response;
          }
        ]
      };
    },
    async uninstall() {
      if (performanceMonitor) {
        performanceMonitor.destroy();
        performanceMonitor = null;
        PerformanceMonitor.setGlobalPerformanceMonitor(null);
      }
      if (autoTuningTimer) {
        clearInterval(autoTuningTimer);
        autoTuningTimer = void 0;
      }
    },
    // 缓存预热
    warmupCache(engine, warmupData) {
      try {
        if ("cacheManager" in engine) {
          const cacheManager = engine.cacheManager;
          if (cacheManager && typeof cacheManager.warmup === "function") {
            cacheManager.warmup(warmupData);
          }
        }
      } catch (error) {
        console.warn("Cache warmup failed:", error);
      }
    },
    // 启动自动调优
    startAutoTuning(engine, autoTuningConfig) {
      const checkInterval = autoTuningConfig.checkInterval ?? 5 * 60 * 1e3;
      const thresholds = {
        averageResponseTime: 1e3,
        errorRate: 0.05,
        cacheHitRate: 0.8,
        ...autoTuningConfig.thresholds
      };
      autoTuningTimer = setInterval(() => {
        this.performAutoTuning(engine, thresholds);
      }, checkInterval);
    },
    // 执行自动调优
    performAutoTuning(engine, thresholds) {
      if (!performanceMonitor)
        return;
      try {
        const report = performanceMonitor.generateReport();
        const recommendations = [];
        if (report.overall.averageTime > thresholds.averageResponseTime) {
          recommendations.push("\u5E73\u5747\u54CD\u5E94\u65F6\u95F4\u8FC7\u957F\uFF0C\u5EFA\u8BAE\u542F\u7528\u66F4\u79EF\u6781\u7684\u7F13\u5B58\u7B56\u7565");
          if (engine.config.cache && engine.config.cache.ttl) {
            const newTTL = Math.min(engine.config.cache.ttl * 1.5, 30 * 60 * 1e3);
            engine.config.cache.ttl = newTTL;
          }
        }
        if (report.overall.errorRate > thresholds.errorRate) {
          recommendations.push("\u9519\u8BEF\u7387\u8FC7\u9AD8\uFF0C\u5EFA\u8BAE\u542F\u7528\u66F4\u79EF\u6781\u7684\u91CD\u8BD5\u7B56\u7565");
          if (engine.config.retry) {
            engine.config.retry.retries = Math.min((engine.config.retry.retries || 0) + 1, 5);
            engine.config.retry.delay = Math.max((engine.config.retry.delay || 0) * 1.2, 500);
          }
        }
        if ("cacheManager" in engine) {
          const cacheManager = engine.cacheManager;
          if (cacheManager && typeof cacheManager.getEnhancedStats === "function") {
            const cacheStats = cacheManager.getEnhancedStats();
            const hitRate = cacheStats.hits / (cacheStats.hits + cacheStats.misses);
            if (hitRate < thresholds.cacheHitRate) {
              recommendations.push("\u7F13\u5B58\u547D\u4E2D\u7387\u8FC7\u4F4E\uFF0C\u5EFA\u8BAE\u589E\u52A0\u7F13\u5B58\u5927\u5C0F\u6216\u8C03\u6574\u7F13\u5B58\u7B56\u7565");
              if (engine.config.cache) {
                engine.config.cache.maxSize = Math.min((engine.config.cache.maxSize || 100) * 1.5, 1e3);
              }
            }
          }
        }
        if (recommendations.length > 0) {
          console.group("\u{1F527} Auto-tuning Recommendations");
          recommendations.forEach((rec) => console.log(rec));
          console.groupEnd();
        }
      } catch (error) {
        console.warn("Auto-tuning failed:", error);
      }
    }
  };
}
const performancePlugin = createPerformancePlugin();
function withPerformance(config = {}) {
  return createPerformancePlugin(config);
}
const PerformanceUtils = {
  /**
   * 创建性能监控器
   */
  createMonitor: PerformanceMonitor.createPerformanceMonitor,
  /**
   * 获取性能报告
   */
  getReport(monitor) {
    return monitor.generateReport();
  },
  /**
   * 重置性能统计
   */
  resetStats(monitor) {
    monitor.reset();
  },
  /**
   * 检查是否为慢查询
   */
  isSlowQuery(duration, threshold = 1e3) {
    return duration > threshold;
  },
  /**
   * 格式化性能指标
   */
  formatMetrics(metrics) {
    return {
      averageTime: `${metrics.averageTime.toFixed(2)}ms`,
      successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
      callCount: metrics.callCount
    };
  }
};

exports.PerformanceUtils = PerformanceUtils;
exports.createPerformancePlugin = createPerformancePlugin;
exports.performancePlugin = performancePlugin;
exports.withPerformance = withPerformance;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=performance.cjs.map
