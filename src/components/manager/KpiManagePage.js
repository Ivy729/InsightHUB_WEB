import React, { useState } from 'react';

const KpiManagePage = ({ kpiList, setKpiList, staffList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingKpi, setEditingKpi] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    staff: '',
    dept: '',
    target: '',
    startDate: '',
    deadline: ''
  });

  const openNewKPI = () => {
    setEditingKpi(null);
    setFormData({ title: '', desc: '', staff: '', dept: '', target: '', startDate: '', deadline: '' });
    setShowModal(true);
  };

  const openEditKPI = (kpi) => {
    setEditingKpi(kpi);
    setFormData({
      title: kpi.title,
      desc: kpi.desc,
      staff: kpi.staff,
      dept: kpi.dept,
      target: kpi.target,
      startDate: kpi.startDate,
      deadline: kpi.deadline
    });
    setShowModal(true);
  };

  const saveKPI = () => {
    if (!formData.title || !formData.dept || !formData.staff) {
      alert('Please fill in required fields');
      return;
    }

    if (editingKpi) {
      setKpiList(kpiList.map(k => k.num === editingKpi.num ? { ...k, ...formData } : k));
    } else {
      const newKpi = {
        num: Math.max(...kpiList.map(k => k.num), 0) + 1,
        ...formData,
        status: 'pending'
      };
      setKpiList([...kpiList, newKpi]);
    }

    setShowModal(false);
    setFormData({ title: '', desc: '', staff: '', dept: '', target: '', startDate: '', deadline: '' });
  };

  const deleteKPI = (kpiNum) => {
    if (window.confirm('Delete this KPI?')) {
      setKpiList(kpiList.filter(k => k.num !== kpiNum));
    }
  };

  const filteredKpis = kpiList.filter(kpi => {
    const matchSearch = !searchTerm || kpi.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || kpi.status === statusFilter;
    const matchCategory = !categoryFilter || kpi.dept === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const departments = [...new Set(staffList.map(s => s.department))];

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search KPIs..."
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
        <button
          onClick={openNewKPI}
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
          <i className="bi bi-plus-lg"></i> New KPI
        </button>
      </div>

      {/* TABLE CARD */}
      <div style={{
        background: 'white',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 22px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>
            All KPIs
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="achieved">Achieved</option>
              <option value="overdue">Overdue</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f6fb', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6b7a99',
                  padding: '10px 14px'
                }}>#</th>
                <th style={{
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6b7a99',
                  padding: '10px 14px'
                }}>KPI Title</th>
                <th style={{
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6b7a99',
                  padding: '10px 14px'
                }}>Staff</th>
                <th style={{
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6b7a99',
                  padding: '10px 14px'
                }}>Department</th>
                <th style={{
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6b7a99',
                  padding: '10px 14px'
                }}>Target</th>
                <th style={{
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6b7a99',
                  padding: '10px 14px'
                }}>Deadline</th>
                <th style={{
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6b7a99',
                  padding: '10px 14px'
                }}>Status</th>
                <th style={{
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6b7a99',
                  padding: '10px 14px'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKpis.map((kpi) => (
                <tr key={kpi.num} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>{kpi.num}</td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                    <strong>{kpi.title}</strong><br />
                    <span style={{ fontSize: '12px', color: '#6b7a99' }}>{kpi.desc}</span>
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>{kpi.staff}</td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>{kpi.dept}</td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>{kpi.target}</td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>{kpi.deadline}</td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: kpi.status === 'achieved' ? 'rgba(29,184,122,0.12)' : kpi.status === 'in-progress' ? 'rgba(232,160,32,0.12)' : 'rgba(107,122,153,0.12)',
                      color: kpi.status === 'achieved' ? '#1db87a' : kpi.status === 'in-progress' ? '#f5a623' : '#6b7a99'
                    }}>
                      {kpi.status.charAt(0).toUpperCase() + kpi.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                    <button
                      onClick={() => openEditKPI(kpi)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7a99',
                        fontSize: '16px',
                        padding: '4px',
                        borderRadius: '6px',
                        transition: 'all 0.15s',
                        marginRight: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#1a3a5c';
                        e.target.style.background = '#f4f6fb';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#6b7a99';
                        e.target.style.background = 'none';
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      onClick={() => deleteKPI(kpi.num)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7a99',
                        fontSize: '16px',
                        padding: '4px',
                        borderRadius: '6px',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#e53e3e';
                        e.target.style.background = '#f4f6fb';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#6b7a99';
                        e.target.style.background = 'none';
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
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
                {editingKpi ? 'Edit KPI' : 'New KPI'}
              </h5>
              <button
                onClick={() => setShowModal(false)}
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
              <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    KPI Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    Description
                  </label>
                  <textarea
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Department *
                  </label>
                  <select
                    value={formData.dept}
                    onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px'
                    }}
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Staff Member *
                  </label>
                  <select
                    value={formData.staff}
                    onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px'
                    }}
                  >
                    <option value="">-- Select Staff --</option>
                    {staffList.filter(s => !formData.dept || s.department === formData.dept).map(staff => (
                      <option key={staff.id} value={`${staff.firstName} ${staff.lastName}`}>
                        {staff.firstName} {staff.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Target
                  </label>
                  <input
                    type="text"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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
            </div>

            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowModal(false)}
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
                onClick={saveKPI}
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
                <i className={`bi ${editingKpi ? 'bi-check-lg' : 'bi-plus-lg'}`}></i>
                {editingKpi ? 'Save Changes' : 'Create KPI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KpiManagePage;
