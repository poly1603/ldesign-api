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

var alova = require('./alova.cjs');
var axios = require('./axios.cjs');
var fetch = require('./fetch.cjs');
require('../utils/memory.cjs');

class i {
  static register(t2, a2) {
    this.adapters.set(t2, a2);
  }
  static create(t2) {
    if (this.adapterCache.has(t2)) return this.adapterCache.get(t2);
    const a2 = this.adapters.get(t2);
    if (!a2) throw new Error(`Unknown adapter: ${t2}`);
    const e2 = a2();
    if (!e2.isSupported()) throw new Error(`Adapter '${t2}' is not supported in current environment`);
    return this.adapterCache.set(t2, e2), e2;
  }
  static getAvailable() {
    const t2 = [];
    return this.adapters.forEach((a2, e2) => {
      if (this.availabilityCache.has(e2)) this.availabilityCache.get(e2) && t2.push(e2);
      else try {
        const r2 = a2().isSupported();
        this.availabilityCache.set(e2, r2), r2 && t2.push(e2);
      } catch {
        this.availabilityCache.set(e2, false);
      }
    }), t2;
  }
  static getDefault() {
    const t2 = this.getAvailable();
    if (0 === t2.length) throw new Error("No available HTTP adapter found");
    const a2 = ["fetch", "axios", "alova"];
    for (const e2 of a2) if (t2.includes(e2)) return this.create(e2);
    return this.create(t2[0]);
  }
  static getRegistered() {
    return Array.from(this.adapters.keys());
  }
  static clearCache() {
    this.adapterCache.clear(), this.availabilityCache.clear();
  }
  static warmup() {
    this.getAvailable();
  }
}
function s(t2) {
  if (!t2) return i.getDefault();
  if ("string" == typeof t2) return i.create(t2);
  if ("object" == typeof t2 && "request" in t2 && "isSupported" in t2) return t2;
  throw new Error("Invalid adapter configuration");
}
i.adapters = /* @__PURE__ */ new Map([["fetch", () => new fetch.FetchAdapter()], ["axios", () => new axios.AxiosAdapter()], ["alova", () => new alova.AlovaAdapter()]]), i.adapterCache = /* @__PURE__ */ new Map(), i.availabilityCache = /* @__PURE__ */ new Map();

exports.AlovaAdapter = alova.AlovaAdapter;
exports.AxiosAdapter = axios.AxiosAdapter;
exports.FetchAdapter = fetch.FetchAdapter;
exports.AdapterFactory = i;
exports.createAdapter = s;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
