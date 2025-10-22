import axios from "axios";
import {
  MonitorStats,
  ErrorDetail,
  PerformanceDetail,
  BehaviorDetail,
  BehaviorStats,
} from "../types/monitor";

const API_BASE_URL = "http://localhost:3001/api";

// 模拟数据生成器（作为备用）
const generateMockStats = (range: string = "24h"): MonitorStats => {
  const baseValue =
    range === "1h"
      ? 100
      : range === "24h"
      ? 1000
      : range === "7d"
      ? 5000
      : 20000;

  return {
    totalErrors: Math.floor(baseValue * 0.05),
    totalUsers: baseValue,
    successRate: 0.98 + Math.random() * 0.02,
    performanceMetrics: {
      pageLoad: 1200 + Math.random() * 800,
      firstContentfulPaint: 800 + Math.random() * 600,
      largestContentfulPaint: 1000 + Math.random() * 1000,
      firstInputDelay: 50 + Math.random() * 100,
      cumulativeLayoutShift: Math.random() * 0.3,
    },
    performanceDistribution: {
      excellent: Math.floor(baseValue * 0.6),
      good: Math.floor(baseValue * 0.3),
      poor: Math.floor(baseValue * 0.1),
    },
    errorTypes: {
      "JavaScript Error": Math.floor(baseValue * 0.02),
      "Network Error": Math.floor(baseValue * 0.015),
      "Resource Error": Math.floor(baseValue * 0.01),
      "Promise Rejection": Math.floor(baseValue * 0.005),
    },
    userBehaviors: {
      页面访问: baseValue,
      按钮点击: Math.floor(baseValue * 2.5),
      表单提交: Math.floor(baseValue * 0.3),
      页面滚动: Math.floor(baseValue * 1.8),
    },
    errorTrend: Array.from({ length: 12 }, (_, i) => ({
      time: new Date(
        Date.now() - (11 - i) * 2 * 60 * 60 * 1000
      ).toLocaleString(),
      count: Math.floor(Math.random() * 10) + 1,
    })),
    timeRange: {
      range: range,
      start: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString(),
      end: new Date().toLocaleString(),
    },
  };
};

const generateMockErrors = (
  limit: number = 50,
  errorType?: string
): ErrorDetail[] => {
  const errorTypes = [
    "JavaScript Error",
    "Network Error",
    "Resource Error",
    "Promise Rejection",
  ];
  const pages = ["/home", "/dashboard", "/profile", "/settings", "/products"];

  const errors = Array.from({ length: limit }, (_, i) => ({
    id: `error-${i}`,
    timestamp: new Date(
      Date.now() - Math.random() * 24 * 60 * 60 * 1000
    ).toLocaleString(),
    errorType: errorTypes[Math.floor(Math.random() * errorTypes.length)],
    message: `Error occurred at ${
      pages[Math.floor(Math.random() * pages.length)]
    }`,
    stack:
      `at function${i} (file.js:${Math.floor(Math.random() * 100)}:${Math.floor(
        Math.random() * 50
      )})\n` +
      `at function${i + 1} (file.js:${Math.floor(
        Math.random() * 100
      )}:${Math.floor(Math.random() * 50)})`,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    url: `https://example.com${
      pages[Math.floor(Math.random() * pages.length)]
    }`,
    line: Math.floor(Math.random() * 100),
    column: Math.floor(Math.random() * 50),
  }));

  if (errorType) {
    return errors.filter((error) => error.errorType === errorType);
  }
  return errors;
};

const generateMockPerformance = (limit: number = 50): PerformanceDetail[] => {
  return Array.from({ length: limit }, (_, i) => ({
    id: `perf-${i}`,
    timestamp: new Date(
      Date.now() - Math.random() * 24 * 60 * 60 * 1000
    ).toLocaleString(),
    url: `https://example.com/page${Math.floor(Math.random() * 10)}`,
    metrics: {
      pageLoad: (0.8 + Math.random() * 2.5) * 1000, // 转换为毫秒
      firstContentfulPaint: (0.5 + Math.random() * 1.5) * 1000,
      largestContentfulPaint: (1.0 + Math.random() * 2.0) * 1000,
      firstInputDelay: Math.random() * 100,
      cumulativeLayoutShift: Math.random() * 0.3,
    },
  }));
};

const generateMockBehaviors = (limit: number = 100): BehaviorDetail[] => {
  const behaviorTypes = [
    "页面访问",
    "按钮点击",
    "表单提交",
    "页面滚动",
    "自定义事件",
  ];
  
  // 更真实的用户数据
  const users = [
    { username: "张明", email: "zhang.ming@example.com", userId: "user_001" },
    { username: "李华", email: "li.hua@example.com", userId: "user_002" },
    { username: "王芳", email: "wang.fang@example.com", userId: "user_003" },
    { username: "赵强", email: "zhao.qiang@example.com", userId: "user_004" },
    { username: "钱伟", email: "qian.wei@example.com", userId: "user_005" },
    { username: "孙丽", email: "sun.li@example.com", userId: "user_006" },
    { username: "周杰", email: "zhou.jie@example.com", userId: "user_007" },
    { username: "吴刚", email: "wu.gang@example.com", userId: "user_008" },
    { username: "郑爽", email: "zheng.shuang@example.com", userId: "user_009" },
    { username: "王磊", email: "wang.lei@example.com", userId: "user_010" },
    { username: "匿名用户", email: "anonymous@example.com", userId: "anonymous_001" }
  ];
  
  const pages = ["/home", "/dashboard", "/profile", "/settings", "/products", "/login", "/register", "/about", "/contact"];
  
  // 更真实的用户代理字符串
  const userAgents = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  ];

  return Array.from({ length: limit }, (_, i) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const behaviorType = behaviorTypes[Math.floor(Math.random() * behaviorTypes.length)];
    const isFormSubmit = behaviorType === "表单提交";
    
    return {
      id: `behavior-${Date.now()}-${i}`,
      behaviorType: behaviorType,
      timestamp: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 // 7天内的时间范围
      ).toISOString(),
      appId: "monitor-demo-app",
      pageUrl: `https://monitor-demo.com${
        pages[Math.floor(Math.random() * pages.length)]
      }`,
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      userId: user.userId,
      username: user.username,
      email: user.email,
      formId: isFormSubmit ? `form_${Math.floor(Math.random() * 5)}` : undefined,
      messageLength: isFormSubmit ? Math.floor(Math.random() * 200) + 20 : undefined,
    };
  });
};

const generateMockBehaviorStats = (
  groupBy: "user" | "time" = "user",
  timeGranularity?: "hour" | "day" | "week"
): BehaviorStats => {
  if (groupBy === "user") {
    // 使用与generateMockBehaviors相同的用户数据
    const users = [
      { username: "张明", email: "zhang.ming@example.com", userId: "user_001" },
      { username: "李华", email: "li.hua@example.com", userId: "user_002" },
      { username: "王芳", email: "wang.fang@example.com", userId: "user_003" },
      { username: "赵强", email: "zhao.qiang@example.com", userId: "user_004" },
      { username: "钱伟", email: "qian.wei@example.com", userId: "user_005" },
      { username: "孙丽", email: "sun.li@example.com", userId: "user_006" },
      { username: "周杰", email: "zhou.jie@example.com", userId: "user_007" },
      { username: "吴刚", email: "wu.gang@example.com", userId: "user_008" },
      { username: "郑爽", email: "zheng.shuang@example.com", userId: "user_009" },
      { username: "王磊", email: "wang.lei@example.com", userId: "user_010" },
      { username: "匿名用户", email: "anonymous@example.com", userId: "anonymous_001" }
    ];
    
    const behaviorTypes = [
      "页面访问",
      "按钮点击",
      "表单提交",
      "页面滚动",
      "自定义事件",
    ];

    const stats = users
      .map((user, index) => ({
        userId: user.userId,
        total: Math.floor(Math.random() * 100) + 20, // 增加行为总数范围
        behaviors: behaviorTypes.reduce((acc, type) => {
          // 更真实的行为分布：页面访问最多，表单提交最少
          let count = 0;
          if (type === "页面访问") {
            count = Math.floor(Math.random() * 40) + 30;
          } else if (type === "按钮点击") {
            count = Math.floor(Math.random() * 25) + 15;
          } else if (type === "页面滚动") {
            count = Math.floor(Math.random() * 20) + 10;
          } else if (type === "自定义事件") {
            count = Math.floor(Math.random() * 15) + 5;
          } else { // 表单提交
            count = Math.floor(Math.random() * 10) + 1;
          }
          acc[type] = count;
          return acc;
        }, {} as Record<string, number>),
        latestActivity: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 // 7天内的时间范围
        ).toISOString(),
      }))
      .sort((a, b) => b.total - a.total);

    return {
      stats,
      total: stats.reduce((sum, user) => sum + user.total, 0),
      groupBy: "user",
    };
  } else {
    // 按时间统计
    const hours = 24;
    const behaviorTypes = [
      "页面访问",
      "按钮点击",
      "表单提交",
      "页面滚动",
      "自定义事件",
    ];

    const stats = Array.from({ length: hours }, (_, i) => {
        const time = new Date(Date.now() - (hours - 1 - i) * 60 * 60 * 1000);
        const hourKey = time.toISOString().slice(0, 13) + ":00:00";

        return {
          time: hourKey,
          total: Math.floor(Math.random() * 30) + 5,
          behaviors: behaviorTypes.reduce((acc, type) => {
            acc[type] = Math.floor(Math.random() * 10);
            return acc;
          }, {} as Record<string, number>),
          uniqueUsers: Math.floor(Math.random() * 10) + 1,
          latestActivity: hourKey,
        };
      });

    return {
      stats,
      total: stats.reduce((sum, item) => sum + item.total, 0),
      groupBy: "time",
      timeGranularity: "hour",
    };
  }
};

// 真实API调用
export const monitorApi = {
  // 获取统计数据
  getStats: async (range: string = "24h"): Promise<MonitorStats> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`, {
        params: { range },
      });
      return response.data;
    } catch (error) {
      console.error("获取统计数据失败，使用模拟数据:", error);
      // 如果真实API失败，回退到模拟数据
      await new Promise((resolve) =>
        setTimeout(resolve, 300 + Math.random() * 700)
      );
      return generateMockStats(range);
    }
  },

  // 获取错误详情
  getErrors: async (
    limit: number = 50,
    type?: string
  ): Promise<ErrorDetail[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/errors`, {
        params: { limit, type },
      });
      return response.data;
    } catch (error) {
      console.error("获取错误详情失败，使用模拟数据:", error);
      // 如果真实API失败，回退到模拟数据
      await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 500)
      );
      let errors = generateMockErrors(limit);
      if (type) {
        errors = errors.filter((error) => error.errorType === type);
      }
      return errors;
    }
  },

  // 获取性能详情
  getPerformance: async (limit: number = 50): Promise<PerformanceDetail[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/performance`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("获取性能详情失败，使用模拟数据:", error);
      // 如果真实API失败，回退到模拟数据
      await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 500)
      );
      return generateMockPerformance(limit);
    }
  },

  // 健康检查
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      console.error("健康检查失败:", error);
      return { status: "healthy", timestamp: new Date().toLocaleString() };
    }
  },

  // 获取用户行为详情
  getBehaviors: async (
    limit: number = 100,
    type?: string,
    userId?: string,
    startTime?: string,
    endTime?: string
  ): Promise<BehaviorDetail[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/behaviors`, {
        params: { limit, type, userId, startTime, endTime },
      });
      return response.data;
    } catch (error) {
      console.error("获取用户行为详情失败，使用模拟数据:", error);
      // 如果真实API失败，回退到模拟数据
      await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 500)
      );
      return generateMockBehaviors(limit);
    }
  },

  // 获取用户行为统计
  getBehaviorStats: async (
    groupBy: "user" | "time" = "user",
    timeGranularity?: "hour" | "day" | "week",
    startTime?: string,
    endTime?: string
  ): Promise<BehaviorStats> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/behavior-stats`, {
        params: { groupBy, timeGranularity, startTime, endTime },
      });
      return response.data;
    } catch (error) {
      console.error("获取用户行为统计失败，使用模拟数据:", error);
      // 如果真实API失败，回退到模拟数据
      await new Promise((resolve) =>
        setTimeout(resolve, 300 + Math.random() * 700)
      );
      return generateMockBehaviorStats(groupBy, timeGranularity);
    }
  },
};

export default monitorApi;
