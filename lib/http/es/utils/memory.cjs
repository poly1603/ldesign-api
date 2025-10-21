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

var e = require('node:process');

class t {
  constructor(e2 = {}) {
    this.usageHistory = [], this.stats = { current: { used: 0, total: 0, percentage: 0, timestamp: Date.now() }, peak: { used: 0, total: 0, percentage: 0, timestamp: Date.now() }, average: 0, warningCount: 0, dangerCount: 0, cleanupCount: 0 }, this.config = { enabled: e2.enabled ?? true, interval: e2.interval ?? 1e4, warningThreshold: e2.warningThreshold ?? 100, dangerThreshold: e2.dangerThreshold ?? 200, autoCleanup: e2.autoCleanup ?? true, onCleanup: e2.onCleanup, onWarning: e2.onWarning, onDanger: e2.onDanger }, this.config?.enabled && this.start();
  }
  start() {
    this.monitorTimer || (this.monitorTimer = setInterval(() => {
      this.check();
    }, this.config?.interval), this.check());
  }
  stop() {
    this.monitorTimer && (clearInterval(this.monitorTimer), this.monitorTimer = void 0);
  }
  check() {
    const e2 = this.getMemoryUsage();
    this.stats.current = e2, e2.used > this.stats.peak.used && (this.stats.peak = e2), this.usageHistory.push(e2), this.usageHistory.length > 100 && this.usageHistory.shift(), this.stats.average = this.usageHistory.reduce((e3, t2) => e3 + t2.used, 0) / this.usageHistory.length, e2.used >= this.config?.dangerThreshold ? (this.stats.dangerCount++, this.config?.onDanger?.(e2), this.config?.autoCleanup && this.cleanup()) : e2.used >= this.config?.warningThreshold && (this.stats.warningCount++, this.config?.onWarning?.(e2));
  }
  getMemoryUsage() {
    let t2 = 0, s2 = 0;
    if (typeof performance < "u" && performance.memory) {
      const e2 = performance.memory;
      t2 = e2.usedJSHeapSize / 1024 / 1024, s2 = e2.totalJSHeapSize / 1024 / 1024;
    } else if (typeof e < "u" && e.memoryUsage) {
      const a2 = e.memoryUsage();
      t2 = a2.heapUsed / 1024 / 1024, s2 = a2.heapTotal / 1024 / 1024;
    }
    return { used: t2, total: s2, percentage: s2 > 0 ? t2 / s2 * 100 : 0, timestamp: Date.now() };
  }
  cleanup() {
    if (this.stats.cleanupCount++, this.config?.onCleanup?.(), typeof globalThis < "u" && globalThis.gc) try {
      globalThis.gc();
    } catch {
    }
  }
  getStats() {
    return { ...this.stats };
  }
  getHistory() {
    return [...this.usageHistory];
  }
  resetStats() {
    this.stats = { current: this.stats.current, peak: { used: 0, total: 0, percentage: 0, timestamp: Date.now() }, average: 0, warningCount: 0, dangerCount: 0, cleanupCount: 0 }, this.usageHistory = [];
  }
  destroy() {
    this.stop(), this.usageHistory = [];
  }
}
function s(e2) {
  return new t(e2);
}
s({ enabled: false });

exports.MemoryMonitor = t;
exports.createMemoryMonitor = s;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=memory.cjs.map
