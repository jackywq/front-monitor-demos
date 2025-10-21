# 前端监控可视化大盘

这是一个完整的前端监控数据可视化系统，包含数据接收服务器和可视化展示界面。

## 系统架构

```
前端应用
    ↓ (监控数据上报)
监控数据服务器 (Node.js + Express)
    ↓ (数据存储和API提供)
可视化大盘 (HTML + ECharts)
```

## 功能特性

### 📊 数据可视化
- **实时错误监控**: JavaScript错误、Promise异常、资源加载错误、API错误
- **性能指标展示**: 页面加载时间、首次内容渲染、用户交互延迟等
- **用户行为分析**: 页面浏览、按钮点击、表单提交等行为统计
- **趋势图表**: 错误趋势、性能变化、用户访问量等时间序列数据

### 🔧 技术特性
- **实时数据更新**: 支持自动刷新和手动刷新
- **多时间范围**: 支持1小时、24小时、7天、30天数据查看
- **响应式设计**: 适配桌面和移动设备
- **数据持久化**: 本地JSON文件存储监控数据

## 快速开始

### 1. 安装依赖

```bash
cd dashboard
npm install
```

### 2. 启动数据服务器

```bash
npm start
```

服务器将在 http://localhost:3000 启动

### 3. 访问可视化大盘

打开浏览器访问: http://localhost:3000

### 4. 集成监控SDK

在你的前端应用中引入监控SDK并配置上报地址:

```javascript
// 引入监控SDK
<script src="../monitor/monitor-sdk.js"></script>

// 初始化配置
window.monitor.init({
    appId: 'your-app-id',
    reportUrl: 'http://localhost:3000/api/monitor/report',
    samplingRate: 1,
    reportInterval: 10000
});
```

## API接口

### 数据上报接口

**POST** `/api/monitor/report`

接收前端监控SDK上报的数据

```javascript
// 请求示例
{
    "type": "error", // error | performance | behavior | user
    "appId": "your-app-id",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "data": {
        // 具体监控数据
    }
}
```

### 数据查询接口

**GET** `/api/monitor/stats?range=24h`

获取统计数据

查询参数:
- `range`: 时间范围 (1h, 24h, 7d, 30d)

**GET** `/api/monitor/errors?limit=50&type=js_error`

获取错误详情

查询参数:
- `limit`: 返回数量限制
- `type`: 错误类型过滤

**GET** `/api/monitor/performance`

获取性能数据详情

### 健康检查接口

**GET** `/api/health`

返回服务器状态信息

## 目录结构

```
dashboard/
├── index.html          # 可视化大盘界面
├── server.js           # 数据服务器
├── package.json        # 项目配置
├── data/               # 数据存储目录
│   └── monitor-data.json  # 监控数据文件
└── integration-example.html  # 集成示例页面
```

## 配置说明

### 服务器配置

在 `server.js` 中可以修改以下配置:

```javascript
const PORT = process.env.PORT || 3000;  // 服务器端口
const DATA_FILE = path.join(__dirname, 'data', 'monitor-data.json');  // 数据文件路径
```

### 环境变量

支持以下环境变量:
- `PORT`: 服务器端口 (默认: 3000)
- `NODE_ENV`: 运行环境 (development/production)

## 开发指南

### 开发模式

```bash
npm run dev  # 使用nodemon自动重启
```

### 添加新的图表类型

1. 在 `index.html` 中添加新的图表容器
2. 在 JavaScript 中添加对应的渲染函数
3. 更新数据生成逻辑

### 自定义样式

修改 `index.html` 中的 CSS 样式来自定义界面外观。

## 部署说明

### 生产环境部署

1. 设置环境变量:
```bash
export NODE_ENV=production
export PORT=8080
```

2. 安装生产依赖:
```bash
npm install --production
```

3. 使用进程管理器 (如 PM2):
```bash
npm install -g pm2
pm2 start server.js --name "frontend-monitor"
```

### Docker部署

创建 `Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

构建和运行:
```bash
docker build -t frontend-monitor .
docker run -p 3000:3000 frontend-monitor
```

## 监控数据类型

### 错误数据 (error)
```javascript
{
    type: 'error',
    errorType: 'js_error', // js_error, promise_error, resource_error, api_error
    message: '错误信息',
    stack: '错误堆栈',
    url: '发生错误的URL',
    line: 123,
    column: 45
}
```

### 性能数据 (performance)
```javascript
{
    type: 'performance',
    metrics: {
        pageLoad: 1200,
        firstContentfulPaint: 800,
        largestContentfulPaint: 1500,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1
    }
}
```

### 用户行为数据 (behavior)
```javascript
{
    type: 'behavior',
    actionType: 'click', // click, submit, navigate, view
    element: 'button#submit',
    value: '提交按钮',
    url: '当前页面URL'
}
```

### 用户数据 (user)
```javascript
{
    type: 'user',
    sessionId: 'session-123',
    userId: 'user-456',
    userAgent: '浏览器信息',
    url: '访问页面'
}
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用端口的进程
   lsof -i :3000
   # 或者使用其他端口
   PORT=3001 npm start
   ```

2. **数据文件权限问题**
   ```bash
   # 确保data目录有写权限
   chmod 755 data/
   ```

3. **CORS错误**
   - 检查前端应用的域名是否被服务器CORS配置允许
   - 修改server.js中的cors配置

### 日志查看

服务器日志会输出到控制台，包含:
- 启动信息
- API请求日志
- 错误信息

## 性能优化

### 数据存储优化
- 定期清理历史数据
- 使用数据库替代文件存储（大量数据时）
- 实现数据分页查询

### 界面优化
- 图表数据懒加载
- 使用Web Workers处理大数据
- 实现图表缓存机制

## 安全考虑

1. **API安全**
   - 实现请求频率限制
   - 添加API密钥验证
   - 验证上报数据的格式

2. **数据安全**
   - 敏感信息脱敏处理
   - 实现数据备份机制
   - 定期清理过期数据

## 扩展开发

### 添加新的数据源

1. 修改数据接收接口支持新的数据类型
2. 更新数据存储结构
3. 添加对应的可视化图表

### 集成第三方服务

- 集成Slack/DingTalk告警
- 连接数据分析平台
- 导出数据到BI工具

## 许可证

MIT License

## 支持与反馈

如有问题或建议，请提交Issue或联系开发团队。