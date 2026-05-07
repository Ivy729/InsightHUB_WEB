import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
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
  const [selectedKpiId, setSelectedKpiId] = useState(null);
  const [staffKpis, setStaffKpis] = useState([]);
  const [apiError, setApiError] = useState('');
  const [currentUser, setCurrentUser] = useState({ name: 'Staff User', role: 'staff', email: '' });

  const pageTitles = {
    dashboard: 'Dashboard',
    myKpis: 'My KPIs',
    updateProgress: 'Update Progress',
    submitEvidence: 'Submit Evidence',
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
    if (parsedUser.role !== 'staff') {
      navigate('/login');
      return;
    }

    setCurrentUser({
      name: parsedUser.name || 'Staff User',
      role: parsedUser.role || 'staff',
      email: parsedUser.email || '',
    });

    const fetchKpis = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/kpis`);

        const normalizedName = (parsedUser.name || '').trim().toLowerCase();
        const normalizedEmail = (parsedUser.email || '').trim().toLowerCase();

        const userKpis = response.data
          .filter((kpi) => {
            const owner = (kpi.owner || '').trim().toLowerCase();
            return owner && (owner === normalizedName || owner === normalizedEmail);
          })
          .map((kpi) => {
            const progress = Number(kpi.progress) || 0;
            let status = 'in-progress';
            
            // Check if deadline has passed (use end of day for comparison)
            if (kpi.deadline) {
              const deadlineDate = new Date(kpi.deadline);
              // Set to end of day (23:59:59)
              deadlineDate.setHours(23, 59, 59, 999);
              
              const today = new Date();
              // Set today to start of day
              today.setHours(0, 0, 0, 0);
              
              if (deadlineDate < today && progress < 100) {
                status = 'overdue';
              } else if (progress >= 100) {
                status = 'achieved';
              } else if (progress > 0) {
                status = 'in-progress';
              }
            } else if (progress >= 100) {
              status = 'achieved';
            } else if (progress > 0) {
              status = 'in-progress';
            }

            return {
              id: kpi._id,
              title: kpi.title || 'Untitled KPI',
              subtitle: 'Assigned KPI',
              category: 'General',
              target: String(kpi.target ?? '-'),
              progress,
              deadline: kpi.deadline || '-',
              status,
            };
          });

        setStaffKpis(userKpis);
        setSelectedKpiId(userKpis[0]?.id || null);
        setApiError('');
      } catch (error) {
        setApiError('Failed to load KPI data from backend.');
        setStaffKpis([]);
        setSelectedKpiId(null);
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

  const openUpdateForKpi = (kpiId) => {
    setSelectedKpiId(kpiId);
    showPage('updateProgress');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <StaffDashboardPage userName={currentUser.name} kpis={staffKpis} />;
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
        return <StaffDashboardPage userName={currentUser.name} kpis={staffKpis} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <StaffSidebar currentPage={currentPage} showPage={showPage} handleLogout={handleLogout} userName={currentUser.name} userRole={currentUser.role} />
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <StaffTopbar pageTitle={pageTitle} userName={currentUser.name} />
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

export default DashboardStaff;
