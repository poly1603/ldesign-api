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
    this.keyCache = /* @__PURE__ */ new WeakMap(), this.stringKeyCache = /* @__PURE__ */ new Map(), this.maxCacheSize = 1e3, this.config = { includeMethod: true, includeUrl: true, includeParams: true, includeData: false, includeHeaders: false, specificHeaders: [], customGenerator: e2.customGenerator, ...e2 };
  }
  generate(e2) {
    const t2 = this.keyCache.get(e2);
    if (t2) return t2;
    const r2 = this.generateKey(e2);
    return this.keyCache.set(e2, r2), this.cacheStringKey(r2), r2;
  }
  generateKey(e2) {
    if (this.config?.customGenerator) return this.config?.customGenerator(e2);
    const t2 = [];
    if (this.config?.includeMethod && e2.method && t2.push(`method:${e2.method.toUpperCase()}`), this.config?.includeUrl && e2.url && t2.push(`url:${e2.url}`), this.config?.includeParams && e2.params) {
      const r2 = this.serializeParams(e2.params);
      r2 && t2.push(`params:${r2}`);
    }
    if (this.config?.includeData && e2.data) {
      const r2 = this.serializeData(e2.data);
      r2 && t2.push(`data:${r2}`);
    }
    if (this.config?.includeHeaders && e2.headers) {
      const r2 = this.serializeHeaders(e2.headers);
      r2 && t2.push(`headers:${r2}`);
    }
    if (this.config?.specificHeaders.length > 0 && e2.headers) {
      const r2 = this.serializeSpecificHeaders(e2.headers, this.config?.specificHeaders);
      r2 && t2.push(`specific-headers:${r2}`);
    }
    return t2.join("|");
  }
  cacheStringKey(e2) {
    if (this.stringKeyCache.size >= this.maxCacheSize) {
      const e3 = this.stringKeyCache.keys().next().value;
      void 0 !== e3 && this.stringKeyCache.delete(e3);
    }
    this.stringKeyCache.set(e2, e2);
  }
  clearCache() {
    this.stringKeyCache.clear();
  }
  serializeParams(e2) {
    try {
      const t2 = Object.keys(e2).sort(), r2 = t2.length;
      if (0 === r2) return "";
      const s2 = Array.from({ length: r2 }, () => "");
      for (let i = 0; i < r2; i++) {
        const r3 = t2[i];
        s2[i] = `${r3}:${JSON.stringify(e2[r3])}`;
      }
      return s2.join(",");
    } catch {
      return String(e2);
    }
  }
  serializeData(e2) {
    try {
      if (e2 instanceof FormData) {
        const t2 = [];
        for (const [r2, s2] of e2.entries()) t2.push(`${r2}:${"string" == typeof s2 ? s2 : "[File]"}`);
        return t2.sort().join(",");
      }
      if ("object" == typeof e2 && null !== e2) {
        const t2 = Object.keys(e2).sort(), r2 = [];
        for (const s2 of t2) r2.push(`${s2}:${JSON.stringify(e2[s2])}`);
        return r2.join(",");
      }
      return String(e2);
    } catch {
      return String(e2);
    }
  }
  serializeHeaders(e2) {
    try {
      const t2 = /* @__PURE__ */ new Set(["authorization", "x-request-id", "x-timestamp"]), r2 = [], s2 = Object.keys(e2).sort();
      for (const i of s2) t2.has(i.toLowerCase()) || r2.push(`${i}:${e2[i]}`);
      return r2.join(",");
    } catch {
      return String(e2);
    }
  }
  serializeSpecificHeaders(e2, t2) {
    try {
      const r2 = [], s2 = [...t2].sort();
      for (const t3 of s2) void 0 !== e2[t3] && r2.push(`${t3}:${e2[t3]}`);
      return r2.join(",");
    } catch {
      return "";
    }
  }
}
new e();

export { e as DeduplicationKeyGenerator };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=request-dedup.js.map
