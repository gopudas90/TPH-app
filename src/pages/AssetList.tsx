// @ts-nocheck
import React, { useState } from 'react';
import { Typography, Card, Table, Tag, Input, Button, Space, theme, Popconfirm, message, Progress } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { MOCK_ASSETS } from '../data/mockData';
import { formatCurrency } from '../utils';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const categoryColors: Record<string, string> = {
  'Staging': 'purple',
  'AV Equipment': 'blue',
  'Lighting': 'gold',
  'Rigging': 'orange',
  'Furniture': 'cyan',
  'Props': 'magenta',
};

const conditionConfig: Record<string, { color: string }> = {
  'Excellent': { color: 'green' },
  'Good': { color: 'blue' },
  'Fair': { color: 'orange' },
  'Requires Maintenance': { color: 'red' },
  'Retired': { color: 'default' },
};

export const AssetList: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState(MOCK_ASSETS);

  const filteredAssets = assets.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    message.success('Asset deleted');
  };

  const columns = [
    {
      title: 'Asset Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <a onClick={() => navigate(`/asset/${record.id}`)} style={{ fontWeight: 500 }}>{text}</a>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{record.category}</Text></div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [...new Set(MOCK_ASSETS.map(a => a.category))].map(c => ({ text: c, value: c })),
      onFilter: (value: string, record: any) => record.category === value,
      render: (cat: string) => (
        <Tag color={categoryColors[cat] || 'default'}>{cat}</Tag>
      ),
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      filters: Object.keys(conditionConfig).map(c => ({ text: c, value: c })),
      onFilter: (value: string, record: any) => record.condition === value,
      render: (cond: string) => (
        <Tag color={conditionConfig[cond]?.color || 'default'}>{cond}</Tag>
      ),
    },
    {
      title: 'Utilisation',
      dataIndex: 'utilisationRate',
      key: 'utilisationRate',
      width: 140,
      sorter: (a: any, b: any) => a.utilisationRate - b.utilisationRate,
      render: (val: number) => {
        const color = val >= 80 ? token.colorSuccess : val >= 50 ? token.colorWarning : token.colorError;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress percent={val} size="small" strokeColor={color} showInfo={false} style={{ flex: 1, margin: 0 }} />
            <Text strong style={{ fontSize: 12, color, minWidth: 32 }}>{val}%</Text>
          </div>
        );
      },
    },
    {
      title: 'Current Value',
      dataIndex: 'currentValue',
      key: 'currentValue',
      sorter: (a: any, b: any) => a.currentValue - b.currentValue,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: 'Storage',
      dataIndex: 'location',
      key: 'location',
      render: (loc: string) => <Text>{loc}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => (
        record.assignedProject
          ? <Tag color="processing">{record.assignedProject}</Tag>
          : <Tag color="success">Available</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => navigate(`/asset/${record.id}`)} />
          <Popconfirm title="Delete this asset?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Assets</Title>
          <Text type="secondary">Manage equipment, staging, lighting, and other production assets.</Text>
        </div>
        <Space>
          <Button icon={<FilterOutlined />}>Filters</Button>
          <Button type="primary" icon={<PlusOutlined />}>Add Asset</Button>
        </Space>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <div style={{ padding: 16, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Input
            placeholder="Search by name, category, or storage location..."
            prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 400 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredAssets}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};
