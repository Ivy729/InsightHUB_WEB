import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard-manager.css';
import Sidebar from '../components/ManagerSidebar';
import Topbar from '../components/ManagerTopbar';
import DashboardPage from '../components/manager/DashboardPage';
import KpiManagePage from '../components/manager/KpiManagePage';
import VerifyPage from '../components/manager/VerifyPage';
import StaffPage from '../components/manager/StaffPage';
import ProfilePage from '../components/manager/ProfilePage';
import SettingsPage from '../components/manager/SettingsPage';

const DashboardManager = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [staffList, setStaffList] = useState([
    {
      id: 1,
      firstName: 'Ali',
      lastName: 'Samsuri',
      department: 'Research Dept.',
      email: 'ali.samsuri@university.edu.my',
      phone: '+60123456789',
      kpis: 5,
      completion: 80,
      avatarColor: '#1a3a5c'
    },
    {
      id: 2,
      firstName: 'Nora',
      lastName: 'Rahman',
      department: 'Teaching Dept.',
      email: 'nora.rahman@university.edu.my',
      phone: '+60123456790',
      kpis: 4,
      completion: 100,
      avatarColor: '#6b7a99'
    },
    {
      id: 3,
      firstName: 'Kevin',
      lastName: 'Lim',
      department: 'Service Dept.',
      email: 'kevin.lim@university.edu.my',
      phone: '+60123456791',
      kpis: 3,
      completion: 30,
      avatarColor: '#e8a020'
    },
    {
      id: 4,
      firstName: 'Maya',
      lastName: 'Halim',
      department: 'Research Dept.',
      email: 'maya.halim@university.edu.my',
      phone: '+60123456792',
      kpis: 4,
      completion: 55,
      avatarColor: '#1db87a'
    }
  ]);

  const [kpiList, setKpiList] = useState([
    {
      num: 1,
      title: 'Research Publications',
      desc: 'Publish 3 journal papers',
      staff: 'Ali Samsuri',
      dept: 'Research Dept.',
      target: '3 papers',
      startDate: '01/01/2025',
      deadline: '31/12/2025',
      status: 'in-progress'
    },
    {
      num: 2,
      title: 'Student Pass Rate',
      desc: 'Maintain 90% pass rate',
      staff: 'Nora Rahman',
      dept: 'Teaching Dept.',
      target: '90%',
      startDate: '01/01/2025',
      deadline: '30/06/2025',
      status: 'achieved'
    },
    {
      num: 3,
      title: 'Community Service',
      desc: '5 outreach programs',
      staff: 'Kevin Lim',
      dept: 'Service Dept.',
      target: '5 events',
      startDate: '01/01/2025',
      deadline: '31/03/2025',
      status: 'overdue'
    },
    {
      num: 4,
      title: 'Industry Grants',
      desc: 'Secure 2 industry grants',
      staff: 'Maya Halim',
      dept: 'Research Dept.',
      target: '2 grants',
      startDate: '01/01/2025',
      deadline: '30/09/2025',
      status: 'in-progress'
    }
  ]);

  const pageTitles = {
    dashboard: 'Dashboard',
    kpiManage: 'Manage KPIs',
    verify: 'Verify Evidence',
    staff: 'Staff Members',
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
        return <DashboardPage staffList={staffList} kpiList={kpiList} />;
      case 'kpiManage':
        return <KpiManagePage kpiList={kpiList} setKpiList={setKpiList} staffList={staffList} />;
      case 'verify':
        return <VerifyPage kpiList={kpiList} />;
      case 'staff':
        return <StaffPage staffList={staffList} setStaffList={setStaffList} kpiList={kpiList} setKpiList={setKpiList} />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage staffList={staffList} kpiList={kpiList} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar currentPage={currentPage} showPage={showPage} handleLogout={handleLogout} />
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar pageTitle={pageTitle} />
        <div style={{ padding: '26px 28px', flex: 1, overflowY: 'auto' }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default DashboardManager;
