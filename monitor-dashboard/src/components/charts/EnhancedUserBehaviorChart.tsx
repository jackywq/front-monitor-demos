import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Select, DatePicker, Space, Table, Tag, Button, Radio } from "antd";
import { MonitorStats, BehaviorStats, BehaviorDetail } from "../../types/monitor";
import { monitorApi } from "../../services/monitorApi";
import { ReloadOutlined, UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface EnhancedUserBehaviorChartProps {
  data: MonitorStats;
  height?: number;
}

const EnhancedUserBehaviorChart: React.FC<EnhancedUserBehaviorChartProps> = ({
  data,
  height = 400,
}) => {
  const [viewMode, setViewMode] = useState<"overview" | "byUser" | "byTime">("overview");
  const [behaviorStats, setBehaviorStats] = useState<BehaviorStats | null>(null);
  const [behaviorDetails, setBehaviorDetails] = useState<BehaviorDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeGranularity, setTimeGranularity] = useState<"hour" | "day" | "week">("hour");
  const [dateRange, setDateRange] = useState<any>([
    moment().subtract(24, "hours"),
    moment(),
  ]);
  const [selectedUser, setSelectedUser] = useState<string>("");

  const fetchBehaviorStats = async () => {
    try {
      setLoading(true);
      if (!dateRange) return;
      const startTime = dateRange[0].toISOString();
      const endTime = dateRange[1].toISOString();
      
      let stats;
      if (viewMode === "byUser") {
        stats = await monitorApi.getBehaviorStats("user", undefined, startTime, endTime);
      } else if (viewMode === "byTime") {
        stats = await monitorApi.getBehaviorStats("time", timeGranularity, startTime, endTime);
      }
      
      if (stats) {
        setBehaviorStats(stats);
      }
    } catch (error) {
      console.error("获取用户行为统计失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBehaviorDetails = async () => {
    try {
      setLoading(true);
      if (!dateRange) return;
      const startTime = dateRange[0].toISOString();
      const endTime = dateRange[1].toISOString();
      
      const details = await monitorApi.getBehaviors(50, undefined, selectedUser || undefined, startTime, endTime);
      setBehaviorDetails(details);
    } catch (error) {
      console.error("获取用户行为详情失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode !== "overview") {
      fetchBehaviorStats();
    }
  }, [viewMode, timeGranularity, dateRange]);

  useEffect(() => {
    fetchBehaviorDetails();
  }, [selectedUser, dateRange]);

  const getOverviewOption = () => {
    const behaviorData = Object.entries(data.userBehaviors).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    return {
      title: {
        text: "用户行为统计概览",
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} 次",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: behaviorData.map((item) => item.name),
        axisLabel: {
          interval: 0,
          rotate: 45,
        },
      },
      yAxis: {
        type: "value",
        name: "次数",
      },
      series: [
        {
          name: "用户行为",
          type: "bar",
          data: behaviorData.map((item) => item.value),
          itemStyle: {
            color: "#1890ff",
          },
        },
      ],
    };
  };

  const getByUserOption = () => {
    if (!behaviorStats || behaviorStats.groupBy !== "user") return {};

    const topUsers = behaviorStats.stats.slice(0, 10);
    const userNames = topUsers.map((item) => item.userId);
    const totals = topUsers.map((item) => item.total);

    return {
      title: {
        text: "用户行为统计 - 按用户",
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params: any) {
          const user = params[0].name;
          const total = params[0].value;
          const userData = behaviorStats.stats.find((item) => item.userId === user);
          const behaviorDetails = userData 
            ? Object.entries(userData.behaviors)
                .map(([type, count]) => `${type}: ${count}次`)
                .join("<br/>")
            : "";
          return `${user}<br/>总计: ${total}次<br/><br/>${behaviorDetails}`;
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: userNames,
        axisLabel: {
          interval: 0,
          rotate: 45,
        },
      },
      yAxis: {
        type: "value",
        name: "行为次数",
      },
      series: [
        {
          name: "用户行为总数",
          type: "bar",
          data: totals,
          itemStyle: {
            color: "#52c41a",
          },
        },
      ],
    };
  };

  const getByTimeOption = () => {
    if (!behaviorStats || behaviorStats.groupBy !== "time") return {};

    const timeData = behaviorStats.stats;
    const times = timeData.map((item) => {
      if (!item.time) return "";
      const time = new Date(item.time);
      if (timeGranularity === "hour") {
        return time.toLocaleString("zh-CN", { 
          month: "short", 
          day: "numeric", 
          hour: "2-digit" 
        });
      } else if (timeGranularity === "day") {
        return time.toLocaleDateString("zh-CN");
      } else {
        return time.toLocaleDateString("zh-CN");
      }
    });
    const totals = timeData.map((item) => item.total);
    const uniqueUsers = timeData.map((item) => item.uniqueUsers);

    return {
      title: {
        text: `用户行为统计 - 按时间 (${timeGranularity === "hour" ? "小时" : timeGranularity === "day" ? "天" : "周"})`,
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        formatter: function (params: any) {
          const time = params[0].name;
          const total = params[0].value;
          const users = params[1]?.value || 0;
          return `${time}<br/>行为总数: ${total}<br/>独立用户: ${users}人`;
        },
      },
      legend: {
        data: ["行为总数", "独立用户数"],
        top: 30,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: times,
        axisLabel: {
          interval: "auto",
          rotate: timeGranularity === "hour" ? 45 : 0,
        },
      },
      yAxis: [
        {
          type: "value",
          name: "行为次数",
          position: "left",
        },
        {
          type: "value",
          name: "用户数",
          position: "right",
        },
      ],
      series: [
        {
          name: "行为总数",
          type: "line",
          data: totals,
          smooth: true,
          itemStyle: {
            color: "#1890ff",
          },
        },
        {
          name: "独立用户数",
          type: "line",
          yAxisIndex: 1,
          data: uniqueUsers,
          smooth: true,
          itemStyle: {
            color: "#fa8c16",
          },
        },
      ],
    };
  };

  const getTableColumns = () => [
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (text: string) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "用户",
      dataIndex: "username",
      key: "username",
      width: 120,
      render: (text: string, record: BehaviorDetail) => (
        <div>
          <UserOutlined style={{ marginRight: 8 }} />
          {text || record.userId || "匿名用户"}
        </div>
      ),
    },
    {
      title: "行为类型",
      dataIndex: "behaviorType",
      key: "behaviorType",
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "页面",
      dataIndex: "pageUrl",
      key: "pageUrl",
      width: 200,
      ellipsis: true,
      render: (text: string) => text ? <a href={text} target="_blank" rel="noopener noreferrer">{text}</a> : "-",
    },
    {
      title: "详情",
      key: "details",
      render: (record: BehaviorDetail) => {
        if (record.formId) {
          return `表单: ${record.formId}, 消息长度: ${record.messageLength || 0}`;
        }
        return "-";
      },
    },
  ];

  const getChartOption = () => {
    switch (viewMode) {
      case "byUser":
        return getByUserOption();
      case "byTime":
        return getByTimeOption();
      default:
        return getOverviewOption();
    }
  };

  const uniqueUsers = Array.from(new Set(behaviorDetails.map(item => item.username || item.userId || "匿名用户").filter(Boolean)));

  return (
    <Card
      title="用户行为统计分析"
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              if (viewMode === "overview") {
                // 重新加载概览数据
              } else {
                fetchBehaviorStats();
              }
            }}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {/* 控制面板 */}
        <Space wrap>
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="overview">概览</Radio.Button>
            <Radio.Button value="byUser">
              <UserOutlined /> 按用户
            </Radio.Button>
            <Radio.Button value="byTime">
              <ClockCircleOutlined /> 按时间
            </Radio.Button>
          </Radio.Group>

          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [moment.Moment, moment.Moment])}
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: 300 }}
          />

          {viewMode === "byTime" && (
            <Select
              value={timeGranularity}
              onChange={setTimeGranularity}
              style={{ width: 120 }}
            >
              <Option value="hour">按小时</Option>
              <Option value="day">按天</Option>
              <Option value="week">按周</Option>
            </Select>
          )}

          {viewMode === "byUser" && (
            <Select
              value={selectedUser}
              onChange={setSelectedUser}
              style={{ width: 150 }}
              placeholder="选择用户"
              allowClear
            >
              {uniqueUsers.map((user) => (
                <Option key={user} value={user}>
                  {user}
                </Option>
              ))}
            </Select>
          )}
        </Space>

        {/* 图表 */}
        <ReactECharts
          option={getChartOption()}
          style={{ height: height }}
          opts={{ renderer: "canvas" }}
        />

        {/* 详细数据表格 */}
        {(viewMode === "byUser" || selectedUser) && (
          <div>
            <h4>行为详情</h4>
            <Table
              columns={getTableColumns()}
              dataSource={behaviorDetails}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              loading={loading}
              scroll={{ x: 800 }}
              size="small"
            />
          </div>
        )}
      </Space>
    </Card>
  );
};

export default EnhancedUserBehaviorChart;