import React, { useState } from 'react';

const ProfilePage = () => {
  const [firstName, setFirstName] = useState('Ali');
  const [lastName, setLastName] = useState('Samsuri');

  return (
    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}><span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>Profile Information</span></div>
      <div style={{ padding: '28px', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '180px', paddingTop: '8px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#1a3a5c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: 'white', fontWeight: 700, marginBottom: '12px', cursor: 'pointer' }}>AS</div>
          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px', textAlign: 'center' }}>{firstName} {lastName}</div>
          <div style={{ color: '#6b7a99', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>Staff · Research Department</div>
          <button style={{ background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Change Photo</button>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Email</label>
              <input type="email" defaultValue="ali.samsuri@university.edu.my" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Phone</label>
              <input type="tel" defaultValue="+60123456789" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Department</label>
              <input type="text" defaultValue="Research Department" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }} />
            </div>
          </div>
          <button style={{ marginTop: '20px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i className="bi bi-check-lg"></i> Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
