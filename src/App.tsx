/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

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
            <Route path="*" element={<div style={{ padding: 24 }}>Page Not Found</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
