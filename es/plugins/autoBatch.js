/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class BatchManager {
  constructor(config, httpClient) {
    this.config = config;
    this.httpClient = httpClient;
    this.queue = [];
    this.timer = null;
  }
  /**
   * 判断方法是否可批处理
   */
  isBatchable(methodName) {
    if (!this.config?.batchableMethods || this.config?.batchableMethods.length === 0) {
      return true;
    }
    return this.config?.batchableMethods.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(methodName);
      }
      return methodName === pattern;
    });
  }
  /**
   * 添加到批处理队列
   */
  enqueue(call) {
    if (!this.config?.enabled) {
      this.executeSingle(call);
      return;
    }
    if (!this.isBatchable(call.methodName)) {
      this.executeSingle(call);
      return;
    }
    this.queue.push(call);
    if (this.queue.length >= this.config?.maxBatchSize) {
      this.flush();
      return;
    }
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.flush();
      }, this.config?.batchInterval);
    }
  }
  /**
   * 执行单个请求
   */
  async executeSingle(call) {
    try {
      const result = await this.httpClient.request({
        url: `/api/${call.methodName}`,
        method: "POST",
        data: call.params
      });
      call.resolve(result.data);
    } catch (error) {
      call.reject(error);
    }
  }
  /**
   * 刷新批处理队列
   */
  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.queue.length === 0) {
      return;
    }
    const calls = this.queue.splice(0);
    try {
      const batchRequest = this.config?.transformRequest ? this.config?.transformRequest(calls) : calls.map((call) => ({
        method: call.methodName,
        params: call.params
      }));
      const response = await this.httpClient.request({
        url: this.config?.batchEndpoint,
        method: "POST",
        data: batchRequest
      });
      const results = this.config?.transformResponse ? this.config?.transformResponse(response.data) : response.data;
      if (Array.isArray(results) && results.length === calls.length) {
        calls.forEach((call, index) => {
          call.resolve(results[index]);
        });
      } else {
        const error = new Error("Batch response length mismatch");
        calls.forEach((call) => call.reject(error));
      }
    } catch (error) {
      calls.forEach((call) => call.reject(error));
    }
  }
  /**
   * 销毁
   */
  destroy() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const error = new Error("Batch manager destroyed");
    this.queue.forEach((call) => call.reject(error));
    this.queue = [];
  }
}
function createAutoBatchPlugin(config) {
  const fullConfig = {
    enabled: true,
    maxBatchSize: 10,
    batchInterval: 50,
    batchableMethods: [],
    transformRequest: void 0,
    transformResponse: void 0,
    ...config
  };
  let batchManager = null;
  return {
    name: "auto-batch",
    version: "1.0.0",
    install(engine) {
      batchManager = new BatchManager(fullConfig, engine.httpClient);
      const originalDestroy = engine.destroy.bind(engine);
      engine.destroy = () => {
        if (batchManager) {
          batchManager.destroy();
          batchManager = null;
        }
        originalDestroy();
      };
    },
    uninstall(_engine) {
      if (batchManager) {
        batchManager.destroy();
        batchManager = null;
      }
    }
  };
}
async function batchCalls(engine, calls, batchEndpoint) {
  const response = await engine.httpClient.request({
    url: batchEndpoint,
    method: "POST",
    data: calls.map((call) => ({
      method: call.methodName,
      params: call.params || {}
    }))
  });
  return response.data;
}

export { batchCalls, createAutoBatchPlugin };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=autoBatch.js.map
