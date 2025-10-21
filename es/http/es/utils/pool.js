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
    this.connections = /* @__PURE__ */ new Map(), this.stats = { totalRequests: 0, connectionReuse: 0, connectionErrors: 0 }, this.waitingQueues = /* @__PURE__ */ new Map(), this.config = { maxConnections: 10, maxIdleConnections: 5, maxConnectionAge: 3e5, idleTimeout: 6e4, connectionTimeout: 3e4, keepAlive: true, keepAliveTimeout: 6e4, pipelining: false, maxPipelineLength: 10, ...t2 }, this.startCleanup();
  }
  async getConnection(t2) {
    const e2 = this.getConnectionKey(t2), n2 = this.connections.get(e2);
    if (n2) {
      const t3 = n2.length;
      for (let e3 = 0; e3 < t3; e3++) {
        const t4 = n2[e3];
        if ("idle" === t4.state && this.isConnectionValid(t4)) return this.markConnectionActive(t4), this.stats.connectionReuse++, t4;
      }
    }
    const o = n2 || [];
    let s = 0;
    const i = o.length;
    for (let t3 = 0; t3 < i; t3++) "active" === o[t3].state && s++;
    if (s >= this.config?.maxConnections) return this.waitForConnection(e2, t2);
    const c = await this.createConnection(t2);
    return o.push(c), this.connections.set(e2, o), c;
  }
  releaseConnection(t2) {
    const e2 = `${t2.protocol}//${t2.host}:${t2.port}`, n2 = this.connections.get(e2);
    if (!n2) return;
    const o = n2.find((e3) => e3.id === t2.id);
    o && (o.state = "idle", o.lastUsedAt = Date.now(), o.useCount++, this.trimIdleConnections(e2)), this.notifyWaiters(e2);
  }
  async createConnection(t2) {
    const e2 = new URL(t2.url || ""), n2 = { id: this.generateId(), host: e2.hostname, port: Number.parseInt(e2.port) || ("https:" === e2.protocol ? 443 : 80), protocol: e2.protocol, createdAt: Date.now(), lastUsedAt: Date.now(), useCount: 1, state: "active" };
    return this.stats.totalRequests++, this.config?.connectionTimeout > 0 && setTimeout(() => {
      "active" === n2.state && this.closeConnection(n2);
    }, this.config?.connectionTimeout), n2;
  }
  async waitForConnection(t2, e2) {
    return new Promise((e3, n2) => {
      const o = { resolve: e3, reject: n2, timestamp: Date.now() }, s = this.waitingQueues.get(t2) || [];
      s.push(o), this.waitingQueues.set(t2, s);
      const i = setTimeout(() => {
        const t3 = s.indexOf(o);
        -1 !== t3 && s.splice(t3, 1), n2(new Error("Connection pool timeout"));
      }, this.config?.connectionTimeout);
      o.timeout = i;
    });
  }
  markConnectionActive(t2) {
    t2.state = "active", t2.lastUsedAt = Date.now();
  }
  isConnectionValid(t2) {
    const e2 = Date.now();
    return !(e2 - t2.createdAt > this.config?.maxConnectionAge || "idle" === t2.state && e2 - t2.lastUsedAt > this.config?.idleTimeout) && "closed" !== t2.state;
  }
  closeConnection(t2) {
    t2.state = "closed";
    const e2 = `${t2.protocol}//${t2.host}:${t2.port}`, n2 = this.connections.get(e2);
    if (n2) {
      const e3 = n2.findIndex((e4) => e4.id === t2.id);
      -1 !== e3 && n2.splice(e3, 1);
    }
  }
  trimIdleConnections(t2) {
    const e2 = this.connections.get(t2);
    if (!e2) return;
    const n2 = e2.filter((t3) => "idle" === t3.state);
    if (n2.length > this.config?.maxIdleConnections) {
      n2.sort((t4, e3) => t4.lastUsedAt - e3.lastUsedAt);
      const t3 = n2.slice(0, n2.length - this.config?.maxIdleConnections);
      for (const e3 of t3) this.closeConnection(e3);
    }
  }
  notifyWaiters(t2) {
    const e2 = this.waitingQueues.get(t2);
    if (!e2 || 0 === e2.length) return;
    const n2 = (this.connections.get(t2) || []).find((t3) => "idle" === t3.state && this.isConnectionValid(t3));
    if (n2) {
      const o = e2.shift();
      if (o) {
        const s = o.timeout;
        s && clearTimeout(s), this.markConnectionActive(n2), o.resolve(n2), e2.length > 0 && this.notifyWaiters(t2);
      }
    }
  }
  getConnectionKey(t2) {
    const e2 = new URL(t2.url || "");
    return `${e2.protocol}//${e2.hostname}:${e2.port || ("https:" === e2.protocol ? 443 : 80)}`;
  }
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      for (const [t2, e2] of this.connections.entries()) {
        const n2 = e2.filter((t3) => !!this.isConnectionValid(t3) || (this.closeConnection(t3), false));
        0 === n2.length ? this.connections.delete(t2) : this.connections.set(t2, n2);
      }
    }, 1e4);
  }
  getStats() {
    let t2 = 0, e2 = 0, n2 = 0;
    for (const o2 of this.connections.values()) t2 += o2.length, e2 += o2.filter((t3) => "active" === t3.state).length, n2 += o2.filter((t3) => "idle" === t3.state).length;
    const o = t2 > 0 ? this.stats.totalRequests / t2 : 0;
    return { totalConnections: t2, activeConnections: e2, idleConnections: n2, totalRequests: this.stats.totalRequests, connectionReuse: this.stats.connectionReuse, averageRequestsPerConnection: o, connectionErrors: this.stats.connectionErrors };
  }
  getConnectionDetails() {
    return new Map(this.connections);
  }
  closeAll() {
    for (const t2 of this.connections.values()) for (const e2 of t2) this.closeConnection(e2);
    this.connections.clear();
  }
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  destroy() {
    this.cleanupTimer && clearInterval(this.cleanupTimer), this.closeAll();
  }
}
function e(e2) {
  return new t(e2);
}
e();

export { t as RequestPool, e as createRequestPool };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=pool.js.map
