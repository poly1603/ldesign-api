/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { RequestThrottler } from '../utils/RequestThrottler.js';

function createRateLimitPlugin(options = {}) {
  const requestsPerSecond = options.requestsPerSecond ?? 10;
  const maxBurst = options.maxBurst ?? requestsPerSecond;
  const enabled = options.enabled ?? true;
  const bucketKey = options.bucketKey ?? ((name) => name);
  const buckets = /* @__PURE__ */ new Map();
  const getLimiter = (name) => {
    const key = bucketKey(name);
    if (!buckets.has(key)) {
      buckets.set(key, new RequestThrottler({
        requestsPerSecond,
        maxBurst,
        enabled
      }));
    }
    return buckets.get(key);
  };
  return {
    name: "rate-limit",
    version: "1.0.0",
    install(engine) {
      var _a, _b;
      (_a = engine.config).middlewares || (_a.middlewares = {});
      (_b = engine.config.middlewares).request || (_b.request = []);
      const reqMw = async (cfg, ctx) => {
        await getLimiter(ctx.methodName).acquire();
        return cfg;
      };
      engine.config.middlewares.request.push(reqMw);
    }
  };
}

export { createRateLimitPlugin };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=rateLimit.js.map
