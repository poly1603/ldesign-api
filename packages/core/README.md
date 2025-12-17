# @ldesign/api-core

框架无关的 API 管理核心库，支持多服务器、RESTful 和 LEAP 接口统一管理。

## 特性

- 🔌 **多服务器支持** - 一个应用可连接多个后端服务器
- 🎯 **多接口类型** - 同时支持 RESTful 和 LEAP RPC 风格接口
- 📝 **声明式定义** - 使用 TypeScript 类型安全地定义 API
- 🔄 **统一调用** - 无论接口类型，使用统一的方式调用
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

## License

MIT
