import React, { useState, useEffect } from 'react';
import api from '../services/api';

const S = {
  pageHeader: { marginBottom: 28 },
  greeting: { fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' },
  greetingSub: { fontSize: 13.5, color: '#64748b', marginTop: 4 },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: 18, marginBottom: 28,
  },
  statCard: {
    background: '#fff', borderRadius: 12,
    padding: '22px 22px',
    border: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  statIconWrap: {
    width: 52, height: 52, borderRadius: 12, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22,
  },
  statValue: { fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.5px' },
  statLabel: { fontSize: 12.5, color: '#64748b', marginTop: 4, fontWeight: 500 },

  bottomRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 },
  section: {
    background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
    overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  sectionHead: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
  },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  sectionBody: { padding: '4px 0' },
  announcementItem: {
    display: 'flex', gap: 14, padding: '13px 20px',
    borderBottom: '1px solid #f8fafc', alignItems: 'flex-start',
  },
  aIdx: {
    width: 24, height: 24, borderRadius: 6,
    background: '#eff6ff', color: '#2563eb',
    fontSize: 11, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1,
  },
  aTitle: { fontSize: 13.5, fontWeight: 600, color: '#0f172a', lineHeight: 1.3 },
  aDate: { fontSize: 11.5, color: '#94a3b8', marginTop: 3 },
  emptyText: { fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '36px 20px' },

  qLinkGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 16 },
  qLink: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
    borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#f8fafc',
    cursor: 'pointer', textDecoration: 'none', transition: 'all 0.15s',
    color: '#0f172a',
  },
  qLinkIcon: {
    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
  },
  qLinkLabel: { fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 },
  qLinkSub: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
};

const STAT_COLORS = [
  { bg: '#eff6ff', color: '#2563eb' },
  { bg: '#f0fdf4', color: '#16a34a' },
  { bg: '#fef9c3', color: '#a16207' },
  { bg: '#fdf4ff', color: '#9333ea' },
];

const QUICK_LINKS = [
  { label: 'Add Student', sub: 'Register new student', icon: '👨‍🎓', path: '/students' },
  { label: 'Post Announcement', sub: 'Notify students', icon: '📢', path: '/announcements' },
  { label: 'Manage Schedules', sub: 'Classes & rooms', icon: '🗓️', path: '/schedules' },
  { label: 'Record Grades', sub: 'Academic results', icon: '📝', path: '/grades' },
];

function Dashboard() {
  const [stats, setStats] = useState({ students: 0, subjects: 0, enrollments: 0, announcements: 0 });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const adminName = (localStorage.getItem('admin_name') || 'Admin').split(' ')[0];

  useEffect(() => {
    async function fetchData() {
      try {
        const [sr, subr, enr, anr] = await Promise.allSettled([
          api.get('/admin/students'),
          api.get('/admin/subjects'),
          api.get('/admin/enrollments'),
          api.get('/announcements'),
        ]);
        setStats({
          students: sr.status === 'fulfilled' ? sr.value.data.length : 0,
          subjects: subr.status === 'fulfilled' ? subr.value.data.length : 0,
          enrollments: enr.status === 'fulfilled' ? enr.value.data.length : 0,
          announcements: anr.status === 'fulfilled' ? anr.value.data.length : 0,
        });
        if (anr.status === 'fulfilled') setRecentAnnouncements(anr.value.data.slice(0, 5));
      } catch {}
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.students, icon: '👨‍🎓' },
    { label: 'Active Subjects', value: stats.subjects, icon: '📚' },
    { label: 'Enrollments', value: stats.enrollments, icon: '📋' },
    { label: 'Announcements', value: stats.announcements, icon: '📢' },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      {/* Page Header */}
      <div style={S.pageHeader}>
        <h1 style={S.greeting}>Good day, {adminName} 👋</h1>
        <p style={S.greetingSub}>{today}</p>
      </div>

      {/* Stats Cards */}
      <div style={S.statsGrid} className="rsp-stats-grid">
        {cards.map((c, i) => (
          <div key={c.label} style={S.statCard}>
            <div style={{ ...S.statIconWrap, background: STAT_COLORS[i].bg }}>
              {c.icon}
            </div>
            <div>
              <div style={S.statValue}>{loading ? '—' : c.value.toLocaleString()}</div>
              <div style={S.statLabel}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div style={S.bottomRow} className="rsp-two-col">
        {/* Recent Announcements */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <span style={S.sectionTitle}>Recent Announcements</span>
            <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500 }}>
              {recentAnnouncements.length} recent
            </span>
          </div>
          <div style={S.sectionBody}>
            {loading ? (
              <p style={S.emptyText}>Loading…</p>
            ) : recentAnnouncements.length === 0 ? (
              <p style={S.emptyText}>No announcements posted yet.</p>
            ) : (
              recentAnnouncements.map((a, i) => (
                <div key={a.id} style={S.announcementItem}>
                  <div style={S.aIdx}>{i + 1}</div>
                  <div>
                    <div style={S.aTitle}>{a.title}</div>
                    <div style={S.aDate}>
                      {new Date(a.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <span style={S.sectionTitle}>Quick Actions</span>
          </div>
          <div style={S.qLinkGrid} className="rsp-qlink-grid">
            {QUICK_LINKS.map((q) => (
              <a key={q.label} href={q.path} style={S.qLink}>
                <div style={{ ...S.qLinkIcon, background: '#eff6ff' }}>{q.icon}</div>
                <div>
                  <div style={S.qLinkLabel}>{q.label}</div>
                  <div style={S.qLinkSub}>{q.sub}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
