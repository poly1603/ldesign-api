/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function matchRule(rule, methodName, url) {
  if (rule.enabled === false) {
    return false;
  }
  if (typeof rule.match === "string") {
    return rule.match === methodName || url.includes(rule.match);
  }
  if (rule.match instanceof RegExp) {
    return rule.match.test(url);
  }
  if (typeof rule.match === "function") {
    return rule.match(methodName, url);
  }
  return false;
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function createMockPlugin(options = {}) {
  const config = {
    enabled: true,
    rules: [],
    defaultDelay: 300,
    logging: true,
    globalSwitch: true,
    ...options
  };
  const log = (...args) => {
    if (config.logging) {
      console.info("[Mock]", ...args);
    }
  };
  const requestMiddleware = async (reqConfig, ctx) => {
    if (!config.enabled || !config.globalSwitch) {
      return reqConfig;
    }
    const methodName = ctx.methodName;
    const url = reqConfig.url || "";
    const rule = config.rules.find((r) => matchRule(r, methodName, url));
    if (!rule) {
      return reqConfig;
    }
    reqConfig.__isMock = true;
    reqConfig.__mockRule = rule;
    return reqConfig;
  };
  const plugin = {
    name: "mock",
    version: "1.0.0",
    install(engine) {
      var _a, _b, _c;
      (_a = engine.config).middlewares || (_a.middlewares = {});
      (_b = engine.config.middlewares).request || (_b.request = []);
      (_c = engine.config.middlewares).response || (_c.response = []);
      engine.config.middlewares.request.unshift(requestMiddleware);
      engine.config.middlewares.response.unshift(async (response, ctx) => {
        const reqConfig = ctx.request;
        if (!reqConfig.__isMock) {
          return response;
        }
        const rule = reqConfig.__mockRule;
        let mockResponse;
        if (typeof rule.response === "function") {
          mockResponse = await Promise.resolve(rule.response(ctx.params, reqConfig));
        } else {
          mockResponse = rule.response;
        }
        const delayTime = mockResponse.delay ?? config.defaultDelay;
        if (delayTime > 0) {
          await delay(delayTime);
        }
        if (mockResponse.error) {
          log("Mock Error:", ctx.methodName, mockResponse.error);
          const error = new Error(mockResponse.error.message);
          error.code = mockResponse.error.code;
          error.response = {
            status: mockResponse.error.status || 500,
            data: { message: mockResponse.error.message }
          };
          throw error;
        }
        const mockedResponse = {
          data: mockResponse.data ?? null,
          status: mockResponse.status ?? 200,
          statusText: "OK",
          headers: mockResponse.headers || {},
          config: reqConfig
        };
        log("Mock Success:", ctx.methodName, "\u2192", mockedResponse.data);
        return mockedResponse;
      });
      engine.__mockPlugin = plugin;
    },
    uninstall() {
      config.rules = [];
    },
    /**
     * 动态添加Mock规则
     */
    addRule(rule) {
      config.rules.push(rule);
    },
    /**
     * 移除Mock规则
     */
    removeRule(match) {
      const index = config.rules.findIndex((r) => {
        if (typeof match === "string") {
          return typeof r.match === "string" && r.match === match;
        }
        if (match instanceof RegExp) {
          return r.match instanceof RegExp && r.match.source === match.source;
        }
        return false;
      });
      if (index > -1) {
        config.rules.splice(index, 1);
      }
    },
    /**
     * 清空所有Mock规则
     */
    clearRules() {
      config.rules = [];
    },
    /**
     * 启用/禁用Mock
     */
    setEnabled(enabled) {
      config.enabled = enabled;
    },
    /**
     * 全局开关
     */
    setGlobalSwitch(enabled) {
      config.globalSwitch = enabled;
    }
  };
  return plugin;
}
const MockHelpers = {
  /**
   * 生成分页数据
   */
  paginate(data, page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: data.slice(start, end),
      total: data.length,
      page,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize)
    };
  },
  /**
   * 生成随机数
   */
  random(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  /**
   * 生成随机布尔值
   */
  randomBool() {
    return Math.random() > 0.5;
  },
  /**
   * 从数组中随机选择
   */
  randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },
  /**
   * 生成随机字符串
   */
  randomString(length = 10) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  },
  /**
   * 生成随机日期
   */
  randomDate(start, end) {
    const startTime = start ? start.getTime() : Date.now() - 365 * 24 * 60 * 60 * 1e3;
    const endTime = end ? end.getTime() : Date.now();
    const timestamp = startTime + Math.random() * (endTime - startTime);
    return new Date(timestamp).toISOString();
  },
  /**
   * 模拟加载延迟
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

export { MockHelpers, createMockPlugin };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=mock.js.map
