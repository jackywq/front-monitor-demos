# 前端监控 SDK

一个轻量级、功能全面的前端监控 SDK，支持错误监控、性能监控、用户行为监控和数据上报。

## 特性

- ✅ **错误监控**: JavaScript 运行时错误、Promise 异常、资源加载错误、接口请求错误
- ✅ **性能监控**: 页面加载性能、资源加载耗时、Web Vitals 指标
- ✅ **用户行为监控**: 点击事件、页面浏览、表单提交
- ✅ **灵活上报**: 即时上报、批量上报、失败重试
- ✅ **配置化**: 可配置监控开关、采样率、忽略规则
- ✅ **兼容性**: 支持主流浏览器，ES5+ 环境
- ✅ **轻量化**: 压缩后约 8KB

## 快速开始

### 1. 引入 SDK

#### 方式一: Script 标签引入
```html
<script src="./monitor-sdk.js"></script>
<script>
    // 初始化监控
    Monitor.init({
        reportUrl: 'https://your-api.com/report',
        appId: 'your-app-id',
        monitorErrors: true,
        monitorPerformance: true,
        monitorBehavior: false,
        sampleRate: 1.0
    });
</script>
```

#### 方式二: ES6 Module
```javascript
import Monitor from './monitor-sdk.js';

Monitor.init({
    reportUrl: 'https://your-api.com/report',
    appId: 'your-app-id',
    // ... 其他配置
});
```

### 2. 基础使用

```javascript
// 初始化监控
Monitor.init({
    reportUrl: 'https://your-api.com/report',
    appId: 'your-app-id',
    monitorErrors: true,
    monitorPerformance: true,
    monitorBehavior: true
});

// 手动上报错误
try {
    // 你的业务代码
} catch (error) {
    Monitor.reportError(error, {
        customField: 'custom value'
    });
}

// 手动上报性能数据
Monitor.reportPerformance({
    customMetric: 123
});

// 手动上报用户行为
Monitor.reportBehavior('custom_action', {
    action: 'button_click',
    element: 'submit_button'
});

// 立即上报所有数据
Monitor.flush();

// 销毁监控（页面卸载时自动调用）
// Monitor.destroy();
```

## 配置参数

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `reportUrl` | string | '' | **必填** 数据上报地址 |
| `appId` | string | '' | 应用标识 |
| `monitorErrors` | boolean | true | 是否启用错误监控 |
| `monitorPerformance` | boolean | true | 是否启用性能监控 |
| `monitorBehavior` | boolean | false | 是否启用用户行为监控 |
| `sampleRate` | number | 1.0 | 采样率 (0-1) |
| `ignoreErrors` | Array | [] | 忽略的错误模式 |
| `maxBatchSize` | number | 10 | 批量上报最大数量 |
| `reportInterval` | number | 10000 | 上报间隔(ms) |
| `enableSourceMap` | boolean | false | 是否支持sourceMap |
| `userBehavior` | object | {} | 用户行为监控配置 |

### userBehavior 配置

```javascript
userBehavior: {
    click: true,        // 监控点击事件
    pageView: true,     // 监控页面浏览
    formSubmit: true    // 监控表单提交
}
```

### ignoreErrors 配置

```javascript
// 忽略特定错误
ignoreErrors: [
    'Script error',                    // 忽略跨域脚本错误
    /特定错误模式/,                   // 使用正则表达式
    'https://cdn.example.com/error'   // 忽略特定URL的错误
]
```

## API 参考

### Monitor.init(config)
初始化监控 SDK。

### Monitor.reportError(error, customData)
手动上报错误。
- `error`: Error 对象
- `customData`: 自定义数据

### Monitor.reportPerformance(metrics, customData)
手动上报性能数据。
- `metrics`: 性能指标对象
- `customData`: 自定义数据

### Monitor.reportBehavior(behaviorType, data)
手动上报用户行为。
- `behaviorType`: 行为类型
- `data`: 行为数据

### Monitor.flush()
立即上报所有待上报数据。

### Monitor.destroy()
销毁监控实例，清理所有监听器。

### Monitor.getConfig()
获取当前配置。

### Monitor.isInitialized()
检查是否已初始化。

## 监控数据类型

### 错误监控数据
```javascript
{
    type: 'js_error' | 'promise_error' | 'resource_error' | 'api_error',
    message: '错误信息',
    stack: '错误堆栈',
    filename: '文件路径',
    lineno: 行号,
    colno: 列号,
    errorType: '错误类型',
    // ... 其他字段
}
```

### 性能监控数据
```javascript
{
    type: 'performance' | 'resource_performance' | 'web_vital',
    metrics: {
        dnsLookup: DNS查询耗时,
        tcpConnect: TCP连接耗时,
        requestResponse: 请求响应耗时,
        domParse: DOM解析耗时,
        firstPaint: 白屏时间,
        fcp: 首次内容渲染时间,
        loadComplete: 页面完全加载时间
    },
    // ... 其他字段
}
```

### 用户行为数据
```javascript
{
    type: 'click' | 'page_view' | 'form_submit',
    element: '元素标签',
    text: '元素文本',
    className: 'CSS类名',
    id: '元素ID',
    x: '点击X坐标',
    y: '点击Y坐标',
    // ... 其他字段
}
```

## 浏览器兼容性

| 浏览器 | 最低版本 | 备注 |
|--------|----------|------|
| Chrome | 50+ | 完全支持 |
| Firefox | 45+ | 完全支持 |
| Safari | 10+ | 完全支持 |
| Edge | 79+ | 完全支持 |
| IE | 11 | 部分支持（需polyfill） |

## 注意事项

### 1. 跨域脚本错误处理
对于跨域脚本错误，浏览器通常只提供 "Script error" 信息。要获取完整错误信息，需要：
1. 设置脚本的 `crossorigin` 属性
2. 服务器设置正确的 CORS 头

### 2. SourceMap 支持
如需还原压缩后的错误堆栈，需要：
1. 设置 `enableSourceMap: true`
2. 在服务器端配置 SourceMap 文件

### 3. 性能监控时机
性能数据在页面 `load` 事件后采集，确保数据准确性。

### 4. 数据上报策略
- 默认使用批量上报，减少请求次数
- 页面卸载时自动上报剩余数据
- 支持失败重试机制

### 5. 隐私保护
默认不收集敏感信息，可根据需要配置过滤规则。

## 开发指南

### 构建和压缩
```bash
# 安装依赖
npm install -g uglify-js

# 压缩代码
uglifyjs monitor-sdk.js -o monitor-sdk.min.js -c -m
```

### 测试
```javascript
// 测试错误监控
throw new Error('测试错误');

// 测试性能监控
// 在页面加载完成后查看控制台输出

// 测试用户行为监控
// 点击页面元素查看上报数据
```

## 故障排除

### 常见问题

**Q: 监控未初始化？**
A: 检查 `reportUrl` 是否配置正确。

**Q: 数据未上报？**
A: 检查网络连接和上报地址是否可达。

**Q: 错误堆栈信息不全？**
A: 检查是否为跨域脚本错误，或启用 SourceMap 支持。

**Q: 性能数据不准确？**
A: 确保在页面完全加载后采集性能数据。

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持错误监控、性能监控、用户行为监控
- 支持灵活的数据上报策略

## 许可证

MIT License