# 前端监控 SDK - 工程化架构

## 📋 项目概述

`monitor-core` 是前端监控系统的核心 SDK 模块，采用现代化的工程化架构设计。负责在客户端收集、处理和上报各种监控数据，支持错误监控、性能监控、用户行为监控等功能。

## 🏗️ 工程化架构

### 1. 项目结构

项目采用标准的工程化目录结构，按功能模块分类组织代码：

```
monitor-core/
├── src/                    # 源代码目录
│   ├── core/              # 核心模块
│   │   ├── DataQueue.js   # 数据队列管理
│   │   └── Monitor.js     # 主监控类
│   ├── modules/           # 监控模块
│   │   ├── ErrorMonitor.js      # 错误监控
│   │   ├── PerformanceMonitor.js # 性能监控
│   │   └── BehaviorMonitor.js   # 用户行为监控
│   ├── utils/             # 工具函数
│   │   └── index.js       # 工具函数集合
│   └── index.js          # 入口文件
├── dist/                  # 构建输出目录
│   ├── monitor-sdk.js     # UMD 格式
│   ├── monitor-sdk.esm.js # ES 模块格式
│   └── monitor-sdk.min.js # 压缩版本
├── package.json          # 项目配置
├── rollup.config.js      # 构建配置
└── tsconfig.json         # TypeScript 配置
```

### 2. 构建系统

使用 Rollup 作为构建工具，支持多种输出格式：

- **UMD 格式** (`monitor-sdk.js`)：通用模块定义，支持浏览器和Node.js
- **ES 模块格式** (`monitor-sdk.esm.js`)：现代模块系统，支持 tree-shaking
- **压缩版本** (`monitor-sdk.min.js`)：生产环境使用，体积优化

## 🔧 核心模块设计

### 1. 工具函数模块 (utils/index.js)

**设计目标**：提供通用的工具函数，支持模块化开发。

**核心功能**：
- `DEFAULT_CONFIG` - 默认配置对象
- `deepMerge()` - 深度合并配置对象
- `now()` - 获取当前时间戳
- `generateId()` - 生成唯一ID
- `isFunction()`, `isObject()`, `isArray()` - 类型判断函数

### 2. 数据队列模块 (core/DataQueue.js)

**设计目标**：高效管理监控数据，支持批量上报和页面卸载时数据保护。

**核心功能**：
- 数据缓存队列管理
- 定时批量上报机制
- 页面卸载前数据保护
- 多种上报方式支持

**上报策略**：
1. **立即上报**：队列达到最大容量时
2. **定时上报**：配置的时间间隔触发
3. **页面卸载上报**：使用 `navigator.sendBeacon` 确保数据不丢失

### 3. 错误监控模块 (modules/ErrorMonitor.js)

**设计目标**：全面捕获前端运行时错误，提供详细的错误上下文信息。

**监控范围**：
- **JavaScript 运行时错误**：通过 `window.onerror` 捕获
- **Promise 未捕获异常**：通过 `unhandledrejection` 事件捕获
- **资源加载错误**：监控图片、脚本、样式表等资源加载失败
- **API 接口错误**：拦截 XMLHttpRequest 和 fetch 请求

### 4. 性能监控模块 (modules/PerformanceMonitor.js)

**设计目标**：收集页面加载性能指标和用户体验相关数据。

**监控指标**：
- **传统性能指标**：DNS查询、TCP连接、请求响应等耗时
- **资源加载性能**：图片、脚本、样式表等资源加载时间
- **Web Vitals 指标**：LCP、FID、CLS等核心用户体验指标

### 5. 用户行为监控模块 (modules/BehaviorMonitor.js)

**设计目标**：跟踪用户在页面上的交互行为，分析用户行为路径。

**监控类型**：
- **点击行为**：监控用户点击事件，记录元素信息和位置
- **页面浏览**：监控路由变化和页面跳转
- **表单提交**：监控表单提交行为

### 6. 主监控类 (core/Monitor.js)

**设计目标**：统一管理所有监控模块，提供简洁的 API 接口。

**核心方法**：
- `init(userConfig)` - 初始化监控
- `reportError(error, customData)` - 手动上报错误
- `reportPerformance(metrics, customData)` - 手动上报性能数据
- `reportBehavior(behaviorType, data)` - 手动上报用户行为
- `flush()` - 立即上报所有数据
- `destroy()` - 销毁监控实例

## 🚀 快速开始

### 1. 安装依赖

```bash
cd monitor-core
npm install
```

### 2. 构建 SDK

```bash
# 开发构建
npm run build

# 开发模式（监听文件变化）
npm run dev
```

### 3. 在项目中使用

**HTML 引入方式**：
```html
<script src="dist/monitor-sdk.js"></script>
<script>
// 初始化监控
window.Monitor.init({
    reportUrl: 'https://api.example.com/monitor',
    appId: 'your-app-id',
    monitorErrors: true,
    monitorPerformance: true,
    monitorBehavior: false
});
</script>
```

**ES 模块方式**：
```javascript
import { Monitor } from 'monitor-core';

const monitor = new Monitor();
monitor.init({
    reportUrl: 'https://api.example.com/monitor',
    appId: 'your-app-id'
});
```

## 📊 配置选项

```javascript
const config = {
    // 必填：数据上报地址
    reportUrl: "",
    
    // 应用标识
    appId: "",
    userId: "",
    version: "1.0.0",
    environment: "production",
    
    // 功能开关
    monitorErrors: true,
    monitorPerformance: true,
    monitorBehavior: false,
    
    // 采样率控制 (0-1)
    sampleRate: 1,
    
    // 队列配置
    maxQueueSize: 100,
    reportInterval: 10000,
    
    // 错误忽略列表
    ignoreErrors: [],
    
    // 性能监控配置
    performance: {
        resourceTiming: true,
        webVitals: true,
    },
    
    // 用户行为监控配置
    userBehavior: {
        click: false,
        pageView: false,
        formSubmit: false,
    },
};
```

## 🔧 开发指南

### 构建命令

```bash
# 安装依赖
npm install

# 构建所有版本
npm run build

# 开发模式（监听文件变化）
npm run dev

# 代码检查
npm run lint

# 运行测试
npm run test
```

### 根目录构建

在项目根目录可以使用统一的构建命令：

```bash
# 安装监控SDK依赖
npm run monitor:install

# 构建监控SDK
npm run build:monitor

# 监控SDK开发模式
npm run monitor:dev
```

### 模块扩展

添加新的监控模块：

1. 在 `src/modules/` 目录创建新的模块文件
2. 实现模块类，包含 `init()` 和 `destroy()` 方法
3. 在 `core/Monitor.js` 中集成新模块
4. 更新配置选项支持新功能

## 📈 性能优化

### 1. 代码体积
- 使用 Rollup 进行 tree-shaking
- 压缩版本减少文件大小
- 按需加载监控模块

### 2. 运行时性能
- 批量上报减少网络请求
- 采样率控制数据量
- 被动事件监听避免阻塞

### 3. 内存管理
- 队列机制控制内存使用
- 及时清理无用数据
- 提供完整的销毁接口

## 🔮 API 参考

### Monitor 类

#### init(userConfig)
初始化监控SDK。

**参数**：
- `userConfig` (Object): 用户配置对象

**示例**：
```javascript
window.Monitor.init({
    reportUrl: 'https://api.example.com/monitor',
    appId: 'your-app-id'
});
```

#### reportError(error, customData)
手动上报错误信息。

**参数**：
- `error` (Error): 错误对象
- `customData` (Object): 自定义数据

#### reportPerformance(metrics, customData)
手动上报性能数据。

**参数**：
- `metrics` (Object): 性能指标数据
- `customData` (Object): 自定义数据

#### reportBehavior(behaviorType, data)
手动上报用户行为。

**参数**：
- `behaviorType` (String): 行为类型
- `data` (Object): 行为数据

#### flush()
立即上报所有缓存数据。

#### destroy()
销毁监控实例，清理资源。

#### getConfig()
获取当前配置。

#### isInitialized()
检查是否已初始化。

## 🎯 设计原则

### 1. 模块化设计
- 每个功能模块独立，职责单一
- 易于测试和维护
- 支持按需加载

### 2. 工程化标准
- 使用现代构建工具
- 支持多种模块格式
- 完整的开发工具链

### 3. 兼容性考虑
- UMD 模块规范支持
- 浏览器兼容性处理
- 优雅降级策略

### 4. 可扩展性
- 插件化架构设计
- 配置驱动功能开关
- 易于添加新功能

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**版本**: 1.0.0  
**最后更新**: 2024年12月  
**维护者**: 前端监控团队