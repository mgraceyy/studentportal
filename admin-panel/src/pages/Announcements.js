import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

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
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
  },
  searchRow: { display: 'flex', gap: 10, marginBottom: 18 },
  searchInput: {
    flex: 1, padding: '9px 13px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 13.5, outline: 'none', background: '#fff', color: '#0f172a',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: {
    background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
    padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 12, marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, flex: 1 },
  cardActions: { display: 'flex', gap: 6, flexShrink: 0 },
  cardBody: {
    fontSize: 13.5, color: '#475569', lineHeight: 1.7,
    whiteSpace: 'pre-wrap', margin: '4px 0',
  },
  cardMeta: {
    fontSize: 12, color: '#94a3b8', marginTop: 12,
    display: 'flex', gap: 16, alignItems: 'center',
    paddingTop: 10, borderTop: '1px solid #f1f5f9',
  },
  actionBtn: {
    padding: '5px 11px', border: '1px solid transparent', borderRadius: 6,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  editBtn: { background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' },
  deleteBtn: { background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' },
  emptyState: {
    textAlign: 'center', padding: '64px 24px', color: '#94a3b8',
    background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  count: { fontSize: 12.5, color: '#94a3b8', marginTop: 14, padding: '0 2px' },
  // Modal
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#fff', borderRadius: 14, width: '100%', maxWidth: 580,
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
  formGroup: { display: 'flex', flexDirection: 'column', marginBottom: 16 },
  label: { fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: 0.1 },
  input: {
    padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 13.5, outline: 'none', color: '#0f172a',
  },
  textarea: {
    padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 13.5, outline: 'none', resize: 'vertical', minHeight: 120,
    fontFamily: 'inherit', lineHeight: 1.65, color: '#0f172a',
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
};

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', body: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const filtered = announcements.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
  });

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ── Add / Edit ──

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', body: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({ title: a.title, body: a.body });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) return setFormError('Title is required.');
    if (!form.body.trim()) return setFormError('Body is required.');

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/announcements/${editing.id}`, form);
      } else {
        await api.post('/announcements', form);
      }
      closeModal();
      fetchAnnouncements();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save announcement.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/announcements/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchAnnouncements();
    } catch (err) {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Announcements</h1>
          <p style={styles.subtitle}>Post and manage announcements for students</p>
        </div>
        <button style={styles.addBtn} onClick={openAdd}>+ New Announcement</button>
      </div>

      {/* Search */}
      <div style={styles.searchRow}>
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* List */}
      {loading ? (
        <div style={styles.emptyState}>Loading announcements...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          {announcements.length === 0
            ? 'No announcements yet. Click "+ New Announcement" to post one.'
            : 'No announcements match your search.'}
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map((a) => (
            <div key={a.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{a.title}</h3>
                <div style={styles.cardActions}>
                  <button
                    style={{ ...styles.actionBtn, ...styles.editBtn }}
                    onClick={() => openEdit(a)}
                  >Edit</button>
                  <button
                    style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                    onClick={() => setDeleteTarget(a)}
                  >Delete</button>
                </div>
              </div>
              <p style={styles.cardBody}>{a.body}</p>
              <div style={styles.cardMeta}>
                <span>Posted by <strong>{a.posted_by}</strong></span>
                <span>{formatDate(a.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <p style={styles.count}>
          {filtered.length} announcement{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editing ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button style={styles.closeBtn} onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={styles.modalBody}>
                {formError && <div style={styles.error}>{formError}</div>}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Title *</label>
                  <input
                    style={styles.input}
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Announcement title"
                    required
                    autoFocus
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Body *</label>
                  <textarea
                    style={styles.textarea}
                    value={form.body}
                    onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                    placeholder="Write the announcement content here..."
                    required
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                <button
                  type="submit"
                  style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editing ? 'Update' : 'Post Announcement'}
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
              <h2 style={styles.modalTitle}>Delete Announcement</h2>
              <button style={styles.closeBtn} onClick={() => setDeleteTarget(null)}>&times;</button>
            </div>
            <p style={styles.confirmText}>
              Are you sure you want to delete{' '}
              <strong>"{deleteTarget.title}"</strong>? This cannot be undone.
            </p>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                style={{ ...styles.deleteConfirmBtn, opacity: deleting ? 0.7 : 1 }}
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcements;
