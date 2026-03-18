// @ts-nocheck
import React, { useMemo } from 'react';
import { Typography, Row, Col, Card, Statistic, Table, Tag, theme, Progress, Rate, Tooltip } from 'antd';
import { ShopOutlined, DollarOutlined, CheckCircleOutlined, StarOutlined, WarningOutlined, SafetyCertificateOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { MOCK_PARTNERS } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const PartnerDashboard: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  const { totalPartners, preferredCount, blacklistedCount, totalSpend, avgRating, avgOnTime, topPartners } = useMemo(() => {
    const active = MOCK_PARTNERS.filter(p => !p.isBlacklisted);
    const preferred = MOCK_PARTNERS.filter(p => p.isPreferred).length;
    const blacklisted = MOCK_PARTNERS.filter(p => p.isBlacklisted).length;
    const spend = MOCK_PARTNERS.reduce((sum, p) => sum + p.totalSpend, 0);
    const rating = active.reduce((sum, p) => sum + p.avgRating, 0) / active.length;
    const onTime = active.reduce((sum, p) => sum + p.onTimeRate, 0) / active.length;

    const sorted = [...MOCK_PARTNERS].filter(p => !p.isBlacklisted).sort((a, b) => b.avgRating - a.avgRating);

    return {
      totalPartners: MOCK_PARTNERS.length,
      preferredCount: preferred,
      blacklistedCount: blacklisted,
      totalSpend: spend,
      avgRating: Math.round(rating * 10) / 10,
      avgOnTime: Math.round(onTime),
      topPartners: sorted.slice(0, 5)
    };
  }, []);

  const columns = [
    {
      title: 'Partner',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <span>
          <a onClick={() => navigate(`/partner/${record.id}`)} style={{ fontWeight: 500 }}>{text}</a>
          {record.isPreferred && <Tag color="gold" style={{ marginLeft: 8 }}>Preferred</Tag>}
        </span>
      )
    },
    {
      title: 'Categories',
      dataIndex: 'serviceCategories',
      key: 'serviceCategories',
      render: (cats: string[]) => <Tag>{cats[0]}</Tag>
    },
    {
      title: 'Rating',
      dataIndex: 'avgRating',
      key: 'avgRating',
      render: (val: number) => <Rate disabled defaultValue={val} allowHalf style={{ fontSize: 14 }} />
    },
    {
      title: 'On-Time',
      dataIndex: 'onTimeRate',
      key: 'onTimeRate',
      render: (val: number) => <Tag color={val >= 90 ? 'success' : val >= 80 ? 'warning' : 'error'}>{val}%</Tag>
    },
    {
      title: 'Total Spend',
      dataIndex: 'totalSpend',
      key: 'totalSpend',
      render: (val: number) => formatCurrency(val)
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Partner Dashboard</Title>
        <Text type="secondary">Overview of sub-contractors, suppliers, vendors, and service partners.</Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Partners"
              value={totalPartners}
              styles={{ content: { color: token.colorPrimary } }}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Preferred Partners"
              value={preferredCount}
              styles={{ content: { color: token.colorSuccess } }}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Spend (All Time)"
              value={totalSpend}
              precision={0}
              styles={{ content: { color: token.colorText } }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg On-Time Rate"
              value={avgOnTime}
              suffix="%"
              styles={{ content: { color: avgOnTime >= 90 ? token.colorSuccess : token.colorWarning } }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card title="Top Rated Partners" extra={<a onClick={() => navigate('/partners')}>View All</a>}>
            <Table columns={columns} dataSource={topPartners} pagination={false} rowKey="id" />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Service Category Breakdown" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(() => {
                const catMap: Record<string, number> = {};
                MOCK_PARTNERS.filter(p => !p.isBlacklisted).forEach(p => {
                  p.serviceCategories.forEach(cat => { catMap[cat] = (catMap[cat] || 0) + 1; });
                });
                return Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, count]) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorPrimary }} />
                      <Text style={{ fontSize: 13 }}>{cat}</Text>
                    </div>
                    <Tag>{count} partner{count > 1 ? 's' : ''}</Tag>
                  </div>
                ));
              })()}
            </div>
          </Card>

          <Card title="Partner Health">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13 }}>Average Quality Rating</Text>
                  <Text strong>{avgRating} / 5</Text>
                </div>
                <Progress percent={Math.round((avgRating / 5) * 100)} strokeColor={token.colorSuccess} showInfo={false} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13 }}>Avg On-Time Delivery</Text>
                  <Text strong>{avgOnTime}%</Text>
                </div>
                <Progress percent={avgOnTime} strokeColor={avgOnTime >= 90 ? token.colorSuccess : token.colorWarning} showInfo={false} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px solid ${token.colorBorderSecondary}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <WarningOutlined style={{ color: token.colorError }} />
                  <Text>Blacklisted Partners</Text>
                </div>
                <Tag color="error">{blacklistedCount}</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SafetyCertificateOutlined style={{ color: token.colorSuccess }} />
                  <Text>Insured Partners</Text>
                </div>
                <Tag color="success">{MOCK_PARTNERS.filter(p => p.insurance).length} / {totalPartners}</Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
