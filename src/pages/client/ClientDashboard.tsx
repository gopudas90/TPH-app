// @ts-nocheck
import React from 'react';
import { Typography, Row, Col, Card, Statistic, Tag, theme, Space, Timeline, Progress, Button } from 'antd';
import {
  FileTextOutlined, ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined,
  DollarOutlined, CalendarOutlined, RightOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const MOCK_CLIENT_DATA = {
  enquiries: [
    { id: 'ENQ-001', name: 'Tech Summit 2026', status: 'Quote Sent', value: 125000, date: '2026-09-15' },
    { id: 'ENQ-002', name: 'Holiday Party 2026', status: 'Under Review', value: 95000, date: '2026-12-15' },
    { id: 'ENQ-003', name: 'Q1 Town Hall 2026', status: 'Accepted', value: 45000, date: '2026-03-28' },
  ],
  projects: [
    { id: 'PRJ-001', name: 'Q1 Town Hall 2026', status: 'In Progress', progress: 65, nextMilestone: 'Setup — Jun 8' },
    { id: 'PRJ-002', name: 'Annual Gala 2025', status: 'Completed', progress: 100, nextMilestone: 'Done' },
  ],
  activity: [
    { text: 'Quote v2.0 for Tech Summit 2026 sent for your review', time: '2 hours ago', type: 'quote' },
    { text: 'Setup milestone started for Q1 Town Hall', time: '1 day ago', type: 'project' },
    { text: 'Sarah Jenkins commented on AV requirements', time: '2 days ago', type: 'message' },
    { text: 'Enquiry for Holiday Party 2026 submitted', time: '3 days ago', type: 'enquiry' },
  ],
};

export const ClientDashboard: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const fmt = (v: number) => new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(v);

  const statusColor = (s: string) => s === 'Accepted' ? 'success' : s === 'Quote Sent' ? 'processing' : s === 'Under Review' ? 'warning' : 'default';

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Welcome back, Jane</Title>
        <Text type="secondary">Here's a summary of your events and enquiries.</Text>
      </div>

      {/* KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '16px 20px' } }}>
            <Statistic title="Active Enquiries" value={2} styles={{ content: { color: token.colorPrimary, fontSize: 22 } }} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '16px 20px' } }}>
            <Statistic title="Active Projects" value={1} styles={{ content: { fontSize: 22 } }} prefix={<ProjectOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '16px 20px' } }}>
            <Statistic title="Quotes Pending" value={2} styles={{ content: { color: token.colorWarning, fontSize: 22 } }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '16px 20px' } }}>
            <Statistic title="Total Value" value={265000} precision={0} styles={{ content: { fontSize: 22 } }} prefix={<DollarOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Enquiries */}
        <Col span={12}>
          <Card size="small" title={<Text strong style={{ fontSize: 13 }}>Recent Enquiries</Text>} extra={<Button type="link" size="small" onClick={() => navigate('/client/enquiries')}>View All <RightOutlined style={{ fontSize: 9 }} /></Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MOCK_CLIENT_DATA.enquiries.map(e => (
                <div
                  key={e.id}
                  onClick={() => navigate(`/client/enquiries/${e.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgContainer,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: 13, display: 'block' }}>{e.name}</Text>
                    <Space size={8}>
                      <Text type="secondary" style={{ fontSize: 11 }}>{e.id}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}><CalendarOutlined /> {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                    </Space>
                  </div>
                  <Space>
                    <Text strong style={{ fontSize: 12 }}>{fmt(e.value)}</Text>
                    <Tag color={statusColor(e.status)} style={{ margin: 0, fontSize: 11 }}>{e.status}</Tag>
                  </Space>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Projects */}
        <Col span={12}>
          <Card size="small" title={<Text strong style={{ fontSize: 13 }}>My Projects</Text>} extra={<Button type="link" size="small" onClick={() => navigate('/client/projects')}>View All <RightOutlined style={{ fontSize: 9 }} /></Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MOCK_CLIENT_DATA.projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/client/projects/${p.id}`)}
                  style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgContainer,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text strong style={{ fontSize: 13 }}>{p.name}</Text>
                    <Tag color={p.status === 'Completed' ? 'success' : 'processing'} style={{ margin: 0, fontSize: 11 }}>{p.status}</Tag>
                  </div>
                  <Progress percent={p.progress} size="small" />
                  <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>Next: {p.nextMilestone}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Activity */}
        <Col span={24}>
          <Card size="small" title={<Text strong style={{ fontSize: 13 }}>Recent Activity</Text>} style={{ marginTop: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOCK_CLIENT_DATA.activity.map((a, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <ClockCircleOutlined style={{ color: token.colorTextSecondary, marginTop: 3, fontSize: 12 }} />
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12 }}>{a.text}</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>{a.time}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
