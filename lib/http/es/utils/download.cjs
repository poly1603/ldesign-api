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

class e {
  constructor() {
    this.startTime = Date.now(), this.lastLoaded = 0, this.lastTime = Date.now(), this.speeds = [];
  }
  calculate(e2, t2, n2) {
    const a2 = Date.now(), o2 = a2 - this.lastTime, s2 = e2 - this.lastLoaded, i2 = o2 > 0 ? s2 / o2 * 1e3 : 0;
    this.speeds.push(i2), this.speeds.length > 10 && this.speeds.shift();
    const r2 = this.speeds.reduce((e3, t3) => e3 + t3, 0) / this.speeds.length, p2 = r2 > 0 ? (t2 - e2) / r2 : 0;
    return this.lastLoaded = e2, this.lastTime = a2, { loaded: e2, total: t2, percentage: t2 > 0 ? Math.round(e2 / t2 * 100) : 0, speed: r2, timeRemaining: p2, elapsed: a2 - this.startTime, filename: n2 };
  }
  reset() {
    this.startTime = Date.now(), this.lastLoaded = 0, this.lastTime = Date.now(), this.speeds = [];
  }
}
function t(e2) {
  const t2 = e2["content-disposition"] || e2["Content-Disposition"];
  if (!t2) return null;
  const n2 = t2.match(/filename\*=UTF-8''(.+)/i);
  if (n2) return decodeURIComponent(n2[1]);
  const a2 = t2.match(/filename="(.+)"/i);
  if (a2) return a2[1];
  const o2 = t2.match(/filename=([^;]+)/i);
  return o2 ? o2[1].trim() : null;
}
function n(e2) {
  try {
    return (new URL(e2).pathname.split("/").pop() || "download").split("?")[0];
  } catch {
    return "download";
  }
}
function a(e2) {
  const t2 = e2.split(".").pop()?.toLowerCase();
  return { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation", txt: "text/plain", csv: "text/csv", json: "application/json", xml: "application/xml", html: "text/html", css: "text/css", js: "application/javascript", mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", mp4: "video/mp4", avi: "video/x-msvideo", mov: "video/quicktime", zip: "application/zip", rar: "application/x-rar-compressed", "7z": "application/x-7z-compressed", tar: "application/x-tar", gz: "application/gzip" }[t2 || ""] || "application/octet-stream";
}
function o(e2, t2) {
  const n2 = URL.createObjectURL(e2), a2 = document.createElement("a");
  a2.href = n2, a2.download = t2, a2.style.display = "none", document.body.appendChild(a2), a2.click(), document.body.removeChild(a2), setTimeout(() => {
    URL.revokeObjectURL(n2);
  }, 100);
}

exports.DownloadProgressCalculator = e;
exports.getFilenameFromResponse = t;
exports.getFilenameFromURL = n;
exports.getMimeTypeFromFilename = a;
exports.saveFileToLocal = o;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=download.cjs.map
