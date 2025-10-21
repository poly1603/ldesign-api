/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { isRetryableError } from '../utils/ErrorCodes.js';

function calculateDelay(attempt, strategy, initialDelay, maxDelay, jitter) {
  let delay = initialDelay;
  switch (strategy) {
    case "exponential":
      delay = initialDelay * 2 ** attempt;
      break;
    case "linear":
      delay = initialDelay * (attempt + 1);
      break;
    case "fibonacci": {
      let a = 1;
      let b = 1;
      for (let i = 0; i < attempt; i++) {
        const temp = a + b;
        a = b;
        b = temp;
      }
      delay = initialDelay * b;
      break;
    }
  }
  delay = Math.min(delay, maxDelay);
  if (jitter > 0) {
    const jitterAmount = delay * jitter;
    delay = delay + (Math.random() * 2 - 1) * jitterAmount;
  }
  return Math.max(0, Math.floor(delay));
}
function shouldRetry(error, attempt, maxRetries) {
  if (attempt >= maxRetries) {
    return false;
  }
  if (error?.code && typeof error.code === "string") {
    return isRetryableError(error.code);
  }
  if (error?.response?.status) {
    const status = error.response.status;
    return status >= 500 || status === 408 || status === 429;
  }
  if (error?.message) {
    const msg = error.message.toLowerCase();
    return msg.includes("network") || msg.includes("timeout") || msg.includes("econnrefused") || msg.includes("enotfound");
  }
  return false;
}
function createSmartRetryPlugin(options = {}) {
  const config = {
    enabled: true,
    maxRetries: 3,
    initialDelay: 1e3,
    maxDelay: 3e4,
    backoffStrategy: "exponential",
    jitter: 0.1,
    ...options
  };
  const retryState = /* @__PURE__ */ new Map();
  const errorMiddleware = async (error, ctx) => {
    if (!config.enabled) {
      return;
    }
    const key = `${ctx.methodName}:${JSON.stringify(ctx.params)}`;
    const currentAttempt = retryState.get(key) || 0;
    if (config.retryCondition) {
      const shouldRetryCustom = config.retryCondition(error, currentAttempt);
      if (!shouldRetryCustom) {
        retryState.delete(key);
        return;
      }
    } else {
      if (!shouldRetry(error, currentAttempt, config.maxRetries)) {
        retryState.delete(key);
        return;
      }
    }
    const delay = calculateDelay(currentAttempt, config.backoffStrategy, config.initialDelay, config.maxDelay, config.jitter);
    retryState.set(key, currentAttempt + 1);
    if (config.onRetry) {
      config.onRetry(currentAttempt + 1, error, delay);
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    throw error;
  };
  return {
    name: "smart-retry",
    version: "1.0.0",
    install(engine) {
      var _a, _b;
      (_a = engine.config).middlewares || (_a.middlewares = {});
      (_b = engine.config.middlewares).error || (_b.error = []);
      engine.config.middlewares.error.push(errorMiddleware);
    }
  };
}

export { createSmartRetryPlugin };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=smartRetry.js.map
