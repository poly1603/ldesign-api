/**
 * 边界情况测试
 * 测试各种极端和特殊情况
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createApiEngine } from '../src/core/factory'
import { SerializationOptimizer } from '../src/utils/SerializationOptimizer'
import { MemoryGuard } from '../src/utils/MemoryGuard'
import { createTieredObjectPool } from '../src/utils/TieredObjectPool'

describe('Edge Cases', () => {
  describe('Circular References', () => {
    it('应该能处理循环引用的对象', () => {
      const guard = new MemoryGuard()
      const obj: any = { id: 1, name: 'test' }
      obj.self = obj

      const result = guard.detectCircularReferences(obj)
      expect(result.hasCircular).toBe(true)
      expect(result.paths.length).toBeGreaterThan(0)
    })

    it('应该能处理深层循环引用', () => {
      const guard = new MemoryGuard()
      const obj: any = { level1: { level2: { level3: {} } } }
      obj.level1.level2.level3.root = obj

      const result = guard.detectCircularReferences(obj)
      expect(result.hasCircular).toBe(true)
    })

    it('应该能处理数组中的循环引用', () => {
      const guard = new MemoryGuard()
      const arr: any[] = [1, 2, 3]
      arr.push(arr)

      const result = guard.detectCircularReferences(arr)
      expect(result.hasCircular).toBe(true)
    })
  })

  describe('Large Objects', () => {
    it('应该能序列化超大对象', () => {
      const optimizer = new SerializationOptimizer()
      const largeObject = {
        data: new Array(10000).fill({
          id: 1,
          name: 'test',
          value: 'x'.repeat(100),
        }),
      }

      expect(() => optimizer.serialize(largeObject)).not.toThrow()
    })

    it('应该能处理深层嵌套对象', () => {
      const optimizer = new SerializationOptimizer()
      let deepObject: any = { value: 'leaf' }
      for (let i = 0; i < 50; i++) {
        deepObject = { nested: deepObject }
      }

      expect(() => optimizer.serialize(deepObject)).not.toThrow()
    })

    it('应该能处理极大数组', () => {
      const optimizer = new SerializationOptimizer()
      const largeArray = new Array(100000).fill(1)

      expect(() => optimizer.serialize(largeArray)).not.toThrow()
      const result = optimizer.serialize(largeArray)
      expect(result).toBeDefined()
    })
  })

  describe('Null and Undefined', () => {
    it('应该正确处理null参数', () => {
      const optimizer = new SerializationOptimizer()
      const result = optimizer.serialize(null)
      expect(result).toBe('')
    })

    it('应该正确处理undefined参数', () => {
      const optimizer = new SerializationOptimizer()
      const result = optimizer.serialize(undefined)
      expect(result).toBe('')
    })

    it('应该正确处理包含null的对象', () => {
      const optimizer = new SerializationOptimizer()
      const obj = { a: null, b: undefined, c: 123 }
      const result = optimizer.serialize(obj)
      expect(result).toBeDefined()
    })
  })

  describe('Special Types', () => {
    it('应该处理Date对象', () => {
      const optimizer = new SerializationOptimizer()
      const obj = { date: new Date(), timestamp: Date.now() }
      expect(() => optimizer.serialize(obj)).not.toThrow()
    })

    it('应该处理RegExp对象', () => {
      const optimizer = new SerializationOptimizer()
      const obj = { pattern: /test/gi }
      expect(() => optimizer.serialize(obj)).not.toThrow()
    })

    it('应该处理Symbol（转换为字符串）', () => {
      const optimizer = new SerializationOptimizer()
      const sym = Symbol('test')
      const result = optimizer.serialize(sym)
      expect(result).toContain('symbol')
    })

    it('应该处理函数（转换为字符串）', () => {
      const optimizer = new SerializationOptimizer()
      const fn = () => { }
      const result = optimizer.serialize(fn)
      expect(result).toContain('function')
    })
  })

  describe('Empty Values', () => {
    it('应该处理空对象', () => {
      const optimizer = new SerializationOptimizer()
      const result = optimizer.serialize({})
      expect(result).toBe('{}')
    })

    it('应该处理空数组', () => {
      const optimizer = new SerializationOptimizer()
      const result = optimizer.serialize([])
      expect(result).toBe('[]')
    })

    it('应该处理空字符串', () => {
      const optimizer = new SerializationOptimizer()
      const result = optimizer.serialize('')
      expect(result).toBe('')
    })

    it('应该处理零值', () => {
      const optimizer = new SerializationOptimizer()
      expect(optimizer.serialize(0)).toBe('0')
      expect(optimizer.serialize(false)).toBe('false')
    })
  })

  describe('ObjectPool Edge Cases', () => {
    it('应该处理池为空的情况', () => {
      const pool = createTieredObjectPool({
        factory: () => ({ data: null }),
        prewarmCount: 0, // 不预热
      })

      const obj = pool.acquire()
      expect(obj).toBeDefined()
      expect(obj.data).toBe(null)
    })

    it('应该处理大量并发获取', () => {
      const pool = createTieredObjectPool({
        factory: () => ({ data: null }),
        hotPoolMaxSize: 10,
        coldPoolMaxSize: 10,
      })

      const objects = []
      for (let i = 0; i < 100; i++) {
        objects.push(pool.acquire())
      }

      expect(objects.length).toBe(100)
      expect(pool.getStats().createCount).toBeGreaterThan(80) // 大部分需要新建

      // 释放所有对象
      for (const obj of objects) {
        pool.release(obj)
      }

      const stats = pool.getStats()
      expect(stats.totalSize).toBeLessThanOrEqual(20) // 最多保留20个
    })

    it('应该正确验证无效对象', () => {
      const pool = createTieredObjectPool({
        factory: () => ({ valid: true }),
        validate: (obj) => obj.valid === true,
        reset: (obj) => {
          obj.valid = false // 重置为无效
        },
      })

      const obj = pool.acquire()
      expect(obj.valid).toBe(true)

      pool.release(obj)
      // 下次获取应该创建新对象（因为重置后无效）
      const obj2 = pool.acquire()
      expect(obj2).not.toBe(obj)
    })
  })

  describe('ApiEngine Edge Cases', () => {
    let api: ReturnType<typeof createApiEngine>

    beforeEach(() => {
      api = createApiEngine({
        http: { baseURL: 'http://localhost:3000' },
      })
    })

    afterEach(() => {
      api.destroy()
    })

    it('应该拒绝在销毁后的调用', async () => {
      api.destroy()

      await expect(
        api.call('test', {})
      ).rejects.toThrow('API Engine has been destroyed')
    })

    it('应该拒绝调用不存在的方法', async () => {
      await expect(
        api.call('nonexistent', {})
      ).rejects.toThrow('Method "nonexistent" not found')
    })

    it('应该正确处理重复注册插件', async () => {
      const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
      }

      await api.use(plugin)
      await api.use(plugin) // 第二次应该跳过

      expect(api.plugins.size).toBe(1)
    })

    it('应该检测插件依赖', async () => {
      const plugin = {
        name: 'dependent-plugin',
        version: '1.0.0',
        dependencies: ['missing-plugin'],
      }

      await expect(api.use(plugin)).rejects.toThrow('depends on "missing-plugin"')
    })

    it('应该防止卸载被依赖的插件', async () => {
      const basePlugin = {
        name: 'base-plugin',
        version: '1.0.0',
      }

      const dependentPlugin = {
        name: 'dependent-plugin',
        version: '1.0.0',
        dependencies: ['base-plugin'],
      }

      await api.use(basePlugin)
      await api.use(dependentPlugin)

      await expect(api.unuse('base-plugin')).rejects.toThrow('depends on it')
    })
  })

  describe('Extreme Values', () => {
    it('应该处理极大的TTL值', () => {
      const api = createApiEngine({
        cache: {
          enabled: true,
          ttl: Number.MAX_SAFE_INTEGER,
        },
      })

      api.register('test', {
        name: 'test',
        config: { method: 'GET', url: '/test' },
      })

      expect(() => api.clearCache()).not.toThrow()
      api.destroy()
    })

    it('应该处理极小的TTL值', () => {
      const api = createApiEngine({
        cache: {
          enabled: true,
          ttl: 1, // 1毫秒
        },
      })

      expect(() => api.clearCache()).not.toThrow()
      api.destroy()
    })

    it('应该处理零延迟的防抖', async () => {
      const api = createApiEngine({
        debounce: {
          enabled: true,
          delay: 0,
        },
      })

      api.register('test', {
        name: 'test',
        config: { method: 'GET', url: '/test' },
      })

      // 零延迟应该立即执行
      await expect(
        api.call('test', {}).catch(() => { })
      ).resolves.toBeUndefined()

      api.destroy()
    })
  })

  describe('Concurrent Operations', () => {
    it('应该正确处理并发调用', async () => {
      const api = createApiEngine({
        deduplication: { enabled: true },
      })

      api.register('test', {
        name: 'test',
        config: { method: 'GET', url: '/test' },
      })

      // 并发调用相同方法
      const promises = Array.from({ length: 10 }, () =>
        api.call('test', { id: 1 }).catch(() => null)
      )

      const results = await Promise.all(promises)
      // 所有结果应该相同（去重）
      expect(results.every(r => r === results[0])).toBe(true)

      api.destroy()
    })

    it('应该正确处理并发注册', async () => {
      const api = createApiEngine()

      // 并发注册不同方法
      const registers = Array.from({ length: 100 }, (_, i) => {
        api.register(`method-${i}`, {
          name: `method-${i}`,
          config: { method: 'GET', url: `/test/${i}` },
        })
      })

      expect(api.getMethodNames().length).toBe(100)
      api.destroy()
    })
  })

  describe('Special Characters', () => {
    it('应该处理方法名中的特殊字符', () => {
      const api = createApiEngine()

      const methodName = 'test.method:with-special_chars'
      api.register(methodName, {
        name: methodName,
        config: { method: 'GET', url: '/test' },
      })

      expect(api.hasMethod(methodName)).toBe(true)

      // 清除缓存应该正确转义特殊字符
      expect(() => api.clearCache(methodName)).not.toThrow()

      api.destroy()
    })

    it('应该处理参数中的特殊字符', () => {
      const optimizer = new SerializationOptimizer()
      const params = {
        text: '包含\n换行\t制表符\r回车',
        emoji: '🚀💎⚡',
        unicode: '中文测试',
        quotes: 'test "quotes" and \'apostrophes\'',
      }

      expect(() => optimizer.serialize(params)).not.toThrow()
      const result = optimizer.serialize(params)
      expect(result).toBeDefined()
    })
  })

  describe('Memory Limits', () => {
    it('应该在超过内存限制时触发降级', () => {
      let degradationCalled = false
      const guard = new MemoryGuard({
        maxMemory: 1024, // 1KB（很小，容易触发）
        enableAutoDegradation: true,
        onDegradation: () => {
          degradationCalled = true
        },
      })

      // 手动更新内存估算
      guard.updateMemoryEstimate(2048) // 2KB，超过限制

      expect(degradationCalled).toBe(true)
      expect(guard.shouldDegrade()).toBe(true)
    })

    it('应该在接近限制时触发警告', () => {
      let warningCalled = false
      const guard = new MemoryGuard({
        maxMemory: 1024,
        warningThreshold: 800,
        onWarning: () => {
          warningCalled = true
        },
      })

      guard.updateMemoryEstimate(900)

      expect(warningCalled).toBe(true)
      expect(guard.shouldWarn()).toBe(true)
    })
  })

  describe('Pool Capacity', () => {
    it('应该在超过容量时丢弃对象', () => {
      const pool = createTieredObjectPool({
        factory: () => ({ id: Math.random() }),
        hotPoolMaxSize: 2,
        coldPoolMaxSize: 2,
        prewarmCount: 0,
      })

      // 获取并释放超过容量的对象
      const objects = []
      for (let i = 0; i < 10; i++) {
        objects.push(pool.acquire())
      }

      for (const obj of objects) {
        pool.release(obj)
      }

      const stats = pool.getStats()
      expect(stats.totalSize).toBe(4) // 最多保留4个（2+2）
    })
  })

  describe('Cache Edge Cases', () => {
    it('应该处理负数TTL', () => {
      const api = createApiEngine({
        cache: {
          enabled: true,
          ttl: -1000, // 负数TTL
        },
      })

      api.register('test', {
        name: 'test',
        config: { method: 'GET', url: '/test' },
      })

      // 负数TTL应该被处理（可能立即过期）
      expect(() => api.clearCache()).not.toThrow()
      api.destroy()
    })

    it('应该处理零TTL', () => {
      const api = createApiEngine({
        cache: {
          enabled: true,
          ttl: 0, // 零TTL
        },
      })

      expect(() => api.clearCache()).not.toThrow()
      api.destroy()
    })

    it('应该处理极大的缓存大小', () => {
      const api = createApiEngine({
        cache: {
          enabled: true,
          maxSize: 1000000, // 100万条目
        },
      })

      expect(() => api.clearCache()).not.toThrow()
      api.destroy()
    })
  })

  describe('Unicode and Encoding', () => {
    it('应该正确处理各种Unicode字符', () => {
      const optimizer = new SerializationOptimizer()
      const params = {
        chinese: '中文测试',
        japanese: 'テスト',
        korean: '테스트',
        emoji: '😀😃😄😁',
        arabic: 'اختبار',
        russian: 'тест',
      }

      const result = optimizer.serialize(params)
      expect(result).toBeDefined()

      // 多次序列化应该得到相同结果
      const result2 = optimizer.serialize(params)
      expect(result).toBe(result2)
    })
  })

  describe('Error Boundary', () => {
    it('应该捕获序列化错误', () => {
      const optimizer = new SerializationOptimizer()

      // 创建无法序列化的对象（循环引用）
      const obj: any = { a: 1 }
      obj.b = obj

      // 应该返回降级值而不是抛出错误
      expect(() => optimizer.serialize(obj)).not.toThrow()
    })

    it('应该处理序列化异常', () => {
      const optimizer = new SerializationOptimizer()

      // BigInt无法被JSON.stringify
      const obj = { bigint: BigInt(9007199254740991) }

      // 应该优雅处理
      expect(() => optimizer.serialize(obj)).not.toThrow()
    })
  })

  describe('Concurrent Pool Access', () => {
    it('应该处理并发获取和释放', () => {
      const pool = createTieredObjectPool({
        factory: () => ({ id: 0 }),
        hotPoolMaxSize: 10,
      })

      // 模拟并发访问
      const operations = []
      for (let i = 0; i < 1000; i++) {
        if (Math.random() > 0.5) {
          operations.push(() => pool.acquire())
        }
        else {
          const obj = pool.acquire()
          operations.push(() => pool.release(obj))
        }
      }

      expect(() => {
        for (const op of operations) {
          op()
        }
      }).not.toThrow()

      pool.destroy()
    })
  })

  describe('API Engine Stress Test', () => {
    it('应该处理快速连续调用', async () => {
      const api = createApiEngine({
        cache: { enabled: true },
        debounce: { enabled: false },
        deduplication: { enabled: false },
      })

      api.register('test', {
        name: 'test',
        config: { method: 'GET', url: '/test' },
      })

      // 快速连续调用
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(api.call('test', { id: i }).catch(() => null))
      }

      await expect(Promise.all(promises)).resolves.toBeDefined()
      api.destroy()
    })

    it('应该处理长时间运行', async () => {
      const api = createApiEngine({
        cache: { enabled: true, storage: 'lru' },
      })

      api.register('test', {
        name: 'test',
        config: { method: 'GET', url: '/test' },
      })

      // 模拟长时间运行
      for (let i = 0; i < 1000; i++) {
        await api.call('test', { id: i % 10 }).catch(() => { })
      }

      const stats = api.getCacheStats()
      expect(stats).toBeDefined()
      expect(stats.totalItems).toBeGreaterThanOrEqual(0)

      api.destroy()
    })
  })
})

