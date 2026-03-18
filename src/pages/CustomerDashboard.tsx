// @ts-nocheck
import React, { useMemo } from 'react';
import { Typography, Row, Col, Card, Statistic, Table, Tag, theme } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, ProjectOutlined, TeamOutlined } from '@ant-design/icons';
import { MOCK_CUSTOMERS, MOCK_DEALS } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const CustomerDashboard: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  const { totalRevenue, totalCustomers, activeProjects, avgProjectValue, recentCustomers } = useMemo(() => {
    const revenue = MOCK_CUSTOMERS.reduce((sum, c) => sum + c.totalRevenue, 0);
    const projects = MOCK_CUSTOMERS.reduce((sum, c) => sum + c.activeProjects, 0);
    const totalEvents = MOCK_CUSTOMERS.reduce((sum, c) => sum + c.eventsProduced, 0);
    const avgValue = totalEvents > 0 ? Math.round(revenue / totalEvents) : 0;
    
    // Sort by last contact
    const sortedCustomers = [...MOCK_CUSTOMERS].sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime());

    return {
      totalRevenue: revenue,
      totalCustomers: MOCK_CUSTOMERS.length,
      activeProjects: projects,
      avgProjectValue: avgValue,
      recentCustomers: sortedCustomers.slice(0, 5)
    };
  }, []);

  const columns = [
    { title: 'Client Name', dataIndex: 'name', key: 'name', render: (text: string, record: any) => <a onClick={() => navigate(`/customer/${record.id}`)}>{text}</a> },
    { title: 'Tier', dataIndex: 'tier', key: 'tier', render: (val: string) => {
      let color = 'default';
      if (val === 'Platinum') color = 'purple';
      if (val === 'Gold') color = 'gold';
      if (val === 'Silver') color = 'blue';
      return <Tag color={color}>{val}</Tag>;
    }},
    { title: 'Total Revenue', dataIndex: 'totalRevenue', key: 'totalRevenue', render: (val: number) => formatCurrency(val) },
    { title: 'Active Projects', dataIndex: 'activeProjects', key: 'activeProjects' },
    { title: 'Last Contact', dataIndex: 'lastContact', key: 'lastContact' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Client Summary Dashboard</Title>
        <Text type="secondary">Overview of all client relationships and performance metrics.</Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Lifetime Revenue"
              value={totalRevenue}
              precision={0}
              styles={{ content: { color: token.colorPrimary } }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Clients"
              value={totalCustomers}
              styles={{ content: { color: token.colorText } }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={activeProjects}
              styles={{ content: { color: token.colorSuccess } }}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Project Value"
              value={avgProjectValue}
              precision={0}
              styles={{ content: { color: token.colorText } }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card title="Recently Contacted Clients" extra={<a onClick={() => navigate('/customers')}>View All</a>}>
            <Table columns={columns} dataSource={recentCustomers} pagination={false} rowKey="id" />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Upcoming Renewals & Events">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorWarning, marginTop: 6 }} />
                <div>
                  <Text strong style={{ display: 'block' }}>Acme Corp - Annual Contract Renewal</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Due in 15 days • Account Manager: Sarah Jenkins</Text>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorSuccess, marginTop: 6 }} />
                <div>
                  <Text strong style={{ display: 'block' }}>Globex Inc - Product Launch Gala</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Event Date: 2026-07-20 • Active Project</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
