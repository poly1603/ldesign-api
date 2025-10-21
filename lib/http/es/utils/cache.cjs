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

class e {
  constructor(e2 = 1e3) {
    this.cache = /* @__PURE__ */ new Map(), this.accessOrder = /* @__PURE__ */ new Map(), this.maxSize = 1e3, this.cleanupInterval = 6e4, this.isDestroyed = false, this.maxSize = e2, this.startCleanup();
  }
  async get(e2) {
    const t2 = this.cache.get(e2);
    return t2 ? Date.now() - t2.timestamp > t2.ttl ? (this.cache.delete(e2), this.accessOrder.delete(e2), null) : (this.accessOrder.set(e2, Date.now()), t2.data) : null;
  }
  async set(e2, t2, s2 = 3e5) {
    this.cache.size >= this.maxSize && this.evictLRU(), this.cache.set(e2, { data: t2, timestamp: Date.now(), ttl: s2 }), this.accessOrder.set(e2, Date.now());
  }
  async delete(e2) {
    this.cache.delete(e2), this.accessOrder.delete(e2);
  }
  async clear() {
    this.cache.clear(), this.accessOrder.clear();
  }
  startCleanup() {
    this.isDestroyed || (this.cleanupTimer = setInterval(() => {
      this.isDestroyed || this.cleanupExpired();
    }, this.cleanupInterval), this.cleanupTimer.unref && this.cleanupTimer.unref());
  }
  cleanupExpired() {
    if (this.isDestroyed) return;
    const e2 = Date.now(), t2 = [];
    let s2 = 0;
    for (const [a2, i2] of this.cache.entries()) if (e2 - i2.timestamp > i2.ttl && (t2.push(a2), s2++, s2 >= 100)) break;
    for (const e3 of t2) this.cache.delete(e3), this.accessOrder.delete(e3);
  }
  evictLRU() {
    if (0 === this.accessOrder.size) return;
    let e2 = null, t2 = 1 / 0;
    for (const [s2, a2] of this.accessOrder.entries()) a2 < t2 && (t2 = a2, e2 = s2);
    e2 && (this.cache.delete(e2), this.accessOrder.delete(e2));
  }
  size() {
    return this.cache.size;
  }
  keys() {
    return Array.from(this.cache.keys());
  }
  destroy() {
    this.isDestroyed = true, this.cleanupTimer && (clearInterval(this.cleanupTimer), this.cleanupTimer = void 0), this.cache.clear(), this.accessOrder.clear();
  }
}
class s {
  constructor(t2 = {}) {
    this.keyCache = /* @__PURE__ */ new Map(), this.stats = { hits: 0, misses: 0, hitRate: 0, size: 0, memoryUsage: 0, recentKeys: [], hotKeys: [] }, this.config = { enabled: t2.enabled ?? true, ttl: t2.ttl ?? 3e5, keyGenerator: t2.keyGenerator ?? this.defaultKeyGenerator, storage: t2.storage ?? new e() }, this.storage = this.config?.storage;
  }
  async get(e2) {
    if (!this.config?.enabled) return null;
    const t2 = this.getCachedKey(e2), s2 = await this.storage.get(t2);
    s2 ? this.stats.hits++ : this.stats.misses++;
    const a2 = this.stats.hits + this.stats.misses;
    return this.stats.hitRate = a2 > 0 ? this.stats.hits / a2 : 0, s2;
  }
  async set(e2, t2) {
    if (!this.config?.enabled || "GET" !== e2.method || t2.status < 200 || t2.status >= 300) return;
    const s2 = this.getCachedKey(e2);
    await this.storage.set(s2, t2, this.config?.ttl);
  }
  async delete(e2) {
    const t2 = this.getCachedKey(e2);
    await this.storage.delete(t2);
  }
  async clear() {
    await this.storage.clear();
  }
  updateConfig(e2) {
    Object.assign(this.config, e2), e2.storage && (this.storage = e2.storage);
  }
  getConfig() {
    return { ...this.config };
  }
  getStats() {
    return { ...this.stats };
  }
  getCachedKey(e2) {
    const t2 = `${e2.method || "GET"}:${e2.url || ""}:${e2.params ? this.fastStringify(e2.params) : ""}:${e2.data ? this.fastStringify(e2.data) : ""}`;
    if (this.keyCache.has(t2)) return this.keyCache.get(t2);
    const s2 = this.config?.keyGenerator(e2);
    if (this.keyCache.size > 1e3) {
      const e3 = this.keyCache.keys().next().value;
      void 0 !== e3 && this.keyCache.delete(e3);
    }
    return this.keyCache.set(t2, s2), s2;
  }
  fastStringify(e2) {
    return null == e2 ? "" : "string" == typeof e2 ? e2 : "number" == typeof e2 || "boolean" == typeof e2 ? String(e2) : JSON.stringify(e2);
  }
  defaultKeyGenerator(e2) {
    const { method: t2 = "GET", url: s2 = "", params: a2 = {}, data: i2 } = e2;
    let r2 = `${t2}:${s2}`;
    const n2 = Object.keys(a2).sort();
    if (n2.length > 0) {
      r2 += `?${n2.map((e3) => `${e3}=${a2[e3]}`).join("&")}`;
    }
    if (i2 && "GET" !== t2) {
      r2 += `:${(function(e3) {
        let t3 = 0;
        for (let s3 = 0; s3 < e3.length; s3++) {
          t3 = (t3 << 5) - t3 + e3.charCodeAt(s3), t3 &= t3;
        }
        return Math.abs(t3).toString(36);
      })("string" == typeof i2 ? i2 : JSON.stringify(i2))}`;
    }
    return r2;
  }
}

exports.CacheManager = s;
exports.MemoryCacheStorage = e;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=cache.cjs.map
