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

class RequestThrottler {
  constructor(config = {}) {
    this.pendingQueue = [];
    this.stats = {
      totalRequests: 0,
      throttledRequests: 0
    };
    this.refillTimer = null;
    this.config = {
      enabled: true,
      requestsPerSecond: 10,
      maxBurst: 20,
      refillRate: 100,
      ...config
    };
    this.tokens = this.config?.maxBurst;
    this.lastRefillTime = Date.now();
    this.startRefillTimer();
  }
  /**
   * 获取执行权限（消耗一个令牌）
   */
  async acquire() {
    if (!this.config?.enabled) {
      return Promise.resolve();
    }
    this.stats.totalRequests++;
    if (this.tokens >= 1) {
      this.tokens--;
      return Promise.resolve();
    }
    this.stats.throttledRequests++;
    return new Promise((resolve, reject) => {
      this.pendingQueue.push({
        resolve,
        reject,
        timestamp: Date.now()
      });
    });
  }
  /**
   * 执行带节流的函数
   */
  async execute(fn) {
    await this.acquire();
    return fn();
  }
  /**
   * 补充令牌
   */
  refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefillTime;
    const tokensToAdd = timePassed / 1e3 * this.config?.requestsPerSecond;
    this.tokens = Math.min(this.config?.maxBurst, this.tokens + tokensToAdd);
    this.lastRefillTime = now;
    this.processPendingQueue();
  }
  /**
   * 处理等待队列
   */
  processPendingQueue() {
    while (this.pendingQueue.length > 0 && this.tokens >= 1) {
      const item = this.pendingQueue.shift();
      if (item) {
        this.tokens--;
        item.resolve();
      }
    }
  }
  /**
   * 启动令牌补充定时器
   */
  startRefillTimer() {
    if (this.refillTimer) {
      clearInterval(this.refillTimer);
    }
    this.refillTimer = setInterval(() => {
      this.refill();
    }, this.config?.refillRate);
  }
  /**
   * 获取当前统计信息
   */
  getStats() {
    return {
      currentTokens: Math.floor(this.tokens),
      maxTokens: this.config?.maxBurst,
      totalRequests: this.stats.totalRequests,
      throttledRequests: this.stats.throttledRequests,
      pendingRequests: this.pendingQueue.length
    };
  }
  /**
   * 重置节流器
   */
  reset() {
    this.tokens = this.config?.maxBurst;
    this.lastRefillTime = Date.now();
    this.stats.totalRequests = 0;
    this.stats.throttledRequests = 0;
    while (this.pendingQueue.length > 0) {
      const item = this.pendingQueue.shift();
      if (item) {
        item.reject(new Error("Throttler reset"));
      }
    }
  }
  /**
   * 更新配置
   */
  updateConfig(config) {
    Object.assign(this.config, config);
    if (config.requestsPerSecond !== void 0 || config.refillRate !== void 0) {
      this.startRefillTimer();
    }
    if (config.maxBurst !== void 0 && this.tokens > config.maxBurst) {
      this.tokens = config.maxBurst;
    }
  }
  /**
   * 清理等待队列中超时的请求
   */
  clearStaleRequests(timeout = 3e4) {
    const now = Date.now();
    const validRequests = this.pendingQueue.filter((item) => {
      if (now - item.timestamp > timeout) {
        item.reject(new Error("Request timeout in throttle queue"));
        return false;
      }
      return true;
    });
    this.pendingQueue = validRequests;
  }
  /**
   * 销毁节流器
   */
  destroy() {
    if (this.refillTimer) {
      clearInterval(this.refillTimer);
      this.refillTimer = null;
    }
    while (this.pendingQueue.length > 0) {
      const item = this.pendingQueue.shift();
      if (item) {
        item.reject(new Error("Throttler destroyed"));
      }
    }
  }
}
function createRequestThrottler(config) {
  return new RequestThrottler(config);
}

exports.RequestThrottler = RequestThrottler;
exports.createRequestThrottler = createRequestThrottler;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=RequestThrottler.cjs.map
