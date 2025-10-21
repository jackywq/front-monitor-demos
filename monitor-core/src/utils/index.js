/**
 * 工具函数模块
 */

// 默认配置
export const DEFAULT_CONFIG = {
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

// 获取当前时间戳
export const now = () => Date.now();

// 生成唯一ID
export const generateId = () => {
  return "monitor_" + Math.random().toString(36).substr(2, 9) + "_" + now();
};

// 判断是否为函数
export const isFunction = (fn) => typeof fn === "function";

// 安全的JSON序列化
export const safeStringify = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return "{}";
  }
};

// 获取页面URL
export const getPageUrl = () => window.location.href;

// 获取用户代理
export const getUserAgent = () => navigator.userAgent;

// 采样判断
export const shouldSample = (rate) => Math.random() < rate;

// 深度合并对象
export function deepMerge(target, source) {
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = deepMerge({ ...targetValue }, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
}

// 判断是否为对象
export function isObject(obj) {
  return obj !== null && typeof obj === "object";
}

// 判断是否为数组
export function isArray(arr) {
  return Array.isArray(arr);
}

// 判断是否为字符串
export function isString(str) {
  return typeof str === "string";
}

// 判断是否为数字
export function isNumber(num) {
  return typeof num === "number" && !isNaN(num);
}

// 判断是否为空
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (isString(value) || isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
}