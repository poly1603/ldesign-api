/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { generateShortId } from '../utils/IdGenerator.js';

function createLoggingPlugin(options = {}) {
  const enabled = options.enabled ?? true;
  const requestIdHeader = options.requestIdHeader ?? "X-Request-Id";
  const requestIdFactory = options.requestIdFactory ?? (() => generateShortId(12));
  const level = options.logLevel ?? "info";
  const includeTimestamp = options.includeTimestamp ?? true;
  const includeRequestData = options.includeRequestData ?? true;
  const includeResponseData = options.includeResponseData ?? false;
  const log = (logLevel, ...args) => {
    if (!enabled)
      return;
    const timestamp = includeTimestamp ? (/* @__PURE__ */ new Date()).toISOString() : null;
    const prefix = timestamp ? `[API ${timestamp}]` : "[API]";
    switch (logLevel) {
      case "debug":
        break;
      case "warn":
        console.warn(prefix, ...args);
        break;
      case "error":
        console.error(prefix, ...args);
        break;
      default:
        console.info(prefix, ...args);
    }
  };
  return {
    name: "logging",
    version: "1.0.0",
    install(engine) {
      var _a, _b, _c, _d;
      (_a = engine.config).middlewares || (_a.middlewares = {});
      (_b = engine.config.middlewares).request || (_b.request = []);
      (_c = engine.config.middlewares).response || (_c.response = []);
      (_d = engine.config.middlewares).error || (_d.error = []);
      const reqMw = async (cfg, ctx) => {
        const id = requestIdFactory();
        cfg.headers = { ...cfg.headers || {}, [requestIdHeader]: id };
        cfg.__start = Date.now();
        cfg.__rid = id;
        const logData = { id };
        if (includeRequestData) {
          logData.params = cfg.params;
          logData.data = cfg.data;
        }
        log(level, "\u2192", ctx.methodName, cfg.method, cfg.url, logData);
        return cfg;
      };
      const resMw = async (res, ctx) => {
        const start = res?.config?.__start;
        const id = res?.config?.__rid;
        const cost = start ? Date.now() - start : void 0;
        const logData = { id, cost };
        if (includeResponseData) {
          logData.data = res?.data;
        }
        log(level, "\u2190", ctx.methodName, res?.status, logData);
        return res;
      };
      const errMw = async (err, ctx) => {
        const start = err?.config?.__start;
        const id = err?.config?.__rid;
        const cost = start ? Date.now() - start : void 0;
        log("error", "\xD7", ctx.methodName, err?.response?.status ?? "ERR", {
          id,
          cost,
          error: String(err),
          message: err?.message
        });
      };
      engine.config.middlewares.request.push(reqMw);
      engine.config.middlewares.response.push(resMw);
      engine.config.middlewares.error.push(errMw);
    }
  };
}

export { createLoggingPlugin };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=logging.js.map
