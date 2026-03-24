// @ts-nocheck
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
  SwapOutlined,
  TeamOutlined,
  ShopOutlined,
  InboxOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AIChatFAB } from './AIChatFAB';
import { NotificationsDropdown } from './NotificationsDropdown';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout?: () => void;
  userRole?: 'admin' | 'client';
}

export const AppLayout: React.FC<AppLayoutProps> = ({ isDarkMode, toggleTheme, onLogout, userRole }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentModule, setCurrentModule] = useState<'sales' | 'customers' | 'employees' | 'partners' | 'assets' | 'projects' | 'masterdata'>('sales');
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  useEffect(() => {
    if (location.pathname.startsWith('/customers') || location.pathname.startsWith('/customer/')) {
      setCurrentModule('customers');
    } else if (location.pathname.startsWith('/employees') || location.pathname.startsWith('/employee/') || location.pathname.startsWith('/roles-permissions')) {
      setCurrentModule('employees');
    } else if (location.pathname.startsWith('/partners') || location.pathname.startsWith('/partner/')) {
      setCurrentModule('partners');
    } else if (location.pathname.startsWith('/assets') || location.pathname.startsWith('/asset/')) {
      setCurrentModule('assets');
    } else if (location.pathname.startsWith('/projects') || location.pathname.startsWith('/project/')) {
      setCurrentModule('projects');
    } else if (location.pathname.startsWith('/master-data')) {
      setCurrentModule('masterdata');
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
    {
      key: '/pipeline-settings',
      icon: <SettingOutlined />,
      label: 'Pipeline Settings',
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
    {
      key: '/roles-permissions',
      icon: <SafetyCertificateOutlined />,
      label: 'Roles & Permissions',
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

  const assetMenuItems = [
    {
      key: '/assets/dashboard',
      icon: <AppstoreOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/assets',
      icon: <InboxOutlined />,
      label: 'Assets',
    },
    {
      key: '/assets/calendar',
      icon: <CalendarOutlined />,
      label: 'Calendar',
    },
    {
      key: '/assets/inventory',
      icon: <DatabaseOutlined />,
      label: 'Inventory',
    },
  ];

  const projectMenuItems = [
    {
      key: '/projects',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/projects/list',
      icon: <UnorderedListOutlined />,
      label: 'All Projects',
    },
  ];

  const masterDataMenuItems = [
    { key: '/master-data/asset-categories', icon: <AppstoreOutlined />, label: 'Asset Categories' },
    { key: '/master-data/asset-conditions', icon: <InboxOutlined />, label: 'Asset Conditions' },
    { key: '/master-data/customer-tiers', icon: <UserOutlined />, label: 'Customer Tiers' },
    { key: '/master-data/customer-industries', icon: <ShopOutlined />, label: 'Customer Industries' },
    { key: '/master-data/departments', icon: <TeamOutlined />, label: 'Departments' },
    { key: '/master-data/enquiry-types', icon: <FileTextOutlined />, label: 'Enquiry Types' },
    { key: '/master-data/event-types', icon: <CalendarOutlined />, label: 'Event Types' },
  ];

  const menuItemsMap = { sales: salesMenuItems, customers: customerMenuItems, employees: employeeMenuItems, partners: partnerMenuItems, assets: assetMenuItems, projects: projectMenuItems, masterdata: masterDataMenuItems };
  const menuItems = menuItemsMap[currentModule] || salesMenuItems;

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
      },
      {
        key: 'assets',
        label: 'Asset Management',
        icon: <InboxOutlined />,
        onClick: () => {
          setCurrentModule('assets');
          navigate('/assets/dashboard');
        }
      },
      {
        key: 'projects',
        label: 'Project Management',
        icon: <ProjectOutlined />,
        onClick: () => {
          setCurrentModule('projects');
          navigate('/projects');
        }
      },
      ...(userRole === 'admin' ? [{
        key: 'masterdata',
        label: 'Master Data',
        icon: <DatabaseOutlined />,
        onClick: () => {
          setCurrentModule('masterdata');
          navigate('/master-data/asset-categories');
        }
      }] : []),
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
              {({ sales: 'TPH Sales', customers: 'TPH Customers', employees: 'TPH Employees', partners: 'TPH Partners', assets: 'TPH Assets', projects: 'TPH Projects', masterdata: 'Master Data' })[currentModule]}
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
              <Button type="text" icon={<AppstoreOutlined />} title="Switch Module">
                <span style={{ fontSize: 13 }}>{{ sales: 'Sales Management', customers: 'Customer Account Management', employees: 'Employee Management', partners: 'Partner Management', assets: 'Asset Management', projects: 'Project Management', masterdata: 'Master Data' }[currentModule]}</span>
                <SwapOutlined style={{ fontSize: 10, marginLeft: 4 }} />
              </Button>
            </Dropdown>
            <Button 
              type="text" 
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />} 
              onClick={toggleTheme}
            />
            <NotificationsDropdown />
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: 'Profile', icon: <UserOutlined />, onClick: () => navigate('/profile') },
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
      <AIChatFAB pageContext={({ sales: 'Sales Dashboard', customers: 'Customer Dashboard', employees: 'Employee Dashboard', partners: 'Partner Dashboard', assets: 'Asset Dashboard', projects: 'Project Dashboard', masterdata: 'Master Data' })[currentModule] || 'Dashboard'} />
    </Layout>
  );
};
