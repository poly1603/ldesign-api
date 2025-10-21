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

exports.ApiErrorType = void 0;
(function(ApiErrorType2) {
  ApiErrorType2["NETWORK_ERROR"] = "NETWORK_ERROR";
  ApiErrorType2["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
  ApiErrorType2["CANCELLED_ERROR"] = "CANCELLED_ERROR";
  ApiErrorType2["SERVER_ERROR"] = "SERVER_ERROR";
  ApiErrorType2["CLIENT_ERROR"] = "CLIENT_ERROR";
  ApiErrorType2["AUTH_ERROR"] = "AUTH_ERROR";
  ApiErrorType2["PERMISSION_ERROR"] = "PERMISSION_ERROR";
  ApiErrorType2["NOT_FOUND_ERROR"] = "NOT_FOUND_ERROR";
  ApiErrorType2["VALIDATION_ERROR"] = "VALIDATION_ERROR";
  ApiErrorType2["PLUGIN_ERROR"] = "PLUGIN_ERROR";
  ApiErrorType2["CONFIG_ERROR"] = "CONFIG_ERROR";
  ApiErrorType2["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(exports.ApiErrorType || (exports.ApiErrorType = {}));
exports.ErrorSeverity = void 0;
(function(ErrorSeverity2) {
  ErrorSeverity2["LOW"] = "LOW";
  ErrorSeverity2["MEDIUM"] = "MEDIUM";
  ErrorSeverity2["HIGH"] = "HIGH";
  ErrorSeverity2["CRITICAL"] = "CRITICAL";
})(exports.ErrorSeverity || (exports.ErrorSeverity = {}));
class ApiError extends Error {
  constructor(options) {
    super(options.message);
    this.name = "ApiError";
    this.type = options.type;
    this.code = options.code ?? "UNKNOWN";
    this.severity = options.severity ?? this.inferSeverity(options.type);
    this.originalError = options.originalError;
    this.context = options.context ?? {};
    this.userMessage = options.userMessage ?? this.generateUserMessage(options.type);
    this.developerMessage = options.developerMessage ?? options.message;
    this.suggestions = options.suggestions ?? this.generateSuggestions(options.type);
    this.retryable = options.retryable ?? this.inferRetryable(options.type);
    this.timestamp = Date.now();
    if (options.originalError?.stack) {
      this.stack = options.originalError.stack;
    }
  }
  /**
   * 推断错误严重程度
   */
  inferSeverity(type) {
    switch (type) {
      case exports.ApiErrorType.NETWORK_ERROR:
      case exports.ApiErrorType.SERVER_ERROR:
        return exports.ErrorSeverity.HIGH;
      case exports.ApiErrorType.AUTH_ERROR:
      case exports.ApiErrorType.PERMISSION_ERROR:
        return exports.ErrorSeverity.MEDIUM;
      case exports.ApiErrorType.TIMEOUT_ERROR:
      case exports.ApiErrorType.CLIENT_ERROR:
      case exports.ApiErrorType.NOT_FOUND_ERROR:
        return exports.ErrorSeverity.MEDIUM;
      case exports.ApiErrorType.CANCELLED_ERROR:
      case exports.ApiErrorType.VALIDATION_ERROR:
        return exports.ErrorSeverity.LOW;
      case exports.ApiErrorType.CONFIG_ERROR:
      case exports.ApiErrorType.PLUGIN_ERROR:
        return exports.ErrorSeverity.CRITICAL;
      default:
        return exports.ErrorSeverity.MEDIUM;
    }
  }
  /**
   * 生成用户友好的错误消息
   */
  generateUserMessage(type) {
    switch (type) {
      case exports.ApiErrorType.NETWORK_ERROR:
        return "\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8BBE\u7F6E";
      case exports.ApiErrorType.TIMEOUT_ERROR:
        return "\u8BF7\u6C42\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5";
      case exports.ApiErrorType.CANCELLED_ERROR:
        return "\u8BF7\u6C42\u5DF2\u53D6\u6D88";
      case exports.ApiErrorType.SERVER_ERROR:
        return "\u670D\u52A1\u5668\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5";
      case exports.ApiErrorType.AUTH_ERROR:
        return "\u8EAB\u4EFD\u9A8C\u8BC1\u5931\u8D25\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55";
      case exports.ApiErrorType.PERMISSION_ERROR:
        return "\u6743\u9650\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u6267\u884C\u6B64\u64CD\u4F5C";
      case exports.ApiErrorType.NOT_FOUND_ERROR:
        return "\u8BF7\u6C42\u7684\u8D44\u6E90\u4E0D\u5B58\u5728";
      case exports.ApiErrorType.VALIDATION_ERROR:
        return "\u6570\u636E\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u8BF7\u68C0\u67E5\u8F93\u5165";
      case exports.ApiErrorType.CLIENT_ERROR:
        return "\u8BF7\u6C42\u53C2\u6570\u9519\u8BEF";
      default:
        return "\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5";
    }
  }
  /**
   * 生成解决建议
   */
  generateSuggestions(type) {
    switch (type) {
      case exports.ApiErrorType.NETWORK_ERROR:
        return [
          "\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5",
          "\u5C1D\u8BD5\u5237\u65B0\u9875\u9762",
          "\u8054\u7CFB\u7F51\u7EDC\u7BA1\u7406\u5458"
        ];
      case exports.ApiErrorType.TIMEOUT_ERROR:
        return [
          "\u7A0D\u540E\u91CD\u8BD5",
          "\u68C0\u67E5\u7F51\u7EDC\u901F\u5EA6",
          "\u51CF\u5C11\u8BF7\u6C42\u6570\u636E\u91CF"
        ];
      case exports.ApiErrorType.AUTH_ERROR:
        return [
          "\u91CD\u65B0\u767B\u5F55",
          "\u68C0\u67E5\u8D26\u53F7\u72B6\u6001",
          "\u8054\u7CFB\u7BA1\u7406\u5458"
        ];
      case exports.ApiErrorType.PERMISSION_ERROR:
        return [
          "\u8054\u7CFB\u7BA1\u7406\u5458\u83B7\u53D6\u6743\u9650",
          "\u68C0\u67E5\u8D26\u53F7\u89D2\u8272",
          "\u4F7F\u7528\u5176\u4ED6\u8D26\u53F7"
        ];
      case exports.ApiErrorType.VALIDATION_ERROR:
        return [
          "\u68C0\u67E5\u8F93\u5165\u683C\u5F0F",
          "\u67E5\u770B\u5B57\u6BB5\u8981\u6C42",
          "\u91CD\u65B0\u586B\u5199\u8868\u5355"
        ];
      default:
        return [
          "\u7A0D\u540E\u91CD\u8BD5",
          "\u5237\u65B0\u9875\u9762",
          "\u8054\u7CFB\u6280\u672F\u652F\u6301"
        ];
    }
  }
  /**
   * 推断是否可重试
   */
  inferRetryable(type) {
    switch (type) {
      case exports.ApiErrorType.NETWORK_ERROR:
      case exports.ApiErrorType.TIMEOUT_ERROR:
      case exports.ApiErrorType.SERVER_ERROR:
        return true;
      case exports.ApiErrorType.AUTH_ERROR:
      case exports.ApiErrorType.PERMISSION_ERROR:
      case exports.ApiErrorType.NOT_FOUND_ERROR:
      case exports.ApiErrorType.VALIDATION_ERROR:
      case exports.ApiErrorType.CLIENT_ERROR:
      case exports.ApiErrorType.CANCELLED_ERROR:
      case exports.ApiErrorType.CONFIG_ERROR:
      case exports.ApiErrorType.PLUGIN_ERROR:
        return false;
      default:
        return false;
    }
  }
  /**
   * 转换为JSON格式
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      developerMessage: this.developerMessage,
      severity: this.severity,
      suggestions: this.suggestions,
      retryable: this.retryable,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
  /**
   * 转换为字符串
   */
  toString() {
    return `${this.name} [${this.type}]: ${this.message}`;
  }
}
class ApiErrorFactory {
  /**
   * 从HTTP响应创建错误
   */
  static fromHttpResponse(response, context) {
    const status = response?.status || response?.response?.status;
    const statusText = response?.statusText || response?.response?.statusText;
    const data = response?.data || response?.response?.data;
    let type;
    const code = status || "UNKNOWN";
    let message = statusText || "Unknown error";
    if (status >= 500) {
      type = exports.ApiErrorType.SERVER_ERROR;
    } else if (status === 401) {
      type = exports.ApiErrorType.AUTH_ERROR;
      message = "\u8EAB\u4EFD\u9A8C\u8BC1\u5931\u8D25";
    } else if (status === 403) {
      type = exports.ApiErrorType.PERMISSION_ERROR;
      message = "\u6743\u9650\u4E0D\u8DB3";
    } else if (status === 404) {
      type = exports.ApiErrorType.NOT_FOUND_ERROR;
      message = "\u8D44\u6E90\u4E0D\u5B58\u5728";
    } else if (status >= 400) {
      type = exports.ApiErrorType.CLIENT_ERROR;
    } else {
      type = exports.ApiErrorType.UNKNOWN_ERROR;
    }
    if (data?.message) {
      message = data.message;
    } else if (data?.error) {
      message = data.error;
    }
    return new ApiError({
      type,
      code,
      message,
      developerMessage: `HTTP ${status}: ${statusText}`,
      context,
      originalError: response
    });
  }
  /**
   * 从网络错误创建错误
   */
  static fromNetworkError(error, context) {
    if (error.name === "AbortError" || error.message.includes("cancelled")) {
      return new ApiError({
        type: exports.ApiErrorType.CANCELLED_ERROR,
        message: "\u8BF7\u6C42\u5DF2\u53D6\u6D88",
        context,
        originalError: error
      });
    }
    if (error.message.includes("timeout")) {
      return new ApiError({
        type: exports.ApiErrorType.TIMEOUT_ERROR,
        message: "\u8BF7\u6C42\u8D85\u65F6",
        context,
        originalError: error
      });
    }
    return new ApiError({
      type: exports.ApiErrorType.NETWORK_ERROR,
      message: error.message || "\u7F51\u7EDC\u9519\u8BEF",
      context,
      originalError: error
    });
  }
  /**
   * 从验证错误创建错误
   */
  static fromValidationError(message, context) {
    return new ApiError({
      type: exports.ApiErrorType.VALIDATION_ERROR,
      message,
      context
    });
  }
  /**
   * 从配置错误创建错误
   */
  static fromConfigError(message, context) {
    return new ApiError({
      type: exports.ApiErrorType.CONFIG_ERROR,
      message,
      severity: exports.ErrorSeverity.CRITICAL,
      context
    });
  }
  /**
   * 从插件错误创建错误
   */
  static fromPluginError(message, context) {
    return new ApiError({
      type: exports.ApiErrorType.PLUGIN_ERROR,
      message,
      severity: exports.ErrorSeverity.CRITICAL,
      context
    });
  }
  /**
   * 从未知错误创建错误
   */
  static fromUnknownError(error, context) {
    if (error instanceof ApiError) {
      return error;
    }
    if (error instanceof Error) {
      return new ApiError({
        type: exports.ApiErrorType.UNKNOWN_ERROR,
        message: error.message,
        context,
        originalError: error
      });
    }
    return new ApiError({
      type: exports.ApiErrorType.UNKNOWN_ERROR,
      message: String(error),
      context
    });
  }
}

exports.ApiError = ApiError;
exports.ApiErrorFactory = ApiErrorFactory;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=ApiError.cjs.map
