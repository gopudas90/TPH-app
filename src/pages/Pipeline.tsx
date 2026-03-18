// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Typography, Card, Tag, Avatar, Tooltip, Space, Input, Select, Button, theme, Badge, Radio, Table, Row, Col, InputNumber } from 'antd';
import { SearchOutlined, FilterOutlined, PlusOutlined, UserOutlined, CalendarOutlined, DollarOutlined, AppstoreOutlined, UnorderedListOutlined, FireOutlined, CloseOutlined } from '@ant-design/icons';
import { PIPELINE_STAGES, MOCK_DEALS } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

export const Pipeline: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [deals, setDeals] = useState(MOCK_DEALS);
  const [pipelineType, setPipelineType] = useState('Corporate Events');
  const [viewType, setViewType] = useState('kanban');

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwner, setFilterOwner] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterMinValue, setFilterMinValue] = useState<number | null>(null);
  const [filterMaxValue, setFilterMaxValue] = useState<number | null>(null);

  const owners = useMemo(() => Array.from(new Set(MOCK_DEALS.map(d => d.owner))), []);

  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      if (d.type !== pipelineType) return false;
      if (searchTerm && !d.name.toLowerCase().includes(searchTerm.toLowerCase()) && !d.client.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterOwner && d.owner !== filterOwner) return false;
      if (filterPriority && d.priority !== filterPriority) return false;
      if (filterMinValue && d.value < filterMinValue) return false;
      if (filterMaxValue && d.value > filterMaxValue) return false;
      return true;
    });
  }, [deals, pipelineType, searchTerm, filterOwner, filterPriority, filterMinValue, filterMaxValue]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterOwner(null);
    setFilterPriority(null);
    setFilterMinValue(null);
    setFilterMaxValue(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return 'success';
    if (prob >= 50) return 'processing';
    if (prob >= 20) return 'warning';
    return 'error';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'red';
      case 'Mid': return 'orange';
      case 'Low': return 'green';
      default: return 'default';
    }
  };

  const listColumns = [
    { title: 'Deal Name', dataIndex: 'name', key: 'name', render: (text: string, record: any) => <a onClick={() => navigate(`/deal/${record.id}`)}>{text}</a> },
    { title: 'Client', dataIndex: 'client', key: 'client' },
    { title: 'Stage', dataIndex: 'stageId', key: 'stageId', render: (val: string) => PIPELINE_STAGES.find(s => s.id === val)?.name },
    { title: 'Value', dataIndex: 'value', key: 'value', render: (val: number) => formatCurrency(val) },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (val: string) => <Tag color={getPriorityColor(val)}>{val}</Tag> },
    { title: 'Lead Score', dataIndex: 'leadScore', key: 'leadScore', render: (val: number, record: any) => <Tooltip title={record.leadScoreExplanation || "AI Lead Score"}><Space><FireOutlined style={{ color: token.colorWarning }} />{val}</Space></Tooltip> },
    { title: 'Probability', dataIndex: 'probability', key: 'probability', render: (val: number) => <Tag color={getProbabilityColor(val)}>{val}%</Tag> },
    { title: 'Owner', dataIndex: 'owner', key: 'owner' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size="large">
          <Select 
            value={pipelineType} 
            onChange={setPipelineType} 
            style={{ width: 250 }} 
            size="middle"
            options={[
              { value: 'Corporate Events', label: 'Corporate Events Pipeline' },
              { value: 'Experiential Activations', label: 'Experiential Activations Pipeline' },
              { value: 'Exhibitions & Trade Shows', label: 'Exhibitions & Trade Shows Pipeline' },
              { value: 'Roadshows & Touring', label: 'Roadshows & Touring Pipeline' },
              { value: 'Retainer / Framework Agreement', label: 'Retainer / Framework Agreement Pipeline' },
            ]}
          />
          <Input 
            placeholder="Search deals or clients..." 
            prefix={<SearchOutlined />} 
            style={{ width: 250 }} 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            allowClear
          />
          <Button 
            icon={<FilterOutlined />} 
            onClick={() => setShowFilters(!showFilters)}
            type={showFilters || filterOwner || filterPriority || filterMinValue || filterMaxValue ? 'primary' : 'default'}
          >
            Filters {(filterOwner || filterPriority || filterMinValue || filterMaxValue) ? '(Active)' : ''}
          </Button>
          <Radio.Group value={viewType} onChange={e => setViewType(e.target.value)}>
            <Radio.Button value="kanban"><AppstoreOutlined /> Kanban</Radio.Button>
            <Radio.Button value="list"><UnorderedListOutlined /> List</Radio.Button>
          </Radio.Group>
        </Space>
        <Button type="primary" icon={<PlusOutlined />}>New Deal</Button>
      </div>

      {showFilters && (
        <Card size="small" style={{ marginBottom: 24, background: token.colorFillAlter, border: `1px solid ${token.colorBorderSecondary}` }}>
          <Row gutter={16} align="middle">
            <Col>
              <Text strong style={{ marginRight: 8 }}>Owner:</Text>
              <Select 
                style={{ width: 150 }} 
                placeholder="Any Owner" 
                allowClear 
                value={filterOwner} 
                onChange={setFilterOwner}
                options={owners.map(o => ({ label: o, value: o }))}
              />
            </Col>
            <Col>
              <Text strong style={{ marginRight: 8 }}>Priority:</Text>
              <Select 
                style={{ width: 120 }} 
                placeholder="Any Priority" 
                allowClear 
                value={filterPriority} 
                onChange={setFilterPriority}
                options={[
                  { label: 'High', value: 'High' },
                  { label: 'Mid', value: 'Mid' },
                  { label: 'Low', value: 'Low' },
                ]}
              />
            </Col>
            <Col>
              <Text strong style={{ marginRight: 8 }}>Min Value:</Text>
              <InputNumber 
                style={{ width: 120 }} 
                placeholder="Min $" 
                value={filterMinValue} 
                onChange={setFilterMinValue}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
              />
            </Col>
            <Col>
              <Text strong style={{ marginRight: 8 }}>Max Value:</Text>
              <InputNumber 
                style={{ width: 120 }} 
                placeholder="Max $" 
                value={filterMaxValue} 
                onChange={setFilterMaxValue}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
              />
            </Col>
            <Col flex="auto" style={{ textAlign: 'right' }}>
              <Button type="link" onClick={clearFilters} icon={<CloseOutlined />}>Clear All Filters</Button>
            </Col>
          </Row>
        </Card>
      )}

      {viewType === 'kanban' ? (
        <div style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          flex: 1, 
          gap: 16, 
          paddingBottom: 16,
          alignItems: 'flex-start'
        }}>
          {PIPELINE_STAGES.map(stage => {
            const stageDeals = filteredDeals.filter(d => d.stageId === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div key={stage.id} style={{ 
                minWidth: 300, 
                width: 300, 
                background: token.colorFillAlter, 
                borderRadius: token.borderRadiusLG,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%'
              }}>
                <div style={{ marginBottom: 12, padding: '0 4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 13 }}>{stage.name}</Text>
                    <Badge count={stageDeals.length} style={{ backgroundColor: token.colorFillSecondary, color: token.colorText }} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{formatCurrency(stageTotal)}</Text>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
                  {stageDeals.map(deal => (
                    <Card 
                      key={deal.id} 
                      size="small" 
                      hoverable 
                      onClick={() => navigate(`/deal/${deal.id}`)}
                      style={{ cursor: 'pointer', border: `1px solid ${token.colorBorderSecondary}` }}
                      styles={{ body: { padding: 12 } }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 13 }} ellipsis={{ tooltip: deal.name }}>{deal.name}</Text>
                        <Tag color={getPriorityColor(deal.priority)} style={{ margin: 0, fontSize: 11 }}>{deal.priority}</Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{deal.client}</Text>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <DollarOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
                          <Text style={{ fontSize: 13, fontWeight: 500 }}>{formatCurrency(deal.value)}</Text>
                        </div>
                        <Tooltip title={deal.leadScoreExplanation || "AI Lead Score"}>
                          <Space size={4}>
                            <FireOutlined style={{ color: token.colorWarning, fontSize: 12 }} />
                            <Text style={{ fontSize: 12, fontWeight: 500 }}>{deal.leadScore}</Text>
                          </Space>
                        </Tooltip>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <Space size="small">
                          <CalendarOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>{new Date(deal.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</Text>
                        </Space>
                        <Space size="small">
                          <Badge status={getProbabilityColor(deal.probability)} text={<span style={{fontSize: 12}}>{deal.probability}%</span>} />
                          <Tooltip title={deal.owner}>
                            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary, fontSize: 12 }} />
                          </Tooltip>
                        </Space>
                      </div>
                    </Card>
                  ))}
                  {stageDeals.length === 0 && (
                    <div style={{ padding: 24, textAlign: 'center', border: `1px dashed ${token.colorBorder}`, borderRadius: token.borderRadius }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>No deals in this stage</Text>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <Table 
            columns={listColumns} 
            dataSource={filteredDeals} 
            rowKey="id" 
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};
