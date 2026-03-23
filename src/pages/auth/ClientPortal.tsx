// @ts-nocheck
import React from 'react';
import { Button, Typography, theme, Tag } from 'antd';
import {
  CalendarOutlined, FileTextOutlined, CheckSquareOutlined,
  MessageOutlined, LogoutOutlined, BellOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface ClientPortalProps {
  onLogout: () => void;
}

const sections = [
  {
    icon: <CalendarOutlined style={{ fontSize: 28 }} />,
    label: 'My Events',
    description: 'View upcoming and past events',
    color: '#0f3460',
  },
  {
    icon: <FileTextOutlined style={{ fontSize: 28 }} />,
    label: 'Quotes & Invoices',
    description: 'Review proposals and payment history',
    color: '#e63946',
  },
  {
    icon: <CheckSquareOutlined style={{ fontSize: 28 }} />,
    label: 'Project Tracker',
    description: 'Track milestones and task progress',
    color: '#2a9d8f',
  },
  {
    icon: <MessageOutlined style={{ fontSize: 28 }} />,
    label: 'Messages',
    description: 'Communicate with your event team',
    color: '#e9c46a',
  },
];

export const ClientPortal: React.FC<ClientPortalProps> = ({ onLogout }) => {
  const { token } = theme.useToken();

  return (
    <div style={{ minHeight: '100vh', background: token.colorBgLayout, display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <div style={{
        height: 60, background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>T</span>
          </div>
          <div>
            <Text strong style={{ fontSize: 14 }}>The Production House</Text>
            <Tag color="blue" style={{ fontSize: 10, marginLeft: 8 }}>Client Portal</Tag>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button type="text" icon={<BellOutlined />} />
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={onLogout}
            style={{ color: token.colorTextSecondary }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Body */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 48,
      }}>
        <div style={{ maxWidth: 680, width: '100%', textAlign: 'center' }}>
          {/* Welcome */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0f3460, #1a6bb5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>C</span>
          </div>

          <Title level={3} style={{ marginBottom: 8 }}>Welcome, Client User</Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Your personalised event portal is being set up.
          </Text>

          <div style={{
            margin: '40px 0',
            padding: '16px 24px',
            background: token.colorInfoBg,
            border: `1px solid ${token.colorInfoBorder}`,
            borderRadius: 12,
            display: 'inline-block',
          }}>
            <Text style={{ fontSize: 13, color: token.colorInfo }}>
              No data available yet. Your project team will share event details here once your project is underway.
            </Text>
          </div>

          {/* Placeholder section cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
            marginTop: 8,
          }}>
            {sections.map(sec => (
              <div
                key={sec.label}
                style={{
                  padding: '28px 24px',
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 12,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  opacity: 0.5,
                  cursor: 'not-allowed',
                }}
              >
                <div style={{ color: sec.color }}>{sec.icon}</div>
                <Text strong style={{ fontSize: 14 }}>{sec.label}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{sec.description}</Text>
                <Tag style={{ fontSize: 10 }}>Coming Soon</Tag>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
