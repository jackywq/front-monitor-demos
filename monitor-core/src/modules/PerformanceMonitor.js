/**
 * 性能监控模块
 */

export class PerformanceMonitor {
  constructor(queue, config) {
    this.queue = queue;
    this.config = config;
    this.init();
  }

  init() {
    if (!this.config.monitorPerformance) return;

    // 等待页面加载完成后再采集性能数据
    if (document.readyState === "complete") {
      this.collectPerformance();
    } else {
      window.addEventListener("load", () => {
        setTimeout(() => {
          this.collectPerformance();
        }, 0);
      });
    }
  }

  // 采集性能数据
  collectPerformance() {
    if (!window.performance || !window.performance.timing) return;

    const timing = window.performance.timing;
    const navigation = window.performance.navigation;

    // 计算关键性能指标
    const performanceData = {
      type: "performance",
      navigationType: navigation
        ? this.getNavigationType(navigation.type)
        : "unknown",
      metrics: this.calculateMetrics(timing),
    };

    this.queue.add(performanceData);

    // 采集资源性能
    this.collectResourceTiming();

    // 采集Web Vitals（如果支持）
    this.collectWebVitals();
  }

  // 计算性能指标
  calculateMetrics(timing) {
    const metrics = {};

    // DNS查询耗时
    metrics.dnsLookup = timing.domainLookupEnd - timing.domainLookupStart;

    // TCP连接耗时
    metrics.tcpConnect = timing.connectEnd - timing.connectStart;

    // 请求响应耗时
    metrics.requestResponse = timing.responseEnd - timing.requestStart;

    // DOM解析耗时
    metrics.domParse = timing.domComplete - timing.domLoading;

    // 白屏时间
    metrics.firstPaint = timing.responseStart - timing.navigationStart;

    // 首次内容渲染(FCP)
    metrics.fcp = timing.domContentLoadedEventStart - timing.navigationStart;

    // 页面完全加载时间
    metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;

    return metrics;
  }

  // 采集资源加载性能
  collectResourceTiming() {
    if (!window.performance || !window.performance.getEntriesByType) return;

    const resources = window.performance.getEntriesByType("resource");
    const resourceData = resources.map((resource) => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
      type: this.getResourceType(resource.name),
    }));

    if (resourceData.length > 0) {
      this.queue.add({
        type: "resource_performance",
        resources: resourceData,
      });
    }
  }

  // 采集Web Vitals指标
  collectWebVitals() {
    // 简化版Web Vitals采集
    // 实际项目中建议使用web-vitals库
    this.collectLCP();
    this.collectFID();
    this.collectCLS();
  }

  // 采集最大内容绘制(LCP)
  collectLCP() {
    if (!window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      this.queue.add({
        type: "web_vital",
        name: "LCP",
        value: lastEntry.startTime,
        element: lastEntry.element ? lastEntry.element.tagName : "",
      });
    });

    try {
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      // 浏览器不支持LCP
    }
  }

  // 采集首次输入延迟(FID)
  collectFID() {
    if (!window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];

      this.queue.add({
        type: "web_vital",
        name: "FID",
        value: firstEntry.processingStart - firstEntry.startTime,
      });
    });

    try {
      observer.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      // 浏览器不支持FID
    }
  }

  // 采集累积布局偏移(CLS)
  collectCLS() {
    if (!window.PerformanceObserver) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }

      this.queue.add({
        type: "web_vital",
        name: "CLS",
        value: clsValue,
      });
    });

    try {
      observer.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      // 浏览器不支持CLS
    }
  }

  // 获取资源类型
  getResourceType(url) {
    if (url.includes(".js")) return "script";
    if (url.includes(".css")) return "stylesheet";
    if (url.includes(".png") || url.includes(".jpg") || url.includes(".gif"))
      return "image";
    if (url.includes(".woff") || url.includes(".ttf")) return "font";
    return "other";
  }

  // 获取导航类型
  getNavigationType(type) {
    const types = {
      0: "navigate",
      1: "reload",
      2: "back_forward",
    };
    return types[type] || "unknown";
  }

  destroy() {
    // 性能监控不需要特殊的销毁操作
  }
}