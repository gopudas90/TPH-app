// @ts-nocheck
import React, { useState } from 'react';
import { Popover, Button, Typography, Badge, Tabs, Space, Tag, Avatar, theme, Empty, Tooltip, Divider } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BellOutlined, CheckOutlined, CheckCircleOutlined, ClockCircleOutlined,
  DollarOutlined, TeamOutlined, CalendarOutlined, WarningOutlined,
  FileTextOutlined, MessageOutlined, ProjectOutlined, SettingOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface Notification {
  id: string;
  type: 'deal' | 'project' | 'task' | 'quote' | 'team' | 'system' | 'message';
  title: string;
  description: string;
  time: string;
  read: boolean;
  avatar?: string;
  link?: string;
}

const ICON_MAP = {
  deal: { icon: <DollarOutlined />, color: '#1677ff' },
  project: { icon: <ProjectOutlined />, color: '#722ed1' },
  task: { icon: <CheckCircleOutlined />, color: '#52c41a' },
  quote: { icon: <FileTextOutlined />, color: '#fa8c16' },
  team: { icon: <TeamOutlined />, color: '#13c2c2' },
  system: { icon: <SettingOutlined />, color: '#8c8c8c' },
  message: { icon: <MessageOutlined />, color: '#eb2f96' },
};

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'deal', title: 'Deal moved to Negotiation', description: 'Annual Sales Kickoff — Initech has entered Negotiation stage', time: '2 min ago', read: false },
  { id: '2', type: 'task', title: 'Task overdue', description: 'Finalize AV partner quote for Tech Summit 2026 is past due', time: '15 min ago', read: false },
  { id: '3', type: 'quote', title: 'Quote approved', description: 'Quote v2.0 for Tech Summit 2026 has been approved by client', time: '1 hr ago', read: false },
  { id: '4', type: 'message', title: 'New message from Jane Doe', description: 'Re: Event Brief — "Can we explore the VIP lounge on a separate floor?"', time: '2 hr ago', read: false },
  { id: '5', type: 'project', title: 'Milestone completed', description: 'Marina Bay Gala — Fabrication milestone marked as complete', time: '3 hr ago', read: true },
  { id: '6', type: 'team', title: 'New team member assigned', description: 'Wei Liang Koh added to Marina Bay Gala as AV Technician', time: '4 hr ago', read: true },
  { id: '7', type: 'deal', title: 'High-value deal created', description: 'Esports Tournament Finals — SGD 850,000 added by Sarah Jenkins', time: '5 hr ago', read: true },
  { id: '8', type: 'system', title: 'Pipeline settings updated', description: 'Corporate Events Pipeline — 2 checklist items added to Qualification stage', time: '6 hr ago', read: true },
  { id: '9', type: 'task', title: 'Task assigned to you', description: 'Setup Stage Install for Marina Bay Gala — due June 8', time: 'Yesterday', read: true },
  { id: '10', type: 'quote', title: 'Quote sent to client', description: 'Quote v1.1 for Product Launch Gala sent to Globex Inc', time: 'Yesterday', read: true },
  { id: '11', type: 'project', title: 'Risk detected', description: 'Marina Bay Gala — AI detected timeline risk on AV Setup task', time: 'Yesterday', read: true },
  { id: '12', type: 'message', title: 'New message from John Smith', description: 'PO Process — "Could you share the latest quote version?"', time: '2 days ago', read: true },
];

export const NotificationsDropdown: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filtered = activeTab === 'all'
    ? notifications
    : activeTab === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === activeTab);

  const renderNotification = (n: Notification) => {
    const iconConf = ICON_MAP[n.type];
    return (
      <div
        key={n.id}
        onClick={() => markAsRead(n.id)}
        style={{
          display: 'flex',
          gap: 10,
          padding: '10px 16px',
          cursor: 'pointer',
          background: n.read ? 'transparent' : token.colorPrimaryBg,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (n.read) (e.currentTarget as HTMLElement).style.background = token.colorFillAlter; }}
        onMouseLeave={e => { if (n.read) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <Avatar
          size={32}
          style={{ background: iconConf.color, flexShrink: 0, marginTop: 2 }}
          icon={iconConf.icon}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <Text strong={!n.read} style={{ fontSize: 12, display: 'block', lineHeight: 1.3 }}>{n.title}</Text>
            {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: token.colorPrimary, flexShrink: 0, marginTop: 4 }} />}
          </div>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', lineHeight: 1.4, marginTop: 2 }} ellipsis={{ tooltip: n.description }}>
            {n.description}
          </Text>
          <Text type="secondary" style={{ fontSize: 10, marginTop: 3, display: 'block' }}>
            <ClockCircleOutlined style={{ fontSize: 9, marginRight: 3 }} />{n.time}
          </Text>
        </div>
      </div>
    );
  };

  const content = (
    <div style={{ width: 400 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        <Text strong style={{ fontSize: 15 }}>Notifications</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" icon={<CheckOutlined />} onClick={markAllRead} style={{ fontSize: 12 }}>
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ padding: '4px 12px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="small"
          items={[
            { key: 'all', label: `All (${notifications.length})` },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'deal', label: 'Deals' },
            { key: 'task', label: 'Tasks' },
            { key: 'message', label: 'Messages' },
          ]}
          style={{ marginBottom: 0 }}
        />
      </div>

      {/* Notification list */}
      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <BellOutlined style={{ fontSize: 28, color: token.colorTextQuaternary, marginBottom: 8 }} />
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>No notifications</Text>
          </div>
        ) : (
          filtered.map(renderNotification)
        )}
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <div style={{ padding: '8px 16px', borderTop: `1px solid ${token.colorBorderSecondary}`, textAlign: 'center' }}>
          <Button type="link" size="small" style={{ fontSize: 12 }} onClick={() => { setOpen(false); navigate(location.pathname.startsWith('/client') ? '/client/notifications' : '/notifications'); }}>View All Notifications</Button>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={false}
      overlayInnerStyle={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}
    >
      <Badge count={unreadCount} size="small" offset={[-4, 4]}>
        <Button type="text" icon={<BellOutlined />} />
      </Badge>
    </Popover>
  );
};
