/**
 * 对象操作工具函数
 *
 * 提供深度合并、克隆、属性选择等功能
 */

/**
 * 深度部分类型
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T

/**
 * 判断是否为普通对象
 *
 * @param value - 要检查的值
 * @returns 是否为普通对象
 *
 * @example
 * ```typescript
 * isPlainObject({})        // true
 * isPlainObject([])        // false
 * isPlainObject(null)      // false
 * isPlainObject(new Date()) // false
 * ```
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * 深度合并对象
 *
 * @param target - 目标对象
 * @param sources - 源对象列表
 * @returns 合并后的对象
 *
 * @example
 * ```typescript
 * const result = deepMerge(
 *   { a: 1, b: { c: 2 } },
 *   { b: { d: 3 }, e: 4 }
 * )
 * // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: DeepPartial<T>[]
): T {
  if (!sources.length) {
    return target
  }

  const result = { ...target }

  for (const source of sources) {
    if (!isPlainObject(source)) {
      continue
    }

    for (const key of Object.keys(source)) {
      const sourceValue = source[key as keyof typeof source]
      const targetValue = result[key as keyof T]

      if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        // 递归合并对象
        (result as Record<string, unknown>)[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as DeepPartial<Record<string, unknown>>
        )
      } else if (sourceValue !== undefined) {
        // 直接覆盖
        (result as Record<string, unknown>)[key] = sourceValue
      }
    }
  }

  return result
}

/**
 * 深度克隆对象
 *
 * @param value - 要克隆的值
 * @returns 克隆后的值
 *
 * @example
 * ```typescript
 * const original = { a: 1, b: { c: 2 } }
 * const cloned = deepClone(original)
 * cloned.b.c = 3
 * console.log(original.b.c) // 2
 * ```
 */
export function deepClone<T>(value: T): T {
  // 基本类型直接返回
  if (value === null || typeof value !== 'object') {
    return value
  }

  // 处理 Date
  if (value instanceof Date) {
    return new Date(value.getTime()) as T
  }

  // 处理 Array
  if (Array.isArray(value)) {
    return value.map(item => deepClone(item)) as T
  }

  // 处理 Map
  if (value instanceof Map) {
    const clonedMap = new Map()
    value.forEach((v, k) => {
      clonedMap.set(deepClone(k), deepClone(v))
    })
    return clonedMap as T
  }

  // 处理 Set
  if (value instanceof Set) {
    const clonedSet = new Set()
    value.forEach(v => {
      clonedSet.add(deepClone(v))
    })
    return clonedSet as T
  }

  // 处理普通对象
  if (isPlainObject(value)) {
    const clonedObj: Record<string, unknown> = {}
    for (const key of Object.keys(value)) {
      clonedObj[key] = deepClone((value as Record<string, unknown>)[key])
    }
    return clonedObj as T
  }

  // 其他类型尝试使用 structuredClone，不支持则返回原值
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      return value
    }
  }

  return value
}

/**
 * 选择对象的指定属性
 *
 * @param obj - 源对象
 * @param keys - 要选择的属性键
 * @returns 包含指定属性的新对象
 *
 * @example
 * ```typescript
 * const result = pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])
 * // { a: 1, c: 3 }
 * ```
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }

  return result
}

/**
 * 排除对象的指定属性
 *
 * @param obj - 源对象
 * @param keys - 要排除的属性键
 * @returns 排除指定属性后的新对象
 *
 * @example
 * ```typescript
 * const result = omit({ a: 1, b: 2, c: 3 }, ['b'])
 * // { a: 1, c: 3 }
 * ```
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  const keysSet = new Set(keys)

  for (const key of Object.keys(result)) {
    if (keysSet.has(key as K)) {
      delete (result as Record<string, unknown>)[key]
    }
  }

  return result as Omit<T, K>
}

/**
 * 获取对象的嵌套属性值
 *
 * @param obj - 源对象
 * @param path - 属性路径（支持点号分隔）
 * @param defaultValue - 默认值
 * @returns 属性值或默认值
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 1 } } }
 * get(obj, 'a.b.c')       // 1
 * get(obj, 'a.b.d', 0)    // 0
 * get(obj, 'a.x.y', null) // null
 * ```
 */
export function get<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }

    if (typeof result !== 'object') {
      return defaultValue
    }

    result = (result as Record<string, unknown>)[key]
  }

  return (result === undefined ? defaultValue : result) as T | undefined
}

/**
 * 设置对象的嵌套属性值
 *
 * @param obj - 源对象
 * @param path - 属性路径（支持点号分隔）
 * @param value - 要设置的值
 * @returns 修改后的对象
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 1 } } }
 * set(obj, 'a.b.c', 2)    // { a: { b: { c: 2 } } }
 * set(obj, 'a.x.y', 3)    // { a: { b: { c: 2 }, x: { y: 3 } } }
 * ```
 */
export function set<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown
): T {
  const keys = path.split('.')
  let current: Record<string, unknown> = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    if (!(key in current) || !isPlainObject(current[key])) {
      current[key] = {}
    }

    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
  return obj
}

/**
 * 判断两个值是否深度相等
 *
 * @param a - 第一个值
 * @param b - 第二个值
 * @returns 是否相等
 *
 * @example
 * ```typescript
 * isEqual({ a: 1 }, { a: 1 })     // true
 * isEqual([1, 2], [1, 2])         // true
 * isEqual({ a: 1 }, { a: 2 })     // false
 * ```
 */
export function isEqual(a: unknown, b: unknown): boolean {
  // 相同引用或相同原始值
  if (a === b) {
    return true
  }

  // 处理 null/undefined
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b
  }

  // 类型不同
  if (typeof a !== typeof b) {
    return false
  }

  // 处理 Date
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  // 处理 Array
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false
    }
    return a.every((item, index) => isEqual(item, b[index]))
  }

  // 处理普通对象
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) {
      return false
    }

    return keysA.every(key => isEqual(a[key], b[key]))
  }

  return false
}
