/**
 * 断言和类型检查工具
 *
 * 提供运行时类型检查和断言功能
 */

/**
 * 不变量断言
 *
 * 在条件不满足时抛出错误，用于保证代码的前置条件
 *
 * @param condition - 要检查的条件
 * @param message - 条件不满足时的错误消息
 * @throws Error 当条件为假时
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): number {
 *   invariant(b !== 0, 'Divisor cannot be zero')
 *   return a / b
 * }
 * ```
 */
export function invariant(
  condition: unknown,
  message?: string | (() => string)
): asserts condition {
  if (!condition) {
    const errorMessage = typeof message === 'function' ? message() : message
    throw new Error(errorMessage || 'Invariant violation')
  }
}

/**
 * 开发环境警告
 *
 * 仅在开发环境输出警告，生产环境静默
 *
 * @param condition - 要检查的条件
 * @param message - 条件不满足时的警告消息
 *
 * @example
 * ```typescript
 * warning(props.disabled !== undefined, 'Missing required prop: disabled')
 * ```
 */
export function warning(
  condition: unknown,
  message: string | (() => string)
): void {
  if (!condition) {
    const warningMessage = typeof message === 'function' ? message() : message

    // 仅在开发环境输出警告
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn(`[Warning] ${warningMessage}`)
    }
  }
}

/**
 * 穷尽性检查
 *
 * 用于 switch 语句的穷尽性检查，确保处理了所有情况
 *
 * @param value - 不应该出现的值
 * @throws Error 如果执行到此处
 *
 * @example
 * ```typescript
 * type Status = 'pending' | 'success' | 'error'
 *
 * function handleStatus(status: Status): string {
 *   switch (status) {
 *     case 'pending': return 'Loading...'
 *     case 'success': return 'Done!'
 *     case 'error': return 'Failed'
 *     default: return assertNever(status)
 *   }
 * }
 * ```
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}

/**
 * 检查值是否已定义（非 undefined）
 *
 * @param value - 要检查的值
 * @returns 值是否已定义
 *
 * @example
 * ```typescript
 * const values = [1, undefined, 2, undefined, 3]
 * const defined = values.filter(isDefined) // [1, 2, 3]
 * ```
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

/**
 * 检查值是否非空（非 null 且非 undefined）
 *
 * @param value - 要检查的值
 * @returns 值是否非空
 *
 * @example
 * ```typescript
 * const values = [1, null, 2, undefined, 3]
 * const nonNullable = values.filter(isNonNullable) // [1, 2, 3]
 * ```
 */
export function isNonNullable<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * 检查值是否为字符串
 *
 * @param value - 要检查的值
 * @returns 值是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 检查值是否为数字
 *
 * @param value - 要检查的值
 * @returns 值是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/**
 * 检查值是否为布尔值
 *
 * @param value - 要检查的值
 * @returns 值是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 检查值是否为函数
 *
 * @param value - 要检查的值
 * @returns 值是否为函数
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

/**
 * 检查值是否为数组
 *
 * @param value - 要检查的值
 * @returns 值是否为数组
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * 检查值是否为 Promise
 *
 * @param value - 要检查的值
 * @returns 值是否为 Promise
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return (
    value !== null &&
    typeof value === 'object' &&
    'then' in value &&
    typeof (value as Promise<T>).then === 'function'
  )
}

/**
 * 检查值是否为错误对象
 *
 * @param value - 要检查的值
 * @returns 值是否为错误对象
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

/**
 * 断言值不为空
 *
 * @param value - 要检查的值
 * @param message - 值为空时的错误消息
 * @returns 非空的值
 * @throws Error 当值为空时
 *
 * @example
 * ```typescript
 * const user = assertDefined(getUser(), 'User not found')
 * // user 现在类型为非空
 * ```
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message?: string
): T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value is null or undefined')
  }
  return value
}

/**
 * 断言值为特定类型
 *
 * @param value - 要检查的值
 * @param predicate - 类型谓词函数
 * @param message - 类型不匹配时的错误消息
 * @returns 类型正确的值
 * @throws Error 当类型不匹配时
 *
 * @example
 * ```typescript
 * const value: unknown = getConfig()
 * const config = assertType(value, isPlainObject, 'Config must be an object')
 * // config 现在类型为 Record<string, unknown>
 * ```
 */
export function assertType<T>(
  value: unknown,
  predicate: (value: unknown) => value is T,
  message?: string
): T {
  if (!predicate(value)) {
    throw new Error(message || 'Type assertion failed')
  }
  return value
}
