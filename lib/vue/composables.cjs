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

var vue = require('vue');
var index = require('../types/index.cjs');
var ApiError = require('../utils/ApiError.cjs');
var plugin = require('./plugin.cjs');

function useMutation(methodName, options = {}) {
  const api = useApi();
  const data = vue.ref(null);
  const loading = vue.ref(false);
  const error = vue.ref(null);
  const isFinished = vue.computed(() => !loading.value);
  const isSuccess = vue.computed(() => !loading.value && !error.value && data.value !== null);
  const isError = vue.computed(() => !loading.value && error.value !== null);
  let rollbackFn;
  const mutate = async (variables, callOptions) => {
    if (options.lockWhilePending && loading.value) {
      return Promise.reject(new Error("Mutation is pending"));
    }
    loading.value = true;
    error.value = null;
    rollbackFn = void 0;
    try {
      const rollbacks = [];
      const maybeRollback = options.onMutate?.(variables);
      if (typeof maybeRollback === "function")
        rollbacks.push(maybeRollback);
      if (options.optimistic?.snapshot && options.optimistic?.restore) {
        const snap = options.optimistic.snapshot();
        rollbacks.push(() => {
          try {
            options.optimistic.restore(snap);
          } catch {
          }
        });
      } else if (options.optimistic?.target && options.optimistic?.snapshotStrategy) {
        const clone = (val) => {
          if (options.optimistic.snapshotStrategy === "shallow") {
            if (Array.isArray(val))
              return val.slice();
            if (val && typeof val === "object")
              return { ...val };
            return val;
          }
          try {
            if (typeof structuredClone === "function")
              return structuredClone(val);
          } catch {
          }
          try {
            return JSON.parse(JSON.stringify(val));
          } catch {
            return val;
          }
        };
        const snap = clone(options.optimistic.target.get());
        rollbacks.push(() => {
          try {
            options.optimistic.target.set(snap);
          } catch {
          }
        });
      }
      const optimisticRollback = options.optimistic?.apply?.(variables);
      if (typeof optimisticRollback === "function")
        rollbacks.push(optimisticRollback);
      if (rollbacks.length > 0) {
        rollbackFn = () => {
          for (let i = rollbacks.length - 1; i >= 0; i--) {
            try {
              rollbacks[i]();
            } catch {
            }
          }
        };
      }
      const result = await api.call(methodName, variables, {
        ...callOptions,
        // 只传递API调用相关的选项，排除mutation特有的选项
        skipCache: options.skipCache,
        skipDebounce: options.skipDebounce,
        skipDeduplication: options.skipDeduplication,
        cache: options.cache,
        debounce: options.debounce,
        retry: options.retry,
        middlewares: options.middlewares,
        queue: options.queue,
        priority: options.priority
      });
      data.value = result;
      options.onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const e = err instanceof ApiError.ApiError ? err : err instanceof Error ? err : new Error(String(err));
      const apiError = e instanceof ApiError.ApiError ? e : ApiError.ApiErrorFactory.fromUnknownError(e, {
        methodName,
        params: variables,
        timestamp: Date.now()
      });
      error.value = apiError;
      options.onError?.(apiError, variables, rollbackFn);
      if (rollbackFn && (options.optimistic?.rollbackOnError ?? true)) {
        try {
          rollbackFn();
        } catch {
        }
      }
      throw apiError;
    } finally {
      loading.value = false;
      options.onFinally?.();
    }
  };
  const reset = () => {
    data.value = null;
    loading.value = false;
    error.value = null;
    rollbackFn = void 0;
  };
  return { data, loading, error, isFinished, isSuccess, isError, mutate, reset };
}
function useApi() {
  const injectedEngine = vue.inject(plugin.API_ENGINE_INJECTION_KEY);
  if (injectedEngine) {
    return injectedEngine;
  }
  const instance = vue.getCurrentInstance();
  if (instance?.appContext.app.config.globalProperties.$api) {
    return instance.appContext.app.config.globalProperties.$api;
  }
  throw new Error("API Engine not found. Please install ApiVuePlugin first.");
}
function useApiCall(methodName, options = {}) {
  const apiEngine = useApi();
  const data = vue.ref(options.defaultData ?? null);
  const loading = vue.ref(false);
  const error = vue.ref(null);
  let abortController = null;
  const isFinished = vue.computed(() => !loading.value);
  const isSuccess = vue.computed(() => !loading.value && !error.value && data.value !== null);
  const isError = vue.computed(() => !loading.value && error.value !== null);
  const execute = async (params, executeOptions) => {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    const currentController = abortController;
    loading.value = true;
    error.value = null;
    try {
      const result = await apiEngine.call(methodName, params, {
        ...options,
        ...executeOptions
      });
      if (currentController.signal.aborted) {
        return result;
      }
      data.value = result;
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (err) {
      if (currentController.signal.aborted) {
        const cancelError = ApiError.ApiErrorFactory.fromNetworkError(new Error("Request cancelled"), {
          methodName,
          params,
          timestamp: Date.now()
        });
        return Promise.reject(cancelError);
      }
      const e = err instanceof ApiError.ApiError ? err : err instanceof Error ? err : new Error(String(err));
      const apiError = e instanceof ApiError.ApiError ? e : ApiError.ApiErrorFactory.fromUnknownError(e, {
        methodName,
        params,
        timestamp: Date.now()
      });
      error.value = apiError;
      if (options.onError) {
        options.onError(apiError);
      }
      throw apiError;
    } finally {
      if (!currentController.signal.aborted) {
        loading.value = false;
        if (options.onFinally) {
          options.onFinally();
        }
      }
    }
  };
  const reset = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    data.value = options.defaultData ?? null;
    loading.value = false;
    error.value = null;
  };
  const cancel = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };
  if (options.autoCancel !== false) {
    vue.onUnmounted(() => {
      cancel();
    });
  }
  if (options.immediate) {
    execute().catch(() => {
    });
  }
  return {
    data,
    loading,
    error,
    execute,
    reset,
    cancel,
    isFinished,
    isSuccess,
    isError
  };
}
function useApiPolling(methodName, options = { interval: 3e4 }) {
  const state = useApiCall(methodName, { ...options, immediate: false });
  let timer = null;
  const start = () => {
    if (timer)
      return;
    state.execute(options.params, options).catch(() => {
    });
    timer = globalThis.setInterval(() => {
      state.execute(options.params, options).catch(() => {
      });
    }, options.interval);
  };
  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
  if (options.autoStart) {
    start();
  }
  vue.onUnmounted(() => {
    stop();
  });
  return {
    ...state,
    start,
    stop,
    isActive: vue.computed(() => timer !== null)
  };
}
function useInfiniteApi(methodName, options = {}) {
  const page = vue.ref(options.page ?? 1);
  const pageSize = vue.ref(options.pageSize ?? 10);
  const total = vue.ref(0);
  const items = vue.ref([]);
  const extract = options.extract ?? ((res) => {
    if (res && typeof res === "object") {
      if (Array.isArray(res.items) && typeof res.total === "number")
        return { items: res.items, total: res.total };
      if (Array.isArray(res.list) && typeof res.total === "number")
        return { items: res.list, total: res.total };
      if (Array.isArray(res.data) && typeof res.total === "number")
        return { items: res.data, total: res.total };
    }
    return { items: Array.isArray(res) ? res : [], total: 0 };
  });
  const { loading, error, execute } = useApiCall(methodName, { ...options, immediate: false });
  const loadMore = async () => {
    const params = { page: page.value, pageSize: pageSize.value, ...options.query || {} };
    const res = await execute(params, options);
    const { items: its, total: tot } = extract(res);
    total.value = tot;
    items.value = [...items.value, ...its];
    page.value += 1;
    return its;
  };
  const reset = () => {
    page.value = options.page ?? 1;
    pageSize.value = options.pageSize ?? 10;
    total.value = 0;
    items.value = [];
  };
  const hasMore = vue.computed(() => items.value.length < total.value);
  if (options.immediate) {
    loadMore().catch(() => {
    });
  }
  let observer = null;
  if (options.auto && options.target) {
    const root = options.root ?? null;
    const rootMargin = options.rootMargin ?? "0px";
    const threshold = options.threshold ?? 0;
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && hasMore.value && !loading.value) {
          loadMore().catch(() => {
          });
        }
      }
    }, { root, rootMargin, threshold });
    const stopWatch = () => {
      const el = options.target.value;
      if (el)
        observer.observe(el);
    };
    stopWatch();
    const stop = vue.watch(options.target, () => {
      observer.disconnect();
      stopWatch();
    });
    vue.onUnmounted(() => {
      observer?.disconnect();
      stop();
    });
  }
  return { items, total, page, pageSize, loading, error, loadMore, reset, hasMore };
}
function useBatchApiCall(calls, options = {}) {
  const apiEngine = useApi();
  const data = vue.ref([]);
  const loading = vue.ref(false);
  const errors = vue.ref([]);
  const isFinished = vue.computed(() => !loading.value);
  const isSuccess = vue.computed(() => !loading.value && errors.value.every((err) => err === null));
  const hasErrors = vue.computed(() => errors.value.some((err) => err !== null));
  const execute = async () => {
    loading.value = true;
    errors.value = [];
    data.value = [];
    try {
      const results = await Promise.allSettled(calls.map(({ methodName, params, options: callOptions }) => apiEngine.call(methodName, params, { ...options, ...callOptions })));
      const successResults = [];
      const errorResults = [];
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          successResults.push(result.value);
          errorResults.push(null);
        } else {
          successResults.push(null);
          errorResults.push(result.reason instanceof Error ? result.reason : new Error(String(result.reason)));
        }
      });
      data.value = successResults;
      errors.value = errorResults;
      if (options.onSuccess) {
        options.onSuccess(successResults);
      }
      return successResults;
    } catch (err) {
      const apiError = err instanceof Error ? err : new Error(String(err));
      if (options.onError) {
        options.onError([apiError]);
      }
      throw apiError;
    } finally {
      loading.value = false;
      if (options.onFinally) {
        options.onFinally();
      }
    }
  };
  const reset = () => {
    data.value = [];
    loading.value = false;
    errors.value = [];
  };
  if (options.immediate) {
    execute();
  }
  return {
    data,
    loading,
    errors,
    execute,
    reset,
    isFinished,
    isSuccess,
    hasErrors
  };
}
function useSystemApi() {
  return {
    /**
     * 获取验证码
     */
    getCaptcha: (options = {}) => useApiCall(index.SYSTEM_API_METHODS.GET_CAPTCHA, options),
    /**
     * 用户登录
     */
    login: (options = {}) => useApiCall(index.SYSTEM_API_METHODS.LOGIN, options),
    /**
     * 用户登出
     */
    logout: (options = {}) => useApiCall(index.SYSTEM_API_METHODS.LOGOUT, options),
    /**
     * 获取用户信息
     */
    getUserInfo: (options = {}) => useApiCall(index.SYSTEM_API_METHODS.GET_USER_INFO, options),
    /**
     * 更新用户信息
     */
    updateUserInfo: (options = {}) => useApiCall(index.SYSTEM_API_METHODS.UPDATE_USER_INFO, options),
    /**
     * 获取系统菜单
     */
    getMenus: (options = {}) => useApiCall(index.SYSTEM_API_METHODS.GET_MENUS, options),
    /**
     * 获取用户权限
     */
    getPermissions: (options = {}) => useApiCall(index.SYSTEM_API_METHODS.GET_PERMISSIONS, options),
    /**
     * 刷新令牌
     */
    refreshToken: (options = {}) => useApiCall(index.SYSTEM_API_METHODS.REFRESH_TOKEN, options),
    /**
     * 修改密码
     */
    changePassword: (options = {}) => useApiCall(index.SYSTEM_API_METHODS.CHANGE_PASSWORD, options),
    /**
     * 获取系统配置
     */
    getSystemConfig: (options = {}) => useApiCall(index.SYSTEM_API_METHODS.GET_SYSTEM_CONFIG, options)
  };
}
function usePaginatedApi(methodName, options = {}) {
  const page = vue.ref(options.page ?? 1);
  const pageSize = vue.ref(options.pageSize ?? 10);
  const total = vue.ref(0);
  const items = vue.ref([]);
  const extract = options.extract ?? ((res) => {
    if (res && typeof res === "object") {
      if (Array.isArray(res.items) && typeof res.total === "number")
        return { items: res.items, total: res.total };
      if (Array.isArray(res.list) && typeof res.total === "number")
        return { items: res.list, total: res.total };
      if (Array.isArray(res.data) && typeof res.total === "number")
        return { items: res.data, total: res.total };
    }
    return { items: Array.isArray(res) ? res : [], total: 0 };
  });
  const { loading, error, execute } = useApiCall(methodName, {
    ...options,
    immediate: false,
    onSuccess: (res) => {
      const { items: its, total: tot } = extract(res);
      items.value = its;
      total.value = tot;
      options.onSuccess?.(res);
    },
    onError: (e) => options.onError?.(e),
    onFinally: () => options.onFinally?.()
  });
  const run = async () => {
    const params = { page: page.value, pageSize: pageSize.value, ...options.query || {} };
    await execute(params, options);
  };
  const setPage = (p) => {
    page.value = Math.max(1, p);
    run().catch(() => {
    });
  };
  const setPageSize = (s) => {
    pageSize.value = Math.max(1, s);
    page.value = 1;
    run().catch(() => {
    });
  };
  const nextPage = () => setPage(page.value + 1);
  const prevPage = () => setPage(Math.max(1, page.value - 1));
  if (options.immediate)
    run().catch(() => {
    });
  return {
    page,
    pageSize,
    total,
    items,
    loading,
    error,
    run,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    isFinished: vue.computed(() => !loading.value),
    hasMore: vue.computed(() => items.value.length < total.value)
  };
}
function useApiCleanup() {
  vue.onUnmounted(() => {
  });
}

exports.useApi = useApi;
exports.useApiCall = useApiCall;
exports.useApiCleanup = useApiCleanup;
exports.useApiPolling = useApiPolling;
exports.useBatchApiCall = useBatchApiCall;
exports.useInfiniteApi = useInfiniteApi;
exports.useMutation = useMutation;
exports.usePaginatedApi = usePaginatedApi;
exports.useSystemApi = useSystemApi;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=composables.cjs.map
