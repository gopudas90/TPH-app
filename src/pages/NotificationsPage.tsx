// @ts-nocheck
import React, { useState } from 'react';
import {
  Typography, Card, Button, Space, Tag, Avatar, theme, Empty, Tooltip,
  Segmented, Input, Select, Checkbox, Popconfirm, message, Badge, Divider,
} from 'antd';
import {
  CheckOutlined, CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined,
  DollarOutlined, TeamOutlined, CalendarOutlined, WarningOutlined,
  FileTextOutlined, MessageOutlined, ProjectOutlined, SettingOutlined,
  SearchOutlined, FilterOutlined, BellOutlined, InboxOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Notification {
  id: string;
  type: 'deal' | 'project' | 'task' | 'quote' | 'team' | 'system' | 'message';
  title: string;
  description: string;
  time: string;
  date: string;
  read: boolean;
}

const ICON_MAP = {
  deal: { icon: <DollarOutlined />, color: '#1677ff', label: 'Deal' },
  project: { icon: <ProjectOutlined />, color: '#722ed1', label: 'Project' },
  task: { icon: <CheckCircleOutlined />, color: '#52c41a', label: 'Task' },
  quote: { icon: <FileTextOutlined />, color: '#fa8c16', label: 'Quote' },
  team: { icon: <TeamOutlined />, color: '#13c2c2', label: 'Team' },
  system: { icon: <SettingOutlined />, color: '#8c8c8c', label: 'System' },
  message: { icon: <MessageOutlined />, color: '#eb2f96', label: 'Message' },
};

const MOCK: Notification[] = [
  { id: '1', type: 'deal', title: 'Deal moved to Negotiation', description: 'Annual Sales Kickoff — Initech has entered Negotiation stage. Client feedback has been documented and revised terms are being prepared.', time: '10:30 AM', date: 'Today', read: false },
  { id: '2', type: 'task', title: 'Task overdue', description: 'Finalize AV partner quote for Tech Summit 2026 is past due. Originally due yesterday — please update status or request extension.', time: '10:15 AM', date: 'Today', read: false },
  { id: '3', type: 'quote', title: 'Quote approved by client', description: 'Quote v2.0 for Tech Summit 2026 (SGD 89,000) has been approved by Jane Doe at Acme Corp. Proceed with contract preparation.', time: '9:00 AM', date: 'Today', read: false },
  { id: '4', type: 'message', title: 'New message from Jane Doe', description: 'Re: Event Brief — "Can we explore having the VIP lounge on a separate floor? Our leadership team wants a quieter space for 1-on-1 meetings."', time: '8:30 AM', date: 'Today', read: false },
  { id: '5', type: 'project', title: 'Milestone completed', description: 'Marina Bay Gala — Fabrication milestone has been marked as complete. All 4 tasks under this milestone are done. Next: Logistics.', time: '7:00 AM', date: 'Today', read: true },
  { id: '6', type: 'team', title: 'New team member assigned', description: 'Wei Liang Koh has been added to Marina Bay Gala 2025 as AV Technician with 80% allocation from June 1 to June 14.', time: '6:00 PM', date: 'Yesterday', read: true },
  { id: '7', type: 'deal', title: 'High-value deal created', description: 'Esports Tournament Finals — SGD 850,000 added by Sarah Jenkins. Client: Cyberdyne Systems. Complex technical requirements flagged.', time: '3:00 PM', date: 'Yesterday', read: true },
  { id: '8', type: 'system', title: 'Pipeline settings updated', description: 'Corporate Events Pipeline — 2 checklist items added to Qualification stage and 1 item marked as required in Proposal Development.', time: '2:00 PM', date: 'Yesterday', read: true },
  { id: '9', type: 'task', title: 'Task assigned to you', description: 'Setup Stage Install for Marina Bay Gala has been assigned to you. Due: June 8. Priority: High. 4 subtasks pending.', time: '11:00 AM', date: 'Yesterday', read: true },
  { id: '10', type: 'quote', title: 'Quote sent to client', description: 'Quote v1.1 for Product Launch Gala (SGD 92,500) has been sent to Michael Scott at Globex Inc via email.', time: '9:30 AM', date: 'Yesterday', read: true },
  { id: '11', type: 'project', title: 'AI risk detected', description: 'Marina Bay Gala — Timeline risk on AV Setup task. Current schedule leaves only 2 days buffer before event date. Consider fast-tracking.', time: '8:00 AM', date: 'Yesterday', read: true },
  { id: '12', type: 'message', title: 'New message from John Smith', description: 'PO Process — "Could you share the latest quote version? We\'ll need it for our internal PO process — usually takes about a week."', time: '4:00 PM', date: '22 Mar', read: true },
  { id: '13', type: 'deal', title: 'Deal stage transition', description: 'Tech Startup Mixer — Aviato moved from Negotiation to Awaiting Approval. Verbal confirmation received, awaiting signed contract.', time: '2:00 PM', date: '22 Mar', read: true },
  { id: '14', type: 'task', title: 'Task completed', description: 'Client Presentation Deck for Marina Bay Gala marked as complete by Sarah Chen. Subtask under Concept Development milestone.', time: '11:00 AM', date: '22 Mar', read: true },
  { id: '15', type: 'team', title: 'Team allocation changed', description: 'Marcus Tan\'s allocation on Marina Bay Gala updated from 60% to 80% for the setup phase (June 8-14).', time: '9:00 AM', date: '22 Mar', read: true },
  { id: '16', type: 'project', title: 'Change order approved', description: 'Marina Bay Gala — Change order "Additional floral arrangements" (SGD 4,500) approved by project director.', time: '3:00 PM', date: '21 Mar', read: true },
  { id: '17', type: 'system', title: 'Master data updated', description: 'New event type "Hybrid / Virtual Event" added to master data by admin.', time: '10:00 AM', date: '21 Mar', read: true },
  { id: '18', type: 'deal', title: 'Deal probability updated', description: 'Global Leadership Retreat — Stark Industries probability increased from 40% to 55% based on latest engagement signals.', time: '9:00 AM', date: '21 Mar', read: true },
];

export const NotificationsPage: React.FC = () => {
  const { token } = theme.useToken();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (filter !== 'all' && filter !== 'unread' && n.type !== filter) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by date
  const grouped: { date: string; items: Notification[] }[] = [];
  filtered.forEach(n => {
    const last = grouped[grouped.length - 1];
    if (last && last.date === n.date) last.items.push(n);
    else grouped.push({ date: n.date, items: [n] });
  });

  const markAsRead = (ids: string[]) => {
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
    setSelected(new Set());
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    message.success('All notifications marked as read');
  };

  const deleteNotifications = (ids: string[]) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
    setSelected(new Set());
    message.success(`${ids.length} notification(s) deleted`);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(n => n.id)));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Notifications</Title>
          <Text type="secondary">{unreadCount} unread &middot; {notifications.length} total</Text>
        </div>
        <Space>
          {selected.size > 0 && (
            <>
              <Button size="small" icon={<CheckOutlined />} onClick={() => markAsRead([...selected])}>
                Mark Read ({selected.size})
              </Button>
              <Popconfirm title={`Delete ${selected.size} notification(s)?`} onConfirm={() => deleteNotifications([...selected])} okText="Delete" okType="danger">
                <Button size="small" danger icon={<DeleteOutlined />}>Delete ({selected.size})</Button>
              </Popconfirm>
            </>
          )}
          {unreadCount > 0 && (
            <Button size="small" icon={<CheckOutlined />} onClick={markAllRead}>Mark All Read</Button>
          )}
        </Space>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Segmented
          value={filter}
          onChange={v => { setFilter(v as string); setSelected(new Set()); }}
          options={[
            { value: 'all', label: `All (${notifications.length})` },
            { value: 'unread', label: `Unread (${unreadCount})` },
            { value: 'deal', label: 'Deals' },
            { value: 'task', label: 'Tasks' },
            { value: 'project', label: 'Projects' },
            { value: 'quote', label: 'Quotes' },
            { value: 'message', label: 'Messages' },
            { value: 'team', label: 'Team' },
            { value: 'system', label: 'System' },
          ]}
          size="small"
        />
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search notifications..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          size="small"
          style={{ width: 240 }}
        />
      </div>

      {/* Select all */}
      {filtered.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <Checkbox
            checked={selected.size === filtered.length && filtered.length > 0}
            indeterminate={selected.size > 0 && selected.size < filtered.length}
            onChange={selectAll}
          >
            <Text style={{ fontSize: 12 }}>Select all ({filtered.length})</Text>
          </Checkbox>
        </div>
      )}

      {/* Notification groups */}
      {grouped.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <InboxOutlined style={{ fontSize: 40, color: token.colorTextQuaternary, marginBottom: 12 }} />
            <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>No notifications match your filters</Text>
          </div>
        </Card>
      ) : (
        grouped.map(group => (
          <div key={group.date} style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 12, color: token.colorTextSecondary, display: 'block', marginBottom: 8 }}>{group.date}</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {group.items.map(n => {
                const iconConf = ICON_MAP[n.type];
                const isSelected = selected.has(n.id);
                return (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: isSelected ? token.colorPrimaryBg : n.read ? token.colorBgContainer : token.colorPrimaryBg,
                      border: `1px solid ${isSelected ? token.colorPrimary : n.read ? token.colorBorderSecondary : token.colorPrimaryBorder}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => markAsRead([n.id])}
                  >
                    <Checkbox
                      checked={isSelected}
                      onClick={e => e.stopPropagation()}
                      onChange={() => toggleSelect(n.id)}
                      style={{ marginTop: 2 }}
                    />
                    <Avatar size={36} style={{ background: iconConf.color, flexShrink: 0 }} icon={iconConf.icon} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                          <Text strong={!n.read} style={{ fontSize: 13 }}>{n.title}</Text>
                          {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: token.colorPrimary, flexShrink: 0 }} />}
                        </div>
                        <Space size={8} style={{ flexShrink: 0 }}>
                          <Tag style={{ margin: 0, fontSize: 10 }} color={iconConf.color}>{iconConf.label}</Tag>
                          <Text type="secondary" style={{ fontSize: 11 }}>{n.time}</Text>
                        </Space>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4, lineHeight: 1.5 }}>
                        {n.description}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
