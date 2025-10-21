/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ErrorHandler as o } from './error.js';

class t {
  constructor() {
    this.isCancelled = false, this.promise = new Promise((e2) => {
      this.resolvePromise = e2;
    });
  }
  cancel(e2 = "Request cancelled") {
    this.isCancelled || (this.isCancelled = true, this.reason = e2, this.resolvePromise(e2));
  }
  throwIfRequested() {
    if (this.isCancelled) throw o.createCancelError({});
  }
}
class a {
  constructor() {
    this.token = new t();
  }
  cancel(e2) {
    this.token.cancel(e2);
  }
}
class s {
  constructor() {
    this.requests = /* @__PURE__ */ new Map(), this.cancelTokens = /* @__PURE__ */ new Map();
  }
  static source() {
    return new a();
  }
  register(e2, t2, a2) {
    this.requests.set(e2, t2), a2 && (this.cancelTokens.set(e2, a2), a2.promise.then(() => {
      this.cancel(e2);
    }).catch(() => {
    }));
  }
  cancel(e2, t2 = "Request cancelled") {
    const a2 = this.requests.get(e2);
    a2 && (a2.abort(), this.requests.delete(e2));
    const s2 = this.cancelTokens.get(e2);
    s2 && !s2.isCancelled && (s2.cancel(t2), this.cancelTokens.delete(e2));
  }
  cancelAll(e2 = "All requests cancelled") {
    this.requests.forEach((e3, t2) => {
      e3.abort();
    }), this.requests.clear(), this.cancelTokens.forEach((t2, a2) => {
      t2.isCancelled || t2.cancel(e2);
    }), this.cancelTokens.clear();
  }
  cleanup(e2) {
    this.requests.delete(e2), this.cancelTokens.delete(e2);
  }
  getActiveRequestCount() {
    return this.requests.size;
  }
  isCancelled(e2) {
    const t2 = this.cancelTokens.get(e2);
    return !!t2 && t2.isCancelled;
  }
  createMergedSignal(e2) {
    const t2 = e2.filter((e3) => void 0 !== e3);
    if (0 === t2.length) return new AbortController().signal;
    if (1 === t2.length) return t2[0];
    const a2 = new AbortController(), s2 = () => {
      a2.abort();
    };
    return t2.forEach((e3) => {
      e3.aborted ? a2.abort() : e3.addEventListener("abort", s2, { once: true });
    }), a2.signal;
  }
}
class n extends s {
  constructor(e2 = {}) {
    super(), this.metadata = /* @__PURE__ */ new Map(), this.config = { defaultTimeout: e2.defaultTimeout || 3e4, autoCleanup: false !== e2.autoCleanup, cleanupInterval: e2.cleanupInterval || 6e4 }, this.config?.autoCleanup && this.startAutoCleanup();
  }
  createWithTags(e2, t2 = [], a2) {
    const s2 = r();
    this.metadata.set(e2, { source: s2, tags: new Set(t2), createdAt: Date.now(), config: a2 });
    const n2 = new AbortController();
    return this.register(e2, n2, s2.token), s2;
  }
  cancelBatch(e2, t2) {
    let a2 = 0;
    for (const s2 of e2) this.metadata.has(s2) && (this.cancel(s2, t2 || "Batch cancelled"), a2++);
    return a2;
  }
  cancelByTag(e2, t2) {
    const a2 = this.getRequestIdsByTag(e2);
    return this.cancelBatch(a2, t2 || `Cancelled by tag: ${e2}`);
  }
  cancelByTags(e2, t2) {
    const a2 = /* @__PURE__ */ new Set();
    return e2.forEach((e3) => {
      this.getRequestIdsByTag(e3).forEach((e4) => a2.add(e4));
    }), this.cancelBatch(Array.from(a2), t2);
  }
  cancelTimeout(e2, t2) {
    const a2 = Date.now(), s2 = [];
    return this.metadata.forEach((t3, n2) => {
      a2 - t3.createdAt > e2 && s2.push(n2);
    }), this.cancelBatch(s2, t2 || `Timeout exceeded: ${e2}ms`);
  }
  cancelWhere(e2, t2) {
    const a2 = [];
    return this.metadata.forEach((t3, s2) => {
      e2(t3, s2) && a2.push(s2);
    }), this.cancelBatch(a2, t2);
  }
  getRequestIdsByTag(e2) {
    const t2 = [];
    return this.metadata.forEach((a2, s2) => {
      a2.tags.has(e2) && t2.push(s2);
    }), t2;
  }
  getRequestCountByTag() {
    const e2 = /* @__PURE__ */ new Map();
    return this.metadata.forEach((t2) => {
      t2.tags.forEach((t3) => {
        e2.set(t3, (e2.get(t3) || 0) + 1);
      });
    }), e2;
  }
  getActiveRequests() {
    const e2 = Date.now(), t2 = [];
    return this.metadata.forEach((a2, s2) => {
      t2.push({ id: s2, tags: Array.from(a2.tags), age: e2 - a2.createdAt, url: a2.config?.url });
    }), t2;
  }
  getStats() {
    const e2 = Date.now();
    let t2 = 0, a2 = 0;
    const s2 = this.getRequestCountByTag();
    return this.metadata.forEach((s3) => {
      const n2 = e2 - s3.createdAt;
      t2 += n2, a2 = Math.max(a2, n2);
    }), { active: this.metadata.size, byTag: Object.fromEntries(s2), averageAge: this.metadata.size > 0 ? t2 / this.metadata.size : 0, oldestAge: a2, oldestRequest: this.getOldestRequest() };
  }
  getOldestRequest() {
    if (0 === this.metadata.size) return null;
    const e2 = Date.now();
    let t2, a2 = "", s2 = 0;
    return this.metadata.forEach((n2, c2) => {
      const r2 = e2 - n2.createdAt;
      r2 > s2 && (s2 = r2, a2 = c2, t2 = n2.config?.url);
    }), { id: a2, age: s2, url: t2 };
  }
  has(e2) {
    return this.metadata.has(e2);
  }
  getTags(e2) {
    const t2 = this.metadata.get(e2);
    return t2 ? Array.from(t2.tags) : [];
  }
  addTags(e2, ...t2) {
    const a2 = this.metadata.get(e2);
    return !!a2 && (t2.forEach((e3) => a2.tags.add(e3)), true);
  }
  removeTags(e2, ...t2) {
    const a2 = this.metadata.get(e2);
    return !!a2 && (t2.forEach((e3) => a2.tags.delete(e3)), true);
  }
  cleanup(e2) {
    super.cleanup(e2), this.metadata.delete(e2);
  }
  cleanupAll() {
    const e2 = [];
    this.metadata.forEach((t2, a2) => {
      this.isCancelled(a2) && e2.push(a2);
    }), e2.forEach((e3) => this.cleanup(e3));
  }
  startAutoCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupAll();
    }, this.config?.cleanupInterval);
  }
  stopAutoCleanup() {
    this.cleanupTimer && (clearInterval(this.cleanupTimer), this.cleanupTimer = void 0);
  }
  updateConfig(e2) {
    const t2 = this.config?.autoCleanup;
    this.config = { ...this.config, ...e2 }, t2 && !this.config?.autoCleanup ? this.stopAutoCleanup() : !t2 && this.config?.autoCleanup && this.startAutoCleanup();
  }
  destroy() {
    this.stopAutoCleanup(), this.cancelAll("Manager destroyed"), this.metadata.clear();
  }
}
const c = new n();
function r() {
  return s.source();
}

export { s as CancelManager, t as CancelTokenImpl, a as CancelTokenSource, n as EnhancedCancelManager, r as createCancelTokenSource, c as globalCancelManager };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=cancel.js.map
