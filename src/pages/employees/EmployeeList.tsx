// @ts-nocheck
import React, { useState } from 'react';
import { Typography, Card, Table, Tag, Input, Button, Space, theme, Popconfirm, message } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { MOCK_EMPLOYEES } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const EmployeeList: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    message.success('Employee deleted');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => <a onClick={() => navigate(`/employee/${record.id}`)} style={{ fontWeight: 500 }}>{text}</a>
    },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    {
      title: 'Type',
      dataIndex: 'employmentType',
      key: 'employmentType',
      render: (val: string) => {
        let color = 'default';
        if (val === 'Full-time') color = 'blue';
        if (val === 'Part-time') color = 'orange';
        if (val === 'Freelance') color = 'purple';
        return <Tag color={color}>{val}</Tag>;
      }
    },
    {
      title: 'Skills',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => (
        <Space size={[0, 4]} wrap>
          {skills.slice(0, 2).map(s => <Tag key={s}>{s}</Tag>)}
          {skills.length > 2 && <Tag>+{skills.length - 2}</Tag>}
        </Space>
      )
    },
    {
      title: 'Availability',
      dataIndex: 'availability',
      key: 'availability',
      render: (val: string) => {
        let color = 'default';
        let label = val;
        if (val === 'available') { color = 'success'; label = 'Available'; }
        if (val === 'on-project') { color = 'processing'; label = 'On Project'; }
        if (val === 'unavailable') { color = 'error'; label = 'Unavailable'; }
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: 'Daily Rate',
      dataIndex: 'dailyRate',
      key: 'dailyRate',
      render: (val: number) => formatCurrency(val)
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => navigate(`/employee/${record.id}`)} />
          <Popconfirm title="Delete this employee?" onConfirm={() => handleDelete(record.id)}>
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
          <Title level={3} style={{ margin: 0 }}>Employees</Title>
          <Text type="secondary">Manage your workforce and resource allocation.</Text>
        </div>
        <Space>
          <Button icon={<FilterOutlined />}>Filters</Button>
          <Button type="primary" icon={<PlusOutlined />}>New Employee</Button>
        </Space>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <div style={{ padding: 16, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Input
            placeholder="Search by name, designation, department, or skill..."
            prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 360 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};
