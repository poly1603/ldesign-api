/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { generateId as K } from './index.js';

var e, a, s;
(a = e || (e = {})).HTTP = "http", a.DATABASE = "database", a.CACHE = "cache", a.CUSTOM = "custom", (function(t2) {
  t2.PENDING = "pending", t2.SUCCESS = "success", t2.ERROR = "error", t2.CANCELLED = "cancelled";
})(s || (s = {}));
class r {
  constructor(t2 = {}) {
    this.traces = /* @__PURE__ */ new Map(), this.config = { enabled: t2.enabled ?? true, sampleRate: t2.sampleRate ?? 1, propagateTraceId: t2.propagateTraceId ?? true, traceIdHeader: t2.traceIdHeader ?? "X-Trace-Id", spanIdHeader: t2.spanIdHeader ?? "X-Span-Id", exporter: t2.exporter };
  }
  startTrace(t2, a2 = e.HTTP) {
    if (!this.shouldSample()) return new c();
    const r2 = this.generateTraceId(), o2 = { spanId: this.generateSpanId(), traceId: r2, name: t2, type: a2, startTime: Date.now(), status: s.PENDING, tags: [], logs: [] }, d2 = { traceId: r2, currentSpan: o2, spans: [o2], metadata: {} };
    return this.traces.set(r2, d2), new n(this, d2, o2);
  }
  getTrace(t2) {
    return this.traces.get(t2);
  }
  finishTrace(t2) {
    const e2 = this.traces.get(t2);
    if (e2) {
      if (this.config?.exporter) {
        const t3 = this.config?.exporter(e2.spans);
        t3 instanceof Promise && t3.catch((t4) => {
        });
      }
      this.traces.delete(t2);
    }
  }
  shouldSample() {
    return !!this.config?.enabled && Math.random() < this.config?.sampleRate;
  }
  generateTraceId() {
    return `trace-${K()}-${Date.now()}`;
  }
  generateSpanId() {
    return `span-${K()}`;
  }
  getConfig() {
    return this.config;
  }
}
class n {
  constructor(t2, e2, a2) {
    this.tracer = t2, this.context = e2, this.rootSpan = a2;
  }
  get traceId() {
    return this.context.traceId;
  }
  get spanId() {
    return this.rootSpan.spanId;
  }
  startSpan(a2, r2 = e.CUSTOM) {
    const n2 = { spanId: `span-${K()}`, parentSpanId: this.context.currentSpan?.spanId, traceId: this.context.traceId, name: a2, type: r2, startTime: Date.now(), status: s.PENDING, tags: [], logs: [] };
    return this.context.spans.push(n2), this.context.currentSpan = n2, new o(n2);
  }
  addTag(t2, e2) {
    return this.rootSpan.tags.push({ key: t2, value: e2 }), this;
  }
  addLog(t2, e2) {
    return this.rootSpan.logs.push({ timestamp: Date.now(), message: t2, data: e2 }), this;
  }
  setError(t2) {
    return this.rootSpan.status = s.ERROR, this.rootSpan.error = { message: t2.message, stack: t2.stack }, this;
  }
  finish(t2 = s.SUCCESS) {
    const e2 = Date.now();
    this.rootSpan.endTime = e2, this.rootSpan.duration = e2 - this.rootSpan.startTime, this.rootSpan.status = t2, this.tracer.finishTrace(this.context.traceId);
  }
  getSpans() {
    return [...this.context.spans];
  }
  getMetadata() {
    return this.context.metadata;
  }
  setMetadata(t2, e2) {
    return this.context.metadata[t2] = e2, this;
  }
}
class o {
  constructor(t2) {
    this.span = t2;
  }
  addTag(t2, e2) {
    return this.span.tags.push({ key: t2, value: e2 }), this;
  }
  addLog(t2, e2) {
    return this.span.logs.push({ timestamp: Date.now(), message: t2, data: e2 }), this;
  }
  setError(t2) {
    return this.span.status = s.ERROR, this.span.error = { message: t2.message, stack: t2.stack }, this;
  }
  finish(t2 = s.SUCCESS) {
    const e2 = Date.now();
    this.span.endTime = e2, this.span.duration = e2 - this.span.startTime, this.span.status = t2;
  }
  getRawSpan() {
    return this.span;
  }
}
class c extends n {
  constructor() {
    super(null, null, null);
  }
  startSpan() {
    return new d();
  }
  addTag() {
    return this;
  }
  addLog() {
    return this;
  }
  setError() {
    return this;
  }
  finish() {
  }
  getSpans() {
    return [];
  }
}
class d extends o {
  constructor() {
    super(null);
  }
  addTag() {
    return this;
  }
  addLog() {
    return this;
  }
  setError() {
    return this;
  }
  finish() {
  }
}
new r();

export { r as RequestTracer, o as Span, s as SpanStatus, e as SpanType, n as Trace };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=trace.js.map
