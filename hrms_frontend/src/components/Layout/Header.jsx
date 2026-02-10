import React, { useEffect, useRef, useState } from 'react';
import { FaBell, FaSearch, FaUserCircle, FaBars } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';

const Header = ({ user, onMenuClick }) => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const {
    notifications,
    loadingNotifications,
    refreshNotifications,
    settings,
    pendingDocumentsCount,
    pendingLeavesCount,
  } = useAppState();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roleNames = (roles) =>
    (Array.isArray(roles) ? roles : [])
      .map((r) => (typeof r === 'string' ? r : r?.name || ''))
      .filter(Boolean);

  const displayRole = (() => {
    const roles = roleNames(user?.roles);
    const raw = (user?.role || '').toUpperCase();
    if (roles.includes('ROLE_ADMIN') || raw === 'ADMIN') return 'Admin';
    if (
      roles.some((r) => r.startsWith('ROLE_HR')) ||
      roles.includes('ROLE_TALENT_ACQUISITION') ||
      raw === 'HR'
    ) {
      return 'HR';
    }
    if (roles.length > 0) {
      return roles[0].replace('ROLE_', '').replace(/_/g, ' ');
    }
    return 'Employee';
  })();

  const role = user?.role?.toUpperCase();
  const canSeeNotifications = isAuthenticated && (role === 'ADMIN' || role === 'HR');
  const pendingTotal = pendingDocumentsCount + pendingLeavesCount;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showNotifications || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfileMenu]);

  const formatTimestamp = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString();
  };

  return (
    <header className="bg-white border-bottom header-bar">
      <div className="container-fluid py-2">
        <div className="row align-items-center g-2">
          <div className="col-12 col-lg-6">
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-lg-none"
                onClick={onMenuClick}
                aria-label="Open menu"
              >
                <FaBars />
              </button>
              <div className="input-group input-group-sm flex-grow-1">
                <span className="input-group-text bg-light border-0 text-muted">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-0"
                  placeholder="Search employees, documents..."
                  aria-label="Search"
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-auto ms-lg-auto">
            <div className="d-flex align-items-center gap-2 justify-content-lg-end">
              <button
                type="button"
                className="btn btn-sm theme-toggle-switch"
                id="theme-toggle"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                <span className="theme-toggle-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                <span className={`theme-toggle-track ${theme === 'dark' ? 'is-dark' : ''}`}>
                  <span className="theme-toggle-knob" />
                  <span className="theme-toggle-dot" />
                </span>
              </button>
              {canSeeNotifications && settings.notificationsEnabled && (
                <div className="position-relative" ref={dropdownRef}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm notification-trigger"
                    aria-label="Notifications"
                    onClick={() => setShowNotifications((prev) => !prev)}
                  >
                    <FaBell />
                    {pendingTotal > 0 && <span className="notification-badge">{pendingTotal}</span>}
                  </button>
                  {showNotifications && (
                    <div className="notification-panel shadow">
                      <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                        <div className="fw-semibold">Notifications</div>
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-decoration-none"
                          onClick={refreshNotifications}
                        >
                          Refresh
                        </button>
                      </div>
                      <div className="notification-body">
                        {loadingNotifications ? (
                          <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status" />
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="text-muted px-3 py-3">No notifications yet.</div>
                        ) : (
                          notifications.map((note, index) => (
                            <div key={note.id || `${note.type}-${index}`} className="notification-item">
                              <div className="fw-semibold">{note.title || 'Update'}</div>
                              <div className="small text-muted">{note.message}</div>
                              {note.createdAt && (
                                <div className="small text-muted">{formatTimestamp(note.createdAt)}</div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="position-relative" ref={profileRef}>
                <button
                  type="button"
                  className="d-flex align-items-center gap-2 bg-light border rounded px-2 py-1 user-chip user-chip-button"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  aria-label="Open profile menu"
                >
                  <FaUserCircle className="fs-3 text-secondary" />
                  <div className="d-none d-md-block text-start">
                    <div className="fw-semibold small">{user?.name || user?.email}</div>
                    <div className="text-muted text-uppercase small">{displayRole}</div>
                  </div>
                </button>
                {showProfileMenu && (
                  <div className="profile-menu shadow">
                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/profile');
                      }}
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/profile');
                      }}
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      className="profile-menu-item profile-menu-logout"
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('/login');
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
