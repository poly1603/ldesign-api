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

class t {
  constructor(t2 = {}) {
    this.metrics = [], this.metricsIndex = 0, this.requestMap = /* @__PURE__ */ new Map(), this.statsCacheTime = 0, this.statsCacheTTL = 1e3, this.sampleCounter = 0, this.config = { enabled: true, maxMetrics: 1e3, slowRequestThreshold: 3e3, samplingRate: 1, enableSampling: false, onSlowRequest: () => {
    }, onError: () => {
    }, onMetricsUpdate: () => {
    }, ...t2 };
  }
  shouldSample() {
    return !this.config?.enableSampling || (this.sampleCounter++, Math.random() < this.config?.samplingRate);
  }
  startRequest(t2, e2) {
    !this.config?.enabled || !this.shouldSample() || this.requestMap.set(t2, { startTime: Date.now(), retries: 0 });
  }
  endRequest(t2, e2, s2, i) {
    if (!this.config?.enabled) return;
    const r = this.requestMap.get(t2);
    if (!r) return;
    const a = Date.now(), n = a - r.startTime, o = { requestId: t2, url: e2.url || "", method: e2.method || "GET", startTime: r.startTime, endTime: a, duration: n, status: s2?.status, size: this.getResponseSize(s2), cached: false, retries: r.retries, error: i, timestamp: a };
    this.addMetrics(o), this.requestMap.delete(t2), this.invalidateStatsCache(), n > this.config?.slowRequestThreshold && this.config?.onSlowRequest(o), i && this.config?.onError(o), this.config?.onMetricsUpdate(this.metrics);
  }
  recordRetry(t2) {
    const e2 = this.requestMap.get(t2);
    e2 && e2.retries++;
  }
  markCached(t2) {
    const e2 = this.metrics.find((e3) => e3.requestId === t2);
    e2 && (e2.cached = true);
  }
  addMetrics(t2) {
    this.metrics.length < this.config?.maxMetrics ? this.metrics.push(t2) : (this.metrics[this.metricsIndex] = t2, this.metricsIndex = (this.metricsIndex + 1) % this.config?.maxMetrics);
  }
  getResponseSize(t2) {
    return t2?.data ? t2.data instanceof Blob ? t2.data.size : "string" == typeof t2.data ? new Blob([t2.data]).size : "object" == typeof t2.data ? new Blob([JSON.stringify(t2.data)]).size : 0 : 0;
  }
  getStats() {
    const t2 = Date.now();
    if (this.statsCache && t2 - this.statsCacheTime < this.statsCacheTTL) return { ...this.statsCache };
    const e2 = this.calculateStats();
    return this.statsCache = e2, this.statsCacheTime = t2, { ...e2 };
  }
  calculateStats() {
    const t2 = this.metrics.length;
    if (0 === t2) return { totalRequests: 0, successfulRequests: 0, failedRequests: 0, cachedRequests: 0, averageDuration: 0, averageResponseTime: 0, medianDuration: 0, p95Duration: 0, p99Duration: 0, slowRequests: 0, totalDataTransferred: 0, requestsByMethod: {}, requestsByStatus: {}, errorRate: 0, cacheHitRate: 0 };
    let e2 = 0, s2 = 0, i = 0, r = 0, a = 0, n = 0;
    const o = /* @__PURE__ */ Object.create(null), c = /* @__PURE__ */ Object.create(null), h = Array.from({ length: t2 }, () => 0), u = this.config?.slowRequestThreshold;
    let l = 0;
    for (const t3 of this.metrics) {
      const d = t3.duration;
      h[l++] = d, a += d, n += t3.size || 0, s2 += t3.error ? 1 : 0, e2 += t3.error ? 0 : 1, i += t3.cached ? 1 : 0, r += d > u ? 1 : 0, o[t3.method] = (o[t3.method] || 0) + 1, t3.status && (c[t3.status] = (c[t3.status] || 0) + 1);
    }
    return t2 < 100 ? this.insertionSort(h) : h.sort((t3, e3) => t3 - e3), { totalRequests: t2, successfulRequests: e2, failedRequests: s2, cachedRequests: i, averageDuration: a / t2, averageResponseTime: a / t2, medianDuration: this.getPercentile(h, 50), p95Duration: this.getPercentile(h, 95), p99Duration: this.getPercentile(h, 99), slowRequests: r, totalDataTransferred: n, requestsByMethod: o, requestsByStatus: c, errorRate: s2 / t2, cacheHitRate: i / t2 };
  }
  insertionSort(t2) {
    for (let e2 = 1; e2 < t2.length; e2++) {
      const s2 = t2[e2];
      let i = e2 - 1;
      for (; i >= 0 && t2[i] > s2; ) t2[i + 1] = t2[i], i--;
      t2[i + 1] = s2;
    }
  }
  invalidateStatsCache() {
    this.statsCache = void 0;
  }
  getPercentile(t2, e2) {
    if (0 === t2.length) return 0;
    const s2 = Math.ceil(e2 / 100 * t2.length) - 1;
    return t2[Math.max(0, s2)];
  }
  getRecentMetrics(t2 = 10) {
    return this.metrics.slice(-t2);
  }
  getSlowRequests() {
    return this.metrics.filter((t2) => t2.duration > this.config?.slowRequestThreshold);
  }
  getFailedRequests() {
    return this.metrics.filter((t2) => t2.error);
  }
  clear() {
    this.metrics = [], this.requestMap.clear();
  }
  exportMetrics() {
    return [...this.metrics];
  }
  enable() {
    this.config && (this.config.enabled = true);
  }
  disable() {
    this.config && (this.config.enabled = false);
  }
  setSlowRequestThreshold(t2) {
    this.config && (this.config.slowRequestThreshold = t2);
  }
  getMetrics() {
    return [...this.metrics];
  }
  isEnabled() {
    return this.config?.enabled;
  }
}
function e(e2) {
  return new t(e2);
}
e();

exports.RequestMonitor = t;
exports.createRequestMonitor = e;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=monitor.cjs.map
