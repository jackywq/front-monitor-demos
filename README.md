# 前端监控 SDK

一个完整的前端监控解决方案，包含监控核心 SDK、数据可视化面板和测试试炼场。

## 项目结构

```
前端监控 SDK/
├── monitor-core/          # 监控核心 SDK
│   └── monitor-sdk.js     # 监控 SDK 核心文件
├── monitor-dashboard/     # 监控数据面板
│   ├── server.js         # 数据接收服务器
│   ├── index.html         # 面板主页面
│   └── data/             # 监控数据存储
└── monitor-playground/    # 监控测试试炼场
    ├── src/              # React 组件源码
    ├── index.html         # 测试页面入口
    └── vite.config.js    # Vite 构建配置
```

## 核心功能模块

### 1. monitor-core - 监控核心 SDK

**功能特性：**
- ✅ **错误监控**: JavaScript 运行时错误、Promise 异常、资源加载错误、接口请求错误
- ✅ **性能监控**: 页面加载性能、资源加载耗时、Web Vitals 指标
- ✅ **用户行为监控**: 点击事件、页面浏览、表单提交
- ✅ **灵活上报**: 即时上报、批量上报、失败重试
- ✅ **配置化**: 可配置监控开关、采样率、忽略规则
- ✅ **兼容性**: 支持主流浏览器，ES5+ 环境
- ✅ **轻量化**: 压缩后约 8KB

**快速使用：**

#### 方式一: Script 标签引入
```html
<script src="./monitor-core/monitor-sdk.js"></script>
<script>
    // 初始化监控
    Monitor.init({
        reportUrl: 'http://localhost:3001/report',
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
import Monitor from './monitor-core/monitor-sdk.js';

Monitor.init({
    reportUrl: 'http://localhost:3001/report',
    appId: 'your-app-id',
    // ... 其他配置
});
```

### 2. monitor-dashboard - 监控数据面板

**功能特性：**
- 📊 **实时数据展示**: 错误统计、性能指标、用户行为分析
- 🔔 **告警通知**: 异常事件实时告警
- 📈 **趋势分析**: 数据趋势图表展示
- 🔍 **详情查看**: 错误堆栈、性能详情查看
- 💾 **数据存储**: 本地 JSON 文件存储

**启动方式：**
```bash
# 安装依赖
npm run dashboard:install

# 启动面板服务器
npm run dashboard:dev

# 访问地址: http://localhost:3001
```

### 3. monitor-playground - 监控测试试炼场

**功能特性：**
- 🧪 **功能测试**: 完整的监控功能测试页面
- ⚡ **React 技术栈**: 基于 React 18 + Vite 的现代化测试环境
- 🔧 **配置测试**: 支持不同配置场景测试
- 📱 **响应式设计**: 适配不同设备尺寸

**启动方式：**
```bash
# 安装依赖
npm run playground:install

# 启动开发服务器
npm run playground:dev

# 访问地址: http://localhost:4000
```

## 快速开始

### 1. 安装项目依赖
```bash
# 安装根目录依赖
npm install

# 安装监控面板依赖
npm run dashboard:install

# 安装测试试炼场依赖
npm run playground:install
```

### 2. 启动监控系统
```bash
# 同时启动面板和测试页面
npm start

# 或分别启动
npm run dashboard:dev    # 面板: http://localhost:3001
npm run playground:dev   # 测试: http://localhost:4000
```

### 3. 集成监控 SDK
将 `monitor-core/monitor-sdk.js` 集成到你的项目中，配置上报地址为面板服务器地址。

## 详细使用指南

### 1. 监控核心 SDK 配置

**基础配置参数：**

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

**用户行为监控配置：**
```javascript
userBehavior: {
    click: true,        // 监控点击事件
    pageView: true,     // 监控页面浏览
    formSubmit: true    // 监控表单提交
}
```

**错误忽略配置：**
```javascript
ignoreErrors: [
    'Script error',                    // 忽略跨域脚本错误
    /特定错误模式/,                   // 使用正则表达式
    'https://cdn.example.com/error'   // 忽略特定URL的错误
]
```

### 2. 监控面板使用

监控面板提供实时数据可视化功能：

- **错误统计**: 查看各类错误的发生频率和趋势
- **性能指标**: 监控页面加载性能关键指标
- **用户行为**: 分析用户交互行为模式
- **详情查看**: 点击具体数据项查看详细堆栈信息

### 3. 测试试炼场功能

测试试炼场包含完整的监控功能测试：

- **错误测试**: 触发不同类型错误验证监控效果
- **性能测试**: 测试页面性能数据采集
- **配置测试**: 验证不同配置参数的效果
- **集成测试**: 测试 SDK 与面板的集成效果

## 开发指南

### 1. 监控核心 SDK 开发

**API 参考：**

#### Monitor.init(config)
初始化监控 SDK。

#### Monitor.reportError(error, customData)
手动上报错误。
- `error`: Error 对象
- `customData`: 自定义数据

#### Monitor.reportPerformance(metrics, customData)
手动上报性能数据。
- `metrics`: 性能指标对象
- `customData`: 自定义数据

#### Monitor.reportBehavior(behaviorType, data)
手动上报用户行为。
- `behaviorType`: 行为类型
- `data`: 行为数据

#### Monitor.flush()
立即上报所有待上报数据。

#### Monitor.destroy()
销毁监控实例，清理所有监听器。

#### Monitor.getConfig()
获取当前配置。

#### Monitor.isInitialized()
检查是否已初始化。

### 2. 监控面板开发

监控面板基于 Node.js + Express 开发，支持：
- 实时数据接收和存储
- WebSocket 实时数据推送
- 数据可视化图表展示
- 错误详情查看功能

### 3. 测试试炼场开发

测试试炼场基于 React 18 + Vite 开发，提供：
- 完整的监控功能测试界面
- 响应式设计适配
- 实时状态反馈
- 配置参数动态调整

## 数据格式说明

### 1. 错误监控数据格式
```javascript
{
    type: 'js_error' | 'promise_error' | 'resource_error' | 'api_error',
    message: '错误信息',
    stack: '错误堆栈',
    filename: '文件路径',
    lineno: 行号,
    colno: 列号,
    errorType: '错误类型',
    timestamp: '时间戳',
    appId: '应用标识',
    // ... 其他字段
}
```

### 2. 性能监控数据格式
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
    timestamp: '时间戳',
    url: '页面URL',
    // ... 其他字段
}
```

### 3. 用户行为数据格式
```javascript
{
    type: 'click' | 'page_view' | 'form_submit',
    element: '元素标签',
    text: '元素文本',
    className: 'CSS类名',
    id: '元素ID',
    x: '点击X坐标',
    y: '点击Y坐标',
    timestamp: '时间戳',
    pageUrl: '页面URL',
    // ... 其他字段
}
```

## 技术规格

### 浏览器兼容性

| 浏览器 | 最低版本 | 备注 |
|--------|----------|------|
| Chrome | 50+ | 完全支持 |
| Firefox | 45+ | 完全支持 |
| Safari | 10+ | 完全支持 |
| Edge | 79+ | 完全支持 |
| IE | 11 | 部分支持（需polyfill） |

### 性能指标

- **SDK 大小**: 压缩后约 8KB
- **内存占用**: 轻量级设计，内存占用低
- **上报延迟**: 支持批量上报，减少网络请求
- **数据精度**: 毫秒级时间戳精度

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

## 构建和部署

### 1. 监控核心 SDK 构建
```bash
# 压缩 SDK 代码
npm run build:monitor-sdk

# 输出文件: monitor-core/monitor-sdk.min.js
```

### 2. 监控面板部署
```bash
# 安装依赖
npm run dashboard:install

# 启动生产服务器
npm run dashboard:start

# 访问地址: http://localhost:3001
```

### 3. 测试试炼场构建
```bash
# 构建生产版本
npm run playground:build

# 预览构建结果
npm run playground:preview

# 输出目录: monitor-playground/dist/
```

## 测试指南

### 1. 使用测试试炼场
访问 `http://localhost:4000` 进行完整的功能测试：

- **错误测试**: 点击"触发错误"按钮测试错误监控
- **性能测试**: 查看页面性能指标采集
- **配置测试**: 动态调整配置参数验证效果

### 2. 集成测试
将 SDK 集成到你的项目中，配置上报地址为面板服务器地址，验证数据接收和展示效果。
