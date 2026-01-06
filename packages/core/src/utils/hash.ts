/**
 * 哈希和请求键生成工具
 *
 * 用于生成缓存键、请求去重键等
 */

/**
 * 请求键生成选项
 */
export interface RequestKeyOptions {
  /** 是否包含 URL */
  includeUrl?: boolean
  /** 是否包含方法 */
  includeMethod?: boolean
  /** 是否包含请求体 */
  includeBody?: boolean
  /** 是否包含查询参数 */
  includeQuery?: boolean
  /** 是否包含请求头 */
  includeHeaders?: boolean
  /** 要包含的特定请求头 */
  headerKeys?: string[]
  /** 自定义键生成器 */
  customKeyGenerator?: (config: RequestKeyConfig) => string
}

/**
 * 请求键配置
 */
export interface RequestKeyConfig {
  /** 请求 URL */
  url?: string
  /** 请求方法 */
  method?: string
  /** 请求体 */
  body?: unknown
  /** 查询参数 */
  query?: Record<string, unknown>
  /** 请求头 */
  headers?: Record<string, string>
  /** 参数（LEAP API 用） */
  params?: Record<string, unknown>
}

/**
 * 简单的字符串哈希函数
 *
 * 使用 djb2 算法生成 32 位哈希值
 *
 * @param str - 要哈希的字符串
 * @returns 哈希值（十六进制字符串）
 *
 * @example
 * ```typescript
 * hashString('hello')  // 'a5d3c5e4'
 * hashString('world')  // 'b8e8d6f2'
 * ```
 */
export function hashString(str: string): string {
  let hash = 5381

  for (let i = 0; i < str.length; i++) {
    // hash * 33 + char
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
  }

  // 转换为无符号 32 位整数并返回十六进制
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/**
 * 快速字符串哈希（性能优先）
 *
 * 使用 MurmurHash3 变体，适合大量字符串
 *
 * @param str - 要哈希的字符串
 * @param seed - 种子值
 * @returns 哈希值
 */
export function fastHash(str: string, seed = 0): number {
  let h1 = seed
  const c1 = 0xcc9e2d51
  const c2 = 0x1b873593

  for (let i = 0; i < str.length; i++) {
    let k1 = str.charCodeAt(i)
    k1 = Math.imul(k1, c1)
    k1 = (k1 << 15) | (k1 >>> 17)
    k1 = Math.imul(k1, c2)
    h1 ^= k1
    h1 = (h1 << 13) | (h1 >>> 19)
    h1 = Math.imul(h1, 5) + 0xe6546b64
  }

  h1 ^= str.length
  h1 ^= h1 >>> 16
  h1 = Math.imul(h1, 0x85ebca6b)
  h1 ^= h1 >>> 13
  h1 = Math.imul(h1, 0xc2b2ae35)
  h1 ^= h1 >>> 16

  return h1 >>> 0
}

/**
 * 序列化参数为字符串
 *
 * 稳定的序列化，相同对象总是产生相同字符串
 *
 * @param params - 要序列化的参数
 * @returns 序列化后的字符串
 *
 * @example
 * ```typescript
 * serializeParams({ b: 2, a: 1 })  // '{"a":1,"b":2}'
 * serializeParams([1, 2, 3])       // '[1,2,3]'
 * ```
 */
export function serializeParams(params: unknown): string {
  if (params === undefined) {
    return ''
  }

  if (params === null) {
    return 'null'
  }

  // 基本类型
  if (typeof params !== 'object') {
    return String(params)
  }

  // 数组
  if (Array.isArray(params)) {
    return '[' + params.map(serializeParams).join(',') + ']'
  }

  // Date
  if (params instanceof Date) {
    return params.toISOString()
  }

  // 普通对象，按键排序保证稳定性
  const obj = params as Record<string, unknown>
  const keys = Object.keys(obj).sort()

  if (keys.length === 0) {
    return '{}'
  }

  const parts: string[] = []
  for (const key of keys) {
    const value = obj[key]
    if (value !== undefined) {
      parts.push(`"${key}":${serializeParams(value)}`)
    }
  }

  return '{' + parts.join(',') + '}'
}

/**
 * 生成请求唯一键
 *
 * 用于请求缓存和去重
 *
 * @param config - 请求配置
 * @param options - 键生成选项
 * @returns 唯一键字符串
 *
 * @example
 * ```typescript
 * const key = generateRequestKey({
 *   url: '/api/users',
 *   method: 'GET',
 *   query: { page: 1 }
 * })
 * // 'GET:/api/users?{"page":1}'
 * ```
 */
export function generateRequestKey(
  config: RequestKeyConfig,
  options: RequestKeyOptions = {}
): string {
  const {
    includeUrl = true,
    includeMethod = true,
    includeBody = true,
    includeQuery = true,
    includeHeaders = false,
    headerKeys = [],
    customKeyGenerator,
  } = options

  // 使用自定义生成器
  if (customKeyGenerator) {
    return customKeyGenerator(config)
  }

  const parts: string[] = []

  // 方法
  if (includeMethod && config.method) {
    parts.push(config.method.toUpperCase())
  }

  // URL
  if (includeUrl && config.url) {
    parts.push(config.url)
  }

  // 查询参数
  if (includeQuery && config.query) {
    const queryStr = serializeParams(config.query)
    if (queryStr && queryStr !== '{}') {
      parts.push('query:' + queryStr)
    }
  }

  // LEAP 参数
  if (config.params) {
    const paramsStr = serializeParams(config.params)
    if (paramsStr && paramsStr !== '{}') {
      parts.push('params:' + paramsStr)
    }
  }

  // 请求体
  if (includeBody && config.body !== undefined) {
    const bodyStr = serializeParams(config.body)
    if (bodyStr) {
      parts.push('body:' + bodyStr)
    }
  }

  // 请求头
  if (includeHeaders && config.headers) {
    const headersToInclude = headerKeys.length > 0
      ? headerKeys
      : Object.keys(config.headers)

    const headerParts: string[] = []
    for (const key of headersToInclude.sort()) {
      const value = config.headers[key]
      if (value !== undefined) {
        headerParts.push(`${key}:${value}`)
      }
    }

    if (headerParts.length > 0) {
      parts.push('headers:' + headerParts.join(','))
    }
  }

  return parts.join('|')
}

/**
 * 生成短哈希键
 *
 * 将完整请求键转换为短哈希
 *
 * @param config - 请求配置
 * @param options - 键生成选项
 * @returns 短哈希键
 *
 * @example
 * ```typescript
 * const key = generateShortKey({
 *   url: '/api/users',
 *   method: 'GET'
 * })
 * // 'a1b2c3d4'
 * ```
 */
export function generateShortKey(
  config: RequestKeyConfig,
  options: RequestKeyOptions = {}
): string {
  const fullKey = generateRequestKey(config, options)
  return hashString(fullKey)
}
