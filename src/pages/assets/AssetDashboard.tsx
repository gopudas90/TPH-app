// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Typography, Row, Col, Card, Statistic, Tag, theme, Progress, Table, Alert, Empty, Segmented } from 'antd';
import { InboxOutlined, DollarOutlined, BarChartOutlined, ToolOutlined, WarningOutlined, CalendarOutlined, CheckCircleOutlined, SwapOutlined, RobotOutlined, ShoppingCartOutlined, BulbOutlined } from '@ant-design/icons';
import { MOCK_ASSETS, MOCK_CONSUMABLES, MOCK_ASSET_BOOKINGS } from '../../data/mockData';
import { formatCurrency } from '../../utils';
import { detectConflicts } from '../../utils/assetUtils';

const { Title, Text } = Typography;

export const AssetDashboard: React.FC = () => {
  const { token } = theme.useToken();
  const [forecastPeriod, setForecastPeriod] = useState<number>(30);

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
    checkedOutBookings,
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

      {/* AI Demand Forecast */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span><RobotOutlined style={{ color: token.colorPrimary, marginRight: 8 }} />AI Demand Forecast</span>
                <Segmented
                  options={[
                    { label: '30 Days', value: 30 },
                    { label: '60 Days', value: 60 },
                    { label: '90 Days', value: 90 },
                  ]}
                  value={forecastPeriod}
                  onChange={(val) => setForecastPeriod(val as number)}
                  size="small"
                />
              </div>
            }
          >
            {(() => {
              const now = new Date();
              const cutoff = new Date(now.getTime() + forecastPeriod * 24 * 60 * 60 * 1000);

              const categories = ['Staging', 'AV Equipment', 'Lighting', 'Rigging', 'Furniture', 'Props'];

              const forecastData = categories.map(cat => {
                const assetsInCat = MOCK_ASSETS.filter(a => a.category === cat);
                const inventory = assetsInCat.length;

                // Count bookings in this category that fall within the forecast window
                const assetIds = assetsInCat.map(a => a.id);
                const demand = MOCK_ASSET_BOOKINGS.filter(b => {
                  if (!assetIds.includes(b.assetId)) return false;
                  const start = new Date(b.startDate);
                  const end = new Date(b.endDate);
                  return start <= cutoff && end >= now && b.status !== 'returned';
                }).length;

                const gap = demand - inventory;

                return {
                  key: cat,
                  category: cat,
                  inventory,
                  demand,
                  gap,
                };
              });

              const forecastColumns = [
                {
                  title: 'Category',
                  dataIndex: 'category',
                  key: 'category',
                  render: (val: string) => <Tag color={categoryColorMap[val]}>{val}</Tag>,
                },
                {
                  title: 'Current Inventory',
                  dataIndex: 'inventory',
                  key: 'inventory',
                  render: (val: number) => <Text strong>{val}</Text>,
                },
                {
                  title: 'Forecasted Demand',
                  dataIndex: 'demand',
                  key: 'demand',
                  render: (val: number) => <Text strong style={{ color: token.colorPrimary }}>{val}</Text>,
                },
                {
                  title: 'Gap',
                  dataIndex: 'gap',
                  key: 'gap',
                  render: (val: number) => (
                    <Tag color={val > 0 ? 'error' : 'success'}>
                      {val > 0 ? 'Shortage' : 'Sufficient'} ({val > 0 ? '+' : ''}{val})
                    </Tag>
                  ),
                },
                {
                  title: 'Action',
                  key: 'action',
                  render: (_: any, record: any) =>
                    record.gap > 0 ? (
                      <Text type="danger" style={{ fontSize: 12 }}>
                        <ShoppingCartOutlined style={{ marginRight: 4 }} />
                        {record.gap >= 2 ? 'Consider advance purchase' : 'Arrange temporary hire'}
                      </Text>
                    ) : (
                      <Text type="secondary" style={{ fontSize: 12 }}>No action needed</Text>
                    ),
                },
              ];

              // AI Recommendations that change with period
              const recommendations: Record<number, Array<{ title: string; detail: string; color: string }>> = {
                30: [
                  {
                    title: 'LED Wall panels in high demand',
                    detail: 'ROE CB5 LED Wall has 2 confirmed projects in the next 30 days but only 1 wall available. Overlap detected between Singapore Fintech Festival and Esports Tournament Finals. Consider hiring from BrightLights Staging Co.',
                    color: token.colorError,
                  },
                  {
                    title: 'Lighting console double-booked',
                    detail: 'GrandMA3 Light Console is allocated to both Singapore Fintech Festival and Tech Summit 2026 with overlapping dates. Arrange backup console rental from SoundWave Audio immediately.',
                    color: token.colorError,
                  },
                  {
                    title: 'Chain hoists needed for Esports event',
                    detail: 'CM Lodestar Chain Hoists are confirmed for Esports Tournament Finals (Mar 18–23). Ensure timely return from current project to meet deployment.',
                    color: token.colorWarning,
                  },
                ],
                60: [
                  {
                    title: 'Staging demand spike in April',
                    detail: 'Spring Fashion Show (Apr 1–6) requires Staging Decks and Truss Sets. Both are currently checked out for Tech Summit. Ensure smooth handover with at least 3-day buffer for inspection.',
                    color: token.colorWarning,
                  },
                  {
                    title: 'LED Wall panels — sustained high demand',
                    detail: 'ROE CB5 LED Wall has 2 confirmed bookings within 60 days. At 91% utilisation, consider procuring a second LED wall set or establishing a standing hire agreement with BrightLights Staging Co.',
                    color: token.colorError,
                  },
                  {
                    title: 'Furniture availability is comfortable',
                    detail: 'Banquet tables have no upcoming bookings in the 60-day window. Use this downtime to refinish the 3 scratched tables flagged in the last inspection.',
                    color: token.colorSuccess,
                  },
                ],
                90: [
                  {
                    title: 'Lighting fixtures demand spike expected in April–May',
                    detail: 'Martin MAC Aura XB and GrandMA3 Console have a combined 4 events scheduled over the next 90 days. Pre-book backup units from SoundWave Audio for the April window.',
                    color: token.colorError,
                  },
                  {
                    title: 'AV Equipment utilisation trending at capacity',
                    detail: 'LED Wall (91%), Line Array (74%), and Digital Mixer (71%) are all heavily booked. Plan capital expenditure for Q3 to expand AV fleet — estimated ROI positive within 8 months.',
                    color: token.colorWarning,
                  },
                  {
                    title: 'Props and Furniture remain under-utilised',
                    detail: 'Floral Arch Frame (42%) and Banquet Tables (56%) show low utilisation over 90 days. Consider listing on industry rental marketplace to generate off-peak revenue.',
                    color: token.colorSuccess,
                  },
                ],
              };

              return (
                <>
                  <Table
                    columns={forecastColumns}
                    dataSource={forecastData}
                    pagination={false}
                    size="small"
                    style={{ marginBottom: 20 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(recommendations[forecastPeriod] || []).map((rec, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 8,
                          border: `1px solid ${token.colorBorderSecondary}`,
                          borderLeft: `4px solid ${rec.color}`,
                          background: token.colorBgContainer,
                        }}
                      >
                        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                          <BulbOutlined style={{ color: rec.color, marginRight: 6 }} />
                          {rec.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>
                          {rec.detail}
                        </Text>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </Card>
        </Col>
      </Row>

      {/* AI Maintenance Recommendations */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title={<span><BulbOutlined style={{ color: token.colorPrimary, marginRight: 8 }} />AI Maintenance Recommendations</span>}>
            {(() => {
              const now = new Date();

              const scoredAssets = MOCK_ASSETS.filter(a => a.condition !== 'Retired').map(asset => {
                // Days since last maintenance
                const lastMaint = asset.lastMaintenanceDate ? new Date(asset.lastMaintenanceDate) : null;
                const daysSinceMaint = lastMaint
                  ? Math.floor((now.getTime() - lastMaint.getTime()) / (1000 * 60 * 60 * 24))
                  : 365;

                // Upcoming bookings in next 30 days
                const cutoff30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                const upcomingBookings = MOCK_ASSET_BOOKINGS.filter(b => {
                  if (b.assetId !== asset.id) return false;
                  const start = new Date(b.startDate);
                  return start >= now && start <= cutoff30 && b.status !== 'returned';
                });

                // Urgency score: higher = more urgent
                let score = 0;
                score += Math.min(daysSinceMaint / 2, 100); // Up to 100 pts for overdue maintenance
                score += asset.utilisationRate * 0.5;        // Up to 50 pts for high utilisation
                score += upcomingBookings.length * 25;        // 25 pts per upcoming booking
                if (asset.condition === 'Requires Maintenance') score += 80;
                if (asset.condition === 'Fair') score += 30;

                // Determine urgency level
                let urgency: string;
                let urgencyColor: string;
                if (score >= 150) { urgency = 'Critical'; urgencyColor = 'error'; }
                else if (score >= 100) { urgency = 'High'; urgencyColor = 'warning'; }
                else { urgency = 'Medium'; urgencyColor = 'default'; }

                // Find next free window (first gap of 5+ days with no bookings in next 60 days)
                const bookingsForAsset = MOCK_ASSET_BOOKINGS
                  .filter(b => b.assetId === asset.id && new Date(b.endDate) >= now && b.status !== 'returned')
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

                let windowStart = new Date(now);
                let windowEnd = new Date(now);
                windowEnd.setDate(windowEnd.getDate() + 4);
                let foundWindow = true;

                for (const bk of bookingsForAsset) {
                  const bkStart = new Date(bk.startDate);
                  const bkEnd = new Date(bk.endDate);
                  if (windowStart < bkEnd && windowEnd > bkStart) {
                    // Overlaps — push window past this booking
                    windowStart = new Date(bkEnd);
                    windowStart.setDate(windowStart.getDate() + 1);
                    windowEnd = new Date(windowStart);
                    windowEnd.setDate(windowEnd.getDate() + 4);
                  }
                }

                const fmtDate = (d: Date) => d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
                const suggestedWindow = `${fmtDate(windowStart)}–${fmtDate(windowEnd)} (no bookings)`;

                // AI reasoning
                const bookingNote = upcomingBookings.length > 0
                  ? `${upcomingBookings.length} upcoming deployment${upcomingBookings.length > 1 ? 's' : ''} in next 14 days`
                  : 'No immediate deployments';
                const projectNote = upcomingBookings.length > 0
                  ? `. Service before ${upcomingBookings[0].projectName} to avoid mid-project failure.`
                  : '.';
                const reasoning = `Last serviced ${daysSinceMaint} days ago. ${asset.utilisationRate}% utilisation with ${bookingNote}${projectNote}`;

                return {
                  ...asset,
                  score,
                  urgency,
                  urgencyColor,
                  daysSinceMaint,
                  upcomingBookingCount: upcomingBookings.length,
                  reasoning,
                  suggestedWindow,
                };
              });

              const top5 = scoredAssets.sort((a, b) => b.score - a.score).slice(0, 5);

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {top5.map((asset) => (
                    <div
                      key={asset.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        background: token.colorBgContainer,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Text strong style={{ fontSize: 13 }}>{asset.name}</Text>
                        <Tag color={categoryColorMap[asset.category]}>{asset.category}</Tag>
                        <Tag color={asset.urgencyColor}>{asset.urgency}</Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6, lineHeight: 1.5 }}>
                        <RobotOutlined style={{ marginRight: 4 }} />
                        {asset.reasoning}
                      </Text>
                      <Tag icon={<CalendarOutlined />} style={{ fontSize: 11 }}>
                        Best window: {asset.suggestedWindow}
                      </Tag>
                    </div>
                  ))}
                </div>
              );
            })()}
          </Card>
        </Col>
      </Row>

    </div>
  );
};
