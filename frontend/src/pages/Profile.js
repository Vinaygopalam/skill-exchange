import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    bio: '',
    skillsOffered: '',
    skillsNeeded: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchProfile(parsedUser.id);
  }, []);

  const fetchProfile = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/auth/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setFormData({
        name: data.name || '',
        location: data.location || '',
        bio: data.bio || '',
        skillsOffered: data.skillsOffered?.join(', ') || '',
        skillsNeeded: data.skillsNeeded?.join(', ') || ''
      });
    } catch (err) { console.log(err); }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...formData,
        skillsOffered: formData.skillsOffered.split(',').map(s => s.trim()).filter(s => s),
        skillsNeeded: formData.skillsNeeded.split(',').map(s => s.trim()).filter(s => s)
      };
      const res = await axios.put('http://localhost:5000/api/auth/profile', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), name: res.data.name }));
      setSuccess('Profile updated successfully!');
    } catch (err) { setError('Failed to update profile!'); }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase();

  // ✅ styles is now INSIDE the component so isDark works correctly
  const styles = {
    page: { minHeight: '100vh', backgroundColor: isDark ? '#0f172a' : '#f8fafc', transition: 'background-color 0.3s ease' },
    navbar: { background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
    navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
    brandIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' },
    brandName: { fontSize: '18px', fontWeight: '700', color: '#ffffff' },
    navLinks: { display: 'flex', gap: '8px', alignItems: 'center' },
    navLink: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '500' },
    themeBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px' },
    logoutBtn: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: '#fca5a5', fontSize: '14px', fontWeight: '500' },
    container: { maxWidth: '720px', margin: '0 auto', padding: '40px 24px' },
    profileHero: { textAlign: 'center', marginBottom: '32px' },
    avatarWrapper: { position: 'relative', display: 'inline-block', marginBottom: '16px' },
    avatar: { width: '90px', height: '90px', borderRadius: '24px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '28px', boxShadow: '0 8px 24px rgba(79,70,229,0.4)' },
    onlineBadge: { position: 'absolute', bottom: '4px', right: '4px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid white' },
    heroName: { fontSize: '26px', fontWeight: '800', color: isDark ? '#f1f5f9' : '#0f172a', margin: '0 0 6px 0' },
    heroEmail: { fontSize: '15px', color: '#64748b', margin: '0 0 16px 0' },
    heroBadges: { display: 'flex', gap: '8px', justifyContent: 'center' },
    heroBadge: { fontSize: '12px', color: '#4f46e5', backgroundColor: isDark ? '#1e1b4b' : '#ede9fe', padding: '4px 14px', borderRadius: '20px', fontWeight: '600', border: '1px solid #c4b5fd' },
    formCard: { backgroundColor: isDark ? '#1e293b' : 'white', borderRadius: '24px', padding: '36px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0' },
    formHeader: { marginBottom: '28px', paddingBottom: '20px', borderBottom: isDark ? '1px solid #334155' : '1px solid #f1f5f9' },
    formTitle: { fontSize: '20px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#0f172a', margin: '0 0 4px 0' },
    formSubtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
    successBox: { backgroundColor: isDark ? '#14532d' : '#f0fdf4', border: '1px solid #bbf7d0', color: isDark ? '#86efac' : '#166534', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' },
    errorBox: { backgroundColor: isDark ? '#450a0a' : '#fef2f2', border: '1px solid #fecaca', color: isDark ? '#fca5a5' : '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', color: isDark ? '#cbd5e1' : '#374151', fontWeight: '600', fontSize: '14px' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: isDark ? '1.5px solid #334155' : '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', backgroundColor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#f1f5f9' : '#1e293b', transition: 'all 0.2s ease' },
    textarea: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: isDark ? '1.5px solid #334155' : '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', minHeight: '90px', resize: 'vertical', backgroundColor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#f1f5f9' : '#1e293b' },
    hint: { fontSize: '11px', color: '#94a3b8', margin: '6px 0 0 4px' },
    button: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.4)', marginTop: '8px' },
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <div style={styles.brandIcon}>SE</div>
          <span style={styles.brandName}>SkillExchange</span>
        </div>
        <div style={styles.navLinks}>
          <button onClick={() => navigate('/dashboard')} style={styles.navLink}>Dashboard</button>
          <button onClick={() => navigate('/requests')} style={styles.navLink}>Requests</button>
          <button onClick={toggleTheme} style={styles.themeBtn}>{isDark ? '🌙' : '☀️'}</button>
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.profileHero}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>{getInitials(user?.name)}</div>
            <div style={styles.onlineBadge}></div>
          </div>
          <h2 style={styles.heroName}>{user?.name}</h2>
          <p style={styles.heroEmail}>{user?.email}</p>
          <div style={styles.heroBadges}>
            <span style={styles.heroBadge}>Member</span>
            <span style={styles.heroBadge}>Skill Exchanger</span>
          </div>
        </div>

        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>Edit Profile</h3>
            <p style={styles.formSubtitle}>Update your information</p>
          </div>

          {success && <div style={styles.successBox}>{success}</div>}
          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} placeholder="Your full name" />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} style={styles.input} placeholder="e.g. Guntur, Andhra Pradesh" />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} style={styles.textarea} placeholder="Tell others about yourself..." />
            </div>

            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Skills I Offer</label>
                <input type="text" name="skillsOffered" value={formData.skillsOffered} onChange={handleChange} style={styles.input} placeholder="Python, Cooking, Music" />
                <p style={styles.hint}>Separate with commas</p>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Skills I Need</label>
                <input type="text" name="skillsNeeded" value={formData.skillsNeeded} onChange={handleChange} style={styles.input} placeholder="English, Carpentry" />
                <p style={styles.hint}>Separate with commas</p>
              </div>
            </div>

            <button type="submit" style={styles.button}>Save Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
