// @ts-nocheck
import React, { useState } from 'react';
import { Typography, Card, Table, Tag, Input, Button, Space, theme, Rate, Popconfirm, message } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, EditOutlined, DeleteOutlined, StarFilled, StopOutlined } from '@ant-design/icons';
import { MOCK_PARTNERS } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const PartnerList: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState(MOCK_PARTNERS);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  const filteredPartners = partners.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.serviceCategories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.specialisations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    setPartners(partners.filter(p => p.id !== id));
    message.success('Partner deleted');
  };

  const columns = [
    {
      title: 'Partner Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <span>
          <a onClick={() => navigate(`/partner/${record.id}`)} style={{ fontWeight: 500 }}>{text}</a>
          {record.isPreferred && <Tag color="gold" style={{ marginLeft: 8 }}><StarFilled /> Preferred</Tag>}
          {record.isBlacklisted && <Tag color="error" style={{ marginLeft: 8 }}><StopOutlined /> Blacklisted</Tag>}
        </span>
      )
    },
    {
      title: 'Service Categories',
      dataIndex: 'serviceCategories',
      key: 'serviceCategories',
      render: (cats: string[]) => (
        <Space size={[0, 4]} wrap>
          {cats.slice(0, 2).map(c => <Tag key={c}>{c}</Tag>)}
          {cats.length > 2 && <Tag>+{cats.length - 2}</Tag>}
        </Space>
      )
    },
    {
      title: 'Rating',
      dataIndex: 'avgRating',
      key: 'avgRating',
      render: (val: number) => <Rate disabled defaultValue={val} allowHalf style={{ fontSize: 13 }} />
    },
    {
      title: 'On-Time',
      dataIndex: 'onTimeRate',
      key: 'onTimeRate',
      render: (val: number) => <Tag color={val >= 90 ? 'success' : val >= 80 ? 'warning' : 'error'}>{val}%</Tag>
    },
    {
      title: 'Engagements',
      dataIndex: 'engagements',
      key: 'engagements',
    },
    {
      title: 'Total Spend',
      dataIndex: 'totalSpend',
      key: 'totalSpend',
      render: (val: number) => formatCurrency(val)
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => navigate(`/partner/${record.id}`)} />
          <Popconfirm title="Delete this partner?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Partners</Title>
          <Text type="secondary">Manage sub-contractors, suppliers, and service partners.</Text>
        </div>
        <Space>
          <Button icon={<FilterOutlined />}>Filters</Button>
          <Button type="primary" icon={<PlusOutlined />}>New Partner</Button>
        </Space>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <div style={{ padding: 16, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Input
            placeholder="Search by name, service category, or specialisation..."
            prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 400 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredPartners}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};
