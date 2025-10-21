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

class e extends Error {
  constructor(e2, t2, i2) {
    super(e2), this.file = t2, this.code = i2, this.name = "FileValidationError";
  }
}
function t(t2, a2) {
  if (a2.accept && a2.accept.length > 0) {
    const i2 = t2.type, s2 = t2.name.toLowerCase();
    if (!a2.accept.some((e2) => e2.startsWith(".") ? s2.endsWith(e2.toLowerCase()) : !!e2.includes("/") && (i2 === e2 || i2.startsWith(e2.replace("*", ""))))) throw new e(`\u6587\u4EF6\u7C7B\u578B\u4E0D\u88AB\u5141\u8BB8: ${i2}`, t2, "TYPE_NOT_ALLOWED");
  }
  if (a2.maxSize && t2.size > a2.maxSize) throw new e(`\u6587\u4EF6\u5927\u5C0F\u8D85\u51FA\u9650\u5236: ${i(t2.size)} > ${i(a2.maxSize)}`, t2, "SIZE_TOO_LARGE");
  if (0 === t2.size) throw new e("\u6587\u4EF6\u4E3A\u7A7A", t2, "INVALID_FILE");
}
function i(e2) {
  if (0 === e2) return "0 B";
  const t2 = Math.floor(Math.log(e2) / Math.log(1024));
  return `${Number.parseFloat((e2 / 1024 ** t2).toFixed(2))} ${["B", "KB", "MB", "GB", "TB"][t2]}`;
}
function o(e2, t2, i2) {
  const a2 = new FormData(), s2 = t2.fileField || "file";
  return a2.append(s2, e2), t2.formData && Object.entries(t2.formData).forEach(([e3, t3]) => {
    a2.append(e3, t3);
  }), a2.append("fileName", e2.name), a2.append("fileSize", e2.size.toString()), a2.append("fileType", e2.type), a2;
}
class r {
  constructor() {
    this.startTime = Date.now(), this.lastLoaded = 0, this.lastTime = Date.now(), this.speeds = [];
  }
  calculate(e2, t2, i2) {
    const a2 = Date.now(), s2 = a2 - this.lastTime, n2 = e2 - this.lastLoaded, o2 = s2 > 0 ? n2 / s2 * 1e3 : 0;
    this.speeds.push(o2), this.speeds.length > 10 && this.speeds.shift();
    const r2 = this.speeds.reduce((e3, t3) => e3 + t3, 0) / this.speeds.length, l2 = r2 > 0 ? (t2 - e2) / r2 : 0;
    return this.lastLoaded = e2, this.lastTime = a2, { loaded: e2, total: t2, percentage: t2 > 0 ? Math.round(e2 / t2 * 100) : 0, speed: r2, timeRemaining: l2, elapsed: a2 - this.startTime, file: i2 };
  }
  reset() {
    this.startTime = Date.now(), this.lastLoaded = 0, this.lastTime = Date.now(), this.speeds = [];
  }
}

exports.FileValidationError = e;
exports.ProgressCalculator = r;
exports.createUploadFormData = o;
exports.formatFileSize = i;
exports.validateFile = t;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=upload.cjs.map
