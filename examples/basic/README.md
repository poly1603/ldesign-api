# @ldesign/api 基础示例

这是一个完整的可运行示例，展示了 @ldesign/api 的基本用法。

## 功能演示

- ✅ 基本 API 调用
- ✅ 带参数的 API 调用
- ✅ 创建数据
- ✅ 缓存机制
- ✅ 错误处理
- ✅ 性能监控

## 运行示例

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

浏览器将自动打开 http://localhost:3000

## 学习要点

### 1. 创建 API 引擎

```typescript
const apiEngine = createApiEngine({
  http: {
    baseURL: 'https://api.example.com',
  },
  cache: {
    enabled: true,
    ttl: 60000,
  }
})
```

### 2. 定义插件

```typescript
const myPlugin: ApiPlugin = {
  name: 'my-plugin',
  apis: {
    getUserInfo: {
      method: 'GET',
      url: '/users/info'
    }
  }
}
```

### 3. 调用 API

```typescript
const data = await apiEngine.call('getUserInfo')
```

### 4. 带参数调用

```typescript
const user = await apiEngine.call('getUser', {
  params: { id: 123 }
})
```

### 5. 缓存控制

```typescript
// 使用缓存
const data = await apiEngine.call('getUserList')

// 强制刷新
const freshData = await apiEngine.call('getUserList', {
  forceRefresh: true
})

// 清除缓存
apiEngine.cache.clear()
```

## 下一步

- 查看 [Vue 3 示例](../vue-example/)
- 查看 [React 示例](../react-example/)
- 阅读 [完整文档](../../docs/)

