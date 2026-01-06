# @ldesign/api-core

框架无关的 API 管理核心库，支持多服务器、RESTful 和 LEAP 接口统一管理。

## 特性

- 🚀 **框架无关** - 纯 TypeScript 实现，可在任何前端框架中使用
- 🔌 **多服务器支持** - 一个应用可连接多个后端服务器
- 🎯 **多接口类型** - 同时支持 RESTful 和 LEAP RPC 风格接口
- 📝 **声明式定义** - 使用 TypeScript 类型安全地定义 API
- 🛡️ **类型安全** - 完整的 TypeScript 类型定义
- 💾 **请求缓存** - 内置 LRU 缓存和请求去重
- 🔄 **自动重试** - 支持指数退避的请求重试机制
- 🛠️ **代理生成** - 自动生成开发服务器代理配置

## 安装

```bash
pnpm add @ldesign/api-core
```

## 快速开始

### 1. 定义服务器

```typescript
import { defineRestfulServer, defineLeapServer } from '@ldesign/api-core'

// RESTful 服务器
const jsonApi = defineRestfulServer('jsonApi', 'https://jsonplaceholder.typicode.com')

// LEAP 服务器
const leapServer = defineLeapServer('lpom', 'https://pm.longrise.cn', {
  leap: {
    systemPrefix: '/LPOM',
    sysName: 'longriseOA',
    sysArea: 42,
    getSid: () => sessionStorage.getItem('LSID') || '',
    getLid: () => sessionStorage.getItem('Lid') || '',
  }
})
```

### 2. 定义 API

```typescript
import { defineRestfulApi, defineLeapApi } from '@ldesign/api-core'

// RESTful API
const getUserApi = defineRestfulApi<{ id: number }, User>(
  'jsonApi', 'getUser', 'GET', '/users/:id'
)
  .pathParams('id')
  .build()

// LEAP API
const getWorkdayApi = defineLeapApi<{ month: string }, WorkdayResult>(
  'lpom', 'getMonthWorkday', 'loap_monthworkday'
)
  .describe('获取月工作日')
  .build()
```

### 3. 创建管理器并调用

```typescript
import { createApiManager } from '@ldesign/api-core'

const apiManager = createApiManager({
  servers: [jsonApi, leapServer],
  defaultServerId: 'jsonApi',
})

// 注册 API
apiManager.register(getUserApi)
apiManager.register(getWorkdayApi)

// 调用 RESTful API
const user = await apiManager.call<User>('getUser', {
  pathParams: { id: 1 }
})

// 调用 LEAP API
const workday = await apiManager.call<WorkdayResult>('getMonthWorkday', {
  params: { month: '2025-01' }
})
```

### 4. 类型安全的调用器

```typescript
// 创建类型安全的调用器
const getUser = apiManager.createCaller(getUserApi)
const getMonthWorkday = apiManager.createCaller(getWorkdayApi)

// 调用时自动推断类型
const user = await getUser({ id: 1 })
const workday = await getMonthWorkday({ month: '2025-01' })
```

## 代理配置

为开发服务器生成代理配置：

```typescript
import { generateViteProxyConfig, generateLeapProxyConfig } from '@ldesign/api-core'

// 在 vite.config.ts 或 launcher.config.ts 中
export default {
  server: {
    proxy: {
      ...generateViteProxyConfig([jsonApi]),
      ...generateLeapProxyConfig([leapServer]),
    }
  }
}
```

## API

### 服务器定义

- `defineServer(config)` - 定义通用服务器
- `defineRestfulServer(id, baseUrl, options?)` - 定义 RESTful 服务器
- `defineLeapServer(id, baseUrl, options?)` - 定义 LEAP 服务器

### API 定义

- `defineRestfulApi(serverId, name, method, path)` - 定义 RESTful API
- `defineLeapApi(serverId, name, method)` - 定义 LEAP API
- `createCrudApis(serverId, resourceName, basePath)` - 创建 CRUD API 集合
- `createLeapApis(serverId, methods)` - 创建 LEAP 方法集合

### 管理器

- `createApiManager(config?)` - 创建 API 管理器
- `createApiManagerAsync(config?)` - 创建并初始化 API 管理器

### 代理生成

- `generateViteProxyConfig(servers)` - 生成 Vite 代理配置
- `generateLeapProxyConfig(servers)` - 生成 LEAP 专用代理配置

## 缓存和重试

### LRU 缓存

```typescript
import { LRUCache } from '@ldesign/api-core'

const cache = new LRUCache<string>({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 分钟
})

cache.set('key', 'value')
const value = cache.get('key')
cache.getStats() // { size, hits, misses, hitRate, ... }
```

### 请求去重

```typescript
import { RequestDeduplicator } from '@ldesign/api-core'

const deduplicator = new RequestDeduplicator()

// 相同的并发请求只会执行一次
const result = await deduplicator.execute(
  { method: 'GET', url: '/api/data' },
  () => fetch('/api/data').then(r => r.json())
)
```

### 重试策略

```typescript
import { createRetryStrategy } from '@ldesign/api-core'

const retry = createRetryStrategy({
  maxRetries: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  jitter: true
})

const result = await retry.execute(async () => {
  const response = await fetch('/api/data')
  if (!response.ok) throw new Error('Request failed')
  return response.json()
})
```

## 工具函数

```typescript
import { 
  debounce,
  throttle,
  deepMerge,
  deepClone,
  pick,
  omit 
} from '@ldesign/api-core'

// 防抖/节流
const debouncedFn = debounce(fn, { wait: 300 })
const throttledFn = throttle(fn, { wait: 100 })

// 对象操作
const merged = deepMerge({ a: 1 }, { b: 2 })
const cloned = deepClone(original)
```

## License

MIT © LDesign Team
