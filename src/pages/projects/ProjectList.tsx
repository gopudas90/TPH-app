// @ts-nocheck
import React, { useState } from 'react';
import {
  Typography, Table, Tag, Button, Space, Badge, Progress,
  theme, Tabs, Input, Dropdown, message, Tooltip,
} from 'antd';
import {
  EyeOutlined, SearchOutlined, ExclamationCircleOutlined, TeamOutlined,
  FireOutlined, CalendarOutlined, MoreOutlined, CopyOutlined,
  EditOutlined, DeleteOutlined, PauseCircleOutlined, PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS } from '../../data/projectMockData';

const { Title, Text } = Typography;

const fmtSGD = (v: number) =>
  new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', minimumFractionDigits: 0 }).format(v);

const getTimelineHealth = (project: any): { label: string; color: string } => {
  if (project.status === 'Completed') return { label: 'Completed', color: 'success' };
  const today = new Date();
  const eventDate = new Date(project.eventDate);
  const daysToEvent = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const allTasks = project.milestones.flatMap((m: any) => m.tasks);
  const blocked = allTasks.filter((t: any) => t.status === 'Blocked').length;
  if (blocked > 0 || daysToEvent < 7) return { label: 'At Risk', color: 'warning' };
  if (project.status === 'Planning' && daysToEvent < 30) return { label: 'At Risk', color: 'warning' };
  return { label: 'On Track', color: 'success' };
};

const getTotalActual = (project: any): number =>
  Object.values(project.financials.categories).reduce((s: number, c: any) => s + c.actual, 0);

export const ProjectList: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');

  const statusTabs = ['All', 'Planning', 'In Progress', 'Completed', 'On Hold'];

  const filtered = MOCK_PROJECTS.filter(p => {
    const matchStatus = activeStatus === 'All' || p.status === activeStatus;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.projectDirector.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusBadge: Record<string, string> = {
    'In Progress': 'processing',
    'Planning': 'default',
    'Completed': 'success',
    'On Hold': 'warning',
  };

  const columns = [
    {
      title: 'Project Name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (_: any, record: any) => (
        <Button
          type="link"
          style={{ padding: 0, fontSize: 13, fontWeight: 600 }}
          onClick={() => navigate(`/project/${record.id}`)}
        >
          {record.name}
        </Button>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      sorter: (a: any, b: any) => a.client.localeCompare(b.client),
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Event Date',
      dataIndex: 'eventDate',
      key: 'eventDate',
      sorter: (a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
      render: (v: string) => (
        <Space size={4}>
          <CalendarOutlined style={{ color: token.colorTextSecondary, fontSize: 11 }} />
          <Text style={{ fontSize: 13 }}>
            {new Date(v).toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Badge status={statusBadge[v] as any} text={v} />,
    },
    {
      title: 'Budget',
      key: 'budget',
      render: (_: any, record: any) => {
        const actual = getTotalActual(record);
        const pct = Math.round((actual / record.totalBudget) * 100);
        const color = pct < 70 ? token.colorSuccess : pct < 90 ? token.colorWarning : token.colorError;
        return (
          <div style={{ minWidth: 140 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ fontSize: 11 }}>{fmtSGD(actual)}</Text>
              <Text style={{ fontSize: 11 }}>{fmtSGD(record.totalBudget)}</Text>
            </div>
            <Progress percent={pct} size="small" strokeColor={color} showInfo={false} style={{ margin: 0 }} />
            <Text style={{ fontSize: 10, color }}>{pct}% used</Text>
          </div>
        );
      },
    },
    {
      title: 'Timeline Health',
      key: 'timelineHealth',
      render: (_: any, record: any) => {
        const h = getTimelineHealth(record);
        return <Tag color={h.color}>{h.label}</Tag>;
      },
    },
    {
      title: 'Risks',
      key: 'risks',
      render: (_: any, record: any) => {
        const hasHigh = record.risks.some((r: any) => r.severity === 'High' || r.severity === 'Critical');
        if (record.risks.length === 0) return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
        return (
          <Badge count={record.risks.length} color={hasHigh ? token.colorError : token.colorWarning}>
            <ExclamationCircleOutlined style={{ color: hasHigh ? token.colorError : token.colorWarning, fontSize: 16 }} />
          </Badge>
        );
      },
    },
    {
      title: 'Team',
      key: 'team',
      render: (_: any, record: any) => (
        <Space size={4}>
          <TeamOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
          <Text style={{ fontSize: 13 }}>{record.team.length}</Text>
        </Space>
      ),
    },
    {
      title: 'Project Director',
      dataIndex: 'projectDirector',
      key: 'projectDirector',
      sorter: (a: any, b: any) => a.projectDirector.localeCompare(b.projectDirector),
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size={4}>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/project/${record.id}`)}
          >
            View
          </Button>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: <EditOutlined />,
                  onClick: () => message.info('Edit project coming soon'),
                },
                {
                  key: 'duplicate',
                  label: 'Duplicate',
                  icon: <CopyOutlined />,
                  onClick: () => message.info(`Duplicating "${record.name}"...`),
                },
                { type: 'divider' },
                {
                  key: 'archive',
                  label: 'Archive',
                  icon: <PauseCircleOutlined />,
                  onClick: () => message.warning(`"${record.name}" archived`),
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => message.error(`"${record.name}" deleted`),
                },
              ],
            }}
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>All Projects</Title>
          <Text type="secondary">{MOCK_PROJECTS.length} projects total</Text>
        </div>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Tooltip title="Also auto-created from confirmed deals">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Use the Project Dashboard to create a new project')}>
              New Project
            </Button>
          </Tooltip>
        </Space>
      </div>

      <Tabs
        activeKey={activeStatus}
        onChange={setActiveStatus}
        style={{ marginBottom: 16 }}
        items={statusTabs.map(s => ({
          key: s,
          label: (
            <span>
              {s}
              {s !== 'All' && (
                <Tag style={{ marginLeft: 6, fontSize: 10 }}>
                  {MOCK_PROJECTS.filter(p => p.status === s).length}
                </Tag>
              )}
              {s === 'All' && (
                <Tag style={{ marginLeft: 6, fontSize: 10 }}>{MOCK_PROJECTS.length}</Tag>
              )}
            </span>
          ),
        }))}
      />

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20, showSizeChanger: false }}
        size="small"
      />
    </div>
  );
};
