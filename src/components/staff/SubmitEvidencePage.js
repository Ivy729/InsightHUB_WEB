import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../apiClient';
import { API_BASE_URL } from '../../apiConfig';

const SubmitEvidencePage = ({ kpis = [] }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedKpiId, setSelectedKpiId] = useState('');
  const [manualKpiTitle, setManualKpiTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState('Document (PDF/Word)');
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const kpiOptions = useMemo(() => kpis || [], [kpis]);

  useEffect(() => {
    if (!selectedKpiId && kpiOptions.length > 0) {
      setSelectedKpiId(kpiOptions[0].id);
    }
  }, [kpiOptions, selectedKpiId]);

  const loadHistory = async () => {
    try {
      const res = await api.get('/api/evidence/mine');
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

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
    if (!file) {
      alert('Please upload a file before submitting evidence.');
      return;
    }
    const hasAssignedKpis = kpiOptions.length > 0;
    const selectedKpi = hasAssignedKpis
      ? kpiOptions.find((k) => k.id === selectedKpiId)
      : null;

    const kpiTitleToSubmit = hasAssignedKpis
      ? (selectedKpi?.title || '')
      : manualKpiTitle.trim();

    if (!kpiTitleToSubmit) {
      alert(hasAssignedKpis ? 'Please select a KPI before submitting evidence.' : 'Please enter the KPI title before submitting evidence.');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      if (selectedKpi?.id) form.append('kpiId', selectedKpi.id);
      form.append('kpiTitle', kpiTitleToSubmit);
      form.append('evidenceType', evidenceType);
      form.append('notes', notes);
      form.append('file', file);

      await api.post('/api/evidence', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Evidence submitted successfully.');
      setFile(null);
      setNotes('');
      setManualKpiTitle('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadHistory();
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          'Failed to submit evidence. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}><span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>Submit Evidence</span></div>
        <div style={{ padding: '18px 22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>KPI</label>
            {kpiOptions.length === 0 ? (
              <input
                type="text"
                value={manualKpiTitle}
                onChange={(e) => setManualKpiTitle(e.target.value)}
                placeholder="Enter KPI title (no KPI assigned)"
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
              />
            ) : (
              <select
                value={selectedKpiId}
                onChange={(e) => setSelectedKpiId(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
              >
                {kpiOptions.map((kpi) => (
                  <option key={kpi.id} value={kpi.id}>
                    {kpi.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Evidence Type</label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
            >
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
              <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f4f6fb', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-file-check"></i>
                <span>{file.name}</span>
                <span style={{ marginLeft: 'auto', color: '#6b7a99' }}>{Math.ceil(file.size / 1024)} KB</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Description / Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe this evidence briefly..."
              style={{ width: '100%', minHeight: '80px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', resize: 'none' }}
            />
          </div>

          <button
            onClick={handleSubmitEvidence}
            disabled={submitting}
            style={{
              background: '#1a3a5c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <i className="bi bi-upload"></i> {submitting ? 'Submitting…' : 'Submit Evidence'}
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}><span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>Submission History</span></div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f6fb', borderBottom: '1px solid #e2e8f0' }}>
              {['KPI', 'File', 'Date', 'Status'].map(h => (<th key={h} style={{ textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7a99', padding: '10px 14px' }}>{h}</th>))}
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '18px 14px', color: '#6b7a99', fontSize: '13px' }}>
                  No submissions yet.
                </td>
              </tr>
            ) : (
              history.map((row) => {
                const created = row.createdAt ? new Date(row.createdAt) : null;
                const dateLabel = created
                  ? created.toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                    })
                  : '-';

                const status = row.status || 'Pending';
                const statusStyle =
                  status === 'Approved'
                    ? { background: 'rgba(29,184,122,0.12)', color: '#1db87a' }
                    : status === 'Rejected'
                      ? { background: 'rgba(229,62,62,0.1)', color: '#e53e3e' }
                      : { background: 'rgba(232,160,32,0.12)', color: '#f5a623' };

                const fileName = row.file?.originalName || 'file';
                const downloadUrl = row.file?.path
                  ? `${API_BASE_URL}${row.file.path}`
                  : null;

                return (
                  <tr key={row._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '13px 14px' }}>{row.kpiTitle}</td>
                    <td style={{ padding: '13px 14px' }}>
                      {downloadUrl ? (
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#1a3a5c', textDecoration: 'none', fontSize: '13px' }}
                        >
                          <i className="bi bi-download me-1"></i>
                          {fileName}
                        </a>
                      ) : (
                        <span style={{ color: '#6b7a99', fontSize: '13px' }}>{fileName}</span>
                      )}
                    </td>
                    <td style={{ padding: '13px 14px' }}>{dateLabel}</td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, ...statusStyle }}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmitEvidencePage;
