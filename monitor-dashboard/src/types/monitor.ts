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