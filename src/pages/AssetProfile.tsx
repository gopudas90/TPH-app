// @ts-nocheck
import React, { useState } from 'react';
import { Typography, Card, Tabs, Button, Descriptions, Tag, Row, Col, Table, Space, theme, Statistic, Input, Select, Tooltip, Drawer, Form, List, Timeline, Alert, Checkbox, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DollarOutlined, FormOutlined, FolderOpenOutlined, DeleteOutlined, PlusOutlined, ToolOutlined, CalendarOutlined, CloseOutlined, SaveOutlined, FilePdfOutlined, EnvironmentOutlined, InboxOutlined, BarChartOutlined, CheckCircleOutlined, ExportOutlined, ImportOutlined, RobotOutlined, BulbOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_ASSETS, MOCK_ASSET_BOOKINGS } from '../data/mockData';
import { formatCurrency } from '../utils';
import { detectConflicts } from '../utils/assetUtils';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const AssetProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [activeTab, setActiveTab] = useState('details');
  const [activeDrawer, setActiveDrawer] = useState<'notes' | 'documents' | 'checkout' | 'checkin' | null>(null);

  const initialAsset = MOCK_ASSETS.find(a => a.id === id);

  if (!initialAsset) {
    return <div style={{ padding: 24 }}>Asset not found</div>;
  }

  const [asset, setAsset] = useState(initialAsset);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingStorage, setIsEditingStorage] = useState(false);
  const [isEditingCondition, setIsEditingCondition] = useState(false);
  const [editCondition, setEditCondition] = useState(initialAsset.condition);
  const [editNextMaintenance, setEditNextMaintenance] = useState(initialAsset.nextMaintenance || '');
  const [editLastMaintenance, setEditLastMaintenance] = useState(initialAsset.lastMaintenance || '');

  // Bookings state (local copy so check-out/check-in can mutate)
  const [bookings, setBookings] = useState(MOCK_ASSET_BOOKINGS);
  const assetBookings = bookings.filter(b => b.assetId === id);
  const conflicts = detectConflicts(id, bookings);

  // Find actionable bookings
  const confirmedBooking = assetBookings.find(b => b.status === 'confirmed');
  const checkedOutBooking = assetBookings.find(b => b.status === 'checked-out');

  // Check-Out form state
  const [checkOutPerson, setCheckOutPerson] = useState('');
  const [checkOutCondition, setCheckOutCondition] = useState('Excellent');
  const [checkOutNotes, setCheckOutNotes] = useState('');

  // Check-In form state
  const [checkInCondition, setCheckInCondition] = useState('Excellent');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkInDamageReported, setCheckInDamageReported] = useState(false);
  const [checkInDamageDescription, setCheckInDamageDescription] = useState('');

  // Notes State
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([
    { id: 1, text: 'Asset performing well. No issues reported on last deployment.', date: '12 Mar 2026, 09:30 AM' },
    { id: 2, text: 'Consider upgrading firmware before next major event.', date: '05 Mar 2026, 02:15 PM' },
  ]);

  const deleteItem = (list: any[], setList: (list: any[]) => void, id: number | string) => {
    setList(list.filter(item => item.id !== id));
  };

  const getConditionColor = (condition: string) => {
    if (condition === 'Excellent') return 'success';
    if (condition === 'Good') return 'processing';
    if (condition === 'Fair') return 'warning';
    if (condition === 'Requires Maintenance') return 'error';
    if (condition === 'Retired') return 'default';
    if (condition === 'Pending') return 'default';
    return 'default';
  };

  const getBookingStatusColor = (status: string) => {
    if (status === 'confirmed') return 'blue';
    if (status === 'checked-out') return 'processing';
    if (status === 'returned') return 'success';
    if (status === 'pending') return 'default';
    return 'default';
  };

  const getCategoryColor = (category: string) => {
    const map: Record<string, string> = {
      'AV Equipment': 'blue',
      'Lighting': 'gold',
      'Staging': 'purple',
      'Rigging': 'orange',
      'Furniture': 'cyan',
      'Props': 'magenta',
    };
    return map[category] || 'default';
  };

  // Mock sub-category and physical specs based on category
  const getSubCategory = (asset: any) => {
    const map: Record<string, string> = {
      'A-1001': 'Stage Platforms',
      'A-1002': 'Speaker Systems',
      'A-1003': 'LED Display',
      'A-1004': 'Moving Heads',
      'A-1005': 'Chain Hoists',
      'A-1006': 'Tables',
      'A-1007': 'Box Truss',
      'A-1008': 'Wireless Microphones',
      'A-1009': 'Stage Risers',
      'A-1010': 'Follow Spots',
      'A-1011': 'Tents & Marquees',
      'A-1012': 'Chairs',
      'A-1013': 'Scenic Elements',
      'A-1014': 'Mixing Consoles',
      'A-1015': 'Foam Props',
    };
    return map[asset.id] || asset.category;
  };

  const getPhysicalSpecs = (asset: any) => {
    const specs: Record<string, { dimensions: string; weight: string; power: string }> = {
      'A-1001': { dimensions: '12000 x 8000 x 1200 mm', weight: '2,400 kg (total)', power: 'N/A' },
      'A-1002': { dimensions: '338 x 1004 x 521 mm per module', weight: '39 kg per module', power: '230V AC, 16A per module' },
      'A-1003': { dimensions: '500 x 500 x 80 mm per panel', weight: '7.5 kg per panel', power: '230V AC, 2A per panel' },
      'A-1004': { dimensions: '480 x 330 x 710 mm', weight: '35 kg per unit', power: '230V AC, 5A' },
      'A-1005': { dimensions: '610 x 230 x 280 mm per unit', weight: '45 kg per unit', power: '400V 3-phase, 10A per unit' },
      'A-1006': { dimensions: '1500 mm diameter x 750 mm height', weight: '18 kg per table', power: 'N/A' },
      'A-1007': { dimensions: '2000 x 300 x 300 mm per section', weight: '8.5 kg per metre', power: 'N/A' },
      'A-1008': { dimensions: '250 x 50 x 40 mm per unit', weight: '0.3 kg per unit', power: 'AA batteries / charging dock' },
      'A-1009': { dimensions: '1220 x 1220 x 200-800 mm', weight: '25 kg per riser', power: 'N/A' },
      'A-1010': { dimensions: '350 x 350 x 1100 mm', weight: '22 kg per unit', power: '230V AC, 10A' },
      'A-1011': { dimensions: '15000 x 20000 x 4000 mm', weight: '850 kg (total)', power: 'N/A' },
      'A-1012': { dimensions: '400 x 420 x 920 mm', weight: '4 kg per chair', power: 'N/A' },
      'A-1013': { dimensions: 'Various (2400 x 1200 mm flats)', weight: '15 kg per flat', power: 'N/A' },
      'A-1014': { dimensions: '1413 x 613 x 284 mm', weight: '48 kg', power: '230V AC, 3A' },
      'A-1015': { dimensions: 'Various', weight: '2-10 kg per piece', power: 'N/A' },
    };
    return specs[asset.id] || { dimensions: 'N/A', weight: 'N/A', power: 'N/A' };
  };

  const getStorageDetails = (asset: any) => {
    const zoneMap: Record<string, { zone: string; shelf: string }> = {
      'Warehouse A': { zone: 'Zone A — Main Equipment Store', shelf: 'A-' + asset.id.split('-')[1]?.slice(-2) + ' / Rack 1' },
      'Warehouse B': { zone: 'Zone B — Overflow & Scenic', shelf: 'B-' + asset.id.split('-')[1]?.slice(-2) + ' / Rack 2' },
      'Warehouse C': { zone: 'Zone C — Furniture & Props', shelf: 'C-' + asset.id.split('-')[1]?.slice(-2) + ' / Bay 1' },
      'Storage': { zone: 'Retired Assets Storage', shelf: 'R-01 / Archive' },
    };
    return zoneMap[asset.location] || { zone: asset.location, shelf: 'N/A' };
  };

  const [storageZone, setStorageZone] = useState(getStorageDetails(initialAsset).zone);
  const [storageShelf, setStorageShelf] = useState(getStorageDetails(initialAsset).shelf);

  // Mock service history
  const serviceHistory = [
    { id: 'sh1', date: '2026-01-10', type: 'Routine', description: 'Preventive maintenance — full system inspection and cleaning', cost: 1200, technician: 'AV Solutions Pte Ltd' },
    { id: 'sh2', date: '2025-07-22', type: 'Repair', description: 'Replaced faulty component — unit back to full operation', cost: 3800, technician: 'OEM Service Centre SG' },
    { id: 'sh3', date: '2025-01-15', type: 'Calibration', description: 'Annual calibration and performance measurement', cost: 800, technician: 'AV Solutions Pte Ltd' },
    { id: 'sh4', date: '2024-07-10', type: 'Routine', description: 'Mid-year inspection, cleaned all components and connectors', cost: 600, technician: 'AV Solutions Pte Ltd' },
    { id: 'sh5', date: '2024-01-08', type: 'Calibration', description: 'Annual calibration — all parameters within spec', cost: 800, technician: 'AV Solutions Pte Ltd' },
  ];

  const getServiceTypeColor = (type: string) => {
    if (type === 'Routine') return 'blue';
    if (type === 'Repair') return 'red';
    if (type === 'Calibration') return 'green';
    return 'default';
  };

  const serviceColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Type', dataIndex: 'type', key: 'type',
      render: (val: string) => <Tag color={getServiceTypeColor(val)}>{val}</Tag>
    },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Cost', dataIndex: 'cost', key: 'cost',
      render: (val: number) => formatCurrency(val)
    },
    { title: 'Technician', dataIndex: 'technician', key: 'technician' },
  ];

  // Bookings tab columns
  const bookingTabColumns = [
    { title: 'Project', dataIndex: 'projectName', key: 'projectName', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate' },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (val: string) => <Tag color={getBookingStatusColor(val)}>{val}</Tag>
    },
    { title: 'Checked Out By', dataIndex: 'checkedOutBy', key: 'checkedOutBy', render: (val: string) => val || '—' },
    {
      title: 'Condition on Return', dataIndex: 'checkInCondition', key: 'checkInCondition',
      render: (val: string) => val ? <Tag color={getConditionColor(val)}>{val}</Tag> : '—'
    },
  ];

  // Mock documents list
  const documentsList = [
    { id: 'd1', name: `${asset.name} — User Manual.pdf`, type: 'Manual', size: '4.2 MB' },
    { id: 'd2', name: 'Warranty Certificate.pdf', type: 'Warranty', size: '1.1 MB' },
    { id: 'd3', name: 'Calibration Report 2025.pdf', type: 'Calibration', size: '2.8 MB' },
  ];

  const physicalSpecs = getPhysicalSpecs(asset);
  const storageDetails = getStorageDetails(asset);

  // Check-Out handler
  const handleCheckOut = () => {
    if (!confirmedBooking || !checkOutPerson.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    setBookings(prev => prev.map(b =>
      b.id === confirmedBooking.id
        ? { ...b, status: 'checked-out', checkedOutBy: checkOutPerson, checkOutDate: today, checkOutCondition: checkOutCondition, checkOutNotes: checkOutNotes }
        : b
    ));
    message.success(`Asset checked out to ${checkOutPerson} for ${confirmedBooking.projectName}`);
    setCheckOutPerson('');
    setCheckOutCondition('Excellent');
    setCheckOutNotes('');
    setActiveDrawer(null);
  };

  // Check-In handler
  const handleCheckIn = () => {
    if (!checkedOutBooking) return;
    const today = new Date().toISOString().split('T')[0];
    setBookings(prev => prev.map(b =>
      b.id === checkedOutBooking.id
        ? { ...b, status: 'returned', checkInDate: today, checkInCondition: checkInCondition, checkInNotes: checkInDamageReported ? `${checkInNotes} | Damage: ${checkInDamageDescription}` : checkInNotes, checkInDamageReported: checkInDamageReported }
        : b
    ));
    message.success(`Asset checked in from ${checkedOutBooking.projectName}`);
    setCheckInCondition('Excellent');
    setCheckInNotes('');
    setCheckInDamageReported(false);
    setCheckInDamageDescription('');
    setActiveDrawer(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        <div style={{ flex: 1 }}>
          <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            {asset.name}
            <Tag color={getCategoryColor(asset.category)}>{asset.category}</Tag>
            <Tag color={getConditionColor(asset.condition)}>{asset.condition}</Tag>
          </Title>
          <Text type="secondary">{asset.id} — {asset.location}{asset.assignedProject ? ` — Currently on: ${asset.assignedProject}` : ''}</Text>
        </div>
        <Space>
          {confirmedBooking && (
            <Button type="primary" icon={<ExportOutlined />} onClick={() => setActiveDrawer('checkout')}>
              Check Out
            </Button>
          )}
          {checkedOutBooking && (
            <Button style={{ backgroundColor: token.colorSuccess, borderColor: token.colorSuccess, color: '#fff' }} icon={<ImportOutlined />} onClick={() => setActiveDrawer('checkin')}>
              Check In
            </Button>
          )}
        </Space>
      </div>

      {/* Stat Cards Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="Purchase Cost" value={asset.purchaseValue} prefix={<DollarOutlined />} formatter={(val) => formatCurrency(val as number)} />
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="Current Book Value" value={asset.currentValue} prefix={<DollarOutlined />} formatter={(val) => formatCurrency(val as number)} styles={{ content: { color: token.colorPrimary } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="Utilisation Rate" value={asset.utilisationRate} suffix="%" prefix={<BarChartOutlined />} styles={{ content: { color: asset.utilisationRate >= 75 ? token.colorSuccess : asset.utilisationRate >= 50 ? token.colorWarning : token.colorError } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="Total Bookings" value={assetBookings.length} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'details',
          label: 'Asset Details',
          children: (
            <Row gutter={[24, 24]}>
              {/* Left Column */}
              <Col span={16}>
                {/* Asset Information Card */}
                <Card
                  title="Asset Information"
                  style={{ marginBottom: 24 }}
                  extra={
                    isEditingInfo ? (
                      <Space>
                        <Button size="small" onClick={() => { setAsset(initialAsset); setIsEditingInfo(false); }}>Cancel</Button>
                        <Button size="small" type="primary" onClick={() => setIsEditingInfo(false)}>Save</Button>
                      </Space>
                    ) : (
                      <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditingInfo(true)} />
                    )
                  }
                >
                  {isEditingInfo ? (
                    <Form layout="vertical" initialValues={{
                      name: asset.name,
                      category: asset.category,
                      subCategory: getSubCategory(asset),
                      purchaseDate: asset.purchaseDate,
                      purchaseValue: asset.purchaseValue,
                      currentValue: asset.currentValue,
                    }} onValuesChange={(_, allValues) => setAsset({ ...asset, ...allValues })}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="name" label="Asset Name"><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="category" label="Category">
                            <Select>
                              <Option value="AV Equipment">AV Equipment</Option>
                              <Option value="Lighting">Lighting</Option>
                              <Option value="Staging">Staging</Option>
                              <Option value="Rigging">Rigging</Option>
                              <Option value="Furniture">Furniture</Option>
                              <Option value="Props">Props</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="subCategory" label="Sub-Category"><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="purchaseDate" label="Acquisition Date"><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="purchaseValue" label="Purchase Cost (SGD)"><Input type="number" /></Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="currentValue" label="Current Book Value (SGD)"><Input type="number" /></Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  ) : (
                    <Descriptions column={2} labelStyle={{ color: token.colorTextSecondary }}>
                      <Descriptions.Item label="Asset Name">{asset.name}</Descriptions.Item>
                      <Descriptions.Item label="Category"><Tag color={getCategoryColor(asset.category)}>{asset.category}</Tag></Descriptions.Item>
                      <Descriptions.Item label="Sub-Category">{getSubCategory(asset)}</Descriptions.Item>
                      <Descriptions.Item label="Acquisition Date">{asset.purchaseDate}</Descriptions.Item>
                      <Descriptions.Item label="Purchase Cost">{formatCurrency(asset.purchaseValue)}</Descriptions.Item>
                      <Descriptions.Item label="Current Book Value">{formatCurrency(asset.currentValue)}</Descriptions.Item>
                    </Descriptions>
                  )}
                </Card>

                {/* Physical Specifications Card */}
                <Card title="Physical Specifications">
                  <Descriptions column={2} labelStyle={{ color: token.colorTextSecondary }}>
                    <Descriptions.Item label="Dimensions">{physicalSpecs.dimensions}</Descriptions.Item>
                    <Descriptions.Item label="Weight">{physicalSpecs.weight}</Descriptions.Item>
                    <Descriptions.Item label="Power Requirements" span={2}>{physicalSpecs.power}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* Right Column */}
              <Col span={8}>
                {/* Storage & Location Card */}
                <Card
                  title={<Space size={8}><EnvironmentOutlined style={{ color: token.colorPrimary }} />Storage & Location</Space>}
                  style={{ marginBottom: 24 }}
                  extra={
                    isEditingStorage ? (
                      <Space>
                        <Button size="small" onClick={() => { setStorageZone(getStorageDetails(initialAsset).zone); setStorageShelf(getStorageDetails(initialAsset).shelf); setIsEditingStorage(false); }}>Cancel</Button>
                        <Button size="small" type="primary" onClick={() => setIsEditingStorage(false)}>Save</Button>
                      </Space>
                    ) : (
                      <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditingStorage(true)} />
                    )
                  }
                >
                  {isEditingStorage ? (
                    <Form layout="vertical">
                      <Form.Item label="Warehouse Zone">
                        <Input value={storageZone} onChange={e => setStorageZone(e.target.value)} />
                      </Form.Item>
                      <Form.Item label="Shelf Reference">
                        <Input value={storageShelf} onChange={e => setStorageShelf(e.target.value)} />
                      </Form.Item>
                    </Form>
                  ) : (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Warehouse Zone</Text>
                        <Text strong style={{ fontSize: 14 }}>{storageZone}</Text>
                      </div>
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Shelf Reference</Text>
                        <Text strong style={{ fontSize: 14 }}>{storageShelf}</Text>
                      </div>
                    </>
                  )}
                </Card>

                {/* Condition & Maintenance Card */}
                <Card
                  title={<Space size={8}><ToolOutlined style={{ color: token.colorPrimary }} />Condition & Maintenance</Space>}
                  style={{ marginBottom: 24 }}
                  extra={
                    isEditingCondition ? (
                      <Space>
                        <Button size="small" onClick={() => { setEditCondition(initialAsset.condition); setEditNextMaintenance(initialAsset.nextMaintenance || ''); setEditLastMaintenance(initialAsset.lastMaintenance || ''); setIsEditingCondition(false); }}>Cancel</Button>
                        <Button size="small" type="primary" onClick={() => { setAsset({ ...asset, condition: editCondition, nextMaintenance: editNextMaintenance, lastMaintenance: editLastMaintenance }); setIsEditingCondition(false); }}>Save</Button>
                      </Space>
                    ) : (
                      <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditingCondition(true)} />
                    )
                  }
                >
                  {isEditingCondition ? (
                    <Form layout="vertical">
                      <Form.Item label="Current Condition">
                        <Select value={editCondition} onChange={val => setEditCondition(val)}>
                          <Option value="Excellent">Excellent</Option>
                          <Option value="Good">Good</Option>
                          <Option value="Fair">Fair</Option>
                          <Option value="Requires Maintenance">Requires Maintenance</Option>
                          <Option value="Retired">Retired</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item label="Next Maintenance Date">
                        <Input type="date" value={editNextMaintenance} onChange={e => setEditNextMaintenance(e.target.value)} />
                      </Form.Item>
                      <Form.Item label="Last Maintenance Date">
                        <Input type="date" value={editLastMaintenance} onChange={e => setEditLastMaintenance(e.target.value)} />
                      </Form.Item>
                    </Form>
                  ) : (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Current Condition</Text>
                        <Tag color={getConditionColor(asset.condition)} style={{ fontSize: 13 }}>{asset.condition}</Tag>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Next Maintenance Date</Text>
                        <Text strong style={{ fontSize: 14 }}>
                          {asset.nextMaintenance ? (
                            <Space size={4}>
                              <CalendarOutlined />
                              {asset.nextMaintenance}
                              {new Date(asset.nextMaintenance) <= new Date() && <Tag color="error" style={{ marginLeft: 8 }}>Overdue</Tag>}
                            </Space>
                          ) : 'N/A'}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Last Maintenance Date</Text>
                        <Text strong style={{ fontSize: 14 }}>{asset.lastMaintenance || 'N/A'}</Text>
                      </div>
                    </>
                  )}
                </Card>

                {/* AI Maintenance Recommendation Card */}
                {(() => {
                  // Compute days since last maintenance
                  const lastMaintDate = asset.lastMaintenance || asset.lastMaintenanceDate;
                  const daysSinceMaintenance = lastMaintDate
                    ? Math.floor((new Date().getTime() - new Date(lastMaintDate).getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                  const utilisation = asset.utilisationRate || 0;
                  const condition = asset.condition || 'Unknown';

                  // Upcoming bookings for this asset (future or current)
                  const today = new Date();
                  const upcomingBookings = assetBookings
                    .filter(b => new Date(b.endDate) >= today && b.status !== 'returned')
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

                  // Determine urgency
                  let urgency: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
                  let urgencyColor = 'green';
                  if (condition === 'Requires Maintenance' || (daysSinceMaintenance !== null && daysSinceMaintenance > 120)) {
                    urgency = 'Critical';
                    urgencyColor = 'red';
                  } else if ((daysSinceMaintenance !== null && daysSinceMaintenance > 90) || utilisation > 85) {
                    urgency = 'High';
                    urgencyColor = 'orange';
                  } else if ((daysSinceMaintenance !== null && daysSinceMaintenance > 60) || utilisation > 70) {
                    urgency = 'Medium';
                    urgencyColor = 'gold';
                  }

                  // Build AI reasoning text
                  let reasoningText = '';
                  if (urgency === 'Critical' || urgency === 'High') {
                    reasoningText = `This asset has been in continuous use with ${utilisation}% utilisation and was last serviced ${daysSinceMaintenance ?? 'N/A'} days ago. `;
                    if (upcomingBookings.length > 0) {
                      reasoningText += `With ${upcomingBookings.length} upcoming deployment${upcomingBookings.length > 1 ? 's' : ''}, recommend servicing during the next available gap. `;
                    } else {
                      reasoningText += `No upcoming deployments — schedule maintenance at the earliest opportunity. `;
                    }
                    if (condition === 'Requires Maintenance') {
                      reasoningText += `Asset is flagged as requiring maintenance and should be serviced before next deployment.`;
                    } else {
                      reasoningText += `Proactive servicing will prevent potential failures during high-profile events.`;
                    }
                  } else if (urgency === 'Medium') {
                    reasoningText = `Asset is in ${condition.toLowerCase()} condition with ${utilisation}% utilisation. Last serviced ${daysSinceMaintenance ?? 'N/A'} days ago. `;
                    reasoningText += `Maintenance is not urgent but should be planned within the next 30 days to maintain reliability. `;
                    reasoningText += upcomingBookings.length > 0
                      ? `Consider scheduling around the ${upcomingBookings.length} upcoming booking${upcomingBookings.length > 1 ? 's' : ''}.`
                      : `No upcoming bookings — good window for preventive maintenance.`;
                  } else {
                    reasoningText = `Asset is in ${condition.toLowerCase()} condition with recent maintenance ${daysSinceMaintenance ?? 'N/A'} days ago. No immediate service required. `;
                    const nextServiceDate = new Date();
                    nextServiceDate.setDate(nextServiceDate.getDate() + (180 - (daysSinceMaintenance || 0)));
                    const nextServiceStr = nextServiceDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    reasoningText += `Next recommended service: ${nextServiceStr}.`;
                  }

                  // Find suggested maintenance window — next gap of 3+ days between bookings
                  let suggestedWindow = 'No bookings — available immediately';
                  const allFutureBookings = assetBookings
                    .filter(b => new Date(b.endDate) >= today)
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

                  if (allFutureBookings.length > 0) {
                    // Check gap from today to first booking
                    const firstStart = new Date(allFutureBookings[0].startDate);
                    const gapFromToday = Math.floor((firstStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (gapFromToday >= 3) {
                      const windowStart = new Date(today);
                      windowStart.setDate(windowStart.getDate() + 1);
                      const windowEnd = new Date(firstStart);
                      windowEnd.setDate(windowEnd.getDate() - 1);
                      suggestedWindow = `${windowStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${windowEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (${gapFromToday} days)`;
                    } else {
                      // Check gaps between consecutive bookings
                      let found = false;
                      for (let i = 0; i < allFutureBookings.length - 1; i++) {
                        const endCurrent = new Date(allFutureBookings[i].endDate);
                        const startNext = new Date(allFutureBookings[i + 1].startDate);
                        const gap = Math.floor((startNext.getTime() - endCurrent.getTime()) / (1000 * 60 * 60 * 24));
                        if (gap >= 3) {
                          const wStart = new Date(endCurrent);
                          wStart.setDate(wStart.getDate() + 1);
                          const wEnd = new Date(startNext);
                          wEnd.setDate(wEnd.getDate() - 1);
                          suggestedWindow = `${wStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${wEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (${gap} days)`;
                          found = true;
                          break;
                        }
                      }
                      if (!found) {
                        const lastEnd = new Date(allFutureBookings[allFutureBookings.length - 1].endDate);
                        const wStart = new Date(lastEnd);
                        wStart.setDate(wStart.getDate() + 1);
                        const wEnd = new Date(lastEnd);
                        wEnd.setDate(wEnd.getDate() + 4);
                        suggestedWindow = `${wStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${wEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (after all current bookings)`;
                      }
                    }
                  }

                  return (
                    <Card
                      title={<Space size={8}><RobotOutlined style={{ color: token.colorPrimary }} />AI Maintenance Insight</Space>}
                    >
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Urgency</Text>
                        <Tag color={urgencyColor} style={{ fontSize: 13, padding: '2px 12px' }}>{urgency}</Tag>
                      </div>

                      <div style={{ marginBottom: 16, padding: 12, background: token.colorFillAlter, borderRadius: 8 }}>
                        <Space align="start" size={8}>
                          <BulbOutlined style={{ color: token.colorWarning, fontSize: 16, marginTop: 2 }} />
                          <Text style={{ fontSize: 13, lineHeight: '1.6' }}>{reasoningText}</Text>
                        </Space>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Suggested Maintenance Window</Text>
                        <Space size={4}>
                          <CalendarOutlined />
                          <Text strong style={{ fontSize: 13 }}>{suggestedWindow}</Text>
                        </Space>
                      </div>

                      <Button
                        type="primary"
                        icon={<ToolOutlined />}
                        block
                        onClick={() => message.success('Maintenance scheduled successfully. Calendar invite sent to the service team.')}
                      >
                        Schedule Maintenance
                      </Button>
                    </Card>
                  );
                })()}

              </Col>
            </Row>
          )
        },
        {
          key: 'service',
          label: 'Service History',
          children: (
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Card title="Service History" style={{ marginBottom: 24 }}>
                  <Table columns={serviceColumns} dataSource={serviceHistory} pagination={false} rowKey="id" />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Maintenance Timeline">
                  <Timeline
                    items={serviceHistory.map(sh => ({
                      color: sh.type === 'Repair' ? 'red' : sh.type === 'Calibration' ? 'green' : 'blue',
                      children: (
                        <>
                          <Text strong style={{ display: 'block' }}>{sh.type}: {sh.description.length > 50 ? sh.description.substring(0, 50) + '...' : sh.description}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>{sh.date} — {sh.technician} — {formatCurrency(sh.cost)}</Text>
                        </>
                      )
                    }))}
                  />
                </Card>
              </Col>
            </Row>
          )
        },
        {
          key: 'bookings',
          label: 'Bookings',
          children: (
            <div>
              <Card title="Booking History">
                <Table columns={bookingTabColumns} dataSource={assetBookings} pagination={false} rowKey="id" size="small" />
              </Card>
            </div>
          )
        }
      ]} />

      {/* Side Trigger Pane */}
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

      {/* Notes Drawer */}
      <Drawer title="Notes" placement="right" onClose={() => setActiveDrawer(null)} open={activeDrawer === 'notes'} width={400}>
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
          </div>
          <div style={{ marginTop: 'auto' }}>
            <TextArea rows={3} placeholder="Add a new note..." value={newNote} onChange={e => setNewNote(e.target.value)} style={{ marginBottom: 8 }} />
            <Button type="primary" block onClick={() => { if (newNote.trim()) { setNotes([...notes, { id: Date.now(), text: newNote, date: 'Just now' }]); setNewNote(''); } }}>Add Note</Button>
          </div>
        </div>
      </Drawer>

      {/* Documents Drawer */}
      <Drawer title="Documents" placement="right" onClose={() => setActiveDrawer(null)} open={activeDrawer === 'documents'} width={400}>
        <div style={{ marginBottom: 16 }}>
          <Button type="dashed" block icon={<PlusOutlined />} style={{ height: 60 }}>Upload Document</Button>
        </div>
        <List
          itemLayout="horizontal"
          dataSource={[
            { id: 1, name: `${asset.name} — User Manual.pdf`, date: '2025-01-15', size: '4.2 MB' },
            { id: 2, name: 'Warranty Certificate.pdf', date: '2024-06-01', size: '1.1 MB' },
            { id: 3, name: 'Calibration Report 2025.pdf', date: '2025-12-10', size: '2.8 MB' },
            { id: 4, name: 'Insurance Schedule.pdf', date: '2026-01-05', size: '680 KB' },
          ]}
          renderItem={item => (
            <List.Item
              style={{ padding: '12px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}
              actions={[<Button type="text" size="small" danger icon={<DeleteOutlined />} />]}
            >
              <List.Item.Meta
                avatar={<FilePdfOutlined style={{ fontSize: 24, color: token.colorError }} />}
                title={<a href="#">{item.name}</a>}
                description={<Text type="secondary" style={{ fontSize: 11 }}>{item.date} — {item.size}</Text>}
              />
            </List.Item>
          )}
        />
      </Drawer>

      {/* Check-Out Drawer */}
      <Drawer
        title="Check Out Asset"
        placement="right"
        onClose={() => setActiveDrawer(null)}
        open={activeDrawer === 'checkout'}
        width={420}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setActiveDrawer(null)}>Cancel</Button>
              <Button type="primary" onClick={handleCheckOut} disabled={!checkOutPerson.trim()}>Confirm Check Out</Button>
            </Space>
          </div>
        }
      >
        {confirmedBooking && (
          <Form layout="vertical">
            <Form.Item label="Project">
              <Input value={confirmedBooking.projectName} disabled />
            </Form.Item>
            <Form.Item label="Booking Period">
              <Input value={`${confirmedBooking.startDate} to ${confirmedBooking.endDate}`} disabled />
            </Form.Item>
            <Form.Item label="Checked Out By" required>
              <Input placeholder="Enter name" value={checkOutPerson} onChange={e => setCheckOutPerson(e.target.value)} />
            </Form.Item>
            <Form.Item label="Condition at Check-Out">
              <Select value={checkOutCondition} onChange={val => setCheckOutCondition(val)}>
                <Option value="Excellent">Excellent</Option>
                <Option value="Good">Good</Option>
                <Option value="Fair">Fair</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Notes">
              <TextArea rows={3} placeholder="Any notes about the check-out..." value={checkOutNotes} onChange={e => setCheckOutNotes(e.target.value)} />
            </Form.Item>
          </Form>
        )}
      </Drawer>

      {/* Check-In Drawer */}
      <Drawer
        title="Check In Asset"
        placement="right"
        onClose={() => setActiveDrawer(null)}
        open={activeDrawer === 'checkin'}
        width={420}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setActiveDrawer(null)}>Cancel</Button>
              <Button type="primary" onClick={handleCheckIn}>Confirm Check In</Button>
            </Space>
          </div>
        }
      >
        {checkedOutBooking && (
          <Form layout="vertical">
            <Form.Item label="Project">
              <Input value={checkedOutBooking.projectName} disabled />
            </Form.Item>
            <Form.Item label="Checked Out By">
              <Input value={checkedOutBooking.checkedOutBy} disabled />
            </Form.Item>
            <Form.Item label="Condition at Return">
              <Select value={checkInCondition} onChange={val => setCheckInCondition(val)}>
                <Option value="Excellent">Excellent</Option>
                <Option value="Good">Good</Option>
                <Option value="Fair">Fair</Option>
                <Option value="Requires Maintenance">Requires Maintenance</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Notes">
              <TextArea rows={3} placeholder="Any notes about the return condition..." value={checkInNotes} onChange={e => setCheckInNotes(e.target.value)} />
            </Form.Item>
            <Form.Item>
              <Checkbox checked={checkInDamageReported} onChange={e => setCheckInDamageReported(e.target.checked)}>
                Damage Reported
              </Checkbox>
            </Form.Item>
            {checkInDamageReported && (
              <Form.Item label="Damage Description">
                <TextArea rows={3} placeholder="Describe the damage..." value={checkInDamageDescription} onChange={e => setCheckInDamageDescription(e.target.value)} />
              </Form.Item>
            )}
          </Form>
        )}
      </Drawer>
    </div>
  );
};
