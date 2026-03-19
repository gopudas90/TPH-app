// @ts-nocheck
import React, { useState } from 'react';
import { Typography, Card, Tabs, Button, Descriptions, Tag, Divider, Row, Col, Table, Space, Avatar, Timeline, Input, Progress, theme, Steps, FloatButton, List, Tooltip, Drawer, Checkbox } from 'antd';
import { ArrowLeftOutlined, EditOutlined, FilePdfOutlined, CheckCircleOutlined, UserOutlined, PlusOutlined, RobotOutlined, FormOutlined, FireOutlined, FolderOpenOutlined, DeleteOutlined, UpOutlined, DownOutlined, HolderOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_DEALS, PIPELINE_STAGES } from '../../data/mockData';
import { AIChatDrawer } from '../../components/AIChatDrawer';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SortableRequirementItem = ({ item, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '8px 0',
    background: '#fff',
    zIndex: transform ? 1 : 0,
    position: transform ? 'relative' : 'static',
  };

  return (
    <List.Item 
      ref={setNodeRef}
      style={style}
      actions={[
        <Button type="text" size="small" icon={<EditOutlined />} />,
        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(item.id)} />
      ]}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', padding: '4px' }}>
          <HolderOutlined style={{ color: '#bfbfbf' }} />
        </div>
        <Text style={{ fontSize: 13 }}>{item.text}</Text>
      </div>
    </List.Item>
  );
};

const SortableTaskItem = ({ item, onToggle, onDelete, token }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '8px 0',
    background: '#fff',
    zIndex: transform ? 1 : 0,
    position: transform ? 'relative' : 'static',
  };

  return (
    <List.Item 
      ref={setNodeRef}
      style={style}
      actions={[
        <Button type="text" size="small" icon={<EditOutlined />} />,
        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(item.id)} />
      ]}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', padding: '4px' }}>
          <HolderOutlined style={{ color: '#bfbfbf' }} />
        </div>
        <Checkbox checked={item.completed} onChange={() => onToggle(item.id)} />
        <Text style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? token.colorTextSecondary : token.colorText, fontSize: 13 }}>{item.text}</Text>
        <Tag color={item.date === 'Today' ? 'red' : 'default'} style={{ marginLeft: 'auto', fontSize: 11 }}>{item.date}</Tag>
      </div>
    </List.Item>
  );
};

export const DealProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const deal = MOCK_DEALS.find(d => d.id === id) || MOCK_DEALS[0];

  const [activeTab, setActiveTab] = useState('1');
  const [activeDrawer, setActiveDrawer] = useState<'notes' | 'documents' | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Notes State
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([
    { id: 1, text: 'Client prefers to be contacted via email.', date: '10 Mar 2026, 10:00 AM' },
    { id: 2, text: 'Budget might be slightly flexible if we include AV.', date: '12 Mar 2026, 02:30 PM' }
  ]);

  // Tags State
  const [tags, setTags] = useState(['VIP', 'Tech Summit']);
  const [tagInputVisible, setTagInputVisible] = useState(false);
  const [tagInputValue, setTagInputValue] = useState('');

  // Requirements State
  const [requirements, setRequirements] = useState([
    { id: 1, text: 'Main stage with LED wall' },
    { id: 2, text: '4 breakout rooms with projectors' },
    { id: 3, text: 'VIP networking lounge' },
  ]);
  const [newReq, setNewReq] = useState('');
  const [reqInputVisible, setReqInputVisible] = useState(false);

  // Tasks State
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Finalize AV partner quote', date: 'Today', completed: false },
    { id: 2, text: 'Send proposal to client', date: 'Tomorrow', completed: false },
    { id: 3, text: 'Initial client brief call', date: '10 Mar', completed: true },
    { id: 4, text: 'Site visit at MBS', date: '12 Mar', completed: true },
  ]);

  // Team State
  const [team, setTeam] = useState([
    { id: 1, name: 'Sarah Jenkins', role: 'Account Manager', initials: 'SJ', color: '#f56a00' },
    { id: 2, name: 'Mark Davis', role: 'Sales Director', initials: 'MD', color: '#7265e6' },
  ]);

  // Contacts State
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Jane Doe', role: 'Marketing Director', email: 'jane.doe@acme.com', phone: '+65 9123 4567' },
    { id: '2', name: 'John Smith', role: 'Procurement Manager', email: 'john.smith@acme.com', phone: '+65 8234 5678' },
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'red';
      case 'Mid': return 'orange';
      case 'Low': return 'green';
      default: return 'default';
    }
  };

  // Generic List Helpers
  const deleteItem = (list: any[], setList: any, id: number | string) => {
    setList(list.filter(item => item.id !== id));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndReq = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRequirements((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndTask = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, { id: Date.now(), text: newNote, date: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }]);
      setNewNote('');
    }
  };

  const handleAddTag = () => {
    if (tagInputValue && !tags.includes(tagInputValue)) {
      setTags([...tags, tagInputValue]);
    }
    setTagInputVisible(false);
    setTagInputValue('');
  };

  const handleAddReq = () => {
    if (newReq.trim()) {
      setRequirements([...requirements, { id: Date.now(), text: newReq }]);
      setNewReq('');
      setReqInputVisible(false);
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === deal.stageId);

  const [documentData, setDocumentData] = useState([
    { id: '1', name: 'Client_Brief_v2.pdf', type: 'PDF', size: '2.4 MB', uploadedBy: 'Sarah Jenkins', date: '2026-03-10' },
    { id: '2', name: 'MBS_Floorplan.pdf', type: 'PDF', size: '5.1 MB', uploadedBy: 'Mark Davis', date: '2026-03-11' },
    { id: '3', name: 'Initial_Quote_v1.xlsx', type: 'Excel', size: '1.2 MB', uploadedBy: 'Sarah Jenkins', date: '2026-03-12' },
  ]);

  const [quoteData, setQuoteData] = useState([
    { id: '1', version: 'v1.0', label: 'Initial', date: '2026-03-10', value: 85700, discount: 0, status: 'Draft', isAIGenerated: true, createdBy: 'Sarah Jenkins', changes: 'Initial quote generated from client brief', itemCount: 7 },
    { id: '2', version: 'v1.1', label: 'Revised AV', date: '2026-03-12', value: 92500, discount: 2000, status: 'Sent', isAIGenerated: false, createdBy: 'Mark Davis', changes: 'Upgraded AV package, added breakout room projectors', itemCount: 8 },
    { id: '3', version: 'v2.0', label: 'Final Neg', date: '2026-03-15', value: 89000, discount: 5000, status: 'Approved', isAIGenerated: false, createdBy: 'Sarah Jenkins', changes: 'Applied negotiated discount on lighting and scenic packages', itemCount: 7 },
  ]);

  const quoteColumns = [
    { title: 'Quote', dataIndex: 'label', key: 'label', render: (text: string, record: any) => (
      <Space>
        <Text strong style={{ fontSize: 13 }}>{text}</Text>
        {record.isAIGenerated && <Tag color="purple" icon={<RobotOutlined />}>AI</Tag>}
      </Space>
    )},
    { title: 'Version', dataIndex: 'version', key: 'version', width: 80, align: 'center' as const, render: (text: string, record: any) => (
      <Tooltip
        title={
          <div style={{ fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{text} — {record.label}</div>
            <div>Created: {record.date}</div>
            <div>By: {record.createdBy}</div>
            <div>Items: {record.itemCount}</div>
            <div style={{ marginTop: 4, fontStyle: 'italic' }}>{record.changes}</div>
          </div>
        }
        placement="top"
      >
        <Tag style={{ cursor: 'help', margin: 0 }}>{text}</Tag>
      </Tooltip>
    )},
    { title: 'Date Created', dataIndex: 'date', key: 'date' },
    { title: 'Discount', dataIndex: 'discount', key: 'discount', render: (val: number) => val > 0 ? <Text type="danger">-{formatCurrency(val)}</Text> : '-' },
    { title: 'Total Value', dataIndex: 'value', key: 'value', render: (val: number) => formatCurrency(val) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => (
      <Tag color={status === 'Approved' ? 'success' : status === 'Sent' ? 'processing' : 'default'}>{status}</Tag>
    )},
    { title: 'Action', key: 'action', render: (_, record) => (
      <Space size="small" onClick={(e) => e.stopPropagation()}>
        <Button type="link" size="small">Rename</Button>
        <Button type="link" size="small">Edit</Button>
        <Button type="link" danger size="small" onClick={() => deleteItem(quoteData, setQuoteData, record.id)}>Delete</Button>
      </Space>
    )},
  ];

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/pipeline')} />
        <div>
          <Title level={4} style={{ margin: 0, fontSize: 18 }}>{deal.name}</Title>
          <Space size="middle" style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>{deal.client}</Text>
            <Tag color="blue" style={{ fontSize: 12 }}>{deal.type}</Tag>
            <Tag color={getPriorityColor(deal.priority)} style={{ fontSize: 12 }}>{deal.priority} Priority</Tag>
            <Tooltip title={deal.leadScoreExplanation || "AI calculated score based on engagement and fit."}>
              <Tag color="purple" style={{ fontSize: 12, cursor: 'help' }}><FireOutlined /> Lead Score: {deal.leadScore}</Tag>
            </Tooltip>
            <Text strong style={{ color: token.colorPrimary, fontSize: 13 }}>{formatCurrency(deal.value)}</Text>
          </Space>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Space>
            <Button size="small">Generate Quote</Button>
            <Button type="primary" size="small">Edit Deal</Button>
          </Space>
        </div>
      </div>

      {/* Pipeline Stages */}
      <Card style={{ marginBottom: 24 }} styles={{ body: { padding: '16px 24px 0 24px' } }}>
        <Steps 
          current={currentStageIndex} 
          size="small" 
          items={PIPELINE_STAGES.map(s => ({ 
            title: <span style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{s.name}</span> 
          }))}
          style={{ marginBottom: 16 }}
          labelPlacement="vertical"
        />
      </Card>

      {/* Main Content Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="small">
        <Tabs.TabPane tab="Event Details" key="1">
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Card title={<span style={{ fontSize: 14 }}>General Information</span>} extra={<Button type="link" icon={<EditOutlined />} size="small">Edit</Button>} size="small" style={{ marginBottom: 24 }}>
                <Descriptions column={2} labelStyle={{ color: token.colorTextSecondary, fontSize: 13 }} contentStyle={{ fontSize: 13 }}>
                  <Descriptions.Item label="Event Name">{deal.name}</Descriptions.Item>
                  <Descriptions.Item label="Client">{deal.client}</Descriptions.Item>
                  <Descriptions.Item label="Event Type">{deal.type}</Descriptions.Item>
                  <Descriptions.Item label="Format">In-Person</Descriptions.Item>
                  <Descriptions.Item label="Event Date">{new Date(deal.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Descriptions.Item>
                  <Descriptions.Item label="Setup Date">14 Sep 2026</Descriptions.Item>
                  <Descriptions.Item label="Teardown Date">16 Sep 2026</Descriptions.Item>
                  <Descriptions.Item label="Expected Attendance">500 Pax</Descriptions.Item>
                  <Descriptions.Item label="Tags" span={2}>
                    <Space wrap>
                      {tags.map(tag => (
                        <Tag key={tag} closable onClose={() => setTags(tags.filter(t => t !== tag))}>{tag}</Tag>
                      ))}
                      {tagInputVisible ? (
                        <Input
                          type="text"
                          size="small"
                          style={{ width: 100 }}
                          value={tagInputValue}
                          onChange={e => setTagInputValue(e.target.value)}
                          onBlur={handleAddTag}
                          onPressEnter={handleAddTag}
                          autoFocus
                        />
                      ) : (
                        <Tag onClick={() => setTagInputVisible(true)} style={{ borderStyle: 'dashed', cursor: 'pointer' }}>
                          <PlusOutlined /> New Tag
                        </Tag>
                      )}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
                <Divider style={{ margin: '12px 0' }} />
                <Title level={5} style={{ fontSize: 13, marginTop: 0 }}>Description</Title>
                <Text style={{ fontSize: 13 }}>Annual technology summit focusing on AI and future trends. Requires main stage setup, 4 breakout rooms, and a networking lounge area.</Text>
              </Card>

              <Card title={<span style={{ fontSize: 14 }}>Requirements</span>} size="small" extra={
                !reqInputVisible && <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => setReqInputVisible(true)}>Add Requirement</Button>
              }>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndReq}>
                  <SortableContext items={requirements.map(r => r.id)} strategy={verticalListSortingStrategy}>
                    <List
                      size="small"
                      dataSource={requirements}
                      renderItem={(item) => (
                        <SortableRequirementItem key={item.id} item={item} onDelete={(id) => deleteItem(requirements, setRequirements, id)} />
                      )}
                    />
                  </SortableContext>
                </DndContext>
                {reqInputVisible && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <Input 
                      size="small" 
                      placeholder="Enter new requirement..." 
                      value={newReq} 
                      onChange={e => setNewReq(e.target.value)} 
                      onPressEnter={handleAddReq}
                      autoFocus
                    />
                    <Button size="small" type="primary" onClick={handleAddReq}>Add</Button>
                    <Button size="small" onClick={() => setReqInputVisible(false)}>Cancel</Button>
                  </div>
                )}
              </Card>
            </Col>
            <Col span={8}>
              <Card title={<span style={{ fontSize: 14 }}>Venue Details</span>} extra={<Button type="link" icon={<EditOutlined />} size="small">Edit</Button>} size="small" style={{ marginBottom: 24 }}>
                <Descriptions column={1} labelStyle={{ color: token.colorTextSecondary, fontSize: 13 }} contentStyle={{ fontSize: 13 }}>
                  <Descriptions.Item label="Venue Name">Marina Bay Sands Expo</Descriptions.Item>
                  <Descriptions.Item label="Hall/Room">Roselle Simpor Ballroom</Descriptions.Item>
                  <Descriptions.Item label="Capacity">800 Pax</Descriptions.Item>
                  <Descriptions.Item label="Setup Constraints">Loading bay access limited to 10pm - 6am.</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title={<span style={{ fontSize: 14 }}>Financial Details</span>} extra={<Button type="link" icon={<EditOutlined />} size="small">Edit</Button>} size="small">
                <Descriptions column={1} labelStyle={{ color: token.colorTextSecondary, fontSize: 13 }} contentStyle={{ fontSize: 13 }}>
                  <Descriptions.Item label="Client Stated Budget">{formatCurrency(130000)}</Descriptions.Item>
                  <Descriptions.Item label="Current Quote Value"><Text strong style={{ color: token.colorPrimary }}>{formatCurrency(deal.value)}</Text></Descriptions.Item>
                  <Descriptions.Item label="Target Margin">35%</Descriptions.Item>
                  <Descriptions.Item label="Current Projected Margin">
                    <div style={{ width: '100%' }}>
                      <div style={{ marginBottom: 4 }}>32%</div>
                      <Progress percent={32} status="active" strokeColor={token.colorPrimary} size="small" showInfo={false} />
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Customer Details" key="5">
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Card title={<span style={{ fontSize: 14 }}>Company Information</span>} extra={<Button type="link" icon={<EditOutlined />} size="small">Edit</Button>} size="small" style={{ marginBottom: 24 }}>
                <Descriptions column={2} labelStyle={{ color: token.colorTextSecondary, fontSize: 13 }} contentStyle={{ fontSize: 13 }}>
                  <Descriptions.Item label="Company Name">{deal.client}</Descriptions.Item>
                  <Descriptions.Item label="Industry">Technology</Descriptions.Item>
                  <Descriptions.Item label="Website"><a href="#">www.acmecorp.com</a></Descriptions.Item>
                  <Descriptions.Item label="HQ Location">Singapore</Descriptions.Item>
                  <Descriptions.Item label="Account Status"><Tag color="success">Active</Tag></Descriptions.Item>
                  <Descriptions.Item label="Total Lifetime Value">{formatCurrency(450000)}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title={<span style={{ fontSize: 14 }}>Key Contacts</span>} extra={<Button type="link" icon={<PlusOutlined />} size="small">Add Contact</Button>} size="small">
                <Table 
                  size="small"
                  pagination={false}
                  columns={[
                    { title: 'Name', dataIndex: 'name', key: 'name', render: (text) => <Text strong style={{ fontSize: 13 }}>{text}</Text> },
                    { title: 'Role', dataIndex: 'role', key: 'role' },
                    { title: 'Email', dataIndex: 'email', key: 'email' },
                    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
                    { 
                      title: 'Action', 
                      key: 'action', 
                      render: (_, record) => (
                        <Space size="small">
                          <Button type="text" size="small" icon={<EditOutlined />} />
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => deleteItem(contacts, setContacts, record.id)} />
                        </Space>
                      ) 
                    }
                  ]}
                  dataSource={contacts}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card title={<span style={{ fontSize: 14 }}>AI Insights</span>} size="small">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                  <RobotOutlined style={{ fontSize: 20, color: token.colorPrimary, marginTop: 4 }} />
                  <div>
                    <Text strong style={{ fontSize: 13, display: 'block' }}>High Propensity to Buy</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Based on recent interactions and historical data, this client has a 85% likelihood of closing within 30 days.</Text>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <RobotOutlined style={{ fontSize: 20, color: token.colorPrimary, marginTop: 4 }} />
                  <div>
                    <Text strong style={{ fontSize: 13, display: 'block' }}>Suggested Action</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Send a personalized follow-up highlighting the AV package discount to accelerate the decision.</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Quotes" key="7">
          <Card title={<span style={{ fontSize: 14 }}>Generated Quotes</span>} extra={<Button type="primary" size="small">Create New Version</Button>} size="small">
            <Table 
              columns={quoteColumns} 
              dataSource={quoteData} 
              rowKey="id"
              pagination={false} 
              size="small" 
              onRow={(record) => ({
                onClick: () => navigate(`/quote/${record.id}`),
                style: { cursor: 'pointer' }
              })}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Tasks" key="6">
          <Card title={<span style={{ fontSize: 14 }}>Task List</span>} size="small" extra={<Button type="primary" icon={<PlusOutlined />} size="small">Add Task</Button>}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndTask}>
              <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <List
                  size="small"
                  dataSource={tasks}
                  renderItem={(item) => (
                    <SortableTaskItem key={item.id} item={item} onToggle={toggleTask} onDelete={(id) => deleteItem(tasks, setTasks, id)} token={token} />
                  )}
                />
              </SortableContext>
            </DndContext>
            {tasks.length === 0 && <Text type="secondary" style={{ fontSize: 13 }}>No tasks available.</Text>}
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Logs & Admin" key="3">
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Card title={<span style={{ fontSize: 14 }}>Activity Logs</span>} size="small">
                <Timeline
                  style={{ marginTop: 16 }}
                  items={[
                    {
                      color: 'green',
                      children: (
                        <>
                          <Text strong style={{ fontSize: 13 }}>Sarah Jenkins</Text> <Text type="secondary" style={{ fontSize: 13 }}>updated stage to</Text> <Tag style={{ fontSize: 11 }}>Proposal Development</Tag>
                          <br />
                          <Text type="secondary" style={{ fontSize: 11 }}>Today, 10:30 AM</Text>
                        </>
                      ),
                    },
                    {
                      color: 'blue',
                      children: (
                        <>
                          <Text strong style={{ fontSize: 13 }}>Mark Davis</Text> <Text type="secondary" style={{ fontSize: 13 }}>uploaded a document:</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text style={{ fontSize: 13 }}><FilePdfOutlined style={{ color: token.colorError }}/> MBS_Floorplan.pdf</Text>
                          </div>
                          <Text type="secondary" style={{ fontSize: 11 }}>Yesterday, 4:15 PM</Text>
                        </>
                      ),
                    },
                    {
                      color: 'gray',
                      children: (
                        <>
                          <Text strong style={{ fontSize: 13 }}>System</Text> <Text type="secondary" style={{ fontSize: 13 }}>created deal</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 11 }}>12 Mar 2026, 09:00 AM</Text>
                        </>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card title={<span style={{ fontSize: 14 }}>Team Assignment</span>} size="small" extra={<Button type="link" icon={<PlusOutlined />} size="small">Add Member</Button>}>
                <List
                  size="small"
                  dataSource={team}
                  renderItem={item => (
                    <List.Item
                      style={{ padding: '8px 0', borderBottom: 'none' }}
                      actions={[
                        <Button type="text" size="small" icon={<EditOutlined />} />,
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => deleteItem(team, setTeam, item.id)} />
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar style={{ backgroundColor: item.color }} size="small">{item.initials}</Avatar>}
                        title={<Text strong style={{ fontSize: 13 }}>{item.name}</Text>}
                        description={<Text type="secondary" style={{ fontSize: 11 }}>{item.role}</Text>}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>

      {/* Outermost Trigger Pane for Notes & Documents */}
      <div style={{
        position: 'fixed',
        right: 0,
        top: '30%',
        background: token.colorBgContainer,
        boxShadow: '-2px 0 8px rgba(0,0,0,0.08)',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        zIndex: 1000,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRight: 'none'
      }}>
        <Tooltip title="Notes" placement="left">
          <Button type="text" icon={<FormOutlined style={{ fontSize: 20, color: token.colorTextSecondary }} />} onClick={() => setActiveDrawer('notes')} />
        </Tooltip>
        <Tooltip title="Documents" placement="left">
          <Button type="text" icon={<FolderOpenOutlined style={{ fontSize: 20, color: token.colorTextSecondary }} />} onClick={() => setActiveDrawer('documents')} />
        </Tooltip>
      </div>

      {/* Drawers */}
      <Drawer
        title="Notes"
        placement="right"
        onClose={() => setActiveDrawer(null)}
        open={activeDrawer === 'notes'}
        width={400}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
            <List
              itemLayout="horizontal"
              dataSource={notes}
              renderItem={item => (
                <List.Item 
                  style={{ padding: '12px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}
                  actions={[
                    <Button type="text" size="small" icon={<EditOutlined />} />,
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => deleteItem(notes, setNotes, item.id)} />
                  ]}
                >
                  <List.Item.Meta
                    title={<Text type="secondary" style={{ fontSize: 11 }}>{item.date}</Text>}
                    description={<Text style={{ fontSize: 13, color: token.colorText }}>{item.text}</Text>}
                  />
                </List.Item>
              )}
            />
            {notes.length === 0 && <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>No notes yet.</Text>}
          </div>
          <div>
            <TextArea
              rows={4}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Type a new note here..."
              style={{ marginBottom: 12, fontSize: 13 }}
            />
            <Button type="primary" block onClick={handleAddNote} icon={<PlusOutlined />}>
              Add Note
            </Button>
          </div>
        </div>
      </Drawer>

      <Drawer
        title="Documents"
        placement="right"
        onClose={() => setActiveDrawer(null)}
        open={activeDrawer === 'documents'}
        width={450}
        extra={<Button icon={<PlusOutlined />} size="small" type="primary">Upload</Button>}
      >
        <List
          itemLayout="horizontal"
          dataSource={documentData}
          renderItem={item => (
            <List.Item 
              actions={[
                <Button type="link" size="small">Download</Button>,
                <Button type="text" size="small" icon={<EditOutlined />} />,
                <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => deleteItem(documentData, setDocumentData, item.id)} />
              ]}
              style={{ padding: '16px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}
            >
              <List.Item.Meta
                avatar={<FilePdfOutlined style={{ fontSize: 28, color: item.type === 'PDF' ? token.colorError : token.colorSuccess }} />}
                title={<Text strong style={{ fontSize: 14 }} ellipsis={{ tooltip: item.name }}>{item.name}</Text>}
                description={<Text type="secondary" style={{ fontSize: 12 }}>{item.size} • {item.date} • {item.uploadedBy}</Text>}
              />
            </List.Item>
          )}
        />
      </Drawer>

      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 24 }}>
        <FloatButton icon={<RobotOutlined />} type="primary" tooltip="AI Chat Assistant" onClick={() => setIsChatOpen(true)} />
      </FloatButton.Group>

      <AIChatDrawer
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        dealName={deal.name}
        dealId={deal.id}
      />
    </div>
  );
};
