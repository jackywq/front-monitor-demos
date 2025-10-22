import React from 'react';
import ReactECharts from 'echarts-for-react';
import { MonitorStats } from '../../types/monitor';
import type { EChartsOption } from 'echarts';

interface ErrorTypeChartProps {
  data: MonitorStats;
  height?: number;
}

const ErrorTypeChart: React.FC<ErrorTypeChartProps> = ({ data, height = 400 }) => {
  // 空数据保护
  if (!data?.errorTypes || Object.keys(data.errorTypes).length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        暂无错误类型数据
      </div>
    );
  }

  const chartData = Object.entries(data.errorTypes).map(([name, value]) => ({
    name,
    value,
  }));

  const option: EChartsOption = {
    title: {
      text: '错误类型分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'bottom',
    },
    series: [
      {
        name: '错误类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData,
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: height }}
      opts={{ renderer: 'canvas' }}
    />
  );
};

export default ErrorTypeChart;