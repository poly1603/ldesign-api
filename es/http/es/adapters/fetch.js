/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { isFormData as W, isURLSearchParams as H, isBlob as P, isArrayBuffer as q } from '../utils/index.js';
import { BaseAdapter as t$1 } from './base.js';

class n extends t$1 {
  constructor() {
    super(...arguments), this.name = "fetch";
  }
  isSupported() {
    return typeof fetch < "u" && typeof AbortController < "u";
  }
  async request(t2) {
    const e2 = this.processConfig(t2);
    try {
      const t3 = this.createTimeoutController(e2.timeout), s2 = this.mergeAbortSignals([e2.signal, t3.signal]), a2 = { method: e2.method, headers: this.buildHeaders(e2), signal: s2, credentials: e2.withCredentials ? "include" : "same-origin" };
      e2.data && "GET" !== e2.method && "HEAD" !== e2.method && (a2.body = this.buildBody(e2.data, e2.headers));
      const r2 = await fetch(e2.url, a2);
      return t3.cleanup(), await this.handleResponse(r2, e2);
    } catch (t3) {
      throw this.processError(t3, e2);
    }
  }
  buildHeaders(s2) {
    const a2 = { ...s2.headers };
    return s2.data && !a2["content-type"] && !a2["Content-Type"] && ("string" == typeof s2.data ? a2["Content-Type"] = "text/plain" : W(s2.data) ? delete a2["Content-Type"] : H(s2.data) ? a2["Content-Type"] = "application/x-www-form-urlencoded" : "object" == typeof s2.data && (a2["Content-Type"] = "application/json")), a2;
  }
  buildBody(r2, n2) {
    if (null != r2) {
      if ("string" == typeof r2 || W(r2) || P(r2) || q(r2) || H(r2) || r2 instanceof ReadableStream) return r2;
      if ((n2?.["content-type"] || n2?.["Content-Type"] || "").includes("application/x-www-form-urlencoded")) {
        const t2 = new URLSearchParams();
        return Object.keys(r2).forEach((e2) => {
          const s2 = r2[e2];
          null != s2 && t2.append(e2, String(s2));
        }), t2;
      }
      return JSON.stringify(r2);
    }
  }
  async handleResponse(t2, e2) {
    const s2 = this.parseHeaders(t2.headers), a2 = await this.parseResponseData(t2, e2.responseType);
    if (!t2.ok) throw this.processError(new Error(`Request failed with status ${t2.status}`), e2, this.processResponse(a2, t2.status, t2.statusText, s2, e2, t2));
    return this.processResponse(a2, t2.status, t2.statusText, s2, e2, t2);
  }
  async parseResponseData(t2, e2) {
    if (!t2.body) return null;
    try {
      switch (e2) {
        case "text":
          return await t2.text();
        case "blob":
          return await t2.blob();
        case "arrayBuffer":
          return await t2.arrayBuffer();
        case "stream":
          return t2.body;
        default: {
          const e3 = t2.headers.get("content-type") || "";
          if (e3.includes("application/json")) return await t2.json();
          if (e3.includes("text/")) return await t2.text();
          {
            const e4 = await t2.text();
            try {
              return JSON.parse(e4);
            } catch {
              return e4;
            }
          }
        }
      }
    } catch {
      return null;
    }
  }
}

export { n as FetchAdapter };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=fetch.js.map
