// @ts-nocheck
import React, { useState, useMemo, useRef } from 'react';
import { Typography, Card, Tag, Avatar, Tooltip, Space, Input, Select, Button, theme, Badge, Radio, Table, Row, Col, InputNumber, Modal, Checkbox, Divider, Alert } from 'antd';
import { SearchOutlined, FilterOutlined, PlusOutlined, UserOutlined, CalendarOutlined, DollarOutlined, AppstoreOutlined, UnorderedListOutlined, FireOutlined, CloseOutlined, CheckCircleOutlined, ExclamationCircleOutlined, HolderOutlined } from '@ant-design/icons';
import { MOCK_DEALS } from '../../data/mockData';
import { defaultPipelines } from '../../data/pipelineData';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

export const Pipeline: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [deals, setDeals] = useState(MOCK_DEALS);
  const [pipelineType, setPipelineType] = useState('Corporate Events');
  const [viewType, setViewType] = useState('kanban');

  // Derive stages from pipeline config
  const currentPipeline = defaultPipelines.find(p => p.typeKey === pipelineType);
  const PIPELINE_STAGES = currentPipeline?.stages || [];

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwner, setFilterOwner] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterMinValue, setFilterMinValue] = useState<number | null>(null);
  const [filterMaxValue, setFilterMaxValue] = useState<number | null>(null);

  // Drag-and-drop state
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  // Checklist modal state
  const [checklistModal, setChecklistModal] = useState<{
    visible: boolean;
    dealId: string | null;
    fromStageId: string | null;
    toStageId: string | null;
    checked: Record<number, boolean>;
  }>({ visible: false, dealId: null, fromStageId: null, toStageId: null, checked: {} });

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

  // --- Drag-and-drop handlers ---
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = 'move';
    // Make the drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedDealId(null);
    setDragOverStageId(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStageId(stageId);
  };

  const handleDragLeave = (e: React.DragEvent, stageId: string) => {
    // Only clear if we're actually leaving the column, not entering a child
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setDragOverStageId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, toStageId: string) => {
    e.preventDefault();
    setDragOverStageId(null);
    if (!draggedDealId) return;

    const deal = deals.find(d => d.id === draggedDealId);
    if (!deal || deal.stageId === toStageId) {
      setDraggedDealId(null);
      return;
    }

    // If target stage has a checklist, show the modal
    const targetStage = PIPELINE_STAGES.find(s => s.id === toStageId);
    const checklist = targetStage?.checklist || [];
    if (checklist.length > 0) {
      setChecklistModal({
        visible: true,
        dealId: draggedDealId,
        fromStageId: deal.stageId,
        toStageId,
        checked: {},
      });
    } else {
      // Stage 1 (Inquiry Received) has no checklist — just move directly
      moveDeal(draggedDealId, toStageId);
    }
    setDraggedDealId(null);
  };

  const moveDeal = (dealId: string, toStageId: string) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stageId: toStageId } : d));
  };

  const handleChecklistToggle = (index: number) => {
    setChecklistModal(prev => ({
      ...prev,
      checked: { ...prev.checked, [index]: !prev.checked[index] },
    }));
  };

  const handleChecklistConfirm = () => {
    if (checklistModal.dealId && checklistModal.toStageId) {
      moveDeal(checklistModal.dealId, checklistModal.toStageId);
    }
    setChecklistModal({ visible: false, dealId: null, fromStageId: null, toStageId: null, checked: {} });
  };

  const handleChecklistCancel = () => {
    setChecklistModal({ visible: false, dealId: null, fromStageId: null, toStageId: null, checked: {} });
  };

  // Check if all required items are ticked
  const targetStageForChecklist = checklistModal.toStageId ? PIPELINE_STAGES.find(s => s.id === checklistModal.toStageId) : null;
  const checklistItems = targetStageForChecklist?.checklist || [];
  const allRequiredChecked = checklistItems.every((item, idx) => !item.required || checklistModal.checked[idx]);
  const checkedCount = Object.values(checklistModal.checked).filter(Boolean).length;

  const movingDeal = checklistModal.dealId ? deals.find(d => d.id === checklistModal.dealId) : null;
  const fromStageName = checklistModal.fromStageId ? PIPELINE_STAGES.find(s => s.id === checklistModal.fromStageId)?.name : '';
  const toStageName = checklistModal.toStageId ? PIPELINE_STAGES.find(s => s.id === checklistModal.toStageId)?.name : '';

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
        <Select
          value={pipelineType}
          onChange={setPipelineType}
          style={{ width: 280 }}
          size="middle"
          options={defaultPipelines.map(p => ({ value: p.typeKey, label: p.name }))}
        />
        <Space size="middle">
          <Input
            placeholder="Search deals or clients..."
            prefix={<SearchOutlined />}
            style={{ width: 220 }}
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
          <Button type="primary" icon={<PlusOutlined />}>New Deal</Button>
        </Space>
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
            const isDropTarget = dragOverStageId === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={(e) => handleDragLeave(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
                style={{
                  minWidth: 300,
                  width: 300,
                  background: isDropTarget ? token.colorPrimaryBg : token.colorFillAlter,
                  borderRadius: token.borderRadiusLG,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '100%',
                  border: isDropTarget ? `2px dashed ${token.colorPrimary}` : '2px solid transparent',
                  transition: 'background 0.2s, border-color 0.2s',
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
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => navigate(`/deal/${deal.id}`)}
                      style={{
                        cursor: 'grab',
                        border: `1px solid ${draggedDealId === deal.id ? token.colorPrimary : token.colorBorderSecondary}`,
                        opacity: draggedDealId === deal.id ? 0.5 : 1,
                      }}
                      styles={{ body: { padding: 12 } }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                          <HolderOutlined style={{ color: token.colorTextQuaternary, fontSize: 12, cursor: 'grab', flexShrink: 0 }} />
                          <Text strong style={{ fontSize: 13 }} ellipsis={{ tooltip: deal.name }}>{deal.name}</Text>
                        </div>
                        <Tag color={getPriorityColor(deal.priority)} style={{ margin: 0, fontSize: 11, flexShrink: 0 }}>{deal.priority}</Tag>
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
                    <div style={{
                      padding: 24,
                      textAlign: 'center',
                      border: `1px dashed ${isDropTarget ? token.colorPrimary : token.colorBorder}`,
                      borderRadius: token.borderRadius,
                      background: isDropTarget ? token.colorPrimaryBg : 'transparent',
                    }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {isDropTarget ? 'Drop deal here' : 'No deals in this stage'}
                      </Text>
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

      {/* Stage Transition Checklist Modal */}
      <Modal
        title={null}
        open={checklistModal.visible}
        onCancel={handleChecklistCancel}
        width={520}
        footer={[
          <Button key="cancel" onClick={handleChecklistCancel}>Cancel</Button>,
          <Button
            key="confirm"
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={!allRequiredChecked}
            onClick={handleChecklistConfirm}
          >
            Confirm Move
          </Button>,
        ]}
      >
        {movingDeal && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 16 }}>Stage Transition Checklist</Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Moving </Text>
                <Text strong>{movingDeal.name}</Text>
                <Text type="secondary"> from </Text>
                <Tag>{fromStageName}</Tag>
                <Text type="secondary"> to </Text>
                <Tag color="blue">{toStageName}</Tag>
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Please confirm the following items before proceeding. Items marked with <Text type="danger" style={{ fontSize: 12 }}>*</Text> are required.
              </Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleChecklistToggle(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: token.borderRadius,
                    background: checklistModal.checked[idx] ? token.colorSuccessBg : token.colorFillAlter,
                    border: `1px solid ${checklistModal.checked[idx] ? token.colorSuccessBorder : token.colorBorderSecondary}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Checkbox checked={!!checklistModal.checked[idx]} />
                  <Text
                    style={{
                      flex: 1,
                      textDecoration: checklistModal.checked[idx] ? 'line-through' : 'none',
                      color: checklistModal.checked[idx] ? token.colorTextSecondary : token.colorText,
                    }}
                  >
                    {item.label}
                  </Text>
                  {item.required && !checklistModal.checked[idx] && (
                    <Text type="danger" style={{ fontSize: 12 }}>*</Text>
                  )}
                  {checklistModal.checked[idx] && (
                    <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 14 }} />
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {checkedCount} / {checklistItems.length} completed
              </Text>
              {!allRequiredChecked && (
                <Text type="warning" style={{ fontSize: 12 }}>
                  <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                  Complete all required items to proceed
                </Text>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
