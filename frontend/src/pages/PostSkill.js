import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import API_BASE_URL from '../config';
import { getAuthHeaders } from '../hooks/useAuth';

function PostSkill() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    skillsWanted: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const dataToSend = {
        ...formData,
        skillsWanted: formData.skillsWanted.split(',').map(s => s.trim()).filter(s => s)
      };
      await axios.post(`${API_BASE_URL}/api/skills`, dataToSend, {
        headers: getAuthHeaders()
      });
      setSuccess('Skill posted successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post skill!');
    }
    setLoading(false);
  };

  const styles = {
    page: { minHeight: '100vh', backgroundColor: isDark ? '#0f172a' : '#f8fafc', transition: 'background-color 0.3s ease' },
    navbar: { background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
    navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
    brandIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' },
    brandName: { fontSize: '18px', fontWeight: '700', color: '#ffffff' },
    navLinks: { display: 'flex', gap: '8px', alignItems: 'center' },
    navLink: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '500' },
    themeBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px' },
    container: { maxWidth: '680px', margin: '40px auto', padding: '0 24px' },
    card: { backgroundColor: isDark ? '#1e293b' : 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: isDark ? '1px solid #334155' : '1px solid #f1f5f9' },
    headerIcon: { width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '28px', flexShrink: 0, boxShadow: '0 4px 14px rgba(79,70,229,0.4)' },
    title: { fontSize: '24px', fontWeight: '800', color: isDark ? '#f1f5f9' : '#0f172a', margin: '0 0 4px 0' },
    subtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
    errorBox: { backgroundColor: isDark ? '#450a0a' : '#fef2f2', border: '1px solid #fecaca', color: isDark ? '#fca5a5' : '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' },
    successBox: { backgroundColor: isDark ? '#14532d' : '#f0fdf4', border: '1px solid #bbf7d0', color: isDark ? '#86efac' : '#166534', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', color: isDark ? '#cbd5e1' : '#374151', fontWeight: '600', fontSize: '14px' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: isDark ? '1.5px solid #334155' : '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', backgroundColor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#f1f5f9' : '#1e293b', transition: 'all 0.2s ease' },
    textarea: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: isDark ? '1.5px solid #334155' : '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', minHeight: '120px', resize: 'vertical', backgroundColor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#f1f5f9' : '#1e293b' },
    hint: { fontSize: '12px', color: '#94a3b8', margin: '6px 0 0 4px' },
    buttons: { display: 'flex', gap: '12px', marginTop: '8px' },
    cancelBtn: { flex: 1, padding: '13px', backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#cbd5e1' : '#64748b', border: 'none', borderRadius: '12px', fontSize: '15px', cursor: 'pointer', fontWeight: '600' },
    submitBtn: { flex: 2, padding: '13px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 14px rgba(79,70,229,0.4)' },
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <div style={styles.brandIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={styles.brandName}>SkillExchange</span>
        </div>
        <div style={styles.navLinks}>
          <button onClick={() => navigate('/dashboard')} style={styles.navLink}>Dashboard</button>
          <button onClick={toggleTheme} style={styles.themeBtn}>{isDark ? '🌙' : '☀️'}</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.headerIcon}>+</div>
            <div>
              <h2 style={styles.title}>Post a Skill</h2>
              <p style={styles.subtitle}>Share what you can offer to the community</p>
            </div>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
          {success && <div style={styles.successBox}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Skill Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} style={styles.input} placeholder="e.g. I can teach Python Programming" required />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} style={styles.textarea} placeholder="Describe your skill in detail. What will you teach? What level? How many sessions?" required />
            </div>

            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} style={styles.input} required>
                  <option value="">Select category</option>
                  <option value="Technology">Technology</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Handicrafts">Handicrafts</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Music">Music</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Construction">Construction</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Your Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} style={styles.input} placeholder="e.g. Guntur, Andhra Pradesh" required />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Skills You Want in Return</label>
              <input type="text" name="skillsWanted" value={formData.skillsWanted} onChange={handleChange} style={styles.input} placeholder="e.g. Carpentry, Cooking, English (comma separated)" />
              <p style={styles.hint}>What skills would you like to learn in exchange?</p>
            </div>

            <div style={styles.buttons}>
              <button type="button" onClick={() => navigate('/dashboard')} style={styles.cancelBtn}>Cancel</button>
              <button type="submit" style={styles.submitBtn} disabled={loading}>{loading ? 'Posting...' : 'Post Skill'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostSkill;
