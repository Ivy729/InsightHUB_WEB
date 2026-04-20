import React, { useState } from 'react';

const SettingsPage = () => {
  const [use24Hour, setUse24Hour] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const display12 = String(now.getHours() % 12 || 12).padStart(2, '0') + ':' + minutes + ' ' + ampm;
    return use24Hour ? hours + ':' + minutes : display12;
  };

  const passwordStrength = newPass.length >= 8 ? (newPass.length / 20) * 100 : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}><span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>System Preferences</span></div>
        <div style={{ padding: '18px 22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Time Format</label>
            <div style={{ display: 'flex', gap: '6px', background: '#f4f6fb', borderRadius: '8px', padding: '3px' }}>
              {['12-Hour', '24-Hour'].map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setUse24Hour(idx === 1)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                    background: (idx === 0 && !use24Hour) || (idx === 1 && use24Hour) ? 'white' : 'transparent',
                    color: (idx === 0 && !use24Hour) || (idx === 1 && use24Hour) ? '#1a3a5c' : '#6b7a99',
                    transition: 'all 0.2s'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#f4f6fb', borderRadius: '12px', padding: '16px', textAlign: 'center', marginTop: '12px' }}>
            <i className="bi bi-clock" style={{ fontSize: '18px', color: '#6b7a99', marginRight: '8px' }}></i>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 700, color: '#1a2233' }}>
              {getCurrentTime()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}><span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>Security</span></div>
        <div style={{ padding: '18px 22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Current Password</label>
            <input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>New Password</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }} />
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '20px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(passwordStrength, 100)}%`, background: '#1a3a5c', borderRadius: '20px' }}></div>
                </div>
                <span style={{ fontSize: '11px', color: '#6b7a99' }}>{newPass.length}/20</span>
              </div>
              <span style={{ fontSize: '11px', color: '#6b7a99' }}>Must be at least 8 characters</span>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Confirm Password</label>
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid ' + (confirmPass && newPass !== confirmPass ? '#e53e3e' : '#e2e8f0'), borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }} />
            {confirmPass && newPass !== confirmPass && <div style={{ fontSize: '11px', color: '#e53e3e', marginTop: '4px' }}><i className="bi bi-exclamation-circle"></i> Passwords do not match</div>}
          </div>

          <button style={{ background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: (currentPass && newPass && confirmPass && newPass === confirmPass && newPass.length >= 8) ? 1 : 0.5 }}>
            <i className="bi bi-lock"></i> Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
