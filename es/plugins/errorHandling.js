/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ErrorSeverity, ApiError, ApiErrorFactory, ApiErrorType } from '../utils/ApiError.js';
import { createErrorReporter, setGlobalErrorReporter } from '../utils/ErrorReporter.js';

function createErrorHandlingPlugin(config = {}) {
  let errorReporter = null;
  return {
    name: "errorHandling",
    version: "1.0.0",
    async install(engine) {
      if (config.enableReporting !== false) {
        errorReporter = createErrorReporter({
          enabled: true,
          enableInDevelopment: config.reporting?.enableInDevelopment ?? false,
          endpoint: config.reporting?.endpoint ?? "",
          apiKey: config.reporting?.apiKey ?? "",
          sampleRate: config.reporting?.sampleRate ?? 1
        });
        setGlobalErrorReporter(errorReporter);
        if ("setErrorReporter" in engine) {
          engine.setErrorReporter(errorReporter);
        }
      }
      const existingErrorMiddlewares = engine.config.middlewares?.error || [];
      engine.config.middlewares = {
        ...engine.config.middlewares,
        error: [
          ...existingErrorMiddlewares,
          async (error, ctx) => {
            const apiError = createEnhancedError(error, ctx);
            if (errorReporter) {
              errorReporter.report(apiError);
            }
            if (config.notification?.showUserMessages !== false) {
              notifyUser(apiError, config.notification?.notifyUser);
            }
            const recovery = attemptErrorRecovery(apiError, config.recovery);
            if (recovery) {
              return recovery;
            }
            handleSpecialErrors(apiError, config);
            return void 0;
          }
        ]
      };
    },
    async uninstall() {
      if (errorReporter) {
        errorReporter.destroy();
        errorReporter = null;
        setGlobalErrorReporter(null);
      }
    }
  };
}
function createEnhancedError(error, context) {
  if (error instanceof ApiError) {
    return error;
  }
  if (error && typeof error === "object" && ("response" in error || "status" in error)) {
    return ApiErrorFactory.fromHttpResponse(error, context);
  }
  if (error instanceof Error) {
    return ApiErrorFactory.fromNetworkError(error, context);
  }
  return ApiErrorFactory.fromUnknownError(error, context);
}
function attemptErrorRecovery(error, recovery) {
  if (!recovery) {
    return null;
  }
  switch (error.type) {
    case ApiErrorType.NETWORK_ERROR:
      if (recovery.networkFallback) {
        try {
          return recovery.networkFallback(error);
        } catch (e) {
          console.warn("Network fallback failed:", e);
        }
      }
      break;
    case ApiErrorType.SERVER_ERROR:
      if (recovery.serverFallback) {
        try {
          return recovery.serverFallback(error);
        } catch (e) {
          console.warn("Server fallback failed:", e);
        }
      }
      break;
  }
  return null;
}
function handleSpecialErrors(error, config) {
  switch (error.type) {
    case ApiErrorType.AUTH_ERROR:
      if (config.recovery?.authErrorHandler) {
        try {
          config.recovery.authErrorHandler(error);
        } catch (e) {
          console.warn("Auth error handler failed:", e);
        }
      }
      break;
  }
}
function notifyUser(error, customNotify) {
  if (customNotify) {
    try {
      customNotify(error);
      return;
    } catch (e) {
      console.warn("Custom notification failed:", e);
    }
  }
  if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("\u7CFB\u7EDF\u9519\u8BEF", {
          body: error.userMessage,
          icon: "/favicon.ico"
        });
      }
    }
    console.error(`\u{1F6A8} ${error.userMessage}`);
    if (error.suggestions.length > 0) {
      console.info("\u{1F4A1} \u5EFA\u8BAE\u89E3\u51B3\u65B9\u6848:", error.suggestions);
    }
  }
}
const errorHandlingPlugin = createErrorHandlingPlugin();
function withErrorHandling(config = {}) {
  return createErrorHandlingPlugin(config);
}
const ErrorHandlingUtils = {
  /**
   * 检查错误是否可重试
   */
  isRetryable(error) {
    return error.retryable;
  },
  /**
   * 获取错误的用户友好消息
   */
  getUserMessage(error) {
    return error.userMessage;
  },
  /**
   * 获取错误的建议解决方案
   */
  getSuggestions(error) {
    return error.suggestions;
  },
  /**
   * 检查错误严重程度
   */
  isCritical(error) {
    return error.severity === ErrorSeverity.CRITICAL;
  },
  /**
   * 格式化错误信息用于日志
   */
  formatForLogging(error) {
    return `[${error.type}] ${error.message} (Method: ${error.context.methodName})`;
  }
};

export { ErrorHandlingUtils, createErrorHandlingPlugin, errorHandlingPlugin, withErrorHandling };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=errorHandling.js.map
