const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// 数据存储目录
const DATA_DIR = path.join(__dirname, "data");
const ERRORS_FILE = path.join(DATA_DIR, "errors.json");
const PERFORMANCE_FILE = path.join(DATA_DIR, "performance.json");
const BEHAVIOR_FILE = path.join(DATA_DIR, "behavior.json");
const STATS_FILE = path.join(DATA_DIR, "stats.json");

// 确保数据目录存在
fs.ensureDirSync(DATA_DIR);

// 初始化数据文件
const initDataFile = (filePath, defaultData = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeJsonSync(filePath, defaultData);
  }
};

initDataFile(ERRORS_FILE, []);
initDataFile(PERFORMANCE_FILE, []);
initDataFile(BEHAVIOR_FILE, []);
initDataFile(STATS_FILE, {
  totalErrors: 0,
  totalPerformance: 0,
  totalBehavior: 0,
});

// 中间件
app.use(
  cors({
    origin: [
      "http://localhost:4000",
      "http://localhost:4001",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// 数据接收接口
app.post("/api/report", (req, res) => {
  try {
    const { appId, pageUrl, userAgent, data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
      });
    }

    console.log(`收到 ${data.length} 条监控数据`);

    // 处理每条数据
    data.forEach((item) => {
      const enrichedData = {
        ...item,
        appId,
        pageUrl,
        userAgent,
        timestamp: item.timestamp || new Date().toLocaleString(),
        id: `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      switch (item.type) {
        case "js_error":
        case "promise_error":
        case "resource_error":
        case "api_error":
          saveError(enrichedData);
          break;
        case "performance":
          savePerformance(enrichedData);
          break;
        case "behavior":
        case "custom_behavior":
          saveBehavior(enrichedData);
          break;
        default:
          console.log("未知数据类型:", item.type);
      }
    });

    res.json({
      success: true,
      message: "Data received successfully",
      receivedCount: data.length,
    });
  } catch (error) {
    console.error("数据接收错误:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// 保存错误数据
function saveError(errorData) {
  try {
    const errors = fs.readJsonSync(ERRORS_FILE);
    errors.push(errorData);
    fs.writeJsonSync(ERRORS_FILE, errors);

    // 更新统计
    updateStats("totalErrors");
    console.log("保存错误数据:", errorData.type);
  } catch (error) {
    console.error("保存错误数据失败:", error);
  }
}

// 保存性能数据
function savePerformance(performanceData) {
  try {
    const performances = fs.readJsonSync(PERFORMANCE_FILE);
    performances.push(performanceData);
    fs.writeJsonSync(PERFORMANCE_FILE, performances);

    // 更新统计
    updateStats("totalPerformance");
    console.log("保存性能数据");
  } catch (error) {
    console.error("保存性能数据失败:", error);
  }
}

// 保存行为数据
function saveBehavior(behaviorData) {
  try {
    const behaviors = fs.readJsonSync(BEHAVIOR_FILE);
    behaviors.push(behaviorData);
    fs.writeJsonSync(BEHAVIOR_FILE, behaviors);

    // 更新统计
    updateStats("totalBehavior");
    console.log("保存行为数据:", behaviorData.behaviorType);
  } catch (error) {
    console.error("保存行为数据失败:", error);
  }
}

// 更新统计数据
function updateStats(field) {
  try {
    const stats = fs.readJsonSync(STATS_FILE);
    stats[field] = (stats[field] || 0) + 1;
    stats.lastUpdate = new Date().toLocaleString();
    fs.writeJsonSync(STATS_FILE, stats);
  } catch (error) {
    console.error("更新统计数据失败:", error);
  }
}

// 获取统计数据的接口
app.get("/api/stats", (req, res) => {
  try {
    const stats = fs.readJsonSync(STATS_FILE);
    const errors = fs.readJsonSync(ERRORS_FILE);
    const performances = fs.readJsonSync(PERFORMANCE_FILE);
    const behaviors = fs.readJsonSync(BEHAVIOR_FILE);

    // 计算最近24小时的数据
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentErrors = errors.filter((e) => new Date(e.timestamp) >= last24h);
    const recentPerformances = performances.filter(
      (p) => new Date(p.timestamp) >= last24h
    );
    const recentBehaviors = behaviors.filter(
      (b) => new Date(b.timestamp) >= last24h
    );

    // 错误类型统计
    const errorTypes = {};
    recentErrors.forEach((error) => {
      const type = error.errorType || error.type;
      errorTypes[type] = (errorTypes[type] || 0) + 1;
    });

    // 用户行为统计
    const userBehaviors = {};
    recentBehaviors.forEach((behavior) => {
      const type = behavior.behaviorType;
      userBehaviors[type] = (userBehaviors[type] || 0) + 1;
    });

    // 性能指标统计
    const performanceMetrics = {
      pageLoad: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
    };

    if (recentPerformances.length > 0) {
      recentPerformances.forEach((perf) => {
        if (perf.metrics) {
          Object.keys(performanceMetrics).forEach((key) => {
            if (perf.metrics[key]) {
              performanceMetrics[key] += perf.metrics[key];
            }
          });
        }
      });

      // 计算平均值
      Object.keys(performanceMetrics).forEach((key) => {
        performanceMetrics[key] = Math.round(
          performanceMetrics[key] / recentPerformances.length
        );
      });
    }

    // 性能分布统计
    const performanceDistribution = {
      excellent: recentPerformances.filter((p) => p.metrics?.pageLoad <= 1000)
        .length,
      good: recentPerformances.filter(
        (p) => p.metrics?.pageLoad > 1000 && p.metrics?.pageLoad <= 2500
      ).length,
      poor: recentPerformances.filter((p) => p.metrics?.pageLoad > 2500).length,
    };

    // 错误趋势数据（最近12个小时，每2小时一个点）
    const errorTrend = [];
    for (let i = 11; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);
      const nextTime = new Date(time.getTime() + 2 * 60 * 60 * 1000);
      const count = recentErrors.filter((e) => {
        const errorTime = new Date(e.timestamp);
        return errorTime >= time && errorTime < nextTime;
      }).length;

      errorTrend.push({
        time: time.toLocaleString(),
        count: count,
      });
    }

    res.json({
      totalErrors: recentErrors.length,
      totalUsers:
        recentBehaviors.length > 0
          ? Math.floor(recentBehaviors.length * 0.4)
          : 0,
      successRate:
        recentErrors.length > 0
          ? Math.max(0.9, 1 - recentErrors.length / 1000)
          : 0.98,
      errorTypes,
      errorTrend,
      performanceMetrics,
      performanceDistribution,
      userBehaviors,
      timeRange: {
        range: req.query.range || "24h",
        start: last24h.toLocaleString(),
        end: now.toLocaleString(),
      },
    });
  } catch (error) {
    console.error("获取统计数据失败:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get stats",
    });
  }
});

// 获取错误详情列表
app.get("/api/errors", (req, res) => {
  try {
    const errors = fs.readJsonSync(ERRORS_FILE);
    const limit = parseInt(req.query.limit) || 50;
    const type = req.query.type;

    let result = errors.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    if (type) {
      result = result.filter(
        (error) => (error.errorType || error.type) === type
      );
    }

    result = result.slice(0, limit);

    res.json(result);
  } catch (error) {
    console.error("获取错误列表失败:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get errors",
    });
  }
});

// 获取性能详情列表
app.get("/api/performance", (req, res) => {
  try {
    const performances = fs.readJsonSync(PERFORMANCE_FILE);
    const limit = parseInt(req.query.limit) || 50;

    const result = performances
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.json(result);
  } catch (error) {
    console.error("获取性能列表失败:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get performance data",
    });
  }
});

// 获取用户行为详情列表
app.get("/api/behaviors", (req, res) => {
  try {
    const behaviors = fs.readJsonSync(BEHAVIOR_FILE);
    const limit = parseInt(req.query.limit) || 100;
    const behaviorType = req.query.type;
    const userId = req.query.userId;
    const startTime = req.query.startTime;
    const endTime = req.query.endTime;

    let result = behaviors.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // 按行为类型筛选
    if (behaviorType) {
      result = result.filter((behavior) => behavior.behaviorType === behaviorType);
    }

    // 按用户ID筛选
    if (userId) {
      result = result.filter((behavior) => behavior.userId === userId);
    }

    // 按时间范围筛选
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      result = result.filter((behavior) => {
        const behaviorTime = new Date(behavior.timestamp);
        return behaviorTime >= start && behaviorTime <= end;
      });
    }

    result = result.slice(0, limit);

    res.json(result);
  } catch (error) {
    console.error("获取用户行为列表失败:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get behavior data",
    });
  }
});

// 获取用户行为统计（按用户和时间维度）
app.get("/api/behavior-stats", (req, res) => {
  try {
    const behaviors = fs.readJsonSync(BEHAVIOR_FILE);
    const groupBy = req.query.groupBy || "user"; // "user" 或 "time"
    const timeGranularity = req.query.timeGranularity || "hour"; // "hour", "day", "week"
    const startTime = req.query.startTime;
    const endTime = req.query.endTime;

    let filteredBehaviors = behaviors;

    // 按时间范围筛选
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      filteredBehaviors = behaviors.filter((behavior) => {
        const behaviorTime = new Date(behavior.timestamp);
        return behaviorTime >= start && behaviorTime <= end;
      });
    }

    let stats = {};

    if (groupBy === "user") {
      // 按用户统计
      filteredBehaviors.forEach((behavior) => {
        const userKey = behavior.userId || behavior.username || "匿名用户";
        if (!stats[userKey]) {
          stats[userKey] = {
            total: 0,
            behaviors: {},
            latestActivity: behavior.timestamp,
          };
        }
        
        stats[userKey].total += 1;
        const behaviorType = behavior.behaviorType;
        stats[userKey].behaviors[behaviorType] = (stats[userKey].behaviors[behaviorType] || 0) + 1;
        
        // 更新最新活动时间
        if (new Date(behavior.timestamp) > new Date(stats[userKey].latestActivity)) {
          stats[userKey].latestActivity = behavior.timestamp;
        }
      });

      // 转换为数组并排序
      stats = Object.entries(stats)
        .map(([userId, data]) => ({
          userId,
          ...data,
        }))
        .sort((a, b) => b.total - a.total);

    } else if (groupBy === "time") {
      // 按时间统计
      filteredBehaviors.forEach((behavior) => {
        const behaviorTime = new Date(behavior.timestamp);
        let timeKey;

        if (timeGranularity === "hour") {
          timeKey = behaviorTime.toISOString().slice(0, 13) + ":00:00";
        } else if (timeGranularity === "day") {
          timeKey = behaviorTime.toISOString().slice(0, 10);
        } else if (timeGranularity === "week") {
          const weekStart = new Date(behaviorTime);
          weekStart.setDate(behaviorTime.getDate() - behaviorTime.getDay());
          timeKey = weekStart.toISOString().slice(0, 10);
        }

        if (!stats[timeKey]) {
          stats[timeKey] = {
            total: 0,
            behaviors: {},
            users: new Set(),
          };
        }

        stats[timeKey].total += 1;
        const behaviorType = behavior.behaviorType;
        stats[timeKey].behaviors[behaviorType] = (stats[timeKey].behaviors[behaviorType] || 0) + 1;
        
        // 统计用户数
        const userId = behavior.userId || behavior.username || "匿名用户";
        stats[timeKey].users.add(userId);
      });

      // 转换Set为数组长度，并排序
      stats = Object.entries(stats)
        .map(([timeKey, data]) => ({
          time: timeKey,
          total: data.total,
          behaviors: data.behaviors,
          uniqueUsers: data.users.size,
        }))
        .sort((a, b) => new Date(a.time) - new Date(b.time));
    }

    res.json({
      stats,
      total: filteredBehaviors.length,
      groupBy,
      timeGranularity: groupBy === "time" ? timeGranularity : undefined,
    });
  } catch (error) {
    console.error("获取用户行为统计失败:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get behavior stats",
    });
  }
});

// 健康检查接口
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toLocaleString(),
    uptime: process.uptime(),
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`监控数据服务器启动在端口 ${PORT}`);
  console.log(`数据接收接口: http://localhost:${PORT}/api/report`);
  console.log(`统计数据接口: http://localhost:${PORT}/api/stats`);
  console.log(`错误列表接口: http://localhost:${PORT}/api/errors`);
  console.log(`性能数据接口: http://localhost:${PORT}/api/performance`);
});
