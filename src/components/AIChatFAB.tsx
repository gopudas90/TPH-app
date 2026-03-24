// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Typography, Avatar, Space, Tooltip, Dropdown, Empty, theme, Badge } from 'antd';
import {
  RobotOutlined, SendOutlined, CloseOutlined, PlusOutlined, HistoryOutlined,
  ArrowLeftOutlined, MoreOutlined, DeleteOutlined, EditOutlined, MessageOutlined,
} from '@ant-design/icons';

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

interface AIChatFABProps {
  pageContext: string; // e.g. "Sales Dashboard", "Customer Dashboard", etc.
}

// Context-aware mock responses
const generateResponse = (question: string, context: string): string => {
  const lower = question.toLowerCase();

  if (lower.includes('pipeline') || lower.includes('funnel') || lower.includes('stage')) {
    return `Here's the pipeline overview for **${context}**:\n\n- **Corporate Events**: 12 active deals, 67% conversion from Qualification → Concept\n- **Experiential Activations**: 5 active deals, highest drop-off at Proposal stage (40%)\n- **Exhibitions & Trade Shows**: 3 deals, avg 8 days in Concept & Scope stage\n\nThe biggest bottleneck is the **Proposal Development** stage across all pipelines, averaging 10 days. Consider streamlining proposal templates to reduce cycle time.`;
  }
  if (lower.includes('revenue') || lower.includes('value') || lower.includes('forecast')) {
    return `**Revenue Forecast** based on current pipeline:\n\n- **Weighted Pipeline**: SGD 1.85M (probability-adjusted)\n- **Best Case**: SGD 3.2M (if all active deals close)\n- **Most Likely Q2**: SGD 620K (deals with >70% probability)\n\nTop contributors:\n1. Esports Tournament Finals — SGD 850K (65% prob)\n2. Annual Sales Kickoff — SGD 210K (80% prob)\n3. Spring Fashion Show — SGD 180K (75% prob)`;
  }
  if (lower.includes('win') || lower.includes('loss') || lower.includes('rate')) {
    return `**Win/Loss Analysis:**\n\n- Overall win rate: **100%** (1 won out of 1 closed)\n- Lost deals this quarter: 0\n- Most common loss reasons (historical): Budget constraints (35%), competitor undercut (25%), timeline mismatch (20%)\n\n**Recommendation**: Focus on deals in Negotiation stage — they have the highest conversion potential and shortest time to close.`;
  }
  if (lower.includes('deal') || lower.includes('opportunity')) {
    return `**Active Deals Summary:**\n\n- 18 active deals across 4 pipeline types\n- Total pipeline value: SGD 3.06M\n- Avg deal size: SGD 170K\n- Highest priority: Tech Summit 2026, Global Leadership Retreat, Esports Tournament\n\n3 deals need attention (stalled >7 days in current stage):\n1. Holiday Party 2026 — stuck in Qualification\n2. Brand Activation Pop-up — stuck in Qualification\n3. Q3 Townhall — stuck in Proposal Submitted`;
  }
  if (lower.includes('customer') || lower.includes('client')) {
    return `**Customer Insights for ${context}:**\n\n- **Top client by value**: Cyberdyne Systems (SGD 850K active)\n- **Most active client**: Acme Corp (3 deals in pipeline)\n- **At-risk**: Initech — no new deals in 60 days, consider re-engagement\n\nRecommendation: Schedule a check-in with Stark Industries — their Global Leadership Retreat (SGD 420K) is in Qualification and could benefit from a dedicated proposal walkthrough.`;
  }
  if (lower.includes('team') || lower.includes('owner') || lower.includes('performance')) {
    return `**Team Performance:**\n\n| Owner | Active Deals | Total Value | Avg Probability |\n|-------|-------------|-------------|------------------|\n| Sarah Jenkins | 7 | SGD 1.04M | 58% |\n| Mark Davis | 6 | SGD 1.13M | 54% |\n| Alex Wong | 5 | SGD 592K | 38% |\n\nSarah has the highest conversion rate at Negotiation stage. Alex may need support — his deals have lower probability scores on average.`;
  }
  if (lower.includes('asset') || lower.includes('equipment') || lower.includes('inventory')) {
    return `**Asset Overview:**\n\n- Total tracked assets across categories\n- Most utilized: AV Equipment, Staging & Structures\n- Assets needing maintenance: 3 flagged this week\n- Upcoming returns: 5 items due back from Summer Roadshow\n\nI'd recommend reviewing the asset condition report — 2 items are marked "Fair" and may need replacement before the Q3 events season.`;
  }
  if (lower.includes('partner') || lower.includes('vendor')) {
    return `**Partner Summary:**\n\n- 8 active partners across AV, Staging, Catering, and Logistics\n- Top rated: SoundWave Audio (4.8/5), StageCraft (4.7/5)\n- Pending confirmations: 2 partner assignments awaiting response\n- Avg partner response time: 1.8 days\n\nConsider diversifying AV partners — 60% of current bookings go to SoundWave, creating a dependency risk.`;
  }
  if (lower.includes('help') || lower.includes('what can')) {
    return `I can help you with insights on this **${context}** page! Try asking me:\n\n- "How is the pipeline performing?"\n- "What's our revenue forecast?"\n- "Show me win/loss analysis"\n- "Which deals need attention?"\n- "How is the team performing?"\n- "Any customer insights?"\n\nI analyse your data in real-time and provide actionable recommendations.`;
  }
  return `Based on the **${context}** data, here's a quick summary:\n\n- **Active pipeline**: SGD 3.06M across 18 deals\n- **Avg cycle time**: 28 days from Inquiry to Won\n- **This week's priority**: 3 deals in Negotiation stage, 2 proposals due\n- **Top risk**: Esports Tournament (SGD 850K) — complex AV requirements need partner confirmation\n\nWould you like me to dive deeper into any of these areas? I can analyse pipelines, forecasts, team performance, or specific deals.`;
};

export const AIChatFAB: React.FC<AIChatFABProps> = ({ pageContext }) => {
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const activeChat = chatSessions.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;
    const text = inputValue.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleString(),
    };

    if (!activeChatId) {
      const newChat: ChatSession = {
        id: `chat-${Date.now()}`,
        title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
        messages: [userMessage],
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      };
      setChatSessions(prev => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setInputValue('');
      setIsTyping(true);

      setTimeout(() => {
        const response = generateResponse(text, pageContext);
        const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date().toLocaleString() };
        setChatSessions(prev => prev.map(c => c.id === newChat.id ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date().toLocaleString() } : c));
        setIsTyping(false);
      }, 1000);
    } else {
      setChatSessions(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, userMessage], updatedAt: new Date().toLocaleString() } : c));
      setInputValue('');
      setIsTyping(true);

      setTimeout(() => {
        const response = generateResponse(text, pageContext);
        const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date().toLocaleString() };
        setChatSessions(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date().toLocaleString() } : c));
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChatSessions(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) setActiveChatId(null);
  };

  const handleRenameChat = (chatId: string) => {
    if (!editTitleValue.trim()) return;
    setChatSessions(prev => prev.map(c => c.id === chatId ? { ...c, title: editTitleValue.trim() } : c));
    setEditingTitleId(null);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setShowHistory(false);
  };

  const suggestions = [
    'How is the pipeline performing?',
    'What\'s our revenue forecast?',
    'Which deals need attention?',
    'How is the team performing?',
  ];

  return (
    <>
      <style>{`
        @keyframes fabPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes fabSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 88,
          right: 28,
          width: 420,
          height: 560,
          background: token.colorBgContainer,
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          border: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          animation: 'fabSlideUp 0.25s ease-out',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: token.colorBgElevated,
          }}>
            <Space size={8}>
              <Avatar size={28} style={{ background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})` }}>
                <RobotOutlined style={{ fontSize: 14 }} />
              </Avatar>
              <div>
                <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.2 }}>AI Assistant</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{pageContext}</Text>
              </div>
            </Space>
            <Space size={4}>
              {!showHistory && (
                <>
                  <Tooltip title="Chat History">
                    <Button type="text" size="small" icon={<HistoryOutlined />} onClick={() => setShowHistory(true)} />
                  </Tooltip>
                  <Tooltip title="New Chat">
                    <Button type="text" size="small" icon={<PlusOutlined />} onClick={handleNewChat} />
                  </Tooltip>
                </>
              )}
              <Tooltip title="Close">
                <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setOpen(false)} />
              </Tooltip>
            </Space>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {showHistory ? (
              /* History view */
              <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Button type="text" size="small" icon={<ArrowLeftOutlined />} onClick={() => setShowHistory(false)}>Back</Button>
                  <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleNewChat}>New Chat</Button>
                </div>
                {chatSessions.length === 0 ? (
                  <Empty description="No chat history" style={{ marginTop: 40 }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {chatSessions.map(session => (
                      <div
                        key={session.id}
                        onClick={() => { setActiveChatId(session.id); setShowHistory(false); }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          background: activeChatId === session.id ? token.colorPrimaryBg : 'transparent',
                          border: `1px solid ${activeChatId === session.id ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
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
                              <Text strong style={{ fontSize: 12, display: 'block' }} ellipsis={{ tooltip: session.title }}>{session.title}</Text>
                              <Text type="secondary" style={{ fontSize: 11 }}>{session.messages.length} msgs &middot; {session.updatedAt}</Text>
                            </>
                          )}
                        </div>
                        <Dropdown
                          trigger={['click']}
                          menu={{
                            items: [
                              { key: 'rename', icon: <EditOutlined />, label: 'Rename', onClick: (e) => { e.domEvent.stopPropagation(); setEditingTitleId(session.id); setEditTitleValue(session.title); } },
                              { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true, onClick: (e) => { e.domEvent.stopPropagation(); handleDeleteChat(session.id); } },
                            ],
                          }}
                        >
                          <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                        </Dropdown>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Chat view */
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
                  {messages.length === 0 && !isTyping && (
                    <div style={{ textAlign: 'center', marginTop: 32 }}>
                      <RobotOutlined style={{ fontSize: 36, color: token.colorTextQuaternary, marginBottom: 12 }} />
                      <Title level={5} style={{ color: token.colorTextSecondary, marginBottom: 4, fontSize: 14 }}>AI Assistant</Title>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 20 }}>
                        Ask me anything about this page
                      </Text>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 300, margin: '0 auto' }}>
                        {suggestions.map((s, idx) => (
                          <Button
                            key={idx}
                            type="dashed"
                            size="small"
                            style={{ textAlign: 'left', height: 'auto', padding: '6px 10px', fontSize: 12 }}
                            onClick={() => setInputValue(s)}
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                      <div style={{ maxWidth: '85%', display: 'flex', gap: 6, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                        <Avatar
                          size={24}
                          style={{ background: msg.role === 'assistant' ? token.colorPrimary : token.colorTextQuaternary, flexShrink: 0, marginTop: 2 }}
                        >
                          {msg.role === 'assistant' ? <RobotOutlined style={{ fontSize: 12 }} /> : <span style={{ fontSize: 10 }}>U</span>}
                        </Avatar>
                        <div style={{
                          padding: '8px 12px',
                          borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          background: msg.role === 'user' ? token.colorPrimary : token.colorFillAlter,
                          color: msg.role === 'user' ? '#fff' : token.colorText,
                          fontSize: 12,
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'flex-start' }}>
                      <Avatar size={24} style={{ background: token.colorPrimary, flexShrink: 0, marginTop: 2 }}>
                        <RobotOutlined style={{ fontSize: 12 }} />
                      </Avatar>
                      <div style={{ padding: '8px 12px', borderRadius: '12px 12px 12px 2px', background: token.colorFillAlter }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: token.colorTextSecondary, animation: 'fabPulse 1.4s infinite' }} />
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: token.colorTextSecondary, animation: 'fabPulse 1.4s infinite', animationDelay: '0.2s' }} />
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: token.colorTextSecondary, animation: 'fabPulse 1.4s infinite', animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '8px 16px 14px', borderTop: `1px solid ${token.colorBorderSecondary}` }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder={`Ask about ${pageContext}...`}
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      style={{ fontSize: 12 }}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isTyping}
                      style={{ alignSelf: 'flex-end' }}
                      size="small"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FAB Button */}
      <Tooltip title={open ? '' : 'Ask AI'} placement="left">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={open ? <CloseOutlined /> : <MessageOutlined />}
          onClick={() => setOpen(!open)}
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            width: 52,
            height: 52,
            fontSize: 20,
            zIndex: 1001,
            boxShadow: '0 4px 20px rgba(22, 119, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </Tooltip>
    </>
  );
};
