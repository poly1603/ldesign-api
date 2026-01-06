/**
 * 工具函数模块
 *
 * 提供通用的工具函数
 *
 * @module @ldesign/api-core/utils
 */

export { debounce, throttle } from './timing'
export type { DebounceOptions, ThrottleOptions, DebouncedFunction, ThrottledFunction } from './timing'

export { deepMerge, deepClone, pick, omit, isPlainObject } from './object'
export type { DeepPartial, DeepReadonly } from './object'

export { hashString, generateRequestKey, serializeParams } from './hash'
export type { RequestKeyOptions } from './hash'

export { invariant, warning, assertNever, isDefined, isNonNullable } from './assert'
