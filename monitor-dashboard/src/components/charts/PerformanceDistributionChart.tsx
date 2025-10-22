import React from 'react';
import ReactECharts from 'echarts-for-react';
import { MonitorStats } from '../../types/monitor';

interface PerformanceDistributionChartProps {
  data: MonitorStats;
  height?: number;
}

const PerformanceDistributionChart: React.FC<PerformanceDistributionChartProps> = ({ data, height = 400 }) => {
  const distributionData = [
    { name: '优秀(<1s)', value: data.performanceDistribution.excellent },
    { name: '良好(1-3s)', value: data.performanceDistribution.good },
    { name: '较差(>3s)', value: data.performanceDistribution.poor },
  ];

  const option = {
    title: {
      text: '性能分布',
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
        name: '性能分布',
        type: 'pie',
        radius: '50%',
        data: distributionData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{b}: {c} ({d}%)',
        },
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

export default PerformanceDistributionChart;