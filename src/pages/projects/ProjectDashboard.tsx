// @ts-nocheck
import React, { useState } from 'react';
import {
  Typography, Row, Col, Card, Statistic, Tag, theme, Progress,
  Table, Alert, Button, Space, Tooltip, Badge, Modal, Form,
  Input, DatePicker, InputNumber, Select, message,
} from 'antd';
import {
  ProjectOutlined, RobotOutlined, DollarOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, WarningOutlined, EyeOutlined, CalendarOutlined,
  TeamOutlined, BarChartOutlined, PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS, getProjectStats } from '../../data/projectMockData';

const { Title, Text } = Typography;

const fmtSGD = (v: number) =>
  new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', minimumFractionDigits: 0 }).format(v);

const getTimelineHealth = (project: any): { label: string; color: string } => {
  if (project.status === 'Completed') return { label: 'Completed', color: 'success' };
  const today = new Date();
  const eventDate = new Date(project.eventDate);
  const daysToEvent = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const allTasks = project.milestones.flatMap((m: any) => m.tasks);
  const blockedOrOverdue = allTasks.filter((t: any) => t.status === 'Blocked').length;
  if (blockedOrOverdue > 0 || daysToEvent < 7) return { label: 'At Risk', color: 'warning' };
  if (project.status === 'Planning' && daysToEvent < 30) return { label: 'At Risk', color: 'warning' };
  return { label: 'On Track', color: 'success' };
};

const getBudgetHealth = (project: any): number => {
  const totalActual = Object.values(project.financials.categories).reduce(
    (sum: number, cat: any) => sum + cat.actual, 0
  );
  return Math.round((totalActual / project.totalBudget) * 100);
};

export const ProjectDashboard: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const stats = getProjectStats();
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [form] = Form.useForm();

  // Aggregate all risks from all projects
  const allRisks = MOCK_PROJECTS.flatMap(p =>
    p.risks.map(r => ({ ...r, projectName: p.name, projectId: p.id }))
  );

  const criticalRisks = allRisks.filter(r => r.severity === 'Critical');
  const highRisks = allRisks.filter(r => r.severity === 'High');
  const mediumRisks = allRisks.filter(r => r.severity === 'Medium');
  const lowRisks = allRisks.filter(r => r.severity === 'Low');

  const riskAlertType: Record<string, string> = {
    Critical: 'error',
    High: 'error',
    Medium: 'warning',
    Low: 'info',
  };

  const riskIcon: Record<string, React.ReactNode> = {
    Critical: <ExclamationCircleOutlined />,
    High: <ExclamationCircleOutlined />,
    Medium: <WarningOutlined />,
    Low: <RobotOutlined />,
  };

  const categoryTag: Record<string, string> = {
    Timeline: 'blue',
    Budget: 'green',
    Resource: 'purple',
    Quality: 'cyan',
    Dependency: 'orange',
  };

  // Total resource allocation (average of all team allocations)
  const allTeam = MOCK_PROJECTS.flatMap(p => p.team);
  const avgAllocation = allTeam.length > 0
    ? Math.round(allTeam.reduce((s, m) => s + m.allocation, 0) / allTeam.length)
    : 0;

  const totalActualAll = MOCK_PROJECTS.reduce((sum, p) => {
    return sum + Object.values(p.financials.categories).reduce((s, c: any) => s + c.actual, 0);
  }, 0);
  const budgetUtilisation = Math.round((totalActualAll / stats.totalBudget) * 100);

  const now = new Date();
  const projectsThisQuarter = MOCK_PROJECTS.filter(p => {
    const eventDate = new Date(p.eventDate);
    const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const qEnd = new Date(qStart.getFullYear(), qStart.getMonth() + 3, 0);
    return eventDate >= qStart && eventDate <= qEnd;
  }).length;

  const tableColumns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Button type="link" style={{ padding: 0, fontSize: 13, fontWeight: 500 }} onClick={() => navigate(`/project/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Event Date',
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: (val: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CalendarOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
          <Text style={{ fontSize: 13 }}>{new Date(val).toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => {
        const colorMap: Record<string, string> = {
          'In Progress': 'processing',
          'Planning': 'default',
          'Completed': 'success',
          'On Hold': 'warning',
        };
        return <Badge status={colorMap[val] as any} text={val} />;
      },
    },
    {
      title: 'Budget Health',
      key: 'budgetHealth',
      render: (_: any, record: any) => {
        const pct = getBudgetHealth(record);
        const color = pct < 70 ? token.colorSuccess : pct < 90 ? token.colorWarning : token.colorError;
        return (
          <div style={{ minWidth: 100 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ fontSize: 11 }}>{pct}%</Text>
            </div>
            <Progress percent={pct} size="small" strokeColor={color} showInfo={false} style={{ margin: 0 }} />
          </div>
        );
      },
    },
    {
      title: 'Timeline Health',
      key: 'timelineHealth',
      render: (_: any, record: any) => {
        const health = getTimelineHealth(record);
        return <Tag color={health.color}>{health.label}</Tag>;
      },
    },
    {
      title: 'Project Director',
      dataIndex: 'projectDirector',
      key: 'projectDirector',
      render: (val: string) => <Text style={{ fontSize: 13 }}>{val}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/project/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Project Management</Title>
          <Text type="secondary">Track all event projects from planning to delivery.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewProjectOpen(true)}>
          New Project
        </Button>
      </div>

      {/* Stats Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={stats.inProgress}
              styles={{ content: { color: token.colorPrimary } }}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Planning"
              value={stats.planning}
              styles={{ content: { color: token.colorWarning } }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              styles={{ content: { color: token.colorSuccess } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              styles={{ content: { color: token.colorText } }}
              prefix={<DollarOutlined />}
              formatter={v => fmtSGD(v as number)}
            />
          </Card>
        </Col>
      </Row>

      {/* AI Risk Alerts - compact */}
      {allRisks.length > 0 && (
        <Card
          size="small"
          title={
            <span style={{ fontSize: 13 }}>
              <RobotOutlined style={{ color: token.colorError, marginRight: 6, fontSize: 12 }} />
              AI Risk Alerts
              <Tag color="error" style={{ marginLeft: 8, fontSize: 10 }}>{allRisks.length} active</Tag>
            </span>
          }
          style={{ marginBottom: 24 }}
          styles={{ body: { padding: '4px 16px' } }}
        >
          {[...criticalRisks, ...highRisks, ...mediumRisks, ...lowRisks].map((risk, idx) => {
            const borderColor = risk.severity === 'Critical' || risk.severity === 'High'
              ? token.colorError
              : risk.severity === 'Medium' ? token.colorWarning : token.colorInfo;
            return (
              <div
                key={risk.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 0',
                  borderBottom: idx < allRisks.length - 1 ? `1px solid ${token.colorBorderSecondary}` : 'none',
                }}
              >
                <div style={{ width: 3, height: 14, borderRadius: 2, background: borderColor, flexShrink: 0 }} />
                <Tag
                  color={risk.severity === 'Critical' || risk.severity === 'High' ? 'red' : risk.severity === 'Medium' ? 'orange' : 'blue'}
                  style={{ fontSize: 10, margin: 0, flexShrink: 0 }}
                >
                  {risk.severity}
                </Tag>
                <Tag color={categoryTag[risk.category]} style={{ fontSize: 10, margin: 0, flexShrink: 0 }}>
                  {risk.category}
                </Tag>
                <Text style={{ fontSize: 12, flex: 1 }}>{risk.title}</Text>
                <Button
                  type="link"
                  size="small"
                  style={{ fontSize: 11, padding: 0, flexShrink: 0 }}
                  onClick={() => navigate(`/project/${risk.projectId}`)}
                >
                  {risk.projectName}
                </Button>
              </div>
            );
          })}
        </Card>
      )}

      {/* Projects Overview Table */}
      <Card
        title={
          <span>
            <ProjectOutlined style={{ marginRight: 8 }} />
            Projects Overview
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <Table
          dataSource={MOCK_PROJECTS}
          columns={tableColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Quick Stats Row */}
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Card>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>BUDGET UTILISATION (ALL PROJECTS)</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text strong style={{ fontSize: 20 }}>{budgetUtilisation}%</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{fmtSGD(totalActualAll)} / {fmtSGD(stats.totalBudget)}</Text>
            </div>
            <Progress
              percent={budgetUtilisation}
              strokeColor={budgetUtilisation < 70 ? token.colorSuccess : budgetUtilisation < 90 ? token.colorWarning : token.colorError}
              showInfo={false}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>AVERAGE RESOURCE ALLOCATION</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text strong style={{ fontSize: 20 }}>{avgAllocation}%</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{allTeam.length} team members</Text>
            </div>
            <Progress
              percent={avgAllocation}
              strokeColor={avgAllocation > 90 ? token.colorError : avgAllocation > 70 ? token.colorWarning : token.colorSuccess}
              showInfo={false}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Projects This Quarter"
              value={projectsThisQuarter}
              styles={{ content: { color: token.colorPrimary } }}
              prefix={<BarChartOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>/ {stats.total} total</Text>}
            />
          </Card>
        </Col>
      </Row>

      {/* New Project Modal */}
      <Modal
        title="Create New Project"
        open={newProjectOpen}
        onCancel={() => { setNewProjectOpen(false); form.resetFields(); }}
        onOk={() => form.validateFields().then(() => {
          message.success('Project created successfully');
          setNewProjectOpen(false);
          form.resetFields();
        })}
        okText="Create Project"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Project Name" name="name" rules={[{ required: true, message: 'Please enter a project name' }]}>
                <Input placeholder="e.g. OCBC Annual Gala 2025" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Client" name="client" rules={[{ required: true }]}>
                <Input placeholder="Client company name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Event Date" name="eventDate" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Event Venue" name="venue">
                <Input placeholder="e.g. Marina Bay Sands Grand Ballroom" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Project Director" name="director">
                <Select
                  placeholder="Select team member"
                  options={[
                    { value: 'Sarah Chen', label: 'Sarah Chen' },
                    { value: 'Marcus Tan', label: 'Marcus Tan' },
                    { value: 'Rachel Lim', label: 'Rachel Lim' },
                    { value: 'Jamie Wong', label: 'Jamie Wong' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Total Budget (SGD)" name="budget">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Link to Deal (optional)" name="dealId">
                <Select
                  placeholder="Select an existing deal"
                  allowClear
                  options={[
                    { value: 'D-2025-005', label: 'D-2025-005 — Temasek Holdings Dinner' },
                    { value: 'D-2025-006', label: 'D-2025-006 — Grab Tech Summit' },
                    { value: 'D-2025-007', label: 'D-2025-007 — UOB Corporate Retreat' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
