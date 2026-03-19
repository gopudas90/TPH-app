// @ts-nocheck
import React, { useMemo } from 'react';
import { Typography, Row, Col, Card, Statistic, Tag, theme, Progress, Table } from 'antd';
import { InboxOutlined, DollarOutlined, BarChartOutlined, ToolOutlined, WarningOutlined, CalendarOutlined } from '@ant-design/icons';
import { MOCK_ASSETS, MOCK_CONSUMABLES } from '../data/mockData';
import { formatCurrency } from '../utils';

const { Title, Text } = Typography;

export const AssetDashboard: React.FC = () => {
  const { token } = theme.useToken();

  const {
    totalAssets,
    totalValue,
    avgUtilisation,
    needsMaintenance,
    categoryBreakdown,
    conditionBreakdown,
    lowStockItems,
    upcomingMaintenance,
    topUtilised,
  } = useMemo(() => {
    const activeAssets = MOCK_ASSETS.filter(a => a.condition !== 'Retired');
    const value = MOCK_ASSETS.reduce((sum, a) => sum + a.currentValue, 0);
    const avgUtil = Math.round(activeAssets.reduce((sum, a) => sum + a.utilisationRate, 0) / activeAssets.length);
    const maintenance = MOCK_ASSETS.filter(a => a.condition === 'Requires Maintenance').length;

    // Category breakdown
    const categories = ['Staging', 'AV Equipment', 'Lighting', 'Rigging', 'Furniture', 'Props'];
    const catBreakdown = categories.map(cat => ({
      category: cat,
      count: MOCK_ASSETS.filter(a => a.category === cat).length,
    }));

    // Condition breakdown
    const conditions = ['Excellent', 'Good', 'Fair', 'Requires Maintenance', 'Retired'];
    const condBreakdown = conditions.map(cond => ({
      condition: cond,
      count: MOCK_ASSETS.filter(a => a.condition === cond).length,
    }));

    // Low stock consumables
    const lowStock = MOCK_CONSUMABLES.filter(c => c.currentStock < c.minimumThreshold);

    // Upcoming maintenance (sorted by date, exclude null)
    const upcoming = MOCK_ASSETS
      .filter(a => a.nextMaintenance !== null)
      .sort((a, b) => new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime())
      .slice(0, 5);

    // Top utilised
    const topUtil = [...MOCK_ASSETS]
      .filter(a => a.condition !== 'Retired')
      .sort((a, b) => b.utilisationRate - a.utilisationRate)
      .slice(0, 5);

    return {
      totalAssets: MOCK_ASSETS.length,
      totalValue: value,
      avgUtilisation: avgUtil,
      needsMaintenance: maintenance,
      categoryBreakdown: catBreakdown,
      conditionBreakdown: condBreakdown,
      lowStockItems: lowStock,
      upcomingMaintenance: upcoming,
      topUtilised: topUtil,
    };
  }, []);

  const conditionColorMap: Record<string, string> = {
    'Excellent': token.colorSuccess,
    'Good': token.colorPrimary,
    'Fair': token.colorWarning,
    'Requires Maintenance': token.colorError,
    'Retired': token.colorTextDisabled,
  };

  const categoryColorMap: Record<string, string> = {
    'Staging': 'blue',
    'AV Equipment': 'purple',
    'Lighting': 'gold',
    'Rigging': 'cyan',
    'Furniture': 'green',
    'Props': 'magenta',
  };

  const lowStockColumns = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (val: number) => <Text strong style={{ color: token.colorError }}>{val}</Text>,
    },
    {
      title: 'Min. Threshold',
      dataIndex: 'minimumThreshold',
      key: 'minimumThreshold',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => (
        <Tag color="warning" icon={<WarningOutlined />}>Low Stock</Tag>
      ),
    },
  ];

  const maintenanceColumns = [
    {
      title: 'Asset',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (val: string) => <Tag color={categoryColorMap[val]}>{val}</Tag>,
    },
    {
      title: 'Next Maintenance',
      dataIndex: 'nextMaintenance',
      key: 'nextMaintenance',
      render: (val: string) => {
        const date = new Date(val);
        const now = new Date();
        const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const color = daysUntil <= 7 ? 'error' : daysUntil <= 30 ? 'warning' : 'default';
        return <Tag color={color}>{new Date(val).toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })}</Tag>;
      },
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      render: (val: string) => {
        const color = val === 'Excellent' ? 'success' : val === 'Good' ? 'processing' : val === 'Fair' ? 'warning' : val === 'Requires Maintenance' ? 'error' : 'default';
        return <Tag color={color}>{val}</Tag>;
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Asset Dashboard</Title>
        <Text type="secondary">Overview of equipment, inventory, utilisation, and maintenance status.</Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Assets"
              value={totalAssets}
              styles={{ content: { color: token.colorPrimary } }}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Value (SGD)"
              value={totalValue}
              precision={0}
              styles={{ content: { color: token.colorText } }}
              prefix={<DollarOutlined />}
              formatter={(val) => formatCurrency(val as number)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Utilisation Rate"
              value={avgUtilisation}
              suffix="%"
              styles={{ content: { color: avgUtilisation >= 70 ? token.colorSuccess : token.colorWarning } }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Needs Maintenance"
              value={needsMaintenance}
              styles={{ content: { color: needsMaintenance > 0 ? token.colorError : token.colorSuccess } }}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Assets by Category">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {categoryBreakdown.map(({ category, count }) => (
                <div key={category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorPrimary }} />
                    <Text style={{ fontSize: 13 }}>{category}</Text>
                  </div>
                  <Tag color={categoryColorMap[category]}>{count} asset{count !== 1 ? 's' : ''}</Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Condition Overview">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {conditionBreakdown.map(({ condition, count }) => {
                const pct = Math.round((count / totalAssets) * 100);
                return (
                  <div key={condition}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13 }}>{condition}</Text>
                      <Text strong>{count} ({pct}%)</Text>
                    </div>
                    <Progress
                      percent={pct}
                      size="small"
                      strokeColor={conditionColorMap[condition]}
                      showInfo={false}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title={<span><WarningOutlined style={{ color: token.colorWarning, marginRight: 8 }} />Low Stock Alerts</span>}>
            <Table
              columns={lowStockColumns}
              dataSource={lowStockItems}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<span><CalendarOutlined style={{ color: token.colorPrimary, marginRight: 8 }} />Upcoming Maintenance</span>}>
            <Table
              columns={maintenanceColumns}
              dataSource={upcomingMaintenance}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Top Utilised Assets">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {topUtilised.map((asset) => (
                <div key={asset.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 13 }}>{asset.name}</Text>
                      <Tag color={categoryColorMap[asset.category]}>{asset.category}</Tag>
                    </div>
                    <Text strong>{asset.utilisationRate}%</Text>
                  </div>
                  <Progress
                    percent={asset.utilisationRate}
                    size="small"
                    strokeColor={asset.utilisationRate >= 85 ? token.colorSuccess : asset.utilisationRate >= 60 ? token.colorPrimary : token.colorWarning}
                    showInfo={false}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
