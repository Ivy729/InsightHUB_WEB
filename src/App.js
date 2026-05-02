import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardManager from './pages/DashboardManager';
import DashboardStaff from './pages/DashboardStaff';

const getAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem('authUser') || 'null');
  } catch (error) {
    return null;
  }
};

const RequireRole = ({ role, children }) => {
  const authUser = getAuthUser();

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (authUser.role !== role) {
    return authUser.role === 'manager'
      ? <Navigate to="/dashboard-manager" replace />
      : <Navigate to="/dashboard-staff" replace />;
  }

  return children;
};

const PublicLoginRoute = ({ children }) => {
  const authUser = getAuthUser();
  if (!authUser) return children;
  return authUser.role === 'manager'
    ? <Navigate to="/dashboard-manager" replace />
    : <Navigate to="/dashboard-staff" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={(
            <PublicLoginRoute>
              <Login />
            </PublicLoginRoute>
          )}
        />
        <Route
          path="/dashboard-manager"
          element={(
            <RequireRole role="manager">
              <DashboardManager />
            </RequireRole>
          )}
        />
        <Route
          path="/dashboard-staff"
          element={(
            <RequireRole role="staff">
              <DashboardStaff />
            </RequireRole>
          )}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
