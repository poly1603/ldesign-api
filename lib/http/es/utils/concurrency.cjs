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

var dedupManager = require('./dedup-manager.cjs');
var requestDedup = require('./request-dedup.cjs');
var rateLimit = require('./rate-limit.cjs');

class s {
  constructor(t2 = {}) {
    this.activeRequests = /* @__PURE__ */ new Set(), this.requestQueue = [], this.requestCounter = 0, this.processingQueue = false, this.config = { maxConcurrent: t2.maxConcurrent ?? 10, maxQueueSize: t2.maxQueueSize ?? 100, deduplication: t2.deduplication ?? true }, this.deduplicationManager = new dedupManager.DeduplicationManager(), this.keyGenerator = new requestDedup.DeduplicationKeyGenerator({ includeMethod: true, includeUrl: true, includeParams: true, includeData: false });
  }
  async execute(e2, t2) {
    if (this.config?.deduplication) {
      const i2 = this.keyGenerator.generate(t2);
      return this.deduplicationManager.execute(i2, () => this.executeWithConcurrencyControl(e2, t2));
    }
    return this.executeWithConcurrencyControl(e2, t2);
  }
  async executeWithConcurrencyControl(e2, t2) {
    return new Promise((i2, a2) => {
      const n2 = { id: this.generateTaskId(), execute: e2, resolve: i2, reject: a2, config: t2 };
      this.requestQueue.length >= this.config?.maxQueueSize ? a2(new Error("Request queue is full")) : this.activeRequests.size < this.config?.maxConcurrent ? this.executeTask(n2) : this.requestQueue.push(n2);
    });
  }
  async executeTask(e2) {
    this.activeRequests.add(e2.id);
    try {
      const t2 = await e2.execute();
      e2.resolve(t2);
    } catch (t2) {
      e2.reject(t2);
    } finally {
      this.activeRequests.delete(e2.id), this.processQueue();
    }
  }
  processQueue() {
    if (!this.processingQueue) {
      this.processingQueue = true;
      try {
        for (; this.requestQueue.length > 0 && this.activeRequests.size < this.config?.maxConcurrent; ) {
          const e2 = this.requestQueue.shift();
          e2 && this.executeTask(e2);
        }
      } finally {
        this.processingQueue = false;
      }
    }
  }
  cancelQueue(e2 = "Queue cancelled") {
    this.requestQueue.splice(0).forEach((t2) => {
      t2.reject(new Error(e2));
    });
  }
  getStatus() {
    return { activeCount: this.activeRequests.size, queuedCount: this.requestQueue.length, maxConcurrent: this.config?.maxConcurrent, maxQueueSize: this.config?.maxQueueSize, deduplication: this.deduplicationManager.getStats() };
  }
  updateConfig(e2) {
    Object.assign(this.config, e2), this.processQueue();
  }
  getConfig() {
    return { ...this.config };
  }
  getDeduplicationStats() {
    return this.deduplicationManager.getStats();
  }
  resetDeduplicationStats() {
    this.deduplicationManager.resetStats();
  }
  isRequestDeduplicating(e2) {
    const t2 = this.keyGenerator.generate(e2);
    return this.deduplicationManager.isRunning(t2);
  }
  cancelDeduplicatedRequest(e2) {
    const t2 = this.keyGenerator.generate(e2);
    this.deduplicationManager.cancel(t2);
  }
  async waitForDeduplicatedRequest(e2) {
    const t2 = this.keyGenerator.generate(e2);
    return this.deduplicationManager.waitFor(t2);
  }
  getDeduplicationTasksInfo() {
    return this.deduplicationManager.getAllTaskInfo();
  }
  cleanupTimeoutDeduplicationTasks(e2 = 3e4) {
    return this.deduplicationManager.cleanupTimeoutTasks(e2);
  }
  configureDeduplicationKeyGenerator(e2) {
    this.keyGenerator = new requestDedup.DeduplicationKeyGenerator(e2);
  }
  generateTaskId() {
    return `task_${++this.requestCounter}_${Date.now()}`;
  }
}

exports.DeduplicationManager = dedupManager.DeduplicationManager;
exports.DeduplicationKeyGenerator = requestDedup.DeduplicationKeyGenerator;
exports.RateLimitManager = rateLimit.RateLimitManager;
exports.ConcurrencyManager = s;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=concurrency.cjs.map
