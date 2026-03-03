import React, { useState, useEffect } from 'react';
import api from '../services/api';

const styles = {
  heading: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#888',
    marginBottom: 28,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 20,
    marginBottom: 32,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  cardIcon: {
    fontSize: 32,
    width: 56,
    height: 56,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1a1a2e',
    lineHeight: 1,
  },
  cardLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  section: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: '20px 0',
  },
  announcementItem: {
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#333',
  },
  announcementDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
};

const CARD_COLORS = [
  { bg: '#e3f2fd', color: '#1565c0' },
  { bg: '#e8f5e9', color: '#2e7d32' },
  { bg: '#fff3e0', color: '#e65100' },
  { bg: '#f3e5f5', color: '#7b1fa2' },
];

function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    subjects: 0,
    enrollments: 0,
    announcements: 0,
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, subjectsRes, enrollmentsRes, announcementsRes] = await Promise.allSettled([
          api.get('/admin/students'),
          api.get('/admin/subjects'),
          api.get('/admin/enrollments'),
          api.get('/announcements'),
        ]);

        setStats({
          students: studentsRes.status === 'fulfilled' ? studentsRes.value.data.length : 0,
          subjects: subjectsRes.status === 'fulfilled' ? subjectsRes.value.data.length : 0,
          enrollments: enrollmentsRes.status === 'fulfilled' ? enrollmentsRes.value.data.length : 0,
          announcements: announcementsRes.status === 'fulfilled' ? announcementsRes.value.data.length : 0,
        });

        if (announcementsRes.status === 'fulfilled') {
          setRecentAnnouncements(announcementsRes.value.data.slice(0, 5));
        }
      } catch (err) {
        // Stats will remain at 0
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.students, icon: '👨‍🎓' },
    { label: 'Subjects', value: stats.subjects, icon: '📚' },
    { label: 'Enrollments', value: stats.enrollments, icon: '📋' },
    { label: 'Announcements', value: stats.announcements, icon: '📢' },
  ];

  return (
    <div>
      <h1 style={styles.heading}>Dashboard</h1>
      <p style={styles.subheading}>
        Welcome back, {localStorage.getItem('admin_name') || 'Admin'}
      </p>

      {/* Summary Cards */}
      <div style={styles.grid}>
        {cards.map((card, i) => (
          <div key={card.label} style={styles.card}>
            <div
              style={{
                ...styles.cardIcon,
                background: CARD_COLORS[i].bg,
              }}
            >
              {card.icon}
            </div>
            <div>
              <div style={styles.cardValue}>
                {loading ? '—' : card.value}
              </div>
              <div style={styles.cardLabel}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Announcements */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Announcements</h2>
        {loading ? (
          <p style={styles.emptyText}>Loading...</p>
        ) : recentAnnouncements.length === 0 ? (
          <p style={styles.emptyText}>No announcements yet.</p>
        ) : (
          recentAnnouncements.map((a) => (
            <div key={a.id} style={styles.announcementItem}>
              <div style={styles.announcementTitle}>{a.title}</div>
              <div style={styles.announcementDate}>
                {new Date(a.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
