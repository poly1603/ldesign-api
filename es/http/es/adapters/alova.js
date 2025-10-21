/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { BaseAdapter as t$1 } from './base.js';

class t extends t$1 {
  constructor(e2) {
    if (super(), this.name = "alova", this.alovaInstance = e2, !e2) try {
      this.alova = require("alova");
    } catch {
      this.alova = null;
    }
  }
  isSupported() {
    return null !== this.alovaInstance || null !== this.alova;
  }
  async request(e2) {
    if (!this.isSupported()) throw new Error("Alova is not available. Please install alova: npm install alova");
    const t2 = this.processConfig(e2);
    try {
      const e3 = this.alovaInstance || this.createDefaultAlovaInstance(), a = await this.createAlovaMethod(e3, t2).send();
      return this.convertFromAlovaResponse(a, t2);
    } catch (e3) {
      throw this.handleAlovaError(e3, t2);
    }
  }
  createDefaultAlovaInstance() {
    if (!this.alova) throw new Error("Alova is not available");
    try {
      const { createAlova: e2 } = this.alova;
      let t2;
      try {
        t2 = require("alova/fetch"), "object" == typeof t2 && t2.default && (t2 = t2.default);
      } catch {
        t2 = () => (e3, t3) => fetch(e3, t3);
      }
      return e2({ baseURL: "", requestAdapter: t2(), responded: (e3) => e3.json() });
    } catch (e2) {
      throw new Error(`Failed to create Alova instance: ${e2}`);
    }
  }
  createAlovaMethod(e2, t2) {
    const { url: a, method: r = "GET", data: s, headers: o, timeout: n, params: l } = t2;
    if (!a) throw new Error("URL is required");
    let c = a;
    const i = l || {}, h = a.split("?");
    if (h.length > 1) {
      c = h[0];
      const e3 = h[1];
      new URLSearchParams(e3).forEach((e4, t3) => {
        const a2 = Number(e4);
        i[t3] = Number.isNaN(a2) || "" === e4 ? e4 : a2;
      });
    }
    let u = c;
    !c.startsWith("http") && !c.startsWith("//") && t2.baseURL && (u = `${t2.baseURL.replace(/\/$/, "")}/${c.replace(/^\//, "")}`);
    const p = { headers: o, timeout: n };
    let v;
    i && Object.keys(i).length > 0 && (p.params = i), t2.signal && (p.signal = t2.signal);
    try {
      switch (r.toUpperCase()) {
        case "GET":
          v = e2.Get(u, p);
          break;
        case "POST":
          v = e2.Post(u, s, p);
          break;
        case "PUT":
          v = e2.Put(u, s, p);
          break;
        case "DELETE":
          v = e2.Delete(u, p);
          break;
        case "PATCH":
          v = e2.Patch(u, s, p);
          break;
        case "HEAD":
          v = e2.Head(u, p);
          break;
        case "OPTIONS":
          v = e2.Options(u, p);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${r}`);
      }
    } catch (e3) {
      throw new Error(`Failed to parse URL from ${a}: ${e3.message}`);
    }
    return t2.signal && (v.abort = () => {
      t2.signal && !t2.signal.aborted && t2.signal.abort();
    }), v;
  }
  convertFromAlovaResponse(e2, t2) {
    return this.processResponse(e2, 200, "OK", {}, t2, e2);
  }
  handleAlovaError(e2, t2) {
    if (e2.status || e2.response?.status) {
      const a2 = e2.status || e2.response.status, r = `Request failed with status code ${a2}`, s = this.processError(new Error(r), t2, e2.response);
      return s.status = a2, s;
    }
    if ("AlovaError" === e2.name) return this.processError(e2, t2);
    const a = this.processError(e2, t2);
    return e2.message && e2.message.includes("fetch") && (a.isNetworkError = true), a;
  }
}

export { t as AlovaAdapter };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=alova.js.map
