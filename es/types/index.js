/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
export { ApiError, ApiErrorFactory, ApiErrorType, ErrorSeverity } from '../utils/ApiError.js';

const SYSTEM_API_METHODS = {
  /** 获取验证码 */
  GET_CAPTCHA: "getCaptcha",
  /** 用户登录 */
  LOGIN: "login",
  /** 用户登出 */
  LOGOUT: "logout",
  /** 获取用户信息 */
  GET_USER_INFO: "getUserInfo",
  /** 更新用户信息 */
  UPDATE_USER_INFO: "updateUserInfo",
  /** 获取系统菜单 */
  GET_MENUS: "getMenus",
  /** 获取用户权限 */
  GET_PERMISSIONS: "getPermissions",
  /** 刷新令牌 */
  REFRESH_TOKEN: "refreshToken",
  /** 修改密码 */
  CHANGE_PASSWORD: "changePassword",
  /** 获取系统配置 */
  GET_SYSTEM_CONFIG: "getSystemConfig"
};

export { SYSTEM_API_METHODS };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
