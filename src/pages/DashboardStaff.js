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
  const [selectedKpiId, setSelectedKpiId] = useState(1);
  const [staffKpis, setStaffKpis] = useState([
    { id: 1, title: 'Research Publications', subtitle: 'Publish 3 journal papers', category: 'Research', target: '3 papers', progress: 67, deadline: 'Dec 2025', status: 'in-progress' },
    { id: 2, title: 'Student Pass Rate', subtitle: 'Maintain 90% pass rate', category: 'Teaching', target: '90%', progress: 100, deadline: 'Jun 2025', status: 'achieved' },
    { id: 3, title: 'Community Service', subtitle: '5 outreach programs', category: 'Service', target: '5 events', progress: 30, deadline: 'Mar 2025', status: 'overdue' }
  ]);

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

  const openUpdateForKpi = (kpiId) => {
    setSelectedKpiId(kpiId);
    showPage('updateProgress');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <StaffDashboardPage />;
      case 'myKpis':
        return <MyKpisPage kpis={staffKpis} onUpdateKpi={openUpdateForKpi} />;
      case 'updateProgress':
        return (
          <UpdateProgressPage
            kpis={staffKpis}
            selectedKpiId={selectedKpiId}
            setSelectedKpiId={setSelectedKpiId}
            setKpis={setStaffKpis}
          />
        );
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <StaffSidebar currentPage={currentPage} showPage={showPage} handleLogout={handleLogout} />
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <StaffTopbar pageTitle={pageTitle} />
        <div style={{ padding: '26px 28px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default DashboardStaff;
