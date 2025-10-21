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

exports.Priority = void 0; var e;
(e = exports.Priority || (exports.Priority = {}))[e.CRITICAL = 0] = "CRITICAL", e[e.HIGH = 1] = "HIGH", e[e.NORMAL = 2] = "NORMAL", e[e.LOW = 3] = "LOW", e[e.IDLE = 4] = "IDLE";
class s {
  constructor(e2 = {}) {
    this.queue = /* @__PURE__ */ new Map(), this.active = /* @__PURE__ */ new Set(), this.stats = { totalQueued: 0, totalProcessed: 0, totalFailed: 0, waitTimes: [], processTimes: [] }, this.processing = false, this.lastBoostCheck = 0, this.cachedQueueSize = 0, this.queueSizeDirty = true, this.config = { maxConcurrent: 6, maxQueueSize: 100, queueTimeout: 3e4, priorityBoost: true, boostInterval: 5e3, ...e2 };
    for (const e3 of Object.values(exports.Priority)) "number" == typeof e3 && this.queue.set(e3, []);
    this.config?.priorityBoost && this.startPriorityBoost();
  }
  async enqueue(e2, s2, i2 = exports.Priority.NORMAL) {
    return new Promise((t2, o2) => {
      if (this.getTotalQueueSize() >= this.config?.maxQueueSize) return void o2(new Error("Queue is full"));
      const r = { id: this.generateId(), priority: i2, config: e2, executor: s2, resolve: t2, reject: o2, timestamp: Date.now(), abortController: new AbortController() }, n = this.queue.get(i2);
      n && (n.push(r), this.stats.totalQueued++, this.queueSizeDirty = true), this.config?.queueTimeout > 0 && setTimeout(() => {
        this.removeItem(r) && (r.reject(new Error("Request timeout in queue")), this.stats.totalFailed++);
      }, this.config?.queueTimeout), this.processQueue();
    });
  }
  async processQueue() {
    if (!this.processing) {
      for (this.processing = true; this.active.size < this.config?.maxConcurrent; ) {
        const t2 = this.getNextItem();
        if (!t2) break;
        this.active.add(t2.id), this.executeItem(t2);
      }
      this.processing = false;
    }
  }
  async executeItem(t2) {
    const e2 = Date.now() - t2.timestamp;
    this.stats.waitTimes.push(e2);
    const s2 = Date.now();
    try {
      const e3 = await t2.executor();
      t2.resolve(e3), this.stats.totalProcessed++;
      const i2 = Date.now() - s2;
      this.stats.processTimes.push(i2);
    } catch (e3) {
      t2.reject(e3), this.stats.totalFailed++;
    } finally {
      this.active.delete(t2.id), this.processQueue();
    }
  }
  getNextItem() {
    for (const e2 of [exports.Priority.CRITICAL, exports.Priority.HIGH, exports.Priority.NORMAL, exports.Priority.LOW, exports.Priority.IDLE]) {
      const t2 = this.queue.get(e2);
      if (t2 && t2.length > 0) return t2.shift();
    }
  }
  removeItem(t2) {
    const e2 = this.queue.get(t2.priority);
    if (!e2) return false;
    const s2 = e2.findIndex((e3) => e3.id === t2.id);
    return -1 !== s2 && (e2.splice(s2, 1), true);
  }
  startPriorityBoost() {
    this.boostTimer = setInterval(() => {
      if (0 === this.getTotalQueueSize()) return;
      const t2 = Date.now();
      t2 - this.lastBoostCheck < this.config?.boostInterval / 2 || (this.lastBoostCheck = t2, this.performPriorityBoost(t2));
    }, 2e3);
  }
  performPriorityBoost(e2) {
    const s2 = [];
    for (const [i2, o2] of this.queue.entries()) {
      if (i2 === exports.Priority.CRITICAL || 0 === o2.length) continue;
      const r = this.config?.boostInterval;
      for (let n = 0; n < o2.length; n++) {
        const u = o2[n];
        if (e2 - u.timestamp > r) {
          const e3 = Math.max(exports.Priority.CRITICAL, i2 - 1);
          s2.push({ item: u, from: i2, to: e3 });
        }
      }
    }
    for (const t2 of s2) {
      const e3 = this.queue.get(t2.from);
      if (e3) {
        const s4 = e3.indexOf(t2.item);
        -1 !== s4 && (e3.splice(s4, 1), this.queueSizeDirty = true);
      }
      t2.item.priority = t2.to;
      const s3 = this.queue.get(t2.to);
      s3 && s3.push(t2.item);
    }
  }
  cancel(t2) {
    for (const [, e2] of this.queue.entries()) {
      const s2 = e2.findIndex((e3) => e3.id === t2);
      if (-1 !== s2) {
        const t3 = e2[s2];
        return e2.splice(s2, 1), t3.reject(new Error("Request cancelled")), t3.abortController?.abort(), true;
      }
    }
    return this.active.has(t2), false;
  }
  cancelAll(t2 = "All requests cancelled") {
    for (const [, e2] of this.queue.entries()) {
      for (const s2 of e2) s2.reject(new Error(t2)), s2.abortController?.abort();
      e2.length = 0;
    }
  }
  getStats() {
    const t2 = {};
    for (const [e3, s3] of this.queue.entries()) t2[e3] = s3.length;
    const e2 = this.stats.waitTimes.length > 0 ? this.stats.waitTimes.reduce((t3, e3) => t3 + e3, 0) / this.stats.waitTimes.length : 0, s2 = this.stats.processTimes.length > 0 ? this.stats.processTimes.reduce((t3, e3) => t3 + e3, 0) / this.stats.processTimes.length : 0;
    return { totalQueued: this.stats.totalQueued, totalProcessed: this.stats.totalProcessed, totalFailed: this.stats.totalFailed, currentActive: this.active.size, queuedByPriority: t2, averageWaitTime: e2, averageProcessTime: s2 };
  }
  getTotalQueueSize() {
    if (!this.queueSizeDirty) return this.cachedQueueSize;
    let t2 = 0;
    for (const [, e2] of this.queue.entries()) t2 += e2.length;
    return this.cachedQueueSize = t2, this.queueSizeDirty = false, t2;
  }
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  destroy() {
    this.boostTimer && clearInterval(this.boostTimer), this.cancelAll("Queue destroyed"), this.queue.clear(), this.active.clear();
  }
}
function o(e2) {
  if (void 0 !== e2.priority) return e2.priority;
  const s2 = e2.url || "";
  return s2.includes("/auth") || s2.includes("/login") || s2.includes("/token") ? exports.Priority.CRITICAL : s2.includes("/api") ? exports.Priority.HIGH : s2.match(/\.(jpg|jpeg|png|gif|css|js)$/i) ? exports.Priority.LOW : s2.includes("/analytics") || s2.includes("/log") ? exports.Priority.IDLE : exports.Priority.NORMAL;
}

exports.PriorityQueue = s;
exports.determinePriority = o;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=priority.cjs.map
