import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardManager from './pages/DashboardManager';
import DashboardStaff from './pages/DashboardStaff';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard-manager" element={<DashboardManager />} />
        <Route path="/dashboard-staff" element={<DashboardStaff />} />
      </Routes>
    </Router>
  );
}

export default App;
