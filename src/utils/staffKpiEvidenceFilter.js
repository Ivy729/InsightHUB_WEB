/**
 * KPI IDs that have manager-approved evidence (raw rows from GET /api/staff/evidence/my-evidence).
 */
export function approvedKpiIdsFromEvidenceApiRows(rows) {
  const ids = new Set();
  for (const row of Array.isArray(rows) ? rows : []) {
    if (String(row.status || '').toLowerCase() !== 'approved') continue;
    const ref = row.kpiId;
    const id =
      ref && typeof ref === 'object' && ref._id != null
        ? String(ref._id)
        : ref != null
          ? String(ref)
          : '';
    if (id) ids.add(id);
  }
  return ids;
}

/** Hide KPIs that are at 100% and already have approved evidence (staff submit / update dropdowns). */
export function excludeKpisWithApprovedEvidenceAt100(kpis, approvedIdSet) {
  const set = approvedIdSet instanceof Set ? approvedIdSet : new Set(Array.isArray(approvedIdSet) ? approvedIdSet : []);
  return (Array.isArray(kpis) ? kpis : []).filter((k) => {
    const id = k?.id != null ? String(k.id) : '';
    const prog = Number(k.progress) || 0;
    return !(prog >= 100 && id && set.has(id));
  });
}
