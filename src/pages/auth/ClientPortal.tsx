// @ts-nocheck
import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, theme, Badge } from 'antd';
import {
  AppstoreOutlined, UserOutlined, MoonOutlined, SunOutlined,
  CalendarOutlined, FileTextOutlined, ProjectOutlined, MessageOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { NotificationsDropdown } from '../../components/NotificationsDropdown';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface ClientPortalProps {
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ onLogout, isDarkMode, toggleTheme }) => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: '/client', icon: <AppstoreOutlined />, label: 'Dashboard' },
    { key: '/client/enquiries', icon: <FileTextOutlined />, label: 'My Enquiries' },
    { key: '/client/projects', icon: <ProjectOutlined />, label: 'Project Tracker' },
    { key: '/client/messages', icon: <MessageOutlined />, label: 'Messages' },
  ];

  // Derive active key from path
  const selectedKey = menuItems.find(m => location.pathname === m.key)?.key
    || menuItems.find(m => m.key !== '/client' && location.pathname.startsWith(m.key))?.key
    || '/client';

  const headerLabel = menuItems.find(m => m.key === selectedKey)?.label || 'Client Portal';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme={isDarkMode ? 'dark' : 'light'}
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
          theme={isDarkMode ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
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
          <Text strong style={{ fontSize: 16 }}>{headerLabel}</Text>
          <Space size="middle">
            <Button type="text" icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />} onClick={toggleTheme} />
            <NotificationsDropdown />
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: 'Profile', icon: <UserOutlined />, onClick: () => navigate('/client/profile') },
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
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: token.colorBgContainer, borderRadius: token.borderRadiusLG, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
