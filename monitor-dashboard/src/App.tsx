import React from 'react';
import { Layout, Typography } from 'antd';
import Dashboard from './components/Dashboard';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '64px' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            🚀 前端监控仪表板
          </Title>
        </div>
      </Header>
      <Content style={{ background: '#f0f2f5' }}>
        <Dashboard />
      </Content>
    </Layout>
  );
}

export default App;
