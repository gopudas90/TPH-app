// @ts-nocheck
import React, { useState } from 'react';
import { Typography, Card, Tabs, Button, Descriptions, Tag, Divider, Row, Col, Table, Space, Avatar, Timeline, theme, Statistic, List, Input, Select, Tooltip, Drawer, Form, Popconfirm } from 'antd';
import { ArrowLeftOutlined, EditOutlined, PhoneOutlined, MailOutlined, WhatsAppOutlined, CheckCircleOutlined, UserOutlined, FileTextOutlined, DollarOutlined, FormOutlined, FolderOpenOutlined, DeleteOutlined, PlusOutlined, SaveOutlined, CloseOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CUSTOMERS, MOCK_DEALS } from '../data/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [activeTab, setActiveTab] = useState('profile');
  const [activeDrawer, setActiveDrawer] = useState<'notes' | 'documents' | null>(null);

  const initialCustomer = MOCK_CUSTOMERS.find(c => c.id === id);
  
  if (!initialCustomer) {
    return <div style={{ padding: 24 }}>Customer not found</div>;
  }

  // State for editing
  const [customer, setCustomer] = useState(initialCustomer);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  
  // Contacts State
  const [contacts, setContacts] = useState(initialCustomer.contacts.map((c, i) => ({ ...c, id: i.toString() })));
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactForm] = Form.useForm();

  // Notes State
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([
    { id: 1, text: 'Client prefers to be contacted via email.', date: '10 Mar 2026, 10:00 AM' },
    { id: 2, text: 'Budget might be slightly flexible if we include AV.', date: '12 Mar 2026, 02:30 PM' }
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  const relatedDeals = MOCK_DEALS.filter(d => d.client === customer.name);

  const getTierColor = (tier: string) => {
    if (tier === 'Platinum') return 'purple';
    if (tier === 'Gold') return 'gold';
    if (tier === 'Silver') return 'blue';
    return 'default';
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email': return <MailOutlined />;
      case 'whatsapp': return <WhatsAppOutlined />;
      case 'phone': return <PhoneOutlined />;
      default: return null;
    }
  };

  const dealColumns = [
    { title: 'Deal Name', dataIndex: 'name', key: 'name', render: (text: string, record: any) => <a onClick={() => navigate(`/deal/${record.id}`)}>{text}</a> },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Value', dataIndex: 'value', key: 'value', render: (val: number) => formatCurrency(val) },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Status', dataIndex: 'stageId', key: 'status', render: (val: string) => {
      if (val === '8') return <Tag color="success">Won</Tag>;
      if (val === '9') return <Tag color="error">Lost</Tag>;
      return <Tag color="processing">In Progress</Tag>;
    }},
  ];

  const handleSaveContact = async (id: string) => {
    try {
      const row = await contactForm.validateFields();
      const newData = [...contacts];
      const index = newData.findIndex((item) => id === item.id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
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

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const contactColumns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text: string, record: any) => {
        if (editingContactId === record.id) {
          return (
            <Form.Item name="name" style={{ margin: 0 }} rules={[{ required: true, message: 'Required' }]}>
              <Input size="small" />
            </Form.Item>
          );
        }
        return <Text strong>{text}</Text>;
      }
    },
    { 
      title: 'Role', 
      dataIndex: 'role', 
      key: 'role',
      render: (text: string, record: any) => {
        if (editingContactId === record.id) {
          return (
            <Form.Item name="role" style={{ margin: 0 }}>
              <Input size="small" />
            </Form.Item>
          );
        }
        return text;
      }
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email', 
      render: (text: string, record: any) => {
        if (editingContactId === record.id) {
          return (
            <Form.Item name="email" style={{ margin: 0 }}>
              <Input size="small" />
            </Form.Item>
          );
        }
        return <a href={`mailto:${text}`}>{text}</a>;
      }
    },
    { 
      title: 'Phone', 
      dataIndex: 'phone', 
      key: 'phone',
      render: (text: string, record: any) => {
        if (editingContactId === record.id) {
          return (
            <Form.Item name="phone" style={{ margin: 0 }}>
              <Input size="small" />
            </Form.Item>
          );
        }
        return text;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => {
        const editable = editingContactId === record.id;
        return editable ? (
          <Space size="small">
            <Button type="link" size="small" onClick={() => handleSaveContact(record.id)} icon={<SaveOutlined />} />
            <Button type="link" size="small" onClick={() => setEditingContactId(null)} icon={<CloseOutlined />} />
          </Space>
        ) : (
          <Space size="small">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => {
              contactForm.setFieldsValue({ ...record });
              setEditingContactId(record.id);
            }} />
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteContact(record.id)}>
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const deleteItem = (list: any[], setList: (list: any[]) => void, id: number | string) => {
    setList(list.filter(item => item.id !== id));
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')} />
        <div>
          <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            {customer.name}
            <Tag color={getTierColor(customer.tier)} style={{ margin: 0 }}>{customer.tier}</Tag>
          </Title>
          <Text type="secondary">{customer.industry} • Account Manager: {customer.accountManager}</Text>
        </div>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="Total Lifetime Revenue" value={customer.totalRevenue} prefix={<DollarOutlined />} styles={{ content: { color: token.colorPrimary } }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="Events Produced" value={customer.eventsProduced} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="NPS Score" value={customer.npsScore} suffix="/ 10" styles={{ content: { color: customer.npsScore >= 8 ? token.colorSuccess : token.colorWarning } }} />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'profile',
          label: 'Client Profile',
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
                    <Form layout="vertical" initialValues={customer} onValuesChange={(_, allValues) => setCustomer({ ...customer, ...allValues })}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="name" label="Company Name">
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="industry" label="Industry">
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="companySize" label="Company Size">
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="tier" label="Tier">
                            <Select>
                              <Option value="Platinum">Platinum</Option>
                              <Option value="Gold">Gold</Option>
                              <Option value="Silver">Silver</Option>
                              <Option value="New">New</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item name="address" label="Registered Address">
                            <TextArea rows={2} />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item name="billingDetails" label="Billing Details">
                            <TextArea rows={2} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  ) : (
                    <Descriptions column={2} labelStyle={{ color: token.colorTextSecondary }}>
                      <Descriptions.Item label="Company Name">{customer.name}</Descriptions.Item>
                      <Descriptions.Item label="Industry">{customer.industry}</Descriptions.Item>
                      <Descriptions.Item label="Company Size">{customer.companySize}</Descriptions.Item>
                      <Descriptions.Item label="Tier">{customer.tier}</Descriptions.Item>
                      <Descriptions.Item label="Registered Address" span={2}>{customer.address}</Descriptions.Item>
                      <Descriptions.Item label="Billing Details" span={2}>{customer.billingDetails}</Descriptions.Item>
                    </Descriptions>
                  )}
                </Card>

                <Card 
                  title="Contacts" 
                  extra={
                    <Button type="link" icon={<PlusOutlined />} size="small" onClick={() => {
                      const newId = Date.now().toString();
                      contactForm.resetFields();
                      setContacts([...contacts, { id: newId, name: '', role: '', email: '', phone: '' }]);
                      setEditingContactId(newId);
                    }}>
                      Add Contact
                    </Button>
                  }
                >
                  <Form form={contactForm} component={false}>
                    <Table 
                      columns={contactColumns} 
                      dataSource={contacts} 
                      pagination={false} 
                      rowKey="id" 
                      size="small" 
                    />
                  </Form>
                </Card>
              </Col>
              
              <Col span={8}>
                <Card 
                  title="Preferences & Settings" 
                  style={{ marginBottom: 24 }}
                  extra={
                    isEditingPreferences ? (
                      <Space>
                        <Button size="small" onClick={() => setIsEditingPreferences(false)}>Cancel</Button>
                        <Button size="small" type="primary" onClick={() => setIsEditingPreferences(false)}>Save</Button>
                      </Space>
                    ) : (
                      <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditingPreferences(true)} />
                    )
                  }
                >
                  {isEditingPreferences ? (
                    <Form layout="vertical" initialValues={customer} onValuesChange={(_, allValues) => setCustomer({ ...customer, ...allValues })}>
                      <Form.Item name="preferredChannel" label="Preferred Communication">
                        <Select>
                          <Option value="email">Email</Option>
                          <Option value="phone">Phone</Option>
                          <Option value="whatsapp">WhatsApp</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="preferences" label="Known Preferences">
                        <TextArea rows={4} />
                      </Form.Item>
                    </Form>
                  ) : (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Preferred Communication</Text>
                        <Space>
                          {getChannelIcon(customer.preferredChannel)}
                          <Text style={{ textTransform: 'capitalize' }}>{customer.preferredChannel}</Text>
                        </Space>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Known Preferences</Text>
                        <Text>{customer.preferences}</Text>
                      </div>
                    </>
                  )}
                </Card>
              </Col>
            </Row>
          )
        },
        {
          key: 'history',
          label: 'Engagement History',
          children: (
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Card title="Linked Deals & Projects" style={{ marginBottom: 24 }}>
                  <Table columns={dealColumns} dataSource={relatedDeals} pagination={false} rowKey="id" />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Interaction Timeline">
                  <Timeline
                    items={[
                      {
                        color: 'green',
                        children: (
                          <>
                            <Text strong style={{ display: 'block' }}>Contract Signed</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>2026-03-15 • Summer Roadshow</Text>
                          </>
                        ),
                      },
                      {
                        color: 'blue',
                        children: (
                          <>
                            <Text strong style={{ display: 'block' }}>Email: Proposal Sent</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>2026-03-10 • Sent by Sarah Jenkins</Text>
                          </>
                        ),
                      },
                      {
                        color: 'blue',
                        children: (
                          <>
                            <Text strong style={{ display: 'block' }}>Discovery Call</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>2026-03-05 • Discussed Q3 requirements</Text>
                          </>
                        ),
                      },
                      {
                        color: 'gray',
                        children: (
                          <>
                            <Text strong style={{ display: 'block' }}>Project Completed</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>2025-12-20 • Holiday Gala 2025</Text>
                          </>
                        ),
                      }
                    ]}
                  />
                </Card>
              </Col>
            </Row>
          )
        }
      ]} />

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
          </div>
          <div style={{ marginTop: 'auto' }}>
            <TextArea 
              rows={3} 
              placeholder="Add a new note..." 
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <Button 
              type="primary" 
              block 
              onClick={() => {
                if (newNote.trim()) {
                  setNotes([...notes, { id: Date.now(), text: newNote, date: 'Just now' }]);
                  setNewNote('');
                }
              }}
            >
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
        width={400}
      >
        <div style={{ marginBottom: 16 }}>
          <Button type="dashed" block icon={<PlusOutlined />} style={{ height: 60 }}>
            Upload Document
          </Button>
        </div>
        <List
          itemLayout="horizontal"
          dataSource={[
            { id: 1, name: 'KYC_Document_2025.pdf', date: '2025-01-15', size: '2.4 MB' },
            { id: 2, name: 'Master_Service_Agreement.pdf', date: '2025-02-01', size: '1.1 MB' },
            { id: 3, name: 'Vendor_Onboarding_Form.pdf', date: '2025-01-20', size: '850 KB' }
          ]}
          renderItem={item => (
            <List.Item 
              style={{ padding: '12px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}
              actions={[
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              ]}
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
