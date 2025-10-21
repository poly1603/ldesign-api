# API 引擎性能基准测试

本目录包含 @ldesign/api 包的性能基准测试套件。

## 📊 测试范围

性能基准测试覆盖以下关键领域：

### 1. 中间件性能
- 无中间件调用基线
- 5个全局中间件性能
- 10个全局中间件性能
- 中间件缓存效果测试

### 2. 缓存性能
- 缓存键生成（小/中/大对象）
- LRU 缓存写入性能
- LRU 缓存读取性能
- 缓存命中率测试

### 3. 方法注册性能
- 单个方法注册
- 批量注册 10 个方法
- 批量注册 100 个方法

### 4. 配置构建性能
- 重试配置构建（默认值/完整配置）
- 断路器配置构建
- 中间件配置缓存

### 5. 引擎生命周期
- 引擎创建（最小/完整配置）
- 引擎销毁
- 创建+注册+销毁完整流程

### 6. 对象规范化
- 请求配置规范化（无函数/有函数/多函数）
- 函数解析性能

### 7. 重试机制
- 固定延迟计算
- 指数退避计算
- 抖动计算

### 8. 断路器
- 状态检查
- 成功反馈处理
- 失败反馈处理

## 🚀 运行基准测试

### 运行所有基准测试
```bash
pnpm run bench
```

### 运行特定测试文件
```bash
pnpm vitest bench __tests__/benchmark/performance.bench.ts
```

### 生成基准报告
```bash
pnpm vitest bench --reporter=verbose
```

## 📈 结果解读

基准测试结果包含以下指标：

- **ops/sec**: 每秒操作数，越高越好
- **mean**: 平均执行时间
- **min/max**: 最小/最大执行时间
- **p75/p99**: 75th/99th 百分位数延迟

### 性能目标

| 操作 | 目标 ops/sec | 说明 |
|------|-------------|------|
| 缓存键生成（小对象） | > 1,000,000 | 应该非常快 |
| 中间件获取（缓存命中） | > 10,000,000 | 缓存命中应该极快 |
| 方法注册 | > 100,000 | 注册操作应该快速 |
| 配置构建 | > 1,000,000 | 配置合并应该快速 |
| 引擎创建 | > 10,000 | 初始化允许稍慢 |

## 📝 优化建议

### Phase 1 优化成果（已完成）
- ✅ 提取魔数常量
- ✅ 添加断路器状态自动清理
- ✅ 优化 React Hooks 依赖

### Phase 2 优化成果（已完成）
- ✅ 实现中间件数组缓存（LRU）
- ✅ 拆分 call 方法，提升可维护性
- ✅ 添加 TypedApiEngine 类型安全接口

### 预期性能提升

| 优化项 | 预期提升 | 实际测量 |
|-------|---------|---------|
| 中间件缓存 | 30-40% | 待测量 |
| call 方法拆分 | 可读性↑ | ✅ |
| 类型安全 | 0%（编译时） | ✅ |

## 🔍 性能分析

### 如何识别性能瓶颈

1. **运行基准测试**
   ```bash
   pnpm run bench
   ```

2. **对比优化前后**
   - 记录优化前的基准数据
   - 应用优化
   - 重新运行基准测试
   - 对比结果

3. **使用 Chrome DevTools**
   - 在浏览器环境中分析
   - 使用 Performance 面板
   - 查找热点函数

### 常见性能问题

#### 1. 中间件过多
**症状**: `中间件性能` 测试结果差
**解决**: 
- 减少不必要的中间件
- 合并相似功能的中间件
- 使用条件中间件

#### 2. 缓存未命中
**症状**: `缓存性能` 测试显示命中率低
**解决**:
- 检查缓存键生成逻辑
- 调整缓存大小
- 优化 TTL 设置

#### 3. 对象创建过多
**症状**: `配置构建性能` 测试慢
**解决**:
- 使用对象池
- 缓存配置对象
- 减少对象展开操作

## 📊 持续监控

### CI/CD 集成

在 CI 中运行基准测试：

```yaml
# .github/workflows/benchmark.yml
name: Benchmark
on: [push, pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run bench
      - name: Store benchmark result
        uses: benchmark-action/github-action-benchmark@v1
        with:
          tool: 'vitest'
          output-file-path: benchmark-results.json
```

### 性能回归检测

设置性能基线，自动检测回归：

```typescript
// vitest.config.ts
export default {
  benchmark: {
    threshold: {
      '中间件缓存': {
        mean: 100, // 平均不超过 100ms
      },
    },
  },
}
```

## 🛠️ 开发建议

### 编写新的基准测试

```typescript
describe('新功能性能', () => {
  bench('测试用例名称', () => {
    // 测试代码
  })
  
  bench('异步测试用例', async () => {
    // 异步测试代码
  })
})
```

### 基准测试最佳实践

1. **隔离测试** - 每个测试应该独立
2. **预热** - 在测量前运行几次预热
3. **多次运行** - 运行足够多的迭代以获得稳定结果
4. **清理** - 测试后清理资源
5. **真实场景** - 模拟真实使用场景

## 📚 相关资源

- [Vitest Benchmark](https://vitest.dev/guide/features.html#benchmarking)
- [Performance Best Practices](https://web.dev/performance/)
- [JavaScript Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)

## 🤝 贡献

发现性能问题？欢迎提交 Issue 或 PR！

请在 PR 中包含：
- 问题描述
- 基准测试结果对比
- 优化方案说明
