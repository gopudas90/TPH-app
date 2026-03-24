// @ts-nocheck
import React, { useState } from 'react';
import {
  Typography, Card, Table, Tag, Space, Button, theme, Descriptions, Divider,
  Input, Avatar, Tooltip, Modal, message, Row, Col, Steps, Badge,
} from 'antd';
import {
  ArrowLeftOutlined, FileTextOutlined, CheckCircleOutlined, DownloadOutlined,
  SendOutlined, DollarOutlined, CalendarOutlined, UserOutlined, MessageOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

const MOCK_ENQUIRY = {
  id: 'ENQ-001',
  name: 'Tech Summit 2026',
  type: 'Conference',
  eventDate: '2026-09-15',
  venue: 'Marina Bay Sands Expo',
  attendance: 500,
  submittedDate: '2026-03-01',
  status: 'Quote Sent',
  assignedTo: 'Sarah Jenkins',
  description: 'Annual technology summit focusing on AI and future trends. Requires main stage setup, 4 breakout rooms, and a networking lounge area.',
  requirements: ['Main stage with LED wall', '4 breakout rooms with projectors', 'VIP networking lounge', 'Live streaming setup'],
};

const MOCK_QUOTE = {
  id: 'QT-2026-0042',
  version: 'v2.0',
  date: '2026-03-15',
  status: 'Sent',
  validUntil: '2026-04-15',
  preparedBy: 'Sarah Jenkins',
  lineItems: [
    { key: '1', item: 'Stage Design & Build', category: 'Scenic', qty: 1, unitPrice: 28000, comments: [] },
    { key: '2', item: 'LED Video Wall (P2.6, 6m x 3m)', category: 'AV Equipment', qty: 1, unitPrice: 15000, comments: [] },
    { key: '3', item: 'Line Array Audio System', category: 'AV Equipment', qty: 1, unitPrice: 8500, comments: [
      { id: 'c1', author: 'Sarah Jenkins', role: 'TPH', text: 'Includes 12 speakers + 4 subs for the main hall', time: '15 Mar, 2:30 PM' },
    ] },
    { key: '4', item: 'Lighting Package (Intelligent + Wash)', category: 'Lighting', qty: 1, unitPrice: 12000, comments: [] },
    { key: '5', item: 'Breakout Room AV (x4)', category: 'AV Equipment', qty: 4, unitPrice: 3500, comments: [] },
    { key: '6', item: 'VIP Lounge Furniture Package', category: 'Furniture', qty: 1, unitPrice: 6500, comments: [
      { id: 'c2', author: 'Jane Doe', role: 'Client', text: 'Can we explore a separate floor option for the VIP lounge?', time: '18 Mar, 2:30 PM' },
      { id: 'c3', author: 'Sarah Jenkins', role: 'TPH', text: 'Absolutely — I\'ll check with MBS on Level 5 availability and get back to you by Thursday.', time: '18 Mar, 3:45 PM' },
    ] },
    { key: '7', item: 'Event Management & Crew', category: 'Labour', qty: 3, unitPrice: 4500, comments: [] },
    { key: '8', item: 'Live Streaming & Recording', category: 'Digital', qty: 1, unitPrice: 5000, comments: [] },
  ],
};

const STAGES = ['Submitted', 'Under Review', 'Quote Sent', 'Accepted', 'Converted'];

export const ClientEnquiryDetail: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { id } = useParams();
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [lineItems, setLineItems] = useState(MOCK_QUOTE.lineItems);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);

  const fmt = (v: number) => new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(v);

  const subtotal = lineItems.reduce((s, li) => s + li.unitPrice * li.qty, 0);
  const gst = Math.round(subtotal * 0.09);
  const total = subtotal + gst;

  const currentStage = STAGES.indexOf(MOCK_ENQUIRY.status);

  const addComment = (key: string) => {
    const text = commentInputs[key]?.trim();
    if (!text) return;
    setLineItems(prev => prev.map(li =>
      li.key === key ? { ...li, comments: [...li.comments, { id: Date.now().toString(), author: 'Jane Doe', role: 'Client', text, time: 'Just now' }] } : li
    ));
    setCommentInputs(prev => ({ ...prev, [key]: '' }));
  };

  const handleAccept = () => {
    setAcceptModalOpen(false);
    message.success('Quote accepted! TPH will be in touch to confirm next steps.');
  };

  const handleExport = () => {
    message.info('Quote PDF downloaded');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/client/enquiries')} />
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ margin: 0 }}>{MOCK_ENQUIRY.name}</Title>
          <Space size={8}>
            <Text type="secondary">{MOCK_ENQUIRY.id}</Text>
            <Tag color="blue">{MOCK_ENQUIRY.type}</Tag>
            <Tag color="processing">{MOCK_ENQUIRY.status}</Tag>
          </Space>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export PDF</Button>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setAcceptModalOpen(true)}>Accept Quote</Button>
        </Space>
      </div>

      {/* Progress */}
      <Card size="small" style={{ marginBottom: 20 }} styles={{ body: { padding: '16px 24px 0' } }}>
        <Steps current={currentStage} size="small" labelPlacement="vertical" items={STAGES.map(s => ({ title: <span style={{ fontSize: 11 }}>{s}</span> }))} style={{ marginBottom: 16 }} />
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Enquiry Details */}
        <Col span={12}>
          <Card size="small" title={<Text strong style={{ fontSize: 13 }}>Enquiry Details</Text>}>
            <Descriptions column={1} size="small" labelStyle={{ fontSize: 12, color: token.colorTextSecondary }} contentStyle={{ fontSize: 12 }}>
              <Descriptions.Item label="Event">{MOCK_ENQUIRY.name}</Descriptions.Item>
              <Descriptions.Item label="Type">{MOCK_ENQUIRY.type}</Descriptions.Item>
              <Descriptions.Item label="Event Date">{new Date(MOCK_ENQUIRY.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Descriptions.Item>
              <Descriptions.Item label="Venue">{MOCK_ENQUIRY.venue}</Descriptions.Item>
              <Descriptions.Item label="Attendance">{MOCK_ENQUIRY.attendance} pax</Descriptions.Item>
              <Descriptions.Item label="Account Manager">{MOCK_ENQUIRY.assignedTo}</Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{MOCK_ENQUIRY.description}</Text>
          </Card>
        </Col>

        {/* Quote Summary */}
        <Col span={12}>
          <Card size="small" title={<Text strong style={{ fontSize: 13 }}>Quote Summary</Text>} extra={<Tag>{MOCK_QUOTE.version}</Tag>}>
            <Descriptions column={1} size="small" labelStyle={{ fontSize: 12, color: token.colorTextSecondary }} contentStyle={{ fontSize: 12 }}>
              <Descriptions.Item label="Quote No">{MOCK_QUOTE.id}</Descriptions.Item>
              <Descriptions.Item label="Prepared By">{MOCK_QUOTE.preparedBy}</Descriptions.Item>
              <Descriptions.Item label="Date">{MOCK_QUOTE.date}</Descriptions.Item>
              <Descriptions.Item label="Valid Until"><Text type={new Date(MOCK_QUOTE.validUntil) > new Date() ? undefined : 'danger'}>{MOCK_QUOTE.validUntil}</Text></Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12 }}>Subtotal</Text>
                <Text style={{ fontSize: 12 }}>{fmt(subtotal)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12 }}>GST (9%)</Text>
                <Text style={{ fontSize: 12 }}>{fmt(gst)}</Text>
              </div>
              <Divider style={{ margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 14 }}>Total</Text>
                <Text strong style={{ fontSize: 14, color: token.colorPrimary }}>{fmt(total)}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Line Items with Comments */}
      <Card size="small" title={<Text strong style={{ fontSize: 13 }}>Quote Line Items</Text>} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={lineItems}
          rowKey="key"
          pagination={false}
          size="small"
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '8px 16px' }}>
                {/* Comments */}
                {record.comments.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    {record.comments.map(c => (
                      <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8, justifyContent: c.role === 'Client' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '70%', padding: '6px 10px',
                          borderRadius: c.role === 'Client' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                          background: c.role === 'Client' ? token.colorPrimary : token.colorFillAlter,
                          color: c.role === 'Client' ? '#fff' : token.colorText,
                          fontSize: 12, lineHeight: 1.5,
                        }}>
                          <Text strong style={{ fontSize: 11, color: c.role === 'Client' ? 'rgba(255,255,255,0.85)' : token.colorTextSecondary, display: 'block' }}>{c.author}</Text>
                          {c.text}
                          <div style={{ fontSize: 10, marginTop: 2, opacity: 0.7 }}>{c.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Add comment */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    size="small"
                    placeholder="Add a comment on this line item..."
                    value={commentInputs[record.key] || ''}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [record.key]: e.target.value }))}
                    onPressEnter={() => addComment(record.key)}
                    style={{ fontSize: 12 }}
                  />
                  <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => addComment(record.key)} disabled={!commentInputs[record.key]?.trim()} />
                </div>
              </div>
            ),
            rowExpandable: () => true,
          }}
          columns={[
            { title: '#', key: 'idx', width: 40, render: (_, __, idx) => <Text type="secondary" style={{ fontSize: 11 }}>{idx + 1}</Text> },
            { title: 'Item', dataIndex: 'item', key: 'item', render: (v, r) => (
              <div>
                <Text style={{ fontSize: 12 }}>{v}</Text>
                {r.comments.length > 0 && <Badge count={r.comments.length} size="small" style={{ marginLeft: 6 }} />}
              </div>
            ) },
            { title: 'Category', dataIndex: 'category', key: 'category', width: 120, render: v => <Tag style={{ fontSize: 10 }}>{v}</Tag> },
            { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 60, align: 'center' },
            { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, align: 'right', render: v => fmt(v) },
            { title: 'Total', key: 'total', width: 120, align: 'right', render: (_, r) => <Text strong>{fmt(r.unitPrice * r.qty)}</Text> },
          ]}
        />
      </Card>

      {/* Accept Modal */}
      <Modal
        title="Accept Quote"
        open={acceptModalOpen}
        onCancel={() => setAcceptModalOpen(false)}
        onOk={handleAccept}
        okText="Confirm Acceptance"
      >
        <div style={{ marginTop: 16 }}>
          <Text>You are about to accept <strong>{MOCK_QUOTE.id} ({MOCK_QUOTE.version})</strong> for <strong>{MOCK_ENQUIRY.name}</strong>.</Text>
          <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: token.colorFillAlter }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Total (incl. GST)</Text>
              <Text strong style={{ color: token.colorPrimary }}>{fmt(total)}</Text>
            </div>
          </div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 12 }}>
            By accepting, you agree to the terms outlined in the quote. TPH will follow up with a formal contract for signature.
          </Text>
        </div>
      </Modal>
    </div>
  );
};
