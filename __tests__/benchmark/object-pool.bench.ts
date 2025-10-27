/**
 * 对象池性能基准测试
 * 对比直接创建和对象池复用的性能
 */

import { bench, describe } from 'vitest'
import { createTieredObjectPool, ObjectPoolFactory } from '../../src/utils/TieredObjectPool'

describe('Object Pool Performance', () => {
  describe('Context Object', () => {
    const pool = ObjectPoolFactory.createContextPool()

    bench('直接创建对象', () => {
      const ctx = { methodName: 'test', params: { id: 1 }, engine: null as any }
      // 模拟使用
      ctx.methodName = 'newMethod'
    })

    bench('对象池获取和释放', () => {
      const ctx = pool.acquire()
      ctx.methodName = 'test'
      ctx.params = { id: 1 }
      pool.release(ctx)
    })
  })

  describe('Array Pool', () => {
    const arrayPool = ObjectPoolFactory.createArrayPool()

    bench('直接创建数组', () => {
      const arr = []
      arr.push(1, 2, 3)
      arr.length = 0
    })

    bench('数组池获取和释放', () => {
      const arr = arrayPool.acquire()
      arr.push(1, 2, 3)
      arrayPool.release(arr)
    })
  })

  describe('Batch Operations', () => {
    const pool = ObjectPoolFactory.createContextPool()

    bench('直接创建1000个对象', () => {
      for (let i = 0; i < 1000; i++) {
        const ctx = { methodName: `method-${i}`, params: null, engine: null as any }
        // 使用对象
      }
    })

    bench('对象池获取和释放1000次', () => {
      for (let i = 0; i < 1000; i++) {
        const ctx = pool.acquire()
        ctx.methodName = `method-${i}`
        pool.release(ctx)
      }
    })
  })

  describe('Pool Configuration', () => {
    bench('小池（prewarm=10）', () => {
      const pool = createTieredObjectPool({
        factory: () => ({ data: null }),
        prewarmCount: 10,
      })
      const obj = pool.acquire()
      pool.release(obj)
    })

    bench('大池（prewarm=50）', () => {
      const pool = createTieredObjectPool({
        factory: () => ({ data: null }),
        prewarmCount: 50,
      })
      const obj = pool.acquire()
      pool.release(obj)
    })
  })
})

