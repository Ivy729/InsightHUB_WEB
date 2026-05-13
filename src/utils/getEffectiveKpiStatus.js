/**
 * End of the deadline calendar day in the user's local timezone.
 * Parses leading YYYY-MM-DD so "2026-05-06" is May 6 local, not UTC-shifted.
 */
function endOfDeadlineDayLocal(raw) {
  const s = String(raw ?? '').trim();
  if (!s || s === '-') return null;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const y = parseInt(iso[1], 10);
    const m = parseInt(iso[2], 10) - 1;
    const d = parseInt(iso[3], 10);
    return new Date(y, m, d, 23, 59, 59, 999);
  }
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return null;
  const copy = new Date(parsed.getTime());
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function startOfTodayLocal() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

/**
 * Display / filter status: overdue when deadline has passed (after end of due date)
 * and progress is under 100%.
 */
export function getEffectiveKpiStatus(kpi) {
  const progressValue = Number(kpi?.progress) || 0;
  const rawStatus = String(kpi?.status || 'in-progress').toLowerCase();

  if (progressValue >= 100) {
    return 'achieved';
  }

  const deadlineEnd = endOfDeadlineDayLocal(kpi?.deadline);
  const todayStart = startOfTodayLocal();

  if (deadlineEnd) {
    if (deadlineEnd < todayStart && progressValue < 100) {
      return 'overdue';
    }
    if (progressValue > 0) {
      return 'in-progress';
    }
    if (rawStatus === 'achieved') return 'achieved';
    return rawStatus || 'pending';
  }

  if (progressValue > 0) {
    return 'in-progress';
  }
  if (rawStatus === 'achieved') return 'achieved';
  return rawStatus || 'pending';
}
