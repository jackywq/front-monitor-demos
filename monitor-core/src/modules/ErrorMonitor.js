/**
 * 错误监控模块
 */

export class ErrorMonitor {
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
          startTime: Date.now(),
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
              duration: Date.now() - requestData.startTime,
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
            duration: Date.now() - requestData.startTime,
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
      const startTime = Date.now();
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
              duration: Date.now() - startTime,
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
            duration: Date.now() - startTime,
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