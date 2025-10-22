import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert, Space } from 'antd';
import { MonitorStats } from '../types/monitor';
import { monitorApi } from '../services/monitorApi';
import StatsCards from './StatsCards';
import TimeRangeSelector from './TimeRangeSelector';
import ErrorTrendChart from './charts/ErrorTrendChart';
import ErrorTypeChart from './charts/ErrorTypeChart';
import PerformanceChart from './charts/PerformanceChart';
import PerformanceDistributionChart from './charts/PerformanceDistributionChart';
import UserBehaviorChart from './charts/UserBehaviorChart';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('24h');

  const fetchStats = async (range: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await monitorApi.getStats(range);
      setStats(data);
    } catch (err) {
      setError('获取监控数据失败，请检查服务器连接');
      console.error('获取监控数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(timeRange);
  }, [timeRange]);

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>加载监控数据中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="监控数据加载失败"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  if (!stats) {
    return (
      <Alert
        message="暂无监控数据"
        description="请确保监控SDK正在运行并上报数据"
        type="info"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 时间范围选择器 */}
        <Card>
          <TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} />
        </Card>

        {/* 数据概览卡片 */}
        <StatsCards data={stats} />

        {/* 错误相关图表 */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card>
              <ErrorTrendChart data={stats} height={300} />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <ErrorTypeChart data={stats} height={300} />
            </Card>
          </Col>
        </Row>

        {/* 性能相关图表 */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card>
              <PerformanceChart data={stats} height={300} />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <PerformanceDistributionChart data={stats} height={300} />
            </Card>
          </Col>
        </Row>

        {/* 用户行为图表 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <UserBehaviorChart data={stats} height={300} />
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default Dashboard;