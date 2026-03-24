// @ts-nocheck
import React from 'react';
import { Typography, Row, Col, Card, Statistic, Tag, theme, Space, Timeline, Progress, Button, Avatar } from 'antd';
import {
  FileTextOutlined, ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined,
  DollarOutlined, CalendarOutlined, RightOutlined, ExclamationCircleOutlined,
  MessageOutlined, WarningOutlined, BellOutlined,
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

        {/* Pending Actions */}
        <Col span={8}>
          <Card size="small" title={<Space size={6}><WarningOutlined style={{ color: token.colorWarning }} /><Text strong style={{ fontSize: 13 }}>Action Required</Text></Space>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { text: 'Review quote for Tech Summit 2026', type: 'Quote review', urgent: true },
                { text: 'Approve AV equipment upgrade', type: 'Approval', urgent: true },
                { text: 'Confirm VIP lounge floor preference', type: 'Feedback', urgent: false },
              ].map((a, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, background: a.urgent ? token.colorWarningBg : token.colorFillAlter, border: `1px solid ${a.urgent ? token.colorWarningBorder : token.colorBorderSecondary}` }}>
                  <Text style={{ fontSize: 12 }}>{a.text}</Text>
                  <Tag color={a.urgent ? 'warning' : 'default'} style={{ margin: 0, fontSize: 10 }}>{a.type}</Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Upcoming Events */}
        <Col span={8}>
          <Card size="small" title={<Space size={6}><CalendarOutlined style={{ color: token.colorPrimary }} /><Text strong style={{ fontSize: 13 }}>Upcoming Events</Text></Space>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'Q1 Town Hall 2026', date: '28 Mar 2026', daysLeft: 4 },
                { name: 'Tech Summit 2026', date: '15 Sep 2026', daysLeft: 175 },
                { name: 'Holiday Party 2026', date: '15 Dec 2026', daysLeft: 266 },
              ].map((e, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, border: `1px solid ${token.colorBorderSecondary}` }}>
                  <div>
                    <Text strong style={{ fontSize: 12, display: 'block' }}>{e.name}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{e.date}</Text>
                  </div>
                  <Tag color={e.daysLeft <= 7 ? 'error' : e.daysLeft <= 30 ? 'warning' : 'default'} style={{ margin: 0, fontSize: 10 }}>{e.daysLeft}d</Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Recent Messages */}
        <Col span={8}>
          <Card size="small" title={<Space size={6}><MessageOutlined style={{ color: token.colorPrimary }} /><Text strong style={{ fontSize: 13 }}>Recent Messages</Text></Space>} extra={<Button type="link" size="small" onClick={() => navigate('/client/messages')}>View All</Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { from: 'Sarah Jenkins', text: 'I\'ll check with MBS on Level 5 availability...', time: '2 hrs ago' },
                { from: 'Mark Davis', text: 'We\'ve received your enquiry and will get back...', time: '3 days ago' },
              ].map((m, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, padding: '6px 10px', borderRadius: 6, border: `1px solid ${token.colorBorderSecondary}`, cursor: 'pointer' }} onClick={() => navigate('/client/messages')}>
                  <Avatar size={24} style={{ background: token.colorPrimary, fontSize: 10, flexShrink: 0 }}>{m.from.split(' ').map(n => n[0]).join('')}</Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: 11 }}>{m.from}</Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }} ellipsis>{m.text}</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 10, flexShrink: 0 }}>{m.time}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Activity */}
        <Col span={24}>
          <Card size="small" title={<Text strong style={{ fontSize: 13 }}>Recent Activity</Text>}>
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
