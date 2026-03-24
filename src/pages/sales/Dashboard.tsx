// @ts-nocheck
import React, { useMemo } from 'react';
import { Typography, Row, Col, Card, Statistic, Table, Tag, theme, Space, Tooltip, Progress, Badge, Avatar } from 'antd';
import {
  DollarOutlined, ProjectOutlined, CheckCircleOutlined, FunnelPlotOutlined,
  ClockCircleOutlined, SwapOutlined, RightOutlined, WarningOutlined,
  FireOutlined, ExclamationCircleOutlined, UserOutlined, CalendarOutlined,
  ThunderboltOutlined, PauseCircleOutlined,
} from '@ant-design/icons';
import { MOCK_DEALS, PIPELINE_STAGES, MOCK_CUSTOMERS } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const PIPELINE_TYPES = ['Corporate Events', 'Experiential Activations', 'Exhibitions & Trade Shows', 'Roadshows & Touring'];
const ACTIVE_STAGES = PIPELINE_STAGES.filter(s => s.id !== '9');

// Mock avg days in stage
const AVG_DAYS_IN_STAGE: Record<string, number> = { '1': 3, '2': 5, '3': 8, '4': 10, '5': 4, '6': 7, '7': 3, '8': 0, '9': 0 };

// Mock days since last activity per deal
const DEAL_LAST_ACTIVITY_DAYS: Record<string, number> = {
  'D-1001': 2, 'D-1002': 14, 'D-1003': 1, 'D-1004': 21, 'D-1005': 0, 'D-1006': 18,
  'D-1007': 3, 'D-1008': 16, 'D-1009': 25, 'D-1010': 5, 'D-1011': 4, 'D-1012': 7,
  'D-1013': 2, 'D-1014': 1, 'D-1015': 3, 'D-1016': 1, 'D-1017': 2, 'D-1018': 30, 'D-1019': 22, 'D-1020': 6,
};

// Mock days in current stage per deal
const DEAL_DAYS_IN_STAGE: Record<string, number> = {
  'D-1001': 8, 'D-1002': 12, 'D-1003': 5, 'D-1004': 6, 'D-1005': 0, 'D-1006': 9,
  'D-1007': 14, 'D-1008': 11, 'D-1009': 18, 'D-1010': 6, 'D-1011': 10, 'D-1012': 7,
  'D-1013': 3, 'D-1014': 2, 'D-1015': 9, 'D-1016': 4, 'D-1017': 3, 'D-1018': 5, 'D-1019': 4, 'D-1020': 12,
};

// Map deal clients to industries via MOCK_CUSTOMERS, fallback
const CLIENT_INDUSTRY: Record<string, string> = {};
MOCK_CUSTOMERS.forEach(c => { CLIENT_INDUSTRY[c.name] = c.industry; });

export const Dashboard: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const fmt = (value: number) => new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  const fmtK = (value: number) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${Math.round(value / 1000)}K` : value.toString();

  // ── KPI metrics ──
  const kpi = useMemo(() => {
    const active = MOCK_DEALS.filter(d => d.stageId !== '8' && d.stageId !== '9');
    const won = MOCK_DEALS.filter(d => d.stageId === '8');
    const lost = MOCK_DEALS.filter(d => d.stageId === '9');
    const closed = won.length + lost.length;
    const pv = active.reduce((s, d) => s + d.value, 0);
    return {
      pipelineValue: pv,
      activeCount: active.length,
      winRate: closed > 0 ? Math.round((won.length / closed) * 100) : 0,
      avgDealSize: active.length > 0 ? Math.round(pv / active.length) : 0,
    };
  }, []);

  // ── Pipeline mini-funnels (horizontal) ──
  const funnels = useMemo(() => {
    return PIPELINE_TYPES.map(pType => {
      const typeDeals = MOCK_DEALS.filter(d => d.type === pType);
      const total = typeDeals.length;
      const totalVal = typeDeals.reduce((s, d) => s + d.value, 0);
      const won = typeDeals.filter(d => d.stageId === '8').length;
      const stages = ACTIVE_STAGES.map(stage => {
        const atOrPast = typeDeals.filter(d => parseInt(d.stageId) >= parseInt(stage.id)).length;
        return { id: stage.id, name: stage.name, count: atOrPast };
      });
      return { type: pType, total, totalVal, won, winRate: total > 0 ? Math.round((won / total) * 100) : 0, stages };
    }).filter(f => f.total > 0);
  }, []);

  // ── Revenue forecasts ──
  const revenue = useMemo(() => {
    const active = MOCK_DEALS.filter(d => d.stageId !== '8' && d.stageId !== '9');
    const now = new Date('2026-03-24');

    const inWindow = (days: number) => active.filter(d => {
      const diff = (new Date(d.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= days;
    });

    const weighted = (deals: any[]) => deals.reduce((s, d) => s + d.value * (d.probability / 100), 0);

    const next30 = inWindow(30);
    const next60 = inWindow(60);
    const next90 = inWindow(90);

    // By event type
    const byType: Record<string, number> = {};
    active.forEach(d => { byType[d.type] = (byType[d.type] || 0) + d.value; });
    const byTypeArr = Object.entries(byType).map(([type, val]) => ({ type, value: val })).sort((a, b) => b.value - a.value).slice(0, 10);

    // By industry
    const byIndustry: Record<string, number> = {};
    active.forEach(d => {
      const ind = CLIENT_INDUSTRY[d.client] || 'Other';
      byIndustry[ind] = (byIndustry[ind] || 0) + d.value;
    });
    const byIndustryArr = Object.entries(byIndustry).map(([ind, val]) => ({ industry: ind, value: val })).sort((a, b) => b.value - a.value).slice(0, 10);

    // Top clients
    const byClient: Record<string, number> = {};
    active.forEach(d => { byClient[d.client] = (byClient[d.client] || 0) + d.value; });
    const topClients = Object.entries(byClient).map(([client, val]) => ({ client, value: val })).sort((a, b) => b.value - a.value).slice(0, 10);

    // Committed vs pipeline
    const committed = MOCK_DEALS.filter(d => d.stageId === '8').reduce((s, d) => s + d.value, 0);
    const pipeline = active.reduce((s, d) => s + d.value, 0);
    const weightedPipeline = weighted(active);

    return {
      next30: { count: next30.length, weighted: weighted(next30), total: next30.reduce((s, d) => s + d.value, 0) },
      next60: { count: next60.length, weighted: weighted(next60), total: next60.reduce((s, d) => s + d.value, 0) },
      next90: { count: next90.length, weighted: weighted(next90), total: next90.reduce((s, d) => s + d.value, 0) },
      byType: byTypeArr,
      byIndustry: byIndustryArr,
      topClients,
      committed,
      pipeline,
      weightedPipeline,
    };
  }, []);

  // ── Deals requiring attention ──
  const attention = useMemo(() => {
    const active = MOCK_DEALS.filter(d => d.stageId !== '8' && d.stageId !== '9');

    // At risk: no activity > 10 days
    const atRisk = active
      .filter(d => (DEAL_LAST_ACTIVITY_DAYS[d.id] || 0) > 10)
      .sort((a, b) => (DEAL_LAST_ACTIVITY_DAYS[b.id] || 0) - (DEAL_LAST_ACTIVITY_DAYS[a.id] || 0))
      .slice(0, 10);

    // High-value nearing close (stage >= 6 and value > 100k)
    const nearingClose = active
      .filter(d => parseInt(d.stageId) >= 6 && d.value >= 100000)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Stuck in stage > avg time for that stage
    const stuck = active
      .filter(d => {
        const avg = AVG_DAYS_IN_STAGE[d.stageId] || 5;
        const days = DEAL_DAYS_IN_STAGE[d.id] || 0;
        return days > avg;
      })
      .map(d => ({ ...d, daysInStage: DEAL_DAYS_IN_STAGE[d.id] || 0, avgDays: AVG_DAYS_IN_STAGE[d.stageId] || 5 }))
      .sort((a, b) => (b.daysInStage - b.avgDays) - (a.daysInStage - a.avgDays))
      .slice(0, 10);

    return { atRisk, nearingClose, stuck };
  }, []);

  const stageName = (id: string) => PIPELINE_STAGES.find(s => s.id === id)?.name || '';

  const getPriorityColor = (p: string) => p === 'High' ? 'red' : p === 'Mid' ? 'orange' : 'green';

  // ── Max values for horizontal bars ──
  const maxByType = Math.max(...revenue.byType.map(r => r.value), 1);
  const maxByIndustry = Math.max(...revenue.byIndustry.map(r => r.value), 1);
  const maxTopClient = Math.max(...revenue.topClients.map(r => r.value), 1);
  const totalRevCap = revenue.committed + revenue.pipeline;

  // Helper: render a deal row for attention cards
  const renderDealRow = (deal: any, bg: string, border: string, badge: React.ReactNode) => (
    <div
      key={deal.id}
      onClick={() => navigate(`/deal/${deal.id}`)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 6, cursor: 'pointer', background: bg, border: `1px solid ${border}` }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <Text strong style={{ fontSize: 12, display: 'block' }} ellipsis={{ tooltip: deal.name }}>{deal.name}</Text>
        <Text type="secondary" style={{ fontSize: 11 }}>{deal.client} &middot; {fmt(deal.value)}</Text>
      </div>
      {badge}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Sales Dashboard</Title>
        <Text type="secondary">Welcome back. Here's your pipeline at a glance.</Text>
      </div>

      {/* KPI Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '16px 20px' } }}>
            <Statistic title="Active Pipeline" value={kpi.pipelineValue} precision={0} styles={{ content: { color: token.colorPrimary, fontSize: 22 } }} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '16px 20px' } }}>
            <Statistic title="Active Deals" value={kpi.activeCount} styles={{ content: { fontSize: 22 } }} prefix={<ProjectOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '16px 20px' } }}>
            <Statistic title="Win Rate" value={kpi.winRate} suffix="%" styles={{ content: { color: token.colorSuccess, fontSize: 22 } }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '16px 20px' } }}>
            <Statistic title="Avg Deal Size" value={kpi.avgDealSize} precision={0} styles={{ content: { fontSize: 22 } }} prefix={<DollarOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* ── Pipeline Funnels (flex-fill, true funnel shape) ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text strong style={{ fontSize: 14 }}>Pipeline Funnels</Text>
          <a onClick={() => navigate('/pipeline')} style={{ fontSize: 12 }}>View Pipelines <RightOutlined style={{ fontSize: 9 }} /></a>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {funnels.map(f => {
            const maxCount = Math.max(...f.stages.map(s => s.count), 1);
            const stageCount = f.stages.length;
            return (
              <Card key={f.type} size="small" style={{ flex: 1, minWidth: 0 }} styles={{ body: { padding: '14px 16px' } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 13 }}>{f.type}</Text>
                  <Tag color={f.winRate >= 50 ? 'success' : f.winRate >= 20 ? 'warning' : 'default'} style={{ margin: 0, fontSize: 11 }}>{f.winRate}% won</Tag>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>{f.total} deals</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>&middot;</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{fmt(f.totalVal)}</Text>
                </div>
                {/* Funnel — centered tapered bars */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {f.stages.map((stage, idx) => {
                    const widthPct = Math.max((stage.count / maxCount) * 100, 18);
                    const isWon = stage.id === '8';
                    // Gradient from blue at top to green at bottom (won)
                    const lightness = 48 + idx * 5;
                    const saturation = 70 - idx * 3;
                    const bgColor = isWon ? token.colorSuccess : `hsl(${215}, ${saturation}%, ${lightness}%)`;
                    return (
                      <Tooltip key={stage.id} title={`${stage.name}: ${stage.count} deals at/past this stage`}>
                        <div style={{
                          width: `${widthPct}%`,
                          height: 22,
                          background: bgColor,
                          borderRadius: idx === 0 ? '4px 4px 2px 2px' : idx === stageCount - 1 ? '2px 2px 4px 4px' : 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          minWidth: 40,
                          cursor: 'default',
                          transition: 'width 0.3s',
                        }}>
                          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>{stage.count}</Text>
                          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stage.name}</Text>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Revenue Insights (equal height) ── */}
      <div style={{ marginBottom: 20 }}>
        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 10 }}>Revenue Insights</Text>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          {/* Expected Revenue 30/60/90 */}
          <Card size="small" style={{ flex: 1, minWidth: 0 }} styles={{ body: { padding: '14px 16px' } }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 10 }}>Expected Revenue (Weighted)</Text>
            {[
              { label: '30 days', data: revenue.next30 },
              { label: '60 days', data: revenue.next60 },
              { label: '90 days', data: revenue.next90 },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text style={{ fontSize: 12 }}>{item.label}</Text>
                  <Text strong style={{ fontSize: 13 }}>{fmt(Math.round(item.data.weighted))}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 10 }}>{item.data.count} deals &middot; {fmt(item.data.total)} total</Text>
              </div>
            ))}
          </Card>

          {/* Revenue by Event Type */}
          <Card size="small" style={{ flex: 1, minWidth: 0 }} styles={{ body: { padding: '14px 16px', display: 'flex', flexDirection: 'column' } }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 10, flexShrink: 0 }}>By Event Type</Text>
            <div style={{ overflowY: 'auto', maxHeight: 200, flex: 1 }}>
              {revenue.byType.map(r => (
                <div key={r.type} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: 11 }} ellipsis={{ tooltip: r.type }}>{r.type}</Text>
                    <Text strong style={{ fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{fmtK(r.value)}</Text>
                  </div>
                  <div style={{ height: 4, background: token.colorFillSecondary, borderRadius: 2 }}>
                    <div style={{ height: 4, width: `${(r.value / maxByType) * 100}%`, background: token.colorPrimary, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Revenue by Industry */}
          <Card size="small" style={{ flex: 1, minWidth: 0 }} styles={{ body: { padding: '14px 16px', display: 'flex', flexDirection: 'column' } }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 10, flexShrink: 0 }}>By Industry</Text>
            <div style={{ overflowY: 'auto', maxHeight: 200, flex: 1 }}>
              {revenue.byIndustry.map(r => (
                <div key={r.industry} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: 11 }}>{r.industry}</Text>
                    <Text strong style={{ fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{fmtK(r.value)}</Text>
                  </div>
                  <div style={{ height: 4, background: token.colorFillSecondary, borderRadius: 2 }}>
                    <div style={{ height: 4, width: `${(r.value / maxByIndustry) * 100}%`, background: token.colorInfoActive, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Clients */}
          <Card size="small" style={{ flex: 1, minWidth: 0 }} styles={{ body: { padding: '14px 16px', display: 'flex', flexDirection: 'column' } }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 10, flexShrink: 0 }}>Top Clients by Pipeline</Text>
            <div style={{ overflowY: 'auto', maxHeight: 200, flex: 1 }}>
              {revenue.topClients.map((r, idx) => (
                <div key={r.client} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', fontSize: 10, fontWeight: 600,
                    background: idx === 0 ? token.colorPrimary : token.colorFillSecondary,
                    color: idx === 0 ? '#fff' : token.colorText,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{idx + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 11, display: 'block' }} ellipsis={{ tooltip: r.client }}>{r.client}</Text>
                  </div>
                  <Text strong style={{ fontSize: 11, flexShrink: 0 }}>{fmtK(r.value)}</Text>
                </div>
              ))}
            </div>
          </Card>

          {/* Committed vs Pipeline */}
          <Card size="small" style={{ flex: 1, minWidth: 0 }} styles={{ body: { padding: '14px 16px' } }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 10 }}>Committed vs Pipeline</Text>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <Space size={4}><div style={{ width: 8, height: 8, borderRadius: 2, background: token.colorSuccess }} /><Text style={{ fontSize: 11 }}>Committed</Text></Space>
                <Text strong style={{ fontSize: 11 }}>{fmt(revenue.committed)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <Space size={4}><div style={{ width: 8, height: 8, borderRadius: 2, background: token.colorPrimary }} /><Text style={{ fontSize: 11 }}>Pipeline</Text></Space>
                <Text strong style={{ fontSize: 11 }}>{fmt(revenue.pipeline)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Space size={4}><div style={{ width: 8, height: 8, borderRadius: 2, background: token.colorWarning }} /><Text style={{ fontSize: 11 }}>Weighted</Text></Space>
                <Text strong style={{ fontSize: 11 }}>{fmt(Math.round(revenue.weightedPipeline))}</Text>
              </div>
            </div>
            <div style={{ height: 16, borderRadius: 4, overflow: 'hidden', display: 'flex', background: token.colorFillSecondary }}>
              {totalRevCap > 0 && (
                <>
                  <Tooltip title={`Committed: ${fmt(revenue.committed)}`}>
                    <div style={{ width: `${(revenue.committed / totalRevCap) * 100}%`, background: token.colorSuccess, height: '100%' }} />
                  </Tooltip>
                  <Tooltip title={`Pipeline: ${fmt(revenue.pipeline)}`}>
                    <div style={{ width: `${(revenue.pipeline / totalRevCap) * 100}%`, background: token.colorPrimary, height: '100%' }} />
                  </Tooltip>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Deals Requiring Attention (equal height) ── */}
      <div style={{ marginBottom: 20 }}>
        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 10 }}>Deals Requiring Attention</Text>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          <Card
            size="small"
            style={{ flex: 1, minWidth: 0 }}
            title={<Space size={6}><ExclamationCircleOutlined style={{ color: token.colorError }} /><Text strong style={{ fontSize: 13 }}>At Risk</Text><Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>No activity &gt;10d</Text></Space>}
            styles={{ body: { padding: '8px 16px' }, header: { padding: '8px 16px', minHeight: 'auto' } }}
          >
            {attention.atRisk.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>No deals at risk</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto' }}>
                {attention.atRisk.map(deal => renderDealRow(deal, token.colorErrorBg, token.colorErrorBorder,
                  <Tag color="error" style={{ margin: 0, fontSize: 10 }}>{DEAL_LAST_ACTIVITY_DAYS[deal.id]}d idle</Tag>
                ))}
              </div>
            )}
          </Card>

          <Card
            size="small"
            style={{ flex: 1, minWidth: 0 }}
            title={<Space size={6}><ThunderboltOutlined style={{ color: token.colorWarning }} /><Text strong style={{ fontSize: 13 }}>Nearing Close</Text><Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>High-value, stage 6+</Text></Space>}
            styles={{ body: { padding: '8px 16px' }, header: { padding: '8px 16px', minHeight: 'auto' } }}
          >
            {attention.nearingClose.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>No high-value deals nearing close</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto' }}>
                {attention.nearingClose.map(deal => renderDealRow(deal, token.colorWarningBg, token.colorWarningBorder,
                  <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>{stageName(deal.stageId)}</Tag>
                ))}
              </div>
            )}
          </Card>

          <Card
            size="small"
            style={{ flex: 1, minWidth: 0 }}
            title={<Space size={6}><PauseCircleOutlined style={{ color: token.colorTextSecondary }} /><Text strong style={{ fontSize: 13 }}>Stuck in Stage</Text><Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>Exceeds avg time</Text></Space>}
            styles={{ body: { padding: '8px 16px' }, header: { padding: '8px 16px', minHeight: 'auto' } }}
          >
            {attention.stuck.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>No stuck deals</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto' }}>
                {attention.stuck.map(deal => renderDealRow(deal, token.colorFillAlter, token.colorBorderSecondary,
                  <Tag color={deal.daysInStage > deal.avgDays * 2 ? 'error' : 'warning'} style={{ margin: 0, fontSize: 10 }}>{deal.daysInStage}d / {deal.avgDays}d avg</Tag>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Recent Deals + Tasks ── */}
      <Row gutter={[12, 12]}>
        <Col span={16}>
          <Card size="small" title={<Text strong style={{ fontSize: 13 }}>Recent Deals</Text>} extra={<a onClick={() => navigate('/pipeline')} style={{ fontSize: 12 }}>View All</a>}>
            <Table
              columns={[
                { title: 'Deal', dataIndex: 'name', key: 'name', render: (t: string, r: any) => <a onClick={() => navigate(`/deal/${r.id}`)} style={{ fontSize: 12 }}>{t}</a> },
                { title: 'Client', dataIndex: 'client', key: 'client', render: (t: string) => <Text style={{ fontSize: 12 }}>{t}</Text> },
                { title: 'Value', dataIndex: 'value', key: 'value', render: (v: number) => <Text style={{ fontSize: 12 }}>{fmt(v)}</Text> },
                { title: 'Stage', dataIndex: 'stageId', key: 'stageId', render: (v: string) => <Tag style={{ fontSize: 11 }}>{stageName(v)}</Tag> },
                { title: 'Prob', dataIndex: 'probability', key: 'probability', render: (v: number) => <Tag color={v >= 80 ? 'success' : v >= 50 ? 'processing' : 'error'} style={{ fontSize: 11 }}>{v}%</Tag> },
              ]}
              dataSource={[...MOCK_DEALS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ y: 340 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title={<Text strong style={{ fontSize: 13 }}>Upcoming Tasks</Text>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { color: token.colorError, task: 'Send revised quote to Acme Corp', due: 'Due Today', deal: 'Tech Summit 2026' },
                { color: token.colorWarning, task: 'Follow up on AV partner pricing', due: 'Due Tomorrow', deal: 'Product Launch Gala' },
                { color: token.colorSuccess, task: 'Prepare contract for signature', due: 'Due Friday', deal: 'Summer Roadshow' },
              ].map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: 12 }}>{t.task}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{t.due} &middot; {t.deal}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
