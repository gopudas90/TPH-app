// @ts-nocheck
import React, { useMemo } from 'react';
import { Typography, Row, Col, Card, Statistic, Table, Tag, theme } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, ProjectOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { MOCK_DEALS, PIPELINE_STAGES } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  const { totalPipelineValue, activeDealsCount, winRate, avgDealSize, recentDeals } = useMemo(() => {
    const activeDeals = MOCK_DEALS.filter(d => d.stageId !== '8' && d.stageId !== '9');
    const wonDeals = MOCK_DEALS.filter(d => d.stageId === '8');
    const lostDeals = MOCK_DEALS.filter(d => d.stageId === '9');
    const closedDeals = wonDeals.length + lostDeals.length;
    
    const pipelineValue = activeDeals.reduce((sum, deal) => sum + deal.value, 0);
    const winRateValue = closedDeals > 0 ? Math.round((wonDeals.length / closedDeals) * 100) : 0;
    const avgSize = activeDeals.length > 0 ? Math.round(pipelineValue / activeDeals.length) : 0;

    // Sort by date descending for recent deals
    const sortedDeals = [...MOCK_DEALS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      totalPipelineValue: pipelineValue,
      activeDealsCount: activeDeals.length,
      winRate: winRateValue,
      avgDealSize: avgSize,
      recentDeals: sortedDeals.slice(0, 5)
    };
  }, []);

  const columns = [
    { title: 'Deal Name', dataIndex: 'name', key: 'name', render: (text: string, record: any) => <a onClick={() => navigate(`/deal/${record.id}`)}>{text}</a> },
    { title: 'Client', dataIndex: 'client', key: 'client' },
    { title: 'Value', dataIndex: 'value', key: 'value', render: (val: number) => formatCurrency(val) },
    { title: 'Stage', dataIndex: 'stageId', key: 'stageId', render: (val: string) => {
      const stage = PIPELINE_STAGES.find(s => s.id === val);
      return <Tag>{stage?.name || 'Unknown'}</Tag>;
    }},
    { title: 'Probability', dataIndex: 'probability', key: 'probability', render: (val: number) => <Tag color={val >= 80 ? 'success' : val >= 50 ? 'processing' : 'error'}>{val}%</Tag> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Sales Dashboard</Title>
        <Text type="secondary">Welcome back. Here's what's happening today.</Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Pipeline Value"
              value={totalPipelineValue}
              precision={0}
              styles={{ content: { color: token.colorPrimary } }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Deals"
              value={activeDealsCount}
              styles={{ content: { color: token.colorText } }}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Win Rate"
              value={winRate}
              suffix="%"
              styles={{ content: { color: token.colorSuccess } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Active Deal Size"
              value={avgDealSize}
              precision={0}
              styles={{ content: { color: token.colorText } }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card title="Recent Deals" extra={<a onClick={() => navigate('/pipeline')}>View All</a>}>
            <Table columns={columns} dataSource={recentDeals} pagination={false} rowKey="id" />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Upcoming Tasks">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorError, marginTop: 6 }} />
                <div>
                  <Text strong style={{ display: 'block' }}>Send revised quote to Acme Corp</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Due Today • Tech Summit 2026</Text>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorWarning, marginTop: 6 }} />
                <div>
                  <Text strong style={{ display: 'block' }}>Follow up on AV partner pricing</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Due Tomorrow • Product Launch Gala</Text>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorSuccess, marginTop: 6 }} />
                <div>
                  <Text strong style={{ display: 'block' }}>Prepare contract for signature</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Due Friday • Summer Roadshow</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
