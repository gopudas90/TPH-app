// @ts-nocheck
import React, { useState } from 'react';
import {
  Drawer, Tabs, Typography, Tag, Select, Switch, Progress, Avatar, Space,
  Timeline, Input, Button, Divider, Upload, Empty, theme, Badge,
} from 'antd';
import {
  UserOutlined, CalendarOutlined, EyeOutlined, EyeInvisibleOutlined,
  PaperClipOutlined, SendOutlined, UploadOutlined, FireOutlined,
  LinkOutlined, ArrowRightOutlined, CloseOutlined,
} from '@ant-design/icons';
import type { SubTask, Task, Milestone, TaskComment } from '../../data/projectMockData';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface SubTaskDrawerProps {
  subtask: (SubTask & { parentTaskName?: string; milestoneName?: string; milestoneColor?: string }) | null;
  open: boolean;
  onClose: () => void;
  allMilestones?: Milestone[];
  allTasks?: Task[];
}

const statusColors: Record<string, string> = {
  'Not Started': 'default',
  'In Progress': 'processing',
  'Completed': 'success',
  'Blocked': 'error',
};

const priorityColors: Record<string, string> = {
  'Low': 'green',
  'Medium': 'blue',
  'High': 'orange',
  'Critical': 'red',
};

export const SubTaskDrawer: React.FC<SubTaskDrawerProps> = ({
  subtask,
  open,
  onClose,
  allMilestones,
  allTasks,
}) => {
  const { token } = theme.useToken();
  const [localStatus, setLocalStatus] = useState<string>(subtask?.status || 'Not Started');
  const [localPriority, setLocalPriority] = useState<string>(subtask?.priority || 'Medium');
  const [localClientVisible, setLocalClientVisible] = useState<boolean>(subtask?.clientVisible || false);
  const [localDeps, setLocalDeps] = useState<string[]>(subtask?.dependencies || []);
  const [comments, setComments] = useState<TaskComment[]>(subtask?.comments || []);
  const [newComment, setNewComment] = useState('');

  React.useEffect(() => {
    if (subtask) {
      setLocalStatus(subtask.status);
      setLocalPriority(subtask.priority);
      setLocalClientVisible(subtask.clientVisible || false);
      setLocalDeps([...(subtask.dependencies || [])]);
      setComments([...(subtask.comments || [])]);
    }
  }, [subtask]);

  if (!subtask) return null;

  const statusProgress: Record<string, number> = {
    'Not Started': 0,
    'In Progress': 50,
    'Completed': 100,
    'Blocked': 0,
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const comment: TaskComment = {
      id: `C_NEW_${Date.now()}`,
      author: 'You',
      avatar: 'ME',
      content: newComment.trim(),
      timestamp,
    };
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const detailsTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Description */}
      {subtask.description && (
        <>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>DESCRIPTION</Text>
            <Paragraph style={{ fontSize: 13, marginBottom: 0 }}>{subtask.description}</Paragraph>
          </div>
          <Divider style={{ margin: '4px 0' }} />
        </>
      )}

      {/* Milestone */}
      <div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>MILESTONE</Text>
        {allMilestones ? (
          <Select
            value={subtask.milestoneId}
            style={{ width: '100%' }}
            size="small"
            options={allMilestones.map(m => ({
              value: m.id,
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                  <span>{m.name}</span>
                </div>
              ),
            }))}
          />
        ) : subtask.milestoneName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: subtask.milestoneColor || token.colorPrimary, flexShrink: 0 }} />
            <Text style={{ fontSize: 13 }}>{subtask.milestoneName}</Text>
          </div>
        ) : (
          <Text type="secondary" style={{ fontSize: 13 }}>—</Text>
        )}
      </div>

      {/* Parent Task */}
      <div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>PARENT TASK</Text>
        <Text style={{ fontSize: 13 }}>{subtask.parentTaskName || '—'}</Text>
      </div>

      <Divider style={{ margin: '4px 0' }} />

      {/* Status & Priority */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>STATUS</Text>
          <Select
            value={localStatus}
            onChange={setLocalStatus}
            style={{ width: '100%' }}
            size="small"
            options={[
              { value: 'Not Started', label: <Tag color="default">Not Started</Tag> },
              { value: 'In Progress', label: <Tag color="processing">In Progress</Tag> },
              { value: 'Completed', label: <Tag color="success">Completed</Tag> },
              { value: 'Blocked', label: <Tag color="error">Blocked</Tag> },
            ]}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>PRIORITY</Text>
          <Select
            value={localPriority}
            onChange={setLocalPriority}
            style={{ width: '100%' }}
            size="small"
            options={[
              { value: 'Low', label: <Tag color="green">Low</Tag> },
              { value: 'Medium', label: <Tag color="blue">Medium</Tag> },
              { value: 'High', label: <Tag color="orange">High</Tag> },
              { value: 'Critical', label: <Tag color="red">Critical</Tag> },
            ]}
          />
        </div>
      </div>

      {/* Owner & Client Visible */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>OWNER</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size={24} style={{ background: token.colorPrimary, fontSize: 10 }}>
              {subtask.owner.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Text style={{ fontSize: 13 }}>{subtask.owner}</Text>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>CLIENT VISIBLE</Text>
          <Switch
            size="small"
            checked={localClientVisible}
            onChange={setLocalClientVisible}
            checkedChildren={<EyeOutlined />}
            unCheckedChildren={<EyeInvisibleOutlined />}
          />
        </div>
      </div>

      {/* Start Date & Due Date */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>START DATE</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
            <Text style={{ fontSize: 13 }}>{subtask.startDate || '—'}</Text>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>DUE DATE</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
            <Text style={{ fontSize: 13 }}>{subtask.dueDate}</Text>
          </div>
        </div>
      </div>

      {/* Estimated Hours & Actual Hours */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>ESTIMATED HOURS</Text>
          <Text style={{ fontSize: 13 }}>{subtask.estimatedHours != null ? `${subtask.estimatedHours}h` : '—'}</Text>
        </div>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>ACTUAL HOURS</Text>
          <Text style={{ fontSize: 13 }}>{subtask.actualHours != null ? `${subtask.actualHours}h` : '—'}</Text>
        </div>
      </div>

      {/* Progress */}
      <div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>PROGRESS</Text>
        <Progress
          percent={statusProgress[localStatus] ?? 0}
          size="small"
          strokeColor={localStatus === 'Blocked' ? token.colorError : localStatus === 'Completed' ? token.colorSuccess : token.colorPrimary}
          status={localStatus === 'Blocked' ? 'exception' : undefined}
        />
      </div>

      {/* Critical Path */}
      {subtask.isCriticalPath && (
        <div style={{
          padding: '8px 12px',
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: token.borderRadius,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <FireOutlined style={{ color: '#ff4d4f' }} />
          <Text style={{ fontSize: 12, color: '#ff4d4f' }}>This subtask is on the Critical Path</Text>
        </div>
      )}

      {/* Assigned Resources */}
      {((subtask.assignedEmployees && subtask.assignedEmployees.length > 0) || (subtask.assignedPartners && subtask.assignedPartners.length > 0)) && (
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>ASSIGNED RESOURCES</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(subtask.assignedEmployees || []).map(emp => (
              <div key={emp} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar size={20} icon={<UserOutlined />} style={{ background: token.colorPrimary, fontSize: 10 }} />
                <Text style={{ fontSize: 12 }}>{emp}</Text>
                <Tag style={{ fontSize: 10, margin: 0 }}>Staff</Tag>
              </div>
            ))}
            {(subtask.assignedPartners || []).map(partner => (
              <div key={partner} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar size={20} icon={<UserOutlined />} style={{ background: token.colorWarning, fontSize: 10 }} />
                <Text style={{ fontSize: 12 }}>{partner}</Text>
                <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>Partner</Tag>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {allTasks && (
        <>
          <Divider style={{ margin: '4px 0' }} />

          {/* Depends On */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                DEPENDS ON ({localDeps.length})
              </Text>
            </div>

            {localDeps.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>No dependencies</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                {localDeps.map(depId => {
                  const depTask = allTasks.find(t => t.id === depId);
                  if (!depTask) return null;
                  const blocking = depTask.status !== 'Completed';
                  return (
                    <div
                      key={depId}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '5px 10px', borderRadius: 6,
                        border: `1px solid ${blocking ? token.colorWarningBorder : token.colorBorderSecondary}`,
                        background: blocking ? token.colorWarningBg : token.colorBgContainer,
                      }}
                    >
                      <LinkOutlined style={{ fontSize: 11, color: blocking ? token.colorWarning : token.colorSuccess, flexShrink: 0 }} />
                      <Text style={{ fontSize: 12, flex: 1 }}>{depTask.name}</Text>
                      <Badge
                        status={depTask.status === 'Completed' ? 'success' : depTask.status === 'In Progress' ? 'processing' : depTask.status === 'Blocked' ? 'error' : 'default'}
                        text={<Text style={{ fontSize: 11 }}>{depTask.status}</Text>}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => setLocalDeps(prev => prev.filter(id => id !== depId))}
                        style={{ padding: '0 4px', height: 20, color: token.colorTextTertiary }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <Select
              placeholder="+ Add dependency…"
              size="small"
              style={{ width: '100%' }}
              value={null}
              showSearch
              filterOption={(input, opt) => (opt?.label as string)?.toLowerCase().includes(input.toLowerCase())}
              onChange={(val: string) => {
                if (!localDeps.includes(val)) setLocalDeps(prev => [...prev, val]);
              }}
              options={allTasks
                .filter(t => !localDeps.includes(t.id))
                .map(t => ({ value: t.id, label: t.name }))}
            />
          </div>

          {/* Blocking */}
          {(() => {
            const blockingTasks = allTasks.filter(t => t.dependencies && t.dependencies.includes(subtask?.id || ''));
            if (blockingTasks.length === 0) return null;
            return (
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                  BLOCKING ({blockingTasks.length})
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {blockingTasks.map(bt => (
                    <div
                      key={bt.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '5px 10px', borderRadius: 6,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        background: token.colorBgContainer,
                      }}
                    >
                      <ArrowRightOutlined style={{ fontSize: 11, color: token.colorPrimary, flexShrink: 0 }} />
                      <Text style={{ fontSize: 12, flex: 1 }}>{bt.name}</Text>
                      <Badge
                        status={bt.status === 'Completed' ? 'success' : bt.status === 'In Progress' ? 'processing' : bt.status === 'Blocked' ? 'error' : 'default'}
                        text={<Text style={{ fontSize: 11 }}>{bt.status}</Text>}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );

  const commentsTab = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {comments.length === 0 ? (
        <Empty description="No comments yet" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginBottom: 16 }} />
      ) : (
        <Timeline
          style={{ marginBottom: 16 }}
          items={comments.map(comment => ({
            key: comment.id,
            dot: (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: token.colorPrimary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 10, fontWeight: 600, flexShrink: 0,
              }}>
                {comment.avatar}
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
                  <Text strong style={{ fontSize: 12 }}>{comment.author}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{comment.timestamp}</Text>
                </div>
                <Text style={{ fontSize: 13 }}>{comment.content}</Text>
              </div>
            ),
          }))}
        />
      )}

      <Divider style={{ margin: '8px 0' }} />
      <div>
        <TextArea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          style={{ marginBottom: 8, fontSize: 13 }}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handlePostComment();
            }
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            onClick={handlePostComment}
            disabled={!newComment.trim()}
          >
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  );

  const filesTab = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
      <Empty
        image={<PaperClipOutlined style={{ fontSize: 48, color: token.colorTextDisabled }} />}
        description={
          <span>
            <Text type="secondary">No files attached to this subtask</Text>
          </span>
        }
      >
        <Upload>
          <Button icon={<UploadOutlined />}>Attach Files</Button>
        </Upload>
      </Empty>
    </div>
  );

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tag color={statusColors[localStatus]}>{localStatus}</Tag>
          <span style={{ fontSize: 15 }}>{subtask.name}</span>
          {subtask.isCriticalPath && <FireOutlined style={{ color: '#ff4d4f' }} />}
        </div>
      }
      width={580}
      open={open}
      onClose={onClose}
      styles={{ body: { padding: '16px 24px' } }}
    >
      <Tabs
        defaultActiveKey="details"
        size="small"
        items={[
          {
            key: 'details',
            label: 'Details',
            children: detailsTab,
          },
          {
            key: 'comments',
            label: `Comments (${comments.length})`,
            children: commentsTab,
          },
          {
            key: 'files',
            label: 'Files',
            children: filesTab,
          },
        ]}
      />
    </Drawer>
  );
};
