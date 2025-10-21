/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class e {
  constructor(e2 = {}) {
    this.pendingRequests = /* @__PURE__ */ new Map(), this.stats = { executions: 0, duplications: 0, savedRequests: 0 }, this.config = { maxPendingRequests: e2.maxPendingRequests ?? 1e3, cleanupInterval: e2.cleanupInterval ?? 3e4, requestTimeout: e2.requestTimeout ?? 6e4, autoCleanup: e2.autoCleanup ?? true }, this.config.autoCleanup && this.startAutoCleanup();
  }
  async execute(e2, t2) {
    if (this.pendingRequests.has(e2)) {
      const t3 = this.pendingRequests.get(e2);
      return t3.refCount++, this.stats.duplications++, this.stats.savedRequests++, t3.promise;
    }
    this.pendingRequests.size >= this.config.maxPendingRequests && this.cleanupOldestRequest();
    const s2 = t2().finally(() => {
      this.pendingRequests.delete(e2);
    }), n = { promise: s2, createdAt: Date.now(), refCount: 1, key: e2 };
    return this.pendingRequests.set(e2, n), this.stats.executions++, s2;
  }
  startAutoCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupTimeoutTasks(this.config.requestTimeout);
    }, this.config.cleanupInterval);
  }
  stopAutoCleanup() {
    this.cleanupTimer && (clearInterval(this.cleanupTimer), this.cleanupTimer = void 0);
  }
  cleanupOldestRequest() {
    let e2 = null, t2 = Number.POSITIVE_INFINITY;
    for (const [s2, n] of this.pendingRequests) n.createdAt < t2 && (t2 = n.createdAt, e2 = s2);
    e2 && this.pendingRequests.delete(e2);
  }
  cleanupTimeoutTasks(e2) {
    const t2 = Date.now();
    let s2 = 0;
    for (const [n, i] of this.pendingRequests) t2 - i.createdAt > e2 && (this.pendingRequests.delete(n), s2++);
    return s2;
  }
  cancel(e2) {
    return this.pendingRequests.delete(e2);
  }
  cancelAll() {
    this.pendingRequests.clear();
  }
  isRunning(e2) {
    return this.pendingRequests.has(e2);
  }
  async waitFor(e2) {
    const t2 = this.pendingRequests.get(e2);
    if (!t2) return null;
    try {
      return await t2.promise;
    } catch {
      return null;
    }
  }
  async waitForAll() {
    const e2 = Array.from(this.pendingRequests.values()).map((e3) => e3.promise.catch(() => {
    }));
    await Promise.all(e2);
  }
  getTaskInfo(e2) {
    const t2 = this.pendingRequests.get(e2);
    return t2 ? { key: t2.key, createdAt: t2.createdAt, refCount: t2.refCount, duration: Date.now() - t2.createdAt } : null;
  }
  getAllTaskInfo() {
    return Array.from(this.pendingRequests.values()).map((e2) => ({ key: e2.key, createdAt: e2.createdAt, refCount: e2.refCount, duration: Date.now() - e2.createdAt }));
  }
  getStats() {
    const e2 = this.stats.executions + this.stats.duplications;
    return { executions: this.stats.executions, duplications: this.stats.duplications, savedRequests: this.stats.savedRequests, deduplicationRate: e2 > 0 ? this.stats.duplications / e2 : 0, pendingCount: this.pendingRequests.size };
  }
  resetStats() {
    this.stats = { executions: 0, duplications: 0, savedRequests: 0 };
  }
  getPendingCount() {
    return this.pendingRequests.size;
  }
  getPendingKeys() {
    return Array.from(this.pendingRequests.keys());
  }
  getMostReferencedTask() {
    let e2 = 0, t2 = "";
    for (const [s2, n] of this.pendingRequests) n.refCount > e2 && (e2 = n.refCount, t2 = s2);
    return e2 > 0 ? { key: t2, refCount: e2 } : null;
  }
  getLongestRunningTask() {
    let e2 = 0, t2 = "";
    const s2 = Date.now();
    for (const [n, i] of this.pendingRequests) {
      const a = s2 - i.createdAt;
      a > e2 && (e2 = a, t2 = n);
    }
    return e2 > 0 ? { key: t2, duration: e2 } : null;
  }
  updateConfig(e2) {
    Object.assign(this.config, e2), void 0 !== e2.autoCleanup && (e2.autoCleanup && !this.cleanupTimer ? this.startAutoCleanup() : !e2.autoCleanup && this.cleanupTimer && this.stopAutoCleanup());
  }
  destroy() {
    this.stopAutoCleanup(), this.pendingRequests.clear(), this.resetStats();
  }
}
new e();

export { e as DeduplicationManager };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=dedup-manager.js.map
