// @ts-nocheck
import React, { useState } from 'react';
import { Typography, Card, Tabs, Button, Descriptions, Tag, Row, Col, Table, Space, Avatar, theme, Statistic, Input, Select, Tooltip, Drawer, Form, List, Rate, Timeline, Progress } from 'antd';
import { ArrowLeftOutlined, EditOutlined, PhoneOutlined, MailOutlined, GlobalOutlined, ShopOutlined, DollarOutlined, FormOutlined, FolderOpenOutlined, DeleteOutlined, PlusOutlined, SafetyCertificateOutlined, StarOutlined, ClockCircleOutlined, WarningOutlined, CheckCircleOutlined, CloseOutlined, SaveOutlined, FilePdfOutlined, StarFilled, StopOutlined, RobotOutlined, BulbOutlined, CalendarOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PARTNERS } from '../data/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const PartnerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [activeTab, setActiveTab] = useState('profile');
  const [activeDrawer, setActiveDrawer] = useState<'notes' | 'documents' | null>(null);

  const initialPartner = MOCK_PARTNERS.find(p => p.id === id);

  if (!initialPartner) {
    return <div style={{ padding: 24 }}>Partner not found</div>;
  }

  const [partner, setPartner] = useState(initialPartner);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [serviceCategories, setServiceCategories] = useState(initialPartner.serviceCategories);
  const [specialisations, setSpecialisations] = useState(initialPartner.specialisations);
  const [newCategory, setNewCategory] = useState('');
  const [newSpec, setNewSpec] = useState('');
  const [isEditingCompliance, setIsEditingCompliance] = useState(false);
  const [certificationsList, setCertificationsList] = useState(initialPartner.certifications);
  const [complianceDocs, setComplianceDocs] = useState(initialPartner.complianceDocuments);
  const [newCert, setNewCert] = useState('');
  const [newDoc, setNewDoc] = useState('');

  // Contacts State
  const [contacts, setContacts] = useState(initialPartner.contacts.map((c, i) => ({ ...c, id: i.toString() })));
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactForm] = Form.useForm();

  // Notes State
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([
    { id: 1, text: 'Reliable partner. Always delivers on time with high quality.', date: '10 Mar 2026, 10:00 AM' },
    { id: 2, text: 'Negotiated 10% volume discount for Q2 2026 projects.', date: '01 Mar 2026, 04:30 PM' }
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  const deleteItem = (list: any[], setList: (list: any[]) => void, id: number | string) => {
    setList(list.filter(item => item.id !== id));
  };

  const handleSaveContact = async (id: string) => {
    try {
      const row = await contactForm.validateFields();
      const newData = [...contacts];
      const index = newData.findIndex((item) => id === item.id);
      if (index > -1) {
        newData.splice(index, 1, { ...newData[index], ...row });
        setContacts(newData);
        setEditingContactId(null);
      } else {
        newData.push({ ...row, id: Date.now().toString() });
        setContacts(newData);
        setEditingContactId(null);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const contactColumns = [
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: (text: string, record: any) => {
        if (editingContactId === record.id) return <Form.Item name="name" style={{ margin: 0 }} rules={[{ required: true }]}><Input size="small" /></Form.Item>;
        return <Text strong>{text}</Text>;
      }
    },
    {
      title: 'Role', dataIndex: 'role', key: 'role',
      render: (text: string, record: any) => {
        if (editingContactId === record.id) return <Form.Item name="role" style={{ margin: 0 }}><Input size="small" /></Form.Item>;
        return text;
      }
    },
    {
      title: 'Email', dataIndex: 'email', key: 'email',
      render: (text: string, record: any) => {
        if (editingContactId === record.id) return <Form.Item name="email" style={{ margin: 0 }}><Input size="small" /></Form.Item>;
        return <a href={`mailto:${text}`}>{text}</a>;
      }
    },
    {
      title: 'Phone', dataIndex: 'phone', key: 'phone',
      render: (text: string, record: any) => {
        if (editingContactId === record.id) return <Form.Item name="phone" style={{ margin: 0 }}><Input size="small" /></Form.Item>;
        return text;
      }
    },
    {
      title: 'Action', key: 'action',
      render: (_: any, record: any) => {
        const editable = editingContactId === record.id;
        return editable ? (
          <Space size="small">
            <Button type="link" size="small" onClick={() => handleSaveContact(record.id)} icon={<SaveOutlined />} />
            <Button type="link" size="small" onClick={() => setEditingContactId(null)} icon={<CloseOutlined />} />
          </Space>
        ) : (
          <Space size="small">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { contactForm.setFieldsValue({ ...record }); setEditingContactId(record.id); }} />
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => setContacts(contacts.filter(c => c.id !== record.id))} />
          </Space>
        );
      }
    },
  ];

  // Mock engagement history
  const engagementHistory = [
    { id: 'ENG-001', project: 'Tech Summit 2026', role: partner.serviceCategories[0], date: '2026-03-10', rating: 5, status: 'Completed', amount: 18500 },
    { id: 'ENG-002', project: 'Summer Roadshow', role: partner.serviceCategories[0], date: '2026-02-15', rating: 4, status: 'Completed', amount: 32000 },
    { id: 'ENG-003', project: 'Holiday Gala 2025', role: partner.serviceCategories[0], date: '2025-12-20', rating: 5, status: 'Completed', amount: 24500 },
    { id: 'ENG-004', project: 'Spring Fashion Show', role: partner.serviceCategories[0], date: '2026-03-14', rating: null, status: 'In Progress', amount: 28000 },
  ];

  const engagementColumns = [
    { title: 'Project', dataIndex: 'project', key: 'project', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Rating', dataIndex: 'rating', key: 'rating',
      render: (val: number | null) => val ? <Rate disabled defaultValue={val} style={{ fontSize: 13 }} /> : <Tag>Pending</Tag>
    },
    {
      title: 'Amount', dataIndex: 'amount', key: 'amount',
      render: (val: number) => formatCurrency(val)
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (val: string) => {
        if (val === 'Completed') return <Tag color="success">Completed</Tag>;
        if (val === 'In Progress') return <Tag color="processing">In Progress</Tag>;
        return <Tag>{val}</Tag>;
      }
    },
  ];

  // Mock payment history
  const paymentHistory = [
    { id: 'PAY-001', invoice: 'INV-2026-0312', project: 'Tech Summit 2026', amount: 18500, date: '2026-03-15', status: 'Paid' },
    { id: 'PAY-002', invoice: 'INV-2026-0218', project: 'Summer Roadshow', amount: 32000, date: '2026-02-28', status: 'Paid' },
    { id: 'PAY-003', invoice: 'INV-2026-0315', project: 'Spring Fashion Show', amount: 28000, date: '2026-03-20', status: 'Pending' },
  ];

  const paymentColumns = [
    { title: 'Invoice', dataIndex: 'invoice', key: 'invoice', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Project', dataIndex: 'project', key: 'project' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (val: number) => formatCurrency(val) },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (val: string) => val === 'Paid' ? <Tag color="success">Paid</Tag> : <Tag color="warning">Pending</Tag>
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/partners')} />
        <Avatar size={48} style={{ backgroundColor: partner.isBlacklisted ? token.colorError : token.colorPrimary }} icon={<ShopOutlined />} />
        <div>
          <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            {partner.name}
            {partner.isPreferred && <Tag color="gold"><StarFilled /> Preferred</Tag>}
            {partner.isBlacklisted && <Tag color="error"><StopOutlined /> Blacklisted</Tag>}
          </Title>
          <Text type="secondary">{partner.serviceCategories.join(' • ')}{partner.uen ? ` • UEN: ${partner.uen}` : ''}</Text>
        </div>
      </div>

      {partner.isBlacklisted && partner.blacklistReason && (
        <Card style={{ marginBottom: 24, borderColor: token.colorError }} styles={{ body: { padding: '12px 20px' } }}>
          <Space>
            <WarningOutlined style={{ color: token.colorError, fontSize: 16 }} />
            <Text type="danger"><Text strong type="danger">Blacklisted:</Text> {partner.blacklistReason}</Text>
          </Space>
        </Card>
      )}

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="Total Spend" value={partner.totalSpend} prefix={<DollarOutlined />} styles={{ content: { color: token.colorPrimary } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="Engagements" value={partner.engagements} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '20px' } }}>
            <div>
              <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>Quality Rating</Text>
              <Rate disabled defaultValue={partner.avgRating} allowHalf style={{ fontSize: 18 }} />
              <Text strong style={{ marginLeft: 8 }}>{partner.avgRating}</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="On-Time Rate" value={partner.onTimeRate} suffix="%" prefix={<ClockCircleOutlined />} styles={{ content: { color: partner.onTimeRate >= 90 ? token.colorSuccess : token.colorWarning } }} />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'profile',
          label: 'Partner Profile',
          children: (
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Card
                  title="Company Information"
                  style={{ marginBottom: 24 }}
                  extra={
                    isEditingCompany ? (
                      <Space>
                        <Button size="small" onClick={() => setIsEditingCompany(false)}>Cancel</Button>
                        <Button size="small" type="primary" onClick={() => setIsEditingCompany(false)}>Save</Button>
                      </Space>
                    ) : (
                      <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditingCompany(true)} />
                    )
                  }
                >
                  {isEditingCompany ? (
                    <Form layout="vertical" initialValues={partner} onValuesChange={(_, allValues) => setPartner({ ...partner, ...allValues })}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="name" label="Company Name"><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="uen" label="UEN"><Input /></Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item name="address" label="Address"><TextArea rows={2} /></Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="website" label="Website"><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="isPreferred" label="Preferred Partner">
                            <Select>
                              <Option value={true}>Yes</Option>
                              <Option value={false}>No</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  ) : (
                    <Descriptions column={2} labelStyle={{ color: token.colorTextSecondary }}>
                      <Descriptions.Item label="Company Name">{partner.name}</Descriptions.Item>
                      <Descriptions.Item label="UEN">{partner.uen}</Descriptions.Item>
                      <Descriptions.Item label="Address" span={2}>{partner.address}</Descriptions.Item>
                      <Descriptions.Item label="Website">
                        {partner.website ? <a href={partner.website} target="_blank" rel="noopener noreferrer"><GlobalOutlined style={{ marginRight: 4 }} />{partner.website}</a> : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Insurance">
                        {partner.insurance ? <Tag color="success">Insured (exp: {partner.insuranceExpiry})</Tag> : <Tag color="error">Not Insured</Tag>}
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                </Card>

                <Card
                  title="Key Contacts"
                  style={{ marginBottom: 24 }}
                  extra={
                    <Button type="link" icon={<PlusOutlined />} size="small" onClick={() => {
                      const newId = Date.now().toString();
                      contactForm.resetFields();
                      setContacts([...contacts, { id: newId, name: '', role: '', email: '', phone: '' }]);
                      setEditingContactId(newId);
                    }}>Add Contact</Button>
                  }
                >
                  <Form form={contactForm} component={false}>
                    <Table columns={contactColumns} dataSource={contacts} pagination={false} rowKey="id" size="small" />
                  </Form>
                </Card>

                <Card
                  title="Services & Specialisations"
                  style={{ marginBottom: 24 }}
                  extra={
                    isEditingServices ? (
                      <Space>
                        <Button size="small" onClick={() => { setServiceCategories(initialPartner.serviceCategories); setSpecialisations(initialPartner.specialisations); setIsEditingServices(false); }}>Cancel</Button>
                        <Button size="small" type="primary" onClick={() => { setPartner({ ...partner, serviceCategories, specialisations }); setIsEditingServices(false); }}>Save</Button>
                      </Space>
                    ) : (
                      <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditingServices(true)} />
                    )
                  }
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Service Categories</Text>
                    <Space size={[8, 8]} wrap>
                      {serviceCategories.map(cat => (
                        <Tag key={cat} color="blue" closable={isEditingServices} onClose={() => setServiceCategories(serviceCategories.filter(c => c !== cat))}>{cat}</Tag>
                      ))}
                      {isEditingServices && (
                        <Space.Compact size="small">
                          <Input placeholder="Add category" value={newCategory} onChange={e => setNewCategory(e.target.value)} onPressEnter={() => { if (newCategory.trim() && !serviceCategories.includes(newCategory.trim())) { setServiceCategories([...serviceCategories, newCategory.trim()]); setNewCategory(''); } }} style={{ width: 140 }} />
                          <Button type="primary" icon={<PlusOutlined />} onClick={() => { if (newCategory.trim() && !serviceCategories.includes(newCategory.trim())) { setServiceCategories([...serviceCategories, newCategory.trim()]); setNewCategory(''); } }} />
                        </Space.Compact>
                      )}
                    </Space>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Specialisations</Text>
                    <Space size={[8, 8]} wrap>
                      {specialisations.map(spec => (
                        <Tag key={spec} color="purple" closable={isEditingServices} onClose={() => setSpecialisations(specialisations.filter(s => s !== spec))}>{spec}</Tag>
                      ))}
                      {isEditingServices && (
                        <Space.Compact size="small">
                          <Input placeholder="Add specialisation" value={newSpec} onChange={e => setNewSpec(e.target.value)} onPressEnter={() => { if (newSpec.trim() && !specialisations.includes(newSpec.trim())) { setSpecialisations([...specialisations, newSpec.trim()]); setNewSpec(''); } }} style={{ width: 160 }} />
                          <Button type="primary" icon={<PlusOutlined />} onClick={() => { if (newSpec.trim() && !specialisations.includes(newSpec.trim())) { setSpecialisations([...specialisations, newSpec.trim()]); setNewSpec(''); } }} />
                        </Space.Compact>
                      )}
                    </Space>
                  </div>
                  {partner.equipment.length > 0 && (
                    <div>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Equipment / Assets</Text>
                      <Space size={[8, 8]} wrap>
                        {partner.equipment.map(eq => <Tag key={eq}>{eq}</Tag>)}
                      </Space>
                    </div>
                  )}
                </Card>
              </Col>

              <Col span={8}>
                {/* AI Health Score */}
                <Card
                  title={<Space size={8}><RobotOutlined style={{ color: token.colorPrimary }} />AI Health Score</Space>}
                  style={{ marginBottom: 24 }}
                >
                  {(() => {
                    const score = partner.healthScore || 0;
                    const color = score >= 80 ? token.colorSuccess : score >= 60 ? token.colorWarning : token.colorError;
                    const label = score >= 80 ? 'Healthy' : score >= 60 ? 'Needs Attention' : 'At Risk';
                    const breakdown = partner.healthScoreBreakdown || {};
                    return (
                      <>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                          <Progress
                            type="dashboard"
                            percent={score}
                            strokeColor={color}
                            format={() => (
                              <div>
                                <div style={{ fontSize: 28, fontWeight: 700, color }}>{score}</div>
                                <div style={{ fontSize: 11, color: token.colorTextSecondary }}>{label}</div>
                              </div>
                            )}
                            size={130}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {[
                            { label: 'Quality Rating', value: breakdown.qualityRating },
                            { label: 'On-Time Delivery', value: breakdown.onTimeDelivery },
                            { label: 'Cost Efficiency', value: breakdown.costEfficiency },
                            { label: 'Responsiveness', value: breakdown.responsiveness },
                          ].map((item) => (
                            <div key={item.label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                                <Text style={{ fontSize: 12, fontWeight: 500 }}>{item.value}%</Text>
                              </div>
                              <Progress
                                percent={item.value}
                                size="small"
                                showInfo={false}
                                strokeColor={item.value >= 80 ? token.colorSuccess : item.value >= 60 ? token.colorWarning : token.colorError}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </Card>

                {/* AI Recommended Actions */}
                <Card
                  title={<Space size={8}><BulbOutlined style={{ color: token.colorPrimary }} />Next Recommended Actions</Space>}
                  style={{ marginBottom: 24 }}
                >
                  <List
                    dataSource={partner.aiRecommendedActions || []}
                    renderItem={(item: any) => {
                      const priorityColor = item.priority === 'High' ? 'red' : item.priority === 'Mid' ? 'orange' : 'green';
                      const typeColor = item.type === 'Outreach' ? 'blue' : item.type === 'Cost Saving' ? 'green' : item.type === 'Strategic' ? 'purple' : item.type === 'Performance' ? 'orange' : item.type === 'Risk Mitigation' ? 'red' : 'cyan';
                      return (
                        <div style={{
                          padding: '12px 14px',
                          marginBottom: 10,
                          borderRadius: 8,
                          border: `1px solid ${token.colorBorderSecondary}`,
                          background: token.colorBgContainer
                        }}>
                          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>{item.action}</Text>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8, lineHeight: 1.5 }}>{item.detail}</Text>
                          <Space size={4}>
                            <Tag color={priorityColor} style={{ fontSize: 11, margin: 0 }}>{item.priority}</Tag>
                            <Tag color={typeColor} style={{ fontSize: 11, margin: 0 }}>{item.type}</Tag>
                            <Tag icon={<CalendarOutlined />} style={{ fontSize: 11, margin: 0 }}>{item.timing}</Tag>
                          </Space>
                        </div>
                      );
                    }}
                    locale={{ emptyText: 'No recommendations at this time.' }}
                  />
                </Card>

                <Card
                  title="Rate Card"
                  style={{ marginBottom: 24 }}
                  extra={
                    isEditingRates ? (
                      <Space>
                        <Button size="small" onClick={() => setIsEditingRates(false)}>Cancel</Button>
                        <Button size="small" type="primary" onClick={() => setIsEditingRates(false)}>Save</Button>
                      </Space>
                    ) : (
                      <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditingRates(true)} />
                    )
                  }
                >
                  {isEditingRates ? (
                    <Form layout="vertical" initialValues={partner.rates} onValuesChange={(_, allValues) => setPartner({ ...partner, rates: { ...partner.rates, ...allValues } })}>
                      <Form.Item name="serviceRate" label="Service Rate (SGD/day)"><Input type="number" /></Form.Item>
                      <Form.Item name="minimumCharge" label="Minimum Charge (SGD)"><Input type="number" /></Form.Item>
                      <Form.Item name="overtimeRate" label="Overtime Rate (SGD/hr)"><Input type="number" /></Form.Item>
                      <Form.Item name="deliveryCharge" label="Delivery Charge (SGD)"><Input type="number" /></Form.Item>
                    </Form>
                  ) : (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Service Rate</Text>
                        <Text strong style={{ fontSize: 16 }}>{formatCurrency(partner.rates.serviceRate)} <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>/ day</Text></Text>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Minimum Charge</Text>
                        <Text strong style={{ fontSize: 16 }}>{formatCurrency(partner.rates.minimumCharge)}</Text>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Overtime Rate</Text>
                        <Text strong style={{ fontSize: 16 }}>{formatCurrency(partner.rates.overtimeRate)} <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>/ hr</Text></Text>
                      </div>
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Delivery Charge</Text>
                        <Text strong style={{ fontSize: 16 }}>{partner.rates.deliveryCharge > 0 ? formatCurrency(partner.rates.deliveryCharge) : 'Included'}</Text>
                      </div>
                    </>
                  )}
                </Card>

                <Card
                  title="Compliance & Certifications"
                  style={{ marginBottom: 24 }}
                  extra={
                    isEditingCompliance ? (
                      <Space>
                        <Button size="small" onClick={() => { setCertificationsList(initialPartner.certifications); setComplianceDocs(initialPartner.complianceDocuments); setIsEditingCompliance(false); }}>Cancel</Button>
                        <Button size="small" type="primary" onClick={() => { setPartner({ ...partner, certifications: certificationsList, complianceDocuments: complianceDocs }); setIsEditingCompliance(false); }}>Save</Button>
                      </Space>
                    ) : (
                      <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditingCompliance(true)} />
                    )
                  }
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Certifications</Text>
                    {certificationsList.length > 0 ? (
                      <Space size={[8, 8]} wrap>
                        {certificationsList.map(cert => (
                          <Tag key={cert} color="green" icon={<SafetyCertificateOutlined />} closable={isEditingCompliance} onClose={() => setCertificationsList(certificationsList.filter(c => c !== cert))}>{cert}</Tag>
                        ))}
                      </Space>
                    ) : (
                      !isEditingCompliance && <Text type="secondary">No certifications on record</Text>
                    )}
                    {isEditingCompliance && (
                      <div style={{ marginTop: 8 }}>
                        <Space.Compact size="small">
                          <Input placeholder="Add certification" value={newCert} onChange={e => setNewCert(e.target.value)} onPressEnter={() => { if (newCert.trim() && !certificationsList.includes(newCert.trim())) { setCertificationsList([...certificationsList, newCert.trim()]); setNewCert(''); } }} style={{ width: 200 }} />
                          <Button type="primary" icon={<PlusOutlined />} onClick={() => { if (newCert.trim() && !certificationsList.includes(newCert.trim())) { setCertificationsList([...certificationsList, newCert.trim()]); setNewCert(''); } }} />
                        </Space.Compact>
                      </div>
                    )}
                  </div>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Compliance Documents</Text>
                    {complianceDocs.length > 0 ? (
                      <Space size={[8, 8]} wrap>
                        {complianceDocs.map(doc => (
                          <Tag key={doc} closable={isEditingCompliance} onClose={() => setComplianceDocs(complianceDocs.filter(d => d !== doc))}>{doc}</Tag>
                        ))}
                      </Space>
                    ) : (
                      !isEditingCompliance && <Text type="secondary">No compliance documents</Text>
                    )}
                    {isEditingCompliance && (
                      <div style={{ marginTop: 8 }}>
                        <Space.Compact size="small">
                          <Input placeholder="Add document type" value={newDoc} onChange={e => setNewDoc(e.target.value)} onPressEnter={() => { if (newDoc.trim() && !complianceDocs.includes(newDoc.trim())) { setComplianceDocs([...complianceDocs, newDoc.trim()]); setNewDoc(''); } }} style={{ width: 200 }} />
                          <Button type="primary" icon={<PlusOutlined />} onClick={() => { if (newDoc.trim() && !complianceDocs.includes(newDoc.trim())) { setComplianceDocs([...complianceDocs, newDoc.trim()]); setNewDoc(''); } }} />
                        </Space.Compact>
                      </div>
                    )}
                  </div>
                </Card>

                <Card title="Performance Summary">
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13 }}>Quality Rating</Text>
                      <Text strong>{partner.avgRating} / 5</Text>
                    </div>
                    <Progress percent={Math.round((partner.avgRating / 5) * 100)} strokeColor={token.colorSuccess} showInfo={false} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13 }}>On-Time Delivery</Text>
                      <Text strong>{partner.onTimeRate}%</Text>
                    </div>
                    <Progress percent={partner.onTimeRate} strokeColor={partner.onTimeRate >= 90 ? token.colorSuccess : token.colorWarning} showInfo={false} />
                  </div>
                </Card>
              </Col>
            </Row>
          )
        },
        {
          key: 'history',
          label: 'Performance History',
          children: (
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Card title="Engagement History" style={{ marginBottom: 24 }}>
                  <Table columns={engagementColumns} dataSource={engagementHistory} pagination={false} rowKey="id" />
                </Card>
                <Card title="Payment History">
                  <Table columns={paymentColumns} dataSource={paymentHistory} pagination={false} rowKey="id" />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Issue & Dispute Log">
                  <Timeline
                    items={partner.isBlacklisted ? [
                      {
                        color: 'red',
                        children: (
                          <>
                            <Text strong style={{ display: 'block' }}>Partner Blacklisted</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>{partner.lastEngagement} • {partner.blacklistReason}</Text>
                          </>
                        )
                      }
                    ] : [
                      {
                        color: 'green',
                        children: (
                          <>
                            <Text strong style={{ display: 'block' }}>No Active Disputes</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>Partner in good standing</Text>
                          </>
                        )
                      },
                      {
                        color: 'blue',
                        children: (
                          <>
                            <Text strong style={{ display: 'block' }}>Minor Delay Resolved</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>2025-11-10 • 30-min late arrival, resolved with apology</Text>
                          </>
                        )
                      }
                    ]}
                  />
                </Card>
              </Col>
            </Row>
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

      {/* Drawers */}
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

      <Drawer title="Documents" placement="right" onClose={() => setActiveDrawer(null)} open={activeDrawer === 'documents'} width={400}>
        <div style={{ marginBottom: 16 }}>
          <Button type="dashed" block icon={<PlusOutlined />} style={{ height: 60 }}>Upload Document</Button>
        </div>
        <List
          itemLayout="horizontal"
          dataSource={[
            { id: 1, name: 'Public_Liability_Insurance.pdf', date: '2025-01-15', size: '2.1 MB' },
            { id: 2, name: 'bizSAFE_Certificate.pdf', date: '2025-03-01', size: '1.4 MB' },
            { id: 3, name: 'Rate_Card_2026.pdf', date: '2026-01-05', size: '680 KB' }
          ]}
          renderItem={item => (
            <List.Item
              style={{ padding: '12px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}
              actions={[<Button type="text" size="small" danger icon={<DeleteOutlined />} />]}
            >
              <List.Item.Meta
                avatar={<FilePdfOutlined style={{ fontSize: 24, color: token.colorError }} />}
                title={<a href="#">{item.name}</a>}
                description={<Text type="secondary" style={{ fontSize: 11 }}>{item.date} • {item.size}</Text>}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
};
