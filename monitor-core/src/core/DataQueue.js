/**
 * 数据存储队列模块
 */

import {
  now,
  generateId,
  safeStringify,
  getPageUrl,
  getUserAgent,
  shouldSample
} from '../utils/index.js';

export class DataQueue {
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
    if (!shouldSample(this.config.sampleRate)) {
      return;
    }

    this.queue.push({
      ...data,
      timestamp: now(),
      id: generateId(),
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
      pageUrl: getPageUrl(),
      userAgent: getUserAgent(),
      data: data,
      timestamp: now(),
    };

    // 使用navigator.sendBeacon优先，支持页面卸载时上报
    if (navigator.sendBeacon) {
      const blob = new Blob([safeStringify(reportData)], {
        type: "application/json",
      });
      navigator.sendBeacon(this.config.reportUrl, blob);
    } else {
      // 降级方案：使用Image对象
      const img = new Image();
      img.src =
        this.config.reportUrl +
        "?data=" +
        encodeURIComponent(safeStringify(reportData));
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