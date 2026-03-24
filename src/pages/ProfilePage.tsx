// @ts-nocheck
import React, { useState } from 'react';
import {
  Typography, Card, Row, Col, Avatar, Button, Space, Tag, Divider, Form,
  Input, Select, Switch, Upload, message, theme, Tabs, List, Progress, Tooltip, Badge,
} from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, CameraOutlined,
  LockOutlined, BellOutlined, GlobalOutlined, SaveOutlined, KeyOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ProjectOutlined, DollarOutlined,
  TeamOutlined, SafetyCertificateOutlined, CalendarOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const MOCK_PROFILE = {
  name: 'Sarah Jenkins',
  email: 'sarah.jenkins@tph.sg',
  phone: '+65 9123 4567',
  role: 'Sales Director',
  department: 'Sales',
  location: 'Singapore',
  joinDate: '15 Jan 2022',
  bio: 'Experienced event production sales leader with 8+ years in the MICE industry across Southeast Asia. Specialising in corporate events, experiential activations, and large-scale productions.',
  timezone: 'Asia/Singapore (GMT+8)',
  language: 'English',
};

const MOCK_ACTIVITY = [
  { id: '1', action: 'Moved deal to Negotiation', detail: 'Annual Sales Kickoff — Initech', time: '2 hours ago' },
  { id: '2', action: 'Approved quote v2.0', detail: 'Tech Summit 2026 — Acme Corp', time: '5 hours ago' },
  { id: '3', action: 'Created new deal', detail: 'Esports Tournament Finals — Cyberdyne Systems', time: 'Yesterday' },
  { id: '4', action: 'Uploaded document', detail: 'Client Brief v2.pdf — Marina Bay Gala', time: 'Yesterday' },
  { id: '5', action: 'Commented on task', detail: 'AV Setup — "Confirmed with MBS ops team"', time: '2 days ago' },
  { id: '6', action: 'Assigned to project', detail: 'Marina Bay Gala 2025 — Project Director', time: '3 days ago' },
];

const MOCK_STATS = {
  activeDeals: 7,
  totalPipelineValue: 1042000,
  closedWon: 12,
  winRate: 68,
  activeProjects: 3,
  tasksCompleted: 45,
  tasksTotal: 52,
};

export const ProfilePage: React.FC = () => {
  const { token } = theme.useToken();
  const [editing, setEditing] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [notifSettings, setNotifSettings] = useState({
    dealUpdates: true,
    taskAssignments: true,
    quoteApprovals: true,
    projectAlerts: true,
    teamChanges: false,
    marketingEmails: false,
    desktopNotifications: true,
    emailDigest: 'daily',
  });

  const handleSaveProfile = () => {
    setEditing(false);
    message.success('Profile updated');
  };

  const handleChangePassword = () => {
    passwordForm.resetFields();
    message.success('Password changed');
  };

  const fmtK = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}K` : v.toString();

  return (
    <div>
      <Title level={3} style={{ margin: '0 0 20px' }}>My Profile</Title>

      <Row gutter={[20, 20]}>
        {/* Left: Profile card */}
        <Col span={8}>
          <Card size="small" styles={{ body: { padding: 24, textAlign: 'center' } }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <Avatar size={88} style={{ background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`, fontSize: 32 }}>
                {MOCK_PROFILE.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Tooltip title="Change photo">
                <Button
                  type="primary"
                  shape="circle"
                  size="small"
                  icon={<CameraOutlined style={{ fontSize: 12 }} />}
                  style={{ position: 'absolute', bottom: 0, right: 0 }}
                />
              </Tooltip>
            </div>
            <Title level={4} style={{ margin: '0 0 4px' }}>{MOCK_PROFILE.name}</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>{MOCK_PROFILE.role}</Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="blue">{MOCK_PROFILE.department}</Tag>
              <Tag>{MOCK_PROFILE.location}</Tag>
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ textAlign: 'left' }}>
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MailOutlined style={{ color: token.colorTextSecondary, fontSize: 13 }} />
                  <Text style={{ fontSize: 12 }}>{MOCK_PROFILE.email}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PhoneOutlined style={{ color: token.colorTextSecondary, fontSize: 13 }} />
                  <Text style={{ fontSize: 12 }}>{MOCK_PROFILE.phone}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GlobalOutlined style={{ color: token.colorTextSecondary, fontSize: 13 }} />
                  <Text style={{ fontSize: 12 }}>{MOCK_PROFILE.timezone}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarOutlined style={{ color: token.colorTextSecondary, fontSize: 13 }} />
                  <Text style={{ fontSize: 12 }}>Joined {MOCK_PROFILE.joinDate}</Text>
                </div>
              </Space>
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <Text type="secondary" style={{ fontSize: 12, textAlign: 'left', display: 'block' }}>{MOCK_PROFILE.bio}</Text>
          </Card>

          {/* Performance snapshot */}
          <Card size="small" title={<Text strong style={{ fontSize: 13 }}>Performance</Text>} style={{ marginTop: 16 }} styles={{ body: { padding: '12px 16px' } }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={6}><DollarOutlined style={{ color: token.colorPrimary }} /><Text style={{ fontSize: 12 }}>Active Pipeline</Text></Space>
                <Text strong style={{ fontSize: 12 }}>SGD {fmtK(MOCK_STATS.totalPipelineValue)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={6}><ProjectOutlined style={{ color: token.colorPrimary }} /><Text style={{ fontSize: 12 }}>Active Deals</Text></Space>
                <Text strong style={{ fontSize: 12 }}>{MOCK_STATS.activeDeals}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={6}><CheckCircleOutlined style={{ color: token.colorSuccess }} /><Text style={{ fontSize: 12 }}>Deals Won</Text></Space>
                <Text strong style={{ fontSize: 12 }}>{MOCK_STATS.closedWon}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={6}><TeamOutlined style={{ color: token.colorWarning }} /><Text style={{ fontSize: 12 }}>Win Rate</Text></Space>
                <Text strong style={{ fontSize: 12, color: token.colorSuccess }}>{MOCK_STATS.winRate}%</Text>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12 }}>Tasks</Text>
                  <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{MOCK_STATS.tasksCompleted}/{MOCK_STATS.tasksTotal}</Text>
                </div>
                <Progress percent={Math.round((MOCK_STATS.tasksCompleted / MOCK_STATS.tasksTotal) * 100)} size="small" />
              </div>
            </div>
          </Card>
        </Col>

        {/* Right: Tabs */}
        <Col span={16}>
          <Card size="small" styles={{ body: { padding: '8px 20px 20px' } }}>
            <Tabs
              defaultActiveKey="details"
              items={[
                {
                  key: 'details',
                  label: 'Edit Profile',
                  children: (
                    <Form
                      form={profileForm}
                      layout="vertical"
                      initialValues={{
                        name: MOCK_PROFILE.name,
                        email: MOCK_PROFILE.email,
                        phone: MOCK_PROFILE.phone,
                        role: MOCK_PROFILE.role,
                        department: MOCK_PROFILE.department,
                        location: MOCK_PROFILE.location,
                        bio: MOCK_PROFILE.bio,
                        language: MOCK_PROFILE.language,
                      }}
                      onFinish={handleSaveProfile}
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                            <Input prefix={<UserOutlined />} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                            <Input prefix={<MailOutlined />} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="phone" label="Phone">
                            <Input prefix={<PhoneOutlined />} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="role" label="Role">
                            <Input disabled />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="department" label="Department">
                            <Select options={[
                              { value: 'Sales', label: 'Sales' },
                              { value: 'Creative', label: 'Creative' },
                              { value: 'Technical', label: 'Technical' },
                              { value: 'Operations', label: 'Operations' },
                              { value: 'Finance', label: 'Finance' },
                              { value: 'Marketing', label: 'Marketing' },
                            ]} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="location" label="Location">
                            <Input prefix={<GlobalOutlined />} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="language" label="Language">
                            <Select options={[
                              { value: 'English', label: 'English' },
                              { value: 'Mandarin', label: 'Mandarin' },
                              { value: 'Malay', label: 'Malay' },
                              { value: 'Tamil', label: 'Tamil' },
                            ]} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="bio" label="Bio">
                        <Input.TextArea rows={3} />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Save Changes</Button>
                    </Form>
                  ),
                },
                {
                  key: 'security',
                  label: 'Security',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>Change Password</Text>
                      <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                        style={{ maxWidth: 400 }}
                      >
                        <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true }]}>
                          <Input.Password prefix={<LockOutlined />} />
                        </Form.Item>
                        <Form.Item name="newPassword" label="New Password" rules={[{ required: true, min: 8, message: 'Min 8 characters' }]}>
                          <Input.Password prefix={<KeyOutlined />} />
                        </Form.Item>
                        <Form.Item
                          name="confirmPassword"
                          label="Confirm New Password"
                          dependencies={['newPassword']}
                          rules={[
                            { required: true },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                                return Promise.reject(new Error('Passwords do not match'));
                              },
                            }),
                          ]}
                        >
                          <Input.Password prefix={<KeyOutlined />} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" icon={<LockOutlined />}>Update Password</Button>
                      </Form>

                      <Divider />
                      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>Sessions</Text>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { device: 'Chrome on macOS', location: 'Singapore', time: 'Active now', current: true },
                          { device: 'Safari on iPhone', location: 'Singapore', time: 'Last active 2 hrs ago', current: false },
                        ].map((session, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: token.colorFillAlter, border: `1px solid ${token.colorBorderSecondary}` }}>
                            <div>
                              <Text style={{ fontSize: 12 }}>{session.device}</Text>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{session.location} &middot; {session.time}</Text>
                            </div>
                            {session.current ? (
                              <Tag color="success" style={{ margin: 0 }}>Current</Tag>
                            ) : (
                              <Button size="small" danger type="text" style={{ fontSize: 11 }}>Revoke</Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'notifications',
                  label: 'Notifications',
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>Notification Preferences</Text>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 500 }}>
                        {[
                          { key: 'dealUpdates', label: 'Deal stage changes', desc: 'When a deal moves to a new pipeline stage' },
                          { key: 'taskAssignments', label: 'Task assignments', desc: 'When a task is assigned to you or your team' },
                          { key: 'quoteApprovals', label: 'Quote approvals', desc: 'When a quote is approved, rejected, or needs review' },
                          { key: 'projectAlerts', label: 'Project risk alerts', desc: 'AI-detected risks and timeline warnings' },
                          { key: 'teamChanges', label: 'Team changes', desc: 'When team members are added or removed from your projects' },
                          { key: 'desktopNotifications', label: 'Desktop notifications', desc: 'Show browser push notifications' },
                        ].map(item => (
                          <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Text style={{ fontSize: 13 }}>{item.label}</Text>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{item.desc}</Text>
                            </div>
                            <Switch
                              checked={notifSettings[item.key]}
                              onChange={v => setNotifSettings(prev => ({ ...prev, [item.key]: v }))}
                              size="small"
                            />
                          </div>
                        ))}
                        <Divider style={{ margin: '4px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text style={{ fontSize: 13 }}>Email digest frequency</Text>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Summary of notifications sent to your email</Text>
                          </div>
                          <Select
                            value={notifSettings.emailDigest}
                            onChange={v => setNotifSettings(prev => ({ ...prev, emailDigest: v }))}
                            size="small"
                            style={{ width: 120 }}
                            options={[
                              { value: 'realtime', label: 'Real-time' },
                              { value: 'daily', label: 'Daily' },
                              { value: 'weekly', label: 'Weekly' },
                              { value: 'off', label: 'Off' },
                            ]}
                          />
                        </div>
                      </div>
                      <Button type="primary" icon={<SaveOutlined />} style={{ marginTop: 20 }} onClick={() => message.success('Preferences saved')}>
                        Save Preferences
                      </Button>
                    </div>
                  ),
                },
                {
                  key: 'activity',
                  label: 'Recent Activity',
                  children: (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {MOCK_ACTIVITY.map(a => (
                          <div key={a.id} style={{ display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 8, background: token.colorFillAlter, border: `1px solid ${token.colorBorderSecondary}` }}>
                            <ClockCircleOutlined style={{ color: token.colorTextSecondary, marginTop: 3, fontSize: 12 }} />
                            <div style={{ flex: 1 }}>
                              <Text strong style={{ fontSize: 12 }}>{a.action}</Text>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{a.detail}</Text>
                            </div>
                            <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>{a.time}</Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
