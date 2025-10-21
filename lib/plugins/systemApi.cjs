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

var index = require('../types/index.cjs');

const systemApiMethods = {
  /**
   * 获取验证码
   */
  [index.SYSTEM_API_METHODS.GET_CAPTCHA]: {
    name: index.SYSTEM_API_METHODS.GET_CAPTCHA,
    config: {
      method: "GET",
      url: "/auth/captcha"
    },
    transform: (response) => {
      return {
        captchaId: response.data.captchaId || response.data.id,
        captchaImage: response.data.captchaImage || response.data.image,
        expiresIn: response.data.expiresIn || 300
      };
    },
    cache: {
      enabled: false
      // 验证码不缓存
    }
  },
  /**
   * 用户登录
   */
  [index.SYSTEM_API_METHODS.LOGIN]: {
    name: index.SYSTEM_API_METHODS.LOGIN,
    config: (params) => ({
      method: "POST",
      url: "/auth/login",
      data: params
    }),
    transform: (response) => {
      const data = response.data;
      return {
        accessToken: data.accessToken || data.token || data.access_token,
        refreshToken: data.refreshToken || data.refresh_token,
        tokenType: data.tokenType || data.token_type || "Bearer",
        expiresIn: data.expiresIn || data.expires_in,
        userInfo: data.userInfo || data.user
      };
    },
    onSuccess: (result) => {
      try {
        if (result.accessToken && typeof localStorage !== "undefined") {
          localStorage.setItem("access_token", result.accessToken);
        }
        if (result.refreshToken && typeof localStorage !== "undefined") {
          localStorage.setItem("refresh_token", result.refreshToken);
        }
      } catch {
      }
    },
    cache: {
      enabled: false
      // 登录结果不缓存
    },
    debounce: {
      enabled: false
      // 登录不防抖
    }
  },
  /**
   * 用户登出
   */
  [index.SYSTEM_API_METHODS.LOGOUT]: {
    name: index.SYSTEM_API_METHODS.LOGOUT,
    config: {
      method: "POST",
      url: "/auth/logout"
    },
    onSuccess: () => {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_info");
        }
      } catch {
      }
    },
    cache: {
      enabled: false
    }
  },
  /**
   * 获取用户信息
   */
  [index.SYSTEM_API_METHODS.GET_USER_INFO]: {
    name: index.SYSTEM_API_METHODS.GET_USER_INFO,
    config: {
      method: "GET",
      url: "/user/info",
      headers: {
        Authorization: () => {
          const token = localStorage.getItem("access_token");
          return token ? `Bearer ${token}` : "";
        }
      }
    },
    transform: (response) => {
      const data = response.data;
      return {
        id: data.id || data.userId,
        username: data.username || data.userName,
        nickname: data.nickname || data.nickName,
        email: data.email,
        phone: data.phone || data.mobile,
        avatar: data.avatar || data.avatarUrl,
        roles: data.roles || [],
        permissions: data.permissions || [],
        department: data.department || data.dept,
        status: data.status || "active",
        createdAt: data.createdAt || data.createTime,
        updatedAt: data.updatedAt || data.updateTime
      };
    },
    onSuccess: (userInfo) => {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("user_info", JSON.stringify(userInfo));
        }
      } catch {
      }
    },
    cache: {
      enabled: true,
      ttl: 6e5
      // 10分钟缓存
    }
  },
  /**
   * 更新用户信息
   */
  [index.SYSTEM_API_METHODS.UPDATE_USER_INFO]: {
    name: index.SYSTEM_API_METHODS.UPDATE_USER_INFO,
    config: (params) => ({
      method: "PUT",
      url: "/user/info",
      data: params,
      headers: {
        Authorization: () => {
          const token = localStorage.getItem("access_token");
          return token ? `Bearer ${token}` : "";
        }
      }
    }),
    onSuccess: () => {
      localStorage.removeItem("user_info");
    },
    cache: {
      enabled: false
    }
  },
  /**
   * 获取系统菜单
   */
  [index.SYSTEM_API_METHODS.GET_MENUS]: {
    name: index.SYSTEM_API_METHODS.GET_MENUS,
    config: {
      method: "GET",
      url: "/system/menus",
      headers: {
        Authorization: () => {
          const token = localStorage.getItem("access_token");
          return token ? `Bearer ${token}` : "";
        }
      }
    },
    transform: (response) => {
      const data = response.data;
      const menus = Array.isArray(data) ? data : data.menus || [];
      return menus.map((menu) => ({
        id: menu.id ?? menu.menuId ?? "",
        name: menu.name ?? menu.menuName ?? "",
        title: menu.title ?? menu.menuTitle ?? menu.name ?? "",
        icon: menu.icon,
        path: menu.path || menu.url,
        component: menu.component,
        parentId: menu.parentId || menu.pid,
        sort: menu.sort || menu.orderNum,
        hidden: menu.hidden || menu.isHidden,
        children: menu.children || [],
        meta: menu.meta || {}
      }));
    },
    cache: {
      enabled: true,
      ttl: 18e5
      // 30分钟缓存
    }
  },
  /**
   * 获取用户权限
   */
  [index.SYSTEM_API_METHODS.GET_PERMISSIONS]: {
    name: index.SYSTEM_API_METHODS.GET_PERMISSIONS,
    config: {
      method: "GET",
      url: "/user/permissions",
      headers: {
        Authorization: () => {
          const token = localStorage.getItem("access_token");
          return token ? `Bearer ${token}` : "";
        }
      }
    },
    transform: (response) => {
      const data = response.data;
      return Array.isArray(data) ? data : data.permissions || [];
    },
    cache: {
      enabled: true,
      ttl: 18e5
      // 30分钟缓存
    }
  },
  /**
   * 刷新令牌
   */
  [index.SYSTEM_API_METHODS.REFRESH_TOKEN]: {
    name: index.SYSTEM_API_METHODS.REFRESH_TOKEN,
    config: {
      method: "POST",
      url: "/auth/refresh",
      data: () => ({
        refreshToken: localStorage.getItem("refresh_token")
      })
    },
    transform: (response) => {
      const data = response.data;
      return {
        accessToken: data.accessToken || data.token || data.access_token,
        refreshToken: data.refreshToken || data.refresh_token,
        tokenType: data.tokenType || data.token_type || "Bearer",
        expiresIn: data.expiresIn || data.expires_in
      };
    },
    onSuccess: (result) => {
      try {
        if (result.accessToken && typeof localStorage !== "undefined") {
          localStorage.setItem("access_token", result.accessToken);
        }
        if (result.refreshToken && typeof localStorage !== "undefined") {
          localStorage.setItem("refresh_token", result.refreshToken);
        }
      } catch {
      }
    },
    cache: {
      enabled: false
    }
  },
  /**
   * 修改密码
   */
  [index.SYSTEM_API_METHODS.CHANGE_PASSWORD]: {
    name: index.SYSTEM_API_METHODS.CHANGE_PASSWORD,
    config: (params) => ({
      method: "PUT",
      url: "/user/password",
      data: params,
      headers: {
        Authorization: () => {
          const token = localStorage.getItem("access_token");
          return token ? `Bearer ${token}` : "";
        }
      }
    }),
    cache: {
      enabled: false
    }
  },
  /**
   * 获取系统配置
   */
  [index.SYSTEM_API_METHODS.GET_SYSTEM_CONFIG]: {
    name: index.SYSTEM_API_METHODS.GET_SYSTEM_CONFIG,
    config: {
      method: "GET",
      url: "/system/config"
    },
    cache: {
      enabled: true,
      ttl: 36e5
      // 1小时缓存
    }
  }
};
const systemApiPlugin = {
  name: "system-apis",
  version: "1.0.0",
  apis: systemApiMethods,
  install: (engine) => {
    const authInstalled = Boolean(engine.__auth_mw__);
    if (authInstalled) {
      const methodNames = [
        index.SYSTEM_API_METHODS.GET_USER_INFO,
        index.SYSTEM_API_METHODS.UPDATE_USER_INFO,
        index.SYSTEM_API_METHODS.GET_MENUS,
        index.SYSTEM_API_METHODS.GET_PERMISSIONS,
        index.SYSTEM_API_METHODS.CHANGE_PASSWORD
      ];
      for (const name of methodNames) {
        const cfg = engine.methods.get(name);
        if (!cfg)
          continue;
        const original = typeof cfg.config === "function" ? cfg.config : () => cfg.config;
        const newCfg = (params) => {
          const rc = original(params);
          const headers = { ...rc.headers || {} };
          if ("Authorization" in headers)
            delete headers.Authorization;
          return { ...rc, headers };
        };
        engine.register(name, { ...cfg, config: newCfg });
      }
    }
    if (engine.config?.debug || typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
      console.info("[System API Plugin] \u7CFB\u7EDF API \u63D2\u4EF6\u5DF2\u5B89\u88C5");
    }
  },
  uninstall: (engine) => {
    if (engine.config?.debug || typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
      console.info("[System API Plugin] \u7CFB\u7EDF API \u63D2\u4EF6\u5DF2\u5378\u8F7D");
    }
  }
};
function createCustomSystemApiPlugin(customMethods, options = {}) {
  const { name = "custom-system-apis", version = "1.0.0", overrideDefaults = false } = options;
  const apis = overrideDefaults ? customMethods : { ...systemApiMethods, ...customMethods };
  return {
    name,
    version,
    apis,
    install: (_engine) => {
      console.warn(`[${name}] \u81EA\u5B9A\u4E49\u7CFB\u7EDF API \u63D2\u4EF6\u5DF2\u5B89\u88C5`);
    },
    uninstall: (_engine) => {
      console.warn(`[${name}] \u81EA\u5B9A\u4E49\u7CFB\u7EDF API \u63D2\u4EF6\u5DF2\u5378\u8F7D`);
    }
  };
}

exports.createCustomSystemApiPlugin = createCustomSystemApiPlugin;
exports.systemApiPlugin = systemApiPlugin;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=systemApi.cjs.map
