import axios from "axios";
import { MonitorStats, ErrorDetail, PerformanceDetail } from "../types/monitor";

// 模拟数据生成器
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
      time: new Date(Date.now() - (11 - i) * 2 * 60 * 60 * 1000).toISOString(),
      count: Math.floor(Math.random() * 10) + 1,
    })),
    timeRange: {
      range: range,
      start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
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
    ).toISOString(),
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
    ).toISOString(),
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

// 使用模拟数据替代真实API调用
export const monitorApi = {
  // 获取统计数据
  getStats: async (range: string = "24h"): Promise<MonitorStats> => {
    // 模拟网络延迟
    await new Promise((resolve) =>
      setTimeout(resolve, 300 + Math.random() * 700)
    );
    return generateMockStats(range);
  },

  // 获取错误详情
  getErrors: async (
    limit: number = 50,
    type?: string
  ): Promise<ErrorDetail[]> => {
    await new Promise((resolve) =>
      setTimeout(resolve, 200 + Math.random() * 500)
    );
    let errors = generateMockErrors(limit);
    if (type) {
      errors = errors.filter((error) => error.errorType === type);
    }
    return errors;
  },

  // 获取性能详情
  getPerformance: async (limit: number = 50): Promise<PerformanceDetail[]> => {
    await new Promise((resolve) =>
      setTimeout(resolve, 200 + Math.random() * 500)
    );
    return generateMockPerformance(limit);
  },

  // 健康检查
  healthCheck: async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { status: "healthy", timestamp: new Date().toISOString() };
  },
};

export default monitorApi;
