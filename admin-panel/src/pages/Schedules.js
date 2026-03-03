import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SEMESTERS = ['1st Semester', '2nd Semester', 'Summer'];

const EMPTY_FORM = {
  code: '',
  prospectus_code: '',
  name: '',
  description: '',
  units: 3,
  semester: '1st Semester',
  academic_year: '',
  room: '',
  days: [],
  time_start: '',
  time_end: '',
  max_slots: 40,
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
  slotsBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  slotsAvailable: { background: '#e8f5e9', color: '#2e7d32' },
  slotsFull: { background: '#ffebee', color: '#c62828' },
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
    maxWidth: 680,
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
  formGroupFull: { display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' },
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
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#444',
    cursor: 'pointer',
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
  confirmDeleteBtn: {
    padding: '10px 20px',
    background: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  count: { fontSize: 13, color: '#999', marginTop: 12, padding: '0 4px' },
};

function Schedules() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [prospectus, setProspectus] = useState([]);
  const [selectedProspId, setSelectedProspId] = useState('');

  const fetchSubjects = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/subjects');
      setSubjects(data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
    api.get('/admin/prospectus').then(({ data }) => {
      const seen = new Set();
      setProspectus(data.filter((p) => (seen.has(p.code) ? false : seen.add(p.code))));
    }).catch(() => {});
  }, [fetchSubjects]);

  const filtered = subjects.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
    const matchesSemester = !filterSemester || s.semester === filterSemester;
    return matchesSearch && matchesSemester;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setSelectedProspId('');
    setShowModal(true);
  };

  const handleProspectusSelect = (id) => {
    setSelectedProspId(id);
    const entry = prospectus.find((p) => p.id === parseInt(id));
    if (entry) {
      setForm((prev) => ({
        ...prev,
        prospectus_code: entry.code,
        name: entry.name,
        units: entry.units,
        semester: entry.semester,
      }));
    } else {
      setForm((prev) => ({ ...prev, prospectus_code: '', name: '' }));
    }
  };

  const openEdit = (subject) => {
    setEditing(subject);
    setForm({
      code: subject.code,
      prospectus_code: subject.prospectus_code || '',
      name: subject.name,
      description: subject.description || '',
      units: subject.units,
      semester: subject.semester,
      academic_year: subject.academic_year,
      room: subject.room || '',
      days: subject.day ? subject.day.split(', ') : [],
      time_start: subject.time_start || '',
      time_end: subject.time_end || '',
      max_slots: subject.max_slots,
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

  const handleDayToggle = (day) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    setSaving(true);
    try {
      const { days, ...rest } = form;
      const payload = {
        ...rest,
        day: days.join(', ') || null,
        units: parseInt(form.units),
        max_slots: parseInt(form.max_slots),
        time_start: form.time_start || null,
        time_end: form.time_end || null,
      };

      if (editing) {
        await api.put(`/admin/subjects/${editing.id}`, payload);
      } else {
        await api.post('/admin/subjects', payload);
      }
      closeModal();
      fetchSubjects();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save subject.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/subjects/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchSubjects();
    } catch (err) {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Schedules</h1>
          <p style={styles.subtitle}>Manage subjects, class schedules, and course assignments</p>
        </div>
        <button style={styles.addBtn} onClick={openAdd}>
          + Add Subject
        </button>
      </div>

      <div style={styles.searchRow}>
        <input
          type="text"
          placeholder="Search by code or name..."
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
      </div>

      <div style={styles.tableWrap}>
        {loading ? (
          <div style={styles.emptyState}>Loading subjects...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            {subjects.length === 0
              ? 'No subjects yet. Click "+ Add Subject" to create one.'
              : 'No subjects match your search.'}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Subject Code</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Units</th>
                <th style={styles.th}>Semester</th>
                <th style={styles.th}>Schedule</th>
                <th style={styles.th}>Slots</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const isFull = s.current_slots >= s.max_slots;
                return (
                  <tr key={s.id}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{s.prospectus_code || '—'}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{s.code}</td>
                    <td style={styles.td}>{s.name}</td>
                    <td style={styles.td}>{s.units}</td>
                    <td style={styles.td}>
                      {s.semester}<br />
                      <span style={{ fontSize: 12, color: '#999' }}>{s.academic_year}</span>
                    </td>
                    <td style={styles.td}>
                      {s.day && s.time_start ? (
                        <>
                          {s.day}<br />
                          <span style={{ fontSize: 12, color: '#666' }}>
                            {formatTime(s.time_start)} - {formatTime(s.time_end)}
                          </span>
                          {s.room && <><br /><span style={{ fontSize: 12, color: '#999' }}>Room {s.room}</span></>}
                        </>
                      ) : (
                        <span style={{ color: '#ccc' }}>TBA</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.slotsBadge,
                        ...(isFull ? styles.slotsFull : styles.slotsAvailable),
                      }}>
                        {s.current_slots}/{s.max_slots}
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
                        style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                        onClick={() => setDeleteTarget(s)}
                      >
                        Delete
                      </button>
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
          Showing {filtered.length} of {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editing ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button style={styles.closeBtn} onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSave}>
              <div style={styles.modalBody}>
                {formError && <div style={styles.error}>{formError}</div>}

                <div style={styles.formGrid}>
                  {!editing ? (
                    <>
                      <div style={styles.formGroupFull}>
                        <label style={styles.label}>Subject *</label>
                        <select
                          style={styles.select}
                          value={selectedProspId}
                          onChange={(e) => handleProspectusSelect(e.target.value)}
                          required
                        >
                          <option value="">— Select from prospectus —</option>
                          {prospectus.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.code} — {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Subject Code *</label>
                        <input
                          style={styles.input}
                          value={form.code}
                          onChange={handleChange('code')}
                          placeholder="e.g. 1002"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Subject Code *</label>
                        <input
                          style={styles.input}
                          value={form.code}
                          onChange={handleChange('code')}
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Subject Name *</label>
                        <input
                          style={styles.input}
                          value={form.name}
                          onChange={handleChange('name')}
                          required
                        />
                      </div>
                    </>
                  )}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Units *</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={form.units}
                      onChange={handleChange('units')}
                      min={1}
                      max={6}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Max Slots *</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={form.max_slots}
                      onChange={handleChange('max_slots')}
                      min={1}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Semester *</label>
                    <select
                      style={styles.select}
                      value={form.semester}
                      onChange={handleChange('semester')}
                      required
                    >
                      {SEMESTERS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Academic Year *</label>
                    <input
                      style={styles.input}
                      value={form.academic_year}
                      onChange={handleChange('academic_year')}
                      placeholder="e.g. 2025-2026"
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Room</label>
                    <input
                      style={styles.input}
                      value={form.room}
                      onChange={handleChange('room')}
                      placeholder="e.g. Room 301"
                    />
                  </div>
                  <div style={styles.formGroupFull}>
                    <label style={styles.label}>Day(s)</label>
                    <div style={styles.checkboxGroup}>
                      {DAYS.map((d) => (
                        <label key={d} style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={form.days.includes(d)}
                            onChange={() => handleDayToggle(d)}
                          />
                          {d}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Start Time</label>
                    <input
                      type="time"
                      style={styles.input}
                      value={form.time_start}
                      onChange={handleChange('time_start')}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>End Time</label>
                    <input
                      type="time"
                      style={styles.input}
                      value={form.time_end}
                      onChange={handleChange('time_end')}
                    />
                  </div>
                  <div style={styles.formGroupFull}>
                    <label style={styles.label}>Description</label>
                    <input
                      style={styles.input}
                      value={form.description}
                      onChange={handleChange('description')}
                      placeholder="Brief subject description"
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
                  {saving ? 'Saving...' : editing ? 'Update Subject' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div style={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div style={{ ...styles.modal, maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Delete Subject</h2>
              <button style={styles.closeBtn} onClick={() => setDeleteTarget(null)}>&times;</button>
            </div>
            <p style={styles.confirmText}>
              Are you sure you want to delete{' '}
              <strong>{deleteTarget.code} - {deleteTarget.name}</strong>?
              This will also remove all associated enrollments.
            </p>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                style={{ ...styles.confirmDeleteBtn, opacity: deleting ? 0.7 : 1 }}
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedules;
