/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { createApiEngine } from '../core/factory.js';

const API_ENGINE_INJECTION_KEY = Symbol("api-engine");
const ApiVuePlugin = {
  install(app, options = {}) {
    const {
      engine: providedEngine,
      config = {},
      globalPropertyName = "$api",
      // registerComposables 目前未使用，保留以兼容未来扩展
      registerComposables: _registerComposables = true,
      provideDependencyInjection = true,
      injectionKey = API_ENGINE_INJECTION_KEY,
      debug = false,
      showInstallInfo = true
    } = options;
    try {
      const engine = providedEngine || createApiEngine(config);
      if (globalPropertyName) {
        app.config.globalProperties[globalPropertyName] = engine;
      }
      if (provideDependencyInjection) {
        app.provide(injectionKey, engine);
      }
      app._apiEngine = engine;
      const isDev = typeof process !== "undefined" && process.env?.NODE_ENV === "development";
      if ((debug || config.debug || isDev) && showInstallInfo) {
        console.info("[API Vue Plugin] Vue \u63D2\u4EF6\u5DF2\u5B89\u88C5", {
          globalProperty: globalPropertyName,
          dependencyInjection: provideDependencyInjection,
          engineProvided: !!providedEngine
        });
      }
    } catch (error) {
      console.error("[API Vue Plugin] \u63D2\u4EF6\u5B89\u88C5\u5931\u8D25:", error);
      throw error;
    }
  }
};
function createApiVuePlugin(options = {}) {
  return {
    install(app) {
      ApiVuePlugin.install(app, options);
    }
  };
}
function installApiVuePlugin(app, options = {}) {
  app.use(ApiVuePlugin, options);
}
function getApiEngineFromApp(app) {
  return app._apiEngine;
}

export { API_ENGINE_INJECTION_KEY, ApiVuePlugin, createApiVuePlugin, getApiEngineFromApp, installApiVuePlugin };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=plugin.js.map
