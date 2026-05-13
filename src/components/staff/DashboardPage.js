import React from 'react';

const DashboardPage = ({ userName = 'Staff User', kpis = [] }) => {
  const totalKpis = kpis.length;
  const achievedKpis = kpis.filter((kpi) => kpi.status === 'achieved').length;
  const inProgressKpis = kpis.filter((kpi) => kpi.status === 'in-progress').length;
  const overdueKpis = kpis.filter((kpi) => kpi.status === 'overdue').length;

  return (
    <div>
    <div style={{
      background: '#1a3a5c',
      borderRadius: '16px',
      padding: '24px 28px',
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',
      color: 'white'
    }}>
      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', background: 'rgba(232,160,32,0.12)', borderRadius: '50%' }}></div>
      <div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Good morning,</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', color: 'white', fontWeight: 700, marginBottom: '6px' }}>{userName} 👋</div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)' }}>
          {totalKpis === 0
            ? 'No KPIs assigned yet. Your dashboard is ready.'
            : `You have ${totalKpis} assigned KPI${totalKpis > 1 ? 's' : ''}. Keep it up!`}
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
      <StatCard icon="bi-list-check" color="blue" value={String(totalKpis)} label="Total KPIs Assigned" />
      <StatCard icon="bi-check-circle-fill" color="green" value={String(achievedKpis)} label="Achieved" />
      <StatCard icon="bi-arrow-repeat" color="gold" value={String(inProgressKpis)} label="In Progress" />
      <StatCard icon="bi-exclamation-triangle-fill" color="red" value={String(overdueKpis)} label="Overdue" />
    </div>

    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1a2233', fontWeight: 700 }}>My KPI Progress</span>
      </div>
      <div
        style={{
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxHeight: '320px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {kpis.length === 0 ? (
          <div style={{ padding: '16px', border: '1px dashed #d5dbe7', borderRadius: '10px', color: '#6b7a99', fontSize: '14px' }}>
            No KPI assigned yet.
          </div>
        ) : (
          kpis.map((kpi) => (
            <KpiCard
              key={kpi.id}
              title={kpi.title}
              category={kpi.category || 'General'}
              deadline={kpi.deadline || '-'}
              progress={Number(kpi.progress) || 0}
              status={kpi.status}
              achievement={
                kpi.taskSteps?.length
                  ? `${kpi.taskSteps.length} task step${kpi.taskSteps.length === 1 ? '' : 's'}`
                  : `Target: ${kpi.target ?? '—'}`
              }
            />
          ))
        )}
      </div>
    </div>
  </div>
  );
};

const StatCard = ({ icon, color, value, label }) => {
  const colors = {
    blue: { bg: 'rgba(26,58,92,0.1)', text: '#1a3a5c' },
    green: { bg: 'rgba(29,184,122,0.1)', text: '#1db87a' },
    gold: { bg: '#fdf3e0', text: '#e8a020' },
    red: { bg: 'rgba(229,62,62,0.1)', text: '#e53e3e' }
  };

  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '20px 22px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '60px', height: '60px',
        borderRadius: '0 14px 0 60px', background: colors[color].text, opacity: 0.07
      }}></div>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '18px',
        marginBottom: '14px', background: colors[color].bg, color: colors[color].text
      }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: '30px', fontWeight: 700, color: '#1a2233' }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#6b7a99', marginTop: '2px' }}>{label}</div>
    </div>
  );
};

const KpiCard = ({ title, category, deadline, progress, status, achievement }) => {
  const statusColors = {
    pending: { border: '#94a3b8', badge: 'rgba(107,122,153,0.12)', text: '#6b7a99', bar: '#94a3b8' },
    'in-progress': { border: '#e8a020', badge: 'rgba(232,160,32,0.12)', text: '#f5a623', bar: '#e8a020' },
    achieved: { border: '#1db87a', badge: 'rgba(29,184,122,0.12)', text: '#1db87a', bar: '#1db87a' },
    overdue: { border: '#e53e3e', badge: 'rgba(229,62,62,0.1)', text: '#e53e3e', bar: '#e53e3e' },
  };

  const colors = statusColors[status] || statusColors.pending;

  return (
    <div style={{ border: `1px solid #e2e8f0`, borderLeft: `4px solid ${colors.border}`, borderRadius: '12px', padding: '16px', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>{title}</div>
          <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '2px' }}>{category} · Due {deadline}</div>
        </div>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%', border: `3px solid ${colors.bar}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          fontWeight: 700, color: colors.bar
        }}>
          {progress}%
        </div>
      </div>
      <div style={{ background: '#f4f6fb', borderRadius: '20px', height: '7px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: colors.bar, borderRadius: '20px' }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#6b7a99', gap: '8px' }}>
        <span>{achievement}</span>
        <span style={{ background: colors.badge, color: colors.text, padding: '3px 10px', borderRadius: '20px', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {status === 'pending'
            ? 'Pending'
            : status === 'in-progress'
              ? 'In Progress'
              : status === 'achieved'
                ? 'Achieved'
                : 'Overdue'}
        </span>
      </div>
    </div>
  );
};

export default DashboardPage;
