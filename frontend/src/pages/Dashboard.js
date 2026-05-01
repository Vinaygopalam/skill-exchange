import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../ThemeContext';

function Dashboard() {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [minRating, setMinRating] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    setUser(JSON.parse(storedUser));
    fetchSkills();
    fetchPendingCount();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/skills');
      setSkills(res.data);
      setFilteredSkills(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchPendingCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pending = res.data.filter(r => r.status === 'pending');
      setPendingCount(pending.length);
    } catch (err) { console.log(err); }
  };

  const filterSkills = (searchVal, categoryVal, locationVal, ratingVal) => {
    let filtered = skills;
    if (searchVal) {
      filtered = filtered.filter(skill =>
        skill.title.toLowerCase().includes(searchVal.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchVal.toLowerCase()) ||
        skill.location.toLowerCase().includes(searchVal.toLowerCase())
      );
    }
    if (categoryVal) {
      filtered = filtered.filter(skill => skill.category === categoryVal);
    }
    if (locationVal) {
      filtered = filtered.filter(skill =>
        skill.location.toLowerCase().includes(locationVal.toLowerCase())
      );
    }
    if (ratingVal) {
      filtered = filtered.filter(skill =>
        skill.user?.rating && skill.user.rating >= parseFloat(ratingVal)
      );
    }
    setFilteredSkills(filtered);
  };

  const handleSearch = (e) => { setSearch(e.target.value); filterSkills(e.target.value, category, location, minRating); };
  const handleCategory = (e) => { setCategory(e.target.value); filterSkills(search, e.target.value, location, minRating); };
  const handleLocation = (e) => { setLocation(e.target.value); filterSkills(search, category, e.target.value, minRating); };
  const handleRating = (e) => { setMinRating(e.target.value); filterSkills(search, category, location, e.target.value); };

  const clearFilters = () => {
    setSearch(''); setCategory(''); setLocation(''); setMinRating('');
    setFilteredSkills(skills);
  };

  const activeFilterCount = [search, category, location, minRating].filter(Boolean).length;

  const handleSendRequest = async (skillId, toUserId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/requests',
        { skill: skillId, toUser: toUserId, message: 'Hi! I would like to exchange skills with you!' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Request sent successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request!');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSkills();
    } catch (err) { alert('Failed to delete skill!'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase();

  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #3b82f6, #2563eb)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ef4444, #dc2626)',
      'linear-gradient(135deg, #22c55e, #166534)',
      'linear-gradient(135deg, #06b6d4, #0891b2)',
    ];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const styles = {
    page: { minHeight: '100vh', backgroundColor: isDark ? '#0f172a' : '#f8fafc', transition: 'background-color 0.3s ease' },
    navbar: { backgroundColor: '#166634', padding: '0 32px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
    brandIcon: { width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', boxShadow: '0 2px 8px rgba(34,197,94,0.4)' },
    brandName: { fontSize: '20px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.3px' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '8px' },
    navLink: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '500' },
    navCta: { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 8px rgba(59,130,246,0.4)' },
    themeBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px' },
    avatarCircle: { width: '38px', height: '38px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
    notifBadge: { backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 7px', borderRadius: '20px', marginLeft: '6px' },
    hero: { background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #16a34a 100%)', padding: '60px 32px 40px', textAlign: 'center' },
    heroTitle: { fontSize: '44px', fontWeight: '800', color: '#ffffff', marginBottom: '14px', letterSpacing: '-1px', lineHeight: '1.2' },
    heroSub: { fontSize: '18px', color: '#bbf7d0', marginBottom: '36px' },
    searchBar: { maxWidth: '720px', margin: '0 auto', backgroundColor: 'white', borderRadius: '50px', padding: '8px 8px 8px 20px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
    searchIcon: { fontSize: '18px', color: '#94a3b8' },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: '#1e293b', padding: '8px', backgroundColor: 'transparent' },
    searchSelect: { border: '1px solid #e2e8f0', borderRadius: '40px', padding: '10px 16px', fontSize: '14px', color: '#475569', backgroundColor: '#f8fafc', cursor: 'pointer' },
    filterBar: { maxWidth: '1200px', margin: '0 auto', padding: '20px 32px 0' },
    filterRow: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
    filterLabel: { fontSize: '13px', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', whiteSpace: 'nowrap' },
    filterInput: { padding: '9px 16px', borderRadius: '10px', border: isDark ? '1.5px solid #334155' : '1.5px solid #e2e8f0', fontSize: '14px', backgroundColor: isDark ? '#1e293b' : 'white', color: isDark ? '#f1f5f9' : '#1e293b', outline: 'none', minWidth: '160px' },
    filterSelect: { padding: '9px 16px', borderRadius: '10px', border: isDark ? '1.5px solid #334155' : '1.5px solid #e2e8f0', fontSize: '14px', backgroundColor: isDark ? '#1e293b' : 'white', color: isDark ? '#f1f5f9' : '#1e293b', outline: 'none', cursor: 'pointer' },
    clearBtn: { padding: '9px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' },
    filterBadge: { backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 7px', borderRadius: '20px' },
    content: { maxWidth: '1200px', margin: '0 auto', padding: '32px 32px 48px' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
    sectionTitle: { fontSize: '26px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#0f172a' },
    skillCount: { fontSize: '13px', padding: '6px 14px', borderRadius: '20px', fontWeight: '500', backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
    card: { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '20px', padding: '24px', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    cardTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' },
    cardAvatar: { width: '48px', height: '48px', borderRadius: '14px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px', flexShrink: 0 },
    cardUserName: { fontSize: '15px', fontWeight: '600', margin: 0 },
    cardLocation: { fontSize: '12px', color: '#94a3b8', margin: '3px 0 0 0' },
    ratingBadge: { marginLeft: 'auto', fontSize: '12px', color: '#92400e', backgroundColor: '#fef3c7', padding: '5px 12px', borderRadius: '20px', fontWeight: '600', flexShrink: 0, border: '1px solid #fde68a' },
    cardTitle: { fontSize: '19px', fontWeight: '700', marginBottom: '10px' },
    cardDesc: { fontSize: '14px', lineHeight: '1.7', marginBottom: '20px' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9' },
    categoryBadge: { fontSize: '12px', color: '#166534', backgroundColor: '#dcfce7', padding: '5px 14px', borderRadius: '20px', fontWeight: '600', border: '1px solid #bbf7d0' },
    requestBtn: { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
    ownerBtns: { display: 'flex', gap: '8px' },
    editBtn: { flex: 1, padding: '8px 12px', backgroundColor: isDark ? '#1e1b4b' : '#ede9fe', color: '#4f46e5', border: '1px solid #c4b5fd', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    deleteBtn: { flex: 1, padding: '8px 12px', backgroundColor: isDark ? '#450a0a' : '#fef2f2', color: isDark ? '#fca5a5' : '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    emptyState: { textAlign: 'center', padding: '100px 20px' },
    emptyIcon: { fontSize: '72px', marginBottom: '20px' },
    emptyTitle: { fontSize: '26px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: '10px' },
    emptyText: { fontSize: '16px', color: '#64748b', marginBottom: '28px' },
    emptyBtn: { background: 'linear-gradient(135deg, #22c55e, #166534)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
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
          <button onClick={() => navigate('/profile')} style={styles.navLink}>Profile</button>
          <button onClick={() => navigate('/my-skills')} style={styles.navLink}>My Skills</button>
          <button onClick={() => navigate('/requests')} style={styles.navLink}>
            Requests
            {pendingCount > 0 && <span style={styles.notifBadge}>{pendingCount}</span>}
          </button>
          <button onClick={() => navigate('/post-skill')} style={styles.navCta}>+ Post Skill</button>
          <button onClick={toggleTheme} style={styles.themeBtn}>{isDark ? '🌙' : '☀️'}</button>
          <div style={{...styles.avatarCircle, background: getAvatarColor(user?.name)}} onClick={() => navigate('/profile')} title="View Profile">
            {getInitials(user?.name)}
          </div>
        </div>
      </nav>

      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Discover & Exchange Skills</h1>
        <p style={styles.heroSub}>Connect with people, share what you know, learn what you don't</p>
        <div style={styles.searchBar}>
          <span style={styles.searchIcon}>🔍</span>
          <input type="text" placeholder="Search skills, descriptions..." value={search} onChange={handleSearch} style={styles.searchInput} />
          <select value={category} onChange={handleCategory} style={styles.searchSelect}>
            <option value="">All Categories</option>
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
      </div>

      <div style={styles.filterBar}>
        <div style={styles.filterRow}>
          <span style={styles.filterLabel}>🔎 Filters:</span>
          <input type="text" placeholder="📍 Filter by location..." value={location} onChange={handleLocation} style={styles.filterInput} />
          <select value={minRating} onChange={handleRating} style={styles.filterSelect}>
            <option value="">⭐ Any Rating</option>
            <option value="4">⭐ 4+ Stars</option>
            <option value="3">⭐ 3+ Stars</option>
            <option value="2">⭐ 2+ Stars</option>
          </select>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} style={styles.clearBtn}>
              ✕ Clear Filters <span style={styles.filterBadge}>{activeFilterCount}</span>
            </button>
          )}
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Available Skills</h2>
          <span style={styles.skillCount}>{filteredSkills.length} skills found</span>
        </div>

        {filteredSkills.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>No skills found</h3>
            <p style={styles.emptyText}>{activeFilterCount > 0 ? 'Try adjusting your filters' : 'Be the first to share your skill!'}</p>
            {activeFilterCount > 0 ? (
              <button onClick={clearFilters} style={styles.emptyBtn}>Clear Filters</button>
            ) : (
              <button onClick={() => navigate('/post-skill')} style={styles.emptyBtn}>Post a Skill</button>
            )}
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredSkills.map((skill) => (
              <div key={skill._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={{...styles.cardAvatar, background: getAvatarColor(skill.user?.name)}}>{getInitials(skill.user?.name)}</div>
                  <div>
                    <p style={{ ...styles.cardUserName, color: isDark ? '#f1f5f9' : '#0f172a' }}>{skill.user?.name}</p>
                    <p style={styles.cardLocation}>📍 {skill.location}</p>
                  </div>
                  <div style={styles.ratingBadge}>⭐ {skill.user?.rating ? skill.user.rating.toFixed(1) : 'New'}</div>
                </div>
                <h3 style={{ ...styles.cardTitle, color: isDark ? '#f1f5f9' : '#0f172a' }}>{skill.title}</h3>
                <p style={{ ...styles.cardDesc, color: isDark ? '#94a3b8' : '#64748b' }}>{skill.description}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.categoryBadge}>{skill.category}</span>
                  {skill.user?._id !== JSON.parse(localStorage.getItem('user'))?.id && (
                    <button onClick={() => handleSendRequest(skill._id, skill.user?._id)} style={styles.requestBtn}>Connect</button>
                  )}
                  {skill.user?._id === JSON.parse(localStorage.getItem('user'))?.id && (
                    <div style={styles.ownerBtns}>
                      <button onClick={() => navigate(`/edit-skill/${skill._id}`)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => handleDeleteSkill(skill._id)} style={styles.deleteBtn}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;