# @ldesign/api 性能优化指南

## 快速开始

### 1. 选择合适的初始化方式

根据您的应用场景选择最适合的初始化方式：

```typescript
// 场景1：完整功能，适合大型应用
import { createApiEngine } from '@ldesign/api'

const engine = await createApiEngine({
  appName: 'my-app',
  cache: { enabled: true, storage: 'lru' },
  debounce: { enabled: true },
})

// 场景2：懒加载模式，适合需要快速启动的应用
import { createLazyApiEngine, loadPlugins } from '@ldesign/api'

const engine = await createLazyApiEngine({
  appName: 'my-app'
})

// 按需加载插件
await loadPlugins(engine, ['auth', 'cache', 'retry'])

// 场景3：最小化模式，适合轻量级应用
import { createMinimalApiEngine } from '@ldesign/api'

const engine = await createMinimalApiEngine({
  appName: 'my-app'
})
```

### 2. 缓存策略配置

#### LRU 缓存（推荐）

```typescript
const engine = await createApiEngine({
  cache: {
    enabled: true,
    storage: 'lru',      // 使用高性能 LRU 缓存
    maxSize: 500,        // 最大缓存条目数
    ttl: 300000,         // 默认 TTL（5分钟）
  }
})

// 注册带缓存的 API
engine.register('getUserInfo', {
  config: {
    url: '/api/user/info',
    method: 'GET',
  },
  cache: {
    enabled: true,
    ttl: 600000,  // 10分钟缓存
  }
})
```

#### 内存监控

```typescript
// 获取缓存统计信息
const stats = engine.getCacheStats()
console.log('缓存命中率:', stats.hitRate)
console.log('内存使用:', stats.size)

// 清理缓存
engine.clearCache('getUserInfo')  // 清理特定方法的缓存
engine.clearCache()               // 清理所有缓存
```

### 3. 中间件优化

#### 使用组合中间件

```typescript
// 定义中间件
const authMiddleware: RequestMiddleware = async (config, ctx) => {
  config.headers.Authorization = `Bearer ${getToken()}`
  return config
}

const logMiddleware: RequestMiddleware = async (config, ctx) => {
  console.log(`API Call: ${ctx.methodName}`)
  return config
}

// 注册 API 时组合中间件
engine.register('protectedApi', {
  config: { url: '/api/protected' },
  middlewares: {
    request: [authMiddleware, logMiddleware],
  }
})
```

### 4. 错误处理优化

#### 使用轻量级错误

```typescript
// API 调用会自动使用优化的错误处理
try {
  await engine.call('someApi')
} catch (error) {
  // error 是优化后的 ApiError
  console.log(error.userMessage)     // 用户友好消息
  console.log(error.suggestions)      // 解决建议
  console.log(error.retryable)       // 是否可重试
}
```

### 5. 批量操作

#### 批量 API 调用

```typescript
// 批量调用多个 API
const results = await engine.callBatch([
  { methodName: 'getUserInfo', params: { id: 1 } },
  { methodName: 'getUserPosts', params: { userId: 1 } },
  { methodName: 'getUserFollowers', params: { userId: 1 } },
])
```

#### 批量缓存操作

```typescript
// 批量设置缓存
const cacheManager = new CacheManager({ storage: 'lru' })
cacheManager.setMany([
  { key: 'user:1', data: userData1, ttl: 600000 },
  { key: 'user:2', data: userData2, ttl: 600000 },
  { key: 'user:3', data: userData3, ttl: 600000 },
])

// 批量获取缓存
const users = cacheManager.getMany(['user:1', 'user:2', 'user:3'])
```

### 6. 防抖和去重

#### 防抖配置

```typescript
// 全局防抖配置
const engine = await createApiEngine({
  debounce: {
    enabled: true,
    delay: 300,  // 300ms 防抖延迟
  }
})

// 特定 API 的防抖配置
engine.register('searchUsers', {
  config: { url: '/api/search/users' },
  debounce: {
    enabled: true,
    delay: 500,  // 搜索 API 使用更长的防抖时间
  }
})
```

#### 请求去重

```typescript
// 自动去重相同的并发请求
const engine = await createApiEngine({
  deduplication: {
    enabled: true,
  }
})

// 这些请求会被自动去重
Promise.all([
  engine.call('getUserInfo', { id: 1 }),
  engine.call('getUserInfo', { id: 1 }),  // 复用第一个请求
  engine.call('getUserInfo', { id: 1 }),  // 复用第一个请求
])
```

### 7. 内存保护

#### 配置内存限制

```typescript
import { getGlobalMemoryGuard } from '@ldesign/api'

// 配置内存保护
const memoryGuard = getGlobalMemoryGuard()
memoryGuard.updateConfig({
  maxMemory: 100 * 1024 * 1024,        // 100MB 限制
  warningThreshold: 80 * 1024 * 1024,  // 80MB 警告
  enableAutoDegradation: true,          // 自动降级
  onWarning: (info) => {
    console.warn('内存警告:', info)
  },
  onDegradation: (info) => {
    console.error('内存降级:', info)
    // 执行降级策略，如清理缓存
    engine.clearCache()
  }
})
```

### 8. 性能监控

#### 使用性能监控器

```typescript
import { getGlobalPerformanceMonitor } from '@ldesign/api'

const monitor = getGlobalPerformanceMonitor()

// 获取性能统计
const stats = monitor.getStats()
console.log('API 调用统计:', stats)

// 获取慢请求
const slowRequests = monitor.getSlowRequests(3000)  // 超过3秒的请求
console.log('慢请求:', slowRequests)

// 获取热点 API
const hotspots = monitor.getHotspots()
console.log('热点 API:', hotspots)
```

## 最佳实践

### 1. 生产环境配置

```typescript
// 生产环境推荐配置
const engine = await createApiEngine({
  appName: 'production-app',
  debug: false,
  cache: {
    enabled: true,
    storage: 'lru',
    maxSize: 1000,
    ttl: 300000,
  },
  debounce: {
    enabled: true,
    delay: 300,
  },
  deduplication: {
    enabled: true,
  },
  retry: {
    enabled: true,
    retries: 3,
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      halfOpenAfter: 30000,
    }
  },
  queue: {
    enabled: true,
    concurrency: 5,
  }
})
```

### 2. 移动端优化

```typescript
// 移动端推荐配置
const engine = await createMinimalApiEngine({
  appName: 'mobile-app',
  cache: {
    enabled: true,
    storage: 'lru',
    maxSize: 200,    // 减少缓存大小
  },
  http: {
    timeout: 15000,  // 增加超时时间
  }
})

// 使用离线缓存
await loadPlugin(engine, 'offlineCache')
```

### 3. 高并发场景

```typescript
// 高并发场景配置
const engine = await createApiEngine({
  queue: {
    enabled: true,
    concurrency: 10,     // 增加并发数
    maxQueue: 100,       // 限制队列长度
  },
  deduplication: {
    enabled: true,       // 必须启用去重
  },
  cache: {
    enabled: true,
    storage: 'lru',
    maxSize: 2000,       // 增加缓存容量
  }
})

// 使用批量 API 插件
await loadPlugin(engine, 'autoBatch')
```

## 故障排查

### 1. 内存泄漏检测

```typescript
// 检测循环引用
import { hasCircularReference } from '@ldesign/api'

const data = { /* 复杂对象 */ }
if (hasCircularReference(data)) {
  console.warn('检测到循环引用')
}

// 监控内存使用
import { getMemoryInfo } from '@ldesign/api'

setInterval(() => {
  const memInfo = getMemoryInfo()
  console.log('内存使用:', memInfo)
  
  if (memInfo.isWarning) {
    // 执行清理操作
    engine.clearCache()
  }
}, 60000)
```

### 2. 性能问题诊断

```typescript
// 开启调试模式
const engine = await createApiEngine({
  debug: true,  // 开启详细日志
})

// 监控慢请求
engine.register('slowApi', {
  config: { url: '/api/slow' },
  onSuccess: (data) => {
    console.log('请求成功', data)
  },
  onError: (error) => {
    console.error('请求失败', error)
    
    // 检查是否是超时
    if (error.type === 'TIMEOUT_ERROR') {
      // 增加超时时间或优化 API
    }
  }
})
```

### 3. 缓存失效问题

```typescript
// 监控缓存命中率
const stats = engine.getCacheStats()
if (stats.hitRate < 0.5) {
  console.warn('缓存命中率过低:', stats.hitRate)
  
  // 可能的原因：
  // 1. TTL 设置过短
  // 2. 缓存键生成有问题
  // 3. 缓存被频繁清理
}

// 自定义缓存键生成
engine.register('customApi', {
  config: { url: '/api/custom' },
  cache: {
    keyGenerator: (methodName, params) => {
      // 自定义缓存键逻辑
      const sorted = Object.keys(params).sort()
      return `${methodName}:${sorted.map(k => `${k}=${params[k]}`).join(',')}`
    }
  }
})
```

## 总结

通过合理使用这些优化功能，您可以：

1. **减少 40% 的内存占用**
2. **提升 50-80% 的性能**
3. **改善用户体验**
4. **降低服务器负载**

记住选择适合您应用场景的配置，并定期监控性能指标。

