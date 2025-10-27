# @ldesign/api Vue 3 示例

这是一个完整的 Vue 3 示例应用，展示了 @ldesign/api 在 Vue 3 中的各种用法。

## 功能演示

- ✅ 基础 API 调用
- ✅ 列表数据展示
- ✅ 表单提交 (useMutation)
- ✅ 分页数据
- ✅ 响应式状态管理
- ✅ 加载和错误状态

## 运行示例

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

浏览器将自动打开 http://localhost:5173

## 项目结构

```
vue-example/
├── src/
│   ├── components/          # 示例组件
│   │   ├── BasicExample.vue        # 基础用法
│   │   ├── ListExample.vue         # 列表展示
│   │   ├── FormExample.vue         # 表单提交
│   │   └── PaginationExample.vue   # 分页数据
│   ├── plugins/
│   │   └── mockPlugin.ts    # 模拟数据插件
│   ├── App.vue              # 主应用
│   └── main.ts              # 入口文件
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 学习要点

### 1. 安装 Vue 插件

```typescript
// main.ts
import { ApiVuePlugin } from '@ldesign/api/vue'

app.use(ApiVuePlugin, {
  http: {
    baseURL: 'https://api.example.com',
  },
  cache: {
    enabled: true,
  }
})
```

### 2. 使用 useApi

```vue
<script setup>
import { useApi } from '@ldesign/api/vue'

const { data, loading, error, execute } = useApi('getUserInfo', {
  immediate: true
})
</script>
```

### 3. 使用 useMutation

```vue
<script setup>
import { useMutation } from '@ldesign/api/vue'

const { loading, mutate } = useMutation('createUser', {
  onSuccess: (data) => {
    console.log('成功', data)
  }
})
</script>
```

## 下一步

- 查看 [React 示例](../react-example/)
- 查看 [完整文档](../../docs/)
- 阅读 [Vue 集成指南](../../docs/guide/vue.md)

