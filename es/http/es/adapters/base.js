/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { buildURL as D, createHttpError as F } from '../utils/index.js';

let t$1 = class t {
  processConfig(r2) {
    const t2 = { ...r2 };
    return t2.url && (t2.url = D(t2.url, t2.baseURL, t2.params)), t2.method || (t2.method = "GET"), t2.headers || (t2.headers = {}), t2;
  }
  processResponse(e2, r2, t2, o, s, n) {
    return { data: e2, status: r2, statusText: t2, headers: o, config: s, raw: n };
  }
  processError(e2, t2, o) {
    let s, n = "Request failed";
    e2 instanceof Error ? (n = e2.message, s = e2.code) : "string" == typeof e2 && (n = e2);
    const a = F(n, t2, s, o);
    return "AbortError" === e2.name || n.includes("aborted") ? (a.isCancelError = true, a.code = "CANCELED") : "TimeoutError" === e2.name || n.includes("timeout") ? (a.isTimeoutError = true, a.code = "TIMEOUT") : (n.includes("Network") || n.includes("fetch")) && (a.isNetworkError = true, a.code = "NETWORK_ERROR"), a;
  }
  createTimeoutController(e2) {
    const r2 = new AbortController();
    let t2;
    return e2 && e2 > 0 && (t2 = setTimeout(() => {
      r2 && "function" == typeof r2.abort && r2.abort();
    }, e2)), { signal: r2.signal, cleanup: () => {
      t2 && clearTimeout(t2);
    } };
  }
  mergeAbortSignals(e2) {
    const r2 = e2.filter((e3) => void 0 !== e3);
    if (0 === r2.length) return new AbortController().signal;
    if (1 === r2.length) return r2[0];
    const t2 = new AbortController(), o = () => {
      t2.abort();
    };
    return r2.forEach((e3) => {
      e3.aborted ? t2.abort() : e3.addEventListener("abort", o, { once: true });
    }), t2.signal;
  }
  parseHeaders(e2) {
    const r2 = {};
    return e2 instanceof Headers ? e2.forEach((e3, t2) => {
      r2[t2.toLowerCase()] = e3;
    }) : Object.keys(e2).forEach((t2) => {
      const o = e2[t2];
      void 0 !== o && (r2[t2.toLowerCase()] = o);
    }), r2;
  }
};

export { t$1 as BaseAdapter };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=base.js.map
