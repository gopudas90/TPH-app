// @ts-nocheck
import React, { useState } from 'react';
import { Typography, Card, Table, Tag, Space, Input, Select, Button, theme, Badge } from 'antd';
import { SearchOutlined, FileTextOutlined, CalendarOutlined, DollarOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const MOCK_ENQUIRIES = [
  { id: 'ENQ-001', name: 'Tech Summit 2026', type: 'Conference', eventDate: '2026-09-15', submittedDate: '2026-03-01', status: 'Quote Sent', quoteValue: 125000, quoteVersion: 'v2.0', assignedTo: 'Sarah Jenkins' },
  { id: 'ENQ-002', name: 'Holiday Party 2026', type: 'Gala Dinner', eventDate: '2026-12-15', submittedDate: '2026-03-10', status: 'Under Review', quoteValue: null, quoteVersion: null, assignedTo: 'Mark Davis' },
  { id: 'ENQ-003', name: 'Q1 Town Hall 2026', type: 'Town Hall / AGM', eventDate: '2026-03-28', submittedDate: '2026-01-15', status: 'Accepted', quoteValue: 45000, quoteVersion: 'v1.1', assignedTo: 'Sarah Jenkins' },
  { id: 'ENQ-004', name: 'Product Launch Gala', type: 'Product Launch', eventDate: '2026-07-20', submittedDate: '2026-02-20', status: 'Quote Sent', quoteValue: 85000, quoteVersion: 'v1.0', assignedTo: 'Alex Wong' },
  { id: 'ENQ-005', name: 'Annual Sales Kickoff', type: 'Conference', eventDate: '2026-11-05', submittedDate: '2026-02-01', status: 'Accepted', quoteValue: 210000, quoteVersion: 'v2.0', assignedTo: 'Sarah Jenkins' },
  { id: 'ENQ-006', name: 'Summer Roadshow', type: 'Roadshow', eventDate: '2026-06-01', submittedDate: '2025-12-10', status: 'Converted', quoteValue: 350000, quoteVersion: 'v3.0', assignedTo: 'Mark Davis' },
];

export const ClientEnquiries: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fmt = (v: number) => new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(v);

  const statusColors: Record<string, string> = {
    'Under Review': 'warning',
    'Quote Sent': 'processing',
    'Accepted': 'success',
    'Converted': 'cyan',
    'Rejected': 'error',
  };

  const filtered = MOCK_ENQUIRIES.filter(e => {
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns = [
    {
      title: 'Enquiry', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, r) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.name}</Text>
          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{r.id} &middot; {r.type}</Text>
        </div>
      ),
    },
    {
      title: 'Event Date', dataIndex: 'eventDate', key: 'eventDate', width: 120,
      sorter: (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
      render: (v: string) => <Text style={{ fontSize: 12 }}>{new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>,
    },
    {
      title: 'Submitted', dataIndex: 'submittedDate', key: 'submittedDate', width: 120,
      sorter: (a, b) => new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime(),
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>,
    },
    {
      title: 'Quote', key: 'quote', width: 140,
      sorter: (a, b) => (a.quoteValue || 0) - (b.quoteValue || 0),
      render: (_, r) => r.quoteValue ? (
        <div>
          <Text strong style={{ fontSize: 12 }}>{fmt(r.quoteValue)}</Text>
          <Tag style={{ margin: '0 0 0 6px', fontSize: 10 }}>{r.quoteVersion}</Tag>
        </div>
      ) : <Text type="secondary" style={{ fontSize: 12 }}>Pending</Text>,
    },
    {
      title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo', width: 130,
      filters: [...new Set(MOCK_ENQUIRIES.map(e => e.assignedTo))].map(a => ({ text: a, value: a })),
      onFilter: (v, r) => r.assignedTo === v,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 120,
      render: (v: string) => <Tag color={statusColors[v] || 'default'} style={{ margin: 0 }}>{v}</Tag>,
    },
    {
      title: '', key: 'action', width: 80,
      render: (_, r) => <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/client/enquiries/${r.id}`)}>View</Button>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>My Enquiries</Title>
          <Text type="secondary">Track your event enquiries and associated quotes.</Text>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Input prefix={<SearchOutlined />} placeholder="Search enquiries..." value={search} onChange={e => setSearch(e.target.value)} allowClear size="small" style={{ width: 250 }} />
        <Select value={statusFilter} onChange={setStatusFilter} size="small" style={{ width: 150 }} options={[
          { value: 'All', label: 'All Statuses' },
          { value: 'Under Review', label: 'Under Review' },
          { value: 'Quote Sent', label: 'Quote Sent' },
          { value: 'Accepted', label: 'Accepted' },
          { value: 'Converted', label: 'Converted' },
        ]} />
      </div>
      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 10 }}
          onRow={r => ({ onClick: () => navigate(`/client/enquiries/${r.id}`), style: { cursor: 'pointer' } })}
        />
      </Card>
    </div>
  );
};
