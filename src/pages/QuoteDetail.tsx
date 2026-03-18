import React, { useState } from 'react';
import { Typography, Card as AntCard, Button, Table, Space, Tag, Row, Col, Descriptions, theme, Tabs, Input, InputNumber, Modal, Tooltip, List, Progress, Select, Badge, Avatar, Popconfirm, message, Dropdown, Divider, Drawer } from 'antd';
import { ArrowLeftOutlined, SendOutlined, EditOutlined, DownloadOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, RobotOutlined, ExclamationCircleOutlined, CopyOutlined, MessageOutlined, EyeOutlined, MailOutlined, FilePdfOutlined, MoreOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  // Mock data for the quote
  const quote = {
    id: id || '1',
    version: id === '1' ? 'v1.0 (Initial)' : id === '2' ? 'v1.1 (Revised AV)' : 'v2.0 (Final Neg)',
    date: '2026-03-15',
    status: id === '3' ? 'Approved' : id === '2' ? 'Sent' : 'Draft',
    client: 'Acme Corp',
    eventName: 'Global Tech Summit 2026',
    validUntil: '2026-04-15',
    preparedBy: 'Sarah Jenkins',
    targetMargin: 35,
    floorMargin: 20,
    isAIGenerated: id === '1' || !id,
  };

  const [items, setItems] = useState([
    { key: '1', item: 'Main Stage LED Wall (10m x 4m)', category: 'AV Equipment', qty: 1, cost: 9500, unitPrice: 15000, discount: 1000, aiRecommendedPrice: 15800, aiReasoning: 'Client historical spend on AV is 15% above average. Recommending higher price to maximize margin; win probability remains 85%.', comments: [{ id: 'c1', author: 'Client', text: 'Can we upgrade to 12m x 4m?', date: '2026-03-16 10:00 AM' }] },
    { key: '2', item: 'Breakout Room Projectors (8000 lumens)', category: 'AV Equipment', qty: 4, cost: 800, unitPrice: 1200, discount: 0, aiRecommendedPrice: 1200, aiReasoning: 'Current price aligns with market standard and client budget.', comments: [] },
    { key: '3', item: 'Line Array Audio System', category: 'Audio', qty: 1, cost: 5000, unitPrice: 8500, discount: 500, aiRecommendedPrice: 8900, aiReasoning: 'High demand item for this season. AI suggests a 5% increase based on internal cost structure and low availability.', comments: [] },
    { key: '4', item: 'Lighting Rig (Moving heads, washes)', category: 'Lighting', qty: 1, cost: 7500, unitPrice: 12000, discount: 0, aiRecommendedPrice: 12500, aiReasoning: 'Client budget allows for premium lighting. Recommended price increases margin by 4%.', comments: [] },
    { key: '5', item: 'Technical Crew (3 days)', category: 'Labor', qty: 5, cost: 1000, unitPrice: 1500, discount: 0, aiRecommendedPrice: 1600, aiReasoning: 'Labor costs have increased. Adjusting price to maintain target margin.', comments: [] },
    { key: '6', item: 'Stage Design & Fabrication', category: 'Scenic', qty: 1, cost: 14000, unitPrice: 22000, discount: 2000, aiRecommendedPrice: 22000, aiReasoning: 'Optimal price point based on historical win rates for custom scenic fabrication.', comments: [] },
    { key: '7', item: 'VIP Lounge Furniture Package', category: 'Furniture', qty: 1, cost: 9000, unitPrice: 15200, discount: 1500, aiRecommendedPrice: 16000, aiReasoning: 'Premium furniture packages have a high elasticity. Recommending a slight increase.', comments: [] },
  ]);

  const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const totalDiscount = items.reduce((acc, item) => acc + item.discount, 0);
  const totalCost = items.reduce((acc, item) => acc + (item.cost * item.qty), 0);
  const tax = (subtotal - totalDiscount) * 0.09;
  const total = subtotal - totalDiscount + tax;
  const currentMargin = ((subtotal - totalDiscount - totalCost) / (subtotal - totalDiscount)) * 100;

  const applyAiPrice = (key: string, aiPrice: number) => {
    setItems(items.map(item => item.key === key ? { ...item, unitPrice: aiPrice } : item));
  };

  const handleItemChange = (key: string, field: string, value: any) => {
    setItems(items.map(item => item.key === key ? { ...item, [field]: value } : item));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  // Comments Modal State
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activeCommentItem, setActiveCommentItem] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const openComments = (key: string) => {
    setActiveCommentItem(key);
    setCommentModalVisible(true);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !activeCommentItem) return;
    setItems(items.map(item => {
      if (item.key === activeCommentItem) {
        return {
          ...item,
          comments: [...item.comments, { id: Date.now().toString(), author: 'Sarah Jenkins', text: newComment, date: new Date().toLocaleString() }]
        };
      }
      return item;
    }));
    setNewComment('');
  };

  const columns = [
    { title: 'Item Description', dataIndex: 'item', key: 'item', render: (text: string, record: any) => (
      <div>
        <Text strong style={{ fontSize: 13 }}>{text}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>{record.category}</Text>
      </div>
    )},
    { title: 'Qty', dataIndex: 'qty', key: 'qty', align: 'center' as const, render: (val: number, record: any) => (
      <InputNumber min={1} value={val} onChange={(v) => handleItemChange(record.key, 'qty', v)} size="small" style={{ width: 60 }} />
    )},
    { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', align: 'right' as const, render: (val: number, record: any) => (
      <InputNumber min={0} value={val} onChange={(v) => handleItemChange(record.key, 'unitPrice', v)} size="small" style={{ width: 100 }} />
    )},
    { title: 'AI Suggested', key: 'ai', align: 'right' as const, render: (_: any, record: any) => (
      record.aiRecommendedPrice !== record.unitPrice ? (
        <Tooltip title={record.aiReasoning} color="blue" placement="topRight">
          <Space size="small">
            <Text type="success" style={{ fontSize: 13 }}><RobotOutlined /> {formatCurrency(record.aiRecommendedPrice)}</Text>
            <Button size="small" type="link" onClick={() => applyAiPrice(record.key, record.aiRecommendedPrice)} style={{ padding: 0 }}>Apply</Button>
          </Space>
        </Tooltip>
      ) : <Text type="secondary" style={{ fontSize: 13 }}>-</Text>
    )},
    { title: 'Discount', dataIndex: 'discount', key: 'discount', align: 'right' as const, render: (val: number, record: any) => (
      <InputNumber min={0} value={val} onChange={(v) => handleItemChange(record.key, 'discount', v)} size="small" style={{ width: 100 }} />
    )},
    { title: 'Total', dataIndex: 'total', key: 'total', align: 'right' as const, render: (_: any, record: any) => <Text strong>{formatCurrency((record.unitPrice * record.qty) - record.discount)}</Text> },
    { title: 'Comments', key: 'comments', align: 'center' as const, render: (_: any, record: any) => (
      <Badge count={record.comments?.length || 0} size="small" color={token.colorPrimary}>
        <Button type="text" icon={<MessageOutlined />} onClick={() => openComments(record.key)} />
      </Badge>
    )}
  ];

  // Terms State
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [terms, setTerms] = useState("1. Payment Terms: 50% deposit required upon confirmation. Remaining 50% due 14 days post-event.\n2. Validity: This quote is valid until " + quote.validUntil + ".\n3. Cancellation: Cancellations within 30 days of the event will incur a 50% fee.");

  // Milestones State
  const [isEditingMilestones, setIsEditingMilestones] = useState(false);
  const [milestones, setMilestones] = useState([
    { id: '1', name: 'Initial Deposit (Confirmation)', percentage: 50, amount: total * 0.5, dueDate: '2026-03-20' },
    { id: '2', name: 'Final Payment (Post-Event)', percentage: 50, amount: total * 0.5, dueDate: '2026-04-30' }
  ]);

  const handleMilestoneChange = (index: number, field: string, value: any) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    if (field === 'percentage') {
       newMilestones[index].amount = (total * (value || 0)) / 100;
    }
    setMilestones(newMilestones);
  };

  const addMilestone = () => {
    setMilestones([...milestones, { id: Date.now().toString(), name: 'New Milestone', percentage: 0, amount: 0, dueDate: '' }]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const milestoneColumns = [
    { 
      title: 'Milestone', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text: string, record: any, index: number) => isEditingMilestones ? 
        <Input value={text} onChange={e => handleMilestoneChange(index, 'name', e.target.value)} size="small" /> : 
        <Text strong>{text}</Text> 
    },
    { 
      title: 'Percentage', 
      dataIndex: 'percentage', 
      key: 'percentage', 
      align: 'center' as const,
      render: (text: number, record: any, index: number) => isEditingMilestones ? 
        <InputNumber value={text} onChange={val => handleMilestoneChange(index, 'percentage', val)} size="small" min={0} max={100} addonAfter="%" /> : 
        `${text}%` 
    },
    { 
      title: 'Amount', 
      dataIndex: 'amount', 
      key: 'amount', 
      align: 'right' as const,
      render: (text: number) => formatCurrency(text) 
    },
    { 
      title: 'Due Date', 
      dataIndex: 'dueDate', 
      key: 'dueDate', 
      render: (text: string, record: any, index: number) => isEditingMilestones ? 
        <Input value={text} onChange={e => handleMilestoneChange(index, 'dueDate', e.target.value)} size="small" /> : 
        text 
    },
    ...(isEditingMilestones ? [{
      title: '',
      key: 'action',
      width: 50,
      render: (_: any, record: any) => (
        <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => removeMilestone(record.id)} />
      )
    }] : [])
  ];

  // Notes State
  const [internalNotes, setInternalNotes] = useState([
    { id: '1', text: 'Discount applied to AV equipment as part of the negotiated package.', date: '2026-03-15 10:30 AM', author: 'Sarah Jenkins' },
    { id: '2', text: 'Ensure lighting rig is approved by venue safety officer prior to load-in.', date: '2026-03-15 11:15 AM', author: 'Sarah Jenkins' }
  ]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setInternalNotes([...internalNotes, { id: Date.now().toString(), text: newNote, date: new Date().toLocaleString(), author: 'Sarah Jenkins' }]);
    setNewNote('');
  };

  const handleSaveEditNote = (id: string) => {
    setInternalNotes(internalNotes.map(n => n.id === id ? { ...n, text: editNoteText } : n));
    setEditingNoteId(null);
  };

  const handleDeleteNote = (id: string) => {
    setInternalNotes(internalNotes.filter(n => n.id !== id));
  };

  // Preview State
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Send Quote State
  const [isSendModalVisible, setIsSendModalVisible] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [deliveryTracking, setDeliveryTracking] = useState([
    { email: 'john.doe@acmecorp.com', status: 'Opened', deliveredAt: '2026-03-15 14:30', openedAt: '2026-03-15 15:45' },
    { email: 'jane.smith@acmecorp.com', status: 'Delivered', deliveredAt: '2026-03-15 14:30', openedAt: null }
  ]);
  const [showTracking, setShowTracking] = useState(false);

  const mockContacts = [
    { label: 'John Doe (john.doe@acmecorp.com)', value: 'john.doe@acmecorp.com' },
    { label: 'Jane Smith (jane.smith@acmecorp.com)', value: 'jane.smith@acmecorp.com' },
    { label: 'Billing Dept (billing@acmecorp.com)', value: 'billing@acmecorp.com' }
  ];

  const handleSendToClient = () => {
    if (selectedRecipients.length === 0) {
      message.error('Please select at least one recipient.');
      return;
    }
    setIsSendModalVisible(false);
    message.success(`Quote sent to ${selectedRecipients.length} recipient(s)!`);
    // Add to tracking
    const newTracking = selectedRecipients.map(email => ({
      email,
      status: 'Sent',
      deliveredAt: new Date().toLocaleString(),
      openedAt: null
    }));
    setDeliveryTracking([...deliveryTracking, ...newTracking]);
    setSelectedRecipients([]);
  };

  const handleDuplicateQuote = () => {
    message.success('Quote duplicated successfully as QT-2026-0002');
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        <div>
          <Title level={4} style={{ margin: 0, fontSize: 18 }}>Quote {quote.version}</Title>
          <Space size="middle" style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>{quote.eventName}</Text>
            <Tag color={quote.status === 'Approved' ? 'success' : quote.status === 'Sent' ? 'processing' : 'default'} style={{ fontSize: 12 }}>
              {quote.status}
            </Tag>
            {quote.isAIGenerated && (
              <Tag color="purple" icon={<RobotOutlined />} style={{ fontSize: 12 }}>
                AI Generated
              </Tag>
            )}
          </Space>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Space>
            <Button icon={<FilePdfOutlined />} onClick={() => setIsPreviewVisible(true)}>Preview Quote</Button>
            <Button type="primary" icon={<SendOutlined />} onClick={() => setIsSendModalVisible(true)}>Send to Client</Button>
            <Dropdown menu={{ items: [
              { key: 'duplicate', icon: <CopyOutlined />, label: 'Duplicate Quote', onClick: handleDuplicateQuote },
              { key: 'download', icon: <DownloadOutlined />, label: 'Download PDF' },
              { key: 'tracking', icon: <EyeOutlined />, label: 'Delivery Tracking', onClick: () => setShowTracking(true) },
            ] }}>
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Tabs 
            type="card" 
            size="small"
            items={[
              {
                key: '1',
                label: 'Line Items',
                children: (
                  <div style={{ borderTopLeftRadius: 0, padding: 12, background: token.colorBgContainer, border: `1px solid ${token.colorBorderSecondary}` }}>
                    <Table 
                      columns={columns} 
                      dataSource={items} 
                      pagination={false} 
                      size="small"
                      summary={() => (
                        <>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={5} align="right"><Text strong>Subtotal</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right"><Text strong>{formatCurrency(subtotal)}</Text></Table.Summary.Cell>
                          </Table.Summary.Row>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={5} align="right"><Text type="danger">Total Discount</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right"><Text type="danger">-{formatCurrency(totalDiscount)}</Text></Table.Summary.Cell>
                          </Table.Summary.Row>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={5} align="right"><Text type="secondary">Tax (GST)</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right"><Text type="secondary">{formatCurrency(tax)}</Text></Table.Summary.Cell>
                          </Table.Summary.Row>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={5} align="right"><Title level={5} style={{ margin: 0 }}>Total</Title></Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right"><Title level={5} style={{ margin: 0, color: token.colorPrimary }}>{formatCurrency(total)}</Title></Table.Summary.Cell>
                          </Table.Summary.Row>
                        </>
                      )}
                    />
                  </div>
                )
              },
              {
                key: '2',
                label: 'Payment Milestones',
                children: (
                  <div 
                    style={{ borderTopLeftRadius: 0, padding: 12, background: token.colorBgContainer, border: `1px solid ${token.colorBorderSecondary}` }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                      {isEditingMilestones ? 
                        <Space>
                          <Button size="small" icon={<PlusOutlined />} onClick={addMilestone}>Add Milestone</Button>
                          <Button size="small" type="primary" icon={<SaveOutlined />} onClick={() => setIsEditingMilestones(false)}>Save</Button>
                        </Space>
                      : 
                        <Button size="small" icon={<EditOutlined />} onClick={() => setIsEditingMilestones(true)}>Edit Milestones</Button>
                      }
                    </div>
                    <Table 
                      columns={milestoneColumns} 
                      dataSource={milestones} 
                      pagination={false} 
                      size="small"
                      rowKey="id"
                    />
                  </div>
                )
              },
              {
                key: '3',
                label: 'Terms & Conditions',
                children: (
                  <div 
                    style={{ borderTopLeftRadius: 0, padding: 12, background: token.colorBgContainer, border: `1px solid ${token.colorBorderSecondary}` }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                      {isEditingTerms ? 
                        <Button size="small" type="primary" icon={<SaveOutlined />} onClick={() => setIsEditingTerms(false)}>Save</Button>
                      : 
                        <Button size="small" icon={<EditOutlined />} onClick={() => setIsEditingTerms(true)}>Edit Terms</Button>
                      }
                    </div>
                    {isEditingTerms ? (
                      <TextArea 
                        value={terms} 
                        onChange={e => setTerms(e.target.value)} 
                        rows={12} 
                        style={{ fontSize: 13 }}
                      />
                    ) : (
                      <Text style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>
                        {terms}
                      </Text>
                    )}
                  </div>
                )
              }
            ]}
          />
        </Col>

        <Col span={8}>
          <div style={{ marginBottom: 24, padding: 12, background: token.colorBgContainer, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG }}>
            <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 14 }}>Margin Analysis</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>Current Margin</Text>
                <Text strong style={{ fontSize: 13, color: currentMargin < quote.floorMargin ? token.colorError : currentMargin >= quote.targetMargin ? token.colorSuccess : token.colorWarning }}>
                  {currentMargin.toFixed(1)}%
                </Text>
              </div>
              <Progress 
                percent={currentMargin} 
                success={{ percent: quote.floorMargin, strokeColor: token.colorError }} 
                strokeColor={currentMargin >= quote.targetMargin ? token.colorSuccess : token.colorWarning}
                showInfo={false}
                size="small"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Floor: {quote.floorMargin}%</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>Target: {quote.targetMargin}%</Text>
              </div>
            </div>
            <Descriptions column={1} size="small" labelStyle={{ color: token.colorTextSecondary, fontSize: 12 }} contentStyle={{ fontSize: 12 }}>
              <Descriptions.Item label="Total Revenue">{formatCurrency(subtotal - totalDiscount)}</Descriptions.Item>
              <Descriptions.Item label="Total Cost">{formatCurrency(totalCost)}</Descriptions.Item>
              <Descriptions.Item label="Gross Profit">{formatCurrency(subtotal - totalDiscount - totalCost)}</Descriptions.Item>
            </Descriptions>
          </div>

          <div style={{ marginBottom: 24, padding: 12, background: token.colorBgContainer, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG }}>
            <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 14 }}>Quote Details</div>
            <Descriptions column={1} labelStyle={{ color: token.colorTextSecondary, fontSize: 13 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Quote ID">QT-2026-{quote.id.padStart(4, '0')}</Descriptions.Item>
              <Descriptions.Item label="Client">{quote.client}</Descriptions.Item>
              <Descriptions.Item label="Date Created">{quote.date}</Descriptions.Item>
              <Descriptions.Item label="Valid Until">{quote.validUntil}</Descriptions.Item>
              <Descriptions.Item label="Prepared By">{quote.preparedBy}</Descriptions.Item>
            </Descriptions>
          </div>

          <div style={{ padding: 12, background: token.colorBgContainer, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG }}>
            <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 14 }}>Internal Notes</div>
            <List
              dataSource={internalNotes}
              renderItem={(item: any) => (
                <List.Item style={{ padding: '8px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 12 }}>{item.author}</Text>
                      <Space size="small">
                        <Text type="secondary" style={{ fontSize: 11 }}>{item.date}</Text>
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setEditingNoteId(item.id); setEditNoteText(item.text); }} />
                        <Popconfirm title="Delete note?" onConfirm={() => handleDeleteNote(item.id)}>
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    </div>
                    {editingNoteId === item.id ? (
                      <div style={{ marginTop: 8 }}>
                        <TextArea value={editNoteText} onChange={e => setEditNoteText(e.target.value)} autoSize={{ minRows: 2 }} style={{ fontSize: 13, marginBottom: 8 }} />
                        <Space>
                          <Button type="primary" size="small" onClick={() => handleSaveEditNote(item.id)}>Save</Button>
                          <Button size="small" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                        </Space>
                      </div>
                    ) : (
                      <Text style={{ fontSize: 13 }}>{item.text}</Text>
                    )}
                  </div>
                </List.Item>
              )}
            />
            <div style={{ marginTop: 16 }}>
              <TextArea 
                value={newNote} 
                onChange={e => setNewNote(e.target.value)} 
                placeholder="Add an internal note..." 
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ marginBottom: 8, fontSize: 13 }}
              />
              <Button type="primary" size="small" onClick={handleAddNote} block>Add Note</Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Send Quote Modal */}
      <Modal
        title="Send Quote to Client"
        open={isSendModalVisible}
        onOk={handleSendToClient}
        onCancel={() => setIsSendModalVisible(false)}
        okText="Send Quote"
        okButtonProps={{ icon: <SendOutlined /> }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>To:</Text>
          <Select
            mode="multiple"
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Select recipients"
            value={selectedRecipients}
            onChange={setSelectedRecipients}
            options={mockContacts}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text strong>Subject:</Text>
          <Input value={`Quote ${quote.version} for ${quote.eventName}`} style={{ marginTop: 8 }} />
        </div>
        <div>
          <Text strong>Message:</Text>
          <TextArea rows={4} defaultValue={`Hi ${quote.client},\n\nPlease find attached the quote for ${quote.eventName}.\n\nLet us know if you have any questions.\n\nBest,\n${quote.preparedBy}`} style={{ marginTop: 8 }} />
        </div>
      </Modal>

      {/* Tracking Modal */}
      <Modal
        title="Delivery Tracking"
        open={showTracking}
        onCancel={() => setShowTracking(false)}
        footer={[<Button key="close" onClick={() => setShowTracking(false)}>Close</Button>]}
      >
        <List
          dataSource={deliveryTracking}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<MailOutlined />} style={{ backgroundColor: item.status === 'Opened' ? token.colorSuccess : token.colorPrimary }} />}
                title={item.email}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Delivered: {item.deliveredAt}</Text>
                    {item.openedAt && <Text type="success" style={{ fontSize: 12 }}>Opened: {item.openedAt}</Text>}
                  </Space>
                }
              />
              <Tag color={item.status === 'Opened' ? 'success' : 'processing'}>{item.status}</Tag>
            </List.Item>
          )}
        />
      </Modal>

      {/* Quote PDF Preview Drawer */}
      <Drawer
        title="Quote Preview"
        placement="right"
        open={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        width={720}
        extra={
          <Space>
            <Button icon={<DownloadOutlined />}>Download PDF</Button>
            <Button type="primary" icon={<SendOutlined />} onClick={() => { setIsPreviewVisible(false); setIsSendModalVisible(true); }}>Send to Client</Button>
          </Space>
        }
      >
        <div style={{ padding: '48px 56px', background: '#fff', color: '#000', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {/* PDF Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, background: '#ff6b6b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 20 }}>T</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>The Production House</div>
                  <div style={{ fontSize: 11, color: '#888' }}>Event Production & Management</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#888', lineHeight: 1.6, marginTop: 8 }}>
                10 Anson Road, #12-01<br />
                International Plaza, Singapore 079903<br />
                +65 6789 0123 | quotes@tph.sg
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#ff6b6b', marginBottom: 4 }}>QUOTATION</div>
              <div style={{ fontSize: 12, color: '#666' }}>QT-2026-{quote.id.padStart(4, '0')}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Date: {quote.date}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Valid Until: {quote.validUntil}</div>
              <Tag color={quote.status === 'Approved' ? 'success' : quote.status === 'Sent' ? 'processing' : 'default'} style={{ marginTop: 8 }}>{quote.status}</Tag>
            </div>
          </div>

          {/* Client Info */}
          <div style={{ background: '#f8f9fa', borderRadius: 6, padding: '16px 20px', marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Bill To</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{quote.client}</div>
                <div style={{ fontSize: 12, color: '#666' }}>123 Tech Blvd, Silicon Valley, CA 94025</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Event</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{quote.eventName}</div>
                <div style={{ fontSize: 12, color: '#666' }}>Prepared by: {quote.preparedBy}</div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.5 }}>#</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Qty</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Unit Price</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Discount</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.key} style={{ borderBottom: '1px solid #e8e8e8' }}>
                  <td style={{ padding: '10px 8px', fontSize: 12, color: '#888' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{item.item}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{item.category}</div>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 13 }}>{item.qty}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: 13 }}>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: 13, color: item.discount > 0 ? '#ff4d4f' : '#888' }}>{item.discount > 0 ? `-${formatCurrency(item.discount)}` : '-'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{formatCurrency((item.unitPrice * item.qty) - item.discount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
            <div style={{ width: 280 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span style={{ fontWeight: 500 }}>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: '#ff4d4f' }}>Discount</span>
                <span style={{ color: '#ff4d4f' }}>-{formatCurrency(totalDiscount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: '#666' }}>GST (9%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 18, fontWeight: 700, borderTop: '2px solid #1a1a1a', marginTop: 4, color: '#1a1a1a' }}>
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Milestones */}
          {milestones.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Payment Schedule</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #d9d9d9' }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: 11, color: '#888' }}>Milestone</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: 11, color: '#888' }}>%</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: 11, color: '#888' }}>Amount</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: 11, color: '#888' }}>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px', fontSize: 12 }}>{m.name}</td>
                      <td style={{ padding: '8px', textAlign: 'center', fontSize: 12 }}>{m.percentage}%</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontSize: 12, fontWeight: 500 }}>{formatCurrency(m.amount)}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontSize: 12 }}>{m.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Terms */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Terms & Conditions</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{terms}</div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Authorized Signature</div>
              <div style={{ width: 200, borderBottom: '1px solid #ccc', height: 40 }} />
              <div style={{ fontSize: 12, color: '#1a1a1a', marginTop: 4 }}>{quote.preparedBy}</div>
              <div style={{ fontSize: 11, color: '#888' }}>The Production House Singapore</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Client Acceptance</div>
              <div style={{ width: 200, borderBottom: '1px solid #ccc', height: 40 }} />
              <div style={{ fontSize: 12, color: '#1a1a1a', marginTop: 4 }}>{quote.client}</div>
              <div style={{ fontSize: 11, color: '#888' }}>Date: _______________</div>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Line Item Comments Modal */}
      <Modal
        title={`Comments: ${items.find(i => i.key === activeCommentItem)?.item || ''}`}
        open={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        footer={null}
      >
        <List
          dataSource={items.find(i => i.key === activeCommentItem)?.comments || []}
          renderItem={(comment: any) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{comment.author.charAt(0)}</Avatar>}
                title={<Space><Text strong>{comment.author}</Text><Text type="secondary" style={{ fontSize: 12 }}>{comment.date}</Text></Space>}
                description={comment.text}
              />
            </List.Item>
          )}
          locale={{ emptyText: 'No comments yet.' }}
        />
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." onPressEnter={handleAddComment} />
          <Button type="primary" onClick={handleAddComment}>Post</Button>
        </div>
      </Modal>

    </div>
  );
};
