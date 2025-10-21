/**
 * 监控SDK入口文件
 */

import { Monitor } from './core/Monitor.js';

// UMD 模块规范支持
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    global.Monitor = factory();
  }
})(typeof window !== "undefined" ? window : this, function () {
  "use strict";
  return new Monitor();
});