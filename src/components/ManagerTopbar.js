import React, { useEffect, useRef, useState } from 'react';

const ManagerTopbar = ({ pageTitle }) => {
  const [showNotif, setShowNotif] = useState(false);
  const [expandedNotifId, setExpandedNotifId] = useState(null);
  const notifWrapRef = useRef(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Overdue KPI Alert',
      msg: 'Community Service is overdue by Kevin Lim.',
      time: '2 hours ago',
      read: false,
      icon: 'bi-exclamation-triangle-fill',
      color: '#e53e3e'
    },
    {
      id: 2,
      title: 'KPI Achieved',
      msg: 'Nora Rahman completed Student Pass Rate at 100%.',
      time: '1 day ago',
      read: false,
      icon: 'bi-check-circle-fill',
      color: '#1db87a'
    },
    {
      id: 3,
      title: 'Evidence Submitted',
      msg: 'Ali Samsuri submitted proof for Research Publications.',
      time: '2 days ago',
      read: false,
      icon: 'bi-file-earmark-check-fill',
      color: '#1a3a5c'
    }
  ]);

  const toggleNotif = () => {
    setShowNotif(!showNotif);
    if (showNotif) {
      setExpandedNotifId(null);
    }
  };

  const markRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const toggleExpandedNotif = (id) => {
    setExpandedNotifId(prev => (prev === id ? null : id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const hasUnread = notifications.some(n => !n.read);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifWrapRef.current && !notifWrapRef.current.contains(event.target)) {
        setShowNotif(false);
        setExpandedNotifId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

      <div ref={notifWrapRef} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Notification Bell */}
        <div
          onClick={toggleNotif}
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
            <div style={{
              position: 'absolute',
              top: '7px',
              right: '7px',
              width: '7px',
              height: '7px',
              background: '#e53e3e',
              borderRadius: '50%'
            }}></div>
          )}
        </div>

        {/* Notification Panel */}
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
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 700 }}>
                Notifications
              </span>
              <button
                onClick={clearAllNotifications}
                style={{
                  fontSize: '11px',
                  color: '#6b7a99',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                Clear all
              </button>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#6b7a99',
                  fontSize: '13px'
                }}>
                  No notifications
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid #e2e8f0',
                      background: notif.read ? 'white' : 'rgba(26,58,92,0.03)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      flexDirection: 'column'
                    }}
                  >
                    <div
                      onClick={() => toggleExpandedNotif(notif.id)}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        width: '100%'
                      }}
                    >
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: `${notif.color}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className={`bi ${notif.icon}`} style={{ color: notif.color, fontSize: '14px' }}></i>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: notif.read ? 500 : 700,
                          fontSize: '13px'
                        }}>
                          {notif.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '2px' }}>
                          {notif.msg}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7a99', marginTop: '4px' }}>
                          {notif.time}
                        </div>
                      </div>
                      {!notif.read && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#1a3a5c',
                          marginTop: '4px'
                        }}></div>
                      )}
                    </div>
                    {expandedNotifId === notif.id && (
                      <div style={{ paddingLeft: '46px' }}>
                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => markRead(notif.id)}
                            style={{
                              fontSize: '12px',
                              color: 'white',
                              background: '#1a3a5c',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontFamily: "'DM Sans', sans-serif"
                            }}
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
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
          JD
        </div>
      </div>
    </div>
  );
};

export default ManagerTopbar;
