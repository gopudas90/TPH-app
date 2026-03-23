// @ts-nocheck
import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, theme } from 'antd';
import {
  AppstoreOutlined, UserOutlined, BellOutlined,
  CalendarOutlined, FileTextOutlined, CheckSquareOutlined, MessageOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface ClientPortalProps {
  onLogout: () => void;
}

const menuItems = [
  { key: '1', icon: <AppstoreOutlined />, label: 'Dashboard' },
  { key: '2', icon: <CalendarOutlined />, label: 'My Events' },
  { key: '3', icon: <FileTextOutlined />, label: 'Quotes & Invoices' },
  { key: '4', icon: <CheckSquareOutlined />, label: 'Project Tracker' },
  { key: '5', icon: <MessageOutlined />, label: 'Messages' },
];

export const ClientPortal: React.FC<ClientPortalProps> = ({ onLogout }) => {
  const { token } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
          <div style={{
            width: 32, height: 32, background: token.colorPrimary, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 'bold', fontSize: 16,
          }}>
            T
          </div>
          {!collapsed && (
            <span style={{ marginLeft: 12, fontWeight: 600, fontSize: 16, color: token.colorText }}>
              TPH Client
            </span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <Header style={{
          padding: '0 24px',
          background: token.colorBgContainer,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <Text strong style={{ fontSize: 16 }}>Client Portal</Text>
          <Space size="middle">
            <Button type="text" icon={<BellOutlined />} />
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
                  { type: 'divider' },
                  { key: 'logout', label: 'Sign Out', danger: true, onClick: onLogout },
                ],
              }}
              placement="bottomRight"
            >
              <Avatar style={{ backgroundColor: token.colorPrimary, cursor: 'pointer' }} icon={<UserOutlined />} />
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', minHeight: 280, background: token.colorBgContainer, borderRadius: token.borderRadiusLG }} />
      </Layout>
    </Layout>
  );
};
