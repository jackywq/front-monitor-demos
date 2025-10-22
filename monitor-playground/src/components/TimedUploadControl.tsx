import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Switch,
  InputNumber,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface TimedUploadControlProps {
  monitorInitialized: boolean;
  updateStatus: (message: string, type?: "info" | "success" | "error") => void;
}

const TimedUploadControl: React.FC<TimedUploadControlProps> = ({
  monitorInitialized,
  updateStatus,
}) => {
  const [isTimedUploadEnabled, setIsTimedUploadEnabled] =
    useState<boolean>(false);
  const [uploadInterval, setUploadInterval] = useState<number>(1000); // 默认1秒
  const [uploadCount, setUploadCount] = useState<number>(0);
  const [lastUploadTime, setLastUploadTime] = useState<string>("-");

  // 定时器引用
  const uploadTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // 生成测试数据
  const generateTestData = () => {
    if (!window.Monitor) return null;

    // 生成随机用户行为数据
    const behaviorTypes = ["click", "pageView", "formSubmit"];
    const randomBehavior =
      behaviorTypes[Math.floor(Math.random() * behaviorTypes.length)];

    // 模拟不同的页面路径
    const pages = ["/home", "/dashboard", "/settings", "/profile", "/products"];
    const randomPage = pages[Math.floor(Math.random() * pages.length)];

    // 生成测试数据
    const testData = {
      type: "behavior",
      behaviorType: randomBehavior,
      pageUrl: randomPage,
      element:
        randomBehavior === "click"
          ? "button-test-" + Math.floor(Math.random() * 10)
          : undefined,
      formData:
        randomBehavior === "formSubmit"
          ? { field1: "test", field2: "value" }
          : undefined,
      timestamp: Date.now(),
      uploadId:
        "timed-upload-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    };

    // 使用监控SDK记录行为
    if (window.Monitor.reportBehavior) {
      window.Monitor.reportBehavior(testData.behaviorType, testData);
    } else {
      // 降级方案：使用reportError或其他可用方法
      console.warn("reportBehavior method not available");
    }

    return testData;
  };

  // 启动定时上传
  const startTimedUpload = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
    }

    uploadTimerRef.current = setInterval(() => {
      if (window.Monitor) {
        // 生成测试数据
        const testData = generateTestData();

        // 执行数据上报
        window.Monitor.flush();
        setUploadCount((prev) => prev + 1);
        setLastUploadTime(new Date().toLocaleTimeString());

        console.log(`定时上传执行，累计上传次数: ${uploadCount + 1}`, testData);

        // 更新状态显示
        if (testData) {
          updateStatus(
            `定时上传执行成功 - ${testData.behaviorType} on ${testData.pageUrl}`,
            "success"
          );
        } else {
          updateStatus("定时上传执行成功", "success");
        }
      }
    }, uploadInterval);

    setIsTimedUploadEnabled(true);
    updateStatus(`定时上传已启动，间隔: ${uploadInterval}ms`, "success");
  };

  // 停止定时上传
  const stopTimedUpload = () => {
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }

    setIsTimedUploadEnabled(false);
    updateStatus("定时上传已停止", "info");
  };

  // 立即执行一次上传
  const executeUploadNow = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    if (window.Monitor) {
      // 生成测试数据
      const testData = generateTestData();

      // 执行数据上报
      window.Monitor.flush();
      setUploadCount((prev) => prev + 1);
      setLastUploadTime(new Date().toLocaleTimeString());

      // 更新状态显示
      if (testData) {
        updateStatus(
          `立即上传执行成功 - ${testData.behaviorType} on ${testData.pageUrl}`,
          "success"
        );
      } else {
        updateStatus("立即上传执行成功", "success");
      }
    }
  };

  // 重置统计
  const resetStatistics = () => {
    setUploadCount(0);
    setLastUploadTime("-");
    updateStatus("统计信息已重置", "info");
  };

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) {
        clearInterval(uploadTimerRef.current);
      }
    };
  }, []);

  // 当上传间隔改变时，如果定时器正在运行，重新启动
  useEffect(() => {
    if (isTimedUploadEnabled && uploadTimerRef.current) {
      stopTimedUpload();
      startTimedUpload();
    }
  }, [uploadInterval]);

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined />
          <span>定时上传控制</span>
          {isTimedUploadEnabled ? (
            <Tag color="green" icon={<PlayCircleOutlined />}>
              运行中
            </Tag>
          ) : (
            <Tag color="default">已停止</Tag>
          )}
        </Space>
      }
      variant="borderless"
      style={{ height: "100%" }}
    >
      <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
        配置定时上传功能，自动定期上报监控数据到服务器
      </Text>

      <Space direction="vertical" style={{ width: "100%" }}>
        {/* 定时上传开关 */}
        <Row align="middle" gutter={16}>
          <Col span={12}>
            <Text>定时上传功能:</Text>
          </Col>
          <Col span={12}>
            <Switch
              checked={isTimedUploadEnabled}
              onChange={(checked) => {
                if (checked) {
                  startTimedUpload();
                } else {
                  stopTimedUpload();
                }
              }}
              disabled={!monitorInitialized}
            />
          </Col>
        </Row>

        {/* 上传间隔设置 */}
        <Row align="middle" gutter={16}>
          <Col span={12}>
            <Text>上传间隔(ms):</Text>
          </Col>
          <Col span={12}>
            <InputNumber
              min={1000}
              max={60000}
              step={1000}
              value={uploadInterval}
              onChange={(value) => value && setUploadInterval(value)}
              disabled={!monitorInitialized || isTimedUploadEnabled}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>

        {/* 控制按钮 */}
        <Button
          type="primary"
          icon={
            isTimedUploadEnabled ? (
              <PauseCircleOutlined />
            ) : (
              <PlayCircleOutlined />
            )
          }
          onClick={isTimedUploadEnabled ? stopTimedUpload : startTimedUpload}
          block
          disabled={!monitorInitialized}
        >
          {isTimedUploadEnabled ? "停止定时上传" : "启动定时上传"}
        </Button>

        <Button
          icon={<SyncOutlined />}
          onClick={executeUploadNow}
          block
          disabled={!monitorInitialized}
        >
          立即上传
        </Button>

        {/* 统计信息 */}
        <Card size="small" title="上传统计" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="累计上传次数" value={uploadCount} />
            </Col>
            <Col span={12}>
              <Statistic title="最后上传时间" value={lastUploadTime} />
            </Col>
          </Row>
          <Button
            type="link"
            onClick={resetStatistics}
            size="small"
            style={{ marginTop: 8 }}
          >
            重置统计
          </Button>
        </Card>
      </Space>

      {!monitorInitialized && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#fff2e8",
            border: "1px solid #ffbb96",
            borderRadius: 6,
          }}
        >
          <Text type="warning">⚠ 请先初始化监控 SDK 以启用定时上传功能</Text>
        </div>
      )}
    </Card>
  );
};

export default TimedUploadControl;
