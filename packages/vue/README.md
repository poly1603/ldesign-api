# @ldesign/api-vue

Vue 3 集成的 API 管理库，提供响应式组合函数和插件。

## 特性

- 🎯 **响应式** - 基于 Vue 3 Composition API
- 🔌 **插件化** - 一行代码集成到 Vue 应用
- 📦 **类型安全** - 完整的 TypeScript 支持
- 🔄 **自动取消** - 组件卸载时自动取消请求
- 🎨 **灵活调用** - 支持命令式和声明式调用

## 安装

```bash
pnpm add @ldesign/api-vue
```

## 快速开始

### 1. 注册插件

```typescript
import { createApp } from 'vue'
import { createApiPlugin, defineRestfulServer, defineLeapServer } from '@ldesign/api-vue'

const app = createApp(App)

app.use(createApiPlugin({
  servers: [
    defineRestfulServer('jsonApi', 'https://jsonplaceholder.typicode.com'),
    defineLeapServer('lpom', 'https://pm.longrise.cn', {
      leap: {
        systemPrefix: '/LPOM',
        sysName: 'longriseOA',
        sysArea: 42,
      }
    })
  ],
  defaultServerId: 'jsonApi'
}))
```

### 2. 在组件中使用

```vue
<script setup lang="ts">
import { useApi, defineRestfulApi } from '@ldesign/api-vue'

interface User {
  id: number
  name: string
  email: string
}

// 定义 API
const getUserApi = defineRestfulApi<{ id: number }, User>(
  'jsonApi', 'getUser', 'GET', '/users/:id'
).pathParams('id').build()

// 使用 API
const { data, loading, error, execute } = useApi(getUserApi)

// 加载用户
async function loadUser(id: number) {
  await execute({ id }, { pathParams: { id } })
}
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error.message }}</div>
    <div v-else-if="data">
      <h2>{{ data.name }}</h2>
      <p>{{ data.email }}</p>
    </div>
  </div>
</template>
```

### 3. LEAP 接口调用

```vue
<script setup lang="ts">
import { useLeapApi, defineLeapApi } from '@ldesign/api-vue'

interface WorkdayData {
  days: number[]
  holidays: string[]
}

// 定义 LEAP API
const getWorkdayApi = defineLeapApi<{ month: string }, WorkdayData>(
  'lpom', 'getMonthWorkday', 'loap_monthworkday'
).build()

// 使用 LEAP API
const { data, loading, execute } = useLeapApi(getWorkdayApi)

// 加载工作日
execute({ month: '2025-01' })
</script>
```

## API

### 插件

- `createApiPlugin(options)` - 创建 Vue 插件
- `createApiEnginePlugin(options)` - 创建 Engine 插件

### 组合函数

- `useApiManager()` - 获取 API 管理器
- `useApi(api, options)` - 通用 API 调用
- `useLeapApi(api, options)` - LEAP API 调用
- `useRestfulApi(api, options)` - RESTful API 调用
- `createLeapCaller(serverId)` - 创建 LEAP 调用器
- `createRestfulResource(serverId, basePath)` - 创建 RESTful 资源

### 选项

```typescript
interface UseApiOptions {
  params?: unknown           // 初始参数
  immediate?: boolean        // 立即执行
  watch?: boolean            // 监听参数变化
  onSuccess?: (data) => void // 成功回调
  onError?: (error) => void  // 失败回调
  onFinally?: () => void     // 完成回调
}
```

### 返回值

```typescript
interface UseApiReturn {
  data: ShallowRef<T>        // 响应数据
  loading: Ref<boolean>      // 加载状态
  error: ShallowRef<Error>   // 错误信息
  isSuccess: Ref<boolean>    // 是否成功
  isError: Ref<boolean>      // 是否失败
  execute: Function          // 执行请求
  refresh: Function          // 刷新请求
  reset: Function            // 重置状态
}
```

## License

MIT
