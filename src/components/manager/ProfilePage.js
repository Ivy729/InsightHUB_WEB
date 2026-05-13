import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';
import { DEPARTMENT_OPTIONS, isDepartmentOption } from '../../constants/departments';

const ProfilePage = ({ onUserUpdated } = {}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [displayRole, setDisplayRole] = useState('Manager');
  const [department, setDepartment] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const fullName = `${firstName} ${lastName}`.trim();

  const initials = useMemo(() => {
    if (!fullName) return 'U';
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [fullName]);

  useEffect(() => {
    const fetchProfile = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('Missing login token. Please sign in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const user = response.data;
        const nameParts = String(user.name || '').trim().split(/\s+/).filter(Boolean);
        setFirstName(user.firstName || nameParts[0] || '');
        setLastName(user.lastName || nameParts.slice(1).join(' ') || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setDisplayRole(String(user.role || '').toLowerCase() === 'manager' ? 'Manager' : 'Staff');
        setDepartment(user.department || '');
        setProfilePhoto(user.profilePhoto || '');
        setError('');
      } catch (requestError) {
        setError('Failed to load profile information.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Value = String(reader.result || '');
      setProfilePhoto(base64Value);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('Missing login token. Please sign in again.');
      return;
    }
    if (!firstName.trim() || !email.trim()) {
      setError('First name and email are required.');
      return;
    }
    if (!isDepartmentOption(department)) {
      setError('Please select a department from the list.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/me`,
        {
          name: fullName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email,
          phone,
          department,
          profilePhoto,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const updatedUser = response.data.user;
      if (updatedUser) {
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
        if (typeof onUserUpdated === 'function') {
          onUserUpdated(updatedUser);
        }
      }
      setMessage('Profile changes saved successfully.');
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        setError('Email already in use. Please use another email.');
      } else if (requestError.response?.status === 413) {
        setError('Profile photo is too large. Please choose a smaller image.');
      } else {
        setError(requestError.response?.data?.message || 'Failed to save profile changes.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '14px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>
          Profile Information
        </span>
      </div>

      {(error || message) && (
        <div style={{ padding: '16px 28px 0 28px' }}>
          {error && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #f5c2c7',
              background: '#f8d7da',
              color: '#842029',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #badbcc',
              background: '#d1e7dd',
              color: '#0f5132',
              fontSize: '13px'
            }}>
              {message}
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '28px', display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        {/* LEFT: Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '180px' }}>
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profile"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '12px',
              }}
            />
          ) : (
            <div style={{
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
              cursor: 'pointer'
            }}>
              {initials}
            </div>
          )}
          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px', textAlign: 'center' }}>
            {fullName || 'Manager User'}
          </div>
          <div style={{ color: '#6b7a99', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>
            {displayRole}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#1a3a5c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Change Photo
          </button>
        </div>

        {/* RIGHT: Form Fields */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                Department
              </label>
              <select
                value={isDepartmentOption(department) ? department : ''}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  background: loading ? '#f4f6fb' : 'white',
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
            disabled={loading || saving}
            style={{
              marginTop: '20px',
              background: '#1a3a5c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="bi bi-check-lg"></i> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
