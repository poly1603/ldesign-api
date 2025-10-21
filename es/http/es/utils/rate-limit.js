/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class t {
  constructor(t2 = {}) {
    this.requests = [], this.config = { maxRequests: t2.maxRequests ?? 100, timeWindow: t2.timeWindow ?? 6e4, allowBurst: t2.allowBurst ?? false, burstSize: t2.burstSize ?? 10 }, this.burstTokens = this.config.burstSize;
  }
  canMakeRequest() {
    const t2 = Date.now();
    return this.requests = this.requests.filter((e2) => t2 - e2 < this.config.timeWindow), !!(this.requests.length < this.config.maxRequests || this.config.allowBurst && this.burstTokens > 0);
  }
  recordRequest() {
    const t2 = Date.now();
    this.requests = this.requests.filter((e2) => t2 - e2 < this.config.timeWindow), this.requests.length >= this.config.maxRequests && this.config.allowBurst && this.burstTokens > 0 && this.burstTokens--, this.requests.push(t2), this.scheduleBurstTokenRestore();
  }
  scheduleBurstTokenRestore() {
    this.config.allowBurst && this.burstTokens < this.config.burstSize && setTimeout(() => {
      this.burstTokens = Math.min(this.burstTokens + 1, this.config.burstSize);
    }, 1e3);
  }
  getNextAvailableTime() {
    return this.canMakeRequest() || 0 === this.requests.length ? 0 : Math.min(...this.requests) + this.config.timeWindow - Date.now();
  }
  async waitForAvailability() {
    const t2 = this.getNextAvailableTime();
    t2 > 0 && await new Promise((e2) => setTimeout(e2, t2));
  }
  async waitWithBackoff(t2 = 0) {
    const e2 = this.getNextAvailableTime();
    if (e2 <= 0) return;
    const s2 = Math.min(e2 * 2 ** t2, 3e4);
    await new Promise((t3) => setTimeout(t3, s2));
  }
  reset() {
    this.requests = [], this.burstTokens = this.config.burstSize;
  }
  getStatus() {
    const t2 = Date.now();
    return this.requests = this.requests.filter((e2) => t2 - e2 < this.config.timeWindow), { currentRequests: this.requests.length, maxRequests: this.config.maxRequests, timeWindow: this.config.timeWindow, nextAvailableTime: this.getNextAvailableTime(), isLimited: !this.canMakeRequest() };
  }
  updateConfig(t2) {
    Object.assign(this.config, t2), void 0 !== t2.burstSize && (this.burstTokens = Math.min(this.burstTokens, t2.burstSize));
  }
  getRequestHistory() {
    const t2 = Date.now();
    return this.requests.filter((e2) => t2 - e2 < this.config.timeWindow);
  }
  getCurrentRate() {
    const t2 = Date.now();
    return this.requests.filter((e2) => t2 - e2 < 1e3).length;
  }
  predictAvailabilityForBatch(t2) {
    const e2 = this.requests.length, s2 = this.config.maxRequests - e2;
    if (s2 >= t2) return 0;
    const i2 = t2 - s2;
    return i2 > this.requests.length ? this.config.timeWindow : [...this.requests].sort()[i2 - 1] + this.config.timeWindow - Date.now();
  }
}
new t();

export { t as RateLimitManager };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=rate-limit.js.map
