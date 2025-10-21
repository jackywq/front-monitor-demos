import React from "react";
import { Card, Button, Space, Typography, Tag, Alert } from "antd";
import { BugOutlined, WarningOutlined, ThunderboltOutlined, ApiOutlined, FileImageOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ErrorMonitorTest = ({ monitorInitialized, updateStatus }) => {
  // 测试JavaScript错误
  const testJSError = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    try {
      throw new Error("这是一个测试的 JavaScript 错误");
    } catch (error) {
      console.error("捕获到错误:", error);
      updateStatus("JavaScript 错误已触发并上报", "success");
    }
  };

  // 测试Promise错误
  const testPromiseError = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    Promise.reject(new Error("这是一个测试的 Promise 错误"));
    updateStatus("Promise 错误已触发并上报", "success");
  };

  // 测试自定义错误
  const testCustomError = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    try {
      throw new TypeError("这是一个自定义类型错误");
    } catch (error) {
      window.Monitor.reportError(error, {
        customField: "自定义数据",
        userId: "12345",
        page: "demo.html",
      });
      updateStatus("自定义错误已手动上报", "success");
    }
  };

  // 测试资源加载错误
  const testResourceError = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    const img = new Image();
    img.src = "https://example.com/nonexistent-image.jpg";
    img.onerror = function () {
      updateStatus("资源加载错误已触发并上报", "success");
    };
    document.body.appendChild(img);
  };

  // 测试API错误
  const testAPIError = async () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    try {
      const response = await fetch("https://httpbin.org/status/404");
      if (!response.ok) {
        throw new Error("API 返回错误状态");
      }
    } catch (error) {
      console.error("API 错误:", error);
      updateStatus("API 错误已触发并上报", "success");
    }
  };

  return (
    <Card
      title={
        <Space>
          <BugOutlined />
          <span>错误监控测试</span>
          <Tag color="red">高风险</Tag>
        </Space>
      }
      bordered={false}
      style={{ height: "100%" }}
    >
      <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
        测试各种类型的错误监控功能，包括 JavaScript 错误、Promise 错误、资源加载错误等
      </Text>
      
      {!monitorInitialized && (
        <Alert
          message="请先初始化监控 SDK"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button 
          icon={<BugOutlined />} 
          onClick={testJSError}
          block
          disabled={!monitorInitialized}
        >
          触发 JavaScript 错误
        </Button>
        
        <Button 
          icon={<ThunderboltOutlined />} 
          onClick={testPromiseError}
          block
          disabled={!monitorInitialized}
        >
          触发 Promise 错误
        </Button>
        
        <Button 
          icon={<WarningOutlined />} 
          onClick={testCustomError}
          block
          disabled={!monitorInitialized}
        >
          手动上报错误
        </Button>
        
        <Button 
          icon={<FileImageOutlined />} 
          onClick={testResourceError}
          block
          disabled={!monitorInitialized}
        >
          触发资源加载错误
        </Button>
        
        <Button 
          icon={<ApiOutlined />} 
          onClick={testAPIError}
          block
          disabled={!monitorInitialized}
        >
          触发 API 错误
        </Button>
      </Space>
      
      <Alert
        message="安全提示"
        description="这些测试会触发真实的错误，但不会影响页面正常功能"
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};

export default ErrorMonitorTest;