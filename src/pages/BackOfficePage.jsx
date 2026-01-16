import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import Dashboard from '../components/Pages/Dashboard';
import Users from '../components/Pages/Users';
import Complaints from '../components/Pages/Complaints';
import Parcels from '../components/Pages/Parcels';
import Scan from '../components/Pages/Scan';
import Export from '../components/Pages/Export';
import AuditLogs from '../components/Pages/AuditLogs';
import { HEADER_MAP } from '../utils/constants';
import { apiService } from '../services/api';

import ErrorBoundary from '../components/Layout/ErrorBoundary';
import { DataProvider } from '../contexts/DataContext';

const BackOfficePage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminName, setAdminName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = () => {
      const savedAdmin = localStorage.getItem('admin');
      const savedLoginStatus = localStorage.getItem('isLoggedIn');

      if (savedLoginStatus !== 'true' || !savedAdmin) {
        navigate('/login');
        return;
      }

      try {
        const admin = JSON.parse(savedAdmin);
        setAdminName(admin.name || 'ผู้ดูแลระบบ');

        // Set admin name in API service
        apiService.setAdminName(admin.name);

        // Restore last active tab
        const lastTab = localStorage.getItem('lastTab');
        if (lastTab && HEADER_MAP[lastTab]) {
          setActiveTab(lastTab);
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        navigate('/login');
      }
    };

    checkLogin();
  }, [navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    localStorage.setItem('lastTab', tab);
  };

  const handleLogout = async () => {
    if (window.confirm('คุณแน่ใจว่าต้องการออกจากระบบ?')) {
      await apiService.logout();
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const currentHeader = HEADER_MAP[activeTab] || HEADER_MAP.dashboard;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <Users />;
      case 'complaints':
        return <Complaints />;
      case 'parcels':
        return <Parcels />;
      case 'scan':
        return <Scan />;
      case 'export':
        return <Export />;
      case 'audit-logs':
        return <AuditLogs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <DataProvider>
        <div className="backoffice-page">
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            adminName={adminName}
            onLogout={handleLogout}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="content" style={{
            marginLeft: window.innerWidth >= 768 ? (sidebarOpen ? '250px' : '250px') : '0',
            transition: 'margin-left 0.3s ease'
          }}>
            <Header
              title={currentHeader.title}
              subtitle={currentHeader.subtitle}
              adminName={adminName}
              onMenuToggle={toggleSidebar}
              onLogout={handleLogout}
            />

            <div className="container-fluid py-4">
              {renderContent()}
            </div>
          </div>
        </div>
      </DataProvider>
    </ErrorBoundary>
  );
};

export default BackOfficePage;