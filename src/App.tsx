/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-nocheck
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { getThemeConfig } from './theme';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { ClientPortal } from './pages/auth/ClientPortal';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientEnquiries } from './pages/client/ClientEnquiries';
import { ClientEnquiryDetail } from './pages/client/ClientEnquiryDetail';
import { ClientProjects, ClientProjectDetail } from './pages/client/ClientProjects';
import { ClientMessages } from './pages/client/ClientMessages';
import { ClientProfile } from './pages/client/ClientProfile';
import { UserManagement } from './pages/admin/UserManagement';
import { Dashboard } from './pages/sales/Dashboard';
import { Pipeline } from './pages/sales/Pipeline';
import { PipelineSettings } from './pages/sales/PipelineSettings';
import { DealProfile } from './pages/sales/DealProfile';
import { QuoteDetail } from './pages/sales/QuoteDetail';
import { CustomerDashboard } from './pages/customers/CustomerDashboard';
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerProfile } from './pages/customers/CustomerProfile';
import { EmployeeDashboard } from './pages/employees/EmployeeDashboard';
import { EmployeeList } from './pages/employees/EmployeeList';
import { EmployeeProfile } from './pages/employees/EmployeeProfile';
import { PartnerDashboard } from './pages/partners/PartnerDashboard';
import { PartnerList } from './pages/partners/PartnerList';
import { PartnerProfile } from './pages/partners/PartnerProfile';
import { AssetDashboard } from './pages/assets/AssetDashboard';
import { AssetList } from './pages/assets/AssetList';
import { AssetProfile } from './pages/assets/AssetProfile';
import { AssetCalendar } from './pages/assets/AssetCalendar';
import { InventoryList } from './pages/assets/InventoryList';
import { ProjectDashboard } from './pages/projects/ProjectDashboard';
import { ProjectList } from './pages/projects/ProjectList';
import { ProjectProfile } from './pages/projects/ProjectProfile';
import {
  MasterAssetCategories, MasterAssetConditions,
  MasterCustomerTiers, MasterCustomerIndustries, MasterDepartments,
  MasterEnquiryTypes, MasterEventTypes,
} from './pages/masterdata/MasterData';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<{ role: 'admin' | 'client' } | null>(null);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const handleLogin = (role: 'admin' | 'client') => setUser({ role });
  const handleLogout = () => setUser(null);

  return (
    <ConfigProvider theme={getThemeConfig(isDarkMode)}>
      <BrowserRouter>
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : user.role === 'client' ? (
          <Routes>
            <Route path="/" element={<ClientPortal onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}>
              <Route index element={<Navigate to="/client" replace />} />
              <Route path="client" element={<ClientDashboard />} />
              <Route path="client/enquiries" element={<ClientEnquiries />} />
              <Route path="client/enquiries/:id" element={<ClientEnquiryDetail />} />
              <Route path="client/projects" element={<ClientProjects />} />
              <Route path="client/projects/:id" element={<ClientProjectDetail />} />
              <Route path="client/messages" element={<ClientMessages />} />
              <Route path="client/profile" element={<ClientProfile />} />
              <Route path="client/notifications" element={<NotificationsPage />} />
              <Route path="*" element={<Navigate to="/client" replace />} />
            </Route>
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<AppLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} onLogout={handleLogout} userRole={user.role} />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="pipeline" element={<Pipeline />} />
              <Route path="pipeline-settings" element={<PipelineSettings />} />
              <Route path="deal/:id" element={<DealProfile />} />
              <Route path="quote/:id" element={<QuoteDetail />} />
              <Route path="customers/dashboard" element={<CustomerDashboard />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="customer/:id" element={<CustomerProfile />} />
              <Route path="employees/dashboard" element={<EmployeeDashboard />} />
              <Route path="employees" element={<EmployeeList />} />
              <Route path="employee/:id" element={<EmployeeProfile />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="partners/dashboard" element={<PartnerDashboard />} />
              <Route path="partners" element={<PartnerList />} />
              <Route path="partner/:id" element={<PartnerProfile />} />
              <Route path="assets/dashboard" element={<AssetDashboard />} />
              <Route path="assets" element={<AssetList />} />
              <Route path="assets/calendar" element={<AssetCalendar />} />
              <Route path="assets/inventory" element={<InventoryList />} />
              <Route path="asset/:id" element={<AssetProfile />} />
              <Route path="projects" element={<ProjectDashboard />} />
              <Route path="projects/list" element={<ProjectList />} />
              <Route path="project/:id" element={<ProjectProfile />} />
              {user.role === 'admin' && <>
                <Route path="master-data/asset-categories" element={<MasterAssetCategories />} />
                <Route path="master-data/asset-conditions" element={<MasterAssetConditions />} />
                <Route path="master-data/customer-tiers" element={<MasterCustomerTiers />} />
                <Route path="master-data/customer-industries" element={<MasterCustomerIndustries />} />
                <Route path="master-data/departments" element={<MasterDepartments />} />
                <Route path="master-data/enquiry-types" element={<MasterEnquiryTypes />} />
                <Route path="master-data/event-types" element={<MasterEventTypes />} />
              </>}
              <Route path="*" element={<div style={{ padding: 24 }}>Page Not Found</div>} />
            </Route>
          </Routes>
        )}
      </BrowserRouter>
    </ConfigProvider>
  );
}
