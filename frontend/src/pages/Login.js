import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config';


function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed!');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.brand}>
            <div style={styles.brandIcon}>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
</div>
            <span style={styles.brandName}>SkillExchange</span>
          </div>
          <h1 style={styles.tagline}>Share Skills,<br />Grow Together</h1>
          <p style={styles.taglineSub}>Join thousands of people exchanging skills and learning from each other for free.</p>
          <div style={styles.features}>
            <div style={styles.feature}>✅ Post your skills for free</div>
            <div style={styles.feature}>✅ Connect with learners nearby</div>
            <div style={styles.feature}>✅ Real-time chat & exchange</div>
            <div style={styles.feature}>✅ Rate and review exchanges</div>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formCard}>
          <h2 style={styles.title}>Sign In</h2>
<p style={styles.subtitle}>Welcome back! Enter your details to continue</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="you@example.com"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={styles.link}>
            Don't have an account? <Link to="/register" style={styles.linkText}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex' },
  left: { flex: 1, background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #16a34a 100%)', padding: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  leftContent: { maxWidth: '420px' },
  brand: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' },
  brandIcon: { width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', boxShadow: '0 4px 12px rgba(79,70,229,0.4)' },
  brandName: { fontSize: '22px', fontWeight: '700', color: 'white' },
  tagline: { fontSize: '48px', fontWeight: '800', color: 'white', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-1px' },
  taglineSub: { fontSize: '17px', color: '#bbf7d0', lineHeight: '1.7', marginBottom: '36px' },
  features: { display: 'flex', flexDirection: 'column', gap: '12px' },
  feature: { fontSize: '15px', color: '#dcfce7', fontWeight: '500' },
  right: { flex: 1, backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' },
  formCard: { width: '100%', maxWidth: '420px', backgroundColor: 'white', borderRadius: '24px', padding: '48px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' },
  subtitle: { fontSize: '15px', color: '#64748b', marginBottom: '32px' },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '600', fontSize: '14px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#f8fafc', transition: 'all 0.2s ease' },
  button: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #22c55e, #166534)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 14px rgba(34,197,94,0.4)' },
  link: { textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '14px' },
  linkText: { color: '#166534', fontWeight: '700', textDecoration: 'none' },
};

export default Login;