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

exports.NetworkStatus = void 0; var e; exports.ConnectionType = void 0;
(e = exports.NetworkStatus || (exports.NetworkStatus = {})).ONLINE = "online", e.OFFLINE = "offline", e.UNKNOWN = "unknown", (function(n2) {
  n2.WIFI = "wifi", n2.CELLULAR_4G = "4g", n2.CELLULAR_3G = "3g", n2.CELLULAR_2G = "2g", n2.UNKNOWN = "unknown";
})(exports.ConnectionType || (exports.ConnectionType = {}));
class i {
  constructor(e2 = {}) {
    this.currentStatus = exports.NetworkStatus.UNKNOWN, this.listeners = [], this.isMonitoring = false, this.config = { enabled: e2.enabled ?? true, pauseOnOffline: e2.pauseOnOffline ?? true, retryOnOnline: e2.retryOnOnline ?? true, onStatusChange: e2.onStatusChange, onOffline: e2.onOffline, onOnline: e2.onOnline }, this.updateStatus();
  }
  start() {
    if (!this.config?.enabled || this.isMonitoring || typeof window > "u") return;
    this.isMonitoring = true;
    const e2 = () => {
      this.handleStatusChange(exports.NetworkStatus.ONLINE), this.config?.onOnline?.();
    }, t2 = () => {
      this.handleStatusChange(exports.NetworkStatus.OFFLINE), this.config?.onOffline?.();
    };
    if (window.addEventListener("online", e2), window.addEventListener("offline", t2), this.listeners.push(() => window.removeEventListener("online", e2), () => window.removeEventListener("offline", t2)), "connection" in navigator || "mozConnection" in navigator || "webkitConnection" in navigator) {
      const n2 = navigator.connection || navigator.mozConnection || navigator.webkitConnection, e3 = () => {
        this.updateStatus();
      };
      n2.addEventListener("change", e3), this.listeners.push(() => n2.removeEventListener("change", e3));
    }
  }
  stop() {
    this.isMonitoring && (this.isMonitoring = false, this.listeners.forEach((n2) => n2()), this.listeners = []);
  }
  getStatus() {
    return this.currentStatus;
  }
  isOnline() {
    return this.currentStatus === exports.NetworkStatus.ONLINE;
  }
  isOffline() {
    return this.currentStatus === exports.NetworkStatus.OFFLINE;
  }
  getNetworkInfo() {
    const n2 = { online: this.isOnline(), connectionType: exports.ConnectionType.UNKNOWN, metered: false };
    if (typeof navigator > "u") return n2;
    const e2 = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return e2 && (e2.effectiveType && (n2.effectiveType = e2.effectiveType, n2.connectionType = this.parseConnectionType(e2.effectiveType)), "boolean" == typeof e2.saveData && (n2.metered = e2.saveData), "number" == typeof e2.downlink && (n2.downlink = e2.downlink), "number" == typeof e2.rtt && (n2.rtt = e2.rtt)), n2;
  }
  handleStatusChange(n2) {
    if (this.currentStatus === n2) return;
    this.currentStatus = n2;
    const e2 = this.getNetworkInfo();
    this.config?.onStatusChange?.(n2, e2);
  }
  updateStatus() {
    typeof navigator < "u" && "onLine" in navigator ? this.currentStatus = navigator.onLine ? exports.NetworkStatus.ONLINE : exports.NetworkStatus.OFFLINE : this.currentStatus = exports.NetworkStatus.UNKNOWN;
  }
  parseConnectionType(n2) {
    switch (n2.toLowerCase()) {
      case "4g":
        return exports.ConnectionType.CELLULAR_4G;
      case "3g":
        return exports.ConnectionType.CELLULAR_3G;
      case "2g":
        return exports.ConnectionType.CELLULAR_2G;
      case "wifi":
        return exports.ConnectionType.WIFI;
      default:
        return exports.ConnectionType.UNKNOWN;
    }
  }
  isSuitableForLargeTransfer() {
    const n2 = this.getNetworkInfo();
    return !(!n2.online || n2.metered || n2.connectionType === exports.ConnectionType.CELLULAR_2G || n2.connectionType === exports.ConnectionType.CELLULAR_3G || n2.downlink && n2.downlink < 1);
  }
  destroy() {
    this.stop();
  }
}
const r = new i();
typeof window < "u" && r.start();

exports.NetworkMonitor = i;
exports.globalNetworkMonitor = r;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=network.cjs.map
