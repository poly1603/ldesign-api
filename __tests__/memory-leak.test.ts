/**
 * 内存泄漏测试
 * 验证各个组件在长时间运行后不会泄漏内存
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApiEngine } from '../src/core/factory'
import { systemApiPlugin } from '../src/plugins/systemApi'
import { createTieredObjectPool, ObjectPoolFactory } from '../src/utils/TieredObjectPool'
import { SerializationOptimizer } from '../src/utils/SerializationOptimizer'
import { MemoryGuard } from '../src/utils/MemoryGuard'

/**
 * 辅助函数：触发垃圾回收（需要Node.js使用--expose-gc启动）
 */
function forceGC() {
  if (typeof global !== 'undefined' && (global as any).gc) {
    (global as any).gc()
  }
}

/**
 * 辅助函数：获取内存使用
 */
function getMemoryUsage(): number {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage().heapUsed
  }
  return 0
}

/**
 * 辅助函数：等待一段时间
 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('Memory Leak Tests', () => {
  describe('ApiEngine', () => {
    it('不应该在大量API调用后泄漏内存', async () => {
      const api = createApiEngine({
        http: { baseURL: 'http://localhost:3000' },
        cache: { enabled: true, storage: 'memory' },
      })

      // 注册测试方法
      api.register('testMethod', {
        name: 'testMethod',
        config: { method: 'GET', url: '/test' },
      })

      // 记录初始内存
      forceGC()
      await wait(100)
      const initialMemory = getMemoryUsage()

      // 大量调用（模拟）
      const iterations = 10000
      for (let i = 0; i < iterations; i++) {
        try {
          // 使用不同的参数避免缓存
          await api.call('testMethod', { id: i % 100 }).catch(() => { })
        }
        catch {
          // 忽略错误
        }
      }

      // 销毁引擎
      api.destroy()

      // 触发GC并等待
      forceGC()
      await wait(200)

      const finalMemory = getMemoryUsage()
      const leakage = finalMemory - initialMemory

      // 允许一定的内存增长，但不应超过5MB
      expect(leakage).toBeLessThan(5 * 1024 * 1024)
    })

    it('不应该在频繁创建和销毁引擎时泄漏内存', async () => {
      forceGC()
      await wait(100)
      const initialMemory = getMemoryUsage()

      // 频繁创建和销毁
      for (let i = 0; i < 100; i++) {
        const api = createApiEngine({
          http: { baseURL: 'http://localhost:3000' },
        })

        await api.use(systemApiPlugin)

        api.register('test', {
          name: 'test',
          config: { method: 'GET', url: '/test' },
        })

        api.destroy()
      }

      forceGC()
      await wait(200)

      const finalMemory = getMemoryUsage()
      const leakage = finalMemory - initialMemory

      // 允许一定的内存增长，但不应超过3MB
      expect(leakage).toBeLessThan(3 * 1024 * 1024)
    })
  })

  describe('ObjectPool', () => {
    it('不应该在大量获取和释放后泄漏内存', async () => {
      const pool = ObjectPoolFactory.createContextPool()

      forceGC()
      await wait(100)
      const initialMemory = getMemoryUsage()

      // 大量获取和释放
      for (let i = 0; i < 50000; i++) {
        const obj = pool.acquire()
        obj.methodName = `method-${i}`
        obj.params = { id: i }
        pool.release(obj)
      }

      // 销毁池
      pool.destroy()

      forceGC()
      await wait(200)

      const finalMemory = getMemoryUsage()
      const leakage = finalMemory - initialMemory

      // 对象池应该有效复用，泄漏应该很小
      expect(leakage).toBeLessThan(2 * 1024 * 1024)
    })

    it('不应该在池满时泄漏内存', async () => {
      const pool = createTieredObjectPool({
        factory: () => ({ data: new Array(1000).fill(0) }),
        reset: (obj) => {
          obj.data = []
        },
        hotPoolMaxSize: 10,
        coldPoolMaxSize: 10,
      })

      forceGC()
      await wait(100)
      const initialMemory = getMemoryUsage()

      // 获取超过池容量的对象
      const objects = []
      for (let i = 0; i < 100; i++) {
        objects.push(pool.acquire())
      }

      // 释放所有对象
      for (const obj of objects) {
        pool.release(obj)
      }

      pool.destroy()

      forceGC()
      await wait(200)

      const finalMemory = getMemoryUsage()
      const leakage = finalMemory - initialMemory

      // 超出容量的对象应该被丢弃并GC
      expect(leakage).toBeLessThan(5 * 1024 * 1024)
    })
  })

  describe('SerializationOptimizer', () => {
    it('不应该在大量序列化后泄漏内存', async () => {
      const optimizer = new SerializationOptimizer()

      forceGC()
      await wait(100)
      const initialMemory = getMemoryUsage()

      // 大量序列化操作
      for (let i = 0; i < 10000; i++) {
        const obj = {
          id: i,
          data: `data-${i}`,
          nested: {
            value: i * 2,
          },
        }
        optimizer.serialize(obj)
        optimizer.generateFingerprint(obj)
        optimizer.generateHash(obj)
      }

      optimizer.clearCache()

      forceGC()
      await wait(200)

      const finalMemory = getMemoryUsage()
      const leakage = finalMemory - initialMemory

      // WeakMap应该自动清理，泄漏应该很小
      expect(leakage).toBeLessThan(3 * 1024 * 1024)
    })
  })

  describe('MemoryGuard', () => {
    it('不应该在循环引用检测后泄漏内存', async () => {
      const guard = new MemoryGuard()

      forceGC()
      await wait(100)
      const initialMemory = getMemoryUsage()

      // 大量循环引用检测
      for (let i = 0; i < 1000; i++) {
        const obj: any = { id: i }
        obj.self = obj
        obj.nested = { parent: obj }

        guard.detectCircularReferences(obj)
      }

      guard.destroy()

      forceGC()
      await wait(200)

      const finalMemory = getMemoryUsage()
      const leakage = finalMemory - initialMemory

      expect(leakage).toBeLessThan(2 * 1024 * 1024)
    })
  })

  describe('Combined Scenario', () => {
    it('不应该在综合使用场景下泄漏内存', async () => {
      forceGC()
      await wait(100)
      const initialMemory = getMemoryUsage()

      // 综合场景
      for (let round = 0; round < 10; round++) {
        // 创建API引擎
        const api = createApiEngine({
          cache: { enabled: true, storage: 'lru', maxSize: 100 },
        })

        // 注册方法
        for (let i = 0; i < 10; i++) {
          api.register(`method-${i}`, {
            name: `method-${i}`,
            config: { method: 'GET', url: `/test/${i}` },
          })
        }

        // 调用API
        for (let i = 0; i < 100; i++) {
          try {
            await api.call(`method-${i % 10}`, { id: i }).catch(() => { })
          }
          catch {
            // 忽略
          }
        }

        // 清除缓存
        api.clearCache()

        // 销毁引擎
        api.destroy()
      }

      forceGC()
      await wait(200)

      const finalMemory = getMemoryUsage()
      const leakage = finalMemory - initialMemory

      // 综合场景允许稍大的内存增长，但不应超过10MB
      expect(leakage).toBeLessThan(10 * 1024 * 1024)
    })
  })
})

