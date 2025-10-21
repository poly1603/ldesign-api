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

class e extends t$1 {
  constructor(s2) {
    if (super(), this.name = "axios", s2) this.axios = s2;
    else try {
      this.axios = require("axios");
    } catch {
      this.axios = null;
    }
  }
  isSupported() {
    return null !== this.axios;
  }
  async request(s2) {
    if (!this.isSupported()) throw new Error("Axios is not available. Please install axios: npm install axios");
    const e2 = this.processConfig(s2);
    try {
      const s3 = this.convertToAxiosConfig(e2), r = await this.axios.request(s3);
      return this.convertFromAxiosResponse(r, e2);
    } catch (s3) {
      throw this.handleAxiosError(s3, e2);
    }
  }
  convertToAxiosConfig(s2) {
    let e2 = s2.url || "";
    const r = s2.params || {}, t = s2.baseURL, o = e2.split("?");
    if (o.length > 1) {
      e2 = o[0];
      const s3 = o[1];
      new URLSearchParams(s3).forEach((s4, e3) => {
        const t2 = Number(s4);
        r[e3] = Number.isNaN(t2) || "" === s4 ? s4 : t2;
      });
    }
    t && e2.startsWith(t) && (e2 = e2.substring(t.length), e2.startsWith("/") || (e2 = `/${e2}`));
    const a = { url: e2, method: s2.method };
    if (s2.headers && Object.keys(s2.headers).length > 0 && (a.headers = s2.headers), void 0 !== s2.data && (a.data = s2.data), void 0 !== s2.timeout && (a.timeout = s2.timeout), t && (a.baseURL = t), void 0 !== s2.withCredentials && (a.withCredentials = s2.withCredentials), s2.signal && (a.signal = s2.signal), r && Object.keys(r).length > 0 && (a.params = r), s2.responseType) switch (s2.responseType) {
      case "json":
      default:
        a.responseType = "json";
        break;
      case "text":
        a.responseType = "text";
        break;
      case "blob":
        a.responseType = "blob";
        break;
      case "arrayBuffer":
        a.responseType = "arraybuffer";
        break;
      case "stream":
        a.responseType = "stream";
    }
    return Object.keys(a).forEach((s3) => {
      void 0 === a[s3] && delete a[s3];
    }), a;
  }
  convertFromAxiosResponse(s2, e2) {
    const r = { url: e2.url };
    return this.processResponse(s2.data, s2.status, s2.statusText, s2.headers || {}, r);
  }
  handleAxiosError(s2, e2) {
    if (s2.response) {
      const r = this.convertFromAxiosResponse(s2.response, e2), t = s2.response.status, o = `Request failed with status code ${t}`, a = this.processError(new Error(o), e2, r);
      return a.status = t, a.response = r, a;
    }
    if (s2.request) {
      const r = this.processError(s2, e2);
      return r.isNetworkError = true, r;
    }
    return this.processError(s2, e2);
  }
}

export { e as AxiosAdapter };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=axios.js.map
