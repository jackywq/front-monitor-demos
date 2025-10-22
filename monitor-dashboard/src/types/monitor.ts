// 监控数据类型定义
export interface MonitorStats {
  // 错误统计
  totalErrors: number;
  errorTypes: Record<string, number>;
  errorTrend: Array<{
    time: string;
    count: number;
  }>;
  
  // 性能统计
  performanceMetrics: {
    pageLoad: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  };
  performanceDistribution: {
    excellent: number;
    good: number;
    poor: number;
  };
  
  // 用户行为统计
  userBehaviors: Record<string, number>;
  totalUsers: number;
  
  // 成功率统计
  successRate: number;
  
  // 时间范围信息
  timeRange: {
    range: string;
    start: string;
    end: string;
  };
}

export interface ErrorDetail {
  id: string;
  errorType: string;
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userAgent?: string;
  sessionId?: string;
}

export interface PerformanceDetail {
  id: string;
  metrics: {
    pageLoad: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  };
  timestamp: string;
  url: string;
}

export interface TimeRangeOption {
  value: string;
  label: string;
}

export interface ChartData {
  name: string;
  value: number;
}

// 用户行为详情
export interface BehaviorDetail {
  id: string;
  behaviorType: string;
  timestamp: string;
  appId?: string;
  pageUrl?: string;
  userAgent?: string;
  userId?: string;
  username?: string;
  formId?: string;
  messageLength?: number;
  [key: string]: any; // 支持其他自定义字段
}

// 用户行为统计
export interface BehaviorStats {
  stats: Array<{
    userId?: string;
    total: number;
    behaviors: Record<string, number>;
    latestActivity: string;
    time?: string;
    uniqueUsers?: number;
  }>;
  total: number;
  groupBy: "user" | "time";
  timeGranularity?: "hour" | "day" | "week";
}