import React from "react";
import { Card, Button, Space, Typography, Tag } from "antd";
import { PlayCircleOutlined, StopOutlined, SyncOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const MonitorInitialization = ({ monitorInitialized, setMonitorInitialized, updateStatus }) => {
  // 初始化监控
  const initMonitor = () => {
    if (window.Monitor) {
      window.Monitor.init({
        reportUrl: "https://httpbin.org/post",
        appId: "demo-app",
        monitorErrors: true,
        monitorPerformance: true,
        monitorBehavior: true,
        sampleRate: 1.0,
        maxBatchSize: 5,
        reportInterval: 5000,
        ignoreErrors: ["Ignored Error"],
        userBehavior: {
          click: true,
          pageView: true,
          formSubmit: true,
        },
      });

      const initialized = window.Monitor.isInitialized();
      setMonitorInitialized(initialized);
      if (initialized) {
        updateStatus("监控 SDK 初始化成功", "success");
      } else {
        updateStatus("监控 SDK 初始化失败", "error");
      }
    } else {
      updateStatus("监控 SDK 未加载", "error");
    }
  };

  // 销毁监控
  const destroyMonitor = () => {
    if (monitorInitialized && window.Monitor) {
      window.Monitor.destroy();
      setMonitorInitialized(false);
      updateStatus("监控 SDK 已销毁", "info");
    } else {
      updateStatus("监控 SDK 未初始化", "error");
    }
  };

  // 立即上报数据
  const flushData = () => {
    if (monitorInitialized && window.Monitor) {
      window.Monitor.flush();
      updateStatus("数据已立即上报", "success");
    } else {
      updateStatus("请先初始化监控 SDK", "error");
    }
  };

  // 检查状态
  const checkStatus = () => {
    if (monitorInitialized && window.Monitor) {
      const config = window.Monitor.getConfig();
      updateStatus(
        `监控已初始化 - AppID: ${config.appId}, 采样率: ${config.sampleRate}`,
        "success"
      );
    } else {
      updateStatus("监控 SDK 未初始化", "error");
    }
  };

  return (
    <Card
      title={
        <Space>
          <PlayCircleOutlined />
          <span>初始化监控</span>
          {monitorInitialized ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              已初始化
            </Tag>
          ) : (
            <Tag color="red">未初始化</Tag>
          )}
        </Space>
      }
      bordered={false}
      style={{ height: "100%" }}
    >
      <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
        初始化监控 SDK 以开始收集错误、性能和用户行为数据
      </Text>
      
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button 
          type="primary" 
          icon={<PlayCircleOutlined />} 
          onClick={initMonitor}
          block
          disabled={monitorInitialized}
        >
          初始化监控 SDK
        </Button>
        
        <Button 
          icon={<StopOutlined />} 
          onClick={destroyMonitor}
          block
          disabled={!monitorInitialized}
          danger
        >
          销毁监控
        </Button>
        
        <Button 
          icon={<SyncOutlined />} 
          onClick={flushData}
          block
          disabled={!monitorInitialized}
        >
          立即上报数据
        </Button>
        
        <Button 
          icon={<CheckCircleOutlined />} 
          onClick={checkStatus}
          block
        >
          检查状态
        </Button>
      </Space>
      
      {monitorInitialized && (
        <div style={{ marginTop: 16, padding: 12, background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: 6 }}>
          <Text type="success">
            ✓ 监控系统已就绪，可以开始测试各项功能
          </Text>
        </div>
      )}
    </Card>
  );
};

export default MonitorInitialization;