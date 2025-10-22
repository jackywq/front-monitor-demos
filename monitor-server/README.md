# 前端监控数据接收服务器

这是一个用于接收前端监控SDK上报数据的Node.js服务器。

## 功能特性

- ✅ 接收前端监控数据（错误、性能、用户行为）
- ✅ 数据持久化存储到本地JSON文件
- ✅ 实时数据统计和状态监控
- ✅ RESTful API接口设计
- ✅ 支持跨域请求（CORS）
- ✅ 数据格式验证和错误处理

## 项目结构

```
monitor-server/
├── README.md           # 项目说明文档
├── package.json        # 项目依赖配置
├── server.js           # 服务器主文件
└── data/               # 数据存储目录
    ├── errors.json     # 错误数据存储
    ├── performance.json # 性能数据存储
    ├── behavior.json   # 用户行为数据存储
    └── stats.json      # 统计数据存储
```

## 安装和运行

### 1. 安装依赖

```bash
cd monitor-server
npm install
```

### 2. 启动服务器

```bash
# 开发模式启动
npm start

# 或者直接运行
node server.js
```

服务器默认运行在 `http://localhost:3001`

## API接口

### 数据上报接口

**POST** `/api/report`

接收前端监控SDK上报的数据。

**请求体示例：**
```json
{
  "appId": "your-app-id",
  "type": "behavior",
  "behaviorType": "click",
  "pageUrl": "/home",
  "timestamp": 1640995200000
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "Data received successfully",
  "receivedCount": 1
}
```

### 数据查询接口

**GET** `/api/data/:type`

查询指定类型的数据。

**参数：**
- `type`: 数据类型（`errors`、`performance`、`behavior`）

**响应示例：**
```json
{
  "success": true,
  "data": [...],
  "total": 150
}
```

### 统计数据接口

**GET** `/api/stats`

获取数据统计信息。

**响应示例：**
```json
{
  "success": true,
  "stats": {
    "errors": 45,
    "performance": 78,
    "behavior": 27,
    "total": 150,
    "lastUpdated": "2024-01-01T12:00:00.000Z"
  }
}
```

## 数据格式

### 错误数据格式
```json
{
  "type": "error",
  "appId": "your-app-id",
  "errorType": "js",
  "message": "TypeError: Cannot read property 'name' of undefined",
  "stack": "at Function.<anonymous> (app.js:15:25)",
  "pageUrl": "/dashboard",
  "userAgent": "Mozilla/5.0...",
  "timestamp": 1640995200000
}
```

### 性能数据格式
```json
{
  "type": "performance",
  "appId": "your-app-id",
  "metric": "load",
  "value": 2450,
  "pageUrl": "/home",
  "timestamp": 1640995200000
}
```

### 用户行为数据格式
```json
{
  "type": "behavior",
  "appId": "your-app-id",
  "behaviorType": "click",
  "pageUrl": "/products",
  "element": "buy-button",
  "timestamp": 1640995200000
}
```

## 配置说明

### 端口配置
服务器默认使用端口3001。如需修改端口，可以在启动时设置环境变量：

```bash
PORT=4000 node server.js
```

### 数据存储
数据默认存储在 `data/` 目录下的JSON文件中：
- `errors.json`: 错误数据
- `performance.json`: 性能数据  
- `behavior.json`: 用户行为数据
- `stats.json`: 统计数据

## 开发说明

### 项目依赖
- **express**: Web框架
- **cors**: 跨域请求支持
- **body-parser**: 请求体解析

### 开发脚本
```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 检查端口占用
lsof -i :3001
```

## 相关项目

- [monitor-core](../monitor-core/) - 前端监控SDK核心库
- [monitor-playground](../monitor-playground/) - 监控功能演示和测试平台
- [monitor-dashboard](../monitor-dashboard/) - 监控数据可视化面板

## 故障排除

### 端口被占用
如果3001端口被占用，可以：
1. 停止占用端口的进程：`kill -9 $(lsof -ti:3001)`
2. 或使用其他端口：`PORT=4000 npm start`

### 数据文件权限问题
确保 `data/` 目录有写入权限：
```bash
chmod 755 data/
```

## 许可证

MIT License