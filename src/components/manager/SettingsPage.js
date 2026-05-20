import React, { useState } from 'react';
import { api } from '../../apiClient';
import PasswordFieldWithToggle from '../PasswordFieldWithToggle';

const SettingsPage = () => {
  const [use24Hour, setUse24Hour] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const getTimePreview = () => {
    const now = new Date();
    if (use24Hour) {
      return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } else {
      return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/api/users/me/password', {
        currentPassword,
        newPassword,
      });
      alert('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          'Failed to update password. Please try again.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      {/* SYSTEM PREFERENCES */}
      <div style={{
        background: 'white',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '22px 28px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#f4f6fb',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <i className="bi bi-display" style={{ fontSize: '19px', color: '#1a3a5c' }}></i>
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', fontWeight: 700, color: '#1a2233' }}>
              System Preferences
            </div>
            <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '2px' }}>
              Customize how the system displays information
            </div>
          </div>
        </div>

        {/* Time Format */}
        <div style={{
          padding: '22px 28px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a2233' }}>Time Format</div>
            <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '3px' }}>
              Choose how times are displayed throughout the system
            </div>
          </div>
          <div style={{ display: 'flex', border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
            <button
              onClick={() => setUse24Hour(false)}
              style={{
                padding: '7px 22px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: !use24Hour ? '#1a3a5c' : 'transparent',
                color: !use24Hour ? 'white' : '#6b7a99',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.18s'
              }}
            >
              12-Hour
            </button>
            <button
              onClick={() => setUse24Hour(true)}
              style={{
                padding: '7px 22px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: use24Hour ? '#1a3a5c' : 'transparent',
                color: use24Hour ? 'white' : '#6b7a99',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.18s'
              }}
            >
              24-Hour
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{ padding: '22px 28px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#6b7a99', marginBottom: '14px' }}>
            Live Preview
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px 24px',
              background: '#f4f6fb',
              minWidth: '180px'
            }}>
              <i className="bi bi-clock" style={{ fontSize: '22px', color: '#1a2233' }}></i>
              <span style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '26px',
                fontWeight: 700,
                color: '#1a2233',
                letterSpacing: '1px',
                minWidth: '130px'
              }}>
                {getTimePreview()}
              </span>
            </div>
            <span style={{ fontSize: '13px', color: '#6b7a99' }}>
              Current system time displayed in your selected format.
            </span>
          </div>
        </div>
      </div>

      {/* SECURITY */}
      <div style={{
        background: 'white',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '22px 28px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(29,184,122,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <i className="bi bi-shield-lock-fill" style={{ fontSize: '19px', color: '#1db87a' }}></i>
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', fontWeight: 700, color: '#1a2233' }}>
              Security
            </div>
            <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '2px' }}>
              Manage your account password and security settings
            </div>
          </div>
        </div>

        <div style={{ padding: '22px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <PasswordFieldWithToggle
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div>
              <PasswordFieldWithToggle
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <div style={{
                height: '4px',
                borderRadius: '4px',
                background: '#e2e8f0',
                marginTop: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((newPassword.length / 12) * 100, 100)}%`,
                  background: '#1db87a',
                  borderRadius: '4px'
                }}></div>
              </div>
              <div style={{ fontSize: '11px', color: '#6b7a99', marginTop: '4px' }}>
                {newPassword.length < 8 ? `${newPassword.length}/8 characters - too short` : 'Password length looks good'}
              </div>
            </div>
            <div>
              <PasswordFieldWithToggle
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={savingPassword}
            style={{
              background: '#1a3a5c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: savingPassword ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: savingPassword ? 0.7 : 1,
            }}
          >
            <i className="bi bi-shield-lock"></i> {savingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
