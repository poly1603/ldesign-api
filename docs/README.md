# @ldesign/api 文档

欢迎使用 @ldesign/api 的完整文档！

## 📚 文档结构

### 🚀 快速开始

- [安装和配置](./guide/installation.md) - 开始使用 @ldesign/api
- [基础用法](./guide/basic-usage.md) - 学习基本概念和用法
- [Vue 3 集成](./guide/vue.md) - 在 Vue 3 中使用
- [React 集成](./guide/react.md) - 在 React 中使用

### 📖 核心概念

- [API 引擎](./guide/api-engine.md) - 核心引擎的工作原理
- [插件系统](./guide/plugin-system.md) - 插件化架构详解
- [系统接口](./guide/system-api.md) - 内置系统接口
- [类型注册表](./guide/typed-registry.md) - 类型安全的 API 调用

### 🎯 功能特性

- [REST 接口](./guide/rest.md) - REST API 支持
- [GraphQL](./guide/graphql.md) - GraphQL 集成
- [中间件](./guide/middlewares.md) - 中间件系统
- [错误处理](./guide/error-handling.md) - 统一错误处理
- [请求队列](./guide/request-queue.md) - 请求队列管理

### ⚡ 性能优化

- [性能优化](./guide/performance.md) - 性能优化策略
- [离线缓存](./guide/offline-cache.md) - 离线缓存支持
- [可观测性](./guide/observability.md) - 性能监控和追踪

### 🔧 API 参考

- [核心 API](./api/core.md) - 核心 API 文档
- [插件 API](./api/plugins.md) - 插件 API 文档
- [Vue API](./api/vue.md) - Vue 集成 API
- [React API](./api/react.md) - React 集成 API
- [类型定义](./api/types.md) - TypeScript 类型定义

### 💡 示例

- [基础示例](./examples/basic.md) - 基础用法示例
- [Vue 示例](./examples/vue.md) - Vue 3 完整示例
- [React 示例](./examples/react.md) - React 完整示例
- [插件开发](./examples/plugins.md) - 自定义插件示例
- [进阶示例](./examples/advanced.md) - 高级功能示例
- [实战项目](./examples/real-world.md) - 真实项目案例

### 🚀 进阶主题

- [自定义插件](./advanced/custom-plugins.md) - 开发自定义插件
- [中间件开发](./advanced/middleware.md) - 开发中间件
- [性能调优](./advanced/performance-tuning.md) - 性能调优指南
- [最佳实践](./advanced/best-practices.md) - 开发最佳实践

### ❓ 其他

- [常见问题](./guide/faq.md) - 常见问题解答
- [最佳实践](./guide/best-practices.md) - 使用建议

## 🎮 可运行示例

在 `examples/` 目录中提供了完整的可运行示例项目：

- **[基础示例](../examples/basic/)** - 纯 JS/TS 示例
- **[Vue 3 示例](../examples/vue-example/)** - 完整的 Vue 3 应用

每个示例都可以独立运行，详见各示例目录的 README。

## 📦 快速安装

```bash
# npm
npm install @ldesign/api

# yarn
yarn add @ldesign/api

# pnpm
pnpm add @ldesign/api
```

## 🌟 核心特性

### 插件化架构
通过强大的插件系统实现功能的模块化和可扩展性

### 性能优化
内置智能缓存、请求防抖、请求去重等多种性能优化机制

### 类型安全
完整的 TypeScript 支持，强类型的 API 定义

### 框架集成
核心功能框架无关，同时为 Vue 3 和 React 提供深度集成

### 开发体验
简洁优雅的 API 设计，丰富的配置选项，完善的文档

## 📄 文档导航

### 新手入门
1. [安装和配置](./guide/installation.md)
2. [基础用法](./guide/basic-usage.md)
3. [基础示例](./examples/basic.md)

### Vue 开发者
1. [Vue 3 集成](./guide/vue.md)
2. [Vue 示例](./examples/vue.md)
3. [Vue API 参考](./api/vue.md)

### React 开发者
1. [React 集成](./guide/react.md)
2. [React 示例](./examples/react.md)
3. [React API 参考](./api/react.md)

### 进阶开发
1. [插件系统](./guide/plugin-system.md)
2. [自定义插件](./advanced/custom-plugins.md)
3. [性能调优](./advanced/performance-tuning.md)

## 🔗 相关链接

- [GitHub 仓库](https://github.com/ldesign/ldesign)
- [问题反馈](https://github.com/ldesign/ldesign/issues)
- [更新日志](https://github.com/ldesign/ldesign/blob/main/CHANGELOG.md)

## 📝 本地运行文档

```bash
# 安装依赖
pnpm install

# 启动文档服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览构建结果
pnpm docs:preview
```

## 💬 获取帮助

- 📖 查看[完整文档](./guide/installation.md)
- 💡 浏览[示例代码](./examples/)
- 🐛 [提交问题](https://github.com/ldesign/ldesign/issues)
- 💬 [参与讨论](https://github.com/ldesign/ldesign/discussions)

## 📄 许可证

MIT License © 2024 LDesign Team

