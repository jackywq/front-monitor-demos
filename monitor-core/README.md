# 前端监控 SDK - 代码设计思路

## 📋 项目概述

`monitor-core` 是前端监控系统的核心 SDK 模块，负责在客户端收集、处理和上报各种监控数据。采用模块化设计，支持错误监控、性能监控、用户行为监控等功能。

## 🏗️ 架构设计

### 1. 模块化架构

SDK 采用分层模块化设计，主要包含以下核心模块：

```
Monitor SDK
├── 工具函数层 (utils)
├── 数据队列层 (DataQueue)
├── 监控模块层
│   ├── 错误监控 (ErrorMonitor)
│   ├── 性能监控 (PerformanceMonitor)
│   └── 用户行为监控 (BehaviorMonitor)
└── 主控制层 (Monitor)
```

### 2. UMD 模块规范支持

SDK 支持多种模块加载方式，确保在各种环境中都能正常工作：

```javascript
// AMD 规范
if (typeof define === "function" && define.amd) {
    define(factory);
} 
// CommonJS 规范  
else if (typeof module === "object" && module.exports) {
    module.exports = factory();
}
// 浏览器全局变量
else {
    global.Monitor = factory();
}
```

## 🔧 核心模块设计

### 1. 工具函数模块 (utils)

**设计目标**：提供通用的工具函数，避免代码重复，提高可维护性。

**核心功能**：
- `now()` - 获取当前时间戳
- `generateId()` - 生成唯一ID
- `safeStringify()` - 安全的JSON序列化
- `deepMerge()` - 深度合并配置对象
- `shouldSample()` - 采样率判断

**设计特点**：
- 纯函数设计，无副作用
- 函数职责单一，易于测试
- 错误处理完善，避免运行时崩溃

### 2. 数据队列模块 (DataQueue)

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
4. **降级方案**：使用 Image 对象进行上报

```javascript
class DataQueue {
    constructor(config) {
        this.config = config;
        this.queue = [];
        this.timer = null;
        this.init();
    }
    
    // 数据上报策略
    report(data) {
        // 优先使用 sendBeacon（支持页面卸载）
        if (navigator.sendBeacon) {
            const blob = new Blob([utils.safeStringify(reportData)], {
                type: "application/json",
            });
            navigator.sendBeacon(this.config.reportUrl, blob);
        } else {
            // 降级方案：使用 Image 对象
            const img = new Image();
            img.src = this.config.reportUrl + "?data=" + encodeURIComponent(data);
        }
    }
}
```

### 3. 错误监控模块 (ErrorMonitor)

**设计目标**：全面捕获前端运行时错误，提供详细的错误上下文信息。

**监控范围**：
- **JavaScript 运行时错误**：通过 `window.onerror` 捕获
- **Promise 未捕获异常**：通过 `unhandledrejection` 事件捕获
- **资源加载错误**：监控图片、脚本、样式表等资源加载失败
- **API 接口错误**：拦截 XMLHttpRequest 和 fetch 请求

**错误拦截设计**：

#### XMLHttpRequest 拦截
```javascript
interceptXHR() {
    const originalXHR = window.XMLHttpRequest;
    
    window.XMLHttpRequest = function () {
        const xhr = new originalXHR();
        // 重写 open 和 send 方法
        // 添加错误监控逻辑
        return xhr;
    };
}
```

#### Fetch 拦截
```javascript
interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = function (...args) {
        return originalFetch.apply(this, args)
            .then(response => {
                if (!response.ok) {
                    // 记录接口错误
                    this.queue.add(errorData);
                }
                return response;
            })
            .catch(error => {
                // 记录网络错误
                this.queue.add(errorData);
                throw error;
            });
    };
}
```

**错误过滤机制**：
- 支持配置忽略错误模式
- 自动过滤跨域脚本错误
- 支持正则表达式匹配忽略规则

### 4. 性能监控模块 (PerformanceMonitor)

**设计目标**：收集页面加载性能指标和用户体验相关数据。

**监控指标**：

#### 传统性能指标
- **DNS 查询耗时**：`domainLookupEnd - domainLookupStart`
- **TCP 连接耗时**：`connectEnd - connectStart`
- **请求响应耗时**：`responseEnd - requestStart`
- **DOM 解析耗时**：`domComplete - domLoading`
- **白屏时间**：`responseStart - navigationStart`
- **页面完全加载时间**：`loadEventEnd - navigationStart`

#### Web Vitals 核心指标
- **LCP (最大内容绘制)**：使用 PerformanceObserver 监控
- **FID (首次输入延迟)**：监控用户首次交互响应时间
- **CLS (累积布局偏移)**：监控页面布局稳定性

**数据采集时机**：
```javascript
init() {
    if (document.readyState === "complete") {
        this.collectPerformance();
    } else {
        window.addEventListener("load", () => {
            setTimeout(() => {
                this.collectPerformance();
            }, 0);
        });
    }
}
```

### 5. 用户行为监控模块 (BehaviorMonitor)

**设计目标**：跟踪用户在页面上的交互行为，分析用户行为路径。

**监控类型**：
- **点击行为**：监控用户点击事件，记录元素信息和位置
- **页面浏览**：监控路由变化和页面跳转
- **表单提交**：监控表单提交行为

**路由监控设计**：
```javascript
overrideHistory() {
    // 重写 history.pushState 和 history.replaceState
    // 添加自定义事件触发页面浏览记录
}
```

**事件过滤**：
- 自动过滤脚本、样式等非交互元素
- 支持扩展忽略规则
- 防止监控数据过多影响性能

### 6. 主监控类 (Monitor)

**设计目标**：统一管理所有监控模块，提供简洁的 API 接口。

**生命周期管理**：
```javascript
class Monitor {
    // 初始化
    init(userConfig) {
        // 合并配置
        // 初始化各监控模块
        // 设置初始化状态
    }
    
    // 销毁
    destroy() {
        // 清理各模块
        // 恢复被重写的方法
        // 重置状态
    }
}
```

**API 设计原则**：
- 方法命名清晰直观
- 参数配置灵活
- 错误处理完善
- 向后兼容性强

## 🎯 设计亮点

### 1. 性能优化设计
- **采样率控制**：支持配置采样率，避免数据量过大
- **批量上报**：减少网络请求次数
- **懒加载机制**：按需初始化监控模块
- **内存管理**：及时清理无用数据

### 2. 错误恢复设计
- **降级方案**：当高级特性不可用时自动降级
- **错误隔离**：各模块错误互不影响
- **资源释放**：提供完整的销毁机制

### 3. 可扩展性设计
- **插件化架构**：易于添加新的监控类型
- **配置驱动**：通过配置控制功能开关
- **钩子函数**：支持自定义处理逻辑

### 4. 兼容性设计
- **多环境支持**：UMD 模块规范
- **浏览器兼容**：优雅降级处理
- **TypeScript 友好**：提供完整的类型定义

## 🔄 数据流设计

```
数据产生 → 数据收集 → 数据处理 → 数据上报
    ↓          ↓          ↓          ↓
用户交互   事件监听   数据格式化   批量发送
系统错误   错误捕获   采样过滤   错误重试
性能指标   性能API   指标计算   优先级控制
```

## 📊 配置系统

SDK 提供灵活的配置系统：

```javascript
const DEFAULT_CONFIG = {
    reportUrl: "http://localhost:3000/api/monitor/report",
    appId: "",
    monitorErrors: true,
    monitorPerformance: true,
    monitorBehavior: false,
    sampleRate: 1.0,
    ignoreErrors: [],
    maxBatchSize: 10,
    reportInterval: 10000,
    enableSourceMap: false,
    userBehavior: {
        click: true,
        pageView: true,
        formSubmit: true,
    },
};
```

## 🚀 使用示例

```javascript
// 初始化监控
window.Monitor.init({
    appId: 'your-app-id',
    reportUrl: 'https://api.example.com/monitor',
    monitorErrors: true,
    monitorPerformance: true,
    sampleRate: 0.5
});

// 手动上报自定义数据
window.Monitor.reportBehavior('custom_event', {
    category: 'user_action',
    label: 'button_click'
});

// 销毁监控（SPA 应用路由切换时）
window.Monitor.destroy();
```

## 🔧 开发指南

### 构建命令
```bash
# 开发版本
npm run build:monitor

# 生产版本（压缩）
npm run build:monitor:min
```

### 代码规范
- 使用 ESLint + Prettier 保证代码质量
- 遵循 JavaScript Standard Style
- 添加详细的 JSDoc 注释

## 📈 性能考虑

1. **SDK 大小**：压缩后约 8KB
2. **内存占用**：队列机制控制内存使用
3. **CPU 影响**：事件监听使用 passive 模式
4. **网络影响**：批量上报减少请求次数

## 🔮 未来规划

- [ ] 支持更多的性能指标（FCP、TTI等）
- [ ] 集成异常检测算法
- [ ] 支持实时数据流分析
- [ ] 提供可视化配置界面

---

**版本**: 1.0.0  
**最后更新**: 2024年12月  
**维护者**: 前端监控团队