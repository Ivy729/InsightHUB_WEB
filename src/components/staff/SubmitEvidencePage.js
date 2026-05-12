import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';

const SubmitEvidencePage = ({ kpis = [] }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedKpiId, setSelectedKpiId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch submission history on mount
  useEffect(() => {
    fetchSubmissionHistory();
  }, []);

  const fetchSubmissionHistory = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/staff/evidence/my-evidence`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setSubmissionHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch submission history', err);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSizeBytes) {
      alert('File is too large. Maximum allowed size is 10MB.');
      return;
    }
    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files && e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) validateAndSetFile(files[0]);
  };

  const handleSubmitEvidence = async () => {
    setError('');
    setSuccessMsg('');

    if (!selectedKpiId) {
      setError('Please select a KPI before submitting evidence.');
      return;
    }
    if (!file) {
      setError('Please upload a file before submitting evidence.');
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('Missing login token. Please sign in again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result; // data:...;base64,...
        try {
          await axios.post(
            `${API_BASE_URL}/api/staff/evidence/submit`,
            {
              kpiId: selectedKpiId,
              fileUrl: base64Data,
              originalFileName: file.name,
              staffNotes: notes,
            },
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );

          setSuccessMsg('Evidence submitted successfully!');
          // Reset form
          setFile(null);
          setSelectedKpiId('');
          setNotes('');
          if (fileInputRef.current) fileInputRef.current.value = '';
          // Refresh history
          fetchSubmissionHistory();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to submit evidence.');
        } finally {
          setIsSubmitting(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file.');
        setIsSubmitting(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return { background: 'rgba(29,184,122,0.12)', color: '#1db87a', text: 'Approved' };
    if (status === 'rejected') return { background: 'rgba(229,62,62,0.1)', color: '#e53e3e', text: 'Rejected' };
    return { background: 'rgba(232,160,32,0.12)', color: '#f5a623', text: 'Pending' };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {/* LEFT: Submit Form */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>Submit Evidence</span>
        </div>
        <div style={{ padding: '18px 22px' }}>
          {error && (
            <div style={{
              marginBottom: '14px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: '#f8d7da',
              color: '#842029',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div style={{
              marginBottom: '14px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: '#d1e7dd',
              color: '#0f5132',
              fontSize: '13px',
            }}>
              {successMsg}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>KPI</label>
            <select
              value={selectedKpiId}
              onChange={(e) => setSelectedKpiId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px'
              }}
            >
              <option value="">-- Select a KPI --</option>
              {kpis.map((kpi) => (
                <option key={kpi.id} value={kpi.id}>
                  {kpi.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Evidence Type</label>
            <select style={{
              width: '100%', padding: '10px', border: '1px solid #e2e8f0',
              borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px'
            }}>
              <option>Document (PDF/Word)</option>
              <option>Image</option>
              <option>Certificate</option>
              <option>Screenshot</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Upload File</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.xlsx,.xls"
            />
            <div
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? '#1a3a5c' : '#e2e8f0'}`,
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#f4f6fb',
                transition: 'all 0.2s'
              }}
            >
              <i className="bi bi-cloud-upload" style={{ fontSize: '32px', color: '#6b7a99' }}></i>
              <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 600 }}>Drag and drop your file here</div>
              <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '4px' }}>or click to browse</div>
            </div>
            {file && (
              <div style={{
                marginTop: '10px', padding: '10px 14px', background: '#f4f6fb',
                borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <i className="bi bi-file-check"></i>
                <span>{file.name}</span>
                <span style={{ marginLeft: 'auto', color: '#6b7a99' }}>{Math.ceil(file.size / 1024)} KB</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Description / Notes</label>
            <textarea
              placeholder="Describe this evidence briefly..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%', minHeight: '80px', padding: '10px', border: '1px solid #e2e8f0',
                borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', resize: 'none'
              }}
            />
          </div>

          <button
            onClick={handleSubmitEvidence}
            disabled={isSubmitting}
            style={{
              background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px',
              padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '6px',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            <i className="bi bi-upload"></i> {isSubmitting ? 'Submitting...' : 'Submit Evidence'}
          </button>
        </div>
      </div>

      {/* RIGHT: Submission History */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>Submission History</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f6fb', borderBottom: '1px solid #e2e8f0' }}>
              {['KPI', 'File', 'Date', 'Status'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.5px', color: '#6b7a99', padding: '10px 14px'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {submissionHistory.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#6b7a99', fontSize: '13px' }}>
                  No evidence submitted yet.
                </td>
              </tr>
            )}
            {submissionHistory.map((item) => {
              const kpiTitle = item.kpiId?.title || 'Unknown KPI';
              const fileName = item.originalFileName || 'Evidence file';
              const badge = getStatusBadge(item.status);
              return (
                <tr key={item._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                    <strong>{kpiTitle}</strong><br />
                    <span style={{ fontSize: '12px', color: '#6b7a99' }}>{item.staffNotes || ''}</span>
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: '14px' }}>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#1a3a5c',
                        textDecoration: 'none',
                        fontSize: '13px',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      <i className="bi bi-download me-1"></i>{fileName}
                    </a>
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: '13px', color: '#6b7a99' }}>
                    {formatDate(item.submittedAt)}
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: badge.background,
                      color: badge.color
                    }}>
                      {badge.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmitEvidencePage;