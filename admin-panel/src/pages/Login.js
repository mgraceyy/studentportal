import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const S = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f1f5f9',
  },
  leftPanel: {
    flex: '0 0 420px',
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 56px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftBg1: {
    position: 'absolute', width: 320, height: 320, borderRadius: '50%',
    background: 'rgba(59,130,246,0.12)', top: -80, right: -80,
  },
  leftBg2: {
    position: 'absolute', width: 200, height: 200, borderRadius: '50%',
    background: 'rgba(29,78,216,0.15)', bottom: 60, left: -60,
  },
  brandBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    marginBottom: 40, position: 'relative', zIndex: 1,
  },
  logoBox: {
    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
  },
  logoText: {
    color: '#f1f5f9', fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px',
    lineHeight: 1.2,
  },
  logoSub: {
    color: '#64748b', fontSize: 12, fontWeight: 500, marginTop: 1,
  },
  headline: {
    color: '#f8fafc', fontSize: 30, fontWeight: 800, lineHeight: 1.25,
    letterSpacing: '-0.5px', marginBottom: 16, position: 'relative', zIndex: 1,
  },
  headlineSub: {
    color: '#94a3b8', fontSize: 14.5, lineHeight: 1.7, maxWidth: 280,
    position: 'relative', zIndex: 1,
  },
  featureList: {
    marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14,
    position: 'relative', zIndex: 1,
  },
  featureItem: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  featureDot: {
    width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', flexShrink: 0,
  },
  featureText: {
    color: '#64748b', fontSize: 13.5, fontWeight: 500,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '44px 44px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 22, fontWeight: 800, color: '#0f172a',
    letterSpacing: '-0.4px', margin: 0,
  },
  cardSubtitle: {
    fontSize: 14, color: '#64748b', marginTop: 6,
  },
  errorBox: {
    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px',
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 8, marginBottom: 20,
  },
  errorText: {
    fontSize: 13, color: '#dc2626', lineHeight: 1.5,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    display: 'block', fontSize: 12.5, fontWeight: 600,
    color: '#374151', marginBottom: 7, letterSpacing: 0.1,
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: 9,
    fontSize: 14, outline: 'none', color: '#0f172a',
    background: '#fff', transition: 'border-color 0.15s',
  },
  button: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#fff', border: 'none', borderRadius: 9,
    fontSize: 14.5, fontWeight: 700, marginTop: 10,
    transition: 'opacity 0.15s', letterSpacing: '-0.1px',
    boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
  },
};

const FEATURES = [
  'Student records & enrollment management',
  'Grades tracking & academic performance',
  'Class schedules & subject prospectus',
  'Announcements & messaging system',
];

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.role !== 'admin') {
        setError('Access denied. Admin accounts only.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('admin_id', data.id);
      localStorage.setItem('admin_name', `${data.first_name} ${data.last_name}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Left branding panel */}
      <div style={S.leftPanel} className="rsp-login-left">
        <div style={S.leftBg1} />
        <div style={S.leftBg2} />
        <div style={S.brandBadge}>
          <div style={S.logoBox}>🎓</div>
          <div>
            <div style={S.logoText}>Student Portal</div>
            <div style={S.logoSub}>Admin Panel</div>
          </div>
        </div>
        <h1 style={S.headline}>Manage your institution<br />with confidence.</h1>
        <p style={S.headlineSub}>
          A centralized admin platform for managing students, grades,
          schedules, and communications.
        </p>
        <div style={S.featureList}>
          {FEATURES.map((f) => (
            <div key={f} style={S.featureItem}>
              <div style={S.featureDot} />
              <span style={S.featureText}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={S.rightPanel}>
        <div style={S.card}>
          <div style={S.cardHeader}>
            <h2 style={S.cardTitle}>Welcome back</h2>
            <p style={S.cardSubtitle}>Sign in to your admin account to continue.</p>
          </div>

          {error && (
            <div style={S.errorBox}>
              <span style={S.errorText}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                style={S.input}
              />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={S.input}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ ...S.button, opacity: loading ? 0.72 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
