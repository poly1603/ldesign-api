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

var systemApi = require('../plugins/systemApi.cjs');
var ApiEngine = require('./ApiEngine.cjs');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function createApiEngine(config = {}) {
  return new ApiEngine.ApiEngineImpl(config);
}
const DEFAULT_PRESETS = {
  base: {
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
  development: {
    debug: true,
    http: {
      timeout: 3e4
    },
    cache: {
      enabled: false
    }
  },
  production: {
    debug: false,
    http: {
      timeout: 1e4
    },
    cache: {
      enabled: true,
      ttl: 6e5,
      // 10分钟
      maxSize: 200,
      storage: "lru"
    },
    debounce: {
      enabled: true,
      delay: 500
    }
  },
  test: {
    debug: true,
    http: {
      timeout: 5e3
    },
    cache: {
      enabled: false
    },
    debounce: {
      enabled: false
    },
    deduplication: {
      enabled: false
    }
  }
};
function mergeConfig(baseURL, preset, options = {}) {
  return {
    ...preset,
    ...options,
    http: {
      baseURL,
      ...preset.http,
      ...options.http
    },
    cache: {
      ...preset.cache,
      ...options.cache
    },
    debounce: {
      ...preset.debounce,
      ...options.debounce
    },
    deduplication: {
      ...preset.deduplication,
      ...options.deduplication
    }
  };
}
function createApiEngineWithDefaults(baseURL, options = {}) {
  const config = mergeConfig(baseURL, DEFAULT_PRESETS.base, options);
  return new ApiEngine.ApiEngineImpl(config);
}
function createDevelopmentApiEngine(baseURL, options = {}) {
  const config = mergeConfig(baseURL, {
    ...DEFAULT_PRESETS.base,
    ...DEFAULT_PRESETS.development
  }, options);
  return new ApiEngine.ApiEngineImpl(config);
}
function createProductionApiEngine(baseURL, options = {}) {
  const config = mergeConfig(baseURL, {
    ...DEFAULT_PRESETS.base,
    ...DEFAULT_PRESETS.production
  }, options);
  return new ApiEngine.ApiEngineImpl(config);
}
function createTestApiEngine(baseURL, options = {}) {
  const config = mergeConfig(baseURL, {
    ...DEFAULT_PRESETS.base,
    ...DEFAULT_PRESETS.test
  }, options);
  return new ApiEngine.ApiEngineImpl(config);
}
function createApiEngineByEnv(baseURL, options = {}) {
  const nodeEnv = process?.env?.NODE_ENV;
  const viteEnv = typeof ({ url: (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('core/factory.cjs', document.baseURI).href)) }) !== "undefined" ? undefined : void 0;
  const hasNodeEnv = typeof nodeEnv === "string" && nodeEnv.length > 0;
  const isDevelopment = hasNodeEnv ? nodeEnv === "development" : viteEnv?.DEV === true || viteEnv?.MODE === "development";
  const isTest = hasNodeEnv ? nodeEnv === "test" : viteEnv?.MODE === "test";
  if (isTest) {
    return createTestApiEngine(baseURL, options);
  } else if (isDevelopment) {
    return createDevelopmentApiEngine(baseURL, options);
  } else {
    return createProductionApiEngine(baseURL, options);
  }
}
async function createApiEngineWithPlugins(config, plugins) {
  const engine = createApiEngine(config);
  for (const plugin of plugins) {
    await engine.use(plugin);
  }
  return engine;
}
async function createSystemApiEngine(baseURL, options = {}) {
  const engine = createApiEngineWithDefaults(baseURL, options);
  await engine.use(systemApi.systemApiPlugin);
  return engine;
}
async function createSystemApiEngineByEnv(baseURL, options = {}) {
  const engine = createApiEngineByEnv(baseURL, options);
  await engine.use(systemApi.systemApiPlugin);
  return engine;
}
function createSingletonApiEngine(config) {
  const globalKey = "__LDESIGN_API_ENGINE_SINGLETON__";
  const g = globalThis;
  if (typeof g !== "undefined") {
    if (!g[globalKey] && config) {
      g[globalKey] = createApiEngine(config);
    }
    return g[globalKey];
  }
  return createApiEngine(config || {});
}
function destroySingletonApiEngine() {
  const globalKey = "__LDESIGN_API_ENGINE_SINGLETON__";
  const g = globalThis;
  if (typeof g !== "undefined" && g[globalKey]) {
    g[globalKey].destroy();
    delete g[globalKey];
  }
}

exports.createApiEngine = createApiEngine;
exports.createApiEngineByEnv = createApiEngineByEnv;
exports.createApiEngineWithDefaults = createApiEngineWithDefaults;
exports.createApiEngineWithPlugins = createApiEngineWithPlugins;
exports.createDevelopmentApiEngine = createDevelopmentApiEngine;
exports.createProductionApiEngine = createProductionApiEngine;
exports.createSingletonApiEngine = createSingletonApiEngine;
exports.createSystemApiEngine = createSystemApiEngine;
exports.createSystemApiEngineByEnv = createSystemApiEngineByEnv;
exports.createTestApiEngine = createTestApiEngine;
exports.destroySingletonApiEngine = destroySingletonApiEngine;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=factory.cjs.map
