import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, theme } from 'antd';
import {
  AppstoreOutlined,
  ProjectOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
  BellOutlined,
  SwapOutlined,
  TeamOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ isDarkMode, toggleTheme }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentModule, setCurrentModule] = useState<'sales' | 'customers' | 'employees' | 'partners'>('sales');
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  useEffect(() => {
    if (location.pathname.startsWith('/customers') || location.pathname.startsWith('/customer/')) {
      setCurrentModule('customers');
    } else if (location.pathname.startsWith('/employees') || location.pathname.startsWith('/employee/')) {
      setCurrentModule('employees');
    } else if (location.pathname.startsWith('/partners') || location.pathname.startsWith('/partner/')) {
      setCurrentModule('partners');
    } else if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/pipeline') || location.pathname.startsWith('/deal/')) {
      setCurrentModule('sales');
    }
  }, [location.pathname]);

  const salesMenuItems = [
    {
      key: '/dashboard',
      icon: <AppstoreOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/pipeline',
      icon: <ProjectOutlined />,
      label: 'Pipelines',
    },
  ];

  const customerMenuItems = [
    {
      key: '/customers/dashboard',
      icon: <AppstoreOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/customers',
      icon: <TeamOutlined />,
      label: 'Customers',
    },
  ];

  const employeeMenuItems = [
    {
      key: '/employees/dashboard',
      icon: <AppstoreOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'Employees',
    },
  ];

  const partnerMenuItems = [
    {
      key: '/partners/dashboard',
      icon: <AppstoreOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/partners',
      icon: <ShopOutlined />,
      label: 'Partners',
    },
  ];

  const menuItems = currentModule === 'sales' ? salesMenuItems : currentModule === 'customers' ? customerMenuItems : currentModule === 'employees' ? employeeMenuItems : partnerMenuItems;

  const moduleMenu = {
    items: [
      {
        key: 'sales',
        label: 'Sales Management',
        icon: <ProjectOutlined />,
        onClick: () => {
          setCurrentModule('sales');
          navigate('/dashboard');
        }
      },
      {
        key: 'customers',
        label: 'Customer Account Management',
        icon: <TeamOutlined />,
        onClick: () => {
          setCurrentModule('customers');
          navigate('/customers/dashboard');
        }
      },
      {
        key: 'employees',
        label: 'Employee Management',
        icon: <UserOutlined />,
        onClick: () => {
          setCurrentModule('employees');
          navigate('/employees/dashboard');
        }
      },
      {
        key: 'partners',
        label: 'Partner Management',
        icon: <ShopOutlined />,
        onClick: () => {
          setCurrentModule('partners');
          navigate('/partners/dashboard');
        }
      }
    ]
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        theme={isDarkMode ? 'dark' : 'light'}
        style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            background: token.colorPrimary, 
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 16
          }}>
            T
          </div>
          {!collapsed && (
            <span style={{ marginLeft: 12, fontWeight: 600, fontSize: 16, color: token.colorText }}>
              {currentModule === 'sales' ? 'TPH Sales' : currentModule === 'customers' ? 'TPH Customers' : currentModule === 'employees' ? 'TPH Employees' : 'TPH Partners'}
            </span>
          )}
        </div>
        <Menu 
          theme={isDarkMode ? 'dark' : 'light'} 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: token.colorBgContainer, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${token.colorBorderSecondary}`
        }}>
          <div>
            <Text strong style={{ fontSize: 16 }}>{menuItems.find(item => item.key === location.pathname)?.label || 'TPH'}</Text>
          </div>
          <Space size="middle">
            <Dropdown menu={moduleMenu} placement="bottomRight">
              <Button type="text" icon={<AppstoreOutlined />} title="Switch Module" />
            </Dropdown>
            <Button 
              type="text" 
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />} 
              onClick={toggleTheme}
            />
            <Button type="text" icon={<BellOutlined />} />
            <Dropdown menu={{ items: [{ key: '1', label: 'Profile' }, { key: '2', label: 'Logout' }] }} placement="bottomRight">
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
