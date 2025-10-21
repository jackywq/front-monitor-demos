/**
 * 前端监控 SDK
 * 支持错误监控、性能监控、用户行为监控和数据上报
 * @version 1.0.0
 */

(function (global, factory) {
  // UMD 模块规范支持
  if (typeof define === "function" && define.amd) {
    define(factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    global.Monitor = factory();
  }
})(typeof window !== "undefined" ? window : this, function () {
  "use strict";

  // 默认配置
  const DEFAULT_CONFIG = {
    reportUrl: "http://localhost:3000/api/monitor/report", // 上报地址
    appId: "", // 应用ID
    monitorErrors: true, // 是否监控错误
    monitorPerformance: true, // 是否监控性能
    monitorBehavior: false, // 是否监控用户行为
    sampleRate: 1.0, // 采样率 (0-1)
    ignoreErrors: [], // 忽略的错误类型或URL
    maxBatchSize: 10, // 批量上报最大数量
    reportInterval: 10000, // 上报间隔(ms)
    enableSourceMap: false, // 是否支持sourceMap
    userBehavior: {
      click: true, // 监控点击
      pageView: true, // 监控页面浏览
      formSubmit: true, // 监控表单提交
    },
  };

  // 工具函数
  const utils = {
    // 获取当前时间戳
    now: () => Date.now(),

    // 生成唯一ID
    generateId: () => {
      return (
        "monitor_" + Math.random().toString(36).substr(2, 9) + "_" + utils.now()
      );
    },

    // 判断是否为函数
    isFunction: (fn) => typeof fn === "function",

    // 安全的JSON序列化
    safeStringify: (obj) => {
      try {
        return JSON.stringify(obj);
      } catch (e) {
        return "{}";
      }
    },

    // 获取页面URL
    getPageUrl: () => window.location.href,

    // 获取用户代理
    getUserAgent: () => navigator.userAgent,

    // 采样判断
    shouldSample: (rate) => Math.random() < rate,

    // 深度合并对象
    deepMerge: (target, source) => {
      for (let key in source) {
        if (source.hasOwnProperty(key)) {
          if (
            typeof source[key] === "object" &&
            source[key] !== null &&
            !Array.isArray(source[key])
          ) {
            if (!target[key] || typeof target[key] !== "object") {
              target[key] = {};
            }
            utils.deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
      return target;
    },
  };

  // 数据存储队列
  class DataQueue {
    constructor(config) {
      this.config = config;
      this.queue = [];
      this.timer = null;
      this.init();
    }

    init() {
      // 页面卸载前上报剩余数据
      window.addEventListener("beforeunload", () => {
        this.flush();
      });

      // 定时上报
      if (this.config.reportInterval > 0) {
        this.timer = setInterval(() => {
          this.flush();
        }, this.config.reportInterval);
      }
    }

    // 添加数据到队列
    add(data) {
      // 采样判断
      if (!utils.shouldSample(this.config.sampleRate)) {
        return;
      }

      this.queue.push({
        ...data,
        timestamp: utils.now(),
        id: utils.generateId(),
      });

      // 达到批量大小立即上报
      if (this.queue.length >= this.config.maxBatchSize) {
        this.flush();
      }
    }

    // 立即上报队列中的数据
    flush() {
      if (this.queue.length === 0) return;

      const dataToSend = [...this.queue];
      this.queue = [];

      this.report(dataToSend);
    }

    // 数据上报
    report(data) {
      if (!this.config.reportUrl) {
        console.warn("Monitor: reportUrl is not configured");
        return;
      }

      const reportData = {
        appId: this.config.appId,
        pageUrl: utils.getPageUrl(),
        userAgent: utils.getUserAgent(),
        data: data,
        timestamp: utils.now(),
      };

      // 使用navigator.sendBeacon优先，支持页面卸载时上报
      if (navigator.sendBeacon) {
        const blob = new Blob([utils.safeStringify(reportData)], {
          type: "application/json",
        });
        navigator.sendBeacon(this.config.reportUrl, blob);
      } else {
        // 降级方案：使用Image对象
        const img = new Image();
        img.src =
          this.config.reportUrl +
          "?data=" +
          encodeURIComponent(utils.safeStringify(reportData));
      }
    }

    // 销毁
    destroy() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.queue = [];
    }
  }

  // 错误监控模块
  class ErrorMonitor {
    constructor(queue, config) {
      this.queue = queue;
      this.config = config;
      this.init();
    }

    init() {
      if (!this.config.monitorErrors) return;

      // 监听全局错误
      window.addEventListener("error", this.handleError.bind(this), true);

      // 监听Promise未捕获异常
      window.addEventListener(
        "unhandledrejection",
        this.handleUnhandledRejection.bind(this)
      );

      // 监听资源加载错误
      window.addEventListener(
        "error",
        this.handleResourceError.bind(this),
        true
      );

      // 重写XMLHttpRequest和fetch监控接口错误
      this.interceptXHR();
      this.interceptFetch();
    }

    // 处理JavaScript运行时错误
    handleError(event) {
      const error = event.error;

      // 忽略跨域脚本错误（只有message，没有error对象）
      if (!error && event.message && event.message.includes("Script error")) {
        return;
      }

      // 检查是否在忽略列表中
      if (this.shouldIgnoreError(error, event)) {
        return;
      }

      const errorData = {
        type: "js_error",
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: error ? error.stack : "",
        errorType: error ? error.constructor.name : "Error",
      };

      this.queue.add(errorData);
    }

    // 处理Promise未捕获异常
    handleUnhandledRejection(event) {
      const error = event.reason;

      if (this.shouldIgnoreError(error, event)) {
        return;
      }

      const errorData = {
        type: "promise_error",
        message: error ? error.message : "Unhandled Promise Rejection",
        stack: error ? error.stack : "",
        errorType: error ? error.constructor.name : "PromiseRejection",
      };

      this.queue.add(errorData);
    }

    // 处理资源加载错误
    handleResourceError(event) {
      const target = event.target;

      // 只处理资源加载错误
      if (target === window) return;

      const tagName = target.tagName.toLowerCase();
      const resourceTypes = ["img", "script", "link", "audio", "video"];

      if (!resourceTypes.includes(tagName)) return;

      const resourceData = {
        type: "resource_error",
        tagName: tagName,
        src: target.src || target.href,
        outerHTML: target.outerHTML ? target.outerHTML.substring(0, 500) : "",
      };

      this.queue.add(resourceData);
    }

    // 拦截XMLHttpRequest
    interceptXHR() {
      const originalXHR = window.XMLHttpRequest;
      const self = this;

      if (!originalXHR) return;

      window.XMLHttpRequest = function () {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        const originalSend = xhr.send;
        let requestData = {};

        xhr.open = function (method, url) {
          requestData = {
            method: method,
            url: url,
            startTime: utils.now(),
          };
          return originalOpen.apply(this, arguments);
        };

        xhr.send = function (data) {
          requestData.requestData = data;

          xhr.addEventListener("load", function () {
            if (xhr.status >= 400) {
              const responseData = {
                type: "api_error",
                method: requestData.method,
                url: requestData.url,
                status: xhr.status,
                statusText: xhr.statusText,
                duration: utils.now() - requestData.startTime,
                response: xhr.responseText
                  ? xhr.responseText.substring(0, 1000)
                  : "",
              };
              self.queue.add(responseData);
            }
          });

          xhr.addEventListener("error", function () {
            const errorData = {
              type: "api_error",
              method: requestData.method,
              url: requestData.url,
              status: xhr.status,
              statusText: "Network Error",
              duration: utils.now() - requestData.startTime,
            };
            self.queue.add(errorData);
          });

          return originalSend.apply(this, arguments);
        };

        return xhr;
      };
    }

    // 拦截fetch
    interceptFetch() {
      if (!window.fetch) return;

      const originalFetch = window.fetch;
      const self = this;

      window.fetch = function (...args) {
        const startTime = utils.now();
        const requestInfo = args[0];
        const requestConfig = args[1] || {};

        return originalFetch
          .apply(this, args)
          .then((response) => {
            if (!response.ok) {
              const errorData = {
                type: "api_error",
                method: requestConfig.method || "GET",
                url:
                  typeof requestInfo === "string"
                    ? requestInfo
                    : requestInfo.url,
                status: response.status,
                statusText: response.statusText,
                duration: utils.now() - startTime,
              };
              self.queue.add(errorData);
            }
            return response;
          })
          .catch((error) => {
            const errorData = {
              type: "api_error",
              method: requestConfig.method || "GET",
              url:
                typeof requestInfo === "string" ? requestInfo : requestInfo.url,
              status: 0,
              statusText: "Fetch Error",
              duration: utils.now() - startTime,
              error: error.message,
            };
            self.queue.add(errorData);
            throw error;
          });
      };
    }

    // 判断是否应该忽略错误
    shouldIgnoreError(error, event) {
      if (!this.config.ignoreErrors || this.config.ignoreErrors.length === 0) {
        return false;
      }

      const errorMessage = error ? error.message : event.message;
      const errorUrl = event.filename || "";

      return this.config.ignoreErrors.some((ignorePattern) => {
        if (typeof ignorePattern === "string") {
          return (
            errorMessage.includes(ignorePattern) ||
            errorUrl.includes(ignorePattern)
          );
        } else if (ignorePattern instanceof RegExp) {
          return (
            ignorePattern.test(errorMessage) || ignorePattern.test(errorUrl)
          );
        }
        return false;
      });
    }

    // 销毁
    destroy() {
      // 恢复原始的XHR和fetch
      if (window.XMLHttpRequest && window.XMLHttpRequest.__proto__) {
        window.XMLHttpRequest = window.XMLHttpRequest.__proto__.constructor;
      }

      if (window.fetch && window.fetch.__proto__) {
        window.fetch = window.fetch.__proto__.constructor;
      }
    }
  }

  // 性能监控模块
  class PerformanceMonitor {
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

  // 用户行为监控模块
  class BehaviorMonitor {
    constructor(queue, config) {
      this.queue = queue;
      this.config = config.userBehavior || {};
      this.init();
    }

    init() {
      if (!this.config) return;

      // 监控点击事件
      if (this.config.click) {
        this.monitorClicks();
      }

      // 监控页面浏览
      if (this.config.pageView) {
        this.monitorPageView();
      }

      // 监控表单提交
      if (this.config.formSubmit) {
        this.monitorFormSubmit();
      }
    }

    // 监控点击事件
    monitorClicks() {
      document.addEventListener(
        "click",
        (event) => {
          const target = event.target;

          // 过滤不需要监控的元素
          if (this.shouldIgnoreElement(target)) return;

          const clickData = {
            type: "click",
            element: target.tagName.toLowerCase(),
            text: target.textContent
              ? target.textContent.substring(0, 100)
              : "",
            className: target.className || "",
            id: target.id || "",
            x: event.clientX,
            y: event.clientY,
          };

          this.queue.add(clickData);
        },
        true
      );
    }

    // 监控页面浏览
    monitorPageView() {
      // 监听history变化
      this.overrideHistory();

      // 监听hash变化
      window.addEventListener("hashchange", () => {
        this.recordPageView();
      });

      // 记录初始页面
      this.recordPageView();
    }

    // 监控表单提交
    monitorFormSubmit() {
      document.addEventListener(
        "submit",
        (event) => {
          const target = event.target;

          if (this.shouldIgnoreElement(target)) return;

          const formData = {
            type: "form_submit",
            formId: target.id || "",
            formClass: target.className || "",
            action: target.action || "",
            method: target.method || "GET",
          };

          this.queue.add(formData);
        },
        true
      );
    }

    // 重写history方法以监控路由变化
    overrideHistory() {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function () {
        const result = originalPushState.apply(this, arguments);
        window.dispatchEvent(new Event("pushstate"));
        window.dispatchEvent(new Event("locationchange"));
        return result;
      };

      history.replaceState = function () {
        const result = originalReplaceState.apply(this, arguments);
        window.dispatchEvent(new Event("replacestate"));
        window.dispatchEvent(new Event("locationchange"));
        return result;
      };

      window.addEventListener("popstate", () => {
        window.dispatchEvent(new Event("locationchange"));
      });

      window.addEventListener("locationchange", () => {
        this.recordPageView();
      });
    }

    // 记录页面浏览
    recordPageView() {
      const pageData = {
        type: "page_view",
        url: utils.getPageUrl(),
        title: document.title,
        referrer: document.referrer,
      };

      this.queue.add(pageData);
    }

    // 判断是否应该忽略元素
    shouldIgnoreElement(element) {
      // 可以根据需要扩展忽略规则
      const ignoreSelectors = ["script", "style", "meta", "link", "br", "hr"];

      return ignoreSelectors.includes(element.tagName.toLowerCase());
    }

    destroy() {
      // 恢复原始的history方法
      if (history.pushState.__proto__) {
        history.pushState = history.pushState.__proto__.constructor;
      }
      if (history.replaceState.__proto__) {
        history.replaceState = history.replaceState.__proto__.constructor;
      }
    }
  }

  // 主监控类
  class Monitor {
    constructor() {
      this.config = null;
      this.queue = null;
      this.errorMonitor = null;
      this.performanceMonitor = null;
      this.behaviorMonitor = null;
      this.initialized = false;
    }

    // 初始化监控
    init(userConfig = {}) {
      if (this.initialized) {
        console.warn("Monitor has already been initialized");
        return;
      }

      // 合并配置
      this.config = utils.deepMerge({}, DEFAULT_CONFIG);
      utils.deepMerge(this.config, userConfig);

      // 验证必要配置
      if (!this.config.reportUrl) {
        console.error("Monitor: reportUrl is required");
        return;
      }

      // 初始化数据队列
      this.queue = new DataQueue(this.config);

      // 初始化各监控模块
      if (this.config.monitorErrors) {
        this.errorMonitor = new ErrorMonitor(this.queue, this.config);
      }

      if (this.config.monitorPerformance) {
        this.performanceMonitor = new PerformanceMonitor(
          this.queue,
          this.config
        );
      }

      if (this.config.monitorBehavior) {
        this.behaviorMonitor = new BehaviorMonitor(this.queue, this.config);
      }

      this.initialized = true;
      console.log("Monitor initialized successfully");
    }

    // 手动上报错误
    reportError(error, customData = {}) {
      if (!this.initialized || !this.queue) {
        console.warn("Monitor not initialized");
        return;
      }

      const errorData = {
        type: "custom_error",
        message: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        ...customData,
      };

      this.queue.add(errorData);
    }

    // 手动上报性能数据
    reportPerformance(metrics, customData = {}) {
      if (!this.initialized || !this.queue) {
        console.warn("Monitor not initialized");
        return;
      }

      const performanceData = {
        type: "custom_performance",
        metrics: metrics,
        ...customData,
      };

      this.queue.add(performanceData);
    }

    // 手动上报用户行为
    reportBehavior(behaviorType, data) {
      if (!this.initialized || !this.queue) {
        console.warn("Monitor not initialized");
        return;
      }

      const behaviorData = {
        type: "custom_behavior",
        behaviorType: behaviorType,
        ...data,
      };

      this.queue.add(behaviorData);
    }

    // 立即上报所有数据
    flush() {
      if (!this.initialized || !this.queue) {
        console.warn("Monitor not initialized");
        return;
      }

      this.queue.flush();
    }

    // 销毁监控实例
    destroy() {
      if (!this.initialized) return;

      if (this.errorMonitor) {
        this.errorMonitor.destroy();
      }

      if (this.performanceMonitor) {
        this.performanceMonitor.destroy();
      }

      if (this.behaviorMonitor) {
        this.behaviorMonitor.destroy();
      }

      if (this.queue) {
        this.queue.destroy();
      }

      this.config = null;
      this.queue = null;
      this.errorMonitor = null;
      this.performanceMonitor = null;
      this.behaviorMonitor = null;
      this.initialized = false;

      console.log("Monitor destroyed");
    }

    // 获取当前配置
    getConfig() {
      return this.config ? { ...this.config } : null;
    }

    // 检查是否已初始化
    isInitialized() {
      return this.initialized;
    }
  }

  return new Monitor();
});
