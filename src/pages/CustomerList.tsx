// @ts-nocheck
import React, { useState } from 'react';
import { Typography, Card, Table, Tag, Input, Button, Space, theme, Popconfirm, message } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { MOCK_CUSTOMERS } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const CustomerList: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    message.success('Customer deleted');
  };

  const columns = [
    { 
      title: 'Company Name', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text: string, record: any) => <a onClick={() => navigate(`/customer/${record.id}`)} style={{ fontWeight: 500 }}>{text}</a> 
    },
    { title: 'Industry', dataIndex: 'industry', key: 'industry' },
    { 
      title: 'Tier', 
      dataIndex: 'tier', 
      key: 'tier', 
      render: (val: string) => {
        let color = 'default';
        if (val === 'Platinum') color = 'purple';
        if (val === 'Gold') color = 'gold';
        if (val === 'Silver') color = 'blue';
        return <Tag color={color}>{val}</Tag>;
      }
    },
    { title: 'Account Manager', dataIndex: 'accountManager', key: 'accountManager' },
    { title: 'Active Projects', dataIndex: 'activeProjects', key: 'activeProjects' },
    { title: 'Total Revenue', dataIndex: 'totalRevenue', key: 'totalRevenue', render: (val: number) => formatCurrency(val) },
    { title: 'Last Contact', dataIndex: 'lastContact', key: 'lastContact' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => navigate(`/customer/${record.id}`)} />
          <Popconfirm title="Delete this customer?" onConfirm={() => handleDelete(record.id)}>
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
          <Title level={3} style={{ margin: 0 }}>Customers</Title>
          <Text type="secondary">Manage your client relationships and accounts.</Text>
        </div>
        <Space>
          <Button icon={<FilterOutlined />}>Filters</Button>
          <Button type="primary" icon={<PlusOutlined />}>New Customer</Button>
        </Space>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <div style={{ padding: 16, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Input 
            placeholder="Search customers by name or industry..." 
            prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={filteredCustomers} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};
