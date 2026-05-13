import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';
import { getEffectiveKpiStatus } from '../../utils/getEffectiveKpiStatus';

const newRowId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function formatKpiDate(val) {
  if (val == null || val === '' || val === '-') return '—';
  const s = String(val).trim();
  if (!s) return '—';
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
  return s;
}

function statusLabel(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'in-progress') return 'In progress';
  if (s === 'achieved') return 'Achieved';
  if (s === 'pending') return 'Pending';
  if (s === 'overdue') return 'Overdue';
  return status || '—';
}

function kpiStatusPillStyles(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'achieved') return { background: 'rgba(29,184,122,0.12)', color: '#1db87a' };
  if (s === 'in-progress') return { background: 'rgba(232,160,32,0.12)', color: '#f5a623' };
  if (s === 'pending') return { background: 'rgba(107,122,153,0.12)', color: '#6b7a99' };
  return { background: 'rgba(229,62,62,0.1)', color: '#e53e3e' };
}

const KpiManagePage = ({ kpiList, setKpiList, staffList, refreshStaffList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingKpi, setEditingKpi] = useState(null);
  const [detailKpi, setDetailKpi] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    staff: '',
    startDate: '',
    deadline: ''
  });
  /** Each step: checkbox = include in KPI; text = step wording (editable). */
  const [taskRows, setTaskRows] = useState([{ id: newRowId(), text: '', included: true }]);

  const authHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const openNewKPI = () => {
    setEditingKpi(null);
    setFormData({ title: '', desc: '', staff: '', startDate: '', deadline: '' });
    setTaskRows([{ id: newRowId(), text: '', included: true }]);
    setShowModal(true);
  };

  const openEditKPI = (kpi) => {
    setEditingKpi(kpi);
    const kStaff = String(kpi.staff || '').trim();
    const staffMatch = staffList.find((s) => {
      const full = String(s.fullName || '').trim();
      const combo = `${s.firstName || ''} ${s.lastName || ''}`.trim();
      const em = String(s.email || '').trim().toLowerCase();
      return (
        (full && full === kStaff) ||
        (combo && combo === kStaff) ||
        (em && em === kStaff.toLowerCase())
      );
    });
    const steps = Array.isArray(kpi.taskSteps)
      ? kpi.taskSteps.map((s) => String(s || '').trim()).filter(Boolean)
      : [];
    setFormData({
      title: kpi.title,
      desc: kpi.desc,
      staff: staffMatch ? String(staffMatch.id) : '',
      startDate: kpi.startDate,
      deadline: kpi.deadline
    });
    setTaskRows(
      steps.length > 0
        ? steps.map((text) => ({ id: newRowId(), text, included: true }))
        : [{ id: newRowId(), text: '', included: true }]
    );
    setShowModal(true);
  };

  const saveKPI = async () => {
    if (!formData.title || !formData.staff) {
      alert('Please fill in required fields');
      return;
    }
    const selectedStaff = staffList.find((s) => String(s.id) === String(formData.staff));
    if (!selectedStaff) {
      alert('Please select a valid staff member.');
      return;
    }
    const deptFromStaff = String(selectedStaff?.department || '').trim() || 'N/A';

    const lines = taskRows
      .filter((r) => r.included && String(r.text || '').trim())
      .map((r) => String(r.text || '').trim());
    if (lines.length === 0) {
      alert('Add at least one task step: tick the box and enter text for each step you want to include.');
      return;
    }

    setIsSaving(true);
    try {
      const payloadBase = {
        title: formData.title,
        desc: formData.desc,
        dept: deptFromStaff,
        taskSteps: lines,
        target: 0,
        startDate: formData.startDate,
        deadline: formData.deadline,
        staffMemberId: formData.staff,
      };

      if (editingKpi) {
        // Update existing KPI
        const response = await axios.put(
          `${API_BASE_URL}/api/kpis/${editingKpi._id}`,
          {
            ...payloadBase,
            status: editingKpi.status || 'in-progress'
          },
          { headers: authHeaders() }
        );
        setKpiList(kpiList.map(k => k._id === editingKpi._id ? response.data : k));
      } else {
        // Create new KPI - default to pending
        const response = await axios.post(
          `${API_BASE_URL}/api/kpis`,
          {
            ...payloadBase,
            status: 'pending',
            progress: 0
          },
          { headers: authHeaders() }
        );
        setKpiList([...kpiList, response.data]);
      }

      if (refreshStaffList) {
        try {
          await refreshStaffList();
        } catch (e) {
          console.warn('refreshStaffList failed', e);
        }
      }

      setShowModal(false);
      setDetailKpi(null);
      setFormData({ title: '', desc: '', staff: '', startDate: '', deadline: '' });
      setTaskRows([{ id: newRowId(), text: '', included: true }]);
    } catch (error) {
      console.error('Error saving KPI:', error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save KPI. Please try again.';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteKPI = async (kpi) => {
    if (window.confirm('Delete this KPI?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/kpis/${kpi._id}`, {
          headers: authHeaders(),
        });
        setKpiList(kpiList.filter(k => k._id !== kpi._id));
        if (detailKpi && String(detailKpi._id) === String(kpi._id)) {
          setDetailKpi(null);
        }
        if (refreshStaffList) {
          await refreshStaffList();
        }
      } catch (error) {
        console.error('Error deleting KPI:', error);
        alert('Failed to delete KPI. Please try again.');
      }
    }
  };

  const filteredKpis = kpiList.filter((kpi) => {
    const matchSearch = !searchTerm || kpi.title.toLowerCase().includes(searchTerm.toLowerCase());
    const effective = getEffectiveKpiStatus(kpi);
    const matchStatus = !statusFilter || effective === statusFilter;
    return matchSearch && matchStatus;
  });


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
                }}>Tasks</th>
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
              {filteredKpis.map((kpi, index) => {
                const rowStatus = getEffectiveKpiStatus(kpi);
                const pill = kpiStatusPillStyles(rowStatus);
                return (
                <tr
                  key={kpi._id}
                  onClick={() => setDetailKpi(kpi)}
                  style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fafbfd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>{index + 1}</td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                    <strong>{kpi.title}</strong><br />
                    <span style={{ fontSize: '12px', color: '#6b7a99' }}>{kpi.desc}</span>
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>{kpi.staff}</td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>{kpi.dept}</td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                    {Array.isArray(kpi.taskSteps) && kpi.taskSteps.length > 0
                      ? `${kpi.taskSteps.length} step(s)`
                      : '—'}
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>{kpi.deadline}</td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: pill.background,
                      color: pill.color
                    }}>
                      {statusLabel(rowStatus)}
                    </span>
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditKPI(kpi);
                      }}
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
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteKPI(kpi);
                      }}
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
              );})}
            </tbody>
          </table>
        </div>
      </div>

      {detailKpi && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px',
          }}
          onClick={() => setDetailKpi(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '20px 22px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 700, color: '#1a2233' }}>
                  {detailKpi.title}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '6px', wordBreak: 'break-all' }}>
                  KPI ID: {String(detailKpi._id)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailKpi(null)}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: '#6b7a99',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '18px 22px', fontSize: '14px', color: '#1a2233' }}>
              <dl style={{ margin: 0, display: 'grid', gap: '12px' }}>
                <div>
                  <dt
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#6b7a99',
                      marginBottom: '4px',
                    }}
                  >
                    Description
                  </dt>
                  <dd style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#334155' }}>{detailKpi.desc || '—'}</dd>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <dt
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#6b7a99',
                        marginBottom: '4px',
                      }}
                    >
                      Assigned staff
                    </dt>
                    <dd style={{ margin: 0 }}>{detailKpi.staff || '—'}</dd>
                  </div>
                  <div>
                    <dt
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#6b7a99',
                        marginBottom: '4px',
                      }}
                    >
                      Department
                    </dt>
                    <dd style={{ margin: 0 }}>{detailKpi.dept || '—'}</dd>
                  </div>
                  <div>
                    <dt
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#6b7a99',
                        marginBottom: '4px',
                      }}
                    >
                      Owner
                    </dt>
                    <dd style={{ margin: 0 }}>{detailKpi.owner || '—'}</dd>
                  </div>
                  <div>
                    <dt
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#6b7a99',
                        marginBottom: '4px',
                      }}
                    >
                      Progress
                    </dt>
                    <dd style={{ margin: 0 }}>{Number(detailKpi.progress) || 0}%</dd>
                  </div>
                  <div>
                    <dt
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#6b7a99',
                        marginBottom: '4px',
                      }}
                    >
                      Status
                    </dt>
                    <dd style={{ margin: 0 }}>
                      {(() => {
                        const ds = getEffectiveKpiStatus(detailKpi);
                        const pill = kpiStatusPillStyles(ds);
                        return (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: pill.background,
                          color: pill.color,
                        }}
                      >
                        {statusLabel(ds)}
                      </span>
                        );
                      })()}
                    </dd>
                  </div>
                  <div>
                    <dt
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#6b7a99',
                        marginBottom: '4px',
                      }}
                    >
                      Start date
                    </dt>
                    <dd style={{ margin: 0 }}>{formatKpiDate(detailKpi.startDate)}</dd>
                  </div>
                  <div>
                    <dt
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#6b7a99',
                        marginBottom: '4px',
                      }}
                    >
                      Deadline
                    </dt>
                    <dd style={{ margin: 0 }}>{formatKpiDate(detailKpi.deadline)}</dd>
                  </div>
                  <div>
                    <dt
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#6b7a99',
                        marginBottom: '4px',
                      }}
                    >
                      Created
                    </dt>
                    <dd style={{ margin: 0 }}>{formatKpiDate(detailKpi.createdAt)}</dd>
                  </div>
                  <div>
                    <dt
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#6b7a99',
                        marginBottom: '4px',
                      }}
                    >
                      Last updated
                    </dt>
                    <dd style={{ margin: 0 }}>{formatKpiDate(detailKpi.updatedAt)}</dd>
                  </div>
                  {Array.isArray(detailKpi.taskSteps) && detailKpi.taskSteps.length === 0 && Number(detailKpi.targetNum) > 0 ? (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <dt
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#6b7a99',
                          marginBottom: '4px',
                        }}
                      >
                        Legacy target (numeric)
                      </dt>
                      <dd style={{ margin: 0 }}>{detailKpi.targetNum}</dd>
                    </div>
                  ) : null}
                </div>
                <div>
                  <dt
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#6b7a99',
                      marginBottom: '8px',
                    }}
                  >
                    Task steps (staff completion)
                  </dt>
                  <dd style={{ margin: 0 }}>
                    {Array.isArray(detailKpi.taskSteps) && detailKpi.taskSteps.length > 0 ? (
                      <ol style={{ margin: '0 0 0 1.1em', padding: 0, color: '#334155' }}>
                        {detailKpi.taskSteps.map((step, i) => {
                          const done = Boolean(detailKpi.taskStepDone && detailKpi.taskStepDone[i]);
                          return (
                            <li
                              key={i}
                              style={{
                                marginBottom: '8px',
                                textDecoration: done ? 'line-through' : 'none',
                                color: done ? '#94a3b8' : undefined,
                              }}
                            >
                              {step}
                              {done ? (
                                <span style={{ marginLeft: '8px', fontSize: '12px', color: '#1db87a' }}>(done)</span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <span style={{ color: '#6b7a99' }}>No task steps defined for this KPI.</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            <div
              style={{
                padding: '14px 22px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => setDetailKpi(null)}
                style={{
                  background: 'transparent',
                  color: '#1a3a5c',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const k = detailKpi;
                  setDetailKpi(null);
                  openEditKPI(k);
                }}
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
                  gap: '6px',
                }}
              >
                <i className="bi bi-pencil" /> Edit KPI
              </button>
            </div>
          </div>
        </div>
      )}

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
                    {staffList.map((staff) => (
                      <option key={staff.id} value={String(staff.id)}>
                        {staff.fullName || `${staff.firstName} ${staff.lastName}`.trim()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Task steps *{' '}
                    <span style={{ fontWeight: 400, color: '#6b7a99' }}>
                      (tick to include; edit the text for each step)
                    </span>
                  </label>
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      background: '#fafbfd',
                    }}
                  >
                    {taskRows.map((row, index) => (
                      <div
                        key={row.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={row.included}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setTaskRows((prev) =>
                              prev.map((r) => (r.id === row.id ? { ...r, included: checked } : r))
                            );
                          }}
                          title="Include this step in the KPI"
                          style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <input
                          type="text"
                          value={row.text}
                          onChange={(e) => {
                            const text = e.target.value;
                            setTaskRows((prev) =>
                              prev.map((r) => {
                                if (r.id !== row.id) return r;
                                const next = { ...r, text };
                                if (text.trim() && !r.included) next.included = true;
                                return next;
                              })
                            );
                          }}
                          placeholder={`Step ${index + 1}`}
                          style={{
                            flex: '1 1 200px',
                            minWidth: '120px',
                            padding: '8px 10px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '14px',
                            background: 'white',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setTaskRows((prev) => {
                              if (prev.length <= 1) {
                                return [{ id: newRowId(), text: '', included: true }];
                              }
                              return prev.filter((r) => r.id !== row.id);
                            });
                          }}
                          title="Remove step"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '6px',
                            fontSize: '18px',
                            lineHeight: 1,
                            flexShrink: 0,
                          }}
                        >
                          <i className="bi bi-trash" aria-hidden />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setTaskRows((prev) => [...prev, { id: newRowId(), text: '', included: true }])
                      }
                      style={{
                        alignSelf: 'flex-start',
                        marginTop: '2px',
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#1a3a5c',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="bi bi-plus-lg" /> Add step
                    </button>
                  </div>
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
                disabled={isSaving}
                style={{
                  background: '#1a3a5c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                <i className={`bi ${editingKpi ? 'bi-check-lg' : 'bi-plus-lg'}`}></i>
                {isSaving ? 'Saving...' : (editingKpi ? 'Save Changes' : 'Create KPI')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KpiManagePage;
