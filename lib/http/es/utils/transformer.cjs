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
  constructor(r2 = {}) {
    this.config = { transformDates: r2.transformDates ?? true, transformBigInt: r2.transformBigInt ?? false, nullToUndefined: r2.nullToUndefined ?? false, emptyStringToNull: r2.emptyStringToNull ?? false, datePattern: r2.datePattern ?? t.ISO_DATE_REGEX, customTransformers: r2.customTransformers ?? [] };
  }
  transform(t2) {
    return this.transformValue("root", t2);
  }
  transformValue(t2, r2) {
    for (const n2 of this.config?.customTransformers || []) {
      const e2 = n2(t2, r2);
      if (void 0 !== e2) return e2;
    }
    return null === r2 ? this.config?.nullToUndefined ? void 0 : null : void 0 !== r2 ? "string" == typeof r2 ? this.transformString(t2, r2) : Array.isArray(r2) ? r2.map((r3, n2) => this.transformValue(`${t2}[${n2}]`, r3)) : "object" == typeof r2 && null !== r2 ? this.transformObject(r2) : r2 : void 0;
  }
  transformString(t2, r2) {
    if ("" === r2 && this.config?.emptyStringToNull) return null;
    if (this.config?.transformDates && this.isDateField(t2, r2)) {
      const t3 = new Date(r2);
      if (!Number.isNaN(t3.getTime())) return t3;
    }
    if (this.config?.transformBigInt && this.isBigIntString(r2)) try {
      return BigInt(r2);
    } catch {
    }
    return r2;
  }
  transformObject(t2) {
    const r2 = {};
    for (const [n2, e2] of Object.entries(t2)) r2[n2] = this.transformValue(n2, e2);
    return r2;
  }
  isDateField(r2, n2) {
    const e2 = r2.toLowerCase(), s2 = t.DATE_FIELD_NAMES.some((t2) => e2.includes(t2.toLowerCase())), a2 = this.config?.datePattern.test(n2);
    return s2 || a2;
  }
  isBigIntString(t2) {
    if (!/^\d+$/.test(t2)) return false;
    const r2 = Number(t2);
    return r2 > Number.MAX_SAFE_INTEGER || r2 < Number.MIN_SAFE_INTEGER;
  }
  serialize(t2) {
    return this.serializeValue(t2);
  }
  serializeValue(t2) {
    if (t2 instanceof Date) return t2.toISOString();
    if ("bigint" == typeof t2) return t2.toString();
    if (Array.isArray(t2)) return t2.map((t3) => this.serializeValue(t3));
    if ("object" == typeof t2 && null !== t2) {
      const r2 = {};
      for (const [n2, e2] of Object.entries(t2)) r2[n2] = this.serializeValue(e2);
      return r2;
    }
    return t2;
  }
}
t.ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, t.DATE_FIELD_NAMES = ["date", "time", "createdAt", "updatedAt", "deletedAt", "publishedAt", "timestamp", "startTime", "endTime"];
new t();

exports.DataTransformer = t;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=transformer.cjs.map
