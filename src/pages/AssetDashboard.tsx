// @ts-nocheck
import React, { useMemo } from 'react';
import { Typography, Row, Col, Card, Statistic, Tag, theme, Progress, Table, Alert, Empty } from 'antd';
import { InboxOutlined, DollarOutlined, BarChartOutlined, ToolOutlined, WarningOutlined, CalendarOutlined, CheckCircleOutlined, SwapOutlined } from '@ant-design/icons';
import { MOCK_ASSETS, MOCK_CONSUMABLES, MOCK_ASSET_BOOKINGS } from '../data/mockData';
import { formatCurrency } from '../utils';
import { detectConflicts } from '../utils/assetUtils';

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

    // Currently checked out bookings
    const checkedOut = MOCK_ASSET_BOOKINGS.filter(b => b.status === 'checked-out');

    // Booking conflicts across all assets
    const uniqueAssetIds = [...new Set(MOCK_ASSET_BOOKINGS.map(b => b.assetId))];
    const allConflicts: Array<{ booking1: any; booking2: any }> = [];
    uniqueAssetIds.forEach(id => {
      const c = detectConflicts(id, MOCK_ASSET_BOOKINGS);
      allConflicts.push(...c);
    });

    // This month's bookings for fleet overview
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = monthEnd.getDate();

    const thisMonthBookings = MOCK_ASSET_BOOKINGS.filter(b => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return start <= monthEnd && end >= monthStart;
    });

    // Group by asset for Gantt
    const ganttAssets: Record<string, Array<any>> = {};
    thisMonthBookings.forEach(b => {
      if (!ganttAssets[b.assetId]) ganttAssets[b.assetId] = [];
      ganttAssets[b.assetId].push(b);
    });

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
      checkedOutBookings: checkedOut,
      bookingConflicts: allConflicts,
      ganttAssets,
      daysInMonth,
      monthStart,
      monthEnd,
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

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
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

      {/* Currently Checked Out */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title={<span><SwapOutlined style={{ color: token.colorPrimary, marginRight: 8 }} />Currently Checked Out</span>}>
            {checkedOutBookings.length === 0 ? (
              <Empty description="No assets are currently checked out" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                columns={[
                  {
                    title: 'Asset Name',
                    dataIndex: 'assetName',
                    key: 'assetName',
                    render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
                  },
                  {
                    title: 'Project',
                    dataIndex: 'projectName',
                    key: 'projectName',
                    render: (text: string) => <Tag color="blue">{text}</Tag>,
                  },
                  {
                    title: 'Checked Out By',
                    dataIndex: 'checkedOutBy',
                    key: 'checkedOutBy',
                  },
                  {
                    title: 'Check-Out Date',
                    dataIndex: 'checkOutDate',
                    key: 'checkOutDate',
                    render: (val: string) => val ? new Date(val).toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
                  },
                  {
                    title: 'Days Out',
                    key: 'daysOut',
                    render: (_: any, record: any) => {
                      const refDate = record.checkOutDate || record.startDate;
                      const days = Math.ceil((new Date().getTime() - new Date(refDate).getTime()) / (1000 * 60 * 60 * 24));
                      const color = days >= 7 ? 'warning' : 'default';
                      return <Tag color={color}>{days} day{days !== 1 ? 's' : ''}</Tag>;
                    },
                  },
                ]}
                dataSource={checkedOutBookings}
                pagination={false}
                rowKey="id"
                size="small"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Booking Conflicts */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title={<span><WarningOutlined style={{ color: token.colorWarning, marginRight: 8 }} />Booking Conflicts</span>}>
            {bookingConflicts.length === 0 ? (
              <Alert
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                message="No booking conflicts detected"
                description="All asset bookings have non-overlapping date ranges."
              />
            ) : (
              <Alert
                type="warning"
                showIcon
                message={`${bookingConflicts.length} booking conflict${bookingConflicts.length !== 1 ? 's' : ''} detected`}
                description={
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {bookingConflicts.map((conflict, idx) => {
                      const b1Start = new Date(conflict.booking1.startDate).toLocaleDateString('en-SG', { day: '2-digit', month: 'short' });
                      const b1End = new Date(conflict.booking1.endDate).toLocaleDateString('en-SG', { day: '2-digit', month: 'short' });
                      const b2Start = new Date(conflict.booking2.startDate).toLocaleDateString('en-SG', { day: '2-digit', month: 'short' });
                      const b2End = new Date(conflict.booking2.endDate).toLocaleDateString('en-SG', { day: '2-digit', month: 'short' });
                      return (
                        <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255,165,0,0.06)', borderRadius: 6, border: '1px solid rgba(255,165,0,0.2)' }}>
                          <Text strong style={{ fontSize: 13 }}>{conflict.booking1.assetName}</Text>
                          <br />
                          <Text style={{ fontSize: 12 }}>
                            <Tag color="blue" style={{ marginRight: 4 }}>{conflict.booking1.projectName}</Tag>
                            {b1Start} – {b1End}
                            <span style={{ margin: '0 8px', color: token.colorTextSecondary }}>conflicts with</span>
                            <Tag color="orange" style={{ marginRight: 4 }}>{conflict.booking2.projectName}</Tag>
                            {b2Start} – {b2End}
                          </Text>
                        </div>
                      );
                    })}
                  </div>
                }
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Fleet Booking Overview — This Month */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title={<span><CalendarOutlined style={{ color: token.colorPrimary, marginRight: 8 }} />Fleet Booking Overview — {new Date().toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })}</span>}>
            {/* Day header */}
            <div style={{ display: 'flex', marginBottom: 8 }}>
              <div style={{ width: 220, minWidth: 220, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 10,
                      color: token.colorTextSecondary,
                      borderLeft: i === 0 ? `1px solid ${token.colorBorderSecondary}` : 'none',
                      borderRight: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            {/* Asset rows */}
            {Object.keys(ganttAssets).length === 0 ? (
              <Empty description="No bookings this month" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              Object.entries(ganttAssets).map(([assetId, bookings]) => (
                <div key={assetId} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ width: 220, minWidth: 220, flexShrink: 0, paddingRight: 12 }}>
                    <Text ellipsis style={{ fontSize: 12 }}>{bookings[0].assetName}</Text>
                  </div>
                  <div style={{ flex: 1, position: 'relative', height: 28, background: token.colorFillQuaternary, borderRadius: 4 }}>
                    {bookings.map((booking: any) => {
                      const bStart = new Date(booking.startDate);
                      const bEnd = new Date(booking.endDate);
                      // Clamp to month boundaries
                      const effectiveStart = bStart < monthStart ? monthStart : bStart;
                      const effectiveEnd = bEnd > monthEnd ? monthEnd : bEnd;
                      const startDay = effectiveStart.getDate();
                      const endDay = effectiveEnd.getDate();
                      const leftPct = ((startDay - 1) / daysInMonth) * 100;
                      const widthPct = ((endDay - startDay + 1) / daysInMonth) * 100;

                      const statusColor =
                        booking.status === 'confirmed' ? '#1677ff' :
                        booking.status === 'checked-out' || booking.status === 'returned' ? '#52c41a' :
                        '#fa8c16'; // pending = orange

                      return (
                        <div
                          key={booking.id}
                          title={`${booking.projectName} (${booking.status}) — ${booking.startDate} to ${booking.endDate}`}
                          style={{
                            position: 'absolute',
                            top: 3,
                            height: 22,
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            minWidth: 4,
                            background: statusColor,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: 6,
                            overflow: 'hidden',
                          }}
                        >
                          <span style={{ fontSize: 10, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {booking.projectName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 8, borderTop: `1px solid ${token.colorBorderSecondary}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: '#1677ff' }} />
                <Text style={{ fontSize: 11 }}>Confirmed</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: '#52c41a' }} />
                <Text style={{ fontSize: 11 }}>Checked Out / Returned</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: '#fa8c16' }} />
                <Text style={{ fontSize: 11 }}>Pending</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
