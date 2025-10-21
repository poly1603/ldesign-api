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

var manager = require('./interceptors/manager.cjs');
var index = require('./utils/index.cjs');
var cache = require('./utils/cache.cjs');
var cancel = require('./utils/cancel.cjs');
var concurrency = require('./utils/concurrency.cjs');
var download = require('./utils/download.cjs');
var error = require('./utils/error.cjs');
var monitor = require('./utils/monitor.cjs');
var pool = require('./utils/pool.cjs');
var priority = require('./utils/priority.cjs');
var upload = require('./utils/upload.cjs');

class w {
  constructor(t2 = {}, a2) {
    if (this.isDestroyed = false, this.config = { timeout: 1e4, headers: { "Content-Type": "application/json", ...t2.headers }, ...t2 }, !a2) throw new Error("HTTP adapter is required");
    this.adapter = a2, this.retryManager = new error.RetryManager(t2.retry), this.cancelManager = cancel.globalCancelManager, this.cacheManager = new cache.CacheManager(t2.cache), this.concurrencyManager = new concurrency.ConcurrencyManager(t2.concurrency), this.monitor = new monitor.RequestMonitor(t2.monitor), this.priorityQueue = new priority.PriorityQueue(t2.priorityQueue), this.requestPool = new pool.RequestPool(t2.connectionPool), this.interceptors = { request: new manager.InterceptorManagerImpl(), response: new manager.InterceptorManagerImpl(), error: new manager.InterceptorManagerImpl() };
  }
  async request(e2) {
    this.checkDestroyed();
    const r2 = this.optimizedMergeConfig(e2), s2 = index.generateId();
    this.monitor.startRequest(s2, r2);
    const o2 = priority.determinePriority(r2);
    if (void 0 !== o2 && this.priorityQueue) return this.priorityQueue.enqueue(r2, async () => {
      try {
        const e3 = await this.executeRequestWithRetry(r2, s2);
        return this.monitor.endRequest(s2, r2, e3), e3;
      } catch (e3) {
        throw this.monitor.endRequest(s2, r2, void 0, e3), e3;
      }
    }, o2);
    try {
      const e3 = await this.executeRequestWithRetry(r2, s2);
      return this.monitor.endRequest(s2, r2, e3), e3;
    } catch (e3) {
      throw this.monitor.endRequest(s2, r2, void 0, e3), e3;
    }
  }
  async executeRequestWithRetry(e2, t2) {
    const r2 = e2.retry;
    return r2?.retries && r2.retries > 0 ? this.retryManager.executeWithRetry(() => (this.monitor.recordRetry(t2), this.executeRequest(e2)), e2) : this.executeRequest(e2);
  }
  async executeRequest(e2) {
    return await this.cacheManager.get(e2) || this.concurrencyManager.execute(() => this.performRequest(e2), e2);
  }
  async performRequest(e2) {
    let t2 = null;
    try {
      t2 = await this.processRequestInterceptors(e2);
      let r2 = await this.adapter.request(t2);
      return r2 = await this.processResponseInterceptors(r2), await this.cacheManager.set(t2, r2), r2;
    } catch (e3) {
      throw await this.processErrorInterceptors(e3);
    }
  }
  get(e2, t2 = {}) {
    return this.request({ ...t2, method: "GET", url: e2 });
  }
  post(e2, t2, r2 = {}) {
    return this.request({ ...r2, method: "POST", url: e2, data: t2 });
  }
  put(e2, t2, r2 = {}) {
    return this.request({ ...r2, method: "PUT", url: e2, data: t2 });
  }
  delete(e2, t2 = {}) {
    return this.request({ ...t2, method: "DELETE", url: e2 });
  }
  patch(e2, t2, r2 = {}) {
    return this.request({ ...r2, method: "PATCH", url: e2, data: t2 });
  }
  head(e2, t2 = {}) {
    return this.request({ ...t2, method: "HEAD", url: e2 });
  }
  options(e2, t2 = {}) {
    return this.request({ ...t2, method: "OPTIONS", url: e2 });
  }
  cancelAll(e2) {
    this.cancelManager.cancelAll(e2);
  }
  getActiveRequestCount() {
    return this.cancelManager.getActiveRequestCount();
  }
  updateRetryConfig(e2) {
    this.retryManager.updateConfig(e2);
  }
  setConfig(e2) {
    this.config = { ...this.config, ...e2, headers: { ...this.config?.headers, ...e2.headers } };
  }
  getConfig() {
    return { ...this.config };
  }
  addRequestInterceptor(e2, t2) {
    return this.interceptors.request.use(e2, t2);
  }
  addResponseInterceptor(e2, t2) {
    return this.interceptors.response.use(e2, t2);
  }
  removeRequestInterceptor(e2) {
    this.interceptors.request.eject(e2);
  }
  removeResponseInterceptor(e2) {
    this.interceptors.response.eject(e2);
  }
  clearCache() {
    return this.cacheManager.clear();
  }
  getConcurrencyStatus() {
    return this.concurrencyManager.getStatus();
  }
  cancelQueue(e2) {
    this.concurrencyManager.cancelQueue(e2);
  }
  async processRequestInterceptors(e2) {
    let t2 = e2;
    const r2 = this.interceptors.request.getInterceptors();
    for (const e3 of r2) try {
      t2 = await e3.fulfilled(t2);
    } catch (t3) {
      throw e3.rejected ? await e3.rejected(t3) : t3;
    }
    return t2;
  }
  async processResponseInterceptors(e2) {
    let t2 = e2;
    const r2 = this.interceptors.response.getInterceptors();
    for (const e3 of r2) try {
      t2 = await e3.fulfilled(t2);
    } catch (t3) {
      throw e3.rejected ? await e3.rejected(t3) : t3;
    }
    return t2;
  }
  async processErrorInterceptors(e2) {
    let t2 = e2;
    const r2 = this.interceptors.error.getInterceptors();
    for (const e3 of r2) try {
      t2 = await e3.fulfilled(t2);
    } catch (e4) {
      t2 = e4;
    }
    return t2;
  }
  optimizedMergeConfig(e2) {
    if (!e2 || 0 === Object.keys(e2).length) return { ...this.config };
    const t2 = { ...this.config, ...e2 };
    return this.config?.headers && e2.headers && (t2.headers = { ...this.config.headers, ...e2.headers }), this.config?.params && e2.params && (t2.params = { ...this.config.params, ...e2.params }), t2;
  }
  async upload(e2, t2, r2 = {}) {
    this.checkDestroyed();
    const s2 = Array.isArray(t2) ? t2 : [t2];
    return 1 === s2.length ? this.uploadSingleFile(e2, s2[0], r2) : this.uploadMultipleFiles(e2, s2, r2);
  }
  async uploadSingleFile(e2, t2, r2) {
    upload.validateFile(t2, r2);
    const s2 = Date.now(), o2 = new upload.ProgressCalculator(), a2 = { method: "POST", url: e2, data: upload.createUploadFormData(t2, r2), headers: { ...r2.headers || {} }, ...r2 || {}, onUploadProgress: r2.onProgress ? (e3) => {
      const s3 = o2.calculate(e3.loaded, e3.total || 0, t2);
      r2.onProgress?.(s3);
    } : void 0 };
    return { ...await this.request(a2), file: t2, duration: Date.now() - s2 };
  }
  async uploadMultipleFiles(e2, t2, r2) {
    t2.forEach((e3) => upload.validateFile(e3, r2));
    const s2 = Date.now(), o2 = new upload.ProgressCalculator(), a2 = new FormData(), n2 = r2.fileField || "files";
    t2.forEach((e3, t3) => {
      a2.append(`${n2}[${t3}]`, e3);
    }), r2.formData && Object.entries(r2.formData).forEach(([e3, t3]) => {
      a2.append(e3, t3);
    });
    const i2 = { method: "POST", url: e2, data: a2, headers: { ...r2.headers || {} }, ...r2 || {}, onUploadProgress: r2.onProgress ? (e3) => {
      const t3 = o2.calculate(e3.loaded, e3.total || 0);
      r2.onProgress?.(t3);
    } : void 0 };
    return { ...await this.request(i2), file: t2[0], duration: Date.now() - s2 };
  }
  async download(e2, t2 = {}) {
    this.checkDestroyed();
    const r2 = Date.now(), s2 = new download.DownloadProgressCalculator(), o2 = { method: "GET", url: e2, responseType: "blob", ...t2 || {}, onDownloadProgress: t2.onProgress ? (e3) => {
      const r3 = s2.calculate(e3.loaded, e3.total || 0, t2.filename);
      t2.onProgress?.(r3);
    } : void 0 }, h2 = await this.request(o2);
    let l2 = t2.filename;
    l2 || (l2 = download.getFilenameFromResponse(h2.headers) || download.getFilenameFromURL(h2.config.url || e2) || "download");
    const d2 = h2.data?.type || download.getMimeTypeFromFilename(l2);
    let p2;
    return false !== t2.autoSave && typeof window < "u" && (download.saveFileToLocal(h2.data, l2), p2 = URL.createObjectURL(h2.data)), { data: h2.data, filename: l2, size: h2.data.size, type: d2, duration: Date.now() - r2, url: p2 };
  }
  getPerformanceStats() {
    return this.monitor.getStats();
  }
  getRecentMetrics(e2) {
    return this.monitor.getRecentMetrics(e2);
  }
  getSlowRequests() {
    return this.monitor.getSlowRequests();
  }
  getFailedRequests() {
    return this.monitor.getFailedRequests();
  }
  enableMonitoring() {
    this.monitor.enable();
  }
  disableMonitoring() {
    this.monitor.disable();
  }
  getPriorityQueueStats() {
    return this.priorityQueue.getStats();
  }
  getConnectionPoolStats() {
    return this.requestPool.getStats();
  }
  getConnectionDetails() {
    return this.requestPool.getConnectionDetails();
  }
  exportMetrics() {
    return { performance: this.monitor.exportMetrics(), priorityQueue: this.priorityQueue.getStats(), connectionPool: this.requestPool.getStats(), concurrency: this.concurrencyManager.getStatus(), cache: this.cacheManager.getStats ? this.cacheManager.getStats() : null };
  }
  setPriority(e2, t2) {
    return { ...e2, priority: t2 };
  }
  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true, this.cancelManager.cancelAll("Client destroyed"), this.cacheManager.clear(), this.concurrencyManager.cancelQueue("Client destroyed"), this.priorityQueue.destroy(), this.requestPool.destroy(), this.monitor.clear(), this.interceptors.request.clear(), this.interceptors.response.clear(), this.interceptors.error.clear();
    const e2 = this.cacheManager;
    e2 && "function" == typeof e2.destroy && e2.destroy(), this.adapter = null, this.retryManager = null, this.cancelManager = null, this.cacheManager = null, this.concurrencyManager = null, this.monitor = null, this.priorityQueue = null, this.requestPool = null;
  }
  checkDestroyed() {
    if (this.isDestroyed) throw new Error("HttpClient has been destroyed");
  }
}

exports.HttpClientImpl = w;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=client.cjs.map
