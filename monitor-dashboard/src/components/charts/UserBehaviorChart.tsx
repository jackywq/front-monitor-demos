import React from "react";
import ReactECharts from "echarts-for-react";
import { MonitorStats } from "../../types/monitor";

interface UserBehaviorChartProps {
  data: MonitorStats;
  height?: number;
}

const UserBehaviorChart: React.FC<UserBehaviorChartProps> = ({
  data,
  height = 400,
}) => {
  const behaviorData = Object.entries(data.userBehaviors).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const option = {
    title: {
      text: "用户行为统计",
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

  return (
    <ReactECharts
      option={option}
      style={{ height: height }}
      opts={{ renderer: "canvas" }}
    />
  );
};

export default UserBehaviorChart;
