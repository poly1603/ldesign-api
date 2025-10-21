/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import e from 'node:process';
import { logger as t } from '../utils/logger.js';

class o {
  constructor(t2 = {}) {
    this.records = [], this.client = null, this.interceptorIds = null, this.config = { enabled: t2.enabled ?? "production" !== e.env.NODE_ENV, maxRecords: t2.maxRecords ?? 100, showConsole: t2.showConsole ?? true, logToConsole: t2.logToConsole ?? true, performanceThreshold: t2.performanceThreshold ?? 1e3 }, typeof window < "u" && this.config?.enabled && (window.__HTTP_DEVTOOLS__ = this);
  }
  attach(e2) {
    if (!this.config?.enabled || this.client) return;
    this.client = e2;
    const o2 = e2.addRequestInterceptor((e3) => (this.onRequestStart(e3), e3)), s2 = e2.addResponseInterceptor((e3) => (this.onRequestSuccess(e3), e3), (e3) => {
      throw this.onRequestError(e3), e3;
    });
    this.interceptorIds = { request: o2, response: s2, error: -1 }, this.config?.logToConsole && t.info("DevTools attached to HTTP client");
  }
  detach() {
    !this.client || !this.interceptorIds || (this.client.removeRequestInterceptor(this.interceptorIds.request), this.client.removeResponseInterceptor(this.interceptorIds.response), this.client = null, this.interceptorIds = null, this.config?.logToConsole && t.info("DevTools detached from HTTP client"));
  }
  onRequestStart(e2) {
    const o2 = this.generateId(), s2 = { id: o2, timestamp: Date.now(), config: e2, status: "pending" };
    e2.__devtools_id__ = o2, this.addRecord(s2), this.config?.logToConsole && (t.group(`\u27A1\uFE0F ${e2.method?.toUpperCase()} ${e2.url}`), t.debug("Config:", e2), t.groupEnd());
  }
  onRequestSuccess(e2) {
    const o2 = e2.config.__devtools_id__;
    if (!o2) return;
    const s2 = this.findRecord(o2);
    if (s2 && (s2.duration = Date.now() - s2.timestamp, s2.response = e2, s2.status = "success", this.config?.logToConsole)) {
      const o3 = s2.duration > this.config?.performanceThreshold, r2 = o3 ? "\u{1F40C}" : "\u2705";
      t.group(`${r2} ${e2.config.method?.toUpperCase()} ${e2.config.url} (${s2.duration}ms)`), t.debug("Status:", e2.status), t.debug("Data:", e2.data), o3 && t.warn(`\u6162\u8BF7\u6C42\u8B66\u544A: \u8017\u65F6 ${s2.duration}ms`), t.groupEnd();
    }
  }
  onRequestError(e2) {
    const o2 = e2.config.__devtools_id__;
    if (!o2) return;
    const s2 = this.findRecord(o2);
    s2 && (s2.duration = Date.now() - s2.timestamp, s2.error = e2, s2.status = "error", this.config?.logToConsole && (t.group(`\u274C ${e2.config?.method?.toUpperCase()} ${e2.config?.url} (${s2.duration}ms)`), t.error("Error:", e2.message), t.error("Details:", e2), t.groupEnd()));
  }
  addRecord(e2) {
    this.records.unshift(e2), this.records.length > this.config?.maxRecords && (this.records = this.records.slice(0, this.config?.maxRecords));
  }
  findRecord(e2) {
    return this.records.find((t2) => t2.id === e2);
  }
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  getRecords() {
    return [...this.records];
  }
  getFailedRequests() {
    return this.records.filter((e2) => "error" === e2.status);
  }
  getSlowRequests() {
    return this.records.filter((e2) => e2.duration && e2.duration > this.config?.performanceThreshold);
  }
  getStats() {
    const e2 = { total: this.records.length, pending: 0, success: 0, error: 0, cancelled: 0, averageDuration: 0, slowRequests: 0 };
    let t2 = 0, o2 = 0;
    return this.records.forEach((s2) => {
      e2[s2.status]++, s2.duration && (t2 += s2.duration, o2++, s2.duration > this.config?.performanceThreshold && e2.slowRequests++);
    }), o2 > 0 && (e2.averageDuration = Math.round(t2 / o2)), e2;
  }
  clear() {
    this.records = [], this.config?.logToConsole && t.info("DevTools records cleared");
  }
  export() {
    const e2 = { records: this.records, stats: this.getStats(), exportedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return JSON.stringify(e2, null, 2);
  }
  download() {
    if (typeof window > "u") return void t.warn("Download is only available in browser");
    const e2 = this.export(), o2 = new Blob([e2], { type: "application/json" }), s2 = URL.createObjectURL(o2), r2 = document.createElement("a");
    r2.href = s2, r2.download = `http-devtools-${Date.now()}.json`, r2.click(), URL.revokeObjectURL(s2), t.info("DevTools data exported");
  }
  printStats() {
    this.getStats();
  }
}
const r = new o();
typeof window < "u" && (window.httpDevTools = { getRecords: () => r.getRecords(), getStats: () => r.getStats(), printStats: () => r.printStats(), clear: () => r.clear(), export: () => r.download() });

export { o as HttpDevTools, r as globalDevTools };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
