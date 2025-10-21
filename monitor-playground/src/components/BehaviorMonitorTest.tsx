import React from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Form,
  Input,
  message,
} from "antd";
import {
  UserOutlined,
  FormOutlined,
  EyeOutlined,
  SendOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

interface BehaviorMonitorTestProps {
  monitorInitialized: boolean;
  updateStatus: (message: string, type?: "info" | "success" | "error") => void;
}

interface FormData {
  username: string;
  email: string;
  message: string;
}

const BehaviorMonitorTest: React.FC<BehaviorMonitorTestProps> = ({
  monitorInitialized,
  updateStatus,
}) => {
  const [form] = Form.useForm();

  // 处理表单提交
  const handleFormSubmit = async (values: FormData) => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    try {
      console.log("表单提交数据:", values);
      updateStatus("表单提交行为已记录", "success");

      // 上报表单提交行为
      if (window.Monitor) {
        window.Monitor.reportBehavior("form_submit", {
          formId: "demo_form",
          username: values.username,
          email: values.email,
          messageLength: values.message.length,
          timestamp: Date.now(),
        });
      }

      message.success("表单提交成功！");
      form.resetFields();
    } catch (error) {
      console.error("表单提交错误:", error);
      updateStatus("表单提交失败", "error");
    }
  };

  // 测试点击行为
  const testClickBehavior = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    if (window.Monitor) {
      window.Monitor.reportBehavior("custom_click", {
        element: "test_button",
        text: "测试按钮",
        timestamp: Date.now(),
      });
    }

    updateStatus("点击行为已手动上报", "success");
  };

  // 测试页面跳转
  const testPageView = () => {
    if (!monitorInitialized) {
      updateStatus("请先初始化监控 SDK", "error");
      return;
    }

    history.pushState({}, "", "/new-page");
    updateStatus("页面跳转行为已记录", "success");

    setTimeout(() => {
      history.back();
    }, 1000);
  };

  return (
    <Card
      title={
        <Space>
          <UserOutlined />
          <span>用户行为监控测试</span>
          <Tag color="purple">交互</Tag>
        </Space>
      }
      bordered={false}
      style={{ height: "100%" }}
    >
      <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
        测试用户行为监控功能，包括表单提交、点击行为、页面浏览等用户交互行为
      </Text>

      {!monitorInitialized && (
        <Text type="warning" style={{ marginBottom: 16, display: "block" }}>
          请先初始化监控 SDK
        </Text>
      )}

      {/* 表单提交测试 */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        style={{ marginBottom: 16 }}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入用户名"
            disabled={!monitorInitialized}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: "请输入邮箱" },
            { type: "email", message: "请输入有效的邮箱地址" },
          ]}
        >
          <Input placeholder="请输入邮箱" disabled={!monitorInitialized} />
        </Form.Item>

        <Form.Item
          name="message"
          label="消息"
          rules={[{ required: true, message: "请输入消息" }]}
        >
          <TextArea
            rows={3}
            placeholder="请输入消息"
            disabled={!monitorInitialized}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            block
            disabled={!monitorInitialized}
          >
            提交表单
          </Button>
        </Form.Item>
      </Form>

      {/* 其他行为测试 */}
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button
          icon={<FormOutlined />}
          onClick={testClickBehavior}
          block
          disabled={!monitorInitialized}
        >
          测试点击行为
        </Button>

        <Button
          icon={<EyeOutlined />}
          onClick={testPageView}
          block
          disabled={!monitorInitialized}
        >
          模拟页面跳转
        </Button>
      </Space>

      <div
        style={{
          marginTop: 16,
          padding: 8,
          background: "#f9f0ff",
          border: "1px solid #d3adf7",
          borderRadius: 6,
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 用户行为监控会自动收集点击、表单提交、页面浏览等交互行为
        </Text>
      </div>
    </Card>
  );
};

export default BehaviorMonitorTest;
