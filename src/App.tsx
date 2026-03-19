/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { getThemeConfig } from './theme';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { DealProfile } from './pages/DealProfile';
import { QuoteDetail } from './pages/QuoteDetail';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { CustomerList } from './pages/CustomerList';
import { CustomerProfile } from './pages/CustomerProfile';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployeeList } from './pages/EmployeeList';
import { EmployeeProfile } from './pages/EmployeeProfile';
import { PartnerDashboard } from './pages/PartnerDashboard';
import { PartnerList } from './pages/PartnerList';
import { PartnerProfile } from './pages/PartnerProfile';
import { AssetDashboard } from './pages/AssetDashboard';
import { AssetList } from './pages/AssetList';
import { AssetProfile } from './pages/AssetProfile';
import { AssetCalendar } from './pages/AssetCalendar';
import { InventoryList } from './pages/InventoryList';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ConfigProvider theme={getThemeConfig(isDarkMode)}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="deal/:id" element={<DealProfile />} />
            <Route path="quote/:id" element={<QuoteDetail />} />
            <Route path="customers/dashboard" element={<CustomerDashboard />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="customer/:id" element={<CustomerProfile />} />
            <Route path="employees/dashboard" element={<EmployeeDashboard />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employee/:id" element={<EmployeeProfile />} />
            <Route path="partners/dashboard" element={<PartnerDashboard />} />
            <Route path="partners" element={<PartnerList />} />
            <Route path="partner/:id" element={<PartnerProfile />} />
            <Route path="assets/dashboard" element={<AssetDashboard />} />
            <Route path="assets" element={<AssetList />} />
            <Route path="assets/calendar" element={<AssetCalendar />} />
            <Route path="assets/inventory" element={<InventoryList />} />
            <Route path="asset/:id" element={<AssetProfile />} />
            <Route path="*" element={<div style={{ padding: 24 }}>Page Not Found</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
