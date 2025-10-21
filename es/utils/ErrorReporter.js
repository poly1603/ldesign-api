/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class ErrorReporter {
  constructor(config = {}) {
    this.errorCache = [];
    this.listeners = [];
    this.config = {
      enabled: true,
      endpoint: "",
      apiKey: "",
      sampleRate: 1,
      maxCacheSize: 100,
      batchInterval: 5e3,
      enableInDevelopment: false,
      filter: () => true,
      transform: (error) => error.toJSON(),
      ...config
    };
    this.stats = this.initStats();
    this.startBatchReporting();
  }
  /**
   * 初始化统计信息
   */
  initStats() {
    return {
      total: 0,
      byType: {},
      bySeverity: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0
      },
      byMethod: {},
      recent: [],
      timeRange: {
        start: Date.now(),
        end: Date.now()
      }
    };
  }
  /**
   * 报告错误
   */
  report(error) {
    if (!this.shouldReport(error)) {
      return;
    }
    this.updateStats(error);
    this.addToCache(error);
    this.notifyListeners(error);
    if (this.isDevelopment()) {
      this.logToConsole(error);
    }
  }
  /**
   * 判断是否应该报告错误
   */
  shouldReport(error) {
    if (!this.config?.enabled) {
      return false;
    }
    if (!this.config?.enableInDevelopment && this.isDevelopment()) {
      return false;
    }
    if (Math.random() > this.config?.sampleRate) {
      return false;
    }
    return this.config?.filter(error);
  }
  /**
   * 更新统计信息
   */
  updateStats(error) {
    this.stats.total++;
    this.stats.byType[error.type] = (this.stats.byType[error.type] || 0) + 1;
    this.stats.bySeverity[error.severity]++;
    if (error.context.methodName) {
      this.stats.byMethod[error.context.methodName] = (this.stats.byMethod[error.context.methodName] || 0) + 1;
    }
    this.stats.recent.unshift(error);
    if (this.stats.recent.length > 10) {
      this.stats.recent = this.stats.recent.slice(0, 10);
    }
    this.stats.timeRange.end = Date.now();
  }
  /**
   * 添加到缓存
   */
  addToCache(error) {
    this.errorCache.unshift(error);
    if (this.errorCache.length > this.config?.maxCacheSize) {
      this.errorCache = this.errorCache.slice(0, this.config?.maxCacheSize);
    }
  }
  /**
   * 通知监听器
   */
  notifyListeners(error) {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch (e) {
        console.warn("Error in error listener:", e);
      }
    });
  }
  /**
   * 输出到控制台
   */
  logToConsole(error) {
    const style = this.getConsoleStyle(error.severity);
    console.group(`%c\u{1F6A8} API Error [${error.type}]`, style);
    console.error("Message:", error.userMessage);
    console.error("Developer Message:", error.developerMessage);
    console.error("Method:", error.context.methodName);
    console.error("Severity:", error.severity);
    console.error("Suggestions:", error.suggestions);
    if (error.originalError) {
      console.error("Original Error:", error.originalError);
    }
    console.groupEnd();
  }
  /**
   * 获取控制台样式
   */
  getConsoleStyle(severity) {
    switch (severity) {
      case "CRITICAL":
        return "color: white; background-color: #dc2626; font-weight: bold; padding: 2px 6px; border-radius: 3px;";
      case "HIGH":
        return "color: white; background-color: #ea580c; font-weight: bold; padding: 2px 6px; border-radius: 3px;";
      case "MEDIUM":
        return "color: white; background-color: #d97706; font-weight: bold; padding: 2px 6px; border-radius: 3px;";
      case "LOW":
        return "color: white; background-color: #65a30d; font-weight: bold; padding: 2px 6px; border-radius: 3px;";
      default:
        return "color: white; background-color: #6b7280; font-weight: bold; padding: 2px 6px; border-radius: 3px;";
    }
  }
  /**
   * 开始批量报告
   */
  startBatchReporting() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.batchTimer = setInterval(() => {
      this.flushCache();
    }, this.config?.batchInterval);
  }
  /**
   * 刷新缓存，发送错误报告
   */
  async flushCache() {
    if (this.errorCache.length === 0 || !this.config?.endpoint) {
      return;
    }
    const errors = this.errorCache.splice(0);
    const payload = {
      errors: errors.map((error) => this.config?.transform(error)),
      stats: this.stats,
      timestamp: Date.now(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Node.js"
    };
    try {
      await this.sendReport(payload);
    } catch (error) {
      console.warn("Failed to send error report:", error);
      this.errorCache.unshift(...errors);
    }
  }
  /**
   * 发送报告
   */
  async sendReport(payload) {
    const response = await fetch(this.config?.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.config?.apiKey && { Authorization: `Bearer ${this.config?.apiKey}` }
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
  /**
   * 判断是否为开发环境
   */
  isDevelopment() {
    return process.env.NODE_ENV === "development" || typeof window !== "undefined" && window.location.hostname === "localhost";
  }
  /**
   * 添加错误监听器
   */
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  /**
   * 获取错误统计
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * 清除统计信息
   */
  clearStats() {
    this.stats = this.initStats();
  }
  /**
   * 获取缓存的错误
   */
  getCachedErrors() {
    return [...this.errorCache];
  }
  /**
   * 清除缓存
   */
  clearCache() {
    this.errorCache = [];
  }
  /**
   * 更新配置
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    this.startBatchReporting();
  }
  /**
   * 销毁报告器
   */
  destroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = void 0;
    }
    this.flushCache();
    this.listeners = [];
  }
}
let globalReporter = null;
function getGlobalErrorReporter() {
  return globalReporter;
}
function setGlobalErrorReporter(reporter) {
  globalReporter = reporter;
}
function createErrorReporter(config) {
  return new ErrorReporter(config);
}

export { ErrorReporter, createErrorReporter, getGlobalErrorReporter, setGlobalErrorReporter };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=ErrorReporter.js.map
