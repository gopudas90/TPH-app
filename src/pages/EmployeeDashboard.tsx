// @ts-nocheck
import React, { useMemo } from 'react';
import { Typography, Row, Col, Card, Statistic, Table, Tag, theme, Progress, Tooltip, Space } from 'antd';
import { TeamOutlined, DollarOutlined, CheckCircleOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { MOCK_EMPLOYEES } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const EmployeeDashboard: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  const { totalEmployees, availableCount, onProjectCount, avgDailyRate, certifiedCount, recentEmployees } = useMemo(() => {
    const available = MOCK_EMPLOYEES.filter(e => e.availability === 'available').length;
    const onProject = MOCK_EMPLOYEES.filter(e => e.availability === 'on-project').length;
    const avgRate = Math.round(MOCK_EMPLOYEES.reduce((sum, e) => sum + e.dailyRate, 0) / MOCK_EMPLOYEES.length);
    const certified = MOCK_EMPLOYEES.filter(e => e.certifications.length > 0).length;

    const sorted = [...MOCK_EMPLOYEES].sort((a, b) => b.totalProjectsCompleted - a.totalProjectsCompleted);

    return {
      totalEmployees: MOCK_EMPLOYEES.length,
      availableCount: available,
      onProjectCount: onProject,
      avgDailyRate: avgRate,
      certifiedCount: certified,
      recentEmployees: sorted.slice(0, 5)
    };
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => <a onClick={() => navigate(`/employee/${record.id}`)}>{text}</a>
    },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
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
      title: 'Projects Completed',
      dataIndex: 'totalProjectsCompleted',
      key: 'totalProjectsCompleted'
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Employee Dashboard</Title>
        <Text type="secondary">Overview of workforce, availability, and resource metrics.</Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={totalEmployees}
              styles={{ content: { color: token.colorPrimary } }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Available Now"
              value={availableCount}
              styles={{ content: { color: token.colorSuccess } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="On Project"
              value={onProjectCount}
              styles={{ content: { color: token.colorInfo } }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Daily Rate"
              value={avgDailyRate}
              precision={0}
              styles={{ content: { color: token.colorText } }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card title="Top Performers" extra={<a onClick={() => navigate('/employees')}>View All</a>}>
            <Table columns={columns} dataSource={recentEmployees} pagination={false} rowKey="id" />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Department Breakdown" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Creative', 'Technical', 'Operations', 'Production', 'Management'].map(dept => {
                const count = MOCK_EMPLOYEES.filter(e => e.department === dept).length;
                if (count === 0) return null;
                return (
                  <div key={dept} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorPrimary }} />
                      <Text>{dept}</Text>
                    </div>
                    <Tag>{count} staff</Tag>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card title="Certifications Overview">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <Text style={{ fontSize: 24, fontWeight: 600, display: 'block', color: token.colorText }}>{certifiedCount}/{totalEmployees}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>Staff Certified</Text>
              </div>
              <Progress
                type="circle"
                percent={Math.round((certifiedCount / totalEmployees) * 100)}
                size={56}
                strokeColor={token.colorSuccess}
                format={percent => `${percent}%`}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'Workplace Safety & Health', keyword: 'Workplace', color: '#52c41a' },
                { name: 'Rigging Certification', keyword: 'Rigging', color: '#1677ff' },
                { name: 'Electrical Safety', keyword: 'Electrical', color: '#faad14' },
                { name: 'First Aid Certified', keyword: 'First', color: '#ff4d4f' },
                { name: 'AVIXA CTS', keyword: 'AVIXA', color: '#722ed1' },
                { name: 'PMP Certified', keyword: 'PMP', color: '#13c2c2' },
                { name: 'Forklift Operation', keyword: 'Forklift', color: '#eb2f96' },
              ].map(cert => {
                const holders = MOCK_EMPLOYEES.filter(e => e.certifications.some(c => c.includes(cert.keyword)));
                if (holders.length === 0) return null;
                const pct = Math.round((holders.length / totalEmployees) * 100);
                return (
                  <div key={cert.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13 }}>{cert.name}</Text>
                      <Tooltip title={holders.map(h => h.name).join(', ')}>
                        <Space size={4} style={{ cursor: 'pointer' }}>
                          <UserOutlined style={{ fontSize: 11, color: token.colorTextSecondary }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>{holders.length}</Text>
                        </Space>
                      </Tooltip>
                    </div>
                    <Progress percent={pct} size="small" strokeColor={cert.color} showInfo={false} />
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
