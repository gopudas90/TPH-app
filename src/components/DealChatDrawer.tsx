// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Drawer, Input, Button, Typography, Avatar, Space, Tag, theme, Tooltip, Badge, Empty } from 'antd';
import {
  SendOutlined, WhatsAppOutlined, MailOutlined, MessageOutlined,
  SearchOutlined, StarFilled, CheckOutlined, CheckCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface ChatMessage {
  id: string;
  channel: 'whatsapp' | 'email' | 'sms';
  direction: 'inbound' | 'outbound';
  from: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  subject?: string;
  starred?: boolean;
}

interface DealChatDrawerProps {
  open: boolean;
  onClose: () => void;
  dealName: string;
  contacts: Contact[];
}

const CHANNEL_CONFIG = {
  whatsapp: { label: 'WhatsApp', icon: <WhatsAppOutlined />, color: '#25D366', tagColor: 'green' },
  email: { label: 'Email', icon: <MailOutlined />, color: '#1677ff', tagColor: 'blue' },
  sms: { label: 'SMS', icon: <MessageOutlined />, color: '#722ed1', tagColor: 'purple' },
};

const generateMockMessages = (contact: Contact): ChatMessage[] => {
  const firstName = contact.name.split(' ')[0];
  return [
    {
      id: '1', channel: 'email', direction: 'outbound', from: 'You',
      content: `Hi ${firstName},\n\nFollowing up on our call earlier — I've attached the preliminary event brief for the upcoming summit. Could you review the venue requirements section and let me know if the capacity works for your team?\n\nBest regards,\nSarah Jenkins\nTPH Singapore`,
      timestamp: '18 Mar 2026, 10:15 AM', status: 'read', subject: 'Event Brief — Tech Summit 2026',
    },
    {
      id: '2', channel: 'email', direction: 'inbound', from: contact.name,
      content: `Hi Sarah,\n\nThanks for sending this over. The venue capacity looks good — 500 pax is what we're targeting. One thing: can we explore having the VIP lounge on a separate floor? Our leadership team wants a quieter space.\n\nAlso, any chance we can get the AV options by Thursday?\n\nCheers,\n${firstName}`,
      timestamp: '18 Mar 2026, 02:30 PM', status: 'read', subject: 'Re: Event Brief — Tech Summit 2026',
    },
    {
      id: '3', channel: 'whatsapp', direction: 'outbound', from: 'You',
      content: `Hi ${firstName}, just wanted to confirm — the AV options doc will be ready by tomorrow. Will send it over by EOD 👍`,
      timestamp: '18 Mar 2026, 03:45 PM', status: 'read',
    },
    {
      id: '4', channel: 'whatsapp', direction: 'inbound', from: contact.name,
      content: 'Perfect, thanks Sarah! Quick question — is the loading dock at MBS available for setup on the 14th or do we need to go through their ops team separately?',
      timestamp: '18 Mar 2026, 03:52 PM', status: 'read',
    },
    {
      id: '5', channel: 'whatsapp', direction: 'outbound', from: 'You',
      content: 'Good question — we do need to coordinate with MBS ops. I\'ll set that up and loop you in once confirmed. Usually takes 2-3 days for their approval.',
      timestamp: '18 Mar 2026, 04:10 PM', status: 'delivered',
    },
    {
      id: '6', channel: 'sms', direction: 'outbound', from: 'You',
      content: `Hi ${firstName}, reminder: our proposal review call is scheduled for tomorrow at 2pm SGT. Dial-in link sent to your email. - Sarah, TPH`,
      timestamp: '19 Mar 2026, 09:00 AM', status: 'delivered',
    },
    {
      id: '7', channel: 'sms', direction: 'inbound', from: contact.name,
      content: 'Got it, see you at 2pm. Can we also briefly touch on the budget split between AV and scenic?',
      timestamp: '19 Mar 2026, 09:15 AM', status: 'read',
    },
    {
      id: '8', channel: 'email', direction: 'outbound', from: 'You',
      content: `Hi ${firstName},\n\nPlease find attached the updated quote (v2.0) incorporating the negotiated discount on lighting and scenic. Let me know if you need anything else for your internal PO process.\n\nBest,\nSarah`,
      timestamp: '20 Mar 2026, 02:30 PM', status: 'read', subject: 'Updated Quote v2.0 — Tech Summit 2026',
    },
  ];
};

export const DealChatDrawer: React.FC<DealChatDrawerProps> = ({ open, onClose, dealName, contacts }) => {
  const { token } = theme.useToken();
  const primaryContact = contacts[0] || { id: '0', name: 'Contact', role: '', email: '', phone: '' };

  const [activeChannel, setActiveChannel] = useState<'all' | 'whatsapp' | 'email' | 'sms'>('whatsapp');
  const [inputValue, setInputValue] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => generateMockMessages(primaryContact));
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open, messages]);

  const filteredMessages = messages.filter(m => {
    if (activeChannel !== 'all' && m.channel !== activeChannel) return false;
    if (searchTerm && !m.content.toLowerCase().includes(searchTerm.toLowerCase()) && !(m.subject || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // The active tab determines the send channel; "all" defaults to whatsapp
  const sendChannel: 'whatsapp' | 'email' | 'sms' = activeChannel === 'all' ? 'whatsapp' : activeChannel;

  const handleSend = () => {
    if (!inputValue.trim()) return;
    if (sendChannel === 'email' && !emailSubject.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      channel: sendChannel,
      direction: 'outbound',
      from: 'You',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', ''),
      status: 'sent',
      subject: sendChannel === 'email' ? emailSubject : undefined,
    };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setEmailSubject('');

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m));
    }, 1500);
  };

  const toggleStar = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, starred: !m.starred } : m));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <ClockCircleOutlined style={{ fontSize: 10, color: token.colorTextQuaternary }} />;
      case 'delivered': return <CheckOutlined style={{ fontSize: 10, color: token.colorTextQuaternary }} />;
      case 'read': return <CheckCircleOutlined style={{ fontSize: 10, color: token.colorPrimary }} />;
      case 'failed': return <Tag color="error" style={{ fontSize: 9, margin: 0, lineHeight: '16px', padding: '0 4px' }}>Failed</Tag>;
      default: return null;
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: ChatMessage[] }[] = [];
  filteredMessages.forEach(msg => {
    const dateStr = msg.timestamp.split(',')[0].trim();
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateStr) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, msgs: [msg] });
    }
  });

  const channelCounts = {
    all: messages.length,
    whatsapp: messages.filter(m => m.channel === 'whatsapp').length,
    email: messages.filter(m => m.channel === 'email').length,
    sms: messages.filter(m => m.channel === 'sms').length,
  };

  return (
    <Drawer
      title={null}
      placement="right"
      onClose={onClose}
      open={open}
      width={500}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }, header: { display: 'none' } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgElevated }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Space size={10}>
              <Avatar size={32} style={{ background: token.colorPrimary, fontSize: 13 }}>
                {primaryContact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </Avatar>
              <div>
                <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.2 }}>{primaryContact.name}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{primaryContact.role} &middot; {dealName}</Text>
              </div>
            </Space>
            <Space size={4}>
              <Tooltip title="Search messages">
                <Button type="text" size="small" icon={<SearchOutlined />} onClick={() => setShowSearch(!showSearch)} />
              </Tooltip>
              <Button type="text" size="small" onClick={onClose}>Close</Button>
            </Space>
          </div>

          {/* Contact details row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            <Text type="secondary" style={{ fontSize: 11 }}><WhatsAppOutlined style={{ color: '#25D366' }} /> {primaryContact.phone}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}><MailOutlined style={{ color: '#1677ff' }} /> {primaryContact.email}</Text>
          </div>

          {showSearch && (
            <Input
              placeholder="Search messages..."
              prefix={<SearchOutlined />}
              size="small"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              allowClear
              style={{ marginBottom: 10 }}
              autoFocus
            />
          )}

          {/* Channel filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'whatsapp', 'email', 'sms'] as const).map(ch => {
              const conf = ch === 'all' ? null : CHANNEL_CONFIG[ch];
              return (
                <Button
                  key={ch}
                  size="small"
                  type={activeChannel === ch ? 'primary' : 'default'}
                  onClick={() => setActiveChannel(ch)}
                  style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', height: 26 }}
                  ghost={activeChannel === ch}
                >
                  {conf?.icon}
                  {ch === 'all' ? 'All' : conf?.label}
                  <Badge count={channelCounts[ch]} style={{ fontSize: 9, marginLeft: 2 }} size="small" color={activeChannel === ch ? token.colorPrimary : token.colorTextQuaternary} />
                </Button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', background: token.colorBgLayout }}>
          {groupedMessages.length === 0 && (
            <Empty description="No messages" style={{ marginTop: 60 }} />
          )}
          {groupedMessages.map(group => (
            <div key={group.date}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
                <div style={{ flex: 1, height: 1, background: token.colorBorderSecondary }} />
                <Text type="secondary" style={{ fontSize: 10, whiteSpace: 'nowrap' }}>{group.date}</Text>
                <div style={{ flex: 1, height: 1, background: token.colorBorderSecondary }} />
              </div>

              {group.msgs.map(msg => {
                const isOutbound = msg.direction === 'outbound';
                const chConf = CHANNEL_CONFIG[msg.channel];

                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isOutbound ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                    <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isOutbound ? 'flex-end' : 'flex-start' }}>
                      {/* Channel badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        {!isOutbound && <Text strong style={{ fontSize: 11 }}>{msg.from}</Text>}
                        <Tag
                          color={chConf.tagColor}
                          style={{ margin: 0, fontSize: 9, lineHeight: '16px', padding: '0 4px', display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          {chConf.icon} {chConf.label}
                        </Tag>
                      </div>

                      {msg.subject && (
                        <Text strong style={{ fontSize: 11, marginBottom: 2, display: 'block' }}>{msg.subject}</Text>
                      )}

                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: isOutbound ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          background: isOutbound ? token.colorPrimary : token.colorBgContainer,
                          color: isOutbound ? '#fff' : token.colorText,
                          border: isOutbound ? 'none' : `1px solid ${token.colorBorderSecondary}`,
                          fontSize: 12,
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                        }}
                        onDoubleClick={() => toggleStar(msg.id)}
                      >
                        {msg.content}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Text type="secondary" style={{ fontSize: 10 }}>
                          {msg.timestamp.split(',').slice(1).join(',').trim()}
                        </Text>
                        {isOutbound && getStatusIcon(msg.status)}
                        {msg.starred && <StarFilled style={{ fontSize: 10, color: token.colorWarning }} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Compose */}
        <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgContainer, padding: '12px 16px' }}>
          {/* Sending-as indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Tag color={CHANNEL_CONFIG[sendChannel].tagColor} style={{ margin: 0, fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
              {CHANNEL_CONFIG[sendChannel].icon} {CHANNEL_CONFIG[sendChannel].label}
            </Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>
              to {sendChannel === 'email' ? primaryContact.email : primaryContact.phone}
            </Text>
          </div>

          {sendChannel === 'email' && (
            <Input
              size="small"
              placeholder="Subject line..."
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              style={{ marginBottom: 8, fontSize: 12 }}
            />
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <TextArea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={
                sendChannel === 'email' ? 'Compose your email...' :
                sendChannel === 'whatsapp' ? 'Type a WhatsApp message...' : 'Type an SMS...'
              }
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ fontSize: 12 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!inputValue.trim() || (sendChannel === 'email' && !emailSubject.trim())}
              size="small"
              style={{ alignSelf: 'flex-end' }}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 10, marginTop: 4, display: 'block' }}>
            Enter to send &middot; Shift+Enter for new line
          </Text>
        </div>
      </div>
    </Drawer>
  );
};
