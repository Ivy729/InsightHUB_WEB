import React, { useState } from 'react';

const UpdateProgressPage = ({ kpis = [], selectedKpiId, setSelectedKpiId, setKpis }) => {
  const selectedKpi = kpis.find((kpi) => kpi.id === selectedKpiId) || kpis[0];
  const [progress, setProgress] = useState(selectedKpi ? selectedKpi.progress : 0);

  const handleKpiChange = (e) => {
    const nextId = Number(e.target.value);
    setSelectedKpiId(nextId);
    const nextKpi = kpis.find((k) => k.id === nextId);
    setProgress(nextKpi ? nextKpi.progress : 0);
  };

  const saveProgress = () => {
    if (!selectedKpi) return;
    const normalizedProgress = Number(progress);
    setKpis((prev) =>
      prev.map((kpi) => {
        if (kpi.id !== selectedKpi.id) return kpi;
        let status = 'in-progress';
        if (normalizedProgress >= 100) status = 'achieved';
        else if (normalizedProgress < 50) status = 'overdue';
        return { ...kpi, progress: normalizedProgress, status };
      })
    );
    alert('Progress updated successfully.');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}><span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>Update KPI Progress</span></div>
        <div style={{ padding: '18px 22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select KPI</label>
            <select
              value={selectedKpi ? selectedKpi.id : ''}
              onChange={handleKpiChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
            >
              {kpis.map((kpi) => (
                <option key={kpi.id} value={kpi.id}>
                  {kpi.title} (currently {kpi.progress}%)
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Current Achievement</label>
            <input type="text" placeholder="e.g. 2 papers published" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Progress (%)</label>
            <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(e.target.value)} style={{ width: '100%' }} />
            <div style={{ textAlign: 'center', fontFamily: "'Fraunces', serif", fontSize: '28px', fontWeight: 700, color: '#1a3a5c', marginTop: '4px' }}>{progress}%</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Progress Note</label>
            <textarea placeholder="Describe what you have accomplished..." style={{ width: '100%', minHeight: '80px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', resize: 'none' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Date of Update</label>
            <input type="date" defaultValue="2025-03-24" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }} />
          </div>

          <button onClick={saveProgress} style={{ background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i className="bi bi-check-circle"></i> Save Progress</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}><span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>Progress History</span></div>
        <div style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1db87a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><i className="bi bi-check-lg"></i></div>
            <div style={{ paddingTop: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>Published 2nd paper</div>
              <div style={{ fontSize: '12px', color: '#6b7a99' }}>Research Publications · Feb 14, 2025</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e8a020', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><i className="bi bi-arrow-up"></i></div>
            <div style={{ paddingTop: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>Progress updated to 33%</div>
              <div style={{ fontSize: '12px', color: '#6b7a99' }}>Research Publications · Jan 20, 2025</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a3a5c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><i className="bi bi-flag"></i></div>
            <div style={{ paddingTop: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>KPI Assigned</div>
              <div style={{ fontSize: '12px', color: '#6b7a99' }}>Research Publications · Jan 1, 2025</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProgressPage;
