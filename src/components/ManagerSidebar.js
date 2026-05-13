import React from 'react';

const ManagerSidebar = ({
  currentPage,
  showPage,
  handleLogout,
  pendingEvidenceCount = 0,
  userName = 'Manager User',
  userRole = 'manager',
  avatarSrc = null,
}) => {
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join('') || 'MU';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill', section: 'Overview' },
    { id: 'kpiManage', label: 'Manage KPIs', icon: 'bi-list-check', section: 'KPI Management' },
    { id: 'verify', label: 'Verify Evidence', icon: 'bi-shield-check', section: 'KPI Management', badge: pendingEvidenceCount },
    { id: 'staff', label: 'Staff Members', icon: 'bi-people-fill', section: 'Team' },
    { id: 'profile', label: 'My Profile', icon: 'bi-person-circle', section: 'Account' },
    { id: 'settings', label: 'Settings', icon: 'bi-gear-fill', section: 'Account' },
  ];

  let currentSection = '';

  return (
    <aside style={{
      width: '260px',
      background: '#1a3a5c',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 100,
      padding: '0 0 20px',
      overflowY: 'auto',
      color: 'white'
    }}>
      {/* Brand */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '22px 22px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '8px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: '#e8a020',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: 'white'
        }}>
          <i className="bi bi-bar-chart-fill"></i>
        </div>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', color: 'white' }}>
          KPI Manager
        </span>
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const isNewSection = item.section !== currentSection;
          currentSection = item.section;

          return (
            <div key={item.id}>
              {isNewSection && (
                <div style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)',
                  padding: '12px 22px 6px',
                  marginTop: '6px'
                }}>
                  {item.section}
                </div>
              )}
              <button
                type="button"
                onClick={() => showPage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '11px',
                  padding: '10px 22px',
                  margin: '1px 10px',
                  borderRadius: '9px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: currentPage === item.id ? '#e8a020' : 'rgba(255,255,255,0.65)',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  background: currentPage === item.id ? 'rgba(232,160,32,0.18)' : 'transparent',
                  textDecoration: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== item.id) {
                    e.target.style.background = 'rgba(255,255,255,0.08)';
                    e.target.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== item.id) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'rgba(255,255,255,0.65)';
                  }
                }}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: '17px', width: '20px', textAlign: 'center' }}></i>
                {item.label}
                {Number(item.badge) > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#e8a020',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '11px',
                    padding: '1px 8px',
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        padding: '16px 22px',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#e8a020',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px',
            color: 'white',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {avatarSrc ? (
              <img
                key={avatarSrc}
                src={avatarSrc}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>
              {userName}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
              {String(userRole).charAt(0).toUpperCase() + String(userRole).slice(1)}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            padding: '10px 0',
            marginTop: '12px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.65)',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 0.18s',
            border: 'none',
            background: 'transparent',
            fontFamily: 'inherit',
            width: '100%',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'rgba(255,255,255,0.65)';
          }}
        >
          <i className="bi bi-box-arrow-left" style={{ fontSize: '17px', width: '20px', textAlign: 'center' }}></i>
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default ManagerSidebar;
