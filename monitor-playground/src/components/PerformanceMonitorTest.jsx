import React from "react";
import { Card, Button, Space, Typography, Tag, Progress, Row, Col } from "antd";
import { DashboardOutlined, RocketOutlined, LineChartOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PerformanceMonitorTest = ({ monitorInitialized, updateStatus }) => {
  // 测试性能数据
  const testPerformance = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    window.Monitor.reportPerformance({
      customMetric: Math.random() * 100,
      pageLoadTime: performance.timing
        ? performance.timing.loadEventEnd - performance.timing.navigationStart
        : 0,
    });

    updateStatus("性能数据已手动上报", "success");
  };

  // 测试自定义性能数据
  const testCustomPerformance = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    window.Monitor.reportPerformance(
      {
        userInteractionTime: Date.now() - performance.timing.navigationStart,
        memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
      },
      {
        customTag: "user_defined",
      }
    );

    updateStatus("自定义性能数据已上报", "success");
  };

  // 获取性能指标
  const getPerformanceMetrics = () => {
    if (!performance.timing) return null;

    const timing = performance.timing;
    return {
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnect: timing.connectEnd - timing.connectStart,
      request: timing.responseEnd - timing.requestStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
    };
  };

  const metrics = getPerformanceMetrics();

  return (
    <Card
      title={
        <Space>
          <DashboardOutlined />
          <span>性能监控测试</span>
          <Tag color="blue">实时</Tag>
        </Space>
      }
      bordered={false}
      style={{ height: "100%" }}
    >
      <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
        测试性能数据收集功能，包括页面加载时间、资源性能、自定义性能指标等
      </Text>
      
      {!monitorInitialized && (
        <Text type="warning" style={{ marginBottom: 16, display: "block" }}>
          请先初始化监控 SDK
        </Text>
      )}
      
      {/* 性能指标展示 */}
      {metrics && (
        <div style={{ marginBottom: 16, padding: 12, background: "#f0f5ff", borderRadius: 6 }}>
          <Text strong style={{ marginBottom: 8, display: "block" }}>当前页面性能指标:</Text>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Text type="secondary">DNS查询:</Text>
              <Progress 
                percent={Math.min((metrics.dnsLookup / 100), 100)} 
                size="small" 
                format={() => `${metrics.dnsLookup}ms`}
              />
            </Col>
            <Col span={12}>
              <Text type="secondary">TCP连接:</Text>
              <Progress 
                percent={Math.min((metrics.tcpConnect / 100), 100)} 
                size="small" 
                format={() => `${metrics.tcpConnect}ms`}
              />
            </Col>
            <Col span={12}>
              <Text type="secondary">请求响应:</Text>
              <Progress 
                percent={Math.min((metrics.request / 500), 100)} 
                size="small" 
                format={() => `${metrics.request}ms`}
              />
            </Col>
            <Col span={12}>
              <Text type="secondary">DOM就绪:</Text>
              <Progress 
                percent={Math.min((metrics.domReady / 1000), 100)} 
                size="small" 
                format={() => `${metrics.domReady}ms`}
              />
            </Col>
          </Row>
        </div>
      )}
      
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button 
          icon={<LineChartOutlined />} 
          onClick={testPerformance}
          block
          disabled={!monitorInitialized}
        >
          查看性能数据
        </Button>
        
        <Button 
          icon={<RocketOutlined />} 
          onClick={testCustomPerformance}
          block
          disabled={!monitorInitialized}
        >
          手动上报性能数据
        </Button>
        
        <Button 
          icon={<ClockCircleOutlined />} 
          onClick={() => {
            if (metrics) {
              updateStatus(`页面加载完成时间: ${metrics.loadComplete}ms`, "success");
            } else {
              updateStatus("无法获取性能指标", "error");
            }
          }}
          block
        >
          查看页面加载时间
        </Button>
      </Space>
      
      <div style={{ marginTop: 16, padding: 8, background: "#e6f7ff", border: "1px solid #91d5ff", borderRadius: 6 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 性能监控会自动收集页面加载、资源加载、Web Vitals 等指标
        </Text>
      </div>
    </Card>
  );
};

export default PerformanceMonitorTest;