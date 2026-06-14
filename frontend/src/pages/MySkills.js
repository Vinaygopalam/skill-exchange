import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import API_BASE_URL from '../config';
import { useAuth, getAuthHeaders } from '../hooks/useAuth';

function MySkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const fetchMySkills = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/skills/my`, {
        headers: getAuthHeaders()
      });
      setSkills(res.data);
    } catch (err) { console.log(err); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) return;
    fetchMySkills();
  }, [fetchMySkills]);

  const handleDelete = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/skills/${skillId}`, {
        headers: getAuthHeaders()
      });
      fetchMySkills();
    } catch (err) { alert('Failed to delete skill!'); }
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
    logoutBtn: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: '#fca5a5', fontSize: '14px', fontWeight: '500' },
    postBtn: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 8px rgba(79,70,229,0.4)' },
    container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    pageTitle: { fontSize: '28px', fontWeight: '800', color: isDark ? '#f1f5f9' : '#0f172a', margin: '0 0 6px 0' },
    pageSubtitle: { fontSize: '15px', color: '#64748b', margin: 0 },
    statsBox: { backgroundColor: isDark ? '#1e293b' : 'white', borderRadius: '16px', padding: '16px 28px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0' },
    statsNum: { display: 'block', fontSize: '32px', fontWeight: '800', color: '#4f46e5' },
    statsLabel: { fontSize: '13px', color: '#64748b', fontWeight: '500' },
    loading: { textAlign: 'center', color: '#64748b', padding: '60px', fontSize: '16px' },
    empty: { textAlign: 'center', padding: '80px 20px' },
    emptyIcon: { fontSize: '64px', marginBottom: '16px' },
    emptyTitle: { fontSize: '24px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#0f172a', margin: '0 0 8px 0' },
    emptyText: { fontSize: '15px', color: '#64748b', margin: '0 0 24px 0' },
    emptyBtn: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
    card: { backgroundColor: isDark ? '#1e293b' : 'white', borderRadius: '20px', padding: '24px', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'all 0.2s ease' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    categoryBadge: { fontSize: '12px', color: '#4f46e5', backgroundColor: isDark ? '#1e1b4b' : '#ede9fe', padding: '5px 14px', borderRadius: '20px', fontWeight: '600', border: '1px solid #c4b5fd' },
    activeBadge: { fontSize: '12px', color: '#166534', backgroundColor: isDark ? '#14532d' : '#dcfce7', padding: '5px 14px', borderRadius: '20px', fontWeight: '600', border: '1px solid #bbf7d0' },
    inactiveBadge: { fontSize: '12px', color: '#92400e', backgroundColor: isDark ? '#422006' : '#fef3c7', padding: '5px 14px', borderRadius: '20px', fontWeight: '600', border: '1px solid #fde68a' },
    skillTitle: { fontSize: '18px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: '8px' },
    skillDesc: { fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.6', marginBottom: '16px' },
    skillMeta: { display: 'flex', gap: '16px', marginBottom: '16px' },
    metaItem: { fontSize: '12px', color: '#94a3b8', fontWeight: '500' },
    wantedSection: { marginBottom: '16px' },
    wantedLabel: { fontSize: '12px', color: '#64748b', fontWeight: '600', margin: '0 0 8px 0' },
    wantedTags: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
    wantedTag: { fontSize: '12px', color: isDark ? '#cbd5e1' : '#0f172a', backgroundColor: isDark ? '#334155' : '#f1f5f9', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' },
    cardActions: { display: 'flex', gap: '10px', paddingTop: '16px', borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9' },
    editBtn: { flex: 1, padding: '10px', backgroundColor: isDark ? '#1e1b4b' : '#ede9fe', color: '#4f46e5', border: '1px solid #c4b5fd', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
    deleteBtn: { flex: 1, padding: '10px', backgroundColor: isDark ? '#450a0a' : '#fef2f2', color: isDark ? '#fca5a5' : '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
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
           <button onClick={() => navigate('/profile')} style={styles.navLink}>Profile</button>
           <button onClick={toggleTheme} style={styles.themeBtn}>{isDark ? '🌙' : '☀️'}</button>
           <button onClick={() => navigate('/post-skill')} style={styles.postBtn}>+ Post Skill</button>
           <button onClick={logout} style={styles.logoutBtn}>Logout</button>
         </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <div>
            <h2 style={styles.pageTitle}>My Skills</h2>
            <p style={styles.pageSubtitle}>Manage all your posted skills</p>
          </div>
          <div style={styles.statsBox}>
            <span style={styles.statsNum}>{skills.length}</span>
            <span style={styles.statsLabel}>Skills Posted</span>
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading your skills...</div>
        ) : skills.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>No skills posted yet!</h3>
            <p style={styles.emptyText}>Share your first skill with the community</p>
            <button onClick={() => navigate('/post-skill')} style={styles.emptyBtn}>Post Your First Skill</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {skills.map((skill) => (
              <div key={skill._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.categoryBadge}>{skill.category}</span>
                  <span style={skill.isAvailable ? styles.activeBadge : styles.inactiveBadge}>
                    {skill.isAvailable ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 style={styles.skillTitle}>{skill.title}</h3>
                <p style={styles.skillDesc}>{skill.description}</p>
                <div style={styles.skillMeta}>
                  <span style={styles.metaItem}>📍 {skill.location}</span>
                  <span style={styles.metaItem}>📅 {new Date(skill.createdAt).toLocaleDateString()}</span>
                </div>
                {skill.skillsWanted?.length > 0 && (
                  <div style={styles.wantedSection}>
                    <p style={styles.wantedLabel}>Looking for:</p>
                    <div style={styles.wantedTags}>
                      {skill.skillsWanted.map((s, i) => (
                        <span key={i} style={styles.wantedTag}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={styles.cardActions}>
                  <button onClick={() => navigate(`/edit-skill/${skill._id}`)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(skill._id)} style={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MySkills;
