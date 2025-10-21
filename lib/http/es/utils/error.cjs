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

var index = require('./index.cjs');

exports.ErrorType = void 0; var s;
(s = exports.ErrorType || (exports.ErrorType = {})).NETWORK = "NETWORK_ERROR", s.TIMEOUT = "TIMEOUT_ERROR", s.CANCEL = "CANCEL_ERROR", s.HTTP = "HTTP_ERROR", s.PARSE = "PARSE_ERROR", s.UNKNOWN = "UNKNOWN_ERROR";
class o {
  static createNetworkError(t2, s2) {
    const o2 = index.createHttpError(this.ERROR_TEMPLATES[exports.ErrorType.NETWORK], t2, exports.ErrorType.NETWORK);
    return o2.isNetworkError = true, o2.cause = s2, o2;
  }
  static createTimeoutError(t2, s2) {
    const o2 = "function" == typeof this.ERROR_TEMPLATES[exports.ErrorType.TIMEOUT] ? this.ERROR_TEMPLATES[exports.ErrorType.TIMEOUT](s2) : `Timeout Error: Request timed out after ${s2}ms`, a2 = index.createHttpError(o2, t2, exports.ErrorType.TIMEOUT);
    return a2.isTimeoutError = true, a2;
  }
  static createCancelError(t2) {
    const s2 = index.createHttpError(this.ERROR_TEMPLATES[exports.ErrorType.CANCEL], t2, exports.ErrorType.CANCEL);
    return s2.isCancelError = true, s2;
  }
  static createHttpError(t2, s2, o2, a2) {
    return index.createHttpError(`HTTP Error: ${t2} ${s2}`, o2, exports.ErrorType.HTTP, a2);
  }
  static createParseError(t2, s2) {
    const o2 = index.createHttpError("Parse Error: Failed to parse response data", t2, exports.ErrorType.PARSE);
    return o2.cause = s2, o2;
  }
  static isRetryableError(r2) {
    if (r2.isNetworkError || r2.isTimeoutError) return true;
    if (r2.response?.status) {
      const t2 = r2.response.status;
      return t2 >= 500 || 429 === t2 || 408 === t2;
    }
    return false;
  }
  static getUserFriendlyMessage(r2) {
    if (r2.isNetworkError) return "\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8BBE\u7F6E";
    if (r2.isTimeoutError) return "\u8BF7\u6C42\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5";
    if (r2.isCancelError) return "\u8BF7\u6C42\u5DF2\u53D6\u6D88";
    if (r2.response?.status) {
      const t2 = r2.response.status;
      switch (t2) {
        case 400:
          return "\u8BF7\u6C42\u53C2\u6570\u9519\u8BEF";
        case 401:
          return "\u672A\u6388\u6743\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55";
        case 403:
          return "\u6743\u9650\u4E0D\u8DB3";
        case 404:
          return "\u8BF7\u6C42\u7684\u8D44\u6E90\u4E0D\u5B58\u5728";
        case 429:
          return "\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5";
        case 500:
          return "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF";
        case 502:
          return "\u7F51\u5173\u9519\u8BEF";
        case 503:
          return "\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528";
        default:
          return `\u8BF7\u6C42\u5931\u8D25 (${t2})`;
      }
    }
    return r2.message || "\u672A\u77E5\u9519\u8BEF";
  }
  static recordError(r2) {
    const t2 = Date.now();
    this.errorStats.total++;
    const e2 = this.getErrorType(r2);
    if (this.errorStats.byType[e2]++, r2.response?.status) {
      const t3 = r2.response.status;
      this.errorStats.byStatus[t3] = (this.errorStats.byStatus[t3] || 0) + 1;
    }
    this.errorStats.recent.unshift(r2), this.errorStats.recent.length > 10 && (this.errorStats.recent = this.errorStats.recent.slice(0, 10)), this.errorHistory.unshift({ error: r2, timestamp: t2, recovered: false }), this.errorHistory.length > 100 && (this.errorHistory = this.errorHistory.slice(0, 100)), this.updateErrorRate(), this.updateMostCommonError();
  }
  static async tryRecover(r2) {
    for (const t2 of this.recoveryStrategies) if (t2.canHandle(r2)) try {
      if (await t2.recover(r2)) {
        const t3 = this.errorHistory.find((t4) => t4.error === r2);
        return t3 && (t3.recovered = true), true;
      }
    } catch (r3) {
    }
    return false;
  }
  static addRecoveryStrategy(r2) {
    this.recoveryStrategies.push(r2), this.recoveryStrategies.sort((r3, t2) => (t2.priority || 0) - (r3.priority || 0));
  }
  static removeRecoveryStrategy(r2) {
    const t2 = this.recoveryStrategies.findIndex((t3) => t3.name === r2);
    return t2 > -1 && (this.recoveryStrategies.splice(t2, 1), true);
  }
  static getRecoveryStrategies() {
    return [...this.recoveryStrategies];
  }
  static getErrorType(r2) {
    return r2.isNetworkError ? exports.ErrorType.NETWORK : r2.isTimeoutError ? exports.ErrorType.TIMEOUT : r2.isCancelError ? exports.ErrorType.CANCEL : r2.response ? exports.ErrorType.HTTP : r2.code === exports.ErrorType.PARSE ? exports.ErrorType.PARSE : exports.ErrorType.UNKNOWN;
  }
  static updateErrorRate() {
    const r2 = Date.now() - 36e5, t2 = this.errorHistory.filter((t3) => t3.timestamp > r2);
    this.errorStats.errorRate = t2.length;
  }
  static updateMostCommonError() {
    let r2 = 0, t2 = null;
    for (const [e2, s2] of Object.entries(this.errorStats.byType)) s2 > r2 && (r2 = s2, t2 = e2);
    this.errorStats.mostCommon = t2 ? { type: t2, count: r2 } : null;
  }
  static getStats() {
    return { ...this.errorStats };
  }
  static getErrorHistory() {
    return [...this.errorHistory];
  }
  static resetStats() {
    this.errorStats = { total: 0, byType: { [exports.ErrorType.NETWORK]: 0, [exports.ErrorType.TIMEOUT]: 0, [exports.ErrorType.CANCEL]: 0, [exports.ErrorType.HTTP]: 0, [exports.ErrorType.PARSE]: 0, [exports.ErrorType.UNKNOWN]: 0 }, byStatus: {}, recent: [], errorRate: 0, mostCommon: null }, this.errorHistory = [];
  }
  static cleanupOldErrors(r2 = 864e5) {
    const t2 = Date.now() - r2, e2 = this.errorHistory.length;
    return this.errorHistory = this.errorHistory.filter((r3) => r3.timestamp > t2), e2 - this.errorHistory.length;
  }
}
o.ERROR_TEMPLATES = { [exports.ErrorType.NETWORK]: "Network Error: Unable to connect to the server", [exports.ErrorType.TIMEOUT]: (r2) => `Timeout Error: Request timed out after ${r2}ms`, [exports.ErrorType.CANCEL]: "Cancel Error: Request was cancelled", [exports.ErrorType.HTTP]: (r2, t2) => `HTTP Error ${r2}: ${t2}`, [exports.ErrorType.PARSE]: "Parse Error: Failed to parse response data", [exports.ErrorType.UNKNOWN]: "Unknown Error: An unexpected error occurred" }, o.errorStats = { total: 0, byType: { [exports.ErrorType.NETWORK]: 0, [exports.ErrorType.TIMEOUT]: 0, [exports.ErrorType.CANCEL]: 0, [exports.ErrorType.HTTP]: 0, [exports.ErrorType.PARSE]: 0, [exports.ErrorType.UNKNOWN]: 0 }, byStatus: {}, recent: [], errorRate: 0, mostCommon: null }, o.recoveryStrategies = [], o.errorHistory = [];
class a {
  constructor(r2 = {}) {
    this.config = { retries: r2.retries ?? 3, retryDelay: r2.retryDelay ?? 1e3, retryCondition: r2.retryCondition ?? o.isRetryableError, retryDelayFunction: r2.retryDelayFunction ?? this.defaultRetryDelayFunction };
  }
  async executeWithRetry(e2, s2) {
    let o2, a2 = 0;
    for (; a2 <= this.config?.retries; ) try {
      return await e2();
    } catch (r2) {
      if (o2 = r2, a2 >= this.config?.retries || !this.config?.retryCondition(o2)) throw o2;
      const e3 = this.config?.retryDelayFunction(a2, o2);
      await index.delay(e3), a2++;
    }
    throw o2 || index.createHttpError("Retry failed", { url: "" });
  }
  defaultRetryDelayFunction(r2, t2) {
    const e2 = this.config?.retryDelay * 2 ** r2, s2 = 0.1 * Math.random() * e2;
    return Math.min(e2 + s2, 3e4);
  }
  updateConfig(r2) {
    Object.assign(this.config, r2);
  }
  getConfig() {
    return { ...this.config };
  }
}

exports.ErrorHandler = o;
exports.RetryManager = a;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=error.cjs.map
