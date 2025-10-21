import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Typography, Alert } from "antd";
import { DashboardOutlined } from "@ant-design/icons";

import MonitorInitialization from "./components/MonitorInitialization";
import ErrorMonitorTest from "./components/ErrorMonitorTest";
import PerformanceMonitorTest from "./components/PerformanceMonitorTest";
import BehaviorMonitorTest from "./components/BehaviorMonitorTest";
import ConfigMonitorTest from "./components/ConfigMonitorTest";

const { Header, Content } = Layout;
const { Title } = Typography;

interface Status {
  message: string;
  type: "info" | "success" | "error";
}

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [monitorInitialized, setMonitorInitialized] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>({
    message: "监控 SDK 未初始化",
    type: "info",
  });

  // 更新状态显示
  const updateStatus = (message: string, type: Status["type"] = "info") => {
    setStatus({ message, type });
  };

  // 加载监控SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/monitor-sdk.js";
    script.onload = () => {
      console.log("监控SDK加载完成");
    };
    script.onerror = () => {
      updateStatus("监控SDK加载失败", "error");
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Header style={{ background: "#001529", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", height: "64px" }}>
          <DashboardOutlined
            style={{ fontSize: "24px", color: "#fff", marginRight: "16px" }}
          />
          <Title level={3} style={{ color: "#fff", margin: 0 }}>
            前端监控 SDK 演示平台
          </Title>
        </div>
      </Header>

      <Content style={{ padding: "24px" }}>
        {/* 状态显示 */}
        <Alert
          message={status.message}
          type={
            status.type === "error"
              ? "error"
              : status.type === "success"
              ? "success"
              : "info"
          }
          showIcon
          style={{ marginBottom: "24px" }}
        />

        <Row gutter={[24, 24]}>
          {/* 初始化监控组件 */}
          <Col xs={24} lg={12}>
            <MonitorInitialization
              monitorInitialized={monitorInitialized}
              setMonitorInitialized={setMonitorInitialized}
              updateStatus={updateStatus}
            />
          </Col>

          {/* 错误监控测试组件 */}
          <Col xs={24} lg={12}>
            <ErrorMonitorTest
              monitorInitialized={monitorInitialized}
              updateStatus={updateStatus}
            />
          </Col>

          {/* 性能监控测试组件 */}
          <Col xs={24} lg={12}>
            <PerformanceMonitorTest
              monitorInitialized={monitorInitialized}
              updateStatus={updateStatus}
            />
          </Col>

          {/* 用户行为监控测试组件 */}
          <Col xs={24} lg={12}>
            <BehaviorMonitorTest
              monitorInitialized={monitorInitialized}
              updateStatus={updateStatus}
            />
          </Col>

          {/* 配置测试组件 */}
          <Col xs={24} lg={24}>
            <ConfigMonitorTest
              monitorInitialized={monitorInitialized}
              updateStatus={updateStatus}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default App;
