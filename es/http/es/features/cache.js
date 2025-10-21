/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class t {
  constructor(t2 = 100) {
    this.cache = /* @__PURE__ */ new Map(), this.maxSize = t2;
  }
  async get(t2) {
    const e2 = this.cache.get(t2);
    return e2 ? Date.now() > e2.timestamp + 1e3 * e2.ttl ? (this.cache.delete(t2), null) : e2 : null;
  }
  async set(t2, e2) {
    if (this.cache.size >= this.maxSize) {
      const t3 = this.cache.keys().next().value;
      t3 && this.cache.delete(t3);
    }
    this.cache.set(t2, e2);
  }
  async delete(t2) {
    return this.cache.delete(t2);
  }
  async clear() {
    this.cache.clear();
  }
  async keys() {
    return Array.from(this.cache.keys());
  }
  async size() {
    return this.cache.size;
  }
}
class e {
  constructor(t2 = "http_cache_") {
    this.prefix = t2;
  }
  async get(t2) {
    try {
      const e2 = localStorage.getItem(this.prefix + t2);
      if (!e2) return null;
      const s2 = JSON.parse(e2);
      return Date.now() > s2.timestamp + 1e3 * s2.ttl ? (await this.delete(t2), null) : s2;
    } catch {
      return null;
    }
  }
  async set(t2, e2) {
    try {
      localStorage.setItem(this.prefix + t2, JSON.stringify(e2));
    } catch {
      await this.cleanup();
      try {
        localStorage.setItem(this.prefix + t2, JSON.stringify(e2));
      } catch {
      }
    }
  }
  async delete(t2) {
    const e2 = null !== localStorage.getItem(this.prefix + t2);
    return localStorage.removeItem(this.prefix + t2), e2;
  }
  async clear() {
    (await this.keys()).forEach((t2) => localStorage.removeItem(this.prefix + t2));
  }
  async keys() {
    const t2 = [];
    for (let e2 = 0; e2 < localStorage.length; e2++) {
      const s2 = localStorage.key(e2);
      s2 && s2.startsWith(this.prefix) && t2.push(s2.substring(this.prefix.length));
    }
    return t2;
  }
  async size() {
    return (await this.keys()).length;
  }
  async cleanup() {
    const t2 = await this.keys(), e2 = Date.now();
    for (const s2 of t2) {
      const t3 = await this.get(s2);
      (!t3 || e2 > t3.timestamp + 1e3 * t3.ttl) && await this.delete(s2);
    }
  }
}
class s {
  constructor(t2 = {}) {
    this.stats = { hits: 0, misses: 0, size: 0, hitRate: 0 }, this.config = { defaultTTL: 300, maxSize: 100, enableCompression: false, strategy: "memory", ...t2 }, this.storage = this.createStorage();
  }
  createStorage() {
    switch (this.config?.strategy) {
      case "localStorage":
        return new e();
      case "sessionStorage":
        return new e("session_http_cache_");
      default:
        return new t(this.config?.maxSize);
    }
  }
  generateKey(t2, e2) {
    if (this.config?.keyGenerator) return this.config?.keyGenerator(t2, e2);
    return `${e2.method || "GET"}:${t2}:${e2.params ? JSON.stringify(e2.params) : ""}:${e2.headers ? JSON.stringify(e2.headers) : ""}`;
  }
  async get(t2, e2 = {}) {
    const s2 = this.generateKey(t2, e2), a2 = await this.storage.get(s2);
    return a2 ? (this.stats.hits++, this.updateStats(), a2.data) : (this.stats.misses++, this.updateStats(), null);
  }
  async set(t2, e2, s2, a2, r2) {
    const i2 = this.generateKey(t2, e2), n = { data: s2, timestamp: Date.now(), ttl: a2 || this.config?.defaultTTL, headers: r2, size: this.calculateSize(s2) };
    await this.storage.set(i2, n), this.stats.size = await this.storage.size();
  }
  async delete(t2, e2 = {}) {
    const s2 = this.generateKey(t2, e2), a2 = await this.storage.delete(s2);
    return this.stats.size = await this.storage.size(), a2;
  }
  async clear() {
    await this.storage.clear(), this.stats.size = 0, this.stats.hits = 0, this.stats.misses = 0, this.stats.hitRate = 0;
  }
  getStats() {
    return { ...this.stats };
  }
  updateStats() {
    const t2 = this.stats.hits + this.stats.misses;
    this.stats.hitRate = t2 > 0 ? this.stats.hits / t2 : 0;
  }
  calculateSize(t2) {
    try {
      return JSON.stringify(t2).length;
    } catch {
      return 0;
    }
  }
  static isCacheable(t2, e2, s2 = {}) {
    if ("GET" !== t2.toUpperCase() || e2 < 200 || e2 >= 300) return false;
    const a2 = s2["cache-control"] || s2["Cache-Control"];
    return !(a2 && (a2.includes("no-cache") || a2.includes("no-store")));
  }
}
function a(t2) {
  return new s(t2);
}
a();

export { s as HttpCacheManager, e as LocalStorageCacheStorage, t as MemoryCacheStorage, a as createHttpCacheManager };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=cache.js.map
