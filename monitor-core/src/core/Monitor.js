/**
 * 主监控类
 */

import { DataQueue } from "./DataQueue.js";
import { ErrorMonitor } from "../modules/ErrorMonitor.js";
import { PerformanceMonitor } from "../modules/PerformanceMonitor.js";
import { BehaviorMonitor } from "../modules/BehaviorMonitor.js";
import { DEFAULT_CONFIG, deepMerge } from "../utils/index.js";

export class Monitor {
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
    this.config = deepMerge({}, DEFAULT_CONFIG);
    console.log("🚀 ~ Monitor ~ init ~ this.config:", this.config);
    deepMerge(this.config, userConfig);

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
      this.performanceMonitor = new PerformanceMonitor(this.queue, this.config);
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
