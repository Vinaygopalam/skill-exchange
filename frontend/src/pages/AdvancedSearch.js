import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import API_BASE_URL from '../config';
import UserProfileModal from '../components/UserProfileModal';

function AdvancedSearch() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    category: 'all',
    location: '',
    minRating: ''
  });
  const [categories] = useState(['all', 'Technology', 'Agriculture', 'Handicrafts', 'Education', 'Health', 'Music', 'Cooking', 'Construction', 'Other']);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const { isDark } = useTheme();

  const searchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.minRating) params.append('minRating', filters.minRating);

      const res = await axios.get(`${API_BASE_URL}/api/skills/search/advanced?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSkills(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    searchSkills();
  }, [searchSkills]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchSkills();
  };

  const handleReset = () => {
    setFilters({ keyword: '', category: 'all', location: '', minRating: '' });
    setSkills([]);
  };

  const styles = {
    page: { minHeight: '100vh', backgroundColor: isDark ? '#0f172a' : '#f8fafc', padding: '40px 20px' },
    container: { maxWidth: '1100px', margin: '0 auto' },
    header: { marginBottom: '40px', color: isDark ? '#f1f5f9' : '#0f172a' },
    title: { fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' },
    subtitle: { fontSize: '14px', color: '#94a3b8', margin: 0 },
    filterSection: { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '16px', padding: '28px', marginBottom: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0' },
    filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' },
    input: { padding: '12px 14px', borderRadius: '10px', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', backgroundColor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '14px', outline: 'none' },
    select: { padding: '12px 14px', borderRadius: '10px', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', backgroundColor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '14px', outline: 'none' },
    buttons: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
    searchBtn: { padding: '12px 28px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
    resetBtn: { padding: '12px 28px', backgroundColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#64748b', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
    skillGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
    skillCard: { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.2s', hover: { transform: 'translateY(-4px)' } },
    skillTitle: { fontSize: '18px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#0f172a', margin: '0 0 8px 0' },
    skillDesc: { fontSize: '13px', color: '#94a3b8', margin: '0 0 12px 0', lineHeight: '1.5' },
    skillMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '13px' },
    category: { display: 'inline-block', backgroundColor: '#4f46e5', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: '10px', marginTop: '12px' },
    avatar: { width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' },
    userName: { flex: 1, fontSize: '13px', fontWeight: '600', color: isDark ? '#f1f5f9' : '#1e293b' },
    rating: { fontSize: '12px', color: '#f59e0b', fontWeight: '600' },
    loading: { textAlign: 'center', padding: '60px 20px', color: isDark ? '#cbd5e1' : '#64748b' },
    empty: { textAlign: 'center', padding: '60px 20px', color: '#94a3b8', gridColumn: '1 / -1' }
  };

  return (
    <div style={styles.page}>
      {selectedUserProfile && (
        <UserProfileModal userId={selectedUserProfile} onClose={() => setSelectedUserProfile(null)} />
      )}
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🔍 Advanced Search</h1>
          <p style={styles.subtitle}>Find the perfect skill exchange opportunity</p>
        </div>

        <form onSubmit={handleSearch} style={styles.filterSection}>
          <div style={styles.filterGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.label}>🔎 Keyword</label>
              <input
                type="text"
                placeholder="e.g., JavaScript, Guitar..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.label}>📁 Category</label>
              <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} style={styles.select}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.label}>📍 Location</label>
              <input
                type="text"
                placeholder="e.g., New York..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.label}>⭐ Min Rating</label>
              <select value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)} style={styles.select}>
                <option value="">All Ratings</option>
                <option value="3">3+ ⭐</option>
                <option value="4">4+ ⭐</option>
                <option value="4.5">4.5+ ⭐</option>
                <option value="5">5 ⭐</option>
              </select>
            </div>
          </div>

          <div style={styles.buttons}>
            <button type="button" onClick={handleReset} style={styles.resetBtn}>Reset</button>
            <button type="submit" style={styles.searchBtn}>Search</button>
          </div>
        </form>

        {loading ? (
          <div style={styles.loading}>Searching...</div>
        ) : skills.length === 0 ? (
          <div style={styles.empty}>No skills found. Try adjusting your filters!</div>
        ) : (
          <div style={styles.skillGrid}>
            {skills.map(skill => {
              const userInitials = skill.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase();
              return (
                <div key={skill._id} style={styles.skillCard}>
                  <p style={styles.skillTitle}>{skill.title}</p>
                  <p style={styles.skillDesc}>{skill.description}</p>
                  <div style={styles.skillMeta}>
                    <span style={styles.category}>{skill.category}</span>
                    <span>📍 {skill.location}</span>
                  </div>
                  {skill.user && (
                    <div style={styles.userInfo} onClick={(e) => { e.stopPropagation(); setSelectedUserProfile(skill.user?._id); }}>
                      <div style={styles.avatar}>{userInitials}</div>
                      <div style={styles.userName}>{skill.user.name}</div>
                      <div style={styles.rating}>⭐ {skill.user.rating?.toFixed(1) || 'N/A'}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdvancedSearch;
