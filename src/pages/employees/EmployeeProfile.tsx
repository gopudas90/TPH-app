// @ts-nocheck
import React, { useState } from 'react';
import { Typography, Card, Tabs, Button, Descriptions, Tag, Row, Col, Table, Space, Avatar, theme, Statistic, Input, Select, Tooltip, Drawer, Form, List } from 'antd';
import { ArrowLeftOutlined, EditOutlined, PhoneOutlined, MailOutlined, WhatsAppOutlined, UserOutlined, DollarOutlined, FormOutlined, FolderOpenOutlined, DeleteOutlined, PlusOutlined, SafetyCertificateOutlined, CalendarOutlined, TeamOutlined, CloseOutlined, SaveOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_EMPLOYEES } from '../../data/mockData';
import { defaultUsers, defaultRoles } from '../../data/rolesData';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [activeTab, setActiveTab] = useState('profile');
  const [activeDrawer, setActiveDrawer] = useState<'notes' | 'documents' | null>(null);

  const initialEmployee = MOCK_EMPLOYEES.find(e => e.id === id);

  if (!initialEmployee) {
    return <div style={{ padding: 24 }}>Employee not found</div>;
  }

  const [employee, setEmployee] = useState(initialEmployee);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skills, setSkills] = useState(initialEmployee.skills);
  const [certifications, setCertifications] = useState(initialEmployee.certifications);
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  // Notes State
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([
    { id: 1, text: 'Excellent performance on the last project. Client gave positive feedback.', date: '10 Mar 2026, 10:00 AM' },
    { id: 2, text: 'Requested training for new LED wall technology.', date: '05 Mar 2026, 03:15 PM' }
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
  };

  const getAvailabilityColor = (status: string) => {
    if (status === 'available') return 'success';
    if (status === 'on-project') return 'processing';
    if (status === 'unavailable') return 'error';
    return 'default';
  };

  const getAvailabilityLabel = (status: string) => {
    if (status === 'available') return 'Available';
    if (status === 'on-project') return 'On Project';
    if (status === 'unavailable') return 'Unavailable';
    return status;
  };

  const getEmploymentTypeColor = (type: string) => {
    if (type === 'Full-time') return 'blue';
    if (type === 'Part-time') return 'orange';
    if (type === 'Freelance') return 'purple';
    return 'default';
  };

  const deleteItem = (list: any[], setList: (list: any[]) => void, id: number | string) => {
    setList(list.filter(item => item.id !== id));
  };

  // Mock project history for this employee
  const projectHistory = [
    { id: 'P-001', name: 'Tech Summit 2025', role: 'Lead Designer', date: '2025-09-15', status: 'Completed' },
    { id: 'P-002', name: 'Holiday Gala 2025', role: employee.designation, date: '2025-12-20', status: 'Completed' },
    { id: 'P-003', name: employee.currentProject || 'N/A', role: employee.designation, date: '2026-06-01', status: employee.currentProject ? 'In Progress' : 'N/A' },
  ].filter(p => p.name !== 'N/A');

  const projectColumns = [
    { title: 'Project', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Status', dataIndex: 'status', key: 'status', render: (val: string) => {
        if (val === 'Completed') return <Tag color="success">Completed</Tag>;
        if (val === 'In Progress') return <Tag color="processing">In Progress</Tag>;
        return <Tag>{val}</Tag>;
      }
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/employees')} />
        <Avatar size={48} style={{ backgroundColor: token.colorPrimary }} icon={<UserOutlined />} />
        <div>
          <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            {employee.name}
            <Tag color={getAvailabilityColor(employee.availability)}>{getAvailabilityLabel(employee.availability)}</Tag>
            <Tag color={getEmploymentTypeColor(employee.employmentType)}>{employee.employmentType}</Tag>
          </Title>
          <Space size={4}>
            <Text type="secondary">{employee.designation} • {employee.department}{employee.reportingTo ? ` • Reports to: ${employee.reportingTo}` : ''}</Text>
            {(() => {
              const userAccount = defaultUsers.find(u => u.employeeId === employee.id);
              const role = userAccount ? defaultRoles.find(r => r.id === userAccount.roleId) : null;
              return role ? <Tag color={role.color} style={{ margin: 0 }}>{role.name}</Tag> : null;
            })()}
          </Space>
        </div>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="Daily Rate" value={employee.dailyRate} prefix={<DollarOutlined />} styles={{ content: { color: token.colorPrimary } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="Projects Completed" value={employee.totalProjectsCompleted} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="Certifications" value={employee.certifications.length} prefix={<SafetyCertificateOutlined />} styles={{ content: { color: employee.certifications.length > 0 ? token.colorSuccess : token.colorTextSecondary } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card styles={{ body: { padding: '20px' } }}>
            <Statistic title="Joined" value={employee.joinDate} prefix={<CalendarOutlined />} styles={{ content: { fontSize: 16 } }} />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'profile',
          label: 'Employee Profile',
          children: (
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Card
                  title="Personal Information"
                  style={{ marginBottom: 24 }}
                  extra={
                    isEditingPersonal ? (
                      <Space>
                        <Button size="small" onClick={() => setIsEditingPersonal(false)}>Cancel</Button>
                        <Button size="small" type="primary" onClick={() => setIsEditingPersonal(false)}>Save</Button>
                      </Space>
                    ) : (
                      <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditingPersonal(true)} />
                    )
                  }
                >
                  {isEditingPersonal ? (
                    <Form layout="vertical" initialValues={employee} onValuesChange={(_, allValues) => setEmployee({ ...employee, ...allValues })}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="name" label="Full Name">
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="designation" label="Designation">
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="department" label="Department">
                            <Select>
                              <Option value="Creative">Creative</Option>
                              <Option value="Technical">Technical</Option>
                              <Option value="Operations">Operations</Option>
                              <Option value="Production">Production</Option>
                              <Option value="Management">Management</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="employmentType" label="Employment Type">
                            <Select>
                              <Option value="Full-time">Full-time</Option>
                              <Option value="Part-time">Part-time</Option>
                              <Option value="Freelance">Freelance</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="mobile" label="Mobile">
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="email" label="Email">
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="whatsapp" label="WhatsApp">
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="reportingTo" label="Reports To">
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  ) : (
                    <Descriptions column={2} labelStyle={{ color: token.colorTextSecondary }}>
                      <Descriptions.Item label="Full Name">{employee.name}</Descriptions.Item>
                      <Descriptions.Item label="Designation">{employee.designation}</Descriptions.Item>
                      <Descriptions.Item label="Department">{employee.department}</Descriptions.Item>
                      <Descriptions.Item label="Employment Type">{employee.employmentType}</Descriptions.Item>
                      <Descriptions.Item label="Mobile">
                        <Space><PhoneOutlined />{employee.mobile}</Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        <Space><MailOutlined /><a href={`mailto:${employee.email}`}>{employee.email}</a></Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="WhatsApp">
                        <Space><WhatsAppOutlined />{employee.whatsapp}</Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Reports To">{employee.reportingTo || 'N/A'}</Descriptions.Item>
                      <Descriptions.Item label="Emergency Contact" span={2}>
                        {employee.emergencyContact.name} ({employee.emergencyContact.relationship}) — {employee.emergencyContact.phone}
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                </Card>

                <Card
                  title="Skills & Certifications"
                  style={{ marginBottom: 24 }}
                  extra={
                    isEditingSkills ? (
                      <Space>
                        <Button size="small" onClick={() => {
                          setSkills(initialEmployee.skills);
                          setCertifications(initialEmployee.certifications);
                          setIsEditingSkills(false);
                        }}>Cancel</Button>
                        <Button size="small" type="primary" onClick={() => {
                          setEmployee({ ...employee, skills, certifications });
                          setIsEditingSkills(false);
                        }}>Save</Button>
                      </Space>
                    ) : (
                      <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditingSkills(true)} />
                    )
                  }
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Skillset</Text>
                    <Space size={[8, 8]} wrap>
                      {skills.map(skill => (
                        <Tag
                          key={skill}
                          color="blue"
                          closable={isEditingSkills}
                          onClose={() => setSkills(skills.filter(s => s !== skill))}
                        >
                          {skill}
                        </Tag>
                      ))}
                      {isEditingSkills && (
                        <Space.Compact size="small">
                          <Input
                            placeholder="Add skill"
                            value={newSkill}
                            onChange={e => setNewSkill(e.target.value)}
                            onPressEnter={() => {
                              if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                                setSkills([...skills, newSkill.trim()]);
                                setNewSkill('');
                              }
                            }}
                            style={{ width: 120 }}
                          />
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                              if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                                setSkills([...skills, newSkill.trim()]);
                                setNewSkill('');
                              }
                            }}
                          />
                        </Space.Compact>
                      )}
                    </Space>
                  </div>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Certifications & Licences</Text>
                    {certifications.length > 0 ? (
                      <Space size={[8, 8]} wrap>
                        {certifications.map(cert => (
                          <Tag
                            key={cert}
                            color="green"
                            icon={<SafetyCertificateOutlined />}
                            closable={isEditingSkills}
                            onClose={() => setCertifications(certifications.filter(c => c !== cert))}
                          >
                            {cert}
                          </Tag>
                        ))}
                      </Space>
                    ) : (
                      !isEditingSkills && <Text type="secondary">No certifications on record</Text>
                    )}
                    {isEditingSkills && (
                      <div style={{ marginTop: 8 }}>
                        <Space.Compact size="small">
                          <Input
                            placeholder="Add certification"
                            value={newCert}
                            onChange={e => setNewCert(e.target.value)}
                            onPressEnter={() => {
                              if (newCert.trim() && !certifications.includes(newCert.trim())) {
                                setCertifications([...certifications, newCert.trim()]);
                                setNewCert('');
                              }
                            }}
                            style={{ width: 200 }}
                          />
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                              if (newCert.trim() && !certifications.includes(newCert.trim())) {
                                setCertifications([...certifications, newCert.trim()]);
                                setNewCert('');
                              }
                            }}
                          />
                        </Space.Compact>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>

              <Col span={8}>
                <Card
                  title="Rates & Costing"
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
                    <Form layout="vertical" initialValues={employee} onValuesChange={(_, allValues) => setEmployee({ ...employee, ...allValues })}>
                      <Form.Item name="dailyRate" label="Daily Rate (SGD)">
                        <Input type="number" />
                      </Form.Item>
                      <Form.Item name="hourlyRate" label="Hourly Rate (SGD)">
                        <Input type="number" />
                      </Form.Item>
                      <Form.Item name="overtimeRate" label="Overtime Rate (SGD)">
                        <Input type="number" />
                      </Form.Item>
                    </Form>
                  ) : (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Daily Rate</Text>
                        <Text strong style={{ fontSize: 16 }}>{formatCurrency(employee.dailyRate)}</Text>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Hourly Rate</Text>
                        <Text strong style={{ fontSize: 16 }}>{formatCurrency(employee.hourlyRate)}</Text>
                      </div>
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Overtime Rate</Text>
                        <Text strong style={{ fontSize: 16 }}>{formatCurrency(employee.overtimeRate)}</Text>
                      </div>
                    </>
                  )}
                </Card>

                <Card title="Current Assignment">
                  {employee.currentProject ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorSuccess }} />
                        <Text strong>{employee.currentProject}</Text>
                      </div>
                      <Text type="secondary">Currently assigned and active on this project.</Text>
                    </div>
                  ) : (
                    <div>
                      <Text type="secondary">No current project assignment. Available for scheduling.</Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          )
        },
        {
          key: 'history',
          label: 'Project History',
          children: (
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title="Project Assignments">
                  <Table columns={projectColumns} dataSource={projectHistory} pagination={false} rowKey="id" />
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
            { id: 1, name: 'Employment_Contract.pdf', date: employee.joinDate, size: '1.8 MB' },
            { id: 2, name: 'Safety_Certification.pdf', date: '2025-06-15', size: '950 KB' },
            { id: 3, name: 'NDA_Agreement.pdf', date: '2025-01-10', size: '420 KB' }
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
