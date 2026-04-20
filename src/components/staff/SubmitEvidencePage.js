import React, { useState } from 'react';

const SubmitEvidencePage = () => {
  const [file, setFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) setFile(files[0]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}><span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>Submit Evidence</span></div>
        <div style={{ padding: '18px 22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>KPI</label>
            <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>
              <option>Research Publications</option>
              <option>Student Pass Rate</option>
              <option>Community Service</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Evidence Type</label>
            <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>
              <option>Document (PDF/Word)</option>
              <option>Image</option>
              <option>Certificate</option>
              <option>Screenshot</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Upload File</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              style={{
                border: '2px dashed #e2e8f0',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#f4f6fb',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#1a3a5c'}
              onMouseLeave={(e) => e.target.style.borderColor = '#e2e8f0'}
            >
              <i className="bi bi-cloud-upload" style={{ fontSize: '32px', color: '#6b7a99' }}></i>
              <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 600 }}>Drag and drop your file here</div>
              <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '4px' }}>or click to browse</div>
            </div>
            {file && <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f4f6fb', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="bi bi-file-check"></i>{file.name}</div>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Description / Notes</label>
            <textarea placeholder="Describe this evidence briefly..." style={{ width: '100%', minHeight: '80px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', resize: 'none' }} />
          </div>

          <button style={{ background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i className="bi bi-upload"></i> Submit Evidence</button>
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
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '13px 14px' }}>Research Publications</td>
              <td style={{ padding: '13px 14px' }}><a href="#" style={{ color: '#1a3a5c', textDecoration: 'none', fontSize: '13px' }}><i className="bi bi-download me-1"></i>paper_2025.pdf</a></td>
              <td style={{ padding: '13px 14px' }}>Mar 20, 2025</td>
              <td style={{ padding: '13px 14px' }}><span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: 'rgba(29,184,122,0.12)', color: '#1db87a' }}>Approved</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmitEvidencePage;
