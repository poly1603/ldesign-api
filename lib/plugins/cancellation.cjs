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

var RequestCancellation = require('../utils/RequestCancellation.cjs');

function createCancellationPlugin(options = {}) {
  const config = {
    enabled: true,
    globalTimeout: 0,
    cancelOnUnload: true,
    cancelOnRouteChange: false,
    onCancel: () => {
    },
    ...options
  };
  let cancellationManager = null;
  const requestTokens = /* @__PURE__ */ new Map();
  const requestMiddleware = async (reqConfig, ctx) => {
    if (!config.enabled || !cancellationManager) {
      return reqConfig;
    }
    const key = `${ctx.methodName}:${Date.now()}`;
    const token = cancellationManager.createToken(key);
    requestTokens.set(key, token);
    reqConfig.__cancellationToken = token;
    reqConfig.__cancellationKey = key;
    if (config.globalTimeout > 0) {
      setTimeout(() => {
        if (!token.isCancelled) {
          token.cancel("Request timeout");
          config.onCancel(ctx.methodName, "timeout");
        }
      }, config.globalTimeout);
    }
    token.onCancel(() => {
      requestTokens.delete(key);
    });
    return reqConfig;
  };
  const handleUnload = () => {
    if (cancellationManager) {
      cancellationManager.cancelAll("Page unload");
      requestTokens.clear();
    }
  };
  const handleRouteChange = () => {
    if (cancellationManager) {
      cancellationManager.cancelAll("Route change");
      requestTokens.clear();
    }
  };
  return {
    name: "cancellation",
    version: "1.0.0",
    install(engine) {
      var _a, _b;
      cancellationManager = RequestCancellation.createRequestCancellationManager();
      (_a = engine.config).middlewares || (_a.middlewares = {});
      (_b = engine.config.middlewares).request || (_b.request = []);
      engine.config.middlewares.request.push(requestMiddleware);
      if (config.cancelOnUnload && typeof window !== "undefined") {
        window.addEventListener("beforeunload", handleUnload);
        window.addEventListener("unload", handleUnload);
      }
      engine.__cancellationPlugin = {
        cancelAll: (reason) => {
          if (cancellationManager) {
            cancellationManager.cancelAll(reason);
            requestTokens.clear();
          }
        },
        cancelByMethod: (methodName, reason) => {
          for (const [key, token] of requestTokens.entries()) {
            if (key.startsWith(`${methodName}:`)) {
              token.cancel(reason || "Cancelled by method");
              requestTokens.delete(key);
            }
          }
        },
        onRouteChange: handleRouteChange
      };
    },
    uninstall(engine) {
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeunload", handleUnload);
        window.removeEventListener("unload", handleUnload);
      }
      if (cancellationManager) {
        cancellationManager.cancelAll("Plugin uninstalled");
        requestTokens.clear();
      }
      delete engine.__cancellationPlugin;
    }
  };
}
function getCancellationAPI(engine) {
  return engine.__cancellationPlugin || null;
}

exports.createCancellationPlugin = createCancellationPlugin;
exports.getCancellationAPI = getCancellationAPI;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=cancellation.cjs.map
