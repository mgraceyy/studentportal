import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const COURSES = [
  'BSIT', 'BSCS', 'BSIS', 'BSA', 'BSBA', 'BSN', 'BSED', 'BEED', 'BSCRIM',
];

const SEMESTERS = ['1st Semester', '2nd Semester', 'Summer'];

const EMPTY_PROSP_FORM = { code: '', name: '', units: 3, semester: '1st Semester' };

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
  tableWrap: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflowX: 'auto',
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
  deleteBtn: { background: '#ffebee', color: '#c62828' },
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
    maxWidth: 440,
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
  closeBtn: { background: 'none', border: 'none', fontSize: 22, color: '#999', cursor: 'pointer' },
  confirmText: { fontSize: 15, color: '#333', lineHeight: 1.6, padding: '20px 24px' },
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
  prospectusHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  courseSelect: {
    padding: '9px 14px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    minWidth: 150,
  },
  addEntryBtn: {
    padding: '9px 18px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  prospectusTable: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  pTh: {
    textAlign: 'left',
    padding: '12px 14px',
    background: '#f8f9fa',
    color: '#555',
    fontWeight: 600,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '1px solid #eee',
  },
  pTd: { padding: '11px 14px', borderBottom: '1px solid #f0f0f0', color: '#333' },
  semBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    background: '#f3e5f5',
    color: '#6a1b9a',
  },
  prospectusEmpty: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#bbb',
    fontSize: 13,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  addFormWrap: {
    background: '#f9f9fc',
    border: '1.5px solid #e0e0f0',
    borderRadius: 10,
    padding: '16px 20px',
    marginBottom: 16,
  },
  addFormTitle: { fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 },
  addFormRow: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr 2fr 80px 1fr auto',
    gap: 10,
    alignItems: 'flex-end',
  },
  addFormGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  addFormLabel: { fontSize: 11, fontWeight: 600, color: '#777' },
  addFormInput: {
    padding: '8px 10px',
    border: '1.5px solid #ddd',
    borderRadius: 7,
    fontSize: 13,
    outline: 'none',
  },
  addFormSelect: {
    padding: '8px 10px',
    border: '1.5px solid #ddd',
    borderRadius: 7,
    fontSize: 13,
    outline: 'none',
    background: '#fff',
  },
  addFormSaveBtn: {
    padding: '8px 16px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  prospectusError: { color: '#d32f2f', fontSize: 12, marginTop: 8 },
};

function Subjects() {
  const [prospCourse, setProspCourse] = useState(COURSES[0]);
  const [prospectus, setProspectus] = useState([]);
  const [prospLoading, setProspLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(true);
  const [prospForm, setProspForm] = useState(EMPTY_PROSP_FORM);
  const [prospError, setProspError] = useState('');
  const [prospSaving, setProspSaving] = useState(false);
  const [prospDeleteTarget, setProspDeleteTarget] = useState(null);
  const [prospDeleting, setProspDeleting] = useState(false);

  const fetchProspectus = useCallback(async (course) => {
    setProspLoading(true);
    try {
      const { data } = await api.get(`/admin/prospectus?course=${course}`);
      setProspectus(data);
    } catch (err) {
      // silent
    } finally {
      setProspLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProspectus(prospCourse);
  }, [prospCourse, fetchProspectus]);

  const handleProspCourseChange = (course) => {
    setProspCourse(course);
    setProspForm(EMPTY_PROSP_FORM);
    setProspError('');
  };

  const handleProspAdd = async (e) => {
    e.preventDefault();
    setProspError('');
    if (!prospForm.code.trim()) return setProspError('Code is required.');
    if (!prospForm.name.trim()) return setProspError('Name is required.');
    if (!prospForm.units || prospForm.units < 1) return setProspError('Units must be at least 1.');

    setProspSaving(true);
    try {
      await api.post('/admin/prospectus', {
        course: prospCourse,
        code: prospForm.code,
        name: prospForm.name,
        units: parseInt(prospForm.units),
        semester: prospForm.semester,
      });
      setProspForm(EMPTY_PROSP_FORM);
      fetchProspectus(prospCourse);
    } catch (err) {
      setProspError(err.response?.data?.error || 'Failed to add entry.');
    } finally {
      setProspSaving(false);
    }
  };

  const handleProspDelete = async () => {
    if (!prospDeleteTarget) return;
    setProspDeleting(true);
    try {
      await api.delete(`/admin/prospectus/${prospDeleteTarget.id}`);
      setProspDeleteTarget(null);
      fetchProspectus(prospCourse);
    } catch (err) {
      // silent
    } finally {
      setProspDeleting(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Subjects</h1>
          <p style={styles.subtitle}>Set the subject curriculum per course (prospectus)</p>
        </div>
        <button
          style={styles.addEntryBtn}
          onClick={() => { setShowAddForm((v) => !v); setProspError(''); }}
        >
          {showAddForm ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      <div style={{ ...styles.addFormWrap, opacity: showAddForm ? 1 : 0.45, pointerEvents: showAddForm ? 'auto' : 'none' }}>
        <p style={styles.addFormTitle}>New Prospectus Entry</p>
        <form onSubmit={handleProspAdd}>
          <div style={styles.addFormRow}>
            <div style={styles.addFormGroup}>
              <label style={styles.addFormLabel}>COURSE *</label>
              <select
                style={styles.addFormSelect}
                value={prospCourse}
                onChange={(e) => handleProspCourseChange(e.target.value)}
              >
                {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={styles.addFormGroup}>
              <label style={styles.addFormLabel}>CODE *</label>
              <input
                style={styles.addFormInput}
                placeholder="e.g. IT101"
                value={prospForm.code}
                onChange={(e) => setProspForm((p) => ({ ...p, code: e.target.value }))}
              />
            </div>
            <div style={styles.addFormGroup}>
              <label style={styles.addFormLabel}>NAME *</label>
              <input
                style={styles.addFormInput}
                placeholder="e.g. Introduction to Computing"
                value={prospForm.name}
                onChange={(e) => setProspForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div style={styles.addFormGroup}>
              <label style={styles.addFormLabel}>UNITS *</label>
              <input
                type="number"
                min={1}
                max={6}
                style={styles.addFormInput}
                value={prospForm.units}
                onChange={(e) => setProspForm((p) => ({ ...p, units: e.target.value }))}
              />
            </div>
            <div style={styles.addFormGroup}>
              <label style={styles.addFormLabel}>SEMESTER *</label>
              <select
                style={styles.addFormSelect}
                value={prospForm.semester}
                onChange={(e) => setProspForm((p) => ({ ...p, semester: e.target.value }))}
              >
                {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                style={{ ...styles.addFormSaveBtn, opacity: prospSaving ? 0.7 : 1 }}
                disabled={prospSaving}
              >
                {prospSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          {prospError && <p style={styles.prospectusError}>{prospError}</p>}
        </form>
      </div>

      {prospLoading ? (
        <div style={styles.prospectusEmpty}>Loading...</div>
      ) : prospectus.length === 0 ? (
        <div style={styles.prospectusEmpty}>
          No prospectus entries for {prospCourse} yet. Fill in the form above to add one.
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.prospectusTable}>
            <thead>
              <tr>
                <th style={styles.pTh}>Code</th>
                <th style={styles.pTh}>Name</th>
                <th style={styles.pTh}>Units</th>
                <th style={styles.pTh}>Semester</th>
                <th style={styles.pTh}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prospectus.map((p) => (
                <tr key={p.id}>
                  <td style={{ ...styles.pTd, fontWeight: 600 }}>{p.code}</td>
                  <td style={styles.pTd}>{p.name}</td>
                  <td style={styles.pTd}>{p.units}</td>
                  <td style={styles.pTd}>
                    <span style={styles.semBadge}>{p.semester}</span>
                  </td>
                  <td style={styles.pTd}>
                    <button
                      style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                      onClick={() => setProspDeleteTarget(p)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {prospDeleteTarget && (
        <div style={styles.overlay} onClick={() => setProspDeleteTarget(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Delete Entry</h2>
              <button style={styles.closeBtn} onClick={() => setProspDeleteTarget(null)}>&times;</button>
            </div>
            <p style={styles.confirmText}>
              Remove <strong>{prospDeleteTarget.code} — {prospDeleteTarget.name}</strong> from the {prospCourse} prospectus?
            </p>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setProspDeleteTarget(null)}>Cancel</button>
              <button
                style={{ ...styles.confirmDeleteBtn, opacity: prospDeleting ? 0.7 : 1 }}
                disabled={prospDeleting}
                onClick={handleProspDelete}
              >
                {prospDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subjects;
