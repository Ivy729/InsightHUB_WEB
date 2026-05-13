import React, { useState, useEffect, useMemo } from 'react';
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
import { resolveUserAvatarSrc } from '../utils/resolveUserAvatarSrc';
import { getEffectiveKpiStatus } from '../utils/getEffectiveKpiStatus';

const DashboardManager = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [staffList, setStaffList] = useState([]);
  const [kpiList, setKpiList] = useState([]);
  const [apiError, setApiError] = useState('');
  const [evidenceError, setEvidenceError] = useState('');
  const [evidenceList, setEvidenceList] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    name: 'Manager User',
    role: 'manager',
    profilePhoto: '',
    avatarPath: '',
  });

  const managerAvatarSrc = useMemo(() => resolveUserAvatarSrc(currentUser), [currentUser]);

  const pageTitles = {
    dashboard: 'Dashboard',
    kpiManage: 'Manage KPIs',
    verify: 'Verify Evidence',
    staff: 'Staff Members',
    profile: 'My Profile',
    settings: 'Settings'
  };

  const fetchStaff = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setStaffList([]);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/staff`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setStaffList(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffList([]);
      const msg = error.response?.data?.message;
      if (msg) setApiError(msg);
    }
  };

  const fetchKpis = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setKpiList([]);
      setApiError('Missing login token. Please sign in again.');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/kpis`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const mappedKpis = response.data.map((kpi) => {
        const progressValue = Number(kpi.progress) || 0;
        const taskSteps = Array.isArray(kpi.taskSteps)
          ? kpi.taskSteps.map((s) => String(s || '').trim()).filter(Boolean)
          : [];
        let taskStepDone = Array.isArray(kpi.taskStepDone) ? kpi.taskStepDone.map(Boolean) : [];
        while (taskStepDone.length < taskSteps.length) taskStepDone.push(false);
        taskStepDone = taskStepDone.slice(0, taskSteps.length);

        const status = getEffectiveKpiStatus(kpi);

        return {
          _id: kpi._id,
          title: kpi.title || 'Untitled KPI',
          desc: kpi.desc || '',
          staff: kpi.staff || 'Unassigned',
          dept: kpi.dept || 'N/A',
          taskSteps,
          taskStepDone,
          owner: String(kpi.owner || '').trim() || '—',
          target:
            taskSteps.length > 0
              ? `${taskSteps.length} step(s)`
              : String(kpi.target ?? '-'),
          targetNum: Number(kpi.target) || 0,
          startDate: kpi.startDate || '-',
          deadline: kpi.deadline || '-',
          status,
          progress: progressValue,
          createdAt: kpi.createdAt,
          updatedAt: kpi.updatedAt,
        };
      });

      setKpiList(mappedKpis);
      setApiError('');
    } catch (error) {
      const msg = error.response?.data?.message;
      setApiError(
        msg || 'Failed to load KPIs from backend API.'
      );
      setKpiList([]);
    }
  };

  const fetchEvidenceQueue = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setEvidenceList([]);
      setEvidenceError('Missing login token. Please sign in again.');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/manager/evidence-queue`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const mappedEvidence = response.data.map((item) => ({
        id: item._id,
        staff: item.staffId?.name || 'Unknown Staff',
        kpi: item.kpiId?.title || 'Unknown KPI',
        evidence: item.originalFileName || 'No file name',
        submitted: item.submittedAt
          ? new Date(item.submittedAt).toLocaleDateString()
          : '-',
        status: item.status,
        downloadConsumed: Boolean(item.managerDownloadConsumed),
      }));

      setEvidenceList(mappedEvidence);
      setEvidenceError('');
    } catch (error) {
      setEvidenceList([]);
      setEvidenceError('Failed to load evidence queue from backend API.');
    }
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
    if (String(parsedUser.role || '').toLowerCase() !== 'manager') {
      navigate('/login');
      return;
    }

    setCurrentUser({
      name: parsedUser.name || 'Manager User',
      role: parsedUser.role || 'manager',
      profilePhoto: parsedUser.profilePhoto || '',
      avatarPath: parsedUser.avatarPath || '',
    });

    fetchStaff();
    fetchKpis();
    fetchEvidenceQueue();
  }, [navigate]);

  const handleVerifyEvidence = async (id, action) => {
    const authToken = localStorage.getItem('authToken');
    const status = action === 'Approved' ? 'approved' : 'rejected';

    if (!authToken) {
      setEvidenceError('Missing login token. Please sign in again.');
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/manager/verify-evidence/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setEvidenceList((previous) =>
        previous
          .map((item) => (item.id === id ? { ...item, status } : item))
          .filter((item) => item.status === 'pending')
      );
      setEvidenceError('');
      await fetchKpis();
    } catch (error) {
      setEvidenceError('Failed to verify evidence. Please try again.');
    }
  };

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
        return <KpiManagePage kpiList={kpiList} setKpiList={setKpiList} staffList={staffList} refreshStaffList={fetchStaff} />;
      case 'verify':
        return (
          <VerifyPage
            evidenceList={evidenceList}
            onVerifyEvidence={handleVerifyEvidence}
            evidenceError={evidenceError}
            onEvidenceDownloaded={fetchEvidenceQueue}
          />
        );
      case 'staff':
        return <StaffPage staffList={staffList} setStaffList={setStaffList} />;
      case 'profile':
        return (
          <ProfilePage
            onUserUpdated={(u) => {
              if (!u) return;
              setCurrentUser((prev) => ({
                ...prev,
                name: u.name ?? prev.name,
                role: u.role ?? prev.role,
                profilePhoto: u.profilePhoto != null ? u.profilePhoto : prev.profilePhoto,
                avatarPath: u.avatarPath != null ? u.avatarPath : prev.avatarPath,
              }));
            }}
          />
        );
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage staffList={staffList} kpiList={kpiList} />;
    }
  };

  const handleNotificationClick = (notif) => {
    if (['evidence-submitted', 'pending-evidence'].includes(notif.actionType)) {
      showPage('verify');
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
        avatarSrc={managerAvatarSrc}
      />
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Topbar
          pageTitle={pageTitle}
          userName={currentUser.name}
          avatarSrc={managerAvatarSrc}
          onNotificationClick={handleNotificationClick}
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
          {evidenceError && (
            <div style={{
              marginBottom: '12px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #f5c2c7',
              background: '#f8d7da',
              color: '#842029',
              fontSize: '13px'
            }}>
              {evidenceError}
            </div>
          )}
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default DashboardManager;
