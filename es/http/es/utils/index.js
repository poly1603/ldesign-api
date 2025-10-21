/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
export { MemoryMonitor, createMemoryMonitor } from './memory.js';

const N = /* @__PURE__ */ new Map();
function v(e2) {
  if (e2.length <= 20) {
    const r2 = N.get(e2);
    if (void 0 !== r2) return r2;
    const a2 = encodeURIComponent(e2).replace(/%20/g, "+");
    return N.size < 1e3 && N.set(e2, a2), a2;
  }
  return encodeURIComponent(e2).replace(/%20/g, "+");
}
function L(e2) {
  if (!e2 || "object" != typeof e2) return "";
  const r2 = Object.keys(e2);
  if (0 === r2.length) return "";
  const a2 = Array.from({ length: 2 * r2.length });
  let t2 = 0;
  for (const n2 of r2) {
    const r3 = e2[n2];
    if (null == r3) continue;
    const s2 = v(n2);
    if (Array.isArray(r3)) {
      const e3 = r3.length;
      for (let n3 = 0; n3 < e3; n3++) {
        const e4 = r3[n3];
        null != e4 && (a2[t2++] = `${s2}=${v(String(e4))}`);
      }
    } else a2[t2++] = `${s2}=${v(String(r3))}`;
  }
  return a2.slice(0, t2).join("&");
}
function D(e2, r2, a2) {
  let t2 = e2;
  if (r2 && !$(e2) && (t2 = z(r2, e2)), a2 && Object.keys(a2).length > 0) {
    const e3 = L(a2);
    if (e3) {
      const r3 = t2.includes("?") ? "&" : "?";
      t2 += r3 + e3;
    }
  }
  return t2;
}
function $(e2) {
  return /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(e2);
}
function z(e2, r2) {
  return r2 ? `${e2.replace(/\/+$/, "")}/${r2.replace(/^\/+/, "")}` : e2;
}
function F(e2, r2, a2, t2) {
  const n2 = new Error(e2);
  return n2.config = r2, n2.code = a2, n2.response = t2, n2.isNetworkError = false, n2.isTimeoutError = false, n2.isCancelError = false, "ECONNABORTED" === a2 || e2.includes("timeout") ? n2.isTimeoutError = true : "NETWORK_ERROR" === a2 || e2.includes("Network Error") ? n2.isNetworkError = true : ("CANCELED" === a2 || e2.includes("canceled")) && (n2.isCancelError = true), n2;
}
function I(e2) {
  return new Promise((r2) => setTimeout(r2, e2));
}
function K() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
function W(e2) {
  return typeof FormData < "u" && e2 instanceof FormData;
}
function P(e2) {
  return typeof Blob < "u" && e2 instanceof Blob;
}
function q(e2) {
  return typeof ArrayBuffer < "u" && e2 instanceof ArrayBuffer;
}
function H(e2) {
  return typeof URLSearchParams < "u" && e2 instanceof URLSearchParams;
}

export { L as buildQueryString, D as buildURL, z as combineURLs, F as createHttpError, I as delay, K as generateId, $ as isAbsoluteURL, q as isArrayBuffer, P as isBlob, W as isFormData, H as isURLSearchParams };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
