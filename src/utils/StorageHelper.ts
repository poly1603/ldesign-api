/**
 * Storage 访问辅助工具
 * 提供统一的 localStorage/sessionStorage 访问接口，包含错误处理
 */

import { SYSTEM_API_CONSTANTS } from '../constants'

/**
 * Storage 访问器
 * 提供安全的 storage 访问方法，自动处理错误
 */
export class StorageHelper {
  private storage: Storage

  constructor(storage: Storage = typeof localStorage !== 'undefined' ? localStorage : null as any) {
    this.storage = storage
  }

  /**
   * 安全地获取项
   */
  getItem(key: string): string | null {
    try {
      if (!this.storage) return null
      return this.storage.getItem(key)
    }
    catch {
      return null
    }
  }

  /**
   * 安全地设置项
   */
  setItem(key: string, value: string): boolean {
    try {
      if (!this.storage) return false
      this.storage.setItem(key, value)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 安全地删除项
   */
  removeItem(key: string): boolean {
    try {
      if (!this.storage) return false
      this.storage.removeItem(key)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 安全地清空所有项
   */
  clear(): boolean {
    try {
      if (!this.storage) return false
      this.storage.clear()
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取JSON对象
   */
  getJSON<T = any>(key: string, defaultValue?: T): T | null {
    const value = this.getItem(key)
    if (!value) return defaultValue ?? null

    try {
      return JSON.parse(value) as T
    }
    catch {
      return defaultValue ?? null
    }
  }

  /**
   * 设置JSON对象
   */
  setJSON(key: string, value: any): boolean {
    try {
      const json = JSON.stringify(value)
      return this.setItem(key, json)
    }
    catch {
      return false
    }
  }

  /**
   * 检查键是否存在
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    try {
      if (!this.storage) return []
      const keys: string[] = []
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key) keys.push(key)
      }
      return keys
    }
    catch {
      return []
    }
  }

  /**
   * 获取存储大小（粗略估算）
   */
  getSize(): number {
    try {
      if (!this.storage) return 0
      let size = 0
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key) {
          const value = this.storage.getItem(key)
          if (value) {
            size += key.length + value.length
          }
        }
      }
      return size * 2 // UTF-16
    }
    catch {
      return 0
    }
  }
}

/**
 * 认证相关 Storage 辅助类
 * 专门处理认证相关的token和用户信息存储
 */
export class AuthStorageHelper {
  private helper: StorageHelper

  constructor(storage: Storage = typeof localStorage !== 'undefined' ? localStorage : null as any) {
    this.helper = new StorageHelper(storage)
  }

  /**
   * 获取访问令牌
   */
  getAccessToken(): string | null {
    return this.helper.getItem(SYSTEM_API_CONSTANTS.ACCESS_TOKEN_KEY)
  }

  /**
   * 设置访问令牌
   */
  setAccessToken(token: string): boolean {
    return this.helper.setItem(SYSTEM_API_CONSTANTS.ACCESS_TOKEN_KEY, token)
  }

  /**
   * 删除访问令牌
   */
  removeAccessToken(): boolean {
    return this.helper.removeItem(SYSTEM_API_CONSTANTS.ACCESS_TOKEN_KEY)
  }

  /**
   * 获取刷新令牌
   */
  getRefreshToken(): string | null {
    return this.helper.getItem(SYSTEM_API_CONSTANTS.REFRESH_TOKEN_KEY)
  }

  /**
   * 设置刷新令牌
   */
  setRefreshToken(token: string): boolean {
    return this.helper.setItem(SYSTEM_API_CONSTANTS.REFRESH_TOKEN_KEY, token)
  }

  /**
   * 删除刷新令牌
   */
  removeRefreshToken(): boolean {
    return this.helper.removeItem(SYSTEM_API_CONSTANTS.REFRESH_TOKEN_KEY)
  }

  /**
   * 获取用户信息
   */
  getUserInfo<T = any>(): T | null {
    return this.helper.getJSON<T>(SYSTEM_API_CONSTANTS.USER_INFO_KEY)
  }

  /**
   * 设置用户信息
   */
  setUserInfo(userInfo: any): boolean {
    return this.helper.setJSON(SYSTEM_API_CONSTANTS.USER_INFO_KEY, userInfo)
  }

  /**
   * 删除用户信息
   */
  removeUserInfo(): boolean {
    return this.helper.removeItem(SYSTEM_API_CONSTANTS.USER_INFO_KEY)
  }

  /**
   * 清除所有认证信息
   */
  clearAuth(): boolean {
    let success = true
    success = this.removeAccessToken() && success
    success = this.removeRefreshToken() && success
    success = this.removeUserInfo() && success
    return success
  }

  /**
   * 检查是否已登录（有访问令牌）
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null
  }

  /**
   * 获取Authorization头值
   */
  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken()
    return token ? `Bearer ${token}` : null
  }
}

/**
 * 创建全局 Storage 辅助器
 */
let globalStorageHelper: StorageHelper | null = null
let globalAuthStorageHelper: AuthStorageHelper | null = null

/**
 * 获取全局 Storage 辅助器
 */
export function getGlobalStorageHelper(): StorageHelper {
  if (!globalStorageHelper) {
    globalStorageHelper = new StorageHelper()
  }
  return globalStorageHelper
}

/**
 * 获取全局认证 Storage 辅助器
 */
export function getGlobalAuthStorageHelper(): AuthStorageHelper {
  if (!globalAuthStorageHelper) {
    globalAuthStorageHelper = new AuthStorageHelper()
  }
  return globalAuthStorageHelper
}

/**
 * 重置全局辅助器
 */
export function resetGlobalStorageHelpers(): void {
  globalStorageHelper = null
  globalAuthStorageHelper = null
}


