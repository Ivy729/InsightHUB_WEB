import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
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
  const [staffList, setStaffList] = useState([]);
  const [kpiList, setKpiList] = useState([]);
  const [apiError, setApiError] = useState('');
  const [evidenceList, setEvidenceList] = useState([]);
  const [currentUser, setCurrentUser] = useState({ name: 'Manager User', role: 'manager' });

  const pageTitles = {
    dashboard: 'Dashboard',
    kpiManage: 'Manage KPIs',
    verify: 'Verify Evidence',
    staff: 'Staff Members',
    profile: 'My Profile',
    settings: 'Settings'
  };

  useEffect(() => {
    let parsedUser = null;
    try {
      parsedUser = JSON.parse(localStorage.getItem('authUser') || 'null');
    } catch (error) {
      parsedUser = null;
    }

    if (!parsedUser) {
      navigate('/login');
      return;
    }
    if (parsedUser.role !== 'manager') {
      navigate('/login');
      return;
    }

    setCurrentUser({
      name: parsedUser.name || 'Manager User',
      role: parsedUser.role || 'manager',
    });

    const fetchKpis = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/kpis`);
        const mappedKpis = response.data.map((kpi, index) => {
          const targetValue = Number(kpi.target) || 0;
          const progressValue = Number(kpi.progress) || 0;
          const status = progressValue >= targetValue && targetValue > 0 ? 'achieved' : 'in-progress';

          return {
            num: index + 1,
            title: kpi.title || 'Untitled KPI',
            desc: `Progress ${progressValue}/${targetValue || '-'}`,
            staff: kpi.owner || 'Unassigned',
            dept: 'N/A',
            target: String(kpi.target ?? '-'),
            startDate: '-',
            deadline: '-',
            status
          };
        });

        setKpiList(mappedKpis);
        setApiError('');
      } catch (error) {
        setApiError('Failed to load KPIs from backend API.');
        setKpiList([]);
      }
    };

    fetchKpis();
  }, [navigate]);

  const showPage = (pageId) => {
    setCurrentPage(pageId);
    setPageTitle(pageTitles[pageId] || 'Dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage staffList={staffList} kpiList={kpiList} />;
      case 'kpiManage':
        return <KpiManagePage kpiList={kpiList} setKpiList={setKpiList} staffList={staffList} />;
      case 'verify':
        return <VerifyPage evidenceList={evidenceList} setEvidenceList={setEvidenceList} />;
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        currentPage={currentPage}
        showPage={showPage}
        handleLogout={handleLogout}
        pendingEvidenceCount={evidenceList.length}
        userName={currentUser.name}
        userRole={currentUser.role}
      />
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Topbar pageTitle={pageTitle} userName={currentUser.name} />
        <div style={{ padding: '26px 28px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {apiError && (
            <div style={{
              marginBottom: '12px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #f5c2c7',
              background: '#f8d7da',
              color: '#842029',
              fontSize: '13px'
            }}>
              {apiError}
            </div>
          )}
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default DashboardManager;
