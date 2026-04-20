import React, { useState } from 'react';

const StaffTopbar = ({ pageTitle }) => {
  const [showNotif, setShowNotif] = useState(false);
  const [notifItems, setNotifItems] = useState([
    { id: 1, type: 'success', icon: 'bi-check-lg', text: 'Evidence Approved', sub: 'Research Publications · 2h ago', unread: true },
    { id: 2, type: 'danger', icon: 'bi-exclamation-triangle', text: 'KPI Overdue', sub: 'Community Service · Due Mar 2025', unread: true },
    { id: 3, type: 'warning', icon: 'bi-upload', text: 'Evidence Submitted', sub: 'Student Pass Rate · 1d ago', unread: false },
    { id: 4, type: 'primary', icon: 'bi-pencil', text: 'Progress Updated', sub: 'Research Publications · 3d ago', unread: false }
  ]);

  const markRead = (item) => {
    setNotifItems(notifItems.map(n => n.id === item.id ? { ...n, unread: false } : n));
  };

  const markAllRead = () => {
    setNotifItems(notifItems.map(n => ({ ...n, unread: false })));
  };

  const hasUnread = notifItems.some(n => n.unread);

  const getColorClass = (type) => {
    const colors = {
      success: { bg: 'rgba(29,184,122,0.2)', color: '#1db87a' },
      danger: { bg: 'rgba(229,62,62,0.2)', color: '#e53e3e' },
      warning: { bg: 'rgba(232,160,32,0.2)', color: '#e8a020' },
      primary: { bg: 'rgba(26,58,92,0.2)', color: '#1a3a5c' }
    };
    return colors[type] || colors.primary;
  };

  return (
    <div style={{
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        fontFamily: "'Fraunces', serif",
        fontSize: '20px',
        color: '#1a2233',
        fontWeight: 700
      }}>
        {pageTitle}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Notification Bell */}
        <div
          onClick={() => setShowNotif(!showNotif)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#f4f6fb',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6b7a99',
            position: 'relative'
          }}
        >
          <i className="bi bi-bell" style={{ fontSize: '18px' }}></i>
          {hasUnread && (
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              background: '#e53e3e',
              borderRadius: '50%'
            }}></span>
          )}
        </div>

        {/* Notification Dropdown */}
        {showNotif && (
          <div style={{
            position: 'absolute',
            top: '58px',
            right: '28px',
            width: '340px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 200
          }}>
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 700 }}>
                Notifications
              </span>
              <button
                onClick={markAllRead}
                style={{
                  fontSize: '11px',
                  color: '#6b7a99',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                Mark all as read
              </button>
            </div>

            {notifItems.map(item => {
              const color = getColorClass(item.type);
              return (
                <div
                  key={item.id}
                  onClick={() => markRead(item)}
                  style={{
                    padding: '12px 18px',
                    borderBottom: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    background: item.unread ? 'rgba(26,58,92,0.03)' : 'white',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: color.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className={`bi ${item.icon}`} style={{ color: color.color, fontSize: '14px' }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: item.unread ? 700 : 500,
                      fontSize: '13px'
                    }}>
                      {item.text}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7a99' }}>
                      {item.sub}
                    </div>
                  </div>
                  {item.unread && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#1a3a5c'
                    }}></div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Avatar */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#1a3a5c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '14px',
          color: 'white',
          cursor: 'pointer'
        }}>
          AS
        </div>
      </div>
    </div>
  );
};

export default StaffTopbar;
