/**
 * 错误相关常量
 * 集中管理所有错误消息和建议，减少内存占用
 */

/**
 * 用户友好的错误消息
 */
export const ERROR_USER_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  CANCELLED_ERROR: '请求已取消',
  SERVER_ERROR: '服务器暂时不可用，请稍后重试',
  AUTH_ERROR: '身份验证失败，请重新登录',
  PERMISSION_ERROR: '权限不足，无法执行此操作',
  NOT_FOUND_ERROR: '请求的资源不存在',
  VALIDATION_ERROR: '数据格式不正确，请检查输入',
  CLIENT_ERROR: '请求参数错误',
  UNKNOWN_ERROR: '操作失败，请稍后重试',
} as const

/**
 * 错误解决建议
 */
export const ERROR_SUGGESTIONS = {
  NETWORK_ERROR: [
    '检查网络连接',
    '尝试刷新页面',
    '联系网络管理员',
  ],
  TIMEOUT_ERROR: [
    '稍后重试',
    '检查网络速度',
    '减少请求数据量',
  ],
  AUTH_ERROR: [
    '重新登录',
    '检查账号状态',
    '联系管理员',
  ],
  PERMISSION_ERROR: [
    '联系管理员获取权限',
    '检查账号角色',
    '使用其他账号',
  ],
  VALIDATION_ERROR: [
    '检查输入格式',
    '查看字段要求',
    '重新填写表单',
  ],
  DEFAULT: [
    '稍后重试',
    '刷新页面',
    '联系技术支持',
  ],
} as const

/**
 * HTTP状态码映射
 */
export const HTTP_STATUS_MESSAGES = {
  400: '请求参数错误',
  401: '身份验证失败',
  403: '权限不足',
  404: '资源不存在',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
} as const

/**
 * 错误严重程度映射
 */
export const ERROR_SEVERITY_MAP = {
  NETWORK_ERROR: 'HIGH',
  SERVER_ERROR: 'HIGH',
  AUTH_ERROR: 'MEDIUM',
  PERMISSION_ERROR: 'MEDIUM',
  TIMEOUT_ERROR: 'MEDIUM',
  CLIENT_ERROR: 'MEDIUM',
  NOT_FOUND_ERROR: 'MEDIUM',
  CANCELLED_ERROR: 'LOW',
  VALIDATION_ERROR: 'LOW',
  CONFIG_ERROR: 'CRITICAL',
  PLUGIN_ERROR: 'CRITICAL',
  UNKNOWN_ERROR: 'MEDIUM',
} as const

/**
 * 可重试错误类型
 */
export const RETRYABLE_ERROR_TYPES = new Set([
  'NETWORK_ERROR',
  'TIMEOUT_ERROR',
  'SERVER_ERROR',
])

