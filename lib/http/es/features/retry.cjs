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

const t = { maxRetries: 3, initialDelay: 1e3, maxDelay: 3e4, backoffMultiplier: 2, enableJitter: true, shouldRetry: (t2, e2) => !!("NETWORK_ERROR" === t2.code || "TIMEOUT" === t2.code || t2.response && t2.response.status >= 500) };
function e(t2, e2) {
  if (e2.delayCalculator) return e2.delayCalculator(t2, e2);
  let r2 = e2.initialDelay * e2.backoffMultiplier ** (t2 - 1);
  return r2 = Math.min(r2, e2.maxDelay), e2.enableJitter && (r2 *= 0.5 + 0.5 * Math.random()), Math.floor(r2);
}
function r(t2) {
  return new Promise((e2) => setTimeout(e2, t2));
}
class a {
  constructor(e2 = {}) {
    this.config = { ...t, ...e2 };
  }
  async execute(t2) {
    const a2 = { attempt: 0, totalDelay: 0, errors: [], startTime: Date.now() };
    for (; a2.attempt <= this.config?.maxRetries; ) {
      a2.attempt++;
      try {
        return { success: true, data: await t2(), retryState: a2 };
      } catch (t3) {
        a2.errors.push(t3);
        const s2 = this.config?.shouldRetry?.(t3, a2.attempt) ?? true;
        if (a2.attempt > this.config?.maxRetries || !s2) return { success: false, error: t3, retryState: a2 };
        const o2 = e(a2.attempt, this.config);
        a2.totalDelay += o2, await r(o2);
      }
    }
    return { success: false, error: a2.errors[a2.errors.length - 1], retryState: a2 };
  }
  updateConfig(t2) {
    this.config = { ...this.config, ...t2 };
  }
  getConfig() {
    return { ...this.config };
  }
}
function s(t2) {
  return new a(t2);
}
s();

exports.DEFAULT_RETRY_CONFIG = t;
exports.RetryExecutor = a;
exports.calculateDelay = e;
exports.createRetryExecutor = s;
exports.delay = r;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=retry.cjs.map
