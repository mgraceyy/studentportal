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
    minWidth: 160, color: '#0f172a',
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
    borderRadius: 20, fontSize: 11.5, fontWeight: 600,
    background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
  },
  actionBtn: {
    padding: '5px 11px', border: '1px solid transparent', borderRadius: 6,
    fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 5,
  },
  editBtn: { background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' },
  deleteBtn: { background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' },
  emptyState: { textAlign: 'center', padding: '56px 24px', color: '#94a3b8', fontSize: 14 },
  count: { fontSize: 12.5, color: '#94a3b8', marginTop: 14, padding: '0 2px' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520,
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
  label: { fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: 0.1 },
  input: {
    padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 13.5, outline: 'none', color: '#0f172a', background: '#fff',
  },
  select: {
    padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 13.5, outline: 'none', background: '#fff', color: '#0f172a',
  },
  listBox: {
    border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13.5,
    outline: 'none', background: '#fff', width: '100%', color: '#0f172a',
  },
  selectedInfo: {
    fontSize: 12, color: '#2563eb', marginTop: 4,
    background: '#eff6ff', padding: '4px 8px', borderRadius: 4, fontWeight: 500,
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
  deleteConfirmBtn: {
    padding: '9px 18px', background: '#dc2626', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  error: {
    background: '#fef2f2', color: '#dc2626', padding: '10px 14px',
    borderRadius: 8, fontSize: 13, marginBottom: 16, border: '1px solid #fecaca',
  },
  confirmText: { fontSize: 14, color: '#374151', lineHeight: 1.65, padding: '18px 24px' },
  gradeHint: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
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
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
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
    setEnrolledSubjects([]);
    try {
      const sRes = await api.get('/admin/students');
      setStudents(sRes.data.filter((s) => s.status !== 'deactivated'));
    } catch (err) { /* silent */ }
    setShowAddModal(true);
  };

  const handleSelectStudent = async (studentId) => {
    setAddForm((p) => ({ ...p, student_id: String(studentId), subject_id: '' }));
    setEnrolledSubjects([]);
    try {
      const { data } = await api.get(`/admin/students/${studentId}/enrollments`);
      setEnrolledSubjects(data);
    } catch (err) { /* silent */ }
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

  const selectedStudentObj = students.find((s) => s.id === parseInt(addForm.student_id));

  // Check which subjects already have a grade for this student + semester
  const gradedSubjectCodes = new Set(
    grades
      .filter(
        (g) =>
          selectedStudentObj &&
          g.student_number === selectedStudentObj.student_number
      )
      .map((g) => g.subject_code)
  );

  const filteredSubjects = enrolledSubjects.filter((s) => {
    const q = subjectSearch.toLowerCase();
    return !q || s.subject_code.toLowerCase().includes(q) || s.subject_name.toLowerCase().includes(q);
  });

  const selectedStudent = selectedStudentObj;
  const selectedSubject = enrolledSubjects.find((s) => s.subject_id === parseInt(addForm.subject_id));

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
                    <div style={{ ...styles.listBox, maxHeight: 120, overflowY: 'auto' }}>
                      {filteredStudents.length === 0 ? (
                        <div style={{ padding: '8px 10px', color: '#aaa', fontSize: 13 }}>No students found.</div>
                      ) : filteredStudents.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => handleSelectStudent(s.id)}
                          style={{
                            padding: '7px 10px', cursor: 'pointer', fontSize: 13,
                            background: addForm.student_id === String(s.id) ? '#1a1a2e' : 'transparent',
                            color: addForm.student_id === String(s.id) ? '#fff' : '#333',
                          }}
                        >
                          {s.student_number} — {s.last_name}, {s.first_name} ({s.course})
                        </div>
                      ))}
                    </div>
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
                    <div style={{ ...styles.listBox, maxHeight: 120, overflowY: 'auto', background: !addForm.student_id ? '#f5f5f5' : '#fff' }}>
                      {!addForm.student_id ? (
                        <div style={{ padding: '8px 10px', color: '#aaa', fontSize: 13 }}>Select a student first.</div>
                      ) : filteredSubjects.length === 0 ? (
                        <div style={{ padding: '8px 10px', color: '#aaa', fontSize: 13 }}>No subjects found.</div>
                      ) : filteredSubjects.map((s) => {
                        const hasGrade = gradedSubjectCodes.has(s.subject_code);
                        const isSelected = addForm.subject_id === String(s.subject_id);
                        return (
                          <div
                            key={s.subject_id}
                            onClick={() => setAddForm((p) => ({ ...p, subject_id: String(s.subject_id) }))}
                            style={{
                              padding: '7px 10px', cursor: 'pointer', fontSize: 13,
                              background: isSelected ? '#1a1a2e' : 'transparent',
                              color: isSelected ? '#fff' : hasGrade ? '#e65100' : '#333',
                            }}
                          >
                            {hasGrade ? '⚠ ' : ''}{s.subject_code} — {s.subject_name}{hasGrade ? ' (grade exists)' : ''}
                          </div>
                        );
                      })}
                    </div>
                    {selectedSubject && (
                      <div style={styles.selectedInfo}>
                        Selected: {selectedSubject.subject_code} — {selectedSubject.subject_name}
                      </div>
                    )}
                  </div>

                  <div style={styles.formGrid} className="rsp-grid-2">
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
