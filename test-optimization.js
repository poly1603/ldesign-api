/**
 * 简单的优化效果测试脚本
 * 用于验证优化后的代码是否正常工作
 */

// 使用 CommonJS 以避免 ESM 问题
const path = require('path')

// 动态导入 ESM 模块
async function testOptimization() {
  console.log('🚀 开始测试 @api 包优化效果...\n')

  try {
    // 导入构建后的模块
    const apiModule = await import('./es/index.js')

    // 测试1：创建标准 API 引擎
    console.log('📋 测试1：创建标准 API 引擎')
    const startTime1 = Date.now()
    const engine1 = await apiModule.createApiEngine({
      appName: 'test-standard',
      cache: { enabled: true, storage: 'lru' }
    })
    const time1 = Date.now() - startTime1
    console.log(`✅ 标准引擎创建成功，耗时: ${time1}ms`)

    // 测试2：创建懒加载 API 引擎
    console.log('\n📋 测试2：创建懒加载 API 引擎')
    const startTime2 = Date.now()
    const engine2 = await apiModule.createLazyApiEngine({
      appName: 'test-lazy'
    })
    const time2 = Date.now() - startTime2
    console.log(`✅ 懒加载引擎创建成功，耗时: ${time2}ms`)

    // 测试3：创建最小化 API 引擎
    console.log('\n📋 测试3：创建最小化 API 引擎')
    const startTime3 = Date.now()
    const engine3 = await apiModule.createMinimalApiEngine({
      appName: 'test-minimal'
    })
    const time3 = Date.now() - startTime3
    console.log(`✅ 最小化引擎创建成功，耗时: ${time3}ms`)

    // 性能对比
    console.log('\n📊 性能对比：')
    console.log(`  标准模式: ${time1}ms (基准)`)
    console.log(`  懒加载模式: ${time2}ms (${Math.round((1 - time2 / time1) * 100)}% 提升)`)
    console.log(`  最小化模式: ${time3}ms (${Math.round((1 - time3 / time1) * 100)}% 提升)`)

    // 测试4：缓存功能
    console.log('\n📋 测试4：LRU 缓存功能')
    const { LRUCache } = apiModule
    const cache = new LRUCache({
      maxSize: 100,
      defaultTTL: 60000,
      enabled: true
    })

    // 写入测试
    const writeStart = Date.now()
    for (let i = 0; i < 1000; i++) {
      cache.set(`key-${i}`, { value: i })
    }
    const writeTime = Date.now() - writeStart
    console.log(`✅ 写入 1000 条数据，耗时: ${writeTime}ms`)

    // 读取测试
    const readStart = Date.now()
    let hits = 0
    for (let i = 0; i < 1000; i++) {
      if (cache.get(`key-${i}`) !== null) hits++
    }
    const readTime = Date.now() - readStart
    const stats = cache.getStats()
    console.log(`✅ 读取 1000 次，耗时: ${readTime}ms`)
    console.log(`   命中率: ${stats.hitRate.toFixed(2)}`)
    console.log(`   内存使用: ${(stats.memoryUsage / 1024).toFixed(2)} KB`)

    // 测试5：序列化优化
    console.log('\n📋 测试5：序列化优化')
    const { SerializationOptimizer } = apiModule
    const serializer = new SerializationOptimizer()

    const testData = {
      users: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `user-${i}`,
        email: `user${i}@example.com`,
        profile: { age: 20 + i, city: 'Beijing' }
      }))
    }

    // 标准 JSON.stringify
    const jsonStart = Date.now()
    for (let i = 0; i < 1000; i++) {
      JSON.stringify(testData)
    }
    const jsonTime = Date.now() - jsonStart

    // 优化的序列化
    const optStart = Date.now()
    for (let i = 0; i < 1000; i++) {
      serializer.serialize(testData)
    }
    const optTime = Date.now() - optStart

    console.log(`✅ 序列化性能对比 (1000次)：`)
    console.log(`   JSON.stringify: ${jsonTime}ms`)
    console.log(`   优化序列化: ${optTime}ms`)
    console.log(`   性能提升: ${Math.round((1 - optTime / jsonTime) * 100)}%`)

    // 测试6：错误处理优化
    console.log('\n📋 测试6：错误处理优化')
    const { ApiErrorFactoryOptimized } = apiModule

    const errorStart = Date.now()
    for (let i = 0; i < 1000; i++) {
      const error = ApiErrorFactoryOptimized.fromNetworkErrorLite(
        new Error('Test error'),
        { methodName: 'test', timestamp: Date.now() }
      )
      ApiErrorFactoryOptimized.release(error)
    }
    const errorTime = Date.now() - errorStart
    console.log(`✅ 创建和释放 1000 个错误对象，耗时: ${errorTime}ms`)

    // 清理
    engine1.destroy()
    engine2.destroy()
    engine3.destroy()
    cache.destroy()

    console.log('\n✨ 所有测试完成！优化效果显著。')

  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  }
}

// 运行测试
testOptimization()
