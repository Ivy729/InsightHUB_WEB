import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard-staff.css';
import StaffSidebar from '../components/StaffSidebar';
import StaffTopbar from '../components/StaffTopbar';
import StaffDashboardPage from '../components/staff/DashboardPage';
import MyKpisPage from '../components/staff/MyKpisPage';
import UpdateProgressPage from '../components/staff/UpdateProgressPage';
import SubmitEvidencePage from '../components/staff/SubmitEvidencePage';
import StaffProfilePage from '../components/staff/SettingsPage';
import StaffSettingsPage from '../components/staff/SettingsPageActual';

const DashboardStaff = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const pageTitles = {
    dashboard: 'Dashboard',
    myKpis: 'My KPIs',
    updateProgress: 'Update Progress',
    submitEvidence: 'Submit Evidence',
    profile: 'My Profile',
    settings: 'Settings'
  };

  const showPage = (pageId) => {
    setCurrentPage(pageId);
    setPageTitle(pageTitles[pageId] || 'Dashboard');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <StaffDashboardPage />;
      case 'myKpis':
        return <MyKpisPage />;
      case 'updateProgress':
        return <UpdateProgressPage />;
      case 'submitEvidence':
        return <SubmitEvidencePage />;
      case 'profile':
        return <StaffProfilePage />;
      case 'settings':
        return <StaffSettingsPage />;
      default:
        return <StaffDashboardPage />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <StaffSidebar currentPage={currentPage} showPage={showPage} handleLogout={handleLogout} />
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <StaffTopbar pageTitle={pageTitle} />
        <div style={{ padding: '26px 28px', flex: 1, overflowY: 'auto' }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default DashboardStaff;
