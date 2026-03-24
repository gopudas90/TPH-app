// @ts-nocheck
import React, { useState } from 'react';
import {
  Typography, Card, Table, Tag, Progress, Space, Input, theme, Button, Collapse,
  Steps, Tooltip, Avatar, Badge, Row, Col, Statistic, Descriptions, Empty,
} from 'antd';
import {
  SearchOutlined, ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined,
  CalendarOutlined, ArrowLeftOutlined, TeamOutlined, FireOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;

const MOCK_PROJECTS = [
  {
    id: 'PRJ-001', name: 'Q1 Town Hall 2026', client: 'Acme Corp', eventDate: '2026-03-28', status: 'In Progress',
    venue: 'Suntec Convention Centre', director: 'Sarah Jenkins',
    milestones: [
      { id: 'M1', name: 'Planning', status: 'Completed', startDate: '2026-01-15', endDate: '2026-02-01', color: '#722ed1',
        tasks: [
          { id: 'T1', name: 'Concept & Theme Finalization', status: 'Completed', priority: 'High', owner: 'Sarah Chen', dueDate: '2026-01-25' },
          { id: 'T2', name: 'Vendor Shortlisting', status: 'Completed', priority: 'Medium', owner: 'Marcus Tan', dueDate: '2026-02-01' },
        ],
      },
      { id: 'M2', name: 'Production', status: 'In Progress', startDate: '2026-02-05', endDate: '2026-03-15', color: '#13c2c2',
        tasks: [
          { id: 'T3', name: 'Stage Design & Fabrication', status: 'Completed', priority: 'High', owner: 'Wei Liang', dueDate: '2026-02-28' },
          { id: 'T4', name: 'AV Equipment Setup', status: 'In Progress', priority: 'Critical', owner: 'James Lee', dueDate: '2026-03-10' },
          { id: 'T5', name: 'Lighting Design', status: 'In Progress', priority: 'Medium', owner: 'Marcus Tan', dueDate: '2026-03-12' },
        ],
      },
      { id: 'M3', name: 'Setup & Event Day', status: 'Not Started', startDate: '2026-03-25', endDate: '2026-03-28', color: '#52c41a',
        tasks: [
          { id: 'T6', name: 'Venue Load-In', status: 'Not Started', priority: 'High', owner: 'Wei Liang', dueDate: '2026-03-25' },
          { id: 'T7', name: 'Technical Rehearsal', status: 'Not Started', priority: 'Critical', owner: 'James Lee', dueDate: '2026-03-27' },
          { id: 'T8', name: 'Event Execution', status: 'Not Started', priority: 'Critical', owner: 'Sarah Chen', dueDate: '2026-03-28' },
        ],
      },
    ],
  },
  {
    id: 'PRJ-002', name: 'Annual Gala 2025', client: 'Acme Corp', eventDate: '2025-12-10', status: 'Completed',
    venue: 'Raffles Hotel', director: 'Mark Davis',
    milestones: [
      { id: 'M4', name: 'Full Event', status: 'Completed', startDate: '2025-10-01', endDate: '2025-12-10', color: '#52c41a',
        tasks: [
          { id: 'T9', name: 'All tasks completed', status: 'Completed', priority: 'Medium', owner: 'Mark Davis', dueDate: '2025-12-10' },
        ],
      },
    ],
  },
];

const statusColors = { 'Not Started': 'default', 'In Progress': 'processing', 'Completed': 'success', 'Blocked': 'error' };
const priorityColors = { Low: 'green', Medium: 'blue', High: 'orange', Critical: 'red' };

// ── List View ──
export const ClientProjects: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>My Projects</Title>
        <Text type="secondary">Track the progress of your events.</Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MOCK_PROJECTS.map(p => {
          const allTasks = p.milestones.flatMap(m => m.tasks);
          const doneTasks = allTasks.filter(t => t.status === 'Completed').length;
          const pct = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;
          return (
            <Card
              key={p.id}
              size="small"
              hoverable
              onClick={() => navigate(`/client/projects/${p.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Text strong style={{ fontSize: 15 }}>{p.name}</Text>
                    <Tag color={statusColors[p.status]} style={{ margin: 0 }}>{p.status}</Tag>
                  </div>
                  <Space size={16}>
                    <Text type="secondary" style={{ fontSize: 12 }}><CalendarOutlined /> {new Date(p.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{p.venue}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}><TeamOutlined /> {p.director}</Text>
                  </Space>
                </div>
                <div style={{ width: 200, textAlign: 'right' }}>
                  <Text style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{doneTasks}/{allTasks.length} tasks &middot; {pct}%</Text>
                  <Progress percent={pct} size="small" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ── Detail View ──
export const ClientProjectDetail: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { id } = useParams();
  const project = MOCK_PROJECTS.find(p => p.id === id) || MOCK_PROJECTS[0];
  const [search, setSearch] = useState('');

  const allTasks = project.milestones.flatMap(m => m.tasks);
  const doneTasks = allTasks.filter(t => t.status === 'Completed').length;
  const overallPct = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/client/projects')} />
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ margin: 0 }}>{project.name}</Title>
          <Space size={8}>
            <Tag color={statusColors[project.status]}>{project.status}</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}><CalendarOutlined /> {new Date(project.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{project.venue}</Text>
          </Space>
        </div>
      </div>

      {/* Overview cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '14px 20px' } }}>
            <Statistic title="Overall Progress" value={overallPct} suffix="%" styles={{ content: { fontSize: 20, color: overallPct === 100 ? token.colorSuccess : token.colorPrimary } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '14px 20px' } }}>
            <Statistic title="Tasks Completed" value={doneTasks} suffix={`/ ${allTasks.length}`} styles={{ content: { fontSize: 20 } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '14px 20px' } }}>
            <Statistic title="Milestones" value={project.milestones.filter(m => m.status === 'Completed').length} suffix={`/ ${project.milestones.length}`} styles={{ content: { fontSize: 20 } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '14px 20px' } }}>
            <Statistic title="Project Director" value={project.director} styles={{ content: { fontSize: 14 } }} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Milestone progress */}
      <Card size="small" style={{ marginBottom: 20 }} styles={{ body: { padding: '16px 24px 0' } }}>
        <Steps
          current={project.milestones.findIndex(m => m.status === 'In Progress')}
          size="small"
          labelPlacement="vertical"
          items={project.milestones.map(m => ({
            title: <span style={{ fontSize: 11 }}>{m.name}</span>,
            status: m.status === 'Completed' ? 'finish' : m.status === 'In Progress' ? 'process' : 'wait',
          }))}
          style={{ marginBottom: 16 }}
        />
      </Card>

      {/* Tasks by milestone */}
      <div style={{ marginBottom: 12 }}>
        <Input prefix={<SearchOutlined />} placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} allowClear size="small" style={{ width: 250 }} />
      </div>
      <Collapse
        defaultActiveKey={project.milestones.filter(m => m.status !== 'Completed').map(m => m.id)}
        items={project.milestones.map(milestone => {
          const mTasks = milestone.tasks.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));
          const mDone = milestone.tasks.filter(t => t.status === 'Completed').length;
          const mPct = milestone.tasks.length > 0 ? Math.round((mDone / milestone.tasks.length) * 100) : 0;
          return {
            key: milestone.id,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: milestone.color }} />
                <Text strong style={{ fontSize: 13 }}>{milestone.name}</Text>
                <Tag color={statusColors[milestone.status]} style={{ fontSize: 11 }}>{milestone.status}</Tag>
                <Text type="secondary" style={{ fontSize: 11 }}>{milestone.startDate} → {milestone.endDate}</Text>
                <Progress percent={mPct} size="small" strokeColor={milestone.color} showInfo={false} style={{ width: 80, margin: 0 }} />
                <Text style={{ fontSize: 11, color: milestone.color, fontWeight: 600 }}>{mPct}%</Text>
              </div>
            ),
            children: mTasks.length === 0 ? (
              <Empty description="No tasks match" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                dataSource={mTasks}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: 'Task', dataIndex: 'name', key: 'name', render: (v, r) => (
                    <Space size={4}>
                      {r.priority === 'Critical' && <FireOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />}
                      <Text style={{ fontSize: 12 }}>{v}</Text>
                    </Space>
                  ) },
                  { title: 'Priority', dataIndex: 'priority', key: 'priority', width: 90, render: v => <Tag color={priorityColors[v]} style={{ fontSize: 11 }}>{v}</Tag> },
                  { title: 'Owner', dataIndex: 'owner', key: 'owner', width: 120, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
                  { title: 'Due', dataIndex: 'dueDate', key: 'dueDate', width: 100, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
                  { title: 'Status', dataIndex: 'status', key: 'status', width: 120, render: v => <Tag color={statusColors[v]} style={{ fontSize: 11 }}>{v}</Tag> },
                ]}
              />
            ),
          };
        })}
      />
    </div>
  );
};
