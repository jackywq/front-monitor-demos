import React from 'react';
import { Card, Row, Col, Statistic, Tag } from 'antd';
import { MonitorStats } from '../types/monitor';

interface StatsCardsProps {
  data: MonitorStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ data }) => {
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic
            title="总错误数"
            value={data.totalErrors}
            valueStyle={{ color: data.totalErrors > 0 ? '#cf1322' : '#3f8600' }}
            prefix={<Tag color={data.totalErrors > 0 ? 'red' : 'green'}>{data.totalErrors > 0 ? '异常' : '正常'}</Tag>}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="总用户数"
            value={data.totalUsers}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="成功率"
            value={data.successRate}
            suffix="%"
            valueStyle={{ color: data.successRate >= 95 ? '#3f8600' : data.successRate >= 90 ? '#faad14' : '#cf1322' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="页面加载时间"
            value={data.performanceMetrics.pageLoad}
            suffix="ms"
            valueStyle={{ color: data.performanceMetrics.pageLoad < 1000 ? '#3f8600' : data.performanceMetrics.pageLoad < 3000 ? '#faad14' : '#cf1322' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StatsCards;