/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function createRestApiPlugin(options) {
  const { resource, basePath, idParam = "id", methods = { list: true, get: true, create: true, update: true, remove: true }, listCacheTtl = 5 * 60 * 1e3, enableListCache = true, onSuccess } = options;
  const names = {
    list: `${resource}.list`,
    get: `${resource}.get`,
    create: `${resource}.create`,
    update: `${resource}.update`,
    remove: `${resource}.remove`
  };
  const resolvePath = (tpl, src) => {
    let result = tpl;
    const mapping = options.pathParams?.(src);
    if (mapping && typeof mapping === "object") {
      for (const [k, v] of Object.entries(mapping)) {
        const enc = encodeURIComponent(String(v));
        result = result.replace(new RegExp(`:${k}(?=$|[\\/\\?&#])`, "g"), enc);
        result = result.replace(new RegExp(`{${k}}`, "g"), enc);
      }
    }
    const val = src?.[idParam];
    if (typeof val !== "undefined" && val !== null && val !== "") {
      const enc = encodeURIComponent(String(val));
      const withColon = result.replace(new RegExp(`:${idParam}(?=$|[\\/\\?&#])`, "g"), enc);
      const withBraces = withColon.replace(new RegExp(`{${idParam}}`, "g"), enc);
      if (withBraces !== result)
        return withBraces;
      return `${result}/${enc}`;
    }
    return result;
  };
  const stripIdFromParams = (params) => {
    if (!params)
      return params;
    const clone = { ...params };
    delete clone[idParam];
    return clone;
  };
  const apis = {};
  if (methods.list) {
    apis[names.list] = {
      name: names.list,
      config: (params) => ({ method: "GET", url: basePath, params: options.map?.listParams ? options.map.listParams(params) : params }),
      transform: options.transform?.list,
      validate: options.validate?.list,
      cache: enableListCache ? { enabled: true, ttl: listCacheTtl } : { enabled: false }
    };
  }
  if (methods.get) {
    apis[names.get] = {
      name: names.get,
      config: (params) => ({
        method: "GET",
        url: resolvePath(basePath, params),
        params: options.map?.getParams ? options.map.getParams(stripIdFromParams(params) || {}) : stripIdFromParams(params)
      }),
      transform: options.transform?.get,
      validate: options.validate?.get,
      cache: { enabled: true, ttl: listCacheTtl }
    };
  }
  if (methods.create) {
    apis[names.create] = {
      name: names.create,
      config: (data) => ({ method: "POST", url: basePath, data: options.map?.createData ? options.map.createData(data) : data }),
      transform: options.transform?.create,
      validate: options.validate?.create,
      // onSuccess 将在 install 中统一包装，以便拿到 engine 实例并清理缓存
      cache: { enabled: false }
    };
  }
  if (methods.update) {
    apis[names.update] = {
      name: names.update,
      config: (data) => ({ method: "PUT", url: resolvePath(basePath, data), data: options.map?.updateData ? options.map.updateData(data) : data }),
      transform: options.transform?.update,
      validate: options.validate?.update,
      // onSuccess 将在 install 中统一包装
      cache: { enabled: false }
    };
  }
  if (methods.remove) {
    apis[names.remove] = {
      name: names.remove,
      config: (data) => ({ method: "DELETE", url: resolvePath(basePath, data), data: options.map?.removeData ? options.map.removeData(data) : data }),
      transform: options.transform?.remove,
      validate: options.validate?.remove,
      // onSuccess 将在 install 中统一包装
      cache: { enabled: false }
    };
  }
  return {
    name: `rest-${resource}`,
    version: "1.0.0",
    apis,
    install(engine) {
      const clearList = () => engine.clearCache?.(names.list);
      const clearGet = () => engine.clearCache?.(names.get);
      const wrap = (methodName, cfg) => ({
        ...cfg,
        onSuccess: (data) => {
          try {
            cfg.onSuccess?.(data);
          } catch {
          }
          if (methodName === names.create || methodName === names.update || methodName === names.remove) {
            clearList();
            clearGet();
          }
          try {
            onSuccess?.(methodName, data, engine);
          } catch {
          }
        }
      });
      for (const k of Object.keys(apis)) {
        const cfg = engine.methods.get(k) || apis[k];
        engine.register(k, wrap(k, cfg));
      }
    }
  };
}

export { createRestApiPlugin };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=rest.js.map
