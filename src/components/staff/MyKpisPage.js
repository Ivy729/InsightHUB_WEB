import React, { useState } from 'react';

const MyKpisPage = () => {
  const [filter, setFilter] = useState('all');

  const kpis = [
    { id: 1, title: 'Research Publications', subtitle: 'Publish 3 journal papers', category: 'Research', target: '3 papers', progress: 67, deadline: 'Dec 2025', status: 'in-progress' },
    { id: 2, title: 'Student Pass Rate', subtitle: 'Maintain 90% pass rate', category: 'Teaching', target: '90%', progress: 100, deadline: 'Jun 2025', status: 'achieved' },
    { id: 3, title: 'Community Service', subtitle: '5 outreach programs', category: 'Service', target: '5 events', progress: 30, deadline: 'Mar 2025', status: 'overdue' }
  ];

  const filtered = filter === 'all' ? kpis : kpis.filter(k => k.status === filter);

  return (
    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>My KPIs</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="achieved">Achieved</option>
          <option value="in-progress">In Progress</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f6fb', borderBottom: '1px solid #e2e8f0' }}>
            {['#', 'KPI Title', 'Category', 'Target', 'Progress', 'Deadline', 'Status', 'Action'].map(h => (
              <th key={h} style={{
                textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: '#6b7a99', padding: '10px 14px'
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((kpi, idx) => (
            <tr key={kpi.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '13px 14px' }}>{idx + 1}</td>
              <td style={{ padding: '13px 14px' }}>
                <strong>{kpi.title}</strong><br /><span style={{ fontSize: '12px', color: '#6b7a99' }}>{kpi.subtitle}</span>
              </td>
              <td style={{ padding: '13px 14px' }}><span style={{ fontSize: '12px', background: '#f4f6fb', color: '#1a3a5c', padding: '2px 8px', borderRadius: '10px' }}>{kpi.category}</span></td>
              <td style={{ padding: '13px 14px' }}>{kpi.target}</td>
              <td style={{ padding: '13px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ background: '#f4f6fb', borderRadius: '20px', height: '7px', width: '80px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${kpi.progress}%`, background: '#1a3a5c', borderRadius: '20px' }}></div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7a99' }}>{kpi.progress}%</span>
                </div>
              </td>
              <td style={{ padding: '13px 14px' }}>{kpi.deadline}</td>
              <td style={{ padding: '13px 14px' }}><span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                background: kpi.status === 'achieved' ? 'rgba(29,184,122,0.12)' : kpi.status === 'in-progress' ? 'rgba(232,160,32,0.12)' : 'rgba(229,62,62,0.1)',
                color: kpi.status === 'achieved' ? '#1db87a' : kpi.status === 'in-progress' ? '#f5a623' : '#e53e3e'
              }}>{kpi.status === 'achieved' ? 'Achieved' : kpi.status === 'in-progress' ? 'In Progress' : 'Overdue'}</span></td>
              <td style={{ padding: '13px 14px' }}><button style={{ background: '#1a3a5c', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}><i className="bi bi-pencil me-1"></i>Update</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyKpisPage;
