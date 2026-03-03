import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const SEMESTERS = ['1st Semester', '2nd Semester', 'Summer'];

const GRADE_REMARKS = (g) => {
  if (g === null || g === '') return { label: '—', color: '#999' };
  const n = parseFloat(g);
  if (n >= 1.0 && n <= 1.25) return { label: 'Excellent', color: '#1b5e20' };
  if (n <= 1.75) return { label: 'Very Good', color: '#2e7d32' };
  if (n <= 2.25) return { label: 'Good', color: '#388e3c' };
  if (n <= 2.75) return { label: 'Satisfactory', color: '#f57c00' };
  if (n <= 3.0) return { label: 'Passing', color: '#e65100' };
  if (n === 5.0) return { label: 'Failed', color: '#c62828' };
  return { label: 'INC', color: '#6a1a7a' };
};

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
  addBtn: {
    padding: '10px 20px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  },
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
  actionBtn: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    marginRight: 6,
  },
  editBtn: { background: '#e3f2fd', color: '#1565c0' },
  deleteBtn: { background: '#ffebee', color: '#c62828' },
  emptyState: { textAlign: 'center', padding: '48px 20px', color: '#999' },
  count: { fontSize: 13, color: '#999', marginTop: 12, padding: '0 4px' },
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #eee',
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a2e' },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 22,
    color: '#999',
    cursor: 'pointer',
  },
  modalBody: { padding: 24 },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 },
  input: {
    padding: '9px 12px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
  },
  select: {
    padding: '9px 12px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: '#fff',
  },
  listBox: {
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    width: '100%',
  },
  selectedInfo: {
    fontSize: 12,
    color: '#1565c0',
    marginTop: 4,
    background: '#e3f2fd',
    padding: '4px 8px',
    borderRadius: 4,
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '16px 24px',
    borderTop: '1px solid #eee',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: '#f5f5f5',
    color: '#555',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 20px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  deleteConfirmBtn: {
    padding: '10px 20px',
    background: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    background: '#fff0f0',
    color: '#d32f2f',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    border: '1px solid #ffcdd2',
  },
  confirmText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 1.6,
    padding: '20px 24px',
  },
  gradeHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
};

function Grades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [addForm, setAddForm] = useState({
    student_id: '', subject_id: '', semester: '1st Semester', grade: '',
  });
  const [addError, setAddError] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState(null);
  const [editGrade, setEditGrade] = useState('');
  const [editError, setEditError] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGrades = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/grades');
      setGrades(data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  const filtered = grades.filter((g) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      g.student_number.toLowerCase().includes(q) ||
      g.first_name.toLowerCase().includes(q) ||
      g.last_name.toLowerCase().includes(q) ||
      (g.subject_code && g.subject_code.toLowerCase().includes(q)) ||
      (g.subject_name && g.subject_name.toLowerCase().includes(q));
    const matchesSemester = !filterSemester || g.semester === filterSemester;
    return matchesSearch && matchesSemester;
  });

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const validateGrade = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return false;
    const valid = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0];
    return valid.some((v) => Math.abs(v - n) < 0.001);
  };

  // ── Add Grade ──

  const openAddModal = async () => {
    setAddForm({ student_id: '', subject_id: '', semester: '1st Semester', grade: '' });
    setAddError('');
    setStudentSearch('');
    setSubjectSearch('');
    try {
      const [sRes, subRes, enrRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/subjects'),
        api.get('/admin/enrollments'),
      ]);
      setStudents(sRes.data.filter((s) => s.status !== 'deactivated'));
      setAllSubjects(subRes.data);
      setEnrollments(enrRes.data);
    } catch (err) { /* silent */ }
    setShowAddModal(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!addForm.student_id) return setAddError('Please select a student.');
    if (!addForm.subject_id) return setAddError('Please select a subject.');
    if (!validateGrade(addForm.grade)) {
      return setAddError('Enter a valid grade: 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, or 5.0');
    }
    setSaving(true);
    try {
      await api.post('/admin/grades', {
        student_id: parseInt(addForm.student_id),
        subject_id: parseInt(addForm.subject_id),
        semester: addForm.semester,
        grade: parseFloat(addForm.grade),
      });
      setShowAddModal(false);
      fetchGrades();
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to add grade.');
    } finally {
      setSaving(false);
    }
  };

  // ── Edit Grade ──

  const openEdit = (g) => {
    setEditTarget(g);
    setEditGrade(String(parseFloat(g.grade)));
    setEditError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!validateGrade(editGrade)) {
      return setEditError('Enter a valid grade: 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, or 5.0');
    }
    setUpdating(true);
    try {
      await api.put(`/admin/grades/${editTarget.id}`, { grade: parseFloat(editGrade) });
      setEditTarget(null);
      fetchGrades();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update grade.');
    } finally {
      setUpdating(false);
    }
  };

  // ── Delete ──

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/grades/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchGrades();
    } catch (err) { /* silent */ } finally {
      setDeleting(false);
    }
  };

  // Filtered lists for add modal
  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    return !q || s.student_number.toLowerCase().includes(q) ||
      s.first_name.toLowerCase().includes(q) || s.last_name.toLowerCase().includes(q);
  });

  // Only show subjects the selected student is enrolled in, filtered by selected semester
  const selectedStudentObj = students.find((s) => s.id === parseInt(addForm.student_id));

  const studentEnrollments = addForm.student_id
    ? enrollments.filter((e) =>
        selectedStudentObj &&
        e.student_number === selectedStudentObj.student_number &&
        e.semester === addForm.semester
      )
    : [];

  const enrolledSubjectCodes = studentEnrollments.map((e) => e.subject_code);

  const enrolledSubjects = addForm.student_id
    ? allSubjects.filter((s) => enrolledSubjectCodes.includes(s.code))
    : [];

  // Check which subjects already have a grade for this student + semester
  const gradedSubjectCodes = new Set(
    grades
      .filter(
        (g) =>
          selectedStudentObj &&
          g.student_number === selectedStudentObj.student_number &&
          g.semester === addForm.semester
      )
      .map((g) => g.subject_code)
  );

  const filteredSubjects = enrolledSubjects.filter((s) => {
    const q = subjectSearch.toLowerCase();
    return !q || s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
  });

  const selectedStudent = selectedStudentObj;
  const selectedSubject = allSubjects.find((s) => s.id === parseInt(addForm.subject_id));

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Grades Management</h1>
          <p style={styles.subtitle}>Assign and manage student grades</p>
        </div>
        <button style={styles.addBtn} onClick={openAddModal}>+ Add Grade</button>
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
          {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        {loading ? (
          <div style={styles.emptyState}>Loading grades...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            {grades.length === 0
              ? 'No grades recorded yet. Click "+ Add Grade" to start.'
              : 'No records match your search.'}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Student No.</th>
                <th style={styles.th}>Student Name</th>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Semester</th>
                <th style={styles.th}>Grade</th>
                <th style={styles.th}>Remarks</th>
                <th style={styles.th}>Updated</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => {
                const remarks = GRADE_REMARKS(g.grade);
                return (
                  <tr key={g.id}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{g.student_number}</td>
                    <td style={styles.td}>{g.last_name}, {g.first_name}</td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{g.subject_code}</span>
                      <span style={{ marginLeft: 6, color: '#555' }}>{g.subject_name}</span>
                    </td>
                    <td style={styles.td}>{g.semester}</td>
                    <td style={{ ...styles.td, fontWeight: 700, fontSize: 16 }}>
                      {parseFloat(g.grade).toFixed(2)}
                    </td>
                    <td style={{ ...styles.td, color: remarks.color, fontWeight: 600 }}>
                      {remarks.label}
                    </td>
                    <td style={{ ...styles.td, fontSize: 13, color: '#999' }}>
                      {formatDate(g.updated_at)}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={{ ...styles.actionBtn, ...styles.editBtn }}
                        onClick={() => openEdit(g)}
                      >Edit</button>
                      <button
                        style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                        onClick={() => setDeleteTarget(g)}
                      >Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && (
        <p style={styles.count}>
          Showing {filtered.length} of {grades.length} record{grades.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Add Grade Modal */}
      {showAddModal && (
        <div style={styles.overlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add Grade</h2>
              <button style={styles.closeBtn} onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAdd}>
              <div style={styles.modalBody}>
                {addError && <div style={styles.error}>{addError}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Student *</label>
                    <input
                      type="text"
                      placeholder="Search by name or student number..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      style={{ ...styles.input, marginBottom: 6 }}
                    />
                    <select
                      style={styles.listBox}
                      size={4}
                      value={addForm.student_id}
                      onChange={(e) => setAddForm((p) => ({ ...p, student_id: e.target.value, subject_id: '' }))}
                    >
                      <option value="" disabled hidden></option>
                      {filteredStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.student_number} — {s.last_name}, {s.first_name} ({s.course})
                        </option>
                      ))}
                    </select>
                    {selectedStudent && (
                      <div style={styles.selectedInfo}>
                        Selected: {selectedStudent.student_number} — {selectedStudent.last_name}, {selectedStudent.first_name}
                      </div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Subject *</label>
                    <input
                      type="text"
                      placeholder="Search by code or name..."
                      value={subjectSearch}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                      style={{ ...styles.input, marginBottom: 6 }}
                      disabled={!addForm.student_id}
                    />
                    <select
                      style={{
                        ...styles.listBox,
                        background: !addForm.student_id ? '#f5f5f5' : '#fff',
                        color: !addForm.student_id ? '#aaa' : '#333',
                      }}
                      size={4}
                      value={addForm.subject_id}
                      onChange={(e) => setAddForm((p) => ({ ...p, subject_id: e.target.value }))}
                      disabled={!addForm.student_id}
                    >
                      {!addForm.student_id ? (
                        <option disabled>Select a student first</option>
                      ) : filteredSubjects.length === 0 ? (
                        <option disabled>No enrolled subjects for this semester</option>
                      ) : (
                        filteredSubjects.map((s) => {
                          const hasGrade = gradedSubjectCodes.has(s.code);
                          return (
                            <option key={s.id} value={s.id}>
                              {hasGrade ? '⚠ ' : ''}{s.code} — {s.name}{hasGrade ? ' (grade exists)' : ''}
                            </option>
                          );
                        })
                      )}
                    </select>
                    {selectedSubject && (
                      <div style={styles.selectedInfo}>
                        Selected: {selectedSubject.code} — {selectedSubject.name}
                      </div>
                    )}
                  </div>

                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Semester *</label>
                      <select
                        style={styles.select}
                        value={addForm.semester}
                        onChange={(e) => setAddForm((p) => ({ ...p, semester: e.target.value, subject_id: '' }))}
                        required
                      >
                        {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Grade *</label>
                      <input
                        type="number"
                        step="0.25"
                        min="1.0"
                        max="5.0"
                        style={styles.input}
                        value={addForm.grade}
                        onChange={(e) => setAddForm((p) => ({ ...p, grade: e.target.value }))}
                        placeholder="e.g. 1.50"
                        required
                      />
                      <p style={styles.gradeHint}>1.0 – 3.0 passing · 5.0 failed</p>
                    </div>
                  </div>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                  {saving ? 'Saving...' : 'Add Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Grade Modal */}
      {editTarget && (
        <div style={styles.overlay} onClick={() => setEditTarget(null)}>
          <div style={{ ...styles.modal, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Grade</h2>
              <button style={styles.closeBtn} onClick={() => setEditTarget(null)}>&times;</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div style={styles.modalBody}>
                {editError && <div style={styles.error}>{editError}</div>}
                <div style={{
                  background: '#f8f9fa', borderRadius: 8, padding: '12px 14px',
                  marginBottom: 16, fontSize: 13, color: '#444', lineHeight: 1.7,
                }}>
                  <strong>{editTarget.last_name}, {editTarget.first_name}</strong><br />
                  {editTarget.subject_code} — {editTarget.subject_name}<br />
                  <span style={{ color: '#888' }}>{editTarget.semester}</span>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Grade *</label>
                  <input
                    type="number"
                    step="0.25"
                    min="1.0"
                    max="5.0"
                    style={styles.input}
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    placeholder="e.g. 1.50"
                    required
                    autoFocus
                  />
                  <p style={styles.gradeHint}>Valid: 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0</p>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setEditTarget(null)}>Cancel</button>
                <button type="submit" style={{ ...styles.saveBtn, opacity: updating ? 0.7 : 1 }} disabled={updating}>
                  {updating ? 'Updating...' : 'Update Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div style={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div style={{ ...styles.modal, maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Delete Grade</h2>
              <button style={styles.closeBtn} onClick={() => setDeleteTarget(null)}>&times;</button>
            </div>
            <p style={styles.confirmText}>
              Are you sure you want to delete the grade record for{' '}
              <strong>{deleteTarget.last_name}, {deleteTarget.first_name}</strong> in{' '}
              <strong>{deleteTarget.subject_code}</strong>? This cannot be undone.
            </p>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                style={{ ...styles.deleteConfirmBtn, opacity: deleting ? 0.7 : 1 }}
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Grade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Grades;
