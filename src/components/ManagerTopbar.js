import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const ManagerTopbar = ({ pageTitle, userName = 'Manager User', avatarSrc = null, onNotificationClick }) => {
  const [showNotif, setShowNotif] = useState(false);
  const [expandedNotifId, setExpandedNotifId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notifError, setNotifError] = useState('');
  const notifWrapRef = useRef(null);

  const fetchNotifications = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setNotifications([]);
      return;
    }

    setLoadingNotifications(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/manager/notifications`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setNotifications(response.data || []);
      setNotifError('');
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifError('Unable to load notifications right now.');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const toggleNotif = () => {
    const nextShow = !showNotif;
    setShowNotif(nextShow);
    if (!nextShow) {
      setExpandedNotifId(null);
    }
    if (nextShow) {
      fetchNotifications();
    }
  };

  const markRead = async (id) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/manager/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const toggleExpandedNotif = (id) => {
    setExpandedNotifId((prev) => (prev === id ? null : id));
  };

  const clearAllNotifications = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/manager/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications read:', error);
    }
  };

  const hasUnread = notifications.some((n) => !n.read);
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join('') || 'MU';

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    const handleClickOutside = (event) => {
      if (notifWrapRef.current && !notifWrapRef.current.contains(event.target)) {
        setShowNotif(false);
        setExpandedNotifId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(interval);
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
            width: '360px',
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
                Mark all as read
              </button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {loadingNotifications ? (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#6b7a99',
                  fontSize: '13px'
                }}>
                  Loading notifications...
                </div>
              ) : notifError ? (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#d63384',
                  fontSize: '13px'
                }}>
                  {notifError}
                </div>
              ) : notifications.length === 0 ? (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#6b7a99',
                  fontSize: '13px'
                }}>
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => {
                  const timeLabel = notif.createdAt
                    ? new Date(notif.createdAt).toLocaleString()
                    : 'Just now';
                  const statusColor = notif.read ? '#6b7a99' : '#1a3a5c';
                  const titleMap = {
                    'pending-evidence': 'Evidence Reminder',
                    'progress-updated': 'KPI Progress Updated',
                    'kpi-completed': 'KPI Completed',
                    'kpi-overdue': 'Overdue KPI Alert',
                    'evidence-submitted': 'Evidence Submitted',
                  };
                  const iconMap = {
                    'pending-evidence': 'bi-clock-fill',
                    'progress-updated': 'bi-arrow-repeat',
                    'kpi-completed': 'bi-check-circle-fill',
                    'kpi-overdue': 'bi-exclamation-triangle-fill',
                    'evidence-submitted': 'bi-file-earmark-check-fill',
                  };
                  const badgeColor = notif.actionType === 'kpi-overdue' ? '#e53e3e' : notif.actionType === 'kpi-completed' ? '#1db87a' : '#1a3a5c';

                  return (
                    <div
                      key={notif._id}
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
                        onClick={() => {
                          if (
                            (notif.actionType === 'evidence-submitted' || notif.actionType === 'pending-evidence') &&
                            onNotificationClick
                          ) {
                            onNotificationClick(notif);
                          }
                          toggleExpandedNotif(notif._id);
                        }}
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
                          background: `${badgeColor}22`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <i className={`bi ${iconMap[notif.actionType] || 'bi-bell-fill'}`} style={{ color: badgeColor, fontSize: '14px' }}></i>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: notif.read ? 500 : 700,
                            fontSize: '13px',
                            color: statusColor
                          }}>
                            {titleMap[notif.actionType] || 'Notification'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '2px' }}>
                            {notif.message}
                          </div>
                          {notif.staffName && notif.kpiTitle && (
                            <div style={{ fontSize: '11px', color: '#6b7a99', marginTop: '6px' }}>
                              {notif.staffName} • {notif.kpiTitle}
                            </div>
                          )}
                          <div style={{ fontSize: '11px', color: '#6b7a99', marginTop: '4px' }}>
                            {timeLabel}
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
                      {expandedNotifId === notif._id && (
                        <div style={{ paddingLeft: '46px' }}>
                          {!notif.read && (
                            <button
                              type="button"
                              onClick={() => markRead(notif._id)}
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
                  );
                })
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
          cursor: 'pointer',
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
      </div>
    </div>
  );
};

export default ManagerTopbar;