import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const SEMESTERS = ['1st Semester', '2nd Semester', 'Summer'];

// ── Styles ──

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: 700, color: '#1a1a2e' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 2 },
  searchRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: 220,
    padding: '10px 14px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
  },
  filterSelect: {
    padding: '10px 14px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    minWidth: 160,
  },
  tableWrap: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflowX: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    background: '#f8f9fa',
    color: '#555',
    fontWeight: 600,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '1px solid #eee',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    color: '#333',
    whiteSpace: 'nowrap',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: '#e3f2fd',
    color: '#1565c0',
  },
  emptyState: { textAlign: 'center', padding: '48px 20px', color: '#999' },
  count: { fontSize: 13, color: '#999', marginTop: 12, padding: '0 4px' },
};

function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterAY, setFilterAY] = useState('');

  const fetchEnrollments = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/enrollments');
      setEnrollments(data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Get unique academic years for filter
  const academicYears = [...new Set(enrollments.map((e) => e.academic_year))].sort();

  const filtered = enrollments.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      e.student_number.toLowerCase().includes(q) ||
      e.first_name.toLowerCase().includes(q) ||
      e.last_name.toLowerCase().includes(q) ||
      e.subject_code.toLowerCase().includes(q) ||
      e.subject_name.toLowerCase().includes(q);

    const matchesSemester = !filterSemester || e.semester === filterSemester;
    const matchesAY = !filterAY || e.academic_year === filterAY;

    return matchesSearch && matchesSemester && matchesAY;
  });

  const isFiltering = search || filterSemester || filterAY;
  const displayed = isFiltering ? filtered : filtered.slice(0, 10);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Enrollment Records</h1>
          <p style={styles.subtitle}>View all student enrollment records</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={styles.searchRow}>
        <input
          type="text"
          placeholder="Search by student name, number, or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Semesters</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterAY}
          onChange={(e) => setFilterAY(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Academic Years</option>
          {academicYears.map((ay) => (
            <option key={ay} value={ay}>{ay}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        {loading ? (
          <div style={styles.emptyState}>Loading enrollments...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            {enrollments.length === 0
              ? 'No enrollment records yet. Students can enroll via the mobile app.'
              : 'No records match your search.'}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Student No.</th>
                <th style={styles.th}>Student Name</th>
                <th style={styles.th}>Subject Code</th>
                <th style={styles.th}>Subject Name</th>
                <th style={styles.th}>Semester</th>
                <th style={styles.th}>Academic Year</th>
                <th style={styles.th}>Enrolled At</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((e, index) => (
                <tr key={e.id}>
                  <td style={{ ...styles.td, color: '#999' }}>{index + 1}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{e.student_number}</td>
                  <td style={styles.td}>{e.last_name}, {e.first_name}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{e.subject_code}</span>
                  </td>
                  <td style={styles.td}>{e.subject_name}</td>
                  <td style={styles.td}>{e.semester}</td>
                  <td style={styles.td}>{e.academic_year}</td>
                  <td style={{ ...styles.td, fontSize: 13, color: '#666' }}>
                    {formatDate(e.enrolled_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && enrollments.length > 0 && (
        <p style={styles.count}>
          {isFiltering
            ? `Showing ${filtered.length} of ${enrollments.length} record${enrollments.length !== 1 ? 's' : ''}`
            : `Showing ${displayed.length} of ${enrollments.length} most recent records. Use search or filters to find specific students.`}
        </p>
      )}
    </div>
  );
}

export default Enrollments;
