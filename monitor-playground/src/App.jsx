import React, { useState, useEffect } from 'react'

function App() {
  const [monitorInitialized, setMonitorInitialized] = useState(false)
  const [status, setStatus] = useState({ message: '监控 SDK 未初始化', type: 'info' })
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    message: ''
  })

  // 更新状态显示
  const updateStatus = (message, type = 'info') => {
    setStatus({ message, type })
  }

  // 初始化监控
  const initMonitor = () => {
    if (window.Monitor) {
      window.Monitor.init({
        reportUrl: 'https://httpbin.org/post',
        appId: 'demo-app',
        monitorErrors: true,
        monitorPerformance: true,
        monitorBehavior: true,
        sampleRate: 1.0,
        maxBatchSize: 5,
        reportInterval: 5000,
        ignoreErrors: ['Ignored Error'],
        userBehavior: {
          click: true,
          pageView: true,
          formSubmit: true
        }
      })

      const initialized = window.Monitor.isInitialized()
      setMonitorInitialized(initialized)
      if (initialized) {
        updateStatus('监控 SDK 初始化成功', 'success')
      } else {
        updateStatus('监控 SDK 初始化失败', 'error')
      }
    } else {
      updateStatus('监控 SDK 未加载', 'error')
    }
  }

  // 销毁监控
  const destroyMonitor = () => {
    if (monitorInitialized && window.Monitor) {
      window.Monitor.destroy()
      setMonitorInitialized(false)
      updateStatus('监控 SDK 已销毁', 'info')
    } else {
      updateStatus('监控 SDK 未初始化', 'error')
    }
  }

  // 立即上报数据
  const flushData = () => {
    if (monitorInitialized && window.Monitor) {
      window.Monitor.flush()
      updateStatus('数据已立即上报', 'success')
    } else {
      updateStatus('请先初始化监控 SDK', 'error')
    }
  }

  // 检查状态
  const checkStatus = () => {
    if (monitorInitialized && window.Monitor) {
      const config = window.Monitor.getConfig()
      updateStatus(`监控已初始化 - AppID: ${config.appId}, 采样率: ${config.sampleRate}`, 'success')
    } else {
      updateStatus('监控 SDK 未初始化', 'error')
    }
  }

  // 测试JavaScript错误
  const testJSError = () => {
    if (!monitorInitialized) {
      updateStatus('请先初始化监控 SDK', 'error')
      return
    }

    try {
      throw new Error('这是一个测试的 JavaScript 错误')
    } catch (error) {
      console.error('捕获到错误:', error)
      updateStatus('JavaScript 错误已触发并上报', 'success')
    }
  }

  // 测试Promise错误
  const testPromiseError = () => {
    if (!monitorInitialized) {
      updateStatus('请先初始化监控 SDK', 'error')
      return
    }

    Promise.reject(new Error('这是一个测试的 Promise 错误'))
    updateStatus('Promise 错误已触发并上报', 'success')
  }

  // 测试自定义错误
  const testCustomError = () => {
    if (!monitorInitialized) {
      updateStatus('请先初始化监控 SDK', 'error')
      return
    }

    try {
      throw new TypeError('这是一个自定义类型错误')
    } catch (error) {
      window.Monitor.reportError(error, {
        customField: '自定义数据',
        userId: '12345',
        page: 'demo.html'
      })
      updateStatus('自定义错误已手动上报', 'success')
    }
  }

  // 测试资源加载错误
  const testResourceError = () => {
    if (!monitorInitialized) {
      updateStatus('请先初始化监控 SDK', 'error')
      return
    }

    const img = new Image()
    img.src = 'https://example.com/nonexistent-image.jpg'
    img.onerror = function () {
      updateStatus('资源加载错误已触发并上报', 'success')
    }
    document.body.appendChild(img)
  }

  // 测试API错误
  const testAPIError = async () => {
    if (!monitorInitialized) {
      updateStatus('请先初始化监控 SDK', 'error')
      return
    }

    try {
      const response = await fetch('https://httpbin.org/status/404')
      if (!response.ok) {
        throw new Error('API 返回错误状态')
      }
    } catch (error) {
      console.error('API 错误:', error)
      updateStatus('API 错误已触发并上报', 'success')
    }
  }

  // 测试性能数据
  const testPerformance = () => {
    if (!monitorInitialized) {
      updateStatus('请先初始化监控 SDK', 'error')
      return
    }

    window.Monitor.reportPerformance({
      customMetric: Math.random() * 100,
      pageLoadTime: performance.timing ?
        performance.timing.loadEventEnd - performance.timing.navigationStart : 0
    })

    updateStatus('性能数据已手动上报', 'success')
  }

  // 测试自定义性能数据
  const testCustomPerformance = () => {
    if (!monitorInitialized) {
      updateStatus('请先初始化监控 SDK', 'error')
      return
    }

    window.Monitor.reportPerformance({
      userInteractionTime: Date.now() - performance.timing.navigationStart,
      memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0
    }, {
      customTag: 'user_defined'
    })

    updateStatus('自定义性能数据已上报', 'success')
  }

  // 处理表单提交
  const handleFormSubmit = (e) => {
    e.preventDefault()

    if (!monitorInitialized) {
      updateStatus('请先初始化监控 SDK', 'error')
      return
    }

    console.log('表单提交数据:', formData)
    updateStatus('表单提交行为已记录', 'success')

    // 重置表单
    setFormData({
      username: '',
      email: '',
      message: ''
    })
  }

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 测试点击行为
  const testClickBehavior = () => {
    if (!monitorInitialized) {
      updateStatus('请先初始化监控 SDK', 'error')
      return
    }

    window.Monitor.reportBehavior('custom_click', {
      element: 'test_button',
      text: '测试按钮',
      timestamp: Date.now()
    })

    updateStatus('点击行为已手动上报', 'success')
  }

  // 测试页面跳转
  const testPageView = () => {
    if (!monitorInitialized) {
      updateStatus('请先初始化监控 SDK', 'error')
      return
    }

    history.pushState({}, '', '/new-page')
    updateStatus('页面跳转行为已记录', 'success')

    setTimeout(() => {
      history.back()
    }, 1000)
  }

  // 测试忽略错误配置
  const testIgnoreErrors = () => {
    if (!monitorInitialized) {
      updateStatus('请先初始化监控 SDK', 'error')
      return
    }

    try {
      throw new Error('Ignored Error - 这个错误应该被忽略')
    } catch (error) {
      console.log('这个错误应该被忽略:', error.message)
    }

    try {
      throw new Error('Normal Error - 这个错误应该被上报')
    } catch (error) {
      console.log('这个错误应该被上报:', error.message)
    }

    updateStatus('忽略错误配置测试完成', 'success')
  }

  // 测试采样率配置
  const testSampleRate = () => {
    if (!monitorInitialized) {
      updateStatus('请先初始化监控 SDK', 'error')
      return
    }

    for (let i = 0; i < 10; i++) {
      try {
        throw new Error(`采样率测试错误 ${i}`)
      } catch (error) {
        // 错误会被自动捕获和上报（根据采样率）
      }
    }

    updateStatus('采样率配置测试完成', 'success')
  }

  // 加载监控SDK
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/monitor-sdk.js'
    script.onload = () => {
      console.log('监控SDK加载完成')
    }
    script.onerror = () => {
      updateStatus('监控SDK加载失败', 'error')
    }
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return (
    <div>
      <h1>前端监控 SDK React 示例</h1>

      <div className={`status ${status.type}`}>
        {status.message}
      </div>

      <div className="demo-section">
        <h2>1. 初始化监控</h2>
        <button onClick={initMonitor}>初始化监控 SDK</button>
        <button onClick={destroyMonitor}>销毁监控</button>
        <button onClick={flushData}>立即上报数据</button>
        <button onClick={checkStatus}>检查状态</button>
      </div>

      <div className="demo-section">
        <h2>2. 错误监控测试</h2>
        <button onClick={testJSError}>触发 JavaScript 错误</button>
        <button onClick={testPromiseError}>触发 Promise 错误</button>
        <button onClick={testCustomError}>手动上报错误</button>
        <button onClick={testResourceError}>触发资源加载错误</button>
        <button onClick={testAPIError}>触发 API 错误</button>
      </div>

      <div className="demo-section">
        <h2>3. 性能监控测试</h2>
        <button onClick={testPerformance}>查看性能数据</button>
        <button onClick={testCustomPerformance}>手动上报性能数据</button>
      </div>

      <div className="demo-section">
        <h2>4. 用户行为监控测试</h2>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>用户名:</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username}
              onChange={handleInputChange}
              placeholder="请输入用户名" 
            />
          </div>
          <div className="form-group">
            <label>邮箱:</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email}
              onChange={handleInputChange}
              placeholder="请输入邮箱" 
            />
          </div>
          <div className="form-group">
            <label>消息:</label>
            <textarea 
              name="message" 
              value={formData.message}
              onChange={handleInputChange}
              placeholder="请输入消息"
            />
          </div>
          <button type="submit">提交表单</button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <button onClick={testClickBehavior}>测试点击行为</button>
          <button onClick={testPageView}>模拟页面跳转</button>
        </div>
      </div>

      <div className="demo-section">
        <h2>5. 配置测试</h2>
        <button onClick={testIgnoreErrors}>测试忽略错误配置</button>
        <button onClick={testSampleRate}>测试采样率配置</button>
      </div>
    </div>
  )
}

export default App