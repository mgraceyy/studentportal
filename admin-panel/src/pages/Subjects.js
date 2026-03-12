import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const COURSES = [
  'BSIT', 'BSCS', 'BSIS', 'BSA', 'BSBA', 'BSN', 'BSED', 'BEED', 'BSCRIM',
];

const SEMESTERS = ['1st Semester', '2nd Semester', 'Summer'];

const EMPTY_PROSP_FORM = { code: '', name: '', units: 3, semester: '1st Semester' };

const styles = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 24, flexWrap: 'wrap', gap: 12,
  },
  title: { fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 3 },
  tableWrap: {
    background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
    overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  actionBtn: {
    padding: '5px 11px', border: '1px solid transparent', borderRadius: 6,
    fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 5,
  },
  deleteBtn: { background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#fff', borderRadius: 14, width: '100%', maxWidth: 440,
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
  confirmText: { fontSize: 14, color: '#374151', lineHeight: 1.65, padding: '18px 24px' },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: 10,
    padding: '16px 24px', borderTop: '1px solid #e2e8f0',
  },
  cancelBtn: {
    padding: '9px 18px', background: '#f1f5f9', color: '#475569',
    border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  confirmDeleteBtn: {
    padding: '9px 18px', background: '#dc2626', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  prospectusHeader: {
    display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
    marginBottom: 14, flexWrap: 'wrap', gap: 10,
  },
  courseSelect: {
    padding: '9px 13px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 13.5, outline: 'none', background: '#fff', minWidth: 150, color: '#0f172a',
  },
  addEntryBtn: {
    padding: '9px 18px', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
    cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
  },
  prospectusTable: { width: '100%', borderCollapse: 'collapse', fontSize: 13.5 },
  pTh: {
    textAlign: 'left', padding: '11px 16px', background: '#f8fafc',
    color: '#64748b', fontWeight: 600, fontSize: 11.5,
    textTransform: 'uppercase', letterSpacing: 0.6,
    borderBottom: '1px solid #e2e8f0',
  },
  pTd: { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#0f172a' },
  semBadge: {
    display: 'inline-flex', padding: '3px 10px', borderRadius: 12,
    fontSize: 11.5, fontWeight: 600, background: '#fdf4ff', color: '#9333ea',
    border: '1px solid #e9d5ff',
  },
  prospectusEmpty: {
    textAlign: 'center', padding: '48px 24px', color: '#94a3b8',
    fontSize: 13.5, background: '#fff', borderRadius: 12,
    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  addFormWrap: {
    background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10,
    padding: '16px 20px', marginBottom: 16,
  },
  addFormTitle: { fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 },
  addFormRow: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr 2fr 80px 1fr auto',
    gap: 10, alignItems: 'flex-end',
  },
  addFormGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  addFormLabel: { fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 0.3 },
  addFormInput: {
    padding: '8px 10px', border: '1.5px solid #e2e8f0',
    borderRadius: 7, fontSize: 13, outline: 'none', color: '#0f172a',
  },
  addFormSelect: {
    padding: '8px 10px', border: '1.5px solid #e2e8f0',
    borderRadius: 7, fontSize: 13, outline: 'none', background: '#fff', color: '#0f172a',
  },
  addFormSaveBtn: {
    padding: '8px 16px', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  prospectusError: { color: '#dc2626', fontSize: 12.5, marginTop: 8, fontWeight: 500 },
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
          <div style={styles.addFormRow} className="rsp-subj-form">
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
