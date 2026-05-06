import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';
import { api } from '../apiClient';
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
  const [notifications, setNotifications] = useState([]);
  const [apiError, setApiError] = useState('');
  const [currentUser, setCurrentUser] = useState({ name: 'Staff User', role: 'staff', email: '', avatarPath: '' });

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
      avatarPath: parsedUser.avatarPath || '',
    });

    const fetchUserAndKpis = async () => {
      try {
        const [meRes, kpisRes, notifRes] = await Promise.all([
          api.get(`/api/users/me`),
          api.get(`/api/kpis`),
          api.get(`/api/notifications/mine`),
        ]);

        const me = meRes.data?.user || null;
        if (me) {
          const nextUser = {
            name: me.name || parsedUser.name || 'Staff User',
            role: me.role || parsedUser.role || 'staff',
            email: me.email || parsedUser.email || '',
            avatarPath: me.avatarPath || parsedUser.avatarPath || '',
          };
          setCurrentUser(nextUser);
          localStorage.setItem('authUser', JSON.stringify(nextUser));
        }

        const normalizedName = ((me?.name || parsedUser.name) || '').trim().toLowerCase();
        const normalizedEmail = ((me?.email || parsedUser.email) || '').trim().toLowerCase();

        const userKpis = (kpisRes.data || [])
          .filter((kpi) => {
            const owner = (kpi.owner || '').trim().toLowerCase();
            return owner && (owner === normalizedName || owner === normalizedEmail);
          })
          .map((kpi) => {
            const progress = Number(kpi.progress) || 0;
            let status = 'in-progress';
            if (progress >= 100) status = 'achieved';
            else if (progress < 50) status = 'overdue';

            return {
              id: kpi._id,
              title: kpi.title || 'Untitled KPI',
              subtitle: 'Assigned KPI',
              category: 'General',
              target: String(kpi.target ?? '-'),
              progress,
              deadline: kpi.deadline ? new Date(kpi.deadline).toLocaleDateString() : '-',
              status,
            };
          });

        setStaffKpis(userKpis);
        setSelectedKpiId(userKpis[0]?.id || null);
        setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
        setApiError('');
      } catch (error) {
        setApiError('Failed to load KPI data from backend.');
        setStaffKpis([]);
        setSelectedKpiId(null);
      }
    };

    fetchUserAndKpis();
    const interval = setInterval(fetchUserAndKpis, 60000);
    return () => clearInterval(interval);
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
        return <SubmitEvidencePage kpis={staffKpis} />;
      case 'profile':
        return (
          <StaffProfilePage
            onUserUpdated={(nextAuthUser) => {
              if (!nextAuthUser) return;
              setCurrentUser((prev) => ({
                ...prev,
                name: nextAuthUser.name || prev.name,
                role: nextAuthUser.role || prev.role,
                email: nextAuthUser.email || prev.email,
                avatarPath: nextAuthUser.avatarPath || prev.avatarPath,
              }));
            }}
          />
        );
      case 'settings':
        return <StaffSettingsPage />;
      default:
        return <StaffDashboardPage userName={currentUser.name} kpis={staffKpis} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <StaffSidebar
        currentPage={currentPage}
        showPage={showPage}
        handleLogout={handleLogout}
        userName={currentUser.name}
        userRole={currentUser.role}
        avatarPath={currentUser.avatarPath}
      />
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <StaffTopbar
          pageTitle={pageTitle}
          userName={currentUser.name}
          avatarPath={currentUser.avatarPath}
          notifications={notifications}
        />
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
