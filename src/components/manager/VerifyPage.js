import React from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';

const VerifyPage = ({ evidenceList, onVerifyEvidence, evidenceError, onEvidenceDownloaded }) => {
  const verifyEvidence = (id, action) => {
    onVerifyEvidence(id, action);
  };

  const downloadEvidence = async (item) => {
    if (item.downloadConsumed) return;
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('Missing login token. Please sign in again.');
      return;
    }
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/manager/evidence/${item.id}/download`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const { fileUrl, originalFileName } = res.data || {};
      if (!fileUrl) {
        alert('No file data returned.');
        return;
      }
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = originalFileName || item.evidence || 'evidence';
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (typeof onEvidenceDownloaded === 'function') {
        onEvidenceDownloaded();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Download failed.';
      alert(msg);
    }
  };

  return (
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
          Evidence Verification Queue
        </span>
        <span style={{
          display: 'inline-block',
          background: 'rgba(232,160,32,0.12)',
          color: '#f5a623',
          padding: '3px 10px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700
        }}>
          {evidenceList.length} pending
        </span>
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
              }}>Staff</th>
              <th style={{
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#6b7a99',
                padding: '10px 14px'
              }}>KPI</th>
              <th style={{
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#6b7a99',
                padding: '10px 14px'
              }}>Evidence</th>
              <th style={{
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#6b7a99',
                padding: '10px 14px'
              }}>Submitted</th>
              <th style={{
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#6b7a99',
                padding: '10px 14px'
              }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {evidenceList.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '13px 14px', fontSize: '14px' }}>{item.staff}</td>
                <td style={{ padding: '13px 14px', fontSize: '14px' }}>{item.kpi}</td>
                <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                  {item.downloadConsumed ? (
                    <span style={{ fontSize: '13px', color: '#6b7a99' }}>
                      <i className="bi bi-lock me-1"></i>
                      Downloaded
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => downloadEvidence(item)}
                      style={{
                        color: '#1a3a5c',
                        textDecoration: 'none',
                        fontSize: '13px',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                      }}
                    >
                      <i className="bi bi-download me-1"></i>{item.evidence}
                    </button>
                  )}
                </td>
                <td style={{ padding: '13px 14px', fontSize: '14px' }}>{item.submitted}</td>
                <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                  <button
                    onClick={() => verifyEvidence(item.id, 'Approved')}
                    style={{
                      background: '#1db87a',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginRight: '6px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => verifyEvidence(item.id, 'Rejected')}
                    style={{
                      background: '#e53e3e',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {evidenceList.length === 0 && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#6b7a99',
          fontSize: '14px'
        }}>
          {evidenceError || 'No pending evidence to verify'}
        </div>
      )}
    </div>
  );
};

export default VerifyPage;
