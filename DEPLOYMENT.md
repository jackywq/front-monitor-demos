# 部署指南和最佳实践

## 快速部署

### 1. 直接引入（推荐）

将压缩后的 SDK 文件上传到你的 CDN 或静态资源服务器：

```html
<!-- 生产环境使用压缩版本 -->
<script src="https://cdn.yourdomain.com/monitor-sdk.min.js"></script>
<script>
    Monitor.init({
        reportUrl: 'https://your-api.com/report',
        appId: 'your-app-id',
        monitorErrors: true,
        monitorPerformance: true,
        sampleRate: 0.1 // 生产环境建议使用较低的采样率
    });
</script>
```

### 2. NPM 包方式（如果需要）

虽然 SDK 设计为不依赖第三方库，但你可以将其打包为 NPM 包：

```bash
# 发布到私有 NPM 仓库
npm publish

# 在项目中安装
npm install @your-company/frontend-monitor-sdk
```

```javascript
import Monitor from '@your-company/frontend-monitor-sdk';

Monitor.init({
    // 配置参数
});
```

## 服务器端配置

### 1. 数据接收接口

你的服务器需要提供一个接收监控数据的接口：

```javascript
// Node.js Express 示例
app.post('/report', (req, res) => {
    try {
        const reportData = req.body;
        
        // 验证数据格式
        if (!reportData.appId || !reportData.data) {
            return res.status(400).json({ error: 'Invalid data format' });
        }
        
        // 数据存储（到数据库或日志文件）
        saveToDatabase(reportData);
        
        // 返回成功响应
        res.status(200).json({ success: true });
        
    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 数据存储函数
async function saveToDatabase(data) {
    // 存储到数据库（MongoDB、MySQL等）
    // 或写入日志文件
    console.log('Received monitor data:', JSON.stringify(data, null, 2));
}
```

### 2. CORS 配置

如果 SDK 和服务器不同域，需要配置 CORS：

```javascript
// Express CORS 配置
const cors = require('cors');

app.use(cors({
    origin: ['https://your-domain.com', 'https://app.your-domain.com'],
    methods: ['POST', 'GET'],
    credentials: true
}));
```

### 3. 数据安全

- 验证请求来源
- 限制请求频率
- 数据加密传输（HTTPS）
- 敏感信息过滤

## 最佳实践

### 1. 配置优化

#### 生产环境配置
```javascript
Monitor.init({
    reportUrl: 'https://api.yourdomain.com/monitor/report',
    appId: 'production-app-v1.0',
    monitorErrors: true,
    monitorPerformance: true,
    monitorBehavior: false, // 生产环境谨慎开启用户行为监控
    sampleRate: 0.1, // 10% 采样率
    maxBatchSize: 20,
    reportInterval: 30000, // 30秒上报一次
    ignoreErrors: [
        'Script error', // 忽略跨域错误
        /Chrome extensions/, // 忽略浏览器插件错误
        'ResizeObserver' // 忽略特定库的错误
    ]
});
```

#### 开发环境配置
```javascript
if (process.env.NODE_ENV === 'development') {
    Monitor.init({
        reportUrl: 'https://dev-api.yourdomain.com/report',
        appId: 'dev-app',
        monitorErrors: true,
        monitorPerformance: true,
        monitorBehavior: true,
        sampleRate: 1.0, // 开发环境100%采样
        ignoreErrors: [] // 开发环境不忽略任何错误
    });
}
```

### 2. 错误处理策略

#### 自定义错误上报
```javascript
// 在全局错误处理中上报
window.addEventListener('error', (event) => {
    // SDK 会自动处理，这里可以添加额外逻辑
    console.error('Global error captured:', event.error);
});

// 在 Promise 链中上报
Promise.prototype.catchWithReport = function(customData = {}) {
    return this.catch(error => {
        Monitor.reportError(error, customData);
        throw error; // 重新抛出错误
    });
};

// 使用示例
api.getUserData()
    .catchWithReport({ api: 'getUserData', userId: '123' })
    .then(data => {
        // 处理数据
    });
```

#### 错误分类处理
```javascript
// 根据错误类型采取不同策略
function handleError(error, context = {}) {
    const errorType = error.constructor.name;
    
    switch (errorType) {
        case 'NetworkError':
            // 网络错误：重试机制
            break;
        case 'ValidationError':
            // 验证错误：用户提示
            break;
        case 'BusinessError':
            // 业务错误：特殊处理
            break;
        default:
            // 其他错误：上报监控
            Monitor.reportError(error, context);
    }
}
```

### 3. 性能监控优化

#### 关键性能指标监控
```javascript
// 监控关键业务操作性能
function monitorBusinessOperation(operationName, operation) {
    const startTime = performance.now();
    
    return operation()
        .then(result => {
            const duration = performance.now() - startTime;
            
            Monitor.reportPerformance({
                [operationName]: duration
            }, {
                operation: operationName,
                success: true
            });
            
            return result;
        })
        .catch(error => {
            const duration = performance.now() - startTime;
            
            Monitor.reportPerformance({
                [operationName]: duration
            }, {
                operation: operationName,
                success: false,
                error: error.message
            });
            
            throw error;
        });
}

// 使用示例
monitorBusinessOperation('userLogin', () => api.login(credentials));
```

#### 资源加载监控
```javascript
// 监控关键资源加载
function monitorResourceLoad(url, resourceType) {
    const startTime = performance.now();
    
    return fetch(url)
        .then(response => {
            const duration = performance.now() - startTime;
            
            Monitor.reportPerformance({
                resourceLoad: duration,
                resourceType: resourceType,
                size: response.headers.get('content-length')
            });
            
            return response;
        });
}
```

### 4. 用户行为监控策略

#### 关键行为监控
```javascript
// 监控关键用户行为
function trackUserAction(action, data) {
    Monitor.reportBehavior(action, {
        ...data,
        userId: getCurrentUserId(),
        timestamp: Date.now(),
        page: window.location.pathname
    });
}

// 使用示例
document.getElementById('purchase-btn').addEventListener('click', () => {
    trackUserAction('purchase_click', {
        productId: '123',
        price: 99.99
    });
});
```

#### 页面停留时间
```javascript
// 监控页面停留时间
let pageEnterTime = Date.now();

window.addEventListener('beforeunload', () => {
    const stayDuration = Date.now() - pageEnterTime;
    
    Monitor.reportBehavior('page_stay', {
        duration: stayDuration,
        page: window.location.pathname
    });
});
```

### 5. 数据分析和可视化

#### 数据存储建议
- **时序数据库**: 用于存储时间序列数据（如性能指标）
- **文档数据库**: 用于存储错误日志和用户行为数据
- **数据仓库**: 用于复杂分析和报表生成

#### 监控看板指标
- 错误率趋势
- 页面加载时间分布
- 用户行为漏斗
- 关键业务操作成功率

## 故障排除

### 常见问题

#### Q: 数据没有上报？
A: 检查以下配置：
1. `reportUrl` 是否正确
2. 网络连接是否正常
3. 服务器接口是否可访问
4. CORS 配置是否正确

#### Q: 错误堆栈信息不全？
A: 
1. 检查是否为跨域脚本错误
2. 确认 SourceMap 配置正确
3. 验证错误捕获时机

#### Q: 性能数据不准确？
A:
1. 确保在页面完全加载后采集数据
2. 验证浏览器对 Performance API 的支持
3. 检查数据采集的时间点

#### Q: 用户行为数据过多？
A:
1. 调整采样率 `sampleRate`
2. 配置忽略规则 `ignoreErrors`
3. 优化用户行为监控范围

### 调试模式

```javascript
// 开启调试模式
localStorage.setItem('monitor_debug', 'true');

// SDK 内部调试逻辑
if (localStorage.getItem('monitor_debug') === 'true') {
    console.log('Monitor Debug:', data);
}
```

## 性能优化建议

### 1. SDK 加载优化
- 使用异步加载
- 延迟非关键监控初始化
- 压缩和缓存 SDK 文件

### 2. 数据上报优化
- 批量上报减少请求次数
- 使用 sendBeacon 确保页面卸载时数据不丢失
- 合理设置上报频率和批量大小

### 3. 内存使用优化
- 及时清理不再需要的数据
- 避免内存泄漏
- 监控 SDK 自身的内存使用

## 安全考虑

### 1. 数据安全
- 敏感信息过滤
- 数据传输加密
- 访问权限控制

### 2. 隐私保护
- 遵守 GDPR、CCPA 等隐私法规
- 提供用户选择退出机制
- 匿名化处理用户数据

### 3. 防篡改
- 数据签名验证
- 请求来源验证
- 频率限制和防刷机制

## 扩展开发

### 1. 自定义插件
```javascript
// 错误上报前处理插件
Monitor.addPlugin('errorFilter', (errorData) => {
    // 过滤敏感信息
    delete errorData.stack; // 生产环境隐藏堆栈
    return errorData;
});

// 性能数据增强插件
Monitor.addPlugin('performanceEnhance', (perfData) => {
    perfData.userAgent = navigator.userAgent;
    perfData.screenSize = `${screen.width}x${screen.height}`;
    return perfData;
});
```

### 2. 自定义上报器
```javascript
// 自定义数据上报器
class CustomReporter {
    report(data) {
        // 发送到多个端点
        this.sendToAnalytics(data);
        this.sendToLogs(data);
        this.sendToAlertSystem(data);
    }
    
    sendToAnalytics(data) {
        // 发送到数据分析平台
    }
    
    sendToLogs(data) {
        // 发送到日志系统
    }
    
    sendToAlertSystem(data) {
        // 发送到告警系统
    }
}

Monitor.setReporter(new CustomReporter());
```

这个部署指南涵盖了从基础部署到高级优化的完整流程，帮助你更好地在生产环境中使用前端监控 SDK。