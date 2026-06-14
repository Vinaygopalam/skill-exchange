import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import API_BASE_URL from '../config';
import UserProfileModal from '../components/UserProfileModal';

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/users/recommendations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleProfileOpen = (userId) => {
    setSelectedUserProfile(userId);
  };

  const styles = {
    page: { minHeight: '100vh', backgroundColor: isDark ? '#0f172a' : '#f8fafc', padding: '40px 20px' },
    container: { maxWidth: '1000px', margin: '0 auto' },
    header: { marginBottom: '40px', color: isDark ? '#f1f5f9' : '#0f172a' },
    title: { fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' },
    subtitle: { fontSize: '14px', color: '#94a3b8', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    card: { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', transition: 'transform 0.2s' },
    cardHeader: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' },
    avatar: { width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '24px' },
    name: { flex: 1, fontSize: '18px', fontWeight: '700', margin: 0 },
    rating: { fontSize: '16px', fontWeight: '600' },
    cardContent: { padding: '24px' },
    location: { fontSize: '13px', color: '#94a3b8', margin: '0 0 8px 0' },
    bio: { fontSize: '14px', color: isDark ? '#cbd5e1' : '#475569', margin: '0 0 16px 0', lineHeight: '1.5' },
    matchScore: { display: 'inline-block', backgroundColor: '#4f46e5', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '12px' },
    skillsLabel: { fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' },
    skillTag: { backgroundColor: '#4f46e5', color: 'white', padding: '4px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: '600' },
    stats: { display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0', marginBottom: '16px', fontSize: '13px' },
    statItem: { textAlign: 'center', color: '#94a3b8' },
    statValue: { fontSize: '18px', fontWeight: '700', color: '#4f46e5', display: 'block' },
    button: { width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: '0.3s' },
    loading: { textAlign: 'center', padding: '60px 20px', color: isDark ? '#cbd5e1' : '#64748b' },
    empty: { textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }
  };

  if (loading) {
    return <div style={styles.page}><div style={styles.loading}>Loading recommendations...</div></div>;
  }

  return (
    <div style={styles.page}>
      {selectedUserProfile && (
        <UserProfileModal userId={selectedUserProfile} onClose={() => setSelectedUserProfile(null)} />
      )}
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>💡 Recommendations</h1>
          <p style={styles.subtitle}>Users who can help you learn the skills you need</p>
        </div>

        {recommendations.length === 0 ? (
          <div style={styles.empty}>
            <p>No recommendations yet. Complete your profile to get personalized recommendations!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {recommendations.map((user) => {
              const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
              return (
                <div key={user._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.avatar}>{initials}</div>
                    <div>
                      <p style={styles.name}>{user.name}</p>
                      <p style={styles.rating}>⭐ {user.rating?.toFixed(1) || '0'}</p>
                    </div>
                  </div>

                  <div style={styles.cardContent}>
                    <p style={styles.location}>📍 {user.location || 'Not specified'}</p>
                    {user.bio && <p style={styles.bio}>{user.bio}</p>}

                    <span style={styles.matchScore}>
                      ✨ {user.matchScore} matching skill{user.matchScore > 1 ? 's' : ''}
                    </span>

                    {user.matchingSkills && user.matchingSkills.length > 0 && (
                      <>
                        <p style={styles.skillsLabel}>They can teach you:</p>
                        <div style={styles.skillsList}>
                          {user.matchingSkills.map((skill, idx) => (
                            <span key={idx} style={styles.skillTag}>{skill}</span>
                          ))}
                        </div>
                      </>
                    )}

                    <div style={styles.stats}>
                      <div style={styles.statItem}>
                        <span style={styles.statValue}>{user.completedExchanges}</span>
                        <span>Exchanges</span>
                      </div>
                      <div style={styles.statItem}>
                        <span style={styles.statValue}>{user.totalRatings}</span>
                        <span>Reviews</span>
                      </div>
                      <div style={styles.statItem}>
                        <span style={styles.statValue}>{user.skillsOffered?.length || 0}</span>
                        <span>Skills</span>
                      </div>
                    </div>

                    <button 
                      style={styles.button}
                      onClick={() => handleProfileOpen(user._id)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#4f3dd9'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
                    >
                      👤 View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
