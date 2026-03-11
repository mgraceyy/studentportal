import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/students', label: 'Students', icon: '👨‍🎓' },
  { path: '/subjects', label: 'Subjects', icon: '📚' },
  { path: '/enrollments', label: 'Enrollments', icon: '📋' },
  { path: '/grades', label: 'Grades', icon: '📝' },
  { path: '/schedules', label: 'Schedules', icon: '🗓️' },
  { path: '/announcements', label: 'Announcements', icon: '📢' },
  { path: '/messages', label: 'Messages', icon: '✉️' },
  { path: '/enrollment-settings', label: 'Settings', icon: '⚙️' },
];

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: 250,
    background: '#1a1a2e',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  sidebarCollapsed: {
    width: 70,
  },
  brand: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
  },
  brandSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  nav: {
    flex: 1,
    padding: '12px 0',
    overflowY: 'auto',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 20px',
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.15s',
    borderLeft: '3px solid transparent',
  },
  navLinkActive: {
    color: '#fff',
    background: 'rgba(255,255,255,0.08)',
    borderLeftColor: '#4fc3f7',
  },
  navIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
    flexShrink: 0,
  },
  sidebarFooter: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  logoutBtn: {
    width: '100%',
    padding: '9px 16px',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.15s',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  header: {
    height: 60,
    background: '#fff',
    borderBottom: '1px solid #e8e8e8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    flexShrink: 0,
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  adminName: {
    fontSize: 14,
    color: '#555',
    fontWeight: 500,
  },
  content: {
    flex: 1,
    padding: 28,
    overflowY: 'auto',
  },
};

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const adminName = localStorage.getItem('admin_name') || 'Admin';

  useEffect(() => {
    const fetchUnread = () => {
      api.get('/messages')
        .then(({ data }) => {
          const total = data.reduce((sum, c) => sum + (parseInt(c.unread_count) || 0), 0);
          setUnreadCount(total);
        })
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_name');
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, ...(collapsed ? styles.sidebarCollapsed : {}) }}>
        <div style={styles.brand}>
          {!collapsed ? (
            <>
              <h2 style={styles.brandTitle}>🎓 Student Portal</h2>
              <p style={styles.brandSub}>Admin Panel</p>
            </>
          ) : (
            <h2 style={{ ...styles.brandTitle, textAlign: 'center', fontSize: 24 }}>🎓</h2>
          )}
        </div>

        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isMessages = item.path === '/messages';
            const showBadge = isMessages && unreadCount > 0;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
                title={collapsed ? item.label : undefined}
              >
                <span style={{ ...styles.navIcon, position: 'relative' }}>
                  {item.icon}
                  {showBadge && collapsed && (
                    <span style={{ position: 'absolute', top: -4, right: -4, background: 'red', borderRadius: '50%', width: 8, height: 8, display: 'block' }} />
                  )}
                </span>
                {!collapsed && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    {item.label}
                    {showBadge && (
                      <span style={{ background: 'red', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '1px 7px', minWidth: 20, textAlign: 'center' }}>
                        {unreadCount}
                      </span>
                    )}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          {!collapsed ? (
            <button style={styles.logoutBtn} onClick={handleLogout}>
              🚪 Sign Out
            </button>
          ) : (
            <button
              style={{ ...styles.logoutBtn, padding: 9 }}
              onClick={handleLogout}
              title="Sign Out"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div style={styles.main}>
        <header style={styles.header}>
          <button style={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '☰' : '✕'}
          </button>
          <span style={styles.adminName}>Hello, {adminName}</span>
        </header>
        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
