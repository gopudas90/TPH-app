// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Drawer, Input, Button, List, Typography, Space, Avatar, Dropdown, Popconfirm, theme, Tooltip, Empty } from 'antd';
import { RobotOutlined, SendOutlined, DeleteOutlined, EditOutlined, PlusOutlined, HistoryOutlined, ArrowLeftOutlined, MoreOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface AIChatDrawerProps {
  open: boolean;
  onClose: () => void;
  dealName: string;
  dealId: string;
}

const generateMockResponse = (question: string, dealName: string): string => {
  const lower = question.toLowerCase();
  if (lower.includes('margin') || lower.includes('profit')) {
    return `For **${dealName}**, the current projected margin is 32%, which is slightly below the target of 35%. The main cost driver is the AV equipment package. Consider negotiating better rates with SoundWave Audio (our preferred AV partner) or reducing the VIP lounge specification to bring the margin closer to target.`;
  }
  if (lower.includes('quote') || lower.includes('pricing')) {
    return `There are currently 3 quote versions for **${dealName}**:\n\n- **v1.0 (Initial)**: SGD 85,700 — Draft\n- **v1.1 (Revised AV)**: SGD 92,500 — Sent to client\n- **v2.0 (Final Neg)**: SGD 89,000 — Approved\n\nThe approved version includes a SGD 5,000 discount on the lighting and scenic packages negotiated during the final round.`;
  }
  if (lower.includes('client') || lower.includes('customer') || lower.includes('contact')) {
    return `The primary contacts for this deal are:\n\n1. **Jane Doe** — Marketing Director (jane.doe@acme.com)\n2. **John Smith** — Procurement Manager (john.smith@acme.com)\n\nJane is the key decision maker. The client prefers email communication and has a budget range of SGD 100K–250K.`;
  }
  if (lower.includes('risk') || lower.includes('issue')) {
    return `Key risks identified for **${dealName}**:\n\n1. **Venue loading constraints** — MBS loading bay access is limited to 10pm–6am, which may require overtime crew costs\n2. **Margin pressure** — Current margin (32%) is below target (35%)\n3. **Timeline** — Setup date is 14 Sep, leaving limited buffer if vendor deliveries are delayed\n\nRecommendation: Confirm loading schedule with MBS and lock in partner commitments by end of this week.`;
  }
  if (lower.includes('task') || lower.includes('todo') || lower.includes('next')) {
    return `Here are the pending action items for **${dealName}**:\n\n1. **Finalize AV partner quote** — Due: Today\n2. **Send proposal to client** — Due: Tomorrow\n\nCompleted tasks:\n- ✅ Initial client brief call\n- ✅ Site visit at MBS\n\nI'd recommend prioritizing the AV partner quote since it directly impacts the proposal you need to send tomorrow.`;
  }
  return `Based on my analysis of **${dealName}**, here's what I can tell you:\n\n- **Stage**: Proposal Development (Stage 4 of 9)\n- **Value**: SGD 125,000\n- **Win Probability**: 60%\n- **Lead Score**: 85/100 (High)\n\nThe deal is progressing well. The AI lead score is high due to recent engagement, budget alignment, and a strong historical win rate with this client. The next key milestone is finalizing and submitting the proposal.\n\nFeel free to ask me about quotes, margins, risks, tasks, or anything else related to this deal.`;
};

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ open, onClose, dealName, dealId }) => {
  const { token } = theme.useToken();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: 'chat-1',
      title: 'Deal overview & margins',
      messages: [
        { id: 'm1', role: 'user', content: 'Give me an overview of this deal', timestamp: '2026-03-18 10:30 AM' },
        { id: 'm2', role: 'assistant', content: `Based on my analysis of **${dealName}**, here's what I can tell you:\n\n- **Stage**: Proposal Development (Stage 4 of 9)\n- **Value**: SGD 125,000\n- **Win Probability**: 60%\n- **Lead Score**: 85/100 (High)\n\nThe deal is progressing well with strong client engagement.`, timestamp: '2026-03-18 10:30 AM' },
      ],
      createdAt: '2026-03-18 10:30 AM',
      updatedAt: '2026-03-18 10:30 AM',
    },
    {
      id: 'chat-2',
      title: 'Quote comparison',
      messages: [
        { id: 'm3', role: 'user', content: 'Compare the quote versions', timestamp: '2026-03-17 02:15 PM' },
        { id: 'm4', role: 'assistant', content: `There are 3 quote versions for this deal:\n\n- **v1.0**: SGD 85,700 (Draft)\n- **v1.1**: SGD 92,500 (Sent)\n- **v2.0**: SGD 89,000 (Approved)`, timestamp: '2026-03-17 02:15 PM' },
      ],
      createdAt: '2026-03-17 02:15 PM',
      updatedAt: '2026-03-17 02:15 PM',
    }
  ]);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const activeChat = chatSessions.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleString(),
    };

    if (!activeChatId) {
      // Create new chat
      const newChat: ChatSession = {
        id: `chat-${Date.now()}`,
        title: inputValue.trim().slice(0, 50) + (inputValue.trim().length > 50 ? '...' : ''),
        messages: [userMessage],
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      };
      setChatSessions(prev => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setInputValue('');
      setIsTyping(true);

      setTimeout(() => {
        const response = generateMockResponse(inputValue, dealName);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date().toLocaleString(),
        };
        setChatSessions(prev => prev.map(c =>
          c.id === newChat.id
            ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date().toLocaleString() }
            : c
        ));
        setIsTyping(false);
      }, 1200);
    } else {
      // Add to existing chat
      setChatSessions(prev => prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: [...c.messages, userMessage], updatedAt: new Date().toLocaleString() }
          : c
      ));
      setInputValue('');
      setIsTyping(true);

      setTimeout(() => {
        const response = generateMockResponse(inputValue, dealName);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date().toLocaleString(),
        };
        setChatSessions(prev => prev.map(c =>
          c.id === activeChatId
            ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date().toLocaleString() }
            : c
        ));
        setIsTyping(false);
      }, 1200);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChatSessions(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const handleRenameChat = (chatId: string) => {
    if (!editTitleValue.trim()) return;
    setChatSessions(prev => prev.map(c =>
      c.id === chatId ? { ...c, title: editTitleValue.trim() } : c
    ));
    setEditingTitleId(null);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setShowHistory(false);
  };

  const renderHistoryView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setShowHistory(false)} style={{ padding: '4px 8px' }}>
          Back to Chat
        </Button>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleNewChat}>
          New Chat
        </Button>
      </div>
      {chatSessions.length === 0 ? (
        <Empty description="No chat history" style={{ marginTop: 40 }} />
      ) : (
        <List
          dataSource={chatSessions}
          renderItem={(session) => (
            <List.Item
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderRadius: 8,
                marginBottom: 4,
                background: activeChatId === session.id ? token.colorPrimaryBg : 'transparent',
                border: `1px solid ${activeChatId === session.id ? token.colorPrimaryBorder : 'transparent'}`,
              }}
              onClick={() => {
                setActiveChatId(session.id);
                setShowHistory(false);
              }}
              actions={[
                <Dropdown
                  key="actions"
                  trigger={['click']}
                  menu={{
                    items: [
                      {
                        key: 'rename',
                        icon: <EditOutlined />,
                        label: 'Rename',
                        onClick: (e) => {
                          e.domEvent.stopPropagation();
                          setEditingTitleId(session.id);
                          setEditTitleValue(session.title);
                        },
                      },
                      {
                        key: 'delete',
                        icon: <DeleteOutlined />,
                        label: 'Delete',
                        danger: true,
                        onClick: (e) => {
                          e.domEvent.stopPropagation();
                          handleDeleteChat(session.id);
                        },
                      },
                    ],
                  }}
                >
                  <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                </Dropdown>
              ]}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingTitleId === session.id ? (
                  <Input
                    size="small"
                    value={editTitleValue}
                    onChange={(e) => setEditTitleValue(e.target.value)}
                    onPressEnter={() => handleRenameChat(session.id)}
                    onBlur={() => handleRenameChat(session.id)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <>
                    <Text strong style={{ fontSize: 13, display: 'block' }} ellipsis={{ tooltip: session.title }}>{session.title}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{session.messages.length} messages &middot; {session.updatedAt}</Text>
                  </>
                )}
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  const renderChatView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: `1px solid ${token.colorBorderSecondary}`, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <Avatar size="small" style={{ background: token.colorPrimary, flexShrink: 0 }}><RobotOutlined /></Avatar>
          <Text strong style={{ fontSize: 13 }} ellipsis={{ tooltip: activeChat?.title || `AI Assistant — ${dealName}` }}>
            {activeChat?.title || `AI Assistant — ${dealName}`}
          </Text>
        </div>
        <Space size={4}>
          <Tooltip title="Chat History">
            <Button type="text" size="small" icon={<HistoryOutlined />} onClick={() => setShowHistory(true)} />
          </Tooltip>
          <Tooltip title="New Chat">
            <Button type="text" size="small" icon={<PlusOutlined />} onClick={handleNewChat} />
          </Tooltip>
        </Space>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginBottom: 16 }}>
        {messages.length === 0 && !isTyping && (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <RobotOutlined style={{ fontSize: 40, color: token.colorTextQuaternary, marginBottom: 16 }} />
            <Title level={5} style={{ color: token.colorTextSecondary, marginBottom: 4 }}>AI Deal Assistant</Title>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 24 }}>
              Ask me anything about <strong>{dealName}</strong>
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360, margin: '0 auto' }}>
              {[
                'What\'s the current margin analysis?',
                'Show me the quote versions',
                'What are the key risks?',
                'What tasks are pending?'
              ].map((suggestion, idx) => (
                <Button
                  key={idx}
                  type="dashed"
                  size="small"
                  style={{ textAlign: 'left', height: 'auto', padding: '8px 12px', fontSize: 12 }}
                  onClick={() => {
                    setInputValue(suggestion);
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 16,
            }}
          >
            <div style={{
              maxWidth: '85%',
              display: 'flex',
              gap: 8,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}>
              <Avatar
                size={28}
                style={{
                  background: msg.role === 'assistant' ? token.colorPrimary : token.colorTextQuaternary,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {msg.role === 'assistant' ? <RobotOutlined style={{ fontSize: 14 }} /> : 'U'}
              </Avatar>
              <div style={{
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                background: msg.role === 'user' ? token.colorPrimary : token.colorBgTextHover,
                color: msg.role === 'user' ? '#fff' : token.colorText,
                fontSize: 13,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'flex-start' }}>
            <Avatar size={28} style={{ background: token.colorPrimary, flexShrink: 0, marginTop: 2 }}>
              <RobotOutlined style={{ fontSize: 14 }} />
            </Avatar>
            <div style={{
              padding: '10px 14px',
              borderRadius: '14px 14px 14px 2px',
              background: token.colorBgTextHover,
              fontSize: 13,
            }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: token.colorTextSecondary, animation: 'pulse 1.4s infinite', animationDelay: '0s' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: token.colorTextSecondary, animation: 'pulse 1.4s infinite', animationDelay: '0.2s' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: token.colorTextSecondary, animation: 'pulse 1.4s infinite', animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask about ${dealName}...`}
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ fontSize: 13 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            style={{ alignSelf: 'flex-end' }}
          />
        </div>
        <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
          Press Enter to send, Shift+Enter for new line
        </Text>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <Drawer
        title={
          <Space>
            <RobotOutlined style={{ color: token.colorPrimary }} />
            <span>AI Assistant</span>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>— {dealName}</Text>
          </Space>
        }
        placement="right"
        open={open}
        onClose={onClose}
        width={560}
        styles={{ body: { padding: '16px 24px', display: 'flex', flexDirection: 'column' } }}
      >
        {showHistory ? renderHistoryView() : renderChatView()}
      </Drawer>
    </>
  );
};
