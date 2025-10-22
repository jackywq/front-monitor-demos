import React from 'react';
import ReactECharts from 'echarts-for-react';
import { MonitorStats } from '../../types/monitor';
import type { EChartsOption } from 'echarts';

interface PerformanceChartProps {
  data: MonitorStats;
  height?: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, height = 400 }) => {
  // 空数据保护
  if (!data?.performanceMetrics) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        暂无性能指标数据
      </div>
    );
  }

  const performanceData = [
    { name: '页面加载时间', value: data.performanceMetrics.pageLoad, unit: 'ms' },
    { name: '首次内容绘制', value: data.performanceMetrics.firstContentfulPaint, unit: 'ms' },
    { name: '最大内容绘制', value: data.performanceMetrics.largestContentfulPaint, unit: 'ms' },
    { name: '首次输入延迟', value: data.performanceMetrics.firstInputDelay, unit: 'ms' },
    { name: '累计布局偏移', value: data.performanceMetrics.cumulativeLayoutShift, unit: '' },
  ];

  const option: EChartsOption = {
    title: {
      text: '性能指标',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        if (!params || params.length === 0) return '';
        const param = params[0];
        const dataItem = performanceData[param.dataIndex];
        const unit = dataItem?.unit || 'ms';
        return `${param.name}<br/>${param.seriesName}: ${param.value}${unit}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: performanceData.map(item => item.name),
      axisLabel: {
        interval: 0,
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: '数值',
    },
    series: [
      {
        name: '性能指标',
        type: 'bar',
        data: performanceData.map(item => item.value),
        itemStyle: {
          color: function(params: any) {
            const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];
            return colors[params.dataIndex % colors.length];
          },
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

export default PerformanceChart;