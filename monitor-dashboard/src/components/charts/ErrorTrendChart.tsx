import React from "react";
import ReactECharts from "echarts-for-react";
import { MonitorStats } from "../../types/monitor";
import type { EChartsOption } from "echarts";

interface ErrorTrendChartProps {
  data: MonitorStats;
  height?: number;
}

const ErrorTrendChart: React.FC<ErrorTrendChartProps> = ({
  data,
  height = 400,
}) => {
  // 空数据保护
  if (!data?.errorTrend || data.errorTrend.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
        }}
      >
        暂无错误趋势数据
      </div>
    );
  }

  const option: EChartsOption = {
    title: {
      text: "错误趋势",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        if (!params || params.length === 0) return "";
        const param = params[0];
        return `${param.name}<br/>错误数量: ${param.value}`;
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
      data: data.errorTrend.map((item) => item.time),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: "value",
      name: "错误数量",
    },
    series: [
      {
        name: "错误数量",
        type: "line",
        data: data.errorTrend.map((item) => item.count),
        smooth: true,
        lineStyle: {
          color: "#ff4d4f",
          width: 3,
        },
        itemStyle: {
          color: "#ff4d4f",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(255, 77, 79, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(255, 77, 79, 0)",
              },
            ],
          },
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

export default ErrorTrendChart;
