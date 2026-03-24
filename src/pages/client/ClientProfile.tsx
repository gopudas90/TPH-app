// @ts-nocheck
import React, { useState } from 'react';
import {
  Typography, Card, Row, Col, Avatar, Button, Space, Tag, Divider, Form,
  Input, Select, Switch, message, theme, Tabs, Tooltip, Progress,
} from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined, CameraOutlined,
  LockOutlined, GlobalOutlined, SaveOutlined, KeyOutlined,
  CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  FileTextOutlined, ProjectOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PROFILE = {
  name: 'Jane Doe',
  email: 'jane.doe@acmecorp.com',
  phone: '+65 9123 4567',
  role: 'Marketing Director',
  company: 'Acme Corp',
  location: 'Singapore',
  joinDate: '10 Jan 2024',
};

const STATS = { totalEnquiries: 6, activeProjects: 1, eventsCompleted: 3, totalSpend: 605000 };

export const ClientProfile: React.FC = () => {
  const { token } = theme.useToken();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [notifSettings, setNotifSettings] = useState({
    quoteUpdates: true, projectUpdates: true, messages: true, reminders: true, emailDigest: 'daily',
  });

  const fmtK = (v: number) => v >= 1000000 ? `SGD ${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `SGD ${Math.round(v / 1000)}K` : `SGD ${v}`;

  return (
    <div>
      <Title level={3} style={{ margin: '0 0 20px' }}>My Profile</Title>
      <Row gutter={[20, 20]}>
        <Col span={8}>
          <Card size="small" styles={{ body: { padding: 24, textAlign: 'center' } }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <Avatar size={88} style={{ background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`, fontSize: 32 }}>
                {PROFILE.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Tooltip title="Change photo">
                <Button type="primary" shape="circle" size="small" icon={<CameraOutlined style={{ fontSize: 12 }} />} style={{ position: 'absolute', bottom: 0, right: 0 }} />
              </Tooltip>
            </div>
            <Title level={4} style={{ margin: '0 0 4px' }}>{PROFILE.name}</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>{PROFILE.role}</Text>
            <div style={{ marginTop: 8 }}><Tag color="blue">{PROFILE.company}</Tag><Tag>{PROFILE.location}</Tag></div>
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ textAlign: 'left' }}>
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MailOutlined style={{ color: token.colorTextSecondary, fontSize: 13 }} /><Text style={{ fontSize: 12 }}>{PROFILE.email}</Text></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><PhoneOutlined style={{ color: token.colorTextSecondary, fontSize: 13 }} /><Text style={{ fontSize: 12 }}>{PROFILE.phone}</Text></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CalendarOutlined style={{ color: token.colorTextSecondary, fontSize: 13 }} /><Text style={{ fontSize: 12 }}>Member since {PROFILE.joinDate}</Text></div>
              </Space>
            </div>
          </Card>
          <Card size="small" title={<Text strong style={{ fontSize: 13 }}>Summary</Text>} style={{ marginTop: 16 }} styles={{ body: { padding: '12px 16px' } }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><Space size={6}><FileTextOutlined style={{ color: token.colorPrimary }} /><Text style={{ fontSize: 12 }}>Total Enquiries</Text></Space><Text strong style={{ fontSize: 12 }}>{STATS.totalEnquiries}</Text></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><Space size={6}><ProjectOutlined style={{ color: token.colorPrimary }} /><Text style={{ fontSize: 12 }}>Active Projects</Text></Space><Text strong style={{ fontSize: 12 }}>{STATS.activeProjects}</Text></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><Space size={6}><CheckCircleOutlined style={{ color: token.colorSuccess }} /><Text style={{ fontSize: 12 }}>Events Completed</Text></Space><Text strong style={{ fontSize: 12 }}>{STATS.eventsCompleted}</Text></div>
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card size="small" styles={{ body: { padding: '8px 20px 20px' } }}>
            <Tabs defaultActiveKey="details" items={[
              { key: 'details', label: 'Edit Profile', children: (
                <Form form={profileForm} layout="vertical" initialValues={PROFILE} onFinish={() => message.success('Profile updated')}>
                  <Row gutter={16}>
                    <Col span={12}><Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input prefix={<UserOutlined />} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input prefix={<MailOutlined />} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="phone" label="Phone"><Input prefix={<PhoneOutlined />} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="company" label="Company"><Input disabled /></Form.Item></Col>
                    <Col span={12}><Form.Item name="role" label="Role"><Input disabled /></Form.Item></Col>
                    <Col span={12}><Form.Item name="location" label="Location"><Input prefix={<GlobalOutlined />} /></Form.Item></Col>
                  </Row>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Save Changes</Button>
                </Form>
              ) },
              { key: 'security', label: 'Security', children: (
                <Form form={passwordForm} layout="vertical" onFinish={() => { passwordForm.resetFields(); message.success('Password changed'); }} style={{ maxWidth: 400 }}>
                  <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true }]}><Input.Password prefix={<LockOutlined />} /></Form.Item>
                  <Form.Item name="newPassword" label="New Password" rules={[{ required: true, min: 8, message: 'Min 8 characters' }]}><Input.Password prefix={<KeyOutlined />} /></Form.Item>
                  <Form.Item name="confirmPassword" label="Confirm New Password" dependencies={['newPassword']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) return Promise.resolve(); return Promise.reject(new Error('Passwords do not match')); } })]}>
                    <Input.Password prefix={<KeyOutlined />} />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" icon={<LockOutlined />}>Update Password</Button>
                </Form>
              ) },
              { key: 'notifications', label: 'Notifications', children: (
                <div>
                  <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>Notification Preferences</Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 500 }}>
                    {[
                      { key: 'quoteUpdates', label: 'Quote updates', desc: 'When a new quote is sent or updated' },
                      { key: 'projectUpdates', label: 'Project progress', desc: 'Milestone completions and task updates' },
                      { key: 'messages', label: 'New messages', desc: 'When TPH team sends you a message' },
                      { key: 'reminders', label: 'Event reminders', desc: 'Upcoming event date reminders' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><Text style={{ fontSize: 13 }}>{item.label}</Text><Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{item.desc}</Text></div>
                        <Switch checked={notifSettings[item.key]} onChange={v => setNotifSettings(p => ({ ...p, [item.key]: v }))} size="small" />
                      </div>
                    ))}
                    <Divider style={{ margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><Text style={{ fontSize: 13 }}>Email digest</Text><Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Summary of updates to your email</Text></div>
                      <Select value={notifSettings.emailDigest} onChange={v => setNotifSettings(p => ({ ...p, emailDigest: v }))} size="small" style={{ width: 120 }} options={[
                        { value: 'realtime', label: 'Real-time' }, { value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'off', label: 'Off' },
                      ]} />
                    </div>
                  </div>
                  <Button type="primary" icon={<SaveOutlined />} style={{ marginTop: 20 }} onClick={() => message.success('Preferences saved')}>Save Preferences</Button>
                </div>
              ) },
            ]} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
