// @ts-nocheck
import React, { useState } from 'react';
import {
  Typography, Row, Col, Card, Statistic, Tag, theme, Progress,
  Table, Alert, Button, Space, Tooltip, Badge, Tabs, Steps,
  Avatar, Collapse, Select, Input, Switch, Timeline, Divider,
  notification, Empty, Calendar, Segmented, Drawer, Descriptions,
} from 'antd';
import {
  CalendarOutlined, EyeOutlined, FireOutlined,
  TeamOutlined, DollarOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  WarningOutlined, RobotOutlined, UserOutlined,
  SearchOutlined, DownloadOutlined, EditOutlined, EnvironmentOutlined, LinkOutlined,
  ArrowLeftOutlined, ThunderboltOutlined, FileTextOutlined, FolderOutlined,
  BarsOutlined, TableOutlined, LeftOutlined, RightOutlined, MessageOutlined,
  AppstoreOutlined, HistoryOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { getProjectById } from '../../data/projectMockData';
import { GanttChart } from '../../components/projects/GanttChart';
import { TaskDrawer } from '../../components/projects/TaskDrawer';
import { SubTaskDrawer } from '../../components/projects/SubTaskDrawer';
import { NotesDrawer } from '../../components/shared/NotesDrawer';
import { DocumentsDrawer } from '../../components/shared/DocumentsDrawer';
import { SideTriggerPane } from '../../components/shared/SideTriggerPane';
import { AIChatDrawer } from '../../components/AIChatDrawer';
import type { Task, SubTask, Milestone } from '../../data/projectMockData';

const { Title, Text } = Typography;

const fmtSGD = (v: number) =>
  new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', minimumFractionDigits: 0 }).format(v);

const statusColors: Record<string, string> = {
  'Not Started': 'default',
  'In Progress': 'processing',
  'Completed': 'success',
  'Blocked': 'error',
  'Pending Approval': 'warning',
  'At Risk': 'warning',
};

const priorityColors: Record<string, string> = {
  'Low': 'green',
  'Medium': 'blue',
  'High': 'orange',
  'Critical': 'red',
};

const projectStatusColors: Record<string, string> = {
  'In Progress': 'processing',
  'Planning': 'default',
  'Completed': 'success',
  'On Hold': 'warning',
};

const milestoneStepStatus: Record<string, string> = {
  'Completed': 'finish',
  'In Progress': 'process',
  'Not Started': 'wait',
  'At Risk': 'error',
};

export const ProjectProfile: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { id } = useParams();
  const project = getProjectById(id || '');

  const [activeTab, setActiveTab] = useState('overview');
  const [taskStatusFilter, setTaskStatusFilter] = useState('All');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('All');
  const [taskSearch, setTaskSearch] = useState('');
  const [drawerTask, setDrawerTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Drawers
  const [notesOpen, setNotesOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState<(SubTask & { parentTaskName?: string; milestoneName?: string; milestoneColor?: string }) | null>(null);
  const [subtaskDrawerOpen, setSubtaskDrawerOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [milestoneDrawerOpen, setMilestoneDrawerOpen] = useState(false);
  const [notes, setNotes] = useState([
    { id: '1', date: '2025-06-07', text: 'MBS loading bay confirmed for 7am June 8. Need crew of 12.' },
    { id: '2', date: '2025-06-05', text: 'Client agreed to approve final floral change order by June 10.' },
  ]);
  const [documents, setDocuments] = useState([
    { id: '1', name: 'Project Brief v2.pdf', date: '2025-04-15', size: '2.4 MB' },
    { id: '2', name: 'Stage CAD Drawing - Final.dwg', date: '2025-04-20', size: '8.1 MB' },
    { id: '3', name: 'Client Approval Letter.pdf', date: '2025-04-25', size: '0.8 MB' },
  ]);

  // Task view
  const [taskView, setTaskView] = useState<'list' | 'gantt' | 'calendar'>('list');
  const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'day'>('month');
  const [calendarDate, setCalendarDate] = useState(dayjs());

  if (!project) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Project not found" />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  const allTasks = project.milestones.flatMap(m => m.tasks);
  const allTasksMap: Record<string, Task> = {};
  allTasks.forEach(t => { allTasksMap[t.id] = t; });
  const completedTasks = allTasks.filter(t => t.status === 'Completed').length;
  const totalActual = Object.values(project.financials.categories).reduce((s, c: any) => s + c.actual, 0);
  const totalCommitted = Object.values(project.financials.categories).reduce((s, c: any) => s + c.committed, 0);
  const budgetPct = Math.round((totalActual / project.totalBudget) * 100);
  const tasksPct = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

  const today = new Date();
  const eventDateObj = new Date(project.eventDate);
  const daysToEvent = Math.floor((eventDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const openTaskDrawer = (task: Task) => {
    setDrawerTask(task);
    setDrawerOpen(true);
  };

  const handleAIRiskScan = () => {
    notification.open({
      message: 'AI Risk Scan Complete',
      description: project.risks.length > 0
        ? `Found ${project.risks.length} risk${project.risks.length > 1 ? 's' : ''} for ${project.name}. ${project.risks.filter(r => r.severity === 'High' || r.severity === 'Critical').length} require immediate attention.`
        : 'No risks detected. Project is on track.',
      icon: <RobotOutlined style={{ color: project.risks.length > 0 ? token.colorError : token.colorSuccess }} />,
      duration: 4,
    });
  };

  const recentActivity = allTasks
    .flatMap(t => t.comments.map(c => ({ ...c, taskName: t.name, taskId: t.id })))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  // ─── Calendar Views ────────────────────────────────────────────────

  const renderCalendarMonthView = () => (
    <Calendar
      value={calendarDate}
      onChange={setCalendarDate}
      cellRender={(current, info) => {
        if (info.type !== 'date') return info.originNode;
        const dateStr = current.format('YYYY-MM-DD');
        const dayTasks = allTasks.filter(t => dateStr >= t.startDate && dateStr <= t.endDate);
        if (dayTasks.length === 0) return null;
        return (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {dayTasks.slice(0, 2).map(t => (
              <li key={t.id} style={{ overflow: 'hidden', marginBottom: 1 }}>
                <Badge
                  color={t.isCriticalPath ? '#ff4d4f' : token.colorPrimary}
                  text={
                    <Text style={{ fontSize: 10 }} ellipsis>
                      {t.name}
                    </Text>
                  }
                />
              </li>
            ))}
            {dayTasks.length > 2 && (
              <li>
                <Text type="secondary" style={{ fontSize: 10 }}>+{dayTasks.length - 2} more</Text>
              </li>
            )}
          </ul>
        );
      }}
    />
  );

  const renderCalendarWeekView = () => {
    const weekStart = calendarDate.startOf('week');
    const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
    const todayStr = dayjs().format('YYYY-MM-DD');

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Button icon={<LeftOutlined />} size="small" onClick={() => setCalendarDate(calendarDate.subtract(1, 'week'))} />
          <Text strong style={{ fontSize: 14, minWidth: 200, textAlign: 'center' }}>
            {weekStart.format('DD MMM')} — {weekStart.add(6, 'day').format('DD MMM YYYY')}
          </Text>
          <Button icon={<RightOutlined />} size="small" onClick={() => setCalendarDate(calendarDate.add(1, 'week'))} />
          <Button type="link" size="small" onClick={() => setCalendarDate(dayjs())}>Today</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {days.map(day => {
            const dayStr = day.format('YYYY-MM-DD');
            const dayTasks = allTasks.filter(t => dayStr >= t.startDate && dayStr <= t.endDate);
            const isToday = dayStr === todayStr;
            return (
              <div
                key={dayStr}
                style={{
                  border: `1px solid ${isToday ? token.colorPrimary : token.colorBorderSecondary}`,
                  borderRadius: 6,
                  padding: '8px 6px',
                  minHeight: 120,
                  background: isToday ? token.colorPrimaryBg : token.colorBgContainer,
                }}
              >
                <div style={{
                  fontWeight: isToday ? 700 : 500,
                  fontSize: 12,
                  marginBottom: 6,
                  color: isToday ? token.colorPrimary : token.colorTextSecondary,
                }}>
                  {day.format('ddd D')}
                </div>
                {dayTasks.slice(0, 4).map(t => (
                  <div
                    key={t.id}
                    onClick={() => openTaskDrawer(t)}
                    style={{
                      fontSize: 10,
                      padding: '2px 5px',
                      borderRadius: 3,
                      marginBottom: 3,
                      background: t.isCriticalPath ? '#fff1f0' : token.colorFillSecondary,
                      borderLeft: `2px solid ${t.isCriticalPath ? '#ff4d4f' : token.colorPrimary}`,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                    title={t.name}
                  >
                    {t.name}
                  </div>
                ))}
                {dayTasks.length > 4 && (
                  <Text type="secondary" style={{ fontSize: 10 }}>+{dayTasks.length - 4} more</Text>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendarDayView = () => {
    const dayStr = calendarDate.format('YYYY-MM-DD');
    const dayTasks = allTasks.filter(t => dayStr >= t.startDate && dayStr <= t.endDate);

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Button icon={<LeftOutlined />} size="small" onClick={() => setCalendarDate(calendarDate.subtract(1, 'day'))} />
          <Text strong style={{ fontSize: 14, minWidth: 220, textAlign: 'center' }}>
            {calendarDate.format('dddd, DD MMMM YYYY')}
          </Text>
          <Button icon={<RightOutlined />} size="small" onClick={() => setCalendarDate(calendarDate.add(1, 'day'))} />
          <Button type="link" size="small" onClick={() => setCalendarDate(dayjs())}>Today</Button>
        </div>
        {dayTasks.length === 0 ? (
          <Empty description="No tasks active on this day" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dayTasks.map(t => (
              <Card
                key={t.id}
                size="small"
                hoverable
                onClick={() => openTaskDrawer(t)}
                style={{
                  borderLeft: `3px solid ${t.isCriticalPath ? '#ff4d4f' : token.colorPrimary}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Space size={6}>
                      {t.isCriticalPath && (
                        <Tooltip title="Critical Path">
                          <FireOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
                        </Tooltip>
                      )}
                      <Text strong style={{ fontSize: 13 }}>{t.name}</Text>
                      <Tag color={priorityColors[t.priority]} style={{ fontSize: 11 }}>{t.priority}</Tag>
                      <Badge status={statusColors[t.status] as any} text={<Text style={{ fontSize: 12 }}>{t.status}</Text>} />
                    </Space>
                    <div style={{ marginTop: 2 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Owner: {t.owner} · {t.startDate} → {t.endDate}
                      </Text>
                    </div>
                  </div>
                  <Button size="small" onClick={e => { e.stopPropagation(); openTaskDrawer(t); }}>Details</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── Overview Tab ──────────────────────────────────────────────────
  const overviewTab = (
    <div>
      {project.risks.length > 0 && (
        <Alert
          type={project.risks.some(r => r.severity === 'Critical' || r.severity === 'High') ? 'warning' : 'info'}
          showIcon
          icon={<RobotOutlined />}
          style={{ marginBottom: 16 }}
          message={
            <span style={{ fontSize: 13 }}>
              <strong>
                {project.risks.filter(r => r.severity === 'Critical' || r.severity === 'High').length > 0
                  ? `${project.risks.filter(r => r.severity === 'Critical' || r.severity === 'High').length} high-priority risk${project.risks.filter(r => r.severity === 'Critical' || r.severity === 'High').length > 1 ? 's' : ''} detected`
                  : `${project.risks.length} risk${project.risks.length > 1 ? 's' : ''} detected`}
              </strong>
              {' — '}{project.risks[0].title}
              {project.risks.length > 1 && ` and ${project.risks.length - 1} more.`}
            </span>
          }
          closable
        />
      )}

      <Row gutter={[20, 20]}>
        <Col span={16}>
          <Card title="Milestone Progress" style={{ marginBottom: 20 }}>
            <Steps
              current={project.milestones.findIndex(m => m.status === 'In Progress')}
              items={project.milestones.map(m => ({
                title: <Text style={{ fontSize: 12 }}>{m.name}</Text>,
                status: milestoneStepStatus[m.status] as any,
                description: (
                  <div>
                    <Tag
                      color={m.status === 'Completed' ? 'success' : m.status === 'In Progress' ? 'processing' : m.status === 'At Risk' ? 'error' : 'default'}
                      style={{ fontSize: 10 }}
                    >
                      {m.status}
                    </Tag>
                    <div style={{ fontSize: 10, color: token.colorTextSecondary, marginTop: 2 }}>{m.tasks.length} tasks</div>
                  </div>
                ),
              }))}
            />
          </Card>
          <Card title="Financial Snapshot">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Budget Consumed</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 18 }}>{budgetPct}%</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{fmtSGD(totalActual)} / {fmtSGD(project.totalBudget)}</Text>
                </div>
                <Progress
                  percent={budgetPct}
                  strokeColor={budgetPct < 70 ? token.colorSuccess : budgetPct < 90 ? token.colorWarning : token.colorError}
                  showInfo={false}
                />
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Overall Task Progress</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 18 }}>{tasksPct}%</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{completedTasks} / {allTasks.length} tasks</Text>
                </div>
                <Progress percent={tasksPct} strokeColor={token.colorPrimary} showInfo={false} />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Team Snapshot" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {project.team.map(member => (
                <Tooltip key={member.id} title={`${member.name} — ${member.role} (${member.allocation}%)`}>
                  <Avatar size={32} style={{ background: token.colorPrimary, fontSize: 11, fontWeight: 600, cursor: 'default' }}>
                    {member.avatar || member.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                </Tooltip>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {project.team.map(member => (
                <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text style={{ fontSize: 12, display: 'block', fontWeight: 500 }}>{member.name}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{member.role}</Text>
                  </div>
                  <Text style={{ fontSize: 12, color: member.allocation >= 100 ? token.colorError : token.colorText }}>
                    {member.allocation}%
                  </Text>
                </div>
              ))}
            </div>
          </Card>

          <Card
            size="small"
            title={<Text style={{ fontSize: 13 }}>Activity</Text>}
            extra={
              <Button
                type="link"
                size="small"
                icon={<HistoryOutlined />}
                style={{ padding: 0, fontSize: 12 }}
                onClick={() => setActivityDrawerOpen(true)}
              >
                View All
              </Button>
            }
          >
            {recentActivity.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>No recent activity</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentActivity.slice(0, 3).map(a => (
                  <div key={a.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                      background: token.colorPrimary,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 9, fontWeight: 600,
                    }}>
                      {a.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 11, display: 'block' }}>
                        <Text strong style={{ fontSize: 11 }}>{a.author}</Text>
                        <Text type="secondary" style={{ fontSize: 10 }}> · {a.taskName}</Text>
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }} ellipsis>{a.content}</Text>
                    </div>
                  </div>
                ))}
                {recentActivity.length > 3 && (
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0, fontSize: 11, textAlign: 'left' }}
                    onClick={() => setActivityDrawerOpen(true)}
                  >
                    +{recentActivity.length - 3} more
                  </Button>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );

  // ─── Tasks Tab ─────────────────────────────────────────────────────
  const tasksTab = (
    <div>
      {/* View Toggle Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Segmented
          value={taskView}
          onChange={v => setTaskView(v as any)}
          options={[
            { value: 'list', label: 'List', icon: <BarsOutlined /> },
            { value: 'tile', label: 'Tile', icon: <AppstoreOutlined /> },
            { value: 'gantt', label: 'Gantt', icon: <TableOutlined /> },
            { value: 'calendar', label: 'Calendar', icon: <CalendarOutlined /> },
          ]}
        />
        {taskView === 'calendar' && (
          <Segmented
            value={calendarMode}
            onChange={v => setCalendarMode(v as any)}
            options={[
              { value: 'month', label: 'Month' },
              { value: 'week', label: 'Week' },
              { value: 'day', label: 'Day' },
            ]}
            size="small"
          />
        )}
      </div>

      {/* List View */}
      {taskView === 'list' && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search tasks..."
              value={taskSearch}
              onChange={e => setTaskSearch(e.target.value)}
              style={{ width: 220 }}
              allowClear
              size="small"
            />
            <Select
              value={taskStatusFilter}
              onChange={setTaskStatusFilter}
              style={{ width: 150 }}
              size="small"
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Not Started', label: 'Not Started' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Blocked', label: 'Blocked' },
                { value: 'Pending Approval', label: 'Pending Approval' },
              ]}
            />
            <Select
              value={taskPriorityFilter}
              onChange={setTaskPriorityFilter}
              style={{ width: 140 }}
              size="small"
              options={[
                { value: 'All', label: 'All Priorities' },
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' },
              ]}
            />
          </div>

          <Collapse
            defaultActiveKey={project.milestones.map(m => m.id)}
            items={project.milestones.map(milestone => {
              const filteredTasks = milestone.tasks.filter(t => {
                const matchStatus = taskStatusFilter === 'All' || t.status === taskStatusFilter;
                const matchPriority = taskPriorityFilter === 'All' || t.priority === taskPriorityFilter;
                const matchSearch = !taskSearch || t.name.toLowerCase().includes(taskSearch.toLowerCase()) || t.owner.toLowerCase().includes(taskSearch.toLowerCase());
                return matchStatus && matchPriority && matchSearch;
              });
              const mDone = milestone.tasks.filter(t => t.status === 'Completed').length;
              const mPct = milestone.tasks.length > 0 ? Math.round((mDone / milestone.tasks.length) * 100) : 0;

              const taskTableColumns = [
                {
                  title: 'Task Name',
                  key: 'name',
                  render: (_: any, task: Task) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {task.isCriticalPath && (
                        <Tooltip title="Critical Path">
                          <FireOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
                        </Tooltip>
                      )}
                      <Button
                        type="link"
                        size="small"
                        style={{ padding: 0, fontSize: 13, fontWeight: task.isCriticalPath ? 600 : 400, height: 'auto' }}
                        onClick={() => openTaskDrawer(task)}
                      >
                        {task.name}
                      </Button>
                      {task.clientVisible && (
                        <Tooltip title="Client Visible">
                          <EyeOutlined style={{ fontSize: 11, color: token.colorTextSecondary }} />
                        </Tooltip>
                      )}
                      {task.dependencies.length > 0 && (() => {
                        const unresolvedDeps = task.dependencies.filter(id => allTasksMap[id] && allTasksMap[id].status !== 'Completed');
                        const depNames = task.dependencies.map(id => allTasksMap[id]?.name || id).join(', ');
                        return (
                          <Tooltip title={`Depends on: ${depNames}${unresolvedDeps.length > 0 ? ` · ${unresolvedDeps.length} unresolved` : ' · all resolved'}`}>
                            <Tag
                              icon={<LinkOutlined />}
                              color={unresolvedDeps.length > 0 ? 'orange' : 'default'}
                              style={{ fontSize: 10, margin: 0, cursor: 'default' }}
                            >
                              {task.dependencies.length}
                            </Tag>
                          </Tooltip>
                        );
                      })()}
                    </div>
                  ),
                },
                {
                  title: 'Priority',
                  dataIndex: 'priority',
                  key: 'priority',
                  width: 90,
                  render: (v: string) => <Tag color={priorityColors[v]} style={{ fontSize: 11 }}>{v}</Tag>,
                },
                {
                  title: 'Owner',
                  dataIndex: 'owner',
                  key: 'owner',
                  width: 130,
                  render: (v: string) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar size={20} style={{ background: token.colorPrimary, fontSize: 9 }}>
                        {v.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Text style={{ fontSize: 12 }}>{v}</Text>
                    </div>
                  ),
                },
                {
                  title: 'Start',
                  dataIndex: 'startDate',
                  key: 'startDate',
                  width: 90,
                  render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
                },
                {
                  title: 'End',
                  dataIndex: 'endDate',
                  key: 'endDate',
                  width: 90,
                  render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  width: 150,
                  render: (v: string) => (
                    <Select
                      value={v}
                      size="small"
                      style={{ width: 140 }}
                      onChange={() => {}}
                      options={[
                        { value: 'Not Started', label: 'Not Started' },
                        { value: 'In Progress', label: 'In Progress' },
                        { value: 'Pending Approval', label: 'Pending Approval' },
                        { value: 'Completed', label: 'Completed' },
                        { value: 'Blocked', label: 'Blocked' },
                      ]}
                    />
                  ),
                },
                {
                  title: 'Progress',
                  key: 'progress',
                  width: 120,
                  render: (_: any, task: Task) => {
                    const statusPct: Record<string, number> = {
                      'Not Started': 0, 'In Progress': 50, 'Pending Approval': 75, 'Completed': 100, 'Blocked': 0,
                    };
                    const hasSubtasks = task.subtasks.length > 0;
                    const done = task.subtasks.filter(s => s.status === 'Completed').length;
                    const pct = hasSubtasks
                      ? Math.round((done / task.subtasks.length) * 100)
                      : (statusPct[task.status] ?? 0);
                    const color = task.status === 'Blocked'
                      ? token.colorError
                      : pct === 100 ? token.colorSuccess
                      : token.colorPrimary;
                    return (
                      <div style={{ minWidth: 110 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>
                            {hasSubtasks ? `${done}/${task.subtasks.length} subtasks` : task.status}
                          </Text>
                          <Text style={{ fontSize: 10, color }}>{pct}%</Text>
                        </div>
                        <Progress percent={pct} size="small" strokeColor={color} showInfo={false} style={{ margin: 0 }} />
                      </div>
                    );
                  },
                },
                {
                  title: '',
                  key: 'actions',
                  width: 80,
                  render: (_: any, task: Task) => (
                    <Button size="small" onClick={() => openTaskDrawer(task)}>Details</Button>
                  ),
                },
              ];

              return {
                key: milestone.id,
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: milestone.color }} />
                    <Button
                      type="link"
                      style={{ padding: 0, fontWeight: 600, fontSize: 13, height: 'auto' }}
                      onClick={e => { e.stopPropagation(); setSelectedMilestone(milestone); setMilestoneDrawerOpen(true); }}
                    >
                      {milestone.name}
                    </Button>
                    <Tag color={milestone.status === 'Completed' ? 'success' : milestone.status === 'In Progress' ? 'processing' : 'default'} style={{ fontSize: 11 }}>
                      {milestone.status}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 11 }}>{milestone.startDate} → {milestone.endDate}</Text>
                    <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{mDone}/{milestone.tasks.length}</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Progress
                        percent={mPct}
                        size="small"
                        strokeColor={milestone.color}
                        showInfo={false}
                        style={{ width: 80, margin: 0 }}
                      />
                      <Text style={{ fontSize: 11, color: milestone.color, fontWeight: 600 }}>{mPct}%</Text>
                    </div>
                  </div>
                ),
                children: filteredTasks.length === 0 ? (
                  <Empty description="No tasks match filters" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Table
                    dataSource={filteredTasks}
                    columns={taskTableColumns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    expandable={{
                      expandedRowRender: (task: Task) => (
                        <div style={{ paddingLeft: 24, paddingTop: 8 }}>
                          {task.subtasks.length === 0 ? (
                            <Text type="secondary" style={{ fontSize: 12 }}>No subtasks</Text>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {task.subtasks.map(st => (
                                <div
                                  key={st.id}
                                  onClick={() => { setSelectedSubtask({ ...st, parentTaskName: task.name, milestoneName: milestone.name, milestoneColor: milestone.color }); setSubtaskDrawerOpen(true); }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
                                    border: `1px solid ${token.colorBorderSecondary}`,
                                    background: token.colorBgContainer,
                                  }}
                                >
                                  <CheckCircleOutlined style={{
                                    color: st.status === 'Completed' ? token.colorSuccess : token.colorTextDisabled,
                                    fontSize: 12,
                                  }} />
                                  <Text style={{
                                    fontSize: 12, flex: 1,
                                    textDecoration: st.status === 'Completed' ? 'line-through' : 'none',
                                    color: st.status === 'Completed' ? token.colorTextDisabled : token.colorPrimary,
                                  }}>
                                    {st.name}
                                  </Text>
                                  <Tag color={st.priority === 'Critical' ? 'red' : st.priority === 'High' ? 'orange' : st.priority === 'Medium' ? 'blue' : 'green'} style={{ fontSize: 10 }}>{st.priority}</Tag>
                                  <Text type="secondary" style={{ fontSize: 11 }}>{st.owner}</Text>
                                  <Text type="secondary" style={{ fontSize: 11 }}>Due: {st.dueDate}</Text>
                                  <Progress
                                    percent={st.status === 'Completed' ? 100 : st.status === 'In Progress' ? 50 : 0}
                                    size="small"
                                    strokeColor={st.status === 'Completed' ? token.colorSuccess : st.status === 'In Progress' ? token.colorPrimary : token.colorBorderSecondary}
                                    showInfo={false}
                                    style={{ width: 60, margin: 0, flexShrink: 0 }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ),
                      rowExpandable: (task: Task) => task.subtasks.length > 0,
                    }}
                  />
                ),
              };
            })}
          />
        </>
      )}

      {/* Tile View */}
      {taskView === 'tile' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search tasks..."
              value={taskSearch}
              onChange={e => setTaskSearch(e.target.value)}
              style={{ width: 220 }}
              allowClear
              size="small"
            />
            <Select value={taskStatusFilter} onChange={setTaskStatusFilter} style={{ width: 150 }} size="small"
              options={['All', 'Not Started', 'In Progress', 'Completed', 'Blocked', 'Pending Approval'].map(v => ({ value: v, label: v === 'All' ? 'All Statuses' : v }))}
            />
            <Select value={taskPriorityFilter} onChange={setTaskPriorityFilter} style={{ width: 140 }} size="small"
              options={['All', 'Low', 'Medium', 'High', 'Critical'].map(v => ({ value: v, label: v === 'All' ? 'All Priorities' : v }))}
            />
          </div>

          {project.milestones.map(milestone => {
            const filteredTasks = milestone.tasks.filter(t => {
              const matchStatus = taskStatusFilter === 'All' || t.status === taskStatusFilter;
              const matchPriority = taskPriorityFilter === 'All' || t.priority === taskPriorityFilter;
              const matchSearch = !taskSearch || t.name.toLowerCase().includes(taskSearch.toLowerCase());
              return matchStatus && matchPriority && matchSearch;
            });
            if (filteredTasks.length === 0) return null;
            const tileMDone = milestone.tasks.filter(t => t.status === 'Completed').length;
            const tileMPct = milestone.tasks.length > 0 ? Math.round((tileMDone / milestone.tasks.length) * 100) : 0;

            return (
              <div key={milestone.id} style={{ marginBottom: 28 }}>
                {/* Milestone header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: milestone.color }} />
                  <Button
                    type="link"
                    style={{ padding: 0, fontWeight: 600, fontSize: 13, height: 'auto' }}
                    onClick={() => { setSelectedMilestone(milestone); setMilestoneDrawerOpen(true); }}
                  >
                    {milestone.name}
                  </Button>
                  <Tag color={milestone.status === 'Completed' ? 'success' : milestone.status === 'In Progress' ? 'processing' : 'default'} style={{ fontSize: 11 }}>
                    {milestone.status}
                  </Tag>
                  <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{tileMDone}/{milestone.tasks.length}</Text>
                  <Progress
                    percent={tileMPct}
                    size="small"
                    strokeColor={milestone.color}
                    showInfo={false}
                    style={{ width: 80, margin: 0 }}
                  />
                  <Text style={{ fontSize: 11, color: milestone.color, fontWeight: 600 }}>{tileMPct}%</Text>
                </div>

                {/* Tile grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {filteredTasks.map(task => {
                    const doneSubtasks = task.subtasks.filter(s => s.status === 'Completed').length;
                    return (
                      <Card
                        key={task.id}
                        size="small"
                        hoverable
                        onClick={() => openTaskDrawer(task)}
                        style={{
                          borderLeft: `3px solid ${task.isCriticalPath ? '#ff4d4f' : milestone.color}`,
                          cursor: 'pointer',
                        }}
                        styles={{ body: { padding: '12px 14px' } }}
                      >
                        {/* Title */}
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                            {task.isCriticalPath && (
                              <FireOutlined style={{ color: '#ff4d4f', fontSize: 11, marginTop: 2, flexShrink: 0 }} />
                            )}
                            <Text strong style={{ fontSize: 13, lineHeight: '1.4' }}>{task.name}</Text>
                          </div>
                        </div>

                        {/* Notion-style vertical property rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {[
                            {
                              label: 'Assignee',
                              value: (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <Avatar size={14} style={{ background: token.colorPrimary, fontSize: 8 }}>
                                    {task.owner.split(' ').map(n => n[0]).join('')}
                                  </Avatar>
                                  <Text style={{ fontSize: 12 }}>{task.owner}</Text>
                                </div>
                              ),
                            },
                            {
                              label: 'Status',
                              value: <Badge status={statusColors[task.status] as any} text={<Text style={{ fontSize: 12 }}>{task.status}</Text>} />,
                            },
                            {
                              label: 'Priority',
                              value: <Tag color={priorityColors[task.priority]} style={{ fontSize: 10, margin: 0 }}>{task.priority}</Tag>,
                            },
                            {
                              label: 'Due',
                              value: <Text style={{ fontSize: 12 }}>{task.endDate}</Text>,
                            },
                            ...(task.subtasks.length > 0 ? [{
                              label: 'Subtasks',
                              value: (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Text style={{ fontSize: 12 }}>{doneSubtasks}/{task.subtasks.length}</Text>
                                  <Progress
                                    percent={task.subtasks.length > 0 ? Math.round((doneSubtasks / task.subtasks.length) * 100) : 0}
                                    size="small"
                                    showInfo={false}
                                    style={{ width: 60, margin: 0 }}
                                  />
                                </div>
                              ),
                            }] : []),
                            ...(task.clientVisible ? [{
                              label: 'Visibility',
                              value: <Text style={{ fontSize: 12 }}><EyeOutlined style={{ marginRight: 4, fontSize: 11 }} />Client visible</Text>,
                            }] : []),
                            ...(task.dependencies.length > 0 ? [{
                              label: 'Depends on',
                              value: (() => {
                                const unresolved = task.dependencies.filter(id => allTasksMap[id] && allTasksMap[id].status !== 'Completed');
                                return (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <LinkOutlined style={{ fontSize: 10, color: unresolved.length > 0 ? token.colorWarning : token.colorSuccess }} />
                                    <Text style={{ fontSize: 12 }}>{task.dependencies.length} task{task.dependencies.length > 1 ? 's' : ''}</Text>
                                    {unresolved.length > 0 && (
                                      <Tag color="orange" style={{ fontSize: 10, margin: 0, lineHeight: '16px', padding: '0 4px' }}>
                                        {unresolved.length} open
                                      </Tag>
                                    )}
                                  </div>
                                );
                              })(),
                            }] : []),
                          ].map((row, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', minHeight: 20 }}>
                              <Text type="secondary" style={{ fontSize: 11, width: 68, flexShrink: 0 }}>{row.label}</Text>
                              <div>{row.value}</div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gantt View */}
      {taskView === 'gantt' && (
        <GanttChart
          milestones={project.milestones}
          projectStartDate={project.startDate}
          projectEndDate={project.endDate}
          eventDate={project.eventDate}
        />
      )}

      {/* Calendar View */}
      {taskView === 'calendar' && (
        <div>
          {calendarMode === 'month' && renderCalendarMonthView()}
          {calendarMode === 'week' && renderCalendarWeekView()}
          {calendarMode === 'day' && renderCalendarDayView()}
        </div>
      )}
    </div>
  );

  // ─── Resources Tab ─────────────────────────────────────────────────
  const mockAssetsForProject = [
    { id: 'A001', name: 'ROE CB5 LED Wall', category: 'AV Equipment', assignedToTask: 'AV System Setup', checkoutDate: project.startDate, checkinDate: project.eventDate, status: 'Reserved' },
    { id: 'A002', name: 'GrandMA3 Light Console', category: 'Lighting', assignedToTask: 'Lighting Installation', checkoutDate: project.startDate, checkinDate: project.eventDate, status: 'Reserved' },
    { id: 'A003', name: 'L-Acoustics Line Array', category: 'AV Equipment', assignedToTask: 'AV System Setup', checkoutDate: project.startDate, checkinDate: project.eventDate, status: 'Reserved' },
  ];

  const mockPartnersForProject = allTasks.flatMap(t => t.assignedPartners).filter((v, i, a) => a.indexOf(v) === i).filter(Boolean);

  const teamColumns = [
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: (v: string, r: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={28} style={{ background: token.colorPrimary, fontSize: 10 }}>
            {r.avatar || v.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Text strong style={{ fontSize: 13 }}>{v}</Text>
        </div>
      ),
    },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (v: string) => <Tag>{v}</Tag> },
    {
      title: 'Allocation', dataIndex: 'allocation', key: 'allocation',
      render: (v: number) => (
        <div style={{ minWidth: 120 }}>
          <Text style={{ fontSize: 12 }}>{v}%</Text>
          <Progress
            percent={v}
            size="small"
            strokeColor={v >= 100 ? token.colorError : v >= 80 ? token.colorWarning : token.colorSuccess}
            showInfo={false}
            style={{ margin: 0 }}
          />
        </div>
      ),
    },
    {
      title: 'Period', key: 'period',
      render: (_: any, r: any) => <Text style={{ fontSize: 12 }}>{r.startDate} → {r.endDate}</Text>,
    },
  ];

  const assetColumns = [
    { title: 'Asset Name', dataIndex: 'name', key: 'name', render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Assigned To Task', dataIndex: 'assignedToTask', key: 'assignedToTask', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Check-out', dataIndex: 'checkoutDate', key: 'checkoutDate', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Check-in', dataIndex: 'checkinDate', key: 'checkinDate', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color="orange">{v}</Tag> },
  ];

  const partnerTableData = mockPartnersForProject.map((partner, idx) => {
    const partnerTask = allTasks.find(t => t.assignedPartners.includes(partner));
    const relatedPO = project.purchaseOrders.find(po => po.vendor === partner);
    return {
      key: idx,
      partner,
      service: relatedPO?.description || 'Event Services',
      assignedTask: partnerTask?.name || '—',
      value: relatedPO?.amount || 0,
      poStatus: relatedPO?.status || 'Draft',
    };
  });

  const partnerColumns = [
    { title: 'Partner Name', dataIndex: 'partner', key: 'partner', render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Service', dataIndex: 'service', key: 'service', render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Assigned Task', dataIndex: 'assignedTask', key: 'assignedTask', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Value (SGD)', dataIndex: 'value', key: 'value', render: (v: number) => <Text style={{ fontSize: 13 }}>{v > 0 ? fmtSGD(v) : '—'}</Text> },
    {
      title: 'PO Status', dataIndex: 'poStatus', key: 'poStatus',
      render: (v: string) => {
        const colorMap: Record<string, string> = { Draft: 'default', Sent: 'processing', Acknowledged: 'warning', Invoiced: 'warning', Paid: 'success' };
        return <Tag color={colorMap[v] || 'default'}>{v}</Tag>;
      },
    },
  ];

  const resourcesTab = (
    <Tabs
      type="card"
      size="small"
      items={[
        {
          key: 'team',
          label: `Team (${project.team.length})`,
          children: <Table dataSource={project.team} columns={teamColumns} rowKey="id" pagination={false} size="small" />,
        },
        {
          key: 'assets',
          label: `Assets (${mockAssetsForProject.length})`,
          children: <Table dataSource={mockAssetsForProject} columns={assetColumns} rowKey="id" pagination={false} size="small" />,
        },
        {
          key: 'partners',
          label: `Partners (${partnerTableData.length})`,
          children: partnerTableData.length === 0
            ? <Empty description="No partners assigned" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            : <Table dataSource={partnerTableData} columns={partnerColumns} rowKey="key" pagination={false} size="small" />,
        },
      ]}
    />
  );

  // ─── Event Details Tab ─────────────────────────────────────────────
  const grossMarginPct_ev = project.revenue > 0
    ? Math.round(((project.revenue - totalActual) / project.revenue) * 100)
    : 0;

  const eventDetailsTab = (
    <Row gutter={[24, 24]}>
      <Col span={16}>
        {/* General Information */}
        <Card
          title={<span style={{ fontSize: 14 }}>General Information</span>}
          extra={<Button type="link" icon={<EditOutlined />} size="small">Edit</Button>}
          size="small"
          style={{ marginBottom: 20 }}
        >
          <Descriptions
            column={2}
            labelStyle={{ color: token.colorTextSecondary, fontSize: 13 }}
            contentStyle={{ fontSize: 13 }}
          >
            <Descriptions.Item label="Event Name">{project.eventName}</Descriptions.Item>
            <Descriptions.Item label="Client">{project.client}</Descriptions.Item>
            <Descriptions.Item label="Event Type">Corporate Gala</Descriptions.Item>
            <Descriptions.Item label="Format">In-Person</Descriptions.Item>
            <Descriptions.Item label="Event Date">
              {new Date(project.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Descriptions.Item>
            <Descriptions.Item label="Setup Date">{project.startDate}</Descriptions.Item>
            <Descriptions.Item label="Teardown Date">{project.endDate}</Descriptions.Item>
            <Descriptions.Item label="Expected Attendance">500 Pax</Descriptions.Item>
            <Descriptions.Item label="Project Director">{project.projectDirector}</Descriptions.Item>
            <Descriptions.Item label="Account Manager">{project.accountManager}</Descriptions.Item>
            <Descriptions.Item label="Deal Reference">
              <Tag>{project.dealId}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Project Status">
              <Badge status={projectStatusColors[project.status] as any} text={project.status} />
            </Descriptions.Item>
          </Descriptions>
          <Divider style={{ margin: '12px 0' }} />
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>DESCRIPTION</Text>
          <Text style={{ fontSize: 13 }}>
            Full end-to-end event production for {project.client}'s {project.eventName}. Scope covers creative concept,
            stage and set fabrication, AV and lighting systems, logistics, setup and teardown. Delivered at {project.eventVenue}.
          </Text>
        </Card>

        {/* Venue Details */}
        <Card
          title={<span style={{ fontSize: 14 }}>Venue Details</span>}
          extra={<Button type="link" icon={<EditOutlined />} size="small">Edit</Button>}
          size="small"
          style={{ marginBottom: 20 }}
        >
          <Descriptions
            column={2}
            labelStyle={{ color: token.colorTextSecondary, fontSize: 13 }}
            contentStyle={{ fontSize: 13 }}
          >
            <Descriptions.Item label="Venue Name" span={2}>
              <Space>
                <EnvironmentOutlined style={{ color: token.colorPrimary }} />
                <Text strong>{project.eventVenue}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Hall / Room">Main Ballroom</Descriptions.Item>
            <Descriptions.Item label="Capacity">800 Pax</Descriptions.Item>
            <Descriptions.Item label="Loading Access">10pm – 6am (restricted)</Descriptions.Item>
            <Descriptions.Item label="Parking">Basement P2 – dedicated bay</Descriptions.Item>
            <Descriptions.Item label="Setup Constraints" span={2}>
              Loading bay access limited. No drilling on walls. Ceiling rigging requires venue approval 14 days prior.
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Production Requirements */}
        <Card
          title={<span style={{ fontSize: 14 }}>Production Requirements</span>}
          extra={<Button type="link" icon={<EditOutlined />} size="small">Edit</Button>}
          size="small"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Main stage with LED wall backdrop (min 10m x 4m)',
              'Full line array audio system with front fills',
              'Moving head lighting rig + ambient wash',
              'VIP lounge area with soft furnishings',
              '4 breakout rooms with individual AV setups',
              'Live streaming setup for remote attendees',
              'Branded registration counters and wayfinding',
              'Post-event teardown within 12 hours of event end',
            ].map((req, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0' }}>
                <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 12, marginTop: 2, flexShrink: 0 }} />
                <Text style={{ fontSize: 13 }}>{req}</Text>
              </div>
            ))}
          </div>
        </Card>
      </Col>

      <Col span={8}>
        {/* Client Contact */}
        <Card
          title={<span style={{ fontSize: 14 }}>Client Contact</span>}
          extra={<Button type="link" icon={<EditOutlined />} size="small">Edit</Button>}
          size="small"
          style={{ marginBottom: 20 }}
        >
          <Descriptions
            column={1}
            labelStyle={{ color: token.colorTextSecondary, fontSize: 12 }}
            contentStyle={{ fontSize: 13 }}
          >
            <Descriptions.Item label="Company">{project.client}</Descriptions.Item>
            <Descriptions.Item label="Contact Person">James Lim</Descriptions.Item>
            <Descriptions.Item label="Title">Head of Corporate Affairs</Descriptions.Item>
            <Descriptions.Item label="Email">james.lim@{project.client.toLowerCase().replace(/\s+/g, '')}.com</Descriptions.Item>
            <Descriptions.Item label="Phone">+65 9123 4567</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Financial Overview */}
        <Card
          title={<span style={{ fontSize: 14 }}>Financial Overview</span>}
          extra={<Button type="link" icon={<EditOutlined />} size="small">Edit</Button>}
          size="small"
          style={{ marginBottom: 20 }}
        >
          <Descriptions
            column={1}
            labelStyle={{ color: token.colorTextSecondary, fontSize: 12 }}
            contentStyle={{ fontSize: 13 }}
          >
            <Descriptions.Item label="Contract Value">
              <Text strong style={{ color: token.colorSuccess }}>{fmtSGD(project.revenue)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Total Budget">{fmtSGD(project.totalBudget)}</Descriptions.Item>
            <Descriptions.Item label="Overhead Allocation">{fmtSGD(project.overheadAllocation)}</Descriptions.Item>
            <Descriptions.Item label="Target Gross Margin">35%</Descriptions.Item>
            <Descriptions.Item label="Projected Margin">
              <div>
                <Text style={{ fontSize: 13, color: grossMarginPct_ev >= 30 ? token.colorSuccess : token.colorWarning }}>
                  {grossMarginPct_ev}%
                </Text>
                <Progress
                  percent={grossMarginPct_ev}
                  size="small"
                  strokeColor={grossMarginPct_ev >= 30 ? token.colorSuccess : token.colorWarning}
                  showInfo={false}
                  style={{ marginTop: 4 }}
                />
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Key Dates */}
        <Card title={<span style={{ fontSize: 14 }}>Key Dates</span>} size="small">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Project Kick-off', date: project.startDate, color: token.colorPrimary },
              { label: 'Design Approval', date: project.milestones[0]?.endDate, color: '#722ed1' },
              { label: 'Fabrication Complete', date: project.milestones[2]?.endDate, color: '#1677ff' },
              { label: 'Event Day', date: project.eventDate, color: token.colorError },
              { label: 'Project Close', date: project.endDate, color: token.colorTextSecondary },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <Text style={{ fontSize: 12 }}>{item.label}</Text>
                </div>
                <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>{item.date}</Text>
              </div>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );

  // ─── Quote Tab ────────────────────────────────────────────────────
  const quoteItemLabels: Record<string, string> = {
    labour_internal: 'Event Production & Creative Team',
    labour_partner: 'Specialist Contractors & Services',
    equipment: 'AV, Lighting & Technical Equipment',
    logistics: 'Logistics & Transportation',
    venue: 'Venue Support & Facilitation',
  };

  const contingencyBudget = project.financials.categories.contingency.budget;
  const operatingBudget = Object.entries(project.financials.categories)
    .filter(([key]) => key !== 'contingency')
    .reduce((s, [, c]: [string, any]) => s + c.budget, 0);

  const quoteLineItems = Object.entries(project.financials.categories)
    .filter(([key]) => key !== 'contingency')
    .map(([key, cat]: [string, any], idx) => ({
      no: idx + 1,
      key,
      description: quoteItemLabels[key] || key,
      unitPrice: operatingBudget > 0 ? Math.round((cat.budget / operatingBudget) * project.revenue) : 0,
    }));

  // Adjust last item for rounding so sum = project.revenue
  const qSum = quoteLineItems.reduce((s, i) => s + i.unitPrice, 0);
  if (quoteLineItems.length > 0) quoteLineItems[quoteLineItems.length - 1].unitPrice += project.revenue - qSum;

  const quoteGST = Math.round(project.revenue * 0.09);
  const quoteTotal = project.revenue + quoteGST;
  const quoteRef = `QT-${project.dealId.replace('D-', '')}`;
  const quoteDate = project.startDate;
  const quoteValidUntil = (() => {
    const d = new Date(project.startDate);
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  })();

  const paymentSchedule = [
    { name: 'Deposit (Upon Signing)', pct: 30, dueDate: project.startDate },
    { name: 'Progress Payment', pct: 40, dueDate: project.milestones[2]?.endDate || project.eventDate },
    { name: 'Final Payment', pct: 30, dueDate: project.eventDate },
  ].map(p => ({ ...p, amount: Math.round((p.pct / 100) * project.revenue) }));

  const quoteTab = (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 20 }}>
        <Tooltip title="Export functionality coming soon">
          <Button icon={<DownloadOutlined />} disabled>Download PDF</Button>
        </Tooltip>
      </div>

      {/* Quote Document */}
      <div style={{
        maxWidth: 860,
        margin: '0 auto',
        background: '#fff',
        color: '#1a1a1a',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '48px 56px',
        borderRadius: 8,
        border: '1px solid #e8e8e8',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40, background: '#ff6b6b', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 'bold', fontSize: 20,
              }}>T</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>The Production House</div>
                <div style={{ fontSize: 11, color: '#888' }}>Event Production & Management</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#888', lineHeight: 1.8, marginTop: 8 }}>
              10 Anson Road, #12-01<br />
              International Plaza, Singapore 079903<br />
              +65 6789 0123 · quotes@tph.sg
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ff6b6b', marginBottom: 4 }}>QUOTATION</div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>{quoteRef}</div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Date: {quoteDate}</div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Valid Until: {quoteValidUntil}</div>
            <span style={{
              display: 'inline-block', padding: '2px 10px', borderRadius: 4, fontSize: 11,
              background: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f',
            }}>Approved</span>
          </div>
        </div>

        {/* Client & Event Block */}
        <div style={{ background: '#f8f9fa', borderRadius: 6, padding: '16px 20px', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Prepared For</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{project.client}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Attn: James Lim, Head of Corporate Affairs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Event</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{project.eventName}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{project.eventVenue}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Event Date</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {new Date(project.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Prepared by: {project.projectDirector}</div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
              {['#', 'Service / Deliverable', 'Qty', 'Unit Price (SGD)', 'Total (SGD)'].map((h, i) => (
                <th key={i} style={{
                  padding: '10px 8px', textAlign: i === 0 ? 'left' : i === 1 ? 'left' : 'right',
                  fontSize: 11, fontWeight: 600, color: '#1a1a1a',
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quoteLineItems.map(item => (
              <tr key={item.key} style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '12px 8px', fontSize: 12, color: '#888', width: 28 }}>{item.no}</td>
                <td style={{ padding: '12px 8px', fontSize: 13, fontWeight: 500 }}>{item.description}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13 }}>1</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13 }}>
                  {fmtSGD(item.unitPrice)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>
                  {fmtSGD(item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 36 }}>
          <div style={{ width: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13, borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#666' }}>Subtotal</span>
              <span style={{ fontWeight: 500 }}>{fmtSGD(project.revenue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13, borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#666' }}>Discount</span>
              <span style={{ color: '#888' }}>—</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13, borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#666' }}>GST (9%)</span>
              <span>{fmtSGD(quoteGST)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 18, fontWeight: 700, borderTop: '2px solid #1a1a1a', marginTop: 4 }}>
              <span>Total</span>
              <span style={{ color: '#ff6b6b' }}>{fmtSGD(quoteTotal)}</span>
            </div>
          </div>
        </div>

        {/* Payment Schedule */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Payment Schedule</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #d9d9d9', background: '#fafafa' }}>
                {['Milestone', '%', 'Amount (SGD)', 'Due Date'].map((h, i) => (
                  <th key={i} style={{
                    padding: '8px 10px', textAlign: i < 2 ? 'left' : 'right',
                    fontSize: 11, color: '#888', fontWeight: 600,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paymentSchedule.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 10px', fontSize: 12 }}>{p.name}</td>
                  <td style={{ padding: '8px 10px', fontSize: 12 }}>{p.pct}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: 12, fontWeight: 500 }}>{fmtSGD(p.amount)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: 12 }}>{p.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Terms */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Terms & Conditions</div>
          <div style={{ fontSize: 12, color: '#555', lineHeight: 1.9 }}>
            1. This quotation is valid for 30 days from the date of issue.<br />
            2. All prices are in Singapore Dollars (SGD) and subject to 9% GST.<br />
            3. A signed acceptance and deposit payment of 30% is required to confirm the booking.<br />
            4. Cancellation within 30 days of the event date will forfeit the deposit.<br />
            5. Any changes to scope after acceptance may be subject to a Change Order and additional charges.<br />
            6. The Production House retains the right to use event photography for portfolio purposes unless otherwise agreed.
          </div>
        </div>

        {/* Signatures */}
        <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Authorized by</div>
            <div style={{ width: 200, borderBottom: '1px solid #bbb', height: 44, marginBottom: 6 }} />
            <div style={{ fontSize: 13, fontWeight: 500 }}>{project.projectDirector}</div>
            <div style={{ fontSize: 11, color: '#888' }}>The Production House Singapore</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Client Acceptance</div>
            <div style={{ width: 200, borderBottom: '1px solid #bbb', height: 44, marginBottom: 6 }} />
            <div style={{ fontSize: 13, fontWeight: 500 }}>{project.client}</div>
            <div style={{ fontSize: 11, color: '#888' }}>Date: _______________</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Financials Tab ────────────────────────────────────────────────
  const catLabels: Record<string, string> = {
    labour_internal: 'Labour (Internal)',
    labour_partner: 'Labour (Partner)',
    equipment: 'Equipment',
    logistics: 'Logistics',
    venue: 'Venue',
    contingency: 'Contingency',
  };

  const catEntries = Object.entries(project.financials.categories).map(([key, cat]: [string, any]) => ({
    key,
    label: catLabels[key],
    budget: cat.budget,
    committed: cat.committed,
    actual: cat.actual,
    remaining: cat.budget - cat.actual,
    pct: cat.budget > 0 ? Math.round((cat.actual / cat.budget) * 100) : 0,
  }));

  const totalRevenue = project.revenue;
  const grossProfit = totalRevenue - totalActual;
  const grossMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;
  const netProfit = grossProfit - project.overheadAllocation;
  const netMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const costTableColumns = [
    { title: 'Category', dataIndex: 'label', key: 'label', render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Budget', dataIndex: 'budget', key: 'budget', render: (v: number) => <Text style={{ fontSize: 13 }}>{fmtSGD(v)}</Text> },
    { title: 'Committed', dataIndex: 'committed', key: 'committed', render: (v: number) => <Text style={{ fontSize: 13 }}>{fmtSGD(v)}</Text> },
    { title: 'Actual', dataIndex: 'actual', key: 'actual', render: (v: number) => <Text style={{ fontSize: 13 }}>{fmtSGD(v)}</Text> },
    {
      title: 'Remaining', dataIndex: 'remaining', key: 'remaining',
      render: (v: number) => (
        <Text style={{ fontSize: 13, color: v < 0 ? token.colorError : v < 1000 ? token.colorWarning : token.colorSuccess }}>
          {fmtSGD(v)}
        </Text>
      ),
    },
    {
      title: '% Used', dataIndex: 'pct', key: 'pct',
      render: (v: number) => (
        <div style={{ minWidth: 80 }}>
          <Progress percent={v} size="small" strokeColor={v > 100 ? token.colorError : v > 80 ? token.colorWarning : token.colorSuccess} />
        </div>
      ),
    },
  ];

  const poStatusColors: Record<string, string> = { Draft: 'default', Sent: 'processing', Acknowledged: 'warning', Invoiced: 'warning', Paid: 'success' };

  const poColumns = [
    { title: 'PO ID', dataIndex: 'id', key: 'id', render: (v: string) => <Tag style={{ fontSize: 11 }}>{v}</Tag> },
    { title: 'Vendor', dataIndex: 'vendor', key: 'vendor', render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (v: string) => <Tag color="blue" style={{ fontSize: 11 }}>{v}</Tag> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (v: number) => <Text strong style={{ fontSize: 13 }}>{fmtSGD(v)}</Text> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (v: string) => <Badge status={poStatusColors[v] as any} text={v} /> },
    { title: 'Issue Date', dataIndex: 'issueDate', key: 'issueDate', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
  ];

  const coColumns = [
    { title: 'CO ID', dataIndex: 'id', key: 'id', render: (v: string) => <Tag style={{ fontSize: 11 }}>{v}</Tag> },
    { title: 'Title', dataIndex: 'title', key: 'title', render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Requested By', dataIndex: 'requestedBy', key: 'requestedBy', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: 'Budget Impact', dataIndex: 'budgetImpact', key: 'budgetImpact',
      render: (v: number) => (
        <Text style={{ fontSize: 13, color: v > 0 ? token.colorSuccess : token.colorError }}>
          {v > 0 ? '+' : ''}{fmtSGD(v)}
        </Text>
      ),
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (v: string) => (
        <Badge status={v === 'Approved' ? 'success' : v === 'Pending' ? 'processing' : 'error'} text={v} />
      ),
    },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
  ];

  const approvedCOTotal = project.changeOrders.filter(co => co.status === 'Approved').reduce((s, co) => s + co.budgetImpact, 0);

  const plStyle = {
    row: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` },
    indent: { display: 'flex', justifyContent: 'space-between', padding: '6px 0 6px 20px', borderBottom: `1px solid ${token.colorBorderSecondary}` },
    totalRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: `2px solid ${token.colorBorder}`, marginTop: 4 },
  };

  const financialsTab = (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={4}><Card size="small"><Statistic title="Total Revenue" value={totalRevenue} formatter={v => fmtSGD(v as number)} styles={{ content: { fontSize: 16, color: token.colorSuccess } }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="Total Budget" value={project.totalBudget} formatter={v => fmtSGD(v as number)} styles={{ content: { fontSize: 16 } }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="Total Committed" value={totalCommitted} formatter={v => fmtSGD(v as number)} styles={{ content: { fontSize: 16, color: token.colorWarning } }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="Total Actual" value={totalActual} formatter={v => fmtSGD(v as number)} styles={{ content: { fontSize: 16, color: token.colorPrimary } }} /></Card></Col>
        <Col span={8}><Card size="small"><Statistic title="Gross Margin" value={grossProfit} formatter={v => `${fmtSGD(v as number)} (${grossMargin}%)`} styles={{ content: { fontSize: 16, color: grossProfit >= 0 ? token.colorSuccess : token.colorError } }} /></Card></Col>
      </Row>

      <Card title="Cost Breakdown by Category" style={{ marginBottom: 24 }}>
        <Table
          dataSource={catEntries}
          columns={costTableColumns}
          rowKey="key"
          pagination={false}
          size="small"
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}><Text strong>Total</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={1}><Text strong>{fmtSGD(project.totalBudget)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={2}><Text strong>{fmtSGD(totalCommitted)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={3}><Text strong>{fmtSGD(totalActual)}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <Text strong style={{ color: project.totalBudget - totalActual < 0 ? token.colorError : token.colorSuccess }}>
                  {fmtSGD(project.totalBudget - totalActual)}
                </Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5}><Text strong>{Math.round((totalActual / project.totalBudget) * 100)}%</Text></Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>

      <Card>
        <Tabs
          size="small"
          items={[
            {
              key: 'pl',
              label: 'P&L Statement',
              children: (
                <div style={{ maxWidth: 500 }}>
                  <div style={plStyle.row}><Text strong>Revenue</Text><Text strong style={{ color: token.colorSuccess }}>{fmtSGD(totalRevenue)}</Text></div>
                  {catEntries.filter(c => c.key !== 'contingency').map(c => (
                    <div key={c.key} style={plStyle.indent}>
                      <Text type="secondary">Less: {c.label}</Text>
                      <Text>({fmtSGD(c.actual)})</Text>
                    </div>
                  ))}
                  <div style={plStyle.totalRow}>
                    <Text strong>Gross Profit</Text>
                    <Text strong style={{ color: grossProfit >= 0 ? token.colorSuccess : token.colorError }}>
                      {fmtSGD(grossProfit)} ({grossMargin}%)
                    </Text>
                  </div>
                  <div style={plStyle.indent}><Text type="secondary">Less: Overhead Allocation</Text><Text>({fmtSGD(project.overheadAllocation)})</Text></div>
                  <div style={plStyle.totalRow}>
                    <Text strong>Net Margin</Text>
                    <Text strong style={{ color: netProfit >= 0 ? token.colorSuccess : token.colorError }}>
                      {fmtSGD(netProfit)} ({netMargin}%)
                    </Text>
                  </div>
                </div>
              ),
            },
            {
              key: 'pos',
              label: `Purchase Orders (${project.purchaseOrders.length})`,
              children: <Table dataSource={project.purchaseOrders} columns={poColumns} rowKey="id" pagination={false} size="small" />,
            },
            {
              key: 'cos',
              label: `Change Orders (${project.changeOrders.length})`,
              children: (
                <div>
                  {project.changeOrders.length === 0 ? (
                    <Empty description="No change orders" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <>
                      <Table dataSource={project.changeOrders} columns={coColumns} rowKey="id" pagination={false} size="small" style={{ marginBottom: 12 }} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>Total Approved Change Orders:</Text>
                        <Text strong style={{ fontSize: 13, color: token.colorSuccess }}>{fmtSGD(approvedCOTotal)}</Text>
                      </div>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );

  // ─── Page Render ───────────────────────────────────────────────────
  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/projects/list')}
        style={{ marginBottom: 12, paddingLeft: 0 }}
        size="small"
      >
        All Projects
      </Button>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <Title level={2} style={{ margin: 0 }}>{project.name}</Title>
              <Tag color={projectStatusColors[project.status]}>{project.status}</Tag>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                Event: {new Date(project.eventDate).toLocaleDateString('en-SG', { day: '2-digit', month: 'long', year: 'numeric' })}
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>📍 {project.eventVenue}</Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                <TeamOutlined style={{ marginRight: 4 }} />{project.client}
              </Text>
            </div>
          </div>
          <Space wrap>
            <Button
              icon={<RobotOutlined />}
              onClick={handleAIRiskScan}
              danger={project.risks.length > 0}
            >
              AI Risk Scan
              {project.risks.length > 0 && <Tag color="red" style={{ marginLeft: 4, fontSize: 10 }}>{project.risks.length}</Tag>}
            </Button>
            <Tooltip title="Export functionality coming soon">
              <Button icon={<DownloadOutlined />} disabled>Export</Button>
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Budget Used"
              value={budgetPct}
              suffix="%"
              styles={{ content: { color: budgetPct < 70 ? token.colorSuccess : budgetPct < 90 ? token.colorWarning : token.colorError } }}
              prefix={<DollarOutlined />}
            />
            <Progress percent={budgetPct} size="small" showInfo={false} strokeColor={budgetPct < 70 ? token.colorSuccess : budgetPct < 90 ? token.colorWarning : token.colorError} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tasks Complete"
              value={tasksPct}
              suffix={`% (${completedTasks}/${allTasks.length})`}
              styles={{ content: { color: token.colorPrimary } }}
              prefix={<CheckCircleOutlined />}
            />
            <Progress percent={tasksPct} size="small" showInfo={false} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Team Members" value={project.team.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Days to Event"
              value={daysToEvent > 0 ? daysToEvent : 0}
              suffix={daysToEvent > 0 ? 'days' : ''}
              styles={{ content: { color: daysToEvent <= 0 ? token.colorTextDisabled : daysToEvent <= 14 ? token.colorError : token.colorText } }}
              prefix={<CalendarOutlined />}
              formatter={v => daysToEvent <= 0 ? 'Completed' : v}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'overview', label: 'Overview', children: overviewTab },
          { key: 'tasks', label: `Tasks (${allTasks.length})`, children: tasksTab },
          { key: 'resources', label: 'Resources', children: resourcesTab },
          { key: 'financials', label: 'Financials', children: financialsTab },
          { key: 'event', label: 'Event Details', children: eventDetailsTab },
          { key: 'quote', label: 'Quote', children: quoteTab },
        ]}
      />

      {/* Task Drawer */}
      <TaskDrawer
        task={drawerTask}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        allTasks={allTasks}
        onSubtaskClick={st => {
          const parentMilestone = project.milestones.find(m => m.tasks.some(t => t.id === drawerTask?.id));
          setSelectedSubtask({
            ...st,
            parentTaskName: drawerTask?.name,
            milestoneName: parentMilestone?.name,
            milestoneColor: parentMilestone?.color,
          });
          setSubtaskDrawerOpen(true);
        }}
      />

      {/* Notes Drawer */}
      <NotesDrawer
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        notes={notes}
        onAdd={text => setNotes(prev => [...prev, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], text }])}
        onDelete={id => setNotes(prev => prev.filter(n => n.id !== id))}
      />

      {/* Documents Drawer */}
      <DocumentsDrawer
        open={docsOpen}
        onClose={() => setDocsOpen(false)}
        documents={documents}
        onDelete={id => setDocuments(prev => prev.filter(d => d.id !== id))}
      />

      {/* AI Chat Drawer */}
      <AIChatDrawer
        open={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        dealName={project.name}
        dealId={project.id}
      />

      {/* Sticky Side Trigger for Notes & Docs */}
      <SideTriggerPane
        onNotesClick={() => setNotesOpen(true)}
        onDocumentsClick={() => setDocsOpen(true)}
      />

      {/* Subtask Detail Drawer */}
      <SubTaskDrawer
        subtask={selectedSubtask}
        open={subtaskDrawerOpen}
        onClose={() => setSubtaskDrawerOpen(false)}
        allMilestones={project.milestones}
        allTasks={allTasks}
      />

      {/* Milestone Detail Drawer */}
      <Drawer
        title={
          selectedMilestone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: selectedMilestone.color }} />
              <span style={{ fontSize: 15 }}>{selectedMilestone.name}</span>
              <Tag color={selectedMilestone.status === 'Completed' ? 'success' : selectedMilestone.status === 'In Progress' ? 'processing' : 'default'}>
                {selectedMilestone.status}
              </Tag>
            </div>
          )
        }
        width={520}
        open={milestoneDrawerOpen}
        onClose={() => setMilestoneDrawerOpen(false)}
        styles={{ body: { padding: '20px 24px' } }}
      >
        {selectedMilestone && (() => {
          const mTasks = selectedMilestone.tasks || [];
          const mDone = mTasks.filter((t: Task) => t.status === 'Completed').length;
          const mPct = mTasks.length > 0 ? Math.round((mDone / mTasks.length) * 100) : 0;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Date range */}
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>START DATE</Text>
                  <Text style={{ fontSize: 13 }}>{selectedMilestone.startDate}</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>END DATE</Text>
                  <Text style={{ fontSize: 13 }}>{selectedMilestone.endDate}</Text>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>TASK PROGRESS</Text>
                  <Text style={{ fontSize: 12 }}>{mDone}/{mTasks.length} tasks done</Text>
                </div>
                <Progress
                  percent={mPct}
                  strokeColor={selectedMilestone.color}
                  showInfo={false}
                  style={{ marginBottom: 0 }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>{mPct}% complete</Text>
              </div>

              <Divider style={{ margin: '4px 0' }} />

              {/* Task list */}
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>TASKS</Text>
                {mTasks.length === 0 ? (
                  <Empty description="No tasks in this milestone" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {mTasks.map((t: Task) => (
                      <div
                        key={t.id}
                        onClick={() => { setMilestoneDrawerOpen(false); openTaskDrawer(t); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                          border: `1px solid ${token.colorBorderSecondary}`,
                          background: token.colorBgContainer,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = token.colorFillSecondary)}
                        onMouseLeave={e => (e.currentTarget.style.background = token.colorBgContainer)}
                      >
                        <CheckCircleOutlined style={{
                          color: t.status === 'Completed' ? token.colorSuccess : token.colorTextDisabled,
                          fontSize: 13, flexShrink: 0,
                        }} />
                        {t.isCriticalPath && (
                          <FireOutlined style={{ color: '#ff4d4f', fontSize: 11, flexShrink: 0 }} />
                        )}
                        <Text style={{
                          fontSize: 13, flex: 1,
                          textDecoration: t.status === 'Completed' ? 'line-through' : 'none',
                          color: t.status === 'Completed' ? token.colorTextDisabled : token.colorText,
                        }}>
                          {t.name}
                        </Text>
                        <Tag color={priorityColors[t.priority]} style={{ fontSize: 10, margin: 0, flexShrink: 0 }}>{t.priority}</Tag>
                        <Badge status={statusColors[t.status] as any} style={{ flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Drawer>

      {/* Activity Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HistoryOutlined />
            <span>All Activity</span>
          </div>
        }
        width={480}
        open={activityDrawerOpen}
        onClose={() => setActivityDrawerOpen(false)}
        styles={{ body: { padding: '20px 24px' } }}
      >
        {recentActivity.length === 0 ? (
          <Empty description="No activity yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Timeline
            items={recentActivity.map(a => ({
              key: a.id,
              dot: (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: token.colorPrimary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 10, fontWeight: 600, flexShrink: 0,
                }}>
                  {a.avatar}
                </div>
              ),
              children: (
                <div style={{
                  padding: '10px 14px',
                  background: token.colorBgLayout,
                  borderRadius: token.borderRadius,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 12 }}>{a.author}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{a.timestamp}</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                    on <Text strong style={{ fontSize: 11 }}>{a.taskName}</Text>
                  </Text>
                  <Text style={{ fontSize: 13 }}>{a.content}</Text>
                </div>
              ),
            }))}
          />
        )}
      </Drawer>

      {/* AI Chat FAB */}
      <Tooltip title="AI Assistant" placement="left">
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined style={{ fontSize: 20 }} />}
          onClick={() => setAiChatOpen(true)}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 52,
            height: 52,
            boxShadow: '0 4px 16px rgba(22, 119, 255, 0.35)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </Tooltip>
    </div>
  );
};
