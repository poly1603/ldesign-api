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

class CancellationToken {
  constructor() {
    this._isCancelled = false;
    this._callbacks = [];
  }
  /**
   * 是否已取消
   */
  get isCancelled() {
    return this._isCancelled;
  }
  /**
   * 取消原因
   */
  get reason() {
    return this._reason;
  }
  /**
   * 取消请求
   */
  cancel(reason) {
    if (this._isCancelled) {
      return;
    }
    this._isCancelled = true;
    this._reason = reason;
    this._callbacks.forEach((callback) => {
      try {
        callback(reason);
      } catch (error) {
        console.error("Error in cancellation callback:", error);
      }
    });
    this._callbacks = [];
  }
  /**
   * 注册取消回调
   */
  onCancel(callback) {
    if (this._isCancelled) {
      callback(this._reason);
      return () => {
      };
    }
    this._callbacks.push(callback);
    return () => {
      const index = this._callbacks.indexOf(callback);
      if (index !== -1) {
        this._callbacks.splice(index, 1);
      }
    };
  }
  /**
   * 抛出取消错误
   */
  throwIfCancelled() {
    if (this._isCancelled) {
      throw new CancellationError(this._reason || "Request cancelled");
    }
  }
}
class CancellationError extends Error {
  constructor(message = "Request cancelled") {
    super(message);
    this.name = "CancellationError";
    this.isCancellation = true;
    Object.setPrototypeOf(this, CancellationError.prototype);
  }
}
function isCancellationError(error) {
  return error instanceof CancellationError || error?.isCancellation === true;
}
class RequestCancellationManager {
  constructor() {
    this.tokens = /* @__PURE__ */ new Map();
    this.groups = /* @__PURE__ */ new Map();
  }
  /**
   * 创建取消令牌
   */
  createToken(requestId, group) {
    this.cancel(requestId);
    const token = new CancellationToken();
    this.tokens.set(requestId, token);
    if (group) {
      if (!this.groups.has(group)) {
        this.groups.set(group, /* @__PURE__ */ new Set());
      }
      this.groups.get(group).add(requestId);
    }
    token.onCancel(() => {
      this.cleanup(requestId);
    });
    return token;
  }
  /**
   * 获取取消令牌
   */
  getToken(requestId) {
    return this.tokens.get(requestId) || null;
  }
  /**
   * 取消请求
   */
  cancel(requestId, reason) {
    const token = this.tokens.get(requestId);
    if (!token) {
      return false;
    }
    token.cancel(reason);
    return true;
  }
  /**
   * 取消组内所有请求
   */
  cancelGroup(group, reason) {
    const requestIds = this.groups.get(group);
    if (!requestIds) {
      return 0;
    }
    let count = 0;
    requestIds.forEach((requestId) => {
      if (this.cancel(requestId, reason)) {
        count++;
      }
    });
    return count;
  }
  /**
   * 取消所有请求
   */
  cancelAll(reason) {
    let count = 0;
    this.tokens.forEach((token, _requestId) => {
      if (!token.isCancelled) {
        token.cancel(reason);
        count++;
      }
    });
    return count;
  }
  /**
   * 检查请求是否已取消
   */
  isCancelled(requestId) {
    const token = this.tokens.get(requestId);
    return token ? token.isCancelled : false;
  }
  /**
   * 清理已完成的请求
   */
  cleanup(requestId) {
    this.tokens.delete(requestId);
    this.groups.forEach((requestIds) => {
      requestIds.delete(requestId);
    });
  }
  /**
   * 清理组
   */
  cleanupGroup(group) {
    const requestIds = this.groups.get(group);
    if (requestIds) {
      requestIds.forEach((requestId) => {
        this.tokens.delete(requestId);
      });
      this.groups.delete(group);
    }
  }
  /**
   * 清理所有
   */
  clear() {
    this.tokens.clear();
    this.groups.clear();
  }
  /**
   * 获取统计信息
   */
  getStats() {
    let activeTokens = 0;
    let cancelledTokens = 0;
    this.tokens.forEach((token) => {
      if (token.isCancelled) {
        cancelledTokens++;
      } else {
        activeTokens++;
      }
    });
    return {
      totalTokens: this.tokens.size,
      activeTokens,
      cancelledTokens,
      totalGroups: this.groups.size
    };
  }
  /**
   * 获取组信息
   */
  getGroupInfo(group) {
    const requestIds = this.groups.get(group);
    if (!requestIds) {
      return null;
    }
    let activeRequests = 0;
    let cancelledRequests = 0;
    requestIds.forEach((requestId) => {
      const token = this.tokens.get(requestId);
      if (token) {
        if (token.isCancelled) {
          cancelledRequests++;
        } else {
          activeRequests++;
        }
      }
    });
    return {
      totalRequests: requestIds.size,
      activeRequests,
      cancelledRequests
    };
  }
  /**
   * 销毁管理器
   */
  destroy() {
    this.cancelAll("Manager destroyed");
    this.clear();
  }
}
function createRequestCancellationManager() {
  return new RequestCancellationManager();
}
const globalCancellationManager = new RequestCancellationManager();

exports.CancellationError = CancellationError;
exports.CancellationToken = CancellationToken;
exports.RequestCancellationManager = RequestCancellationManager;
exports.createRequestCancellationManager = createRequestCancellationManager;
exports.globalCancellationManager = globalCancellationManager;
exports.isCancellationError = isCancellationError;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=RequestCancellation.cjs.map
