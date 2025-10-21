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
import { version } from '../version.js';
import { ApiVuePlugin } from './plugin.js';

function createApiEnginePlugin(options = {}) {
  const { name = "api", version: pluginVersion = version, clientConfig = {}, globalInjection = true, globalPropertyName = "$api", globalConfig, client: providedClient, ...vueOptions } = options;
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
          const apiEngine = providedClient || createApiEngine({
            ...clientConfig,
            ...globalConfig
          });
          vueApp.use(ApiVuePlugin, {
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
  const isDevelopment = typeof process !== "undefined" && process.env?.NODE_ENV === "development" || typeof import.meta !== "undefined" && import.meta.env?.DEV || typeof import.meta !== "undefined" && import.meta.env?.MODE === "development";
  if (isDevelopment) {
    return createDevelopmentApiEnginePlugin(baseURL, options);
  } else {
    return createProductionApiEnginePlugin(baseURL, options);
  }
}

export { apiPlugin, createApiEnginePlugin, createApiEnginePluginByEnv, createDevelopmentApiEnginePlugin, createProductionApiEnginePlugin, defaultApiEnginePlugin };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=engine.js.map
