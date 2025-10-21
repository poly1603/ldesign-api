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

var e = require('node:process');

exports.LogLevel = void 0; var s;
(s = exports.LogLevel || (exports.LogLevel = {}))[s.DEBUG = 0] = "DEBUG", s[s.INFO = 1] = "INFO", s[s.WARN = 2] = "WARN", s[s.ERROR = 3] = "ERROR", s[s.NONE = 4] = "NONE";
class i {
  constructor(s2 = {}) {
    this.isProduction = "production" === e.env.NODE_ENV, this.config = { level: s2.level ?? (this.isProduction ? exports.LogLevel.WARN : exports.LogLevel.DEBUG), enableInProduction: s2.enableInProduction ?? false, customHandler: s2.customHandler ?? null, showTimestamp: s2.showTimestamp ?? true, prefix: s2.prefix ?? "[HTTP]" };
  }
  setLevel(o2) {
    this.config && (this.config.level = o2);
  }
  getLevel() {
    return this.config?.level;
  }
  debug(o2, ...s2) {
    this.log(exports.LogLevel.DEBUG, o2, ...s2);
  }
  info(o2, ...s2) {
    this.log(exports.LogLevel.INFO, o2, ...s2);
  }
  warn(o2, ...s2) {
    this.log(exports.LogLevel.WARN, o2, ...s2);
  }
  error(o2, ...s2) {
    this.log(exports.LogLevel.ERROR, o2, ...s2);
  }
  group(o2) {
    this.shouldLog(exports.LogLevel.DEBUG);
  }
  groupCollapsed(o2) {
    this.shouldLog(exports.LogLevel.DEBUG);
  }
  groupEnd() {
    this.shouldLog(exports.LogLevel.DEBUG);
  }
  table(o2) {
    this.shouldLog(exports.LogLevel.DEBUG);
  }
  time(o2) {
    this.shouldLog(exports.LogLevel.DEBUG);
  }
  timeEnd(o2) {
    this.shouldLog(exports.LogLevel.DEBUG);
  }
  log(o2, s2, ...i2) {
    if (!this.shouldLog(o2)) return;
    this.formatMessage(s2);
    if (this.config?.customHandler) this.config?.customHandler(o2, s2, i2.length > 0 ? i2 : void 0);
    else switch (o2) {
      case exports.LogLevel.DEBUG:
      case exports.LogLevel.INFO:
      case exports.LogLevel.WARN:
      case exports.LogLevel.ERROR:
    }
  }
  shouldLog(o2) {
    return !(this.isProduction && !this.config?.enableInProduction) && o2 >= this.config?.level;
  }
  formatMessage(o2) {
    const e2 = [];
    if (this.config?.prefix && e2.push(this.config?.prefix), this.config?.showTimestamp) {
      const o3 = (/* @__PURE__ */ new Date()).toISOString().split("T")[1].slice(0, -1);
      e2.push(`[${o3}]`);
    }
    return e2.push(o2), e2.join(" ");
  }
  createChild(o2) {
    const { customHandler: e2, ...s2 } = this.config;
    return new i({ ...s2, customHandler: e2 || void 0, prefix: `${this.config?.prefix} ${o2}` });
  }
}
const t = new i();
new i({ level: exports.LogLevel.DEBUG, enableInProduction: false, prefix: "[HTTP:DEV]" });

exports.Logger = i;
exports.logger = t;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=logger.cjs.map
