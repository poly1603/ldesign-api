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

class t {
  constructor() {
    this.interceptors = [], this.idMap = /* @__PURE__ */ new Map(), this.nextId = 0;
  }
  use(t2, e) {
    const s = this.nextId++, i = this.interceptors.length;
    return this.interceptors.push({ fulfilled: t2, rejected: e }), this.idMap.set(s, i), s;
  }
  eject(t2) {
    const e = this.idMap.get(t2);
    if (void 0 !== e) {
      this.interceptors.splice(e, 1), this.idMap.delete(t2);
      for (const [t3, s] of this.idMap.entries()) s > e && this.idMap.set(t3, s - 1);
    }
  }
  clear() {
    this.interceptors = [], this.idMap.clear();
  }
  forEach(t2) {
    const e = this.interceptors.length;
    for (let s = 0; s < e; s++) t2(this.interceptors[s]);
  }
  getInterceptors() {
    return [...this.interceptors];
  }
  size() {
    return this.interceptors.length;
  }
  isEmpty() {
    return 0 === this.interceptors.length;
  }
}

exports.InterceptorManagerImpl = t;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=manager.cjs.map
