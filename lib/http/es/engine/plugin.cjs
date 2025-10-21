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

var index = require('../adapters/index.cjs');
var client = require('../client.cjs');
var plugin = require('../vue/plugin.cjs');

function o(o2 = {}) {
  const { name: i2 = "http", version: l2 = "1.0.0", clientConfig: r2 = {}, globalPropertyName: a = "$http", client: p, globalConfig: g, ...c } = o2;
  return { name: i2, version: l2, dependencies: [], async install(o3) {
    try {
      if (o3 && "object" == typeof o3.config && "function" == typeof o3.provide) {
        const n2 = o3;
        await (async () => {
          const o4 = p || (() => {
            const n3 = index.createAdapter(r2.adapter);
            return new client.HttpClientImpl({ ...r2, ...g }, n3);
          })(), i3 = { get: (e2, t2) => o4.get(e2, t2), post: (e2, t2, n3) => o4.post(e2, t2, n3), put: (e2, t2, n3) => o4.put(e2, t2, n3), delete: (e2, t2) => o4.delete(e2, t2), patch: (e2, t2, n3) => o4.patch(e2, t2, n3), head: (e2, t2) => o4.head(e2, t2), options: (e2, t2) => o4.options(e2, t2), upload: (e2, t2, n3) => o4.upload ? o4.upload(e2, t2, n3) : o4.post(e2, t2, n3), download: (e2, t2) => o4.download ? o4.download(e2, t2) : o4.get(e2, t2) };
          try {
            n2.config && n2.config.globalProperties && (n2.config.globalProperties.$http = i3, n2.config.globalProperties.$httpClient = o4);
          } catch (e2) {
          }
          try {
            "function" == typeof n2.provide && (n2.provide("http", i3), n2.provide("httpClient", o4));
          } catch (e2) {
          }
        })();
      } else {
        const s = o3.engine || o3;
        if (!s || "function" != typeof s.getApp) return;
        const u = async () => {
          const o4 = s.getApp();
          if (!o4) throw new Error("Vue app not found. Make sure the engine has created a Vue app before installing HTTP plugin.");
          const u2 = p || (() => {
            const n2 = index.createAdapter(r2.adapter);
            return new client.HttpClientImpl({ ...r2, ...g }, n2);
          })();
          o4.use(plugin.HttpPlugin, { client: u2, globalConfig: g || r2, globalProperty: a, ...c }), s.http ? s.http.setInstance(u2) : s.httpClient = u2, s.logger && s.logger.info(`${i2} plugin installed successfully`, { version: l2, clientType: u2.constructor.name });
        };
        s.getApp() ? (s.logger && s.logger.info("[HTTP Plugin] Vue app found, installing immediately"), await u()) : (s.logger && s.logger.info("[HTTP Plugin] Vue app not found, registering event listener"), await new Promise((e2, t2) => {
          s.events.once("app:created", async () => {
            try {
              s.logger && s.logger.info("[HTTP Plugin] app:created event received, installing now"), await u(), e2();
            } catch (e3) {
              s.logger && s.logger.error("[HTTP Plugin] Failed to install after app creation:", e3), t2(e3);
            }
          });
        })), s.logger && s.logger.info(`${i2} plugin registered, waiting for Vue app creation...`);
      }
    } catch (e2) {
      throw e2;
    }
  }, async uninstall(e2) {
    try {
      const t2 = e2.engine || e2;
      if (!t2) throw new Error("Invalid engine context");
      if (t2.httpClient) {
        const e3 = t2.httpClient;
        e3.cancelAll(), e3.clearCache(), delete t2.httpClient;
      }
      t2.logger.info(`${i2} plugin uninstalled successfully`);
    } catch (t2) {
      const n2 = e2.engine || e2;
      throw n2 && n2.logger && n2.logger.error(`Failed to uninstall ${i2} plugin:`, t2), t2;
    }
  } };
}
o({ globalInjection: true, globalPropertyName: "$http", clientConfig: { timeout: 1e4, headers: { "Content-Type": "application/json" } } });

exports.createHttpEnginePlugin = o;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=plugin.cjs.map
