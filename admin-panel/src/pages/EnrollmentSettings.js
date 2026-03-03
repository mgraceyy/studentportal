import React, { useState, useEffect } from 'react';
import api from '../services/api';

const styles = {
  pageTitle: { fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px' },
  pageSubtitle: { fontSize: 14, color: '#888', marginBottom: 28 },
  section: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    marginBottom: 24,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  sectionBody: { padding: '24px' },
  // Change password toggle
  changePwBtn: {
    padding: '9px 18px',
    background: 'transparent',
    color: '#1a1a2e',
    border: '1.5px solid #1a1a2e',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px 20px',
  },
  formGridFull: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 16,
  },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 },
  input: {
    padding: '10px 13px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  readOnly: {
    padding: '10px 13px',
    border: '1.5px solid #eee',
    borderRadius: 8,
    fontSize: 14,
    background: '#fafafa',
    color: '#888',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTop: '1px solid #f0f0f0',
  },
  saveBtn: {
    padding: '10px 24px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  successMsg: { fontSize: 13, color: '#2e7d32', fontWeight: 600 },
  errorMsg: { fontSize: 13, color: '#d32f2f', fontWeight: 600 },
  // Toggle
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: '1px solid #f5f5f5',
    marginBottom: 20,
  },
  toggleLabel: { fontSize: 15, fontWeight: 600, color: '#1a1a2e' },
  toggleSub: { fontSize: 13, color: '#888', marginTop: 2 },
  toggle: (on) => ({
    position: 'relative',
    width: 44,
    height: 24,
    borderRadius: 12,
    background: on ? '#1a1a2e' : '#ddd',
    cursor: 'pointer',
    transition: 'background 0.2s',
    flexShrink: 0,
    border: 'none',
    outline: 'none',
  }),
  toggleThumb: (on) => ({
    position: 'absolute',
    top: 3,
    left: on ? 23 : 3,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  }),
  enrollBadge: (on) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    background: on ? '#e8f5e9' : '#fff3e0',
    color: on ? '#2e7d32' : '#e65100',
  }),
};

// ─── Section: Personal Information ───────────────────────────────────────────
function ProfileSection() {
  const empty = { first_name: '', last_name: '', email: '', mobile_number: '', address: '' };
  const [form, setForm] = useState(empty);
  const [saved, setSaved] = useState(empty);
  const [editing, setEditing] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/admin/profile')
      .then(({ data }) => {
        const profile = {
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          mobile_number: data.mobile_number || '',
          address: data.address || '',
        };
        setForm(profile);
        setSaved(profile);
      })
      .catch((err) => {
        setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to load profile.' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = () => {
    setMsg({ type: '', text: '' });
    setEditing(true);
  };

  const handleCancel = () => {
    setForm(saved);
    setMsg({ type: '', text: '' });
    setEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setMsg({ type: '', text: '' });
    if (!form.first_name.trim() || !form.last_name.trim()) {
      return setMsg({ type: 'error', text: 'First name and last name are required.' });
    }
    setSaving(true);
    try {
      const { data } = await api.put('/admin/profile', form);
      const updated = {
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        mobile_number: data.mobile_number || '',
        address: data.address || '',
      };
      setForm(updated);
      setSaved(updated);
      localStorage.setItem('admin_name', `${data.first_name} ${data.last_name}`);
      setMsg({ type: 'success', text: 'Profile updated successfully.' });
      setEditing(false);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 24, color: '#999', fontSize: 14 }}>Loading profile...</div>;

  if (!editing) {
    return (
      <div style={styles.sectionBody}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name</label>
            <div style={styles.readOnly}>{form.first_name || '—'}</div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name</label>
            <div style={styles.readOnly}>{form.last_name || '—'}</div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.readOnly}>{form.email || '—'}</div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mobile Number</label>
            <div style={styles.readOnly}>{form.mobile_number || '—'}</div>
          </div>
        </div>
        <div style={{ ...styles.formGridFull, marginTop: 16 }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Address</label>
            <div style={styles.readOnly}>{form.address || '—'}</div>
          </div>
        </div>
        <div style={styles.footer}>
          <button type="button" style={styles.saveBtn} onClick={handleEdit}>Edit</button>
          <button type="button" style={styles.changePwBtn} onClick={() => setPwOpen((v) => !v)}>
            {pwOpen ? 'Hide Password' : 'Change Password'}
          </button>
          {msg.text && (
            <span style={msg.type === 'success' ? styles.successMsg : styles.errorMsg}>
              {msg.text}
            </span>
          )}
        </div>
        <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 8 }}>
          <PasswordSection open={pwOpen} setOpen={setPwOpen} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.sectionBody}>
      <form onSubmit={handleSave}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name</label>
            <input style={styles.input} value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} placeholder="First name" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name</label>
            <input style={styles.input} value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} placeholder="Last name" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.readOnly}>{form.email || '—'}</div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mobile Number</label>
            <input style={styles.input} value={form.mobile_number} onChange={(e) => setForm((p) => ({ ...p, mobile_number: e.target.value }))} placeholder="e.g. 09XX-XXX-XXXX" />
          </div>
        </div>
        <div style={{ ...styles.formGridFull, marginTop: 16 }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Address</label>
            <input style={styles.input} value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Address (optional)" />
          </div>
        </div>
        <div style={styles.footer}>
          <button type="submit" style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" style={{ ...styles.saveBtn, background: '#f5f5f5', color: '#555' }} onClick={handleCancel}>
            Cancel
          </button>
          {msg.text && (
            <span style={msg.type === 'success' ? styles.successMsg : styles.errorMsg}>
              {msg.text}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── Section: Change Password ─────────────────────────────────────────────────
function PasswordSection({ open, setOpen }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!form.current_password) return setMsg({ type: 'error', text: 'Current password is required.' });
    if (form.new_password.length < 6) return setMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
    if (form.new_password !== form.confirm_password) return setMsg({ type: 'error', text: 'Passwords do not match.' });

    setSaving(true);
    try {
      await api.put('/admin/profile/password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setForm({ current_password: '', new_password: '', confirm_password: '' });
      setMsg({ type: 'success', text: 'Password changed successfully.' });
      setOpen(false);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to change password.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setForm({ current_password: '', new_password: '', confirm_password: '' });
    setMsg({ type: '', text: '' });
  };

  if (!open) return null;

  return (
    <div style={{ paddingTop: 20 }}>
      <form onSubmit={handleSave}>
        <div style={{ maxWidth: 420 }}>
          <div style={{ ...styles.formGroup, marginBottom: 16 }}>
            <label style={styles.label}>Current Password *</label>
            <input
              type="password"
              style={styles.input}
              value={form.current_password}
              onChange={(e) => setForm((p) => ({ ...p, current_password: e.target.value }))}
              placeholder="Enter current password"
              autoComplete="current-password"
              autoFocus
            />
          </div>
          <div style={{ ...styles.formGroup, marginBottom: 16 }}>
            <label style={styles.label}>New Password *</label>
            <input
              type="password"
              style={styles.input}
              value={form.new_password}
              onChange={(e) => setForm((p) => ({ ...p, new_password: e.target.value }))}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>
          <div style={{ ...styles.formGroup, marginBottom: 0 }}>
            <label style={styles.label}>Confirm New Password *</label>
            <input
              type="password"
              style={styles.input}
              value={form.confirm_password}
              onChange={(e) => setForm((p) => ({ ...p, confirm_password: e.target.value }))}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </div>
        </div>
        <div style={styles.footer}>
          <button type="submit" style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
            {saving ? 'Changing...' : 'Update Password'}
          </button>
          <button type="button" style={{ ...styles.saveBtn, background: '#f5f5f5', color: '#555' }} onClick={handleCancel}>
            Cancel
          </button>
          {msg.text && (
            <span style={msg.type === 'success' ? styles.successMsg : styles.errorMsg}>
              {msg.text}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── Section: Enrollment Settings ─────────────────────────────────────────────
function EnrollmentSection() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const toLocalDatetime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    api.get('/admin/enrollment-settings')
      .then(({ data }) => setSettings(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSaving(true);
    try {
      const { data } = await api.put('/admin/enrollment-settings', {
        enrollment_open: settings.enrollment_open,
        enrollment_start: settings.enrollment_start || null,
        enrollment_end: settings.enrollment_end || null,
      });
      setSettings(data);
      setMsg({ type: 'success', text: 'Enrollment settings saved.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <div style={{ padding: 24, color: '#999', fontSize: 14 }}>Loading settings...</div>;

  return (
    <div style={styles.sectionBody}>
      <form onSubmit={handleSave}>
        {/* Toggle */}
        <div style={styles.toggleRow}>
          <div>
            <div style={styles.toggleLabel}>Enrollment Status</div>
            <div style={styles.toggleSub}>Allow students to enroll in subjects through the mobile app</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={styles.enrollBadge(settings.enrollment_open)}>
              {settings.enrollment_open ? 'Open' : 'Closed'}
            </span>
            <button
              type="button"
              style={styles.toggle(settings.enrollment_open)}
              onClick={() => setSettings((p) => ({ ...p, enrollment_open: !p.enrollment_open }))}
            >
              <span style={styles.toggleThumb(settings.enrollment_open)} />
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={{ ...styles.label, color: settings.enrollment_open ? '#555' : '#bbb' }}>Enrollment Start</label>
            <input
              type="datetime-local"
              style={{ ...styles.input, opacity: settings.enrollment_open ? 1 : 0.45, cursor: settings.enrollment_open ? 'auto' : 'not-allowed' }}
              value={toLocalDatetime(settings.enrollment_start)}
              onChange={(e) => setSettings((p) => ({ ...p, enrollment_start: e.target.value || null }))}
              disabled={!settings.enrollment_open}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={{ ...styles.label, color: settings.enrollment_open ? '#555' : '#bbb' }}>Enrollment End</label>
            <input
              type="datetime-local"
              style={{ ...styles.input, opacity: settings.enrollment_open ? 1 : 0.45, cursor: settings.enrollment_open ? 'auto' : 'not-allowed' }}
              value={toLocalDatetime(settings.enrollment_end)}
              onChange={(e) => setSettings((p) => ({ ...p, enrollment_end: e.target.value || null }))}
              disabled={!settings.enrollment_open}
            />
          </div>
        </div>

        <div style={styles.footer}>
          <button type="submit" style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {msg.text && (
            <span style={msg.type === 'success' ? styles.successMsg : styles.errorMsg}>
              {msg.text}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
function EnrollmentSettings() {
  return (
    <div>
      <h1 style={styles.pageTitle}>Settings</h1>
      <p style={styles.pageSubtitle}>Manage your account and enrollment configuration</p>

      {/* Personal Information */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionIcon}>👤</span>
          <h2 style={styles.sectionTitle}>Personal Information</h2>
        </div>
        <ProfileSection />
      </div>

      {/* Enrollment Settings */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionIcon}>📋</span>
          <h2 style={styles.sectionTitle}>Enrollment Settings</h2>
        </div>
        <EnrollmentSection />
      </div>
    </div>
  );
}

export default EnrollmentSettings;
