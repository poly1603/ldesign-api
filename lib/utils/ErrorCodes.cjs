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

exports.ApiErrorCode = void 0;
(function(ApiErrorCode2) {
  ApiErrorCode2["NETWORK_ERROR"] = "ERR_NETWORK";
  ApiErrorCode2["NETWORK_TIMEOUT"] = "ERR_NETWORK_TIMEOUT";
  ApiErrorCode2["NETWORK_OFFLINE"] = "ERR_NETWORK_OFFLINE";
  ApiErrorCode2["NETWORK_CONNECTION_REFUSED"] = "ERR_NETWORK_CONNECTION_REFUSED";
  ApiErrorCode2["HTTP_BAD_REQUEST"] = "ERR_HTTP_400";
  ApiErrorCode2["HTTP_UNAUTHORIZED"] = "ERR_HTTP_401";
  ApiErrorCode2["HTTP_FORBIDDEN"] = "ERR_HTTP_403";
  ApiErrorCode2["HTTP_NOT_FOUND"] = "ERR_HTTP_404";
  ApiErrorCode2["HTTP_METHOD_NOT_ALLOWED"] = "ERR_HTTP_405";
  ApiErrorCode2["HTTP_TIMEOUT"] = "ERR_HTTP_408";
  ApiErrorCode2["HTTP_CONFLICT"] = "ERR_HTTP_409";
  ApiErrorCode2["HTTP_RATE_LIMIT"] = "ERR_HTTP_429";
  ApiErrorCode2["HTTP_SERVER_ERROR"] = "ERR_HTTP_500";
  ApiErrorCode2["HTTP_BAD_GATEWAY"] = "ERR_HTTP_502";
  ApiErrorCode2["HTTP_SERVICE_UNAVAILABLE"] = "ERR_HTTP_503";
  ApiErrorCode2["HTTP_GATEWAY_TIMEOUT"] = "ERR_HTTP_504";
  ApiErrorCode2["BUSINESS_ERROR"] = "ERR_BUSINESS";
  ApiErrorCode2["VALIDATION_ERROR"] = "ERR_VALIDATION";
  ApiErrorCode2["DATA_NOT_FOUND"] = "ERR_DATA_NOT_FOUND";
  ApiErrorCode2["DUPLICATE_DATA"] = "ERR_DUPLICATE_DATA";
  ApiErrorCode2["INVALID_PARAMS"] = "ERR_INVALID_PARAMS";
  ApiErrorCode2["AUTH_TOKEN_EXPIRED"] = "ERR_TOKEN_EXPIRED";
  ApiErrorCode2["AUTH_TOKEN_INVALID"] = "ERR_TOKEN_INVALID";
  ApiErrorCode2["AUTH_REFRESH_FAILED"] = "ERR_AUTH_REFRESH_FAILED";
  ApiErrorCode2["AUTH_NO_PERMISSION"] = "ERR_NO_PERMISSION";
  ApiErrorCode2["CONFIG_INVALID"] = "ERR_CONFIG_INVALID";
  ApiErrorCode2["METHOD_NOT_FOUND"] = "ERR_METHOD_NOT_FOUND";
  ApiErrorCode2["PLUGIN_NOT_FOUND"] = "ERR_PLUGIN_NOT_FOUND";
  ApiErrorCode2["CACHE_ERROR"] = "ERR_CACHE";
  ApiErrorCode2["CACHE_WRITE_FAILED"] = "ERR_CACHE_WRITE_FAILED";
  ApiErrorCode2["CACHE_READ_FAILED"] = "ERR_CACHE_READ_FAILED";
  ApiErrorCode2["RATE_LIMIT_EXCEEDED"] = "ERR_RATE_LIMIT_EXCEEDED";
  ApiErrorCode2["QUEUE_OVERFLOW"] = "ERR_QUEUE_OVERFLOW";
  ApiErrorCode2["CIRCUIT_BREAKER_OPEN"] = "ERR_CIRCUIT_BREAKER_OPEN";
  ApiErrorCode2["UNKNOWN_ERROR"] = "ERR_UNKNOWN";
  ApiErrorCode2["REQUEST_CANCELLED"] = "ERR_REQUEST_CANCELLED";
  ApiErrorCode2["RESPONSE_PARSE_ERROR"] = "ERR_RESPONSE_PARSE";
})(exports.ApiErrorCode || (exports.ApiErrorCode = {}));
const ERROR_MESSAGES = {
  // 网络错误
  [exports.ApiErrorCode.NETWORK_ERROR]: "\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25",
  [exports.ApiErrorCode.NETWORK_TIMEOUT]: "\u7F51\u7EDC\u8BF7\u6C42\u8D85\u65F6",
  [exports.ApiErrorCode.NETWORK_OFFLINE]: "\u7F51\u7EDC\u8FDE\u63A5\u5DF2\u65AD\u5F00",
  [exports.ApiErrorCode.NETWORK_CONNECTION_REFUSED]: "\u670D\u52A1\u5668\u62D2\u7EDD\u8FDE\u63A5",
  // HTTP状态码错误
  [exports.ApiErrorCode.HTTP_BAD_REQUEST]: "\u8BF7\u6C42\u53C2\u6570\u9519\u8BEF",
  [exports.ApiErrorCode.HTTP_UNAUTHORIZED]: "\u672A\u6388\u6743\uFF0C\u8BF7\u5148\u767B\u5F55",
  [exports.ApiErrorCode.HTTP_FORBIDDEN]: "\u6CA1\u6709\u6743\u9650\u8BBF\u95EE\u8BE5\u8D44\u6E90",
  [exports.ApiErrorCode.HTTP_NOT_FOUND]: "\u8BF7\u6C42\u7684\u8D44\u6E90\u4E0D\u5B58\u5728",
  [exports.ApiErrorCode.HTTP_METHOD_NOT_ALLOWED]: "\u4E0D\u652F\u6301\u7684\u8BF7\u6C42\u65B9\u6CD5",
  [exports.ApiErrorCode.HTTP_TIMEOUT]: "\u8BF7\u6C42\u8D85\u65F6",
  [exports.ApiErrorCode.HTTP_CONFLICT]: "\u8D44\u6E90\u51B2\u7A81",
  [exports.ApiErrorCode.HTTP_RATE_LIMIT]: "\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5",
  [exports.ApiErrorCode.HTTP_SERVER_ERROR]: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF",
  [exports.ApiErrorCode.HTTP_BAD_GATEWAY]: "\u7F51\u5173\u9519\u8BEF",
  [exports.ApiErrorCode.HTTP_SERVICE_UNAVAILABLE]: "\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528",
  [exports.ApiErrorCode.HTTP_GATEWAY_TIMEOUT]: "\u7F51\u5173\u8D85\u65F6",
  // 业务错误
  [exports.ApiErrorCode.BUSINESS_ERROR]: "\u4E1A\u52A1\u5904\u7406\u5931\u8D25",
  [exports.ApiErrorCode.VALIDATION_ERROR]: "\u6570\u636E\u9A8C\u8BC1\u5931\u8D25",
  [exports.ApiErrorCode.DATA_NOT_FOUND]: "\u6570\u636E\u4E0D\u5B58\u5728",
  [exports.ApiErrorCode.DUPLICATE_DATA]: "\u6570\u636E\u5DF2\u5B58\u5728",
  [exports.ApiErrorCode.INVALID_PARAMS]: "\u53C2\u6570\u683C\u5F0F\u9519\u8BEF",
  // 认证/授权错误
  [exports.ApiErrorCode.AUTH_TOKEN_EXPIRED]: "\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55",
  [exports.ApiErrorCode.AUTH_TOKEN_INVALID]: "\u767B\u5F55\u51ED\u8BC1\u65E0\u6548",
  [exports.ApiErrorCode.AUTH_REFRESH_FAILED]: "\u5237\u65B0\u767B\u5F55\u51ED\u8BC1\u5931\u8D25",
  [exports.ApiErrorCode.AUTH_NO_PERMISSION]: "\u6CA1\u6709\u64CD\u4F5C\u6743\u9650",
  // 配置错误
  [exports.ApiErrorCode.CONFIG_INVALID]: "\u914D\u7F6E\u65E0\u6548",
  [exports.ApiErrorCode.METHOD_NOT_FOUND]: "API\u65B9\u6CD5\u672A\u627E\u5230",
  [exports.ApiErrorCode.PLUGIN_NOT_FOUND]: "\u63D2\u4EF6\u672A\u627E\u5230",
  // 缓存错误
  [exports.ApiErrorCode.CACHE_ERROR]: "\u7F13\u5B58\u64CD\u4F5C\u5931\u8D25",
  [exports.ApiErrorCode.CACHE_WRITE_FAILED]: "\u5199\u5165\u7F13\u5B58\u5931\u8D25",
  [exports.ApiErrorCode.CACHE_READ_FAILED]: "\u8BFB\u53D6\u7F13\u5B58\u5931\u8D25",
  // 限流错误
  [exports.ApiErrorCode.RATE_LIMIT_EXCEEDED]: "\u8BF7\u6C42\u9891\u7387\u8D85\u9650",
  [exports.ApiErrorCode.QUEUE_OVERFLOW]: "\u8BF7\u6C42\u961F\u5217\u5DF2\u6EE1",
  [exports.ApiErrorCode.CIRCUIT_BREAKER_OPEN]: "\u670D\u52A1\u7194\u65AD\u4E2D\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5",
  // 其他错误
  [exports.ApiErrorCode.UNKNOWN_ERROR]: "\u672A\u77E5\u9519\u8BEF",
  [exports.ApiErrorCode.REQUEST_CANCELLED]: "\u8BF7\u6C42\u5DF2\u53D6\u6D88",
  [exports.ApiErrorCode.RESPONSE_PARSE_ERROR]: "\u54CD\u5E94\u6570\u636E\u89E3\u6790\u5931\u8D25"
};
const ERROR_SUGGESTIONS = {
  // 网络错误
  [exports.ApiErrorCode.NETWORK_ERROR]: [
    "\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5\u662F\u5426\u6B63\u5E38",
    "\u5C1D\u8BD5\u5237\u65B0\u9875\u9762\u91CD\u8BD5",
    "\u5982\u679C\u95EE\u9898\u6301\u7EED\uFF0C\u8BF7\u8054\u7CFB\u6280\u672F\u652F\u6301"
  ],
  [exports.ApiErrorCode.NETWORK_TIMEOUT]: [
    "\u7F51\u7EDC\u8F83\u6162\uFF0C\u5EFA\u8BAE\u7A0D\u540E\u91CD\u8BD5",
    "\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5\u8D28\u91CF",
    "\u8003\u8651\u589E\u52A0\u8BF7\u6C42\u8D85\u65F6\u65F6\u95F4"
  ],
  [exports.ApiErrorCode.NETWORK_OFFLINE]: [
    "\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5",
    "\u8FDE\u63A5Wi-Fi\u6216\u79FB\u52A8\u7F51\u7EDC\u540E\u91CD\u8BD5"
  ],
  [exports.ApiErrorCode.NETWORK_CONNECTION_REFUSED]: [
    "\u670D\u52A1\u5668\u53EF\u80FD\u6B63\u5728\u7EF4\u62A4",
    "\u8BF7\u7A0D\u540E\u91CD\u8BD5",
    "\u8054\u7CFB\u7BA1\u7406\u5458\u786E\u8BA4\u670D\u52A1\u5668\u72B6\u6001"
  ],
  // HTTP状态码错误
  [exports.ApiErrorCode.HTTP_BAD_REQUEST]: [
    "\u68C0\u67E5\u8BF7\u6C42\u53C2\u6570\u662F\u5426\u6B63\u786E",
    "\u67E5\u770BAPI\u6587\u6863\u4E86\u89E3\u6B63\u786E\u7684\u53C2\u6570\u683C\u5F0F"
  ],
  [exports.ApiErrorCode.HTTP_UNAUTHORIZED]: [
    "\u8BF7\u5148\u767B\u5F55\u7CFB\u7EDF",
    "\u5982\u5DF2\u767B\u5F55\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5",
    "\u6E05\u9664\u6D4F\u89C8\u5668\u7F13\u5B58\u540E\u91CD\u65B0\u767B\u5F55"
  ],
  [exports.ApiErrorCode.HTTP_FORBIDDEN]: [
    "\u5F53\u524D\u8D26\u53F7\u6CA1\u6709\u8BBF\u95EE\u6743\u9650",
    "\u8054\u7CFB\u7BA1\u7406\u5458\u7533\u8BF7\u6743\u9650"
  ],
  [exports.ApiErrorCode.HTTP_NOT_FOUND]: [
    "\u8BF7\u6C42\u7684\u8D44\u6E90\u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u5220\u9664",
    "\u68C0\u67E5URL\u662F\u5426\u6B63\u786E",
    "\u8054\u7CFB\u6280\u672F\u652F\u6301\u786E\u8BA4\u8D44\u6E90\u72B6\u6001"
  ],
  [exports.ApiErrorCode.HTTP_METHOD_NOT_ALLOWED]: [
    "\u4F7F\u7528\u4E86\u4E0D\u652F\u6301\u7684\u8BF7\u6C42\u65B9\u6CD5",
    "\u68C0\u67E5API\u6587\u6863\u4E86\u89E3\u6B63\u786E\u7684\u8BF7\u6C42\u65B9\u6CD5"
  ],
  [exports.ApiErrorCode.HTTP_TIMEOUT]: [
    "\u8BF7\u6C42\u5904\u7406\u65F6\u95F4\u8FC7\u957F",
    "\u7A0D\u540E\u91CD\u8BD5",
    "\u8003\u8651\u4F18\u5316\u8BF7\u6C42\u53C2\u6570"
  ],
  [exports.ApiErrorCode.HTTP_CONFLICT]: [
    "\u8D44\u6E90\u72B6\u6001\u51B2\u7A81",
    "\u5237\u65B0\u6570\u636E\u540E\u91CD\u8BD5"
  ],
  [exports.ApiErrorCode.HTTP_RATE_LIMIT]: [
    "\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41",
    "\u7B49\u5F85\u4E00\u6BB5\u65F6\u95F4\u540E\u91CD\u8BD5",
    "\u4F18\u5316\u8BF7\u6C42\u9891\u7387"
  ],
  [exports.ApiErrorCode.HTTP_SERVER_ERROR]: [
    "\u670D\u52A1\u5668\u5904\u7406\u51FA\u9519",
    "\u7A0D\u540E\u91CD\u8BD5",
    "\u5982\u679C\u95EE\u9898\u6301\u7EED\uFF0C\u8BF7\u8054\u7CFB\u6280\u672F\u652F\u6301"
  ],
  [exports.ApiErrorCode.HTTP_BAD_GATEWAY]: [
    "\u7F51\u5173\u670D\u52A1\u5F02\u5E38",
    "\u7A0D\u540E\u91CD\u8BD5"
  ],
  [exports.ApiErrorCode.HTTP_SERVICE_UNAVAILABLE]: [
    "\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528",
    "\u53EF\u80FD\u6B63\u5728\u7EF4\u62A4\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5"
  ],
  [exports.ApiErrorCode.HTTP_GATEWAY_TIMEOUT]: [
    "\u7F51\u5173\u8D85\u65F6",
    "\u7A0D\u540E\u91CD\u8BD5"
  ],
  // 业务错误
  [exports.ApiErrorCode.BUSINESS_ERROR]: [
    "\u4E1A\u52A1\u5904\u7406\u5931\u8D25",
    "\u68C0\u67E5\u8F93\u5165\u6570\u636E\u662F\u5426\u7B26\u5408\u4E1A\u52A1\u89C4\u5219"
  ],
  [exports.ApiErrorCode.VALIDATION_ERROR]: [
    "\u6570\u636E\u9A8C\u8BC1\u4E0D\u901A\u8FC7",
    "\u68C0\u67E5\u8F93\u5165\u683C\u5F0F\u662F\u5426\u6B63\u786E"
  ],
  [exports.ApiErrorCode.DATA_NOT_FOUND]: [
    "\u6570\u636E\u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u5220\u9664",
    "\u5237\u65B0\u9875\u9762\u67E5\u770B\u6700\u65B0\u6570\u636E"
  ],
  [exports.ApiErrorCode.DUPLICATE_DATA]: [
    "\u6570\u636E\u5DF2\u5B58\u5728",
    "\u68C0\u67E5\u662F\u5426\u91CD\u590D\u63D0\u4EA4"
  ],
  [exports.ApiErrorCode.INVALID_PARAMS]: [
    "\u53C2\u6570\u683C\u5F0F\u9519\u8BEF",
    "\u68C0\u67E5\u8F93\u5165\u503C\u7684\u7C7B\u578B\u548C\u683C\u5F0F"
  ],
  // 认证/授权错误
  [exports.ApiErrorCode.AUTH_TOKEN_EXPIRED]: [
    "\u767B\u5F55\u5DF2\u8FC7\u671F",
    "\u8BF7\u91CD\u65B0\u767B\u5F55"
  ],
  [exports.ApiErrorCode.AUTH_TOKEN_INVALID]: [
    "\u767B\u5F55\u51ED\u8BC1\u65E0\u6548",
    "\u8BF7\u91CD\u65B0\u767B\u5F55",
    "\u6E05\u9664\u6D4F\u89C8\u5668\u7F13\u5B58\u540E\u91CD\u8BD5"
  ],
  [exports.ApiErrorCode.AUTH_REFRESH_FAILED]: [
    "\u5237\u65B0\u767B\u5F55\u72B6\u6001\u5931\u8D25",
    "\u8BF7\u91CD\u65B0\u767B\u5F55"
  ],
  [exports.ApiErrorCode.AUTH_NO_PERMISSION]: [
    "\u5F53\u524D\u8D26\u53F7\u6CA1\u6709\u64CD\u4F5C\u6743\u9650",
    "\u8054\u7CFB\u7BA1\u7406\u5458\u7533\u8BF7\u6743\u9650"
  ],
  // 配置错误
  [exports.ApiErrorCode.CONFIG_INVALID]: [
    "\u914D\u7F6E\u53C2\u6570\u65E0\u6548",
    "\u68C0\u67E5\u914D\u7F6E\u6587\u4EF6"
  ],
  [exports.ApiErrorCode.METHOD_NOT_FOUND]: [
    "API\u65B9\u6CD5\u672A\u6CE8\u518C",
    "\u68C0\u67E5\u65B9\u6CD5\u540D\u662F\u5426\u6B63\u786E",
    "\u786E\u8BA4\u63D2\u4EF6\u662F\u5426\u5DF2\u52A0\u8F7D"
  ],
  [exports.ApiErrorCode.PLUGIN_NOT_FOUND]: [
    "\u63D2\u4EF6\u672A\u627E\u5230",
    "\u786E\u8BA4\u63D2\u4EF6\u662F\u5426\u5DF2\u5B89\u88C5"
  ],
  // 缓存错误
  [exports.ApiErrorCode.CACHE_ERROR]: [
    "\u7F13\u5B58\u64CD\u4F5C\u5931\u8D25",
    "\u6E05\u9664\u7F13\u5B58\u540E\u91CD\u8BD5"
  ],
  [exports.ApiErrorCode.CACHE_WRITE_FAILED]: [
    "\u5199\u5165\u7F13\u5B58\u5931\u8D25",
    "\u68C0\u67E5\u5B58\u50A8\u7A7A\u95F4\u662F\u5426\u5145\u8DB3"
  ],
  [exports.ApiErrorCode.CACHE_READ_FAILED]: [
    "\u8BFB\u53D6\u7F13\u5B58\u5931\u8D25",
    "\u6E05\u9664\u7F13\u5B58\u540E\u91CD\u8BD5"
  ],
  // 限流错误
  [exports.ApiErrorCode.RATE_LIMIT_EXCEEDED]: [
    "\u8BF7\u6C42\u9891\u7387\u8FC7\u9AD8",
    "\u7B49\u5F85\u7247\u523B\u540E\u91CD\u8BD5"
  ],
  [exports.ApiErrorCode.QUEUE_OVERFLOW]: [
    "\u8BF7\u6C42\u961F\u5217\u5DF2\u6EE1",
    "\u7A0D\u540E\u91CD\u8BD5"
  ],
  [exports.ApiErrorCode.CIRCUIT_BREAKER_OPEN]: [
    "\u670D\u52A1\u7194\u65AD\u4FDD\u62A4\u4E2D",
    "\u8BF7\u7B49\u5F85\u670D\u52A1\u6062\u590D"
  ],
  // 其他错误
  [exports.ApiErrorCode.UNKNOWN_ERROR]: [
    "\u53D1\u751F\u672A\u77E5\u9519\u8BEF",
    "\u8BF7\u8054\u7CFB\u6280\u672F\u652F\u6301"
  ],
  [exports.ApiErrorCode.REQUEST_CANCELLED]: [
    "\u8BF7\u6C42\u5DF2\u53D6\u6D88"
  ],
  [exports.ApiErrorCode.RESPONSE_PARSE_ERROR]: [
    "\u54CD\u5E94\u6570\u636E\u683C\u5F0F\u9519\u8BEF",
    "\u8054\u7CFB\u6280\u672F\u652F\u6301"
  ]
};
function getErrorCodeByHttpStatus(status) {
  const statusCodeMap = {
    400: exports.ApiErrorCode.HTTP_BAD_REQUEST,
    401: exports.ApiErrorCode.HTTP_UNAUTHORIZED,
    403: exports.ApiErrorCode.HTTP_FORBIDDEN,
    404: exports.ApiErrorCode.HTTP_NOT_FOUND,
    405: exports.ApiErrorCode.HTTP_METHOD_NOT_ALLOWED,
    408: exports.ApiErrorCode.HTTP_TIMEOUT,
    409: exports.ApiErrorCode.HTTP_CONFLICT,
    429: exports.ApiErrorCode.HTTP_RATE_LIMIT,
    500: exports.ApiErrorCode.HTTP_SERVER_ERROR,
    502: exports.ApiErrorCode.HTTP_BAD_GATEWAY,
    503: exports.ApiErrorCode.HTTP_SERVICE_UNAVAILABLE,
    504: exports.ApiErrorCode.HTTP_GATEWAY_TIMEOUT
  };
  return statusCodeMap[status] || exports.ApiErrorCode.HTTP_SERVER_ERROR;
}
function isRetryableError(code) {
  const retryableErrors = [
    exports.ApiErrorCode.NETWORK_ERROR,
    exports.ApiErrorCode.NETWORK_TIMEOUT,
    exports.ApiErrorCode.HTTP_TIMEOUT,
    exports.ApiErrorCode.HTTP_RATE_LIMIT,
    exports.ApiErrorCode.HTTP_SERVER_ERROR,
    exports.ApiErrorCode.HTTP_BAD_GATEWAY,
    exports.ApiErrorCode.HTTP_SERVICE_UNAVAILABLE,
    exports.ApiErrorCode.HTTP_GATEWAY_TIMEOUT
  ];
  return retryableErrors.includes(code);
}
function isAuthError(code) {
  const authErrors = [
    exports.ApiErrorCode.HTTP_UNAUTHORIZED,
    exports.ApiErrorCode.AUTH_TOKEN_EXPIRED,
    exports.ApiErrorCode.AUTH_TOKEN_INVALID,
    exports.ApiErrorCode.AUTH_REFRESH_FAILED
  ];
  return authErrors.includes(code);
}
function getErrorSeverity(code) {
  const criticalErrors = [
    exports.ApiErrorCode.HTTP_SERVER_ERROR,
    exports.ApiErrorCode.AUTH_REFRESH_FAILED
  ];
  if (criticalErrors.includes(code)) {
    return "CRITICAL";
  }
  const highErrors = [
    exports.ApiErrorCode.NETWORK_ERROR,
    exports.ApiErrorCode.HTTP_UNAUTHORIZED,
    exports.ApiErrorCode.HTTP_FORBIDDEN,
    exports.ApiErrorCode.AUTH_TOKEN_EXPIRED,
    exports.ApiErrorCode.AUTH_TOKEN_INVALID
  ];
  if (highErrors.includes(code)) {
    return "HIGH";
  }
  const mediumErrors = [
    exports.ApiErrorCode.HTTP_BAD_REQUEST,
    exports.ApiErrorCode.HTTP_NOT_FOUND,
    exports.ApiErrorCode.HTTP_RATE_LIMIT,
    exports.ApiErrorCode.BUSINESS_ERROR,
    exports.ApiErrorCode.VALIDATION_ERROR
  ];
  if (mediumErrors.includes(code)) {
    return "MEDIUM";
  }
  return "LOW";
}

exports.ERROR_MESSAGES = ERROR_MESSAGES;
exports.ERROR_SUGGESTIONS = ERROR_SUGGESTIONS;
exports.getErrorCodeByHttpStatus = getErrorCodeByHttpStatus;
exports.getErrorSeverity = getErrorSeverity;
exports.isAuthError = isAuthError;
exports.isRetryableError = isRetryableError;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=ErrorCodes.cjs.map
