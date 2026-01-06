/**
 * 时间相关工具函数
 *
 * 提供防抖、节流等时间控制功能
 */

/**
 * 防抖函数选项
 */
export interface DebounceOptions {
  /** 等待时间（毫秒），默认 300ms */
  wait?: number
  /** 是否在前沿执行，默认 false */
  leading?: boolean
  /** 是否在后沿执行，默认 true */
  trailing?: boolean
  /** 最大等待时间（毫秒），超过此时间强制执行 */
  maxWait?: number
}

/**
 * 防抖函数返回类型
 */
export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  /** 调用防抖函数 */
  (...args: Parameters<T>): ReturnType<T> | undefined
  /** 取消等待中的执行 */
  cancel: () => void
  /** 立即执行等待中的函数 */
  flush: () => ReturnType<T> | undefined
  /** 检查是否有待执行的调用 */
  pending: () => boolean
}

/**
 * 创建防抖函数
 *
 * 防抖函数会在最后一次调用后等待指定时间才执行，
 * 如果在等待期间再次调用，则重新计时。
 *
 * @param fn - 要防抖的函数
 * @param options - 防抖选项
 * @returns 防抖后的函数
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce(search, { wait: 300 })
 * debouncedSearch('query') // 只有最后一次调用会在300ms后执行
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const {
    wait = 300,
    leading = false,
    trailing = true,
    maxWait,
  } = options

  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let maxTimeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: unknown = null
  let result: ReturnType<T> | undefined
  let lastCallTime: number | undefined
  let lastInvokeTime = 0

  function invokeFunc(time: number): ReturnType<T> | undefined {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = null
    lastThis = null
    lastInvokeTime = time

    if (args) {
      result = fn.apply(thisArg, args) as ReturnType<T>
    }

    return result
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = lastCallTime === undefined ? 0 : time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    )
  }

  function trailingEdge(time: number): ReturnType<T> | undefined {
    timeoutId = null

    if (trailing && lastArgs) {
      return invokeFunc(time)
    }

    lastArgs = null
    lastThis = null
    return result
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = lastCallTime === undefined ? 0 : time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  function timerExpired(): void {
    const time = Date.now()

    if (shouldInvoke(time)) {
      trailingEdge(time)
      return
    }

    timeoutId = setTimeout(timerExpired, remainingWait(time))
  }

  function leadingEdge(time: number): ReturnType<T> | undefined {
    lastInvokeTime = time
    timeoutId = setTimeout(timerExpired, wait)

    if (maxWait !== undefined) {
      maxTimeoutId = setTimeout(() => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId)
          timeoutId = null
          trailingEdge(Date.now())
        }
      }, maxWait)
    }

    return leading ? invokeFunc(time) : result
  }

  function cancel(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId)
    }
    lastInvokeTime = 0
    lastArgs = null
    lastThis = null
    lastCallTime = undefined
    timeoutId = null
    maxTimeoutId = null
  }

  function flush(): ReturnType<T> | undefined {
    if (timeoutId === null) {
      return result
    }
    cancel()
    return trailingEdge(Date.now())
  }

  function pending(): boolean {
    return timeoutId !== null
  }

  function debounced(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(time)
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, wait)
        return invokeFunc(time)
      }
    }

    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, wait)
    }

    return result
  }

  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending

  return debounced as DebouncedFunction<T>
}

/**
 * 节流函数选项
 */
export interface ThrottleOptions {
  /** 等待时间（毫秒），默认 300ms */
  wait?: number
  /** 是否在前沿执行，默认 true */
  leading?: boolean
  /** 是否在后沿执行，默认 true */
  trailing?: boolean
}

/**
 * 节流函数返回类型
 */
export interface ThrottledFunction<T extends (...args: unknown[]) => unknown> {
  /** 调用节流函数 */
  (...args: Parameters<T>): ReturnType<T> | undefined
  /** 取消等待中的执行 */
  cancel: () => void
  /** 立即执行等待中的函数 */
  flush: () => ReturnType<T> | undefined
}

/**
 * 创建节流函数
 *
 * 节流函数会在指定时间间隔内最多执行一次，
 * 无论调用多少次，都只会在固定时间点执行。
 *
 * @param fn - 要节流的函数
 * @param options - 节流选项
 * @returns 节流后的函数
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle(handleScroll, { wait: 100 })
 * window.addEventListener('scroll', throttledScroll)
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: ThrottleOptions = {}
): ThrottledFunction<T> {
  const {
    wait = 300,
    leading = true,
    trailing = true,
  } = options

  return debounce(fn, {
    wait,
    leading,
    trailing,
    maxWait: wait,
  }) as ThrottledFunction<T>
}

/**
 * 延迟执行函数
 *
 * @param ms - 延迟毫秒数
 * @returns Promise
 *
 * @example
 * ```typescript
 * await delay(1000) // 等待1秒
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 带超时的 Promise
 *
 * @param promise - 原始 Promise
 * @param ms - 超时毫秒数
 * @param message - 超时错误消息
 * @returns 带超时的 Promise
 *
 * @example
 * ```typescript
 * const result = await withTimeout(fetch('/api'), 5000, 'Request timeout')
 * ```
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = 'Operation timed out'
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message))
    }, ms)
  })

  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    timeoutPromise,
  ])
}
