// @ts-nocheck
import React, { useState } from 'react';
import {
  Typography, Card, Button, Input, Space, Tag, theme, Modal, Form,
  Popconfirm, Switch, Tooltip, Empty, Badge, message, Divider,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, HolderOutlined,
  CheckCircleOutlined, SettingOutlined, CopyOutlined,
  ArrowUpOutlined, ArrowDownOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { defaultPipelines, PipelineConfig, PipelineStage, ChecklistItem } from '../../data/pipelineData';

const { Text, Title } = Typography;
const { TextArea } = Input;

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export const PipelineSettings: React.FC = () => {
  const { token } = theme.useToken();
  const [pipelines, setPipelines] = useState<PipelineConfig[]>(defaultPipelines);
  const [selectedId, setSelectedId] = useState<string>(pipelines[0]?.id || '');
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

  // Drag state for stages
  const [dragStageIdx, setDragStageIdx] = useState<number | null>(null);
  const [dragOverStageIdx, setDragOverStageIdx] = useState<number | null>(null);

  // Modals
  const [pipelineModal, setPipelineModal] = useState<{ open: boolean; editing: PipelineConfig | null }>({ open: false, editing: null });
  const [stageModal, setStageModal] = useState<{ open: boolean; editing: PipelineStage | null }>({ open: false, editing: null });
  const [checklistModal, setChecklistModal] = useState<{ open: boolean; stageId: string | null; editing: ChecklistItem | null }>({ open: false, stageId: null, editing: null });

  const [pipelineForm] = Form.useForm();
  const [stageForm] = Form.useForm();
  const [checklistForm] = Form.useForm();

  const selected = pipelines.find(p => p.id === selectedId) || null;

  // ── Pipeline CRUD ──
  const openPipelineModal = (pipe?: PipelineConfig) => {
    setPipelineModal({ open: true, editing: pipe || null });
    pipelineForm.setFieldsValue(pipe ? { name: pipe.name, typeKey: pipe.typeKey } : { name: '', typeKey: '' });
  };

  const savePipeline = (vals: any) => {
    if (pipelineModal.editing) {
      setPipelines(prev => prev.map(p => p.id === pipelineModal.editing!.id ? { ...p, name: vals.name, typeKey: vals.typeKey } : p));
      message.success('Pipeline updated');
    } else {
      const newPipe: PipelineConfig = {
        id: uid(),
        name: vals.name,
        typeKey: vals.typeKey,
        stages: [
          { id: uid(), name: 'Inquiry Received', description: 'Initial contact logged', checklist: [] },
          { id: uid(), name: 'Qualification', description: 'Gathering details', checklist: [] },
          { id: uid(), name: 'Proposal', description: 'Building proposal', checklist: [] },
          { id: uid(), name: 'Won', description: 'Deal confirmed', checklist: [] },
          { id: uid(), name: 'Lost', description: 'Deal closed without conversion', checklist: [] },
        ],
      };
      setPipelines(prev => [...prev, newPipe]);
      setSelectedId(newPipe.id);
      message.success('Pipeline created with default stages');
    }
    setPipelineModal({ open: false, editing: null });
    pipelineForm.resetFields();
  };

  const deletePipeline = (id: string) => {
    setPipelines(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) {
      const remaining = pipelines.filter(p => p.id !== id);
      setSelectedId(remaining[0]?.id || '');
    }
    message.success('Pipeline deleted');
  };

  const duplicatePipeline = (pipe: PipelineConfig) => {
    const clone: PipelineConfig = JSON.parse(JSON.stringify(pipe));
    clone.id = uid();
    clone.name = `${pipe.name} (Copy)`;
    clone.typeKey = `${pipe.typeKey} Copy`;
    clone.stages = clone.stages.map(s => ({ ...s, id: uid(), checklist: s.checklist.map(c => ({ ...c, id: uid() })) }));
    setPipelines(prev => [...prev, clone]);
    setSelectedId(clone.id);
    message.success('Pipeline duplicated');
  };

  // ── Stage CRUD ──
  const updateStages = (newStages: PipelineStage[]) => {
    setPipelines(prev => prev.map(p => p.id === selectedId ? { ...p, stages: newStages } : p));
  };

  const openStageModal = (stage?: PipelineStage) => {
    setStageModal({ open: true, editing: stage || null });
    stageForm.setFieldsValue(stage ? { name: stage.name, description: stage.description } : { name: '', description: '' });
  };

  const saveStage = (vals: any) => {
    if (!selected) return;
    if (stageModal.editing) {
      updateStages(selected.stages.map(s => s.id === stageModal.editing!.id ? { ...s, name: vals.name, description: vals.description } : s));
      message.success('Stage updated');
    } else {
      updateStages([...selected.stages, { id: uid(), name: vals.name, description: vals.description, checklist: [] }]);
      message.success('Stage added');
    }
    setStageModal({ open: false, editing: null });
    stageForm.resetFields();
  };

  const deleteStage = (stageId: string) => {
    if (!selected) return;
    updateStages(selected.stages.filter(s => s.id !== stageId));
    if (expandedStageId === stageId) setExpandedStageId(null);
    message.success('Stage deleted');
  };

  const moveStage = (idx: number, direction: 'up' | 'down') => {
    if (!selected) return;
    const stages = [...selected.stages];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= stages.length) return;
    [stages[idx], stages[targetIdx]] = [stages[targetIdx], stages[idx]];
    updateStages(stages);
  };

  // Drag reorder for stages
  const handleStageDragStart = (idx: number) => setDragStageIdx(idx);
  const handleStageDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverStageIdx(idx); };
  const handleStageDragEnd = () => {
    if (dragStageIdx !== null && dragOverStageIdx !== null && dragStageIdx !== dragOverStageIdx && selected) {
      const stages = [...selected.stages];
      const [moved] = stages.splice(dragStageIdx, 1);
      stages.splice(dragOverStageIdx, 0, moved);
      updateStages(stages);
    }
    setDragStageIdx(null);
    setDragOverStageIdx(null);
  };

  // ── Checklist CRUD ──
  const openChecklistModal = (stageId: string, item?: ChecklistItem) => {
    setChecklistModal({ open: true, stageId, editing: item || null });
    checklistForm.setFieldsValue(item ? { label: item.label, required: item.required } : { label: '', required: false });
  };

  const saveChecklistItem = (vals: any) => {
    if (!selected || !checklistModal.stageId) return;
    const stages = selected.stages.map(s => {
      if (s.id !== checklistModal.stageId) return s;
      if (checklistModal.editing) {
        return { ...s, checklist: s.checklist.map(c => c.id === checklistModal.editing!.id ? { ...c, label: vals.label, required: vals.required } : c) };
      } else {
        return { ...s, checklist: [...s.checklist, { id: uid(), label: vals.label, required: vals.required }] };
      }
    });
    updateStages(stages);
    message.success(checklistModal.editing ? 'Checklist item updated' : 'Checklist item added');
    setChecklistModal({ open: false, stageId: null, editing: null });
    checklistForm.resetFields();
  };

  const deleteChecklistItem = (stageId: string, itemId: string) => {
    if (!selected) return;
    updateStages(selected.stages.map(s => s.id === stageId ? { ...s, checklist: s.checklist.filter(c => c.id !== itemId) } : s));
    message.success('Checklist item deleted');
  };

  const toggleChecklistRequired = (stageId: string, itemId: string) => {
    if (!selected) return;
    updateStages(selected.stages.map(s => s.id === stageId ? { ...s, checklist: s.checklist.map(c => c.id === itemId ? { ...c, required: !c.required } : c) } : s));
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%', minHeight: 0 }}>
      {/* ── Left: Pipeline List ── */}
      <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text strong style={{ fontSize: 14 }}>Pipelines</Text>
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openPipelineModal()}>New</Button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pipelines.length === 0 && <Empty description="No pipelines" style={{ marginTop: 40 }} />}
          {pipelines.map(pipe => (
            <div
              key={pipe.id}
              onClick={() => setSelectedId(pipe.id)}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                background: selectedId === pipe.id ? token.colorPrimaryBg : token.colorBgContainer,
                border: `1px solid ${selectedId === pipe.id ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ fontSize: 13, display: 'block' }} ellipsis={{ tooltip: pipe.name }}>{pipe.name}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{pipe.stages.length} stages</Text>
                </div>
                <Space size={2} onClick={e => e.stopPropagation()}>
                  <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined style={{ fontSize: 12 }} />} onClick={() => openPipelineModal(pipe)} /></Tooltip>
                  <Tooltip title="Duplicate"><Button type="text" size="small" icon={<CopyOutlined style={{ fontSize: 12 }} />} onClick={() => duplicatePipeline(pipe)} /></Tooltip>
                  <Popconfirm title="Delete this pipeline?" onConfirm={() => deletePipeline(pipe.id)} okText="Delete" okType="danger">
                    <Tooltip title="Delete"><Button type="text" size="small" icon={<DeleteOutlined style={{ fontSize: 12 }} />} danger /></Tooltip>
                  </Popconfirm>
                </Space>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Stage & Checklist Editor ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {!selected ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Empty description="Select a pipeline to configure" />
          </div>
        ) : (
          <>
            {/* Pipeline header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Title level={5} style={{ margin: 0 }}>{selected.name}</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>Type key: {selected.typeKey} &middot; {selected.stages.length} stages</Text>
              </div>
              <Button size="small" icon={<PlusOutlined />} onClick={() => openStageModal()}>Add Stage</Button>
            </div>

            {/* Stages list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {selected.stages.length === 0 && <Empty description="No stages configured" style={{ marginTop: 40 }} />}
              {selected.stages.map((stage, idx) => {
                const isExpanded = expandedStageId === stage.id;
                const isDragOver = dragOverStageIdx === idx;
                const requiredCount = stage.checklist.filter(c => c.required).length;

                return (
                  <div key={stage.id} style={{ marginBottom: 8 }}>
                    {/* Stage row */}
                    <div
                      draggable
                      onDragStart={() => handleStageDragStart(idx)}
                      onDragOver={(e) => handleStageDragOver(e, idx)}
                      onDragEnd={handleStageDragEnd}
                      onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: isExpanded ? '8px 8px 0 0' : 8,
                        background: isDragOver ? token.colorPrimaryBg : token.colorBgContainer,
                        border: `1px solid ${isDragOver ? token.colorPrimary : isExpanded ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
                        borderBottom: isExpanded ? 'none' : undefined,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        opacity: dragStageIdx === idx ? 0.5 : 1,
                      }}
                    >
                      {/* Drag handle */}
                      <HolderOutlined
                        style={{ color: token.colorTextQuaternary, cursor: 'grab', fontSize: 14 }}
                        onClick={e => e.stopPropagation()}
                      />

                      {/* Order number */}
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 600,
                        background: token.colorFillSecondary, color: token.colorText,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>{idx + 1}</div>

                      {/* Stage info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ fontSize: 13 }}>{stage.name}</Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{stage.description}</Text>
                      </div>

                      {/* Checklist badge */}
                      <Tooltip title={`${stage.checklist.length} checklist items (${requiredCount} required)`}>
                        <Tag
                          color={stage.checklist.length > 0 ? 'blue' : 'default'}
                          style={{ margin: 0, fontSize: 11, cursor: 'help' }}
                        >
                          <CheckCircleOutlined /> {stage.checklist.length} items
                        </Tag>
                      </Tooltip>

                      {/* Actions */}
                      <Space size={2} onClick={e => e.stopPropagation()}>
                        <Tooltip title="Move up">
                          <Button type="text" size="small" icon={<ArrowUpOutlined style={{ fontSize: 11 }} />} disabled={idx === 0} onClick={() => moveStage(idx, 'up')} />
                        </Tooltip>
                        <Tooltip title="Move down">
                          <Button type="text" size="small" icon={<ArrowDownOutlined style={{ fontSize: 11 }} />} disabled={idx === selected.stages.length - 1} onClick={() => moveStage(idx, 'down')} />
                        </Tooltip>
                        <Tooltip title="Edit stage">
                          <Button type="text" size="small" icon={<EditOutlined style={{ fontSize: 11 }} />} onClick={() => openStageModal(stage)} />
                        </Tooltip>
                        <Popconfirm title="Delete this stage?" onConfirm={() => deleteStage(stage.id)} okText="Delete" okType="danger">
                          <Tooltip title="Delete"><Button type="text" size="small" icon={<DeleteOutlined style={{ fontSize: 11 }} />} danger /></Tooltip>
                        </Popconfirm>
                      </Space>
                    </div>

                    {/* Expanded: Checklist editor */}
                    {isExpanded && (
                      <div style={{
                        border: `1px solid ${token.colorPrimaryBorder}`,
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        padding: '12px 16px',
                        background: token.colorFillAlter,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <Text strong style={{ fontSize: 12 }}>
                            Stage Transition Checklist
                            <Text type="secondary" style={{ fontWeight: 400, fontSize: 11, marginLeft: 8 }}>
                              Shown when a deal moves into this stage
                            </Text>
                          </Text>
                          <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={() => openChecklistModal(stage.id)}>
                            Add Item
                          </Button>
                        </div>

                        {stage.checklist.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>No checklist items. Deals will move to this stage without prompts.</Text>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {stage.checklist.map((item, cIdx) => (
                              <div
                                key={item.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  padding: '6px 10px',
                                  borderRadius: 6,
                                  background: token.colorBgContainer,
                                  border: `1px solid ${token.colorBorderSecondary}`,
                                }}
                              >
                                <Text style={{ flex: 1, fontSize: 12 }}>{item.label}</Text>
                                <Tooltip title={item.required ? 'Required — click to make optional' : 'Optional — click to make required'}>
                                  <Tag
                                    color={item.required ? 'red' : 'default'}
                                    style={{ margin: 0, fontSize: 10, cursor: 'pointer' }}
                                    onClick={() => toggleChecklistRequired(stage.id, item.id)}
                                  >
                                    {item.required ? 'Required' : 'Optional'}
                                  </Tag>
                                </Tooltip>
                                <Space size={2}>
                                  <Button type="text" size="small" icon={<EditOutlined style={{ fontSize: 11 }} />} onClick={() => openChecklistModal(stage.id, item)} />
                                  <Popconfirm title="Delete this item?" onConfirm={() => deleteChecklistItem(stage.id, item.id)} okText="Delete" okType="danger">
                                    <Button type="text" size="small" icon={<DeleteOutlined style={{ fontSize: 11 }} />} danger />
                                  </Popconfirm>
                                </Space>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}

      {/* Pipeline Modal */}
      <Modal
        title={pipelineModal.editing ? 'Edit Pipeline' : 'New Pipeline'}
        open={pipelineModal.open}
        onCancel={() => { setPipelineModal({ open: false, editing: null }); pipelineForm.resetFields(); }}
        onOk={() => pipelineForm.submit()}
        okText={pipelineModal.editing ? 'Save' : 'Create'}
        destroyOnClose
      >
        <Form form={pipelineForm} layout="vertical" onFinish={savePipeline} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Pipeline Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Corporate Events Pipeline" />
          </Form.Item>
          <Form.Item name="typeKey" label="Deal Type Key" rules={[{ required: true, message: 'Required' }]}
            extra="This must match the deal type value (e.g. 'Corporate Events') used when creating deals."
          >
            <Input placeholder="e.g. Corporate Events" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Stage Modal */}
      <Modal
        title={stageModal.editing ? 'Edit Stage' : 'Add Stage'}
        open={stageModal.open}
        onCancel={() => { setStageModal({ open: false, editing: null }); stageForm.resetFields(); }}
        onOk={() => stageForm.submit()}
        okText={stageModal.editing ? 'Save' : 'Add'}
        destroyOnClose
      >
        <Form form={stageForm} layout="vertical" onFinish={saveStage} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Stage Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Proposal Development" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input placeholder="e.g. Building and reviewing the proposal" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Checklist Item Modal */}
      <Modal
        title={checklistModal.editing ? 'Edit Checklist Item' : 'Add Checklist Item'}
        open={checklistModal.open}
        onCancel={() => { setChecklistModal({ open: false, stageId: null, editing: null }); checklistForm.resetFields(); }}
        onOk={() => checklistForm.submit()}
        okText={checklistModal.editing ? 'Save' : 'Add'}
        destroyOnClose
      >
        <Form form={checklistForm} layout="vertical" onFinish={saveChecklistItem} style={{ marginTop: 16 }}>
          <Form.Item name="label" label="Checklist Item" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Client budget confirmed" />
          </Form.Item>
          <Form.Item name="required" label="Required" valuePropName="checked">
            <Switch checkedChildren="Required" unCheckedChildren="Optional" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
