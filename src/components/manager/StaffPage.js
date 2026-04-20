import React, { useState } from 'react';

const StaffPage = ({ staffList, setStaffList }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    email: '',
    phone: ''
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRandomColor = () => {
    const colors = ['#1db87a', '#e8a020', '#e53e3e', '#3b82f6', '#9b59b6', '#16a085'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const openAddModal = () => {
    setFormData({ firstName: '', lastName: '', department: '', email: '', phone: '' });
    setShowAddModal(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      department: staff.department,
      email: staff.email,
      phone: staff.phone
    });
    setShowEditModal(true);
  };

  const saveNewStaff = () => {
    if (!formData.firstName || !formData.lastName || !formData.department) {
      alert('Please fill in required fields');
      return;
    }

    const newStaff = {
      id: Math.max(...staffList.map(s => s.id), 0) + 1,
      ...formData,
      kpis: 0,
      completion: 0,
      avatarColor: getRandomColor()
    };

    setStaffList([...staffList, newStaff]);
    setShowAddModal(false);
  };

  const saveEditStaff = () => {
    if (!formData.firstName || !formData.lastName || !formData.department) {
      alert('Please fill in required fields');
      return;
    }

    setStaffList(staffList.map(s =>
      s.id === editingStaff.id ? { ...s, ...formData } : s
    ));
    setShowEditModal(false);
  };

  const deleteStaff = (id) => {
    if (window.confirm('Delete this staff member?')) {
      setStaffList(staffList.filter(s => s.id !== id));
    }
  };

  const filteredStaff = staffList.filter(staff =>
    `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '240px',
              borderRadius: '8px',
              fontSize: '13px',
              padding: '9px 14px',
              border: '1px solid #e2e8f0',
              fontFamily: "'DM Sans', sans-serif"
            }}
          />
        </div>
        <button
          onClick={openAddModal}
          style={{
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
          <i className="bi bi-plus-lg"></i> Add Staff
        </button>
      </div>

      {/* STAFF GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {filteredStaff.map(staff => (
          <div
            key={staff.id}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: staff.avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: 'white',
              fontWeight: 700,
              margin: '0 auto 12px'
            }}>
              {getInitials(staff.firstName, staff.lastName)}
            </div>

            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
              {staff.firstName} {staff.lastName}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7a99', marginBottom: '12px' }}>
              {staff.department}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '16px', color: '#1a3a5c' }}>
                  {staff.kpis}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7a99' }}>KPIs</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  color: staff.completion >= 70 ? '#1db87a' : staff.completion >= 50 ? '#e8a020' : '#e53e3e'
                }}>
                  {staff.completion}%
                </div>
                <div style={{ fontSize: '11px', color: '#6b7a99' }}>Done</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => openEditModal(staff)}
                style={{
                  flex: 1,
                  background: '#1a3a5c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <i className="bi bi-pencil"></i> Edit
              </button>
              <button
                onClick={() => deleteStaff(staff.id)}
                style={{
                  flex: 1,
                  background: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <i className="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <StaffModal
          title="Add New Staff Member"
          formData={formData}
          setFormData={setFormData}
          onSave={saveNewStaff}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <StaffModal
          title="Edit Staff Member"
          formData={formData}
          setFormData={setFormData}
          onSave={saveEditStaff}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

const StaffModal = ({ title, formData, setFormData, onSave, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h5 style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', margin: 0 }}>
            {title}
          </h5>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7a99'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                Department *
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
          </div>
        </div>

        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#1a3a5c',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              padding: '7px 14px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            style={{
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
            <i className="bi bi-check-lg"></i> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
