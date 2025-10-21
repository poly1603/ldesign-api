/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function createOfflineCachePlugin(options = {}) {
  const cfg = {
    enabled: options.enabled ?? true,
    keyGenerator: options.keyGenerator ?? ((name, params) => `${name}:${JSON.stringify(params ?? {})}`),
    ttl: options.ttl ?? 10 * 60 * 1e3,
    include: options.include ?? [],
    exclude: options.exclude ?? [],
    onlyOnNetworkError: options.onlyOnNetworkError ?? true
  };
  function shouldApply(methodName) {
    if (!cfg.enabled)
      return false;
    if (cfg.include.length > 0 && !cfg.include.includes(methodName))
      return false;
    if (cfg.exclude.length > 0 && cfg.exclude.includes(methodName))
      return false;
    return true;
  }
  const idb = typeof indexedDB !== "undefined" ? indexedDB : void 0;
  const dbName = "ldesign_api_offline";
  const storeName = "kv";
  let dbPromise = null;
  function openDB() {
    if (!idb)
      return Promise.reject(new Error("indexedDB not available"));
    if (dbPromise)
      return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = idb.open(dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(storeName))
          db.createObjectStore(storeName);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  async function idbGet(key) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const r = store.get(key);
        r.onsuccess = () => resolve(r.result ?? null);
        r.onerror = () => reject(r.error);
      });
    } catch {
      return null;
    }
  }
  async function idbSet(key, value) {
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        const r = store.put(value, key);
        r.onsuccess = () => resolve();
        r.onerror = () => reject(r.error);
      });
    } catch {
    }
  }
  function lsGet(key) {
    try {
      const s = localStorage.getItem(`ldesign_offline_${key}`);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }
  function lsSet(key, v) {
    try {
      localStorage.setItem(`ldesign_offline_${key}`, JSON.stringify(v));
    } catch {
    }
  }
  const now = () => Date.now();
  async function readCache(key) {
    if (idb)
      return await idbGet(key);
    return lsGet(key);
  }
  async function writeCache(key, data) {
    const v = { data, t: now(), exp: cfg.ttl > 0 ? now() + cfg.ttl : Number.MAX_SAFE_INTEGER };
    if (idb)
      return await idbSet(key, v);
    return lsSet(key, v);
  }
  return {
    name: "offline-cache",
    version: "1.0.0",
    install(engine) {
      var _a, _b, _c;
      (_a = engine.config).middlewares || (_a.middlewares = {});
      (_b = engine.config.middlewares).response || (_b.response = []);
      (_c = engine.config.middlewares).error || (_c.error = []);
      const resMw = async (response, ctx) => {
        const methodName = ctx.methodName;
        if (!shouldApply(methodName))
          return response;
        try {
          const key = cfg.keyGenerator(methodName, ctx.params);
          const data = response?.data?.data ?? response?.data;
          await writeCache(key, data);
        } catch {
        }
        return response;
      };
      const errMw = async (err, ctx) => {
        const methodName = ctx.methodName;
        if (!shouldApply(methodName))
          return;
        const isNetworkError = !("response" in (err || {})) || err?.response?.status === 0;
        if (cfg.onlyOnNetworkError && !isNetworkError)
          return;
        try {
          const key = cfg.keyGenerator(methodName, ctx.params);
          const cached = await readCache(key);
          if (cached && (cfg.ttl <= 0 || now() <= cached.exp)) {
            return { data: cached.data, status: 200, headers: {}, config: {} };
          }
        } catch {
        }
      };
      engine.config.middlewares.response.push(resMw);
      engine.config.middlewares.error.push(errMw);
    }
  };
}

export { createOfflineCachePlugin };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=offlineCache.js.map
