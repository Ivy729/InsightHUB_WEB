import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../apiClient';
import {
  approvedKpiIdsFromEvidenceApiRows,
  excludeKpisWithApprovedEvidenceAt100,
} from '../../utils/staffKpiEvidenceFilter';

const kindStyle = (kind) => {
  switch (kind) {
    case 'evidence_approved':
      return { bg: '#1db87a', icon: 'bi-check-lg' };
    case 'evidence_rejected':
      return { bg: '#e53e3e', icon: 'bi-x-lg' };
    case 'progress_update':
      return { bg: '#e8a020', icon: 'bi-arrow-up' };
    case 'evidence_submitted':
      return { bg: '#3b82f6', icon: 'bi-cloud-upload' };
    case 'kpi_assigned':
    default:
      return { bg: '#1a3a5c', icon: 'bi-flag' };
  }
};

const formatHistoryDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const pctFromSteps = (doneArr, len) => {
  if (!len) return 0;
  const done = (Array.isArray(doneArr) ? doneArr : []).filter(Boolean).length;
  return Math.round((done / len) * 100);
};

function mapApiKpiToStaffRow(data, existing) {
  const taskSteps = Array.isArray(data.taskSteps)
    ? data.taskSteps.map((s) => String(s || '').trim()).filter(Boolean)
    : [];
  let taskStepDone = Array.isArray(data.taskStepDone) ? data.taskStepDone.map(Boolean) : [];
  while (taskStepDone.length < taskSteps.length) taskStepDone.push(false);
  taskStepDone = taskStepDone.slice(0, taskSteps.length);

  const progress = Number(data.progress) || 0;
  let status = 'pending';
  if (progress >= 100) {
    status = 'achieved';
  } else if (data.deadline) {
    const deadlineDate = new Date(data.deadline);
    deadlineDate.setHours(23, 59, 59, 999);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today && progress < 100) status = 'overdue';
    else if (progress > 0) status = 'in-progress';
  } else if (progress > 0) {
    status = 'in-progress';
  }

  const startRaw = data.startDate != null ? String(data.startDate) : existing?.startDateRaw || '';

  return {
    ...existing,
    id: data._id || existing?.id,
    title: data.title || existing?.title || 'Untitled KPI',
    subtitle: data.desc ? String(data.desc).slice(0, 120) : existing?.subtitle || 'Assigned KPI',
    category: data.dept || existing?.category || 'General',
    target:
      taskSteps.length > 0
        ? `${taskSteps.length} step(s)`
        : String(data.target ?? existing?.target ?? '—'),
    taskSteps,
    taskStepDone,
    desc: String(data.desc ?? existing?.desc ?? ''),
    dept: String(data.dept ?? existing?.dept ?? ''),
    staffAssigned: String(data.staff ?? existing?.staffAssigned ?? ''),
    startDate: startRaw
      ? (() => {
          try {
            return new Date(startRaw).toLocaleDateString();
          } catch {
            return startRaw;
          }
        })()
      : '—',
    startDateRaw: startRaw,
    progress,
    deadline: data.deadline ? new Date(data.deadline).toLocaleDateString() : '—',
    deadlineRaw: data.deadline || null,
    status: data.status || status,
  };
}

const UpdateProgressPage = ({ kpis = [], selectedKpiId, setSelectedKpiId, setKpis }) => {
  const [progress, setProgress] = useState(0);
  const [stepDone, setStepDone] = useState([]);
  const [note, setNote] = useState('');
  const [updateDate, setUpdateDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [approvedEvidenceKpiIds, setApprovedEvidenceKpiIds] = useState(() => new Set());

  const kpiOptions = useMemo(
    () => excludeKpisWithApprovedEvidenceAt100(kpis, approvedEvidenceKpiIds),
    [kpis, approvedEvidenceKpiIds]
  );

  const selectedKpi = useMemo(
    () =>
      kpiOptions.find((kpi) => String(kpi.id) === String(selectedKpiId)) ||
      kpiOptions[0] ||
      null,
    [kpiOptions, selectedKpiId]
  );

  const loadMyEvidence = async () => {
    try {
      const res = await api.get('/api/staff/evidence/my-evidence');
      setApprovedEvidenceKpiIds(
        approvedKpiIdsFromEvidenceApiRows(Array.isArray(res.data) ? res.data : [])
      );
    } catch {
      setApprovedEvidenceKpiIds(new Set());
    }
  };

  useEffect(() => {
    loadMyEvidence();
  }, [kpis]);

  const taskSteps = selectedKpi?.taskSteps || [];
  const hasTaskSteps = taskSteps.length > 0;

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/api/staff/progress-history');
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (kpiOptions.length === 0) return;
    const stillThere = kpiOptions.some((k) => String(k.id) === String(selectedKpiId));
    if (!selectedKpiId || !stillThere) {
      setSelectedKpiId(String(kpiOptions[0].id));
    }
  }, [kpiOptions, selectedKpiId, setSelectedKpiId]);

  useEffect(() => {
    if (!selectedKpi) return;
    const steps = selectedKpi.taskSteps || [];
    const done = selectedKpi.taskStepDone || [];
    const padded = steps.map((_, i) => Boolean(done[i]));
    setStepDone(padded);
    if (steps.length > 0) {
      setProgress(pctFromSteps(padded, steps.length));
    } else {
      setProgress(Number(selectedKpi.progress) || 0);
    }
  }, [selectedKpi]);

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

  if (kpiOptions.length === 0) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>
              Update KPI Progress
            </span>
          </div>
          <div style={{ padding: '18px 22px' }}>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(29,184,122,0.1)',
                border: '1px solid rgba(29,184,122,0.25)',
                color: '#0f5132',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              There are no KPIs to update here. KPIs that are at <strong>100%</strong> with{' '}
              <strong>manager-approved</strong> evidence are not listed.
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>
              Progress History
            </span>
          </div>
          <div
            style={{
              padding: '18px 22px',
              maxHeight: '420px',
              overflowY: 'auto',
            }}
          >
            {historyLoading ? (
              <div style={{ color: '#6b7a99', fontSize: '14px' }}>Loading history…</div>
            ) : history.length === 0 ? (
              <div style={{ color: '#6b7a99', fontSize: '14px' }}>
                No activity yet. Saving progress, submitting evidence, and KPI assignments will appear here.
              </div>
            ) : (
              history.map((row) => {
                const st = kindStyle(row.kind);
                const sub = [row.kpiTitle || 'KPI', formatHistoryDate(row.createdAt)].filter(Boolean).join(' · ');
                return (
                  <div key={row._id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: st.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0,
                      }}
                    >
                      <i className={`bi ${st.icon}`} />
                    </div>
                    <div style={{ paddingTop: '4px', minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{row.headline}</div>
                      <div style={{ fontSize: '12px', color: '#6b7a99' }}>{sub}</div>
                      {row.detail ? (
                        <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                          {row.detail}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleKpiChange = (e) => {
    const nextId = String(e.target.value);
    setSelectedKpiId(nextId);
    const nextKpi = kpiOptions.find((k) => String(k.id) === nextId);
    if (!nextKpi) return;
    const steps = nextKpi.taskSteps || [];
    const done = nextKpi.taskStepDone || [];
    const padded = steps.map((_, i) => Boolean(done[i]));
    setStepDone(padded);
    if (steps.length > 0) {
      setProgress(pctFromSteps(padded, steps.length));
    } else {
      setProgress(Number(nextKpi.progress) || 0);
    }
  };

  const toggleStep = (index) => {
    if (!hasTaskSteps) return;
    const next = stepDone.map((v, j) => (j === index ? !v : v));
    setStepDone(next);
    setProgress(pctFromSteps(next, taskSteps.length));
  };

  const saveProgress = async () => {
    if (!selectedKpi) return;
    const normalizedProgress = hasTaskSteps ? pctFromSteps(stepDone, taskSteps.length) : Number(progress);
    setSaving(true);
    try {
      const body = {
        note: note.trim(),
        updatedOn: updateDate,
      };
      if (hasTaskSteps) {
        body.taskStepDone = taskSteps.map((_, i) => Boolean(stepDone[i]));
        body.progress = normalizedProgress;
      } else {
        body.progress = normalizedProgress;
      }

      const res = await api.put(`/api/kpis/${selectedKpi.id}/progress`, body);

      setKpis((prev) =>
        prev.map((kpi) => {
          if (kpi.id !== selectedKpi.id) return kpi;
          return mapApiKpiToStaffRow(res.data, kpi);
        })
      );
      await loadHistory();
      alert('Progress updated successfully.');
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to save progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>
            Update KPI Progress
          </span>
        </div>
        <div style={{ padding: '18px 22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select KPI</label>
            <select
              value={selectedKpi ? selectedKpi.id : ''}
              onChange={handleKpiChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
              }}
            >
              {kpiOptions.map((kpi) => (
                <option key={kpi.id} value={kpi.id}>
                  {kpi.title} (currently {kpi.progress}%)
                </option>
              ))}
            </select>
          </div>

          {hasTaskSteps ? (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Task steps</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {taskSteps.map((label, i) => (
                  <label
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      color: '#334155',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(stepDone[i])}
                      onChange={() => toggleStep(i)}
                      style={{ marginTop: '3px' }}
                    />
                    <span style={{ flex: 1, lineHeight: 1.45 }}>{label}</span>
                  </label>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '10px' }}>
                Completion is calculated from checked steps: {stepDone.filter(Boolean).length} / {taskSteps.length} × 100%
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Progress (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <div
              role="progressbar"
              aria-valuenow={Math.round(Number(progress) || 0)}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{
                height: '8px',
                borderRadius: '999px',
                background: '#eef1f7',
                overflow: 'hidden',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, Number(progress) || 0))}%`,
                  borderRadius: '999px',
                  background: '#e8a020',
                  transition: 'width 0.22s ease',
                }}
              />
            </div>
            <div style={{ textAlign: 'center', fontFamily: "'Fraunces', serif", fontSize: '28px', fontWeight: 700, color: '#1a3a5c', marginTop: '4px' }}>{progress}%</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Progress Note</label>
            <textarea
              placeholder="Describe what you have accomplished..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Date of Update</label>
            <input
              type="date"
              value={updateDate}
              onChange={(e) => setUpdateDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
              }}
            />
          </div>

          <button
            onClick={saveProgress}
            disabled={saving}
            style={{
              background: '#1a3a5c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <i className="bi bi-check-circle"></i> {saving ? 'Saving…' : 'Save Progress'}
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>
            Progress History
          </span>
        </div>
        <div
          style={{
            padding: '18px 22px',
            maxHeight: '420px',
            overflowY: 'auto',
          }}
        >
          {historyLoading ? (
            <div style={{ color: '#6b7a99', fontSize: '14px' }}>Loading history…</div>
          ) : history.length === 0 ? (
            <div style={{ color: '#6b7a99', fontSize: '14px' }}>
              No activity yet. Saving progress, submitting evidence, and KPI assignments will appear here.
            </div>
          ) : (
            history.map((row) => {
              const st = kindStyle(row.kind);
              const sub = [row.kpiTitle || 'KPI', formatHistoryDate(row.createdAt)].filter(Boolean).join(' · ');
              return (
                <div key={row._id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: st.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    <i className={`bi ${st.icon}`} />
                  </div>
                  <div style={{ paddingTop: '4px', minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{row.headline}</div>
                    <div style={{ fontSize: '12px', color: '#6b7a99' }}>{sub}</div>
                    {row.detail ? (
                      <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{row.detail}</div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateProgressPage;
