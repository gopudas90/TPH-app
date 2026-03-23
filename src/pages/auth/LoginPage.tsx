// @ts-nocheck
import React, { useState } from 'react';
import { Form, Input, Button, Typography, theme } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const USERS = {
  admin: { email: 'admin@tph.sg', password: 'admin123', role: 'admin' },
  client: { email: 'client@demo.sg', password: 'client123', role: 'client' },
};

interface LoginPageProps {
  onLogin: (role: 'admin' | 'client') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = (role: 'admin' | 'client') => {
    const creds = USERS[role];
    form.setFieldsValue({ email: creds.email, password: creds.password });
    setError('');
    // Auto-submit
    setTimeout(() => form.submit(), 100);
  };

  const handleSubmit = (values: { email: string; password: string }) => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const match = Object.values(USERS).find(
        u => u.email === values.email && u.password === values.password
      );
      if (match) {
        onLogin(match.role as 'admin' | 'client');
      } else {
        setError('Invalid email or password.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: token.colorBgLayout,
    }}>
      <div style={{
        width: 360,
        padding: '40px 36px',
        background: token.colorBgContainer,
        borderRadius: 12,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}>
        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10,
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>T</span>
          </div>
          <Title level={4} style={{ marginBottom: 4 }}>The Production House</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Sign in to your account</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item name="email" rules={[{ required: true, message: 'Required' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 8 }}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          {error && (
            <Text type="danger" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              {error}
            </Text>
          )}

          <Button type="primary" htmlType="submit" loading={loading} block style={{ marginTop: 8 }}>
            Sign In
          </Button>
        </Form>

        {/* Quick login */}
        <div style={{ marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', textAlign: 'center', marginBottom: 10 }}>
            Quick login
          </Text>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button block size="small" onClick={() => handleQuickLogin('admin')}>
              Admin
            </Button>
            <Button block size="small" onClick={() => handleQuickLogin('client')}>
              Client
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
