/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { SYSTEM_API_METHODS } from '../types/index.js';

function defaultIsUnauthorized(error) {
  const anyErr = error;
  return anyErr?.status === 401 || anyErr?.statusCode === 401 || anyErr?.response?.status === 401;
}
function defaultGet(key) {
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : void 0;
  } catch {
    return void 0;
  }
}
function defaultSet(key, value) {
  try {
    if (typeof localStorage === "undefined")
      return;
    if (value)
      localStorage.setItem(key, value);
    else
      localStorage.removeItem(key);
  } catch {
  }
}
function createAuthMiddlewaresPlugin(options = {}) {
  const headerName = options.headerName ?? "Authorization";
  const scheme = options.scheme ?? "Bearer ";
  const isUnauthorized = options.isUnauthorized ?? defaultIsUnauthorized;
  const getAccessToken = options.getAccessToken ?? (() => defaultGet("access_token"));
  const setAccessToken = options.setAccessToken ?? ((v) => defaultSet("access_token", v ?? void 0));
  options.getRefreshToken ?? (() => defaultGet("refresh_token"));
  const setRefreshToken = options.setRefreshToken ?? ((v) => defaultSet("refresh_token", v ?? void 0));
  return {
    name: "auth-middlewares",
    version: "1.0.0",
    install(engine) {
      var _a, _b, _c, _d;
      (_a = engine.config).middlewares || (_a.middlewares = {});
      (_b = engine.config.middlewares).request || (_b.request = []);
      (_c = engine.config.middlewares).error || (_c.error = []);
      const reqMw = (cfg) => {
        const token = getAccessToken();
        if (token) {
          cfg.headers = { ...cfg.headers || {}, [headerName]: `${scheme}${token}` };
        }
        return cfg;
      };
      const errMw = async (err) => {
        if (!isUnauthorized(err))
          return;
        if (options.refresh) {
          await options.refresh(engine);
          return;
        }
        if (engine.hasMethod?.(SYSTEM_API_METHODS.REFRESH_TOKEN)) {
          try {
            const result = await engine.call(SYSTEM_API_METHODS.REFRESH_TOKEN);
            if (result?.accessToken)
              setAccessToken(result.accessToken);
            if (result?.refreshToken)
              setRefreshToken(result.refreshToken);
          } catch {
            setAccessToken(null);
            setRefreshToken(null);
          }
        }
      };
      engine.config.middlewares.request.push(reqMw);
      engine.config.middlewares.error.push(errMw);
      (_d = engine.config).retry || (_d.retry = {});
      if (engine.config.retry.enabled === void 0) {
        engine.config.retry.enabled = true;
        engine.config.retry.retries = Math.max(1, engine.config.retry.retries || 1);
        engine.config.retry.delay = engine.config.retry.delay || 0;
      }
      engine.__auth_mw__ = { reqMw, errMw };
    },
    uninstall(engine) {
      const ref = engine.__auth_mw__;
      if (!ref)
        return;
      const { reqMw, errMw } = ref;
      const reqs = engine.config.middlewares?.request || [];
      const errs = engine.config.middlewares?.error || [];
      engine.config.middlewares.request = reqs.filter((mw) => mw !== reqMw);
      engine.config.middlewares.error = errs.filter((mw) => mw !== errMw);
      delete engine.__auth_mw__;
    }
  };
}
const authMiddlewaresPlugin = createAuthMiddlewaresPlugin();

export { authMiddlewaresPlugin, createAuthMiddlewaresPlugin };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=auth.js.map
