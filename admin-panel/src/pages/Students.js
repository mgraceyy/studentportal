import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const COURSES = [
  'BSIT', 'BSCS', 'BSIS', 'BSA', 'BSBA', 'BSN', 'BSED', 'BEED', 'BSCRIM',
];

const YEAR_LEVELS = ['1st', '2nd', '3rd', '4th', '5th'];
const yearLabel = (n) => YEAR_LEVELS[n - 1] || n;


const EMPTY_FORM = {
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  mobile_number: '',
  address: '',
  student_number: '',
  course: 'BSIT',
  year_level: 1,
  section: '',
  status: 'not_enrolled',
};

// ── Styles ──

const styles = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 24, flexWrap: 'wrap', gap: 12,
  },
  title: { fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 3 },
  addBtn: {
    padding: '9px 18px', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
  },
  searchRow: {
    display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1, minWidth: 220, padding: '9px 13px',
    border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13.5,
    outline: 'none', background: '#fff', color: '#0f172a',
  },
  filterSelect: {
    padding: '9px 13px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 13.5, outline: 'none', background: '#fff',
    minWidth: 140, color: '#0f172a',
  },
  tableWrap: {
    background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
    overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13.5 },
  th: {
    textAlign: 'left', padding: '11px 16px', background: '#f8fafc',
    color: '#64748b', fontWeight: 600, fontSize: 11.5,
    textTransform: 'uppercase', letterSpacing: 0.6,
    borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
    color: '#0f172a', verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
    borderRadius: 20, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap',
  },
  badgeEnrolled: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
  badgeNotEnrolled: { background: '#fefce8', color: '#a16207', border: '1px solid #fde68a' },
  badgeDeactivated: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
  actionBtn: {
    padding: '5px 11px', border: '1px solid transparent', borderRadius: 6,
    fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 5,
  },
  editBtn: { background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' },
  deactivateBtn: { background: '#fefce8', color: '#a16207', borderColor: '#fde68a' },
  activateBtn: { background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' },
  emptyState: {
    textAlign: 'center', padding: '56px 24px', color: '#94a3b8',
    fontSize: 14,
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#fff', borderRadius: 14, width: '100%', maxWidth: 640,
    maxHeight: '90vh', overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: { fontSize: 17, fontWeight: 700, color: '#0f172a' },
  closeBtn: {
    background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
    width: 32, height: 32, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', fontSize: 18,
  },
  modalBody: { padding: 24 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  formGroup: { display: 'flex', flexDirection: 'column' },
  formGroupFull: { display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' },
  label: { fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: 0.1 },
  input: {
    padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 13.5, outline: 'none', color: '#0f172a', background: '#fff',
  },
  select: {
    padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 13.5, outline: 'none', background: '#fff', color: '#0f172a',
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: 10,
    padding: '16px 24px', borderTop: '1px solid #e2e8f0',
  },
  cancelBtn: {
    padding: '9px 18px', background: '#f1f5f9', color: '#475569',
    border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  saveBtn: {
    padding: '9px 18px', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  error: {
    background: '#fef2f2', color: '#dc2626', padding: '10px 14px',
    borderRadius: 8, fontSize: 13, marginBottom: 16, border: '1px solid #fecaca',
  },
  confirmText: { fontSize: 14, color: '#374151', lineHeight: 1.65, padding: '18px 24px' },
  confirmDeactivateBtn: {
    padding: '9px 18px', background: '#dc2626', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  count: { fontSize: 12.5, color: '#94a3b8', marginTop: 14, padding: '0 2px' },
  // Schedule modal
  viewScheduleBtn: { background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' },
  scheduleModal: {
    background: '#fff', borderRadius: 14, width: '100%', maxWidth: 700,
    maxHeight: '90vh', overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    display: 'flex', flexDirection: 'column',
  },
  modalSub: { fontSize: 12.5, color: '#64748b', marginTop: 3 },
  modalBody2: { padding: '16px 24px', flex: 1, overflow: 'auto' },
  scheduleTable: { width: '100%', borderCollapse: 'collapse', marginBottom: 20 },
  stTh: {
    padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6,
    background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
  },
  stTd: {
    padding: '11px 12px', fontSize: 13.5, color: '#0f172a',
    borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle',
  },
  dayBadge: {
    display: 'inline-flex', padding: '3px 9px', borderRadius: 10,
    fontSize: 11.5, fontWeight: 600, background: '#fdf4ff', color: '#9333ea',
    border: '1px solid #e9d5ff',
  },
  deleteBtnSm: {
    padding: '4px 10px', background: '#fef2f2', color: '#dc2626',
    border: '1px solid #fecaca', borderRadius: 6, fontSize: 11.5,
    fontWeight: 600, cursor: 'pointer',
  },
  emptySchedule: {
    textAlign: 'center', padding: '36px 0', color: '#94a3b8', fontSize: 13, marginBottom: 16,
  },
};

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Schedule modal
  const [scheduleStudent, setScheduleStudent] = useState(null);
  const [scheduleEntries, setScheduleEntries] = useState([]);
  const [entryDeleteTarget, setEntryDeleteTarget] = useState(null);
  const [entryDeleting, setEntryDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/students');
      setStudents([...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    const interval = setInterval(fetchStudents, 10000);
    return () => clearInterval(interval);
  }, [fetchStudents]);

  // ── Filtering ──

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.student_number.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q);

    const matchesCourse = !filterCourse || s.course === filterCourse;
    const matchesYear = !filterYear || s.year_level === parseInt(filterYear);

    return matchesSearch && matchesCourse && matchesYear;
  });

  const isFiltering = search || filterCourse || filterYear;
  const displayed = isFiltering ? filtered : filtered.slice(0, 10);

  // ── Add / Edit ──

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      first_name: student.first_name,
      middle_name: student.middle_name || '',
      last_name: student.last_name,
      email: student.email,
      mobile_number: student.mobile_number || '',
      address: student.address || '',
      student_number: student.student_number,
      course: student.course,
      year_level: student.year_level,
      section: student.section,
      status: student.status,
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormError('');
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      if (editing) {
        await api.put(`/admin/students/${editing.id}`, {
          first_name: form.first_name,
          middle_name: form.middle_name,
          last_name: form.last_name,
          email: form.email,
          mobile_number: form.mobile_number,
          address: form.address,
          course: form.course,
          year_level: parseInt(form.year_level),
          section: form.section,
          status: form.status,
        });
      } else {
        await api.post('/admin/students', {
          ...form,
          year_level: parseInt(form.year_level),
        });
      }
      closeModal();
      fetchStudents();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save student.');
    } finally {
      setSaving(false);
    }
  };

  // ── Deactivate / Activate ──

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/students/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  const handleActivate = async (student) => {
    try {
      await api.put(`/admin/students/${student.id}`, {
        ...student,
        status: 'not_enrolled',
      });
      fetchStudents();
    } catch (err) {
      // silent
    }
  };

  // ── Schedule modal ──

  const formatSchedTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const openSchedule = async (student) => {
    setScheduleStudent(student);
    setScheduleEntries([]);
    try {
      const { data } = await api.get(`/admin/students/${student.id}/enrollments`);
      setScheduleEntries(data);
    } catch (err) { /* silent */ }
  };

  const closeScheduleModal = () => {
    setScheduleStudent(null);
    setEntryDeleteTarget(null);
  };

  const handleDeleteEntry = async () => {
    if (!entryDeleteTarget) return;
    setEntryDeleting(true);
    try {
      await api.delete(`/admin/schedules/${entryDeleteTarget.id}`);
      setEntryDeleteTarget(null);
      const { data } = await api.get('/admin/schedules');
      setScheduleEntries(data.filter((sc) => sc.student_number === scheduleStudent.student_number));
    } catch (err) { /* silent */ }
    finally { setEntryDeleting(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Student Management</h1>
          <p style={styles.subtitle}>Manage student accounts and information</p>
        </div>
        <button style={styles.addBtn} onClick={openAdd}>
          + Add Student
        </button>
      </div>

      {/* Search & Filters */}
      <div style={styles.searchRow}>
        <input
          type="text"
          placeholder="Search by name, student number, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Courses</option>
          {COURSES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">Year Level</option>
          {YEAR_LEVELS.map((y) => (
            <option key={y} value={y}>{y} Year</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        {loading ? (
          <div style={styles.emptyState}>Loading students...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            {students.length === 0
              ? 'No students yet. Click "+ Add Student" to create one.'
              : 'No students match your search.'}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Student No.</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Course</th>
                <th style={styles.th}>Year & Section</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((s) => (
                <tr key={s.id}>
                  <td style={styles.td}>{s.student_number}</td>
                  <td style={styles.td}>
                    {s.last_name}, {s.first_name}
                    {s.middle_name ? ` ${s.middle_name.charAt(0)}.` : ''}
                  </td>
                  <td style={styles.td}>{s.email}</td>
                  <td style={styles.td}>{s.course}</td>
                  <td style={styles.td}>{yearLabel(s.year_level)} - {s.section}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(s.status === 'enrolled'
                          ? styles.badgeEnrolled
                          : s.status === 'deactivated'
                            ? styles.badgeDeactivated
                            : styles.badgeNotEnrolled),
                      }}
                    >
                      {s.status === 'enrolled' ? 'Enrolled' : s.status === 'deactivated' ? 'Deactivated' : 'Not Enrolled'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={{ ...styles.actionBtn, ...styles.editBtn }}
                      onClick={() => openEdit(s)}
                    >
                      Edit
                    </button>
                    <button
                      style={{ ...styles.actionBtn, ...styles.viewScheduleBtn }}
                      onClick={() => openSchedule(s)}
                    >
                      Schedule
                    </button>
                    {s.status === 'deactivated' ? (
                      <button
                        style={{ ...styles.actionBtn, ...styles.activateBtn }}
                        onClick={() => handleActivate(s)}
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        style={{ ...styles.actionBtn, ...styles.deactivateBtn }}
                        onClick={() => setDeleteTarget(s)}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && students.length > 0 && (
        <p style={styles.count}>
          {isFiltering
            ? `Showing ${filtered.length} of ${students.length} student${students.length !== 1 ? 's' : ''}`
            : `Showing ${displayed.length} of ${students.length} most recent records. Use search or filters to find specific students.`}
        </p>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editing ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button style={styles.closeBtn} onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSave}>
              <div style={styles.modalBody}>
                {formError && <div style={styles.error}>{formError}</div>}

                <div style={styles.formGrid} className="rsp-grid-2">
                  <div style={styles.formGroup}>
                    <label style={styles.label}>First Name *</label>
                    <input
                      style={styles.input}
                      value={form.first_name}
                      onChange={handleChange('first_name')}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Middle Name</label>
                    <input
                      style={styles.input}
                      value={form.middle_name}
                      onChange={handleChange('middle_name')}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Last Name *</label>
                    <input
                      style={styles.input}
                      value={form.last_name}
                      onChange={handleChange('last_name')}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Student Number *</label>
                    <input
                      style={styles.input}
                      value={form.student_number}
                      onChange={handleChange('student_number')}
                      placeholder="e.g. 2024-00001"
                      required={!editing}
                      disabled={editing}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email *</label>
                    <input
                      type="email"
                      style={styles.input}
                      value={form.email}
                      onChange={handleChange('email')}
                      required
                    />
                  </div>
                  {!editing && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Default Password</label>
                      <input
                        style={{ ...styles.input, background: '#f5f5f5', color: '#888' }}
                        value="student@pass"
                        readOnly
                      />
                    </div>
                  )}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Mobile Number</label>
                    <input
                      style={styles.input}
                      value={form.mobile_number}
                      onChange={handleChange('mobile_number')}
                      placeholder="e.g. 09171234567"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Course *</label>
                    <select
                      style={styles.select}
                      value={form.course}
                      onChange={handleChange('course')}
                      required
                    >
                      {COURSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Year Level *</label>
                    <select
                      style={styles.select}
                      value={form.year_level}
                      onChange={handleChange('year_level')}
                      required
                    >
                      {YEAR_LEVELS.map((y) => (
                        <option key={y} value={y}>{y} Year</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Section *</label>
                    <input
                      style={styles.input}
                      value={form.section}
                      onChange={handleChange('section')}
                      placeholder="e.g. A"
                      required
                    />
                  </div>
                  {editing && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Status</label>
                      <select
                        style={styles.select}
                        value={form.status}
                        onChange={handleChange('status')}
                      >
                        <option value="not_enrolled">Not Enrolled</option>
                        <option value="enrolled">Enrolled</option>
                        <option value="deactivated">Deactivated</option>
                      </select>
                    </div>
                  )}
                  <div style={styles.formGroupFull}>
                    <label style={styles.label}>Address</label>
                    <input
                      style={styles.input}
                      value={form.address}
                      onChange={handleChange('address')}
                      placeholder="Complete address"
                    />
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editing ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleStudent && (
        <div style={styles.overlay} onClick={closeScheduleModal}>
          <div style={styles.scheduleModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  {scheduleStudent.last_name}, {scheduleStudent.first_name} — Enrolled Subjects
                </h2>
                <p style={styles.modalSub}>
                  {scheduleStudent.student_number} · {scheduleStudent.course} · {yearLabel(scheduleStudent.year_level)} Year
                </p>
              </div>
              <button style={styles.closeBtn} onClick={closeScheduleModal}>&times;</button>
            </div>

            <div style={styles.modalBody2}>
              {scheduleEntries.length === 0 ? (
                <div style={styles.emptySchedule}>No enrolled subjects found.</div>
              ) : (
                <table style={styles.scheduleTable}>
                  <thead>
                    <tr>
                      <th style={styles.stTh}>Subject</th>
                      <th style={styles.stTh}>Term</th>
                      <th style={styles.stTh}>Day</th>
                      <th style={styles.stTh}>Time</th>
                      <th style={styles.stTh}>Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleEntries.map((sc) => (
                      <tr key={sc.id}>
                        <td style={styles.stTd}>
                          <strong>{sc.subject_code}</strong> — {sc.subject_name}
                        </td>
                        <td style={styles.stTd}>{sc.semester} {sc.academic_year}</td>
                        <td style={styles.stTd}>
                          {sc.day ? <span style={styles.dayBadge}>{sc.day}</span> : <span style={{ color: '#bbb' }}>—</span>}
                        </td>
                        <td style={styles.stTd}>
                          {sc.time_start ? `${formatSchedTime(sc.time_start)} – ${formatSchedTime(sc.time_end)}` : <span style={{ color: '#bbb' }}>—</span>}
                        </td>
                        <td style={styles.stTd}>{sc.room || <span style={{ color: '#bbb' }}>—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Entry Delete Confirmation */}
      {entryDeleteTarget && (
        <div style={styles.overlay} onClick={() => setEntryDeleteTarget(null)}>
          <div style={{ ...styles.modal, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Delete Entry</h2>
              <button style={styles.closeBtn} onClick={() => setEntryDeleteTarget(null)}>&times;</button>
            </div>
            <p style={styles.confirmText}>
              Delete{entryDeleteTarget.subject_code
                ? <> <strong>{entryDeleteTarget.subject_code}</strong></>
                : ' this entry'} from schedule? This cannot be undone.
            </p>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setEntryDeleteTarget(null)}>Cancel</button>
              <button
                style={{ ...styles.confirmDeactivateBtn, background: '#d32f2f', opacity: entryDeleting ? 0.7 : 1 }}
                disabled={entryDeleting}
                onClick={handleDeleteEntry}
              >
                {entryDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation */}
      {deleteTarget && (
        <div style={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div
            style={{ ...styles.modal, maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Deactivate Student</h2>
              <button style={styles.closeBtn} onClick={() => setDeleteTarget(null)}>
                &times;
              </button>
            </div>
            <p style={styles.confirmText}>
              Are you sure you want to deactivate{' '}
              <strong>
                {deleteTarget.first_name} {deleteTarget.last_name}
              </strong>{' '}
              ({deleteTarget.student_number})? They will no longer be able to
              log in or access the student portal.
            </p>
            <div style={styles.modalFooter}>
              <button
                style={styles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.confirmDeactivateBtn, opacity: deleting ? 0.7 : 1 }}
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deactivating...' : 'Deactivate Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
