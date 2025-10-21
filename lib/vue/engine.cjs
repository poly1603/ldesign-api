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

var factory = require('../core/factory.cjs');
var version = require('../version.cjs');
var plugin = require('./plugin.cjs');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function createApiEnginePlugin(options = {}) {
  const { name = "api", version: pluginVersion = version.version, clientConfig = {}, globalInjection = true, globalPropertyName = "$api", globalConfig, client: providedClient, ...vueOptions } = options;
  return {
    name,
    version: pluginVersion,
    dependencies: [],
    async install(engine) {
      if (clientConfig.debug) {
        console.info(`[API Engine Plugin] Installing plugin "${name}"...`);
      }
      engine.events.once("app:created", async (vueApp) => {
        try {
          const apiEngine = providedClient || factory.createApiEngine({
            ...clientConfig,
            ...globalConfig
          });
          vueApp.use(plugin.ApiVuePlugin, {
            engine: apiEngine,
            config: globalConfig || clientConfig,
            globalPropertyName: globalInjection ? globalPropertyName : void 0,
            registerComposables: true,
            provideDependencyInjection: true,
            ...vueOptions
          });
          engine.apiEngine = apiEngine;
          if (clientConfig.debug) {
            console.info(`[API Engine Plugin] Plugin "${name}" installed successfully`);
          }
        } catch (error) {
          if (clientConfig.debug) {
            console.error(`[API Engine Plugin] Failed to install plugin "${name}":`, error);
          }
          throw error;
        }
      });
    },
    async uninstall(engine) {
      console.warn(`[API Engine Plugin] Uninstalling plugin "${name}"...`);
      if (engine.apiEngine) {
        engine.apiEngine.destroy();
        delete engine.apiEngine;
      }
      if (clientConfig.debug) {
        console.info(`[API Engine Plugin] Plugin "${name}" uninstalled successfully`);
      }
    }
  };
}
const defaultApiEnginePlugin = createApiEnginePlugin({
  name: "api",
  clientConfig: {
    debug: false,
    http: {
      timeout: 1e4,
      headers: {
        "Content-Type": "application/json"
      }
    },
    cache: {
      enabled: true,
      ttl: 3e5,
      // 5分钟
      maxSize: 100,
      storage: "memory"
    },
    debounce: {
      enabled: true,
      delay: 300
    },
    deduplication: {
      enabled: true
    }
  },
  globalInjection: true,
  globalPropertyName: "$api"
});
const apiPlugin = defaultApiEnginePlugin;
function createDevelopmentApiEnginePlugin(baseURL, options = {}) {
  return createApiEnginePlugin({
    ...options,
    clientConfig: {
      debug: true,
      http: {
        baseURL,
        timeout: 3e4,
        // 开发环境超时时间更长
        ...options.clientConfig?.http
      },
      cache: {
        enabled: false
        // 开发环境默认禁用缓存
      },
      ...options.clientConfig
    }
  });
}
function createProductionApiEnginePlugin(baseURL, options = {}) {
  return createApiEnginePlugin({
    ...options,
    clientConfig: {
      debug: false,
      http: {
        baseURL,
        timeout: 1e4,
        ...options.clientConfig?.http
      },
      cache: {
        enabled: true,
        ttl: 6e5,
        // 生产环境缓存时间更长
        maxSize: 200,
        storage: "memory"
      },
      debounce: {
        enabled: true,
        delay: 500
        // 生产环境防抖时间更长
      },
      deduplication: {
        enabled: true
      },
      ...options.clientConfig
    }
  });
}
function createApiEnginePluginByEnv(baseURL, options = {}) {
  const isDevelopment = typeof process !== "undefined" && process.env?.NODE_ENV === "development" || typeof ({ url: (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('vue/engine.cjs', document.baseURI).href)) }) !== "undefined" && undefined?.DEV || typeof ({ url: (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('vue/engine.cjs', document.baseURI).href)) }) !== "undefined" && undefined?.MODE === "development";
  if (isDevelopment) {
    return createDevelopmentApiEnginePlugin(baseURL, options);
  } else {
    return createProductionApiEnginePlugin(baseURL, options);
  }
}

exports.apiPlugin = apiPlugin;
exports.createApiEnginePlugin = createApiEnginePlugin;
exports.createApiEnginePluginByEnv = createApiEnginePluginByEnv;
exports.createDevelopmentApiEnginePlugin = createDevelopmentApiEnginePlugin;
exports.createProductionApiEnginePlugin = createProductionApiEnginePlugin;
exports.defaultApiEnginePlugin = defaultApiEnginePlugin;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=engine.cjs.map
