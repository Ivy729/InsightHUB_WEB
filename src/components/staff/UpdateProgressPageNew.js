import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';

const UpdateProgressPage = ({ kpis = [], selectedKpiId, setSelectedKpiId, setKpis }) => {
  const selectedKpi = kpis.find((kpi) => kpi.id === selectedKpiId) || kpis[0];
  const [progress, setProgress] = useState(selectedKpi ? selectedKpi.progress : 0);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (kpis.length === 0) {
    return (
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', color: '#1a2233', marginBottom: '8px' }}>
          Update KPI Progress
        </div>
        <div style={{ color: '#6b7a99', fontSize: '14px' }}>
          No KPI assigned yet. Once a KPI is assigned to your account, you can update progress here.
        </div>
      </div>
    );
  }

  const handleKpiChange = (e) => {
    const nextId = e.target.value;
    setSelectedKpiId(nextId);
    const nextKpi = kpis.find((k) => k.id === nextId);
    setProgress(nextKpi ? nextKpi.progress : 0);
    setSuccessMessage('');
  };

  const calculateStatus = (progressValue, deadline) => {
    const prog = Number(progressValue);
    
    // Check if deadline has passed
    if (deadline && deadline !== '-') {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      if (deadlineDate < today && prog < 100) {
        return 'overdue';
      }
    }
    
    // Determine status based on progress
    if (prog >= 100) {
      return 'achieved';
    } else if (prog > 0) {
      return 'in-progress';
    } else {
      return 'in-progress'; // Default to in-progress
    }
  };

  const saveProgress = async () => {
    if (!selectedKpi) return;
    
    setIsSaving(true);
    try {
      const newStatus = calculateStatus(progress, selectedKpi.deadline);
      
      const response = await axios.put(
        `${API_BASE_URL}/api/kpis/${selectedKpi.id}`,
        {
          progress: Number(progress),
          status: newStatus
        }
      );

      // Update local state
      setKpis((prev) =>
        prev.map((kpi) => {
          if (kpi.id !== selectedKpi.id) return kpi;
          return { ...kpi, progress: Number(progress), status: newStatus };
        })
      );

      setSuccessMessage(`Progress updated to ${progress}% - Status: ${newStatus}`);
      setNote('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'achieved') return '#1db87a';
    if (status === 'in-progress') return '#e8a020';
    if (status === 'overdue') return '#e53e3e';
    return '#6b7a99';
  };

  const getStatusIcon = (status) => {
    if (status === 'achieved') return 'bi-check-circle-fill';
    if (status === 'in-progress') return 'bi-arrow-repeat';
    if (status === 'overdue') return 'bi-exclamation-circle-fill';
    return 'bi-dash-circle';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}><span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>Update KPI Progress</span></div>
        <div style={{ padding: '18px 22px' }}>
          {successMessage && (
            <div style={{
              marginBottom: '16px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #d4edda',
              background: '#d4edda',
              color: '#155724',
              fontSize: '13px'
            }}>
              ✓ {successMessage}
            </div>
          )}

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

          {selectedKpi && (
            <>
              <div style={{ marginBottom: '16px', padding: '12px', background: '#f4f6fb', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7a99', marginBottom: '4px' }}>Current Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className={`bi ${getStatusIcon(selectedKpi.status)}`} style={{ color: getStatusColor(selectedKpi.status), fontSize: '18px' }}></i>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: getStatusColor(selectedKpi.status) }}>
                    {selectedKpi.status.charAt(0).toUpperCase() + selectedKpi.status.slice(1)}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Progress (%)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress} 
                  onChange={(e) => setProgress(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }} 
                />
                <div style={{ textAlign: 'center', fontFamily: "'Fraunces', serif", fontSize: '28px', fontWeight: 700, color: '#1a3a5c', marginTop: '4px' }}>{progress}%</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  height: '8px',
                  background: '#f4f6fb',
                  borderRadius: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: progress >= 100 ? '#1db87a' : progress > 0 ? '#e8a020' : '#6b7a99',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7a99', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Progress Note (Optional)</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Describe what you have accomplished..." 
                  style={{ width: '100%', minHeight: '80px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', resize: 'none' }} 
                />
              </div>

              <button 
                onClick={saveProgress}
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
                <i className="bi bi-check-circle"></i> {isSaving ? 'Saving...' : 'Save Progress'}
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>
            {selectedKpi ? selectedKpi.title : 'KPI Details'}
          </span>
        </div>
        <div style={{ padding: '18px 22px' }}>
          {selectedKpi && (
            <>
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#6b7a99', marginBottom: '4px' }}>Target</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#1a2233' }}>{selectedKpi.target}</div>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#6b7a99', marginBottom: '4px' }}>Deadline</div>
                <div style={{ fontSize: '14px', color: '#1a2233' }}>{selectedKpi.deadline}</div>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#6b7a99', marginBottom: '4px' }}>Current Progress</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#1a3a5c' }}>{selectedKpi.progress}%</span>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: selectedKpi.status === 'achieved' ? 'rgba(29,184,122,0.12)' : selectedKpi.status === 'in-progress' ? 'rgba(232,160,32,0.12)' : 'rgba(229,62,62,0.1)',
                    color: selectedKpi.status === 'achieved' ? '#1db87a' : selectedKpi.status === 'in-progress' ? '#f5a623' : '#e53e3e'
                  }}>
                    {selectedKpi.status.charAt(0).toUpperCase() + selectedKpi.status.slice(1)}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#6b7a99', marginBottom: '4px' }}>Status Information</div>
                <div style={{ fontSize: '13px', color: '#6b7a99', lineHeight: '1.5' }}>
                  {selectedKpi.progress >= 100 && (
                    <div>✓ <strong>Achieved!</strong> You have completed this KPI.</div>
                  )}
                  {selectedKpi.progress < 100 && selectedKpi.status === 'overdue' && (
                    <div>⚠ <strong>Overdue!</strong> The deadline has passed. Please complete this KPI as soon as possible.</div>
                  )}
                  {selectedKpi.progress < 100 && selectedKpi.status === 'in-progress' && (
                    <div>→ <strong>In Progress.</strong> Continue working on this KPI. Adjust the slider as you make progress.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateProgressPage;
