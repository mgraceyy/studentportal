import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const MOBILE_BP = 768;

/* ─── Inline SVG Icons ─────────────────────────────────────────── */
const Ic = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {children}
  </svg>
);
const IconDashboard = () => <Ic><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></Ic>;
const IconStudents = () => <Ic><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ic>;
const IconSubjects = () => <Ic><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></Ic>;
const IconEnrollments = () => <Ic><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Ic>;
const IconGrades = () => <Ic><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Ic>;
const IconSchedules = () => <Ic><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ic>;
const IconAnnouncements = () => <Ic><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Ic>;
const IconMessages = () => <Ic><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Ic>;
const IconSettings = () => <Ic><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Ic>;
const IconLogout = () => <Ic size={16}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Ic>;
const IconMenu = () => <Ic size={20}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></Ic>;

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { path: '/students', label: 'Students', Icon: IconStudents },
  { path: '/subjects', label: 'Subjects', Icon: IconSubjects },
  { path: '/enrollments', label: 'Enrollments', Icon: IconEnrollments },
  { path: '/grades', label: 'Grades', Icon: IconGrades },
  { path: '/schedules', label: 'Schedules', Icon: IconSchedules },
  { path: '/announcements', label: 'Announcements', Icon: IconAnnouncements },
  { path: '/messages', label: 'Messages', Icon: IconMessages },
  { path: '/enrollment-settings', label: 'Settings', Icon: IconSettings },
];


function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BP);
  const navigate = useNavigate();
  const adminName = localStorage.getItem('admin_name') || 'Admin';
  const initials = adminName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < MOBILE_BP;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_name');
    navigate('/login');
  };

  const handleNavClick = () => {
    if (isMobile) setDrawerOpen(false);
  };

  const toggleSidebar = () => {
    if (isMobile) setDrawerOpen(v => !v);
    else setCollapsed(v => !v);
  };

  const W = collapsed ? 68 : 240;
  const showLabel = isMobile ? true : !collapsed;

  const sidebarStyle = isMobile
    ? {
        position: 'fixed', top: 0, left: 0, width: 260, height: '100vh',
        background: '#0f172a', display: 'flex', flexDirection: 'column',
        zIndex: 300, overflowY: 'auto', overflowX: 'hidden',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: drawerOpen ? '4px 0 24px rgba(0,0,0,0.35)' : 'none',
      }
    : {
        width: W, minWidth: W, background: '#0f172a', display: 'flex',
        flexDirection: 'column', flexShrink: 0, position: 'sticky',
        top: 0, height: '100vh', transition: 'width 0.22s ease',
        overflow: 'hidden', zIndex: 100,
      };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* Mobile backdrop */}
      {isMobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 299, WebkitTapHighlightColor: 'transparent',
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={sidebarStyle}>
        {/* Brand */}
        <div style={{
          height: 64, display: 'flex', alignItems: 'center', gap: 11,
          padding: showLabel ? '0 18px' : '0 17px',
          borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
          justifyContent: showLabel ? 'flex-start' : 'center',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
          }}>🎓</div>
          {showLabel && (
            <div>
              <div style={{ color: '#f1f5f9', fontSize: 13.5, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                Student Portal
              </div>
              <div style={{ color: '#475569', fontSize: 11, fontWeight: 500, marginTop: 1 }}>
                Admin Panel
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path}
              title={(!showLabel) ? label : undefined}
              className="nav-link"
              onClick={handleNavClick}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: 10, padding: showLabel ? '9px 12px' : '10px 0',
                margin: '1px 0', borderRadius: 8,
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? 'rgba(59,130,246,0.18)' : 'transparent',
                fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                transition: 'all 0.14s', justifyContent: showLabel ? 'flex-start' : 'center',
                textDecoration: 'none',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
              })}
            >
              <Icon />
              {showLabel && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Cell + Logout */}
        <div style={{
          padding: showLabel ? '12px 10px' : '12px 8px',
          borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
        }}>
          {showLabel && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
              borderRadius: 8, marginBottom: 8, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11.5, fontWeight: 700,
              }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  color: '#e2e8f0', fontSize: 13, fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{adminName}</div>
                <div style={{ color: '#475569', fontSize: 11 }}>Administrator</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="sidebar-logout"
            style={{
              width: '100%', background: 'rgba(239,68,68,0.08)',
              color: '#f87171', border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center',
              justifyContent: showLabel ? 'flex-start' : 'center',
              gap: 8, padding: showLabel ? '9px 12px' : '9px 0',
              transition: 'all 0.14s',
            }}
          >
            <IconLogout />
            {showLabel && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: 56, background: '#fff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 24px',
          flexShrink: 0, position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button
            onClick={toggleSidebar}
            className="btn-outline"
            style={{
              background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '7px 9px', color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.14s',
            }}
          >
            <IconMenu />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
            {!isMobile && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>{adminName}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Administrator</div>
              </div>
            )}
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 12.5, fontWeight: 700,
            }}>{initials}</div>
          </div>
        </header>

        {/* Content */}
        <main className="rsp-main" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
