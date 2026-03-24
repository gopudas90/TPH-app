// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Typography, Card, Input, Button, Avatar, Space, Tag, theme, Empty, Badge, List } from 'antd';
import { SendOutlined, UserOutlined, SearchOutlined, PlusOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  from: string;
  role: 'client' | 'tph';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  subject: string;
  assignedTo: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1', subject: 'Tech Summit 2026 — AV Requirements', assignedTo: 'Sarah Jenkins',
    lastMessage: 'I\'ll check with MBS on Level 5 availability and get back to you by Thursday.', lastTime: '2 hrs ago', unread: 1,
    messages: [
      { id: 'm1', from: 'Jane Doe', role: 'client', text: 'Hi Sarah, I wanted to discuss the AV setup for the main hall. Can we get a larger LED wall?', time: '18 Mar, 10:00 AM' },
      { id: 'm2', from: 'Sarah Jenkins', role: 'tph', text: 'Hi Jane! Absolutely — we can upgrade to a P2.6 panel at 8m x 4m. I\'ll get a revised quote to you today.', time: '18 Mar, 10:45 AM' },
      { id: 'm3', from: 'Jane Doe', role: 'client', text: 'That sounds great. Also, can we explore having the VIP lounge on a separate floor?', time: '18 Mar, 2:30 PM' },
      { id: 'm4', from: 'Sarah Jenkins', role: 'tph', text: 'Good idea — I\'ll check with MBS on Level 5 availability and get back to you by Thursday.', time: '18 Mar, 3:45 PM' },
    ],
  },
  {
    id: '2', subject: 'Q1 Town Hall — Venue Logistics', assignedTo: 'Sarah Jenkins',
    lastMessage: 'Loading bay is confirmed for 7am on March 25. Crew of 12 will be on site.', lastTime: '1 day ago', unread: 0,
    messages: [
      { id: 'm5', from: 'Jane Doe', role: 'client', text: 'What time can we start loading in at Suntec on the 25th?', time: '17 Mar, 9:00 AM' },
      { id: 'm6', from: 'Sarah Jenkins', role: 'tph', text: 'Loading bay is confirmed for 7am on March 25. Crew of 12 will be on site.', time: '17 Mar, 11:00 AM' },
    ],
  },
  {
    id: '3', subject: 'Holiday Party 2026 — Initial Discussion', assignedTo: 'Mark Davis',
    lastMessage: 'We\'ve received your enquiry and will get back to you with concept options by next week.', lastTime: '3 days ago', unread: 0,
    messages: [
      { id: 'm7', from: 'Jane Doe', role: 'client', text: 'Hi, we\'re interested in hosting a holiday party for ~200 people in December. Can you help?', time: '15 Mar, 3:00 PM' },
      { id: 'm8', from: 'Mark Davis', role: 'tph', text: 'Hi Jane, thanks for reaching out! We\'d love to help. Could you share any venue preferences or theme ideas?', time: '15 Mar, 4:00 PM' },
      { id: 'm9', from: 'Jane Doe', role: 'client', text: 'We\'re open to suggestions — something elegant, maybe a rooftop venue?', time: '15 Mar, 4:30 PM' },
      { id: 'm10', from: 'Mark Davis', role: 'tph', text: 'We\'ve received your enquiry and will get back to you with concept options by next week.', time: '16 Mar, 10:00 AM' },
    ],
  },
];

export const ClientMessages: React.FC = () => {
  const { token } = theme.useToken();
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeId, setActiveId] = useState(MOCK_CONVERSATIONS[0]?.id || '');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const active = conversations.find(c => c.id === activeId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages.length]);

  const handleSend = () => {
    if (!input.trim() || !active) return;
    const newMsg: Message = { id: Date.now().toString(), from: 'Jane Doe', role: 'client', text: input.trim(), time: 'Just now' };
    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, newMsg], lastMessage: input.trim(), lastTime: 'Just now' } : c));
    setInput('');
  };

  const filteredConversations = conversations.filter(c =>
    !search || c.subject.toLowerCase().includes(search.toLowerCase()) || c.assignedTo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 200px)', minHeight: 500 }}>
      {/* Left: Conversation List */}
      <Card size="small" style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column' }} styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' } }}>
        <div style={{ padding: '12px 12px 8px' }}>
          <Input prefix={<SearchOutlined />} placeholder="Search conversations..." size="small" value={search} onChange={e => setSearch(e.target.value)} allowClear />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.map(c => (
            <div
              key={c.id}
              onClick={() => { setActiveId(c.id); setConversations(prev => prev.map(x => x.id === c.id ? { ...x, unread: 0 } : x)); }}
              style={{
                padding: '10px 14px', cursor: 'pointer',
                background: activeId === c.id ? token.colorPrimaryBg : 'transparent',
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                <Text strong={c.unread > 0} style={{ fontSize: 12 }} ellipsis={{ tooltip: c.subject }}>{c.subject}</Text>
                {c.unread > 0 && <Badge count={c.unread} size="small" />}
              </div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }} ellipsis>{c.lastMessage}</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 10 }}>{c.assignedTo}</Text>
                <Text type="secondary" style={{ fontSize: 10 }}>{c.lastTime}</Text>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Right: Chat */}
      <Card size="small" style={{ flex: 1, display: 'flex', flexDirection: 'column' }} styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' } }}>
        {!active ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="Select a conversation" />
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
              <Text strong style={{ fontSize: 14 }}>{active.subject}</Text>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>with {active.assignedTo}</Text>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {active.messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'client' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                  <div style={{ maxWidth: '70%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, justifyContent: msg.role === 'client' ? 'flex-end' : 'flex-start' }}>
                      <Text strong style={{ fontSize: 11 }}>{msg.from}</Text>
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: msg.role === 'client' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: msg.role === 'client' ? token.colorPrimary : token.colorFillAlter,
                      color: msg.role === 'client' ? '#fff' : token.colorText,
                      fontSize: 12, lineHeight: 1.6,
                    }}>
                      {msg.text}
                    </div>
                    <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2, textAlign: msg.role === 'client' ? 'right' : 'left' }}>
                      {msg.time}
                    </Text>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px 16px', borderTop: `1px solid ${token.colorBorderSecondary}` }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <TextArea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{ fontSize: 12 }}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSend} disabled={!input.trim()} style={{ alignSelf: 'flex-end' }} />
              </div>
              <Text type="secondary" style={{ fontSize: 10, marginTop: 4, display: 'block' }}>Enter to send &middot; Shift+Enter for new line</Text>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
