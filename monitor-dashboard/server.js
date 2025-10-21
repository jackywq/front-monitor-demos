const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "monitor-data.json");

// 中间件配置
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(__dirname));

// 确保数据目录存在
/**
 * 确保数据目录存在，如果不存在则创建
 * 该函数使用异步操作检查目录是否存在，如果不存在则递归创建目录
 * @returns {Promise<void>} 无返回值的Promise
 */
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE); // 获取数据文件的目录路径
  try {
    await fs.access(dataDir); // 尝试访问目录，如果存在则继续执行
  } catch {
    // 如果目录不存在，则创建目录（recursive: true 表示递归创建多级目录）
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// 读取监控数据
async function readMonitorData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // 如果文件不存在，返回默认数据结构
    return {
      errors: [],
      performance: [],
      behaviors: [],
      users: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

// 写入监控数据
async function writeMonitorData(data) {
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// 数据接收接口 - 接收前端监控SDK上报的数据
app.post("/api/monitor/report", async (req, res) => {
  try {
    const reportData = req.body;
    const monitorData = await readMonitorData();

    // 处理不同类型的数据
    if (reportData.type === "error") {
      monitorData.errors.push({
        ...reportData,
        timestamp: new Date().toISOString(),
        id: generateId(),
      });

      // 保持错误数据不超过1000条
      if (monitorData.errors.length > 1000) {
        monitorData.errors = monitorData.errors.slice(-1000);
      }
    } else if (reportData.type === "performance") {
      monitorData.performance.push({
        ...reportData,
        timestamp: new Date().toISOString(),
        id: generateId(),
      });
    } else if (reportData.type === "behavior") {
      monitorData.behaviors.push({
        ...reportData,
        timestamp: new Date().toISOString(),
        id: generateId(),
      });
    } else if (reportData.type === "user") {
      // 用户访问统计
      const existingUser = monitorData.users.find(
        (u) => u.sessionId === reportData.sessionId
      );
      if (!existingUser) {
        monitorData.users.push({
          ...reportData,
          timestamp: new Date().toISOString(),
          id: generateId(),
        });
      }
    }

    await writeMonitorData(monitorData);

    res.json({
      success: true,
      message: "数据上报成功",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("数据上报错误:", error);
    res.status(500).json({
      success: false,
      message: "数据上报失败",
      error: error.message,
    });
  }
});

// 获取统计数据接口
app.get("/api/monitor/stats", async (req, res) => {
  try {
    const { range = "24h" } = req.query;
    const monitorData = await readMonitorData();

    const now = new Date();
    const timeRange = getTimeRange(range);

    // 过滤指定时间范围内的数据
    const filteredErrors = monitorData.errors.filter(
      (error) => new Date(error.timestamp) >= timeRange
    );

    const filteredPerformance = monitorData.performance.filter(
      (perf) => new Date(perf.timestamp) >= timeRange
    );

    const filteredBehaviors = monitorData.behaviors.filter(
      (behavior) => new Date(behavior.timestamp) >= timeRange
    );

    const filteredUsers = monitorData.users.filter(
      (user) => new Date(user.timestamp) >= timeRange
    );

    // 计算统计数据
    const stats = {
      // 错误统计
      totalErrors: filteredErrors.length,
      errorTypes: getErrorTypeDistribution(filteredErrors),
      errorTrend: getErrorTrend(filteredErrors, range),

      // 性能统计
      performanceMetrics: getPerformanceMetrics(filteredPerformance),
      performanceDistribution: getPerformanceDistribution(filteredPerformance),

      // 用户行为统计
      userBehaviors: getUserBehaviorStats(filteredBehaviors),
      totalUsers: new Set(filteredUsers.map((u) => u.sessionId)).size,

      // 成功率统计
      successRate: calculateSuccessRate(filteredErrors, filteredBehaviors),

      // 时间范围信息
      timeRange: {
        range,
        start: timeRange.toISOString(),
        end: now.toISOString(),
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("获取统计数据错误:", error);
    res.status(500).json({
      success: false,
      message: "获取统计数据失败",
      error: error.message,
    });
  }
});

// 获取错误详情接口
app.get("/api/monitor/errors", async (req, res) => {
  try {
    const { limit = 50, type } = req.query;
    const monitorData = await readMonitorData();

    let errors = monitorData.errors
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    if (type) {
      errors = errors.filter((error) => error.errorType === type);
    }

    res.json({
      success: true,
      data: errors,
    });
  } catch (error) {
    console.error("获取错误详情错误:", error);
    res.status(500).json({
      success: false,
      message: "获取错误详情失败",
      error: error.message,
    });
  }
});

// 获取性能详情接口
app.get("/api/monitor/performance", async (req, res) => {
  try {
    const monitorData = await readMonitorData();
    const recentPerformance = monitorData.performance
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 100);

    res.json({
      success: true,
      data: recentPerformance,
    });
  } catch (error) {
    console.error("获取性能详情错误:", error);
    res.status(500).json({
      success: false,
      message: "获取性能详情失败",
      error: error.message,
    });
  }
});

// 健康检查接口
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "前端监控数据服务器",
  });
});

// 工具函数
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getTimeRange(range) {
  const now = new Date();
  switch (range) {
    case "1h":
      return new Date(now.getTime() - 60 * 60 * 1000);
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

function getErrorTypeDistribution(errors) {
  const distribution = {};
  errors.forEach((error) => {
    const type = error.errorType || "unknown";
    distribution[type] = (distribution[type] || 0) + 1;
  });
  return distribution;
}

function getErrorTrend(errors, range) {
  const now = new Date();
  let intervals;

  switch (range) {
    case "1h":
      intervals = 12; // 5分钟间隔
      break;
    case "24h":
      intervals = 24; // 1小时间隔
      break;
    case "7d":
      intervals = 7; // 1天间隔
      break;
    case "30d":
      intervals = 30; // 1天间隔
      break;
    default:
      intervals = 24;
  }

  const trend = [];
  const intervalMs =
    (now.getTime() - getTimeRange(range).getTime()) / intervals;

  for (let i = 0; i < intervals; i++) {
    const startTime = new Date(now.getTime() - (intervals - i) * intervalMs);
    const endTime = new Date(now.getTime() - (intervals - i - 1) * intervalMs);

    const count = errors.filter((error) => {
      const errorTime = new Date(error.timestamp);
      return errorTime >= startTime && errorTime < endTime;
    }).length;

    trend.push({
      time: formatTimeLabel(startTime, range),
      count,
    });
  }

  return trend;
}

function formatTimeLabel(date, range) {
  switch (range) {
    case "1h":
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "24h":
      return date.toLocaleTimeString("zh-CN", { hour: "2-digit" });
    default:
      return date.toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
      });
  }
}

function getPerformanceMetrics(performanceData) {
  if (performanceData.length === 0) {
    return {
      pageLoad: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
    };
  }

  const metrics = {};
  const metricTypes = [
    "pageLoad",
    "firstContentfulPaint",
    "largestContentfulPaint",
    "firstInputDelay",
    "cumulativeLayoutShift",
  ];

  metricTypes.forEach((type) => {
    const values = performanceData
      .filter((p) => p.metrics && p.metrics[type])
      .map((p) => p.metrics[type]);

    if (values.length > 0) {
      metrics[type] = values.reduce((sum, val) => sum + val, 0) / values.length;
    } else {
      metrics[type] = 0;
    }
  });

  return metrics;
}

function getPerformanceDistribution(performanceData) {
  // 简单的性能分布统计
  return {
    excellent: performanceData.filter(
      (p) => p.metrics && p.metrics.pageLoad < 1000
    ).length,
    good: performanceData.filter(
      (p) =>
        p.metrics && p.metrics.pageLoad >= 1000 && p.metrics.pageLoad < 3000
    ).length,
    poor: performanceData.filter((p) => p.metrics && p.metrics.pageLoad >= 3000)
      .length,
  };
}

function getUserBehaviorStats(behaviors) {
  const stats = {};
  behaviors.forEach((behavior) => {
    const type = behavior.actionType || "unknown";
    stats[type] = (stats[type] || 0) + 1;
  });
  return stats;
}

function calculateSuccessRate(errors, behaviors) {
  const totalRequests = behaviors.filter(
    (b) => b.actionType === "api_request"
  ).length;
  const errorRequests = errors.filter(
    (e) => e.errorType === "api_error"
  ).length;

  if (totalRequests === 0) return 100;

  return (
    Math.round(((totalRequests - errorRequests) / totalRequests) * 100 * 100) /
    100
  );
}

// 启动服务器
async function startServer() {
  await ensureDataDirectory();

  app.listen(PORT, () => {
    console.log(`🚀 前端监控数据服务器已启动`);
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`📊 数据接收接口: http://localhost:${PORT}/api/monitor/report`);
    console.log(`📈 统计查询接口: http://localhost:${PORT}/api/monitor/stats`);
    console.log(`📁 数据存储位置: ${DATA_FILE}`);
  });
}

// 优雅关闭
process.on("SIGINT", async () => {
  console.log("\n🛑 正在关闭服务器...");
  process.exit(0);
});

startServer().catch((error) => {
  console.error("❌ 服务器启动失败:", error);
  process.exit(1);
});
