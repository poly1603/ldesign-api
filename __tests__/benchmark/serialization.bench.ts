/**
 * 序列化性能基准测试
 * 对比JSON.stringify和SerializationOptimizer的性能
 */

import { bench, describe } from 'vitest'
import { SerializationOptimizer } from '../../src/utils/SerializationOptimizer'

describe('Serialization Performance', () => {
  const optimizer = new SerializationOptimizer()

  // 简单对象
  const simpleObject = {
    id: 1,
    name: 'test',
    active: true,
    score: 99.5,
  }

  // 复杂对象
  const complexObject = {
    id: 1,
    name: 'test',
    metadata: {
      tags: ['tag1', 'tag2', 'tag3'],
      settings: {
        theme: 'dark',
        language: 'zh-CN',
        features: ['feature1', 'feature2'],
      },
    },
    items: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      value: `item-${i}`,
    })),
  }

  // 大数组
  const largeArray = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `item-${i}`,
    value: Math.random(),
  }))

  describe('Simple Object', () => {
    bench('JSON.stringify', () => {
      JSON.stringify(simpleObject)
    })

    bench('SerializationOptimizer.serialize', () => {
      optimizer.serialize(simpleObject)
    })

    bench('SerializationOptimizer.generateFingerprint', () => {
      optimizer.generateFingerprint(simpleObject)
    })
  })

  describe('Complex Object', () => {
    bench('JSON.stringify', () => {
      JSON.stringify(complexObject)
    })

    bench('SerializationOptimizer.serialize (first call)', () => {
      const newOptimizer = new SerializationOptimizer()
      newOptimizer.serialize(complexObject)
    })

    bench('SerializationOptimizer.serialize (cached)', () => {
      optimizer.serialize(complexObject)
    })

    bench('SerializationOptimizer.generateFingerprint', () => {
      optimizer.generateFingerprint(complexObject)
    })

    bench('SerializationOptimizer.generateHash', () => {
      optimizer.generateHash(complexObject)
    })
  })

  describe('Large Array', () => {
    bench('JSON.stringify', () => {
      JSON.stringify(largeArray)
    })

    bench('SerializationOptimizer.serialize', () => {
      optimizer.serialize(largeArray)
    })

    bench('SerializationOptimizer.generateFingerprint (sampling)', () => {
      optimizer.generateFingerprint(largeArray)
    })
  })
})

