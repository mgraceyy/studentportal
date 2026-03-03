import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

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
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  searchRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    padding: '10px 14px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    padding: '20px 24px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a1a2e',
    margin: 0,
    flex: 1,
  },
  cardActions: {
    display: 'flex',
    gap: 6,
    flexShrink: 0,
  },
  cardBody: {
    fontSize: 14,
    color: '#555',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
    margin: '8px 0',
  },
  cardMeta: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 10,
    display: 'flex',
    gap: 16,
  },
  actionBtn: {
    padding: '5px 12px',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  editBtn: { background: '#e3f2fd', color: '#1565c0' },
  deleteBtn: { background: '#ffebee', color: '#c62828' },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  count: { fontSize: 13, color: '#999', marginTop: 12, padding: '0 4px' },
  // Modal
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
    maxWidth: 580,
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
  formGroup: { display: 'flex', flexDirection: 'column', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 },
  input: {
    padding: '9px 12px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
  },
  textarea: {
    padding: '9px 12px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    resize: 'vertical',
    minHeight: 120,
    fontFamily: 'inherit',
    lineHeight: 1.6,
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
