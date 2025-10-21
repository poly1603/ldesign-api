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

exports.RetryStrategy = void 0; var t;
(t = exports.RetryStrategy || (exports.RetryStrategy = {})).IMMEDIATE = "immediate", t.EXPONENTIAL = "exponential", t.LINEAR = "linear", t.FIXED = "fixed", t.NONE = "none";
class a {
  constructor(e2 = {}) {
    this.config = { maxRetries: e2.maxRetries ?? 3, baseDelay: e2.baseDelay ?? 1e3, maxDelay: e2.maxDelay ?? 3e4, checkNetworkStatus: e2.checkNetworkStatus ?? true, retryableStatusCodes: e2.retryableStatusCodes ?? a.DEFAULT_RETRYABLE_STATUS_CODES, nonRetryableStatusCodes: e2.nonRetryableStatusCodes ?? a.DEFAULT_NON_RETRYABLE_STATUS_CODES, customDecision: e2.customDecision };
  }
  shouldRetry(t2, a2) {
    if (a2 >= this.config?.maxRetries) return { shouldRetry: false, delay: 0, strategy: exports.RetryStrategy.NONE, reason: `\u5DF2\u8FBE\u5230\u6700\u5927\u91CD\u8BD5\u6B21\u6570 ${this.config?.maxRetries}` };
    if (this.config?.customDecision) {
      const e2 = this.config?.customDecision(t2, a2);
      if (e2) return e2;
    }
    if (this.config?.checkNetworkStatus && this.isOffline()) return { shouldRetry: false, delay: 0, strategy: exports.RetryStrategy.NONE, reason: "\u5F53\u524D\u7F51\u7EDC\u79BB\u7EBF" };
    const s2 = t2.response?.status;
    return s2 ? this.config?.nonRetryableStatusCodes.includes(s2) ? { shouldRetry: false, delay: 0, strategy: exports.RetryStrategy.NONE, reason: `\u72B6\u6001\u7801 ${s2} \u4E0D\u53EF\u91CD\u8BD5\uFF08\u5BA2\u6237\u7AEF\u9519\u8BEF\uFF09` } : this.config?.retryableStatusCodes.includes(s2) ? this.createRetryDecision(true, a2, this.getStrategyForStatusCode(s2), `\u72B6\u6001\u7801 ${s2} \u53EF\u91CD\u8BD5`) : s2 >= 500 && s2 < 600 ? this.createRetryDecision(true, a2, exports.RetryStrategy.EXPONENTIAL, `\u670D\u52A1\u5668\u9519\u8BEF ${s2}\uFF0C\u4F7F\u7528\u6307\u6570\u9000\u907F\u91CD\u8BD5`) : { shouldRetry: false, delay: 0, strategy: exports.RetryStrategy.NONE, reason: `\u72B6\u6001\u7801 ${s2} \u4E0D\u5728\u91CD\u8BD5\u8303\u56F4\u5185` } : this.createRetryDecision(true, a2, exports.RetryStrategy.EXPONENTIAL, "\u7F51\u7EDC\u9519\u8BEF\uFF0C\u4F7F\u7528\u6307\u6570\u9000\u907F\u91CD\u8BD5");
  }
  createRetryDecision(e2, t2, a2, s2) {
    return { shouldRetry: e2, delay: this.calculateDelay(t2, a2), strategy: a2, reason: s2 };
  }
  getStrategyForStatusCode(t2) {
    switch (t2) {
      case 429:
      default:
        return exports.RetryStrategy.EXPONENTIAL;
      case 503:
        return exports.RetryStrategy.LINEAR;
      case 504:
        return exports.RetryStrategy.FIXED;
    }
  }
  calculateDelay(t2, a2) {
    let s2;
    switch (a2) {
      case exports.RetryStrategy.IMMEDIATE:
        s2 = 0;
        break;
      case exports.RetryStrategy.EXPONENTIAL:
        s2 = this.config?.baseDelay * 2 ** t2;
        break;
      case exports.RetryStrategy.LINEAR:
        s2 = this.config?.baseDelay * t2;
        break;
      case exports.RetryStrategy.FIXED:
        s2 = this.config?.baseDelay;
        break;
      default:
        s2 = 0;
    }
    return s2 = this.addJitter(s2), Math.min(s2, this.config?.maxDelay);
  }
  addJitter(e2) {
    const t2 = 0.25 * e2;
    return e2 + (Math.random() * t2 * 2 - t2);
  }
  isOffline() {
    return typeof navigator < "u" && "onLine" in navigator && !navigator.onLine;
  }
  getRetryAdvice(e2) {
    const t2 = e2.response?.status;
    return t2 ? 429 === t2 ? "\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5" : t2 >= 500 ? "\u670D\u52A1\u5668\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5" : t2 >= 400 && t2 < 500 ? "\u8BF7\u6C42\u53C2\u6570\u6709\u8BEF\uFF0C\u8BF7\u68C0\u67E5\u540E\u91CD\u8BD5" : "\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5" : "\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8BBE\u7F6E\u540E\u91CD\u8BD5";
  }
}
a.DEFAULT_RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504], a.DEFAULT_NON_RETRYABLE_STATUS_CODES = [400, 401, 403, 404, 405, 422];
new a();

exports.SmartRetryManager = a;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=smartRetry.cjs.map
