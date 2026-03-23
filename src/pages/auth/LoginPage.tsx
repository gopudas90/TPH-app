// @ts-nocheck
import React, { useState } from 'react';
import { Form, Input, Button, Typography, Divider, theme } from 'antd';
import { UserOutlined, LockOutlined, ThunderboltOutlined } from '@ant-design/icons';

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

  const handleQuickFill = (role: 'admin' | 'client') => {
    const creds = USERS[role];
    form.setFieldsValue({ email: creds.email, password: creds.password });
    setError('');
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
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: token.colorBgLayout,
    }}>
      {/* Left panel — branding */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 48,
        color: '#fff',
        minHeight: '100vh',
      }}>
        <div style={{ maxWidth: 360, textAlign: 'center' }}>
          {/* Logo mark */}
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 8px 32px rgba(230,57,70,0.4)',
          }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: -2 }}>T</span>
          </div>

          <Title level={2} style={{ color: '#fff', marginBottom: 8, fontWeight: 700 }}>
            The Production House
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>
            Singapore
          </Text>

          <Divider style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '32px 0' }} />

          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.7 }}>
            Event production management platform for tracking projects, sales pipeline, and client deliverables.
          </Text>
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{
        width: 480,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 56px',
        background: token.colorBgContainer,
      }}>
        <div style={{ marginBottom: 36 }}>
          <Title level={3} style={{ marginBottom: 6 }}>Sign in</Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Enter your credentials to access the platform
          </Text>
        </div>

        {/* Quick login buttons */}
        <div style={{ marginBottom: 24 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 10 }}>
            QUICK DEMO LOGIN
          </Text>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              icon={<ThunderboltOutlined />}
              onClick={() => handleQuickFill('admin')}
              style={{
                flex: 1, height: 40, borderRadius: 8,
                borderColor: '#0f3460', color: '#0f3460',
                fontWeight: 600,
              }}
            >
              Admin
            </Button>
            <Button
              icon={<ThunderboltOutlined />}
              onClick={() => handleQuickFill('client')}
              style={{
                flex: 1, height: 40, borderRadius: 8,
                borderColor: token.colorBorderSecondary, color: token.colorTextSecondary,
                fontWeight: 600,
              }}
            >
              Client
            </Button>
          </div>
          <Text type="secondary" style={{ fontSize: 11, marginTop: 6, display: 'block' }}>
            Click a role above to auto-fill credentials, then sign in
          </Text>
        </div>

        <Divider style={{ margin: '0 0 24px' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>or enter manually</Text>
        </Divider>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="email"
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Email</Text>}
            rules={[{ required: true, message: 'Please enter your email' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: token.colorTextTertiary }} />}
              placeholder="you@tph.sg"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Password</Text>}
            rules={[{ required: true, message: 'Please enter your password' }]}
            style={{ marginBottom: 8 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: token.colorTextTertiary }} />}
              placeholder="••••••••"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          {error && (
            <div style={{
              padding: '8px 12px', borderRadius: 8, marginBottom: 16,
              background: token.colorErrorBg, border: `1px solid ${token.colorErrorBorder}`,
            }}>
              <Text style={{ fontSize: 13, color: token.colorError }}>{error}</Text>
            </div>
          )}

          <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, borderRadius: 8, fontWeight: 600, fontSize: 15 }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 32, padding: '16px', background: token.colorBgLayout, borderRadius: 8 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Demo credentials</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text style={{ fontSize: 12 }}>
              <Text code style={{ fontSize: 11 }}>admin@tph.sg</Text>
              {' · '}
              <Text code style={{ fontSize: 11 }}>admin123</Text>
            </Text>
            <Text style={{ fontSize: 12 }}>
              <Text code style={{ fontSize: 11 }}>client@demo.sg</Text>
              {' · '}
              <Text code style={{ fontSize: 11 }}>client123</Text>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};
