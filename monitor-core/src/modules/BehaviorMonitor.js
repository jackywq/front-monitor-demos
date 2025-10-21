/**
 * 用户行为监控模块
 */

export class BehaviorMonitor {
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
      url: window.location.href,
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