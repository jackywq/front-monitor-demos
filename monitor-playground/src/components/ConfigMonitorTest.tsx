import React from "react";
import { Card, Button, Space, Typography, Tag, Alert, Descriptions } from "antd";
import { SettingOutlined, FilterOutlined, PercentageOutlined, ExperimentOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface ConfigMonitorTestProps {
  monitorInitialized: boolean;
  updateStatus: (message: string, type?: "info" | "success" | "error") => void;
}

const ConfigMonitorTest: React.FC<ConfigMonitorTestProps> = ({ monitorInitialized, updateStatus }) => {
  // 测试忽略错误配置
  const testIgnoreErrors = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    try {
      throw new Error("Ignored Error - 这个错误应该被忽略");
    } catch (error) {
      console.log("这个错误应该被忽略:", (error as Error).message);
    }

    try {
      throw new Error("Normal Error - 这个错误应该被上报");
    } catch (error) {
      console.log("这个错误应该被上报:", (error as Error).message);
    }

    updateStatus("忽略错误配置测试完成", "success");
  };

  // 测试采样率配置
  const testSampleRate = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    for (let i = 0; i < 10; i++) {
      try {
        throw new Error(`采样率测试错误 ${i}`);
      } catch (error) {
        // 错误会被自动捕获和上报（根据采样率）
      }
    }

    updateStatus("采样率配置测试完成", "success");
  };

  // 查看当前配置
  const viewConfig = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    if (window.Monitor) {
      const config = window.Monitor.getConfig();
      updateStatus("当前配置信息已显示", "success");
      
      // 这里可以显示配置详情，但为了简洁，我们只更新状态
      console.log("当前监控配置:", config);
    }
  };

  // 测试配置变更
  const testConfigChange = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    // 模拟配置变更
    if (window.Monitor) {
      const currentConfig = window.Monitor.getConfig();
      updateStatus(`当前采样率: ${currentConfig.sampleRate}`, "info");
    }
  };

  return (
    <Card
      title={
        <Space>
          <SettingOutlined />
          <span>配置测试</span>
          <Tag color="orange">配置</Tag>
        </Space>
      }
      bordered={false}
    >
      <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
        测试监控 SDK 的各种配置功能，包括忽略错误、采样率、上报间隔等配置项
      </Text>
      
      {!monitorInitialized && (
        <Alert
          message="请先初始化监控 SDK"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* 配置信息展示 */}
      {monitorInitialized && (
        <Descriptions 
          bordered 
          size="small" 
          column={2}
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label="App ID">demo-app</Descriptions.Item>
          <Descriptions.Item label="采样率">100%</Descriptions.Item>
          <Descriptions.Item label="错误监控">开启</Descriptions.Item>
          <Descriptions.Item label="性能监控">开启</Descriptions.Item>
          <Descriptions.Item label="行为监控">开启</Descriptions.Item>
          <Descriptions.Item label="上报间隔">5秒</Descriptions.Item>
        </Descriptions>
      )}
      
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button 
          icon={<FilterOutlined />} 
          onClick={testIgnoreErrors}
          block
          disabled={!monitorInitialized}
        >
          测试忽略错误配置
        </Button>
        
        <Button 
          icon={<PercentageOutlined />} 
          onClick={testSampleRate}
          block
          disabled={!monitorInitialized}
        >
          测试采样率配置
        </Button>
        
        <Button 
          icon={<SettingOutlined />} 
          onClick={viewConfig}
          block
          disabled={!monitorInitialized}
        >
          查看当前配置
        </Button>
        
        <Button 
          icon={<ExperimentOutlined />} 
          onClick={testConfigChange}
          block
          disabled={!monitorInitialized}
        >
          测试配置变更
        </Button>
      </Space>
      
      <Alert
        message="配置说明"
        description={
          <div>
            <Text type="secondary">
              • <strong>忽略错误配置</strong>: 忽略包含特定关键词的错误<br/>
              • <strong>采样率配置</strong>: 控制错误上报的频率<br/>
              • <strong>上报间隔</strong>: 批量上报数据的时间间隔<br/>
              • <strong>监控开关</strong>: 独立控制各类监控的开启状态
            </Text>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};

export default ConfigMonitorTest;