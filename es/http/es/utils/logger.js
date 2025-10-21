/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import e$1 from 'node:process';

var e, s;
(s = e || (e = {}))[s.DEBUG = 0] = "DEBUG", s[s.INFO = 1] = "INFO", s[s.WARN = 2] = "WARN", s[s.ERROR = 3] = "ERROR", s[s.NONE = 4] = "NONE";
class i {
  constructor(s2 = {}) {
    this.isProduction = "production" === e$1.env.NODE_ENV, this.config = { level: s2.level ?? (this.isProduction ? e.WARN : e.DEBUG), enableInProduction: s2.enableInProduction ?? false, customHandler: s2.customHandler ?? null, showTimestamp: s2.showTimestamp ?? true, prefix: s2.prefix ?? "[HTTP]" };
  }
  setLevel(o2) {
    this.config && (this.config.level = o2);
  }
  getLevel() {
    return this.config?.level;
  }
  debug(o2, ...s2) {
    this.log(e.DEBUG, o2, ...s2);
  }
  info(o2, ...s2) {
    this.log(e.INFO, o2, ...s2);
  }
  warn(o2, ...s2) {
    this.log(e.WARN, o2, ...s2);
  }
  error(o2, ...s2) {
    this.log(e.ERROR, o2, ...s2);
  }
  group(o2) {
    this.shouldLog(e.DEBUG);
  }
  groupCollapsed(o2) {
    this.shouldLog(e.DEBUG);
  }
  groupEnd() {
    this.shouldLog(e.DEBUG);
  }
  table(o2) {
    this.shouldLog(e.DEBUG);
  }
  time(o2) {
    this.shouldLog(e.DEBUG);
  }
  timeEnd(o2) {
    this.shouldLog(e.DEBUG);
  }
  log(o2, s2, ...i2) {
    if (!this.shouldLog(o2)) return;
    this.formatMessage(s2);
    if (this.config?.customHandler) this.config?.customHandler(o2, s2, i2.length > 0 ? i2 : void 0);
    else switch (o2) {
      case e.DEBUG:
      case e.INFO:
      case e.WARN:
      case e.ERROR:
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
new i({ level: e.DEBUG, enableInProduction: false, prefix: "[HTTP:DEV]" });

export { e as LogLevel, i as Logger, t as logger };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=logger.js.map
