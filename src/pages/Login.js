import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { API_BASE_URL } from '../apiConfig';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [selectedRole, setSelectedRole] = useState('manager');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regRole, setRegRole] = useState('staff');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regErrors, setRegErrors] = useState({});
  
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const verifyInputRefs = useRef([]);

  const platformHighlights = [
    'Real-time KPI tracking and monitoring',
    'Evidence verification and approval workflow',
    'Advanced analytics and reporting tools',
    'Secure role-based access control',
  ];

  const sectionTitleStyle = {
    fontFamily: "'Fraunces', serif",
    fontSize: '26px',
    marginBottom: '6px',
    color: '#1a2233',
  };

  const sectionSubtitleStyle = {
    fontSize: '13px',
    color: '#6b7a99',
    marginBottom: '28px',
  };

  const primaryActionButtonStyle = {
    background: '#1a3a5c',
    color: 'white',
    border: 'none',
    padding: '11px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  };

  const ghostLinkButtonStyle = {
    background: 'transparent',
    color: '#1a3a5c',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    width: '100%',
    textDecoration: 'underline',
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  const toggleVisibility = (setter) => {
    setter((prev) => !prev);
  };

  const clearFieldError = (fieldName) => {
    setRegErrors(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };

  const doLogin = async () => {
    setLoginError('');

    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginUsername.trim(),
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || 'Sign in failed. Please try again.');
        return;
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      if (data.user.role === 'staff') {
        navigate('/dashboard-staff');
      } else {
        navigate('/dashboard-manager');
      }
    } catch (error) {
      setLoginError('Cannot connect to server. Please make sure backend is running.');
    }
  };

  const doRegister = async () => {
    setRegError('');
    setRegErrors({});

    const errors = {};

    if (!regFirstName.trim()) errors.firstName = true;
    if (!regLastName.trim()) errors.lastName = true;
    if (!regPhone.trim()) errors.phone = true;
    if (!regEmail.trim()) errors.email = true;
    if (!regPassword.trim()) errors.password = true;
    if (!regConfirm.trim()) errors.confirm = true;

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      setRegError('Please fill in all fields before continuing.');
      return;
    }

    const emailValue = regEmail.trim();
    const validEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!validEmailPattern.test(emailValue)) {
      setRegErrors({ email: true });
      setRegError('Please enter a valid email address.');
      return;
    }

    if (regPassword.length < 8) {
      setRegErrors({ password: true });
      setRegError('Password must be at least 8 characters long.');
      return;
    }

    if (regPassword !== regConfirm) {
      setRegErrors({ password: true, confirm: true });
      setRegError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${regFirstName.trim()} ${regLastName.trim()}`.trim(),
          email: regEmail.trim(),
          password: regPassword,
          role: regRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setRegErrors({ email: true });
          setRegError('Email already registered. Try another email or sign in.');
          return;
        }
        setRegError(data.message || 'Failed to create account. Please try again.');
        return;
      }

      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        switchTab('login');
        resetRegisterForm();
      }, 1800);
    } catch (error) {
      setRegError('Cannot connect to server. Please make sure backend is running.');
    }
  };

  const resetRegisterForm = () => {
    setRegFirstName('');
    setRegLastName('');
    setRegPhone('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirm('');
    setRegRole('staff');
  };

  const clearForgotState = () => {
    setForgotError('');
    setForgotSuccess('');
  };

  const showForgotPass = () => {
    clearForgotState();
    switchTab('forgotPass');
  };

  const showVerifyCodeOnly = async () => {
    clearForgotState();
    const emailValue = forgotEmail.trim();
    const validEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmailPattern.test(emailValue)) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      });
      const data = await response.json();

      if (!response.ok) {
        setForgotError(data.message || 'Failed to send verification code.');
        return;
      }

      setForgotSuccess('Verification code sent. Please check your email.');
      switchTab('verifyCodeOnly');
    } catch (error) {
      setForgotError('Cannot connect to server. Please make sure backend is running.');
    }
  };

  const showResetPassword = async () => {
    clearForgotState();
    const codeValue = verifyCode.trim();

    if (!/^\d{4}$/.test(codeValue)) {
      setForgotError('Please enter the 4-digit verification code.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: codeValue,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setForgotError(data.message || 'Verification code is invalid.');
        return;
      }

      setForgotSuccess('Code verified. You can now set a new password.');
      switchTab('resetPassword');
    } catch (error) {
      setForgotError('Cannot connect to server. Please make sure backend is running.');
    }
  };

  const resetPasswordAndBackToLogin = async () => {
    clearForgotState();
    if (newPass.length < 8) {
      setForgotError('Password must be at least 8 characters.');
      return;
    }

    if (newPass !== confirmNewPass) {
      setForgotError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: verifyCode.trim(),
          newPassword: newPass,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setForgotError(data.message || 'Failed to reset password.');
        return;
      }

      setNewPass('');
      setConfirmNewPass('');
      setVerifyCode('');
      switchTab('resetSuccess');
    } catch (error) {
      setForgotError('Cannot connect to server. Please make sure backend is running.');
    }
  };

  const getFieldErrorClass = (fieldName) => {
    return regErrors[fieldName] ? 'field-error' : '';
  };

  const getLabelErrorClass = (fieldName) => {
    return regErrors[fieldName] ? 'field-error-label' : '';
  };

  const updateVerifyDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const codeChars = verifyCode.padEnd(4, ' ').split('');
    codeChars[index] = digit || ' ';
    const nextCode = codeChars.join('').replace(/\s+$/g, '');
    setVerifyCode(nextCode);

    if (digit && index < 3) {
      verifyInputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !verifyCode[index] && index > 0) {
      verifyInputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      verifyInputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < 3) {
      verifyInputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    setVerifyCode(pasted);
    const nextIndex = Math.min(pasted.length, 3);
    verifyInputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <div style={{ paddingBottom: '40px' }}>
            <div style={{ fontSize: '48px', fontWeight: '700', color: 'white', marginBottom: '8px', fontFamily: "'Fraunces', serif" }}>
              Welcome to
            </div>
            <div style={{ fontSize: '48px', fontWeight: '700', color: '#e8a020', fontFamily: "'Fraunces', serif" }}>
              KPI Manager
            </div>
          </div>

          <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'rgba(255,255,255,0.75)', marginBottom: '30px' }}>
            Track and manage Key Performance Indicators with precision. Monitor your team's progress, verify evidence, and achieve organizational goals.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {platformHighlights.map((text) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: 'white' }}>
                <i className="bi bi-check-circle-fill" style={{ fontSize: '18px', color: '#1db87a' }}></i>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            {(activeTab === 'login' || activeTab === 'register') && (
              <div id="authTabs" className="auth-tabs">
                <button
                  className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => switchTab('login')}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => switchTab('register')}
                >
                  Create Account
                </button>
              </div>
            )}

            {activeTab === 'login' && (
              <div className="form-section active">
                <h2 style={sectionTitleStyle}>
                  Sign In
                </h2>
                <p style={sectionSubtitleStyle}>
                  Enter your credentials to access your dashboard
                </p>

                {loginError && (
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(229,62,62,0.12)',
                    color: '#e53e3e',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '13px',
                  }}>
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {loginError}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="user@example.com"
                    value={loginUsername}
                    onChange={(e) => {
                      setLoginUsername(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                    />
                    <i
                      className={`bi ${showLoginPassword ? 'bi-eye-slash' : 'bi-eye'} input-eye`}
                      onClick={() => toggleVisibility(setShowLoginPassword)}
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </div>
                </div>

                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#1a2233', display: 'block', marginBottom: '10px' }}>
                    Sign in as:
                  </label>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="role"
                        value="manager"
                        checked={selectedRole === 'manager'}
                        onChange={(e) => setSelectedRole(e.target.value)}
                      />
                      <span style={{ fontSize: '14px' }}>Manager</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="role"
                        value="staff"
                        checked={selectedRole === 'staff'}
                        onChange={(e) => setSelectedRole(e.target.value)}
                      />
                      <span style={{ fontSize: '14px' }}>Staff</span>
                    </label>
                  </div>
                </div>

                <button
                  className="btn-login"
                  onClick={doLogin}
                  style={{
                    ...primaryActionButtonStyle,
                    marginBottom: '16px',
                  }}
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={showForgotPass}
                  style={ghostLinkButtonStyle}
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {activeTab === 'register' && (
              <div className="form-section active">
                <h2 style={sectionTitleStyle}>
                  Create Account
                </h2>
                <p style={sectionSubtitleStyle}>
                  Join our KPI management system
                </p>

                {regSuccess && (
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(29,184,122,0.12)',
                    color: '#1db87a',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '13px',
                  }}>
                    <i className="bi bi-check-circle me-2"></i>
                    Account created successfully! Redirecting to login...
                  </div>
                )}

                {regError && (
                  <div id="regError" style={{
                    padding: '12px 14px',
                    background: 'rgba(229,62,62,0.12)',
                    color: '#e53e3e',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '13px',
                  }}>
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {regError}
                  </div>
                )}

                <div className="mb-3">
                  <label className={`form-label ${getLabelErrorClass('email')}`}>Email</label>
                  <input
                    type="email"
                    className={`form-control ${getFieldErrorClass('email')}`}
                    placeholder="user@company.com"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      clearFieldError('email');
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label className={`form-label ${getLabelErrorClass('firstName')}`}>First Name</label>
                  <input
                    type="text"
                    className={`form-control ${getFieldErrorClass('firstName')}`}
                    value={regFirstName}
                    onChange={(e) => {
                      setRegFirstName(e.target.value);
                      clearFieldError('firstName');
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label className={`form-label ${getLabelErrorClass('lastName')}`}>Last Name</label>
                  <input
                    type="text"
                    className={`form-control ${getFieldErrorClass('lastName')}`}
                    value={regLastName}
                    onChange={(e) => {
                      setRegLastName(e.target.value);
                      clearFieldError('lastName');
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label className={`form-label ${getLabelErrorClass('phone')}`}>Phone</label>
                  <input
                    type="tel"
                    className={`form-control ${getFieldErrorClass('phone')}`}
                    value={regPhone}
                    onChange={(e) => {
                      setRegPhone(e.target.value);
                      clearFieldError('phone');
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label className={`form-label ${getLabelErrorClass('password')}`}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      className={`form-control ${getFieldErrorClass('password')}`}
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        clearFieldError('password');
                      }}
                    />
                    <i
                      className={`bi ${showRegPassword ? 'bi-eye-slash' : 'bi-eye'} input-eye`}
                      onClick={() => toggleVisibility(setShowRegPassword)}
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </div>
                  <div style={{ fontSize: '11px', color: '#1db87a', marginTop: '4px' }}>
                    {regPassword.length >= 8 ? '✓ Password length looks good' : `${regPassword.length}/8 characters`}
                  </div>
                </div>

                <div className="mb-3">
                  <label className={`form-label ${getLabelErrorClass('confirm')}`}>Confirm password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegConfirm ? 'text' : 'password'}
                      className={`form-control ${getFieldErrorClass('confirm')}`}
                      placeholder="••••••••"
                      value={regConfirm}
                      onChange={(e) => {
                        setRegConfirm(e.target.value);
                        clearFieldError('confirm');
                      }}
                    />
                    <i
                      className={`bi ${showRegConfirm ? 'bi-eye-slash' : 'bi-eye'} input-eye`}
                      onClick={() => toggleVisibility(setShowRegConfirm)}
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select role-select"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <button
                  className="btn-login"
                  onClick={doRegister}
                  style={primaryActionButtonStyle}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Create Account
                </button>
              </div>
            )}

            {activeTab === 'forgotPass' && (
              <div className="form-section active">
                <h2 style={sectionTitleStyle}>
                  Forgot Password
                </h2>
                <p style={sectionSubtitleStyle}>
                  Enter your email to reset your password
                </p>

                {forgotError && (
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(229,62,62,0.12)',
                    color: '#e53e3e',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                  }}>
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {forgotError}
                  </div>
                )}

                {forgotSuccess && (
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(29,184,122,0.12)',
                    color: '#1db87a',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                  }}>
                    <i className="bi bi-check-circle me-2"></i>
                    {forgotSuccess}
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>

                <button
                  className="btn-login"
                  onClick={showVerifyCodeOnly}
                  style={{
                    ...primaryActionButtonStyle,
                    marginBottom: '12px',
                  }}
                >
                  Send Verification Code
                </button>

                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  style={ghostLinkButtonStyle}
                >
                  Back to Sign In
                </button>
              </div>
            )}

            {activeTab === 'verifyCodeOnly' && (
              <div className="form-section active">
                <h2 style={sectionTitleStyle}>
                  Verify Code
                </h2>
                <p style={sectionSubtitleStyle}>
                  Check your email for the verification code
                </p>

                {forgotError && (
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(229,62,62,0.12)',
                    color: '#e53e3e',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                  }}>
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {forgotError}
                  </div>
                )}

                {forgotSuccess && (
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(29,184,122,0.12)',
                    color: '#1db87a',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                  }}>
                    <i className="bi bi-check-circle me-2"></i>
                    {forgotSuccess}
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label">Verification Code</label>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        ref={(element) => { verifyInputRefs.current[index] = element; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={verifyCode[index] || ''}
                        onChange={(e) => updateVerifyDigit(index, e.target.value)}
                        onKeyDown={(e) => handleVerifyKeyDown(index, e)}
                        onPaste={handleVerifyPaste}
                        style={{
                          width: '56px',
                          height: '56px',
                          textAlign: 'center',
                          fontSize: '22px',
                          fontWeight: 700,
                          border: '1.5px solid #d7dee9',
                          borderRadius: '12px',
                          background: '#f4f6fb',
                          outline: 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  className="btn-login"
                  onClick={showResetPassword}
                  style={{
                    ...primaryActionButtonStyle,
                    marginBottom: '12px',
                  }}
                >
                  Verify Code
                </button>

                <button
                  type="button"
                  onClick={() => switchTab('forgotPass')}
                  style={ghostLinkButtonStyle}
                >
                  Back
                </button>
              </div>
            )}

            {activeTab === 'resetPassword' && (
              <div className="form-section active">
                <h2 style={sectionTitleStyle}>
                  Reset Password
                </h2>
                <p style={sectionSubtitleStyle}>
                  Enter your new password
                </p>

                {forgotError && (
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(229,62,62,0.12)',
                    color: '#e53e3e',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                  }}>
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {forgotError}
                  </div>
                )}

                {forgotSuccess && (
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(29,184,122,0.12)',
                    color: '#1db87a',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                  }}>
                    <i className="bi bi-check-circle me-2"></i>
                    {forgotSuccess}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                  />
                </div>

                <button
                  className="btn-login"
                  onClick={resetPasswordAndBackToLogin}
                  style={primaryActionButtonStyle}
                >
                  Reset Password
                </button>
              </div>
            )}

            {activeTab === 'resetSuccess' && (
              <div className="form-section active" style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
                <div style={{ fontSize: '56px', color: '#1db87a', marginBottom: '16px' }}>
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <h2 style={sectionTitleStyle}>
                  Password Reset Successful
                </h2>
                <p style={{ fontSize: '13px', color: '#6b7a99', marginBottom: '28px' }}>
                  Your password has been reset. You can now sign in with your new password.
                </p>

                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  style={primaryActionButtonStyle}
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
