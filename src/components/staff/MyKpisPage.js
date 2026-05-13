import React, { useState } from 'react';

const statusBadge = (status) => {
  const map = {
    achieved: { bg: 'rgba(29,184,122,0.12)', color: '#1db87a', label: 'Achieved' },
    'in-progress': { bg: 'rgba(232,160,32,0.12)', color: '#f5a623', label: 'In Progress' },
    overdue: { bg: 'rgba(229,62,62,0.1)', color: '#e53e3e', label: 'Overdue' },
    pending: { bg: 'rgba(107,122,153,0.12)', color: '#6b7a99', label: 'Pending' },
  };
  return map[status] || map.pending;
};

const MyKpisPage = ({ kpis = [], onUpdateKpi }) => {
  const [filter, setFilter] = useState('all');
  const [detailKpi, setDetailKpi] = useState(null);

  const filtered = filter === 'all' ? kpis : kpis.filter((k) => k.status === filter);

  const stepsSummary = (kpi) => {
    const n = Array.isArray(kpi.taskSteps) ? kpi.taskSteps.length : 0;
    if (n > 0) return `${n} step${n === 1 ? '' : 's'}`;
    return kpi.target || '—';
  };

  return (
    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>My KPIs</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="achieved">Achieved</option>
          <option value="in-progress">In Progress</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f6fb', borderBottom: '1px solid #e2e8f0' }}>
            {['#', 'KPI Title', 'Category', 'Tasks', 'Progress', 'Deadline', 'Status', 'Action'].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6b7a99',
                  padding: '10px 14px',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={8} style={{ padding: '22px 14px', textAlign: 'center', color: '#6b7a99', fontSize: '14px' }}>
                No KPI assigned yet.
              </td>
            </tr>
          )}
          {filtered.map((kpi, idx) => {
            const st = statusBadge(kpi.status);
            return (
              <tr
                key={kpi.id}
                onClick={() => setDetailKpi(kpi)}
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fafbfd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <td style={{ padding: '13px 14px' }}>{idx + 1}</td>
                <td style={{ padding: '13px 14px' }}>
                  <strong>{kpi.title}</strong>
                  <br />
                  <span style={{ fontSize: '12px', color: '#6b7a99' }}>{kpi.subtitle}</span>
                </td>
                <td style={{ padding: '13px 14px' }}>
                  <span style={{ fontSize: '12px', background: '#f4f6fb', color: '#1a3a5c', padding: '2px 8px', borderRadius: '10px' }}>{kpi.category}</span>
                </td>
                <td style={{ padding: '13px 14px' }}>{stepsSummary(kpi)}</td>
                <td style={{ padding: '13px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ background: '#f4f6fb', borderRadius: '20px', height: '7px', width: '80px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${kpi.progress}%`, background: '#1a3a5c', borderRadius: '20px' }}></div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6b7a99' }}>{kpi.progress}%</span>
                  </div>
                </td>
                <td style={{ padding: '13px 14px' }}>{kpi.deadline}</td>
                <td style={{ padding: '13px 14px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: st.bg,
                      color: st.color,
                    }}
                  >
                    {st.label}
                  </span>
                </td>
                <td style={{ padding: '13px 14px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateKpi && onUpdateKpi(kpi.id);
                    }}
                    style={{
                      background: '#1a3a5c',
                      color: 'white',
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    <i className="bi bi-pencil me-1"></i>Update
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
            zIndex: 1200,
            padding: '16px',
          }}
          onClick={() => setDetailKpi(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '20px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 700, color: '#1a2233' }}>{detailKpi.title}</div>
                <div style={{ fontSize: '13px', color: '#6b7a99', marginTop: '6px' }}>{detailKpi.dept ? `${detailKpi.dept}` : ''}</div>
              </div>
              <button
                type="button"
                onClick={() => setDetailKpi(null)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7a99', lineHeight: 1 }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div style={{ padding: '18px 22px 22px', fontSize: '14px', color: '#1a2233' }}>
              <dl style={{ margin: 0, display: 'grid', gap: '12px' }}>
                <div>
                  <dt style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7a99', marginBottom: '4px' }}>Description</dt>
                  <dd style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#334155' }}>{detailKpi.desc || '—'}</dd>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <dt style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7a99', marginBottom: '4px' }}>Department</dt>
                    <dd style={{ margin: 0 }}>{detailKpi.dept || '—'}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7a99', marginBottom: '4px' }}>Assigned as</dt>
                    <dd style={{ margin: 0 }}>{detailKpi.staffAssigned || '—'}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7a99', marginBottom: '4px' }}>Start date</dt>
                    <dd style={{ margin: 0 }}>{detailKpi.startDate || '—'}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7a99', marginBottom: '4px' }}>Deadline</dt>
                    <dd style={{ margin: 0 }}>{detailKpi.deadline || '—'}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7a99', marginBottom: '4px' }}>Progress</dt>
                    <dd style={{ margin: 0 }}>{detailKpi.progress}%</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7a99', marginBottom: '4px' }}>Status</dt>
                    <dd style={{ margin: 0 }}>{statusBadge(detailKpi.status).label}</dd>
                  </div>
                </div>
                <div>
                  <dt style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7a99', marginBottom: '8px' }}>Task steps</dt>
                  <dd style={{ margin: 0 }}>
                    {Array.isArray(detailKpi.taskSteps) && detailKpi.taskSteps.length > 0 ? (
                      <ol style={{ margin: '0 0 0 1.1em', padding: 0, color: '#334155' }}>
                        {detailKpi.taskSteps.map((step, i) => {
                          const done = Boolean(detailKpi.taskStepDone && detailKpi.taskStepDone[i]);
                          return (
                            <li key={i} style={{ marginBottom: '8px', textDecoration: done ? 'line-through' : 'none', color: done ? '#94a3b8' : undefined }}>
                              {step}
                              {done ? <span style={{ marginLeft: '8px', fontSize: '12px', color: '#1db87a' }}>(done)</span> : null}
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <span style={{ color: '#6b7a99' }}>No task steps listed (legacy KPI).</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyKpisPage;
