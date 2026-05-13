import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../apiClient';
import { API_BASE_URL } from '../../apiConfig';
import { DEPARTMENT_OPTIONS, isDepartmentOption } from '../../constants/departments';

const ProfilePage = ({ onUserUpdated } = {}) => {
  const authUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('authUser') || 'null');
    } catch (error) {
      return null;
    }
  }, []);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(authUser?.email || '');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [displayRole, setDisplayRole] = useState('Staff');
  const [saving, setSaving] = useState(false);
  const [avatarPath, setAvatarPath] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/users/me');
        const me = res.data?.user;
        if (!me) return;

        setFirstName(me.firstName || (me.name || '').split(' ')[0] || '');
        setLastName(me.lastName || (me.name || '').split(' ').slice(1).join(' ') || '');
        setEmail(me.email || '');
        setPhone(me.phone || '');
        setDepartment(me.department || '');
        setDisplayRole(String(me.role || '').toLowerCase() === 'manager' ? 'Manager' : 'Staff');
        setAvatarPath(me.avatarPath || '');
      } catch (error) {
        // keep local values
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!isDepartmentOption(department)) {
      alert('Please select a department from the list.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/api/users/me', {
        firstName,
        lastName,
        phone,
        department,
      });
      const user = res.data?.user;
      if (user) {
        const nextAuthUser = {
          name: user.name,
          role: user.role,
          email: user.email,
          avatarPath: user.avatarPath || avatarPath || '',
          department: user.department || department,
        };
        localStorage.setItem('authUser', JSON.stringify(nextAuthUser));
        if (typeof onUserUpdated === 'function') {
          onUserUpdated(nextAuthUser);
        }
      }
      alert('Profile changes saved!');
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          'Failed to save profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const initials = `${(firstName || '').trim()[0] || ''}${(lastName || '').trim()[0] || ''}`.toUpperCase() || 'U';

  const openAvatarPicker = () => {
    avatarInputRef.current?.click();
  };

  const onAvatarSelected = async (e) => {
    const selected = e.target.files && e.target.files[0];
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      alert('Please select an image file.');
      e.target.value = '';
      return;
    }
    if (selected.size > 3 * 1024 * 1024) {
      alert('Image is too large. Maximum allowed size is 3MB.');
      e.target.value = '';
      return;
    }

    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append('avatar', selected);
      const res = await api.post('/api/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const next = res.data?.avatarPath || res.data?.user?.avatarPath || '';
      setAvatarPath(next);
      try {
        const prev = JSON.parse(localStorage.getItem('authUser') || 'null') || {};
        const nextAuthUser = { ...prev, avatarPath: next };
        localStorage.setItem('authUser', JSON.stringify(nextAuthUser));
        if (typeof onUserUpdated === 'function') {
          onUserUpdated(nextAuthUser);
        }
      } catch (err) {
        // ignore localStorage errors
      }
      alert('Photo updated.');
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          'Failed to upload photo. Please try again.'
      );
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}><span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>Profile Information</span></div>
      <div style={{ padding: '28px', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '180px', paddingTop: '8px' }}>
          <div
            onClick={openAvatarPicker}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: '#1a3a5c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              color: 'white',
              fontWeight: 700,
              marginBottom: '12px',
              cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
              overflow: 'hidden',
              border: '2px solid rgba(26,58,92,0.12)',
              opacity: uploadingAvatar ? 0.8 : 1,
            }}
            title="Click to change photo"
          >
            {avatarPath ? (
              <img
                src={`${API_BASE_URL}${avatarPath}`}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              initials
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px', textAlign: 'center' }}>{firstName} {lastName}</div>
          <div style={{ color: '#6b7a99', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>{displayRole}{department ? ` · ${department}` : ''}</div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={onAvatarSelected}
            style={{ display: 'none' }}
          />
          <button
            onClick={openAvatarPicker}
            disabled={uploadingAvatar}
            style={{
              background: '#1a3a5c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              opacity: uploadingAvatar ? 0.7 : 1,
            }}
          >
            {uploadingAvatar ? 'Uploading…' : 'Change Photo'}
          </button>
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
              <input type="email" value={email} disabled style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', background: '#f4f6fb' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Department</label>
              <select
                value={isDepartmentOption(department) ? department : ''}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  background: 'white',
                }}
              >
                <option value="">-- Select department --</option>
                {department && !isDepartmentOption(department) && (
                  <option value={department}>{department} (current — choose from list)</option>
                )}
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              marginTop: '20px',
              background: '#1a3a5c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <i className="bi bi-check-lg"></i> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
