import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import API_BASE_URL from '../config';
import UserProfileModal from '../components/UserProfileModal';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating');
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/users/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'exchanges') return b.completedExchanges - a.completedExchanges;
    if (sortBy === 'reviews') return b.totalRatings - a.totalRatings;
    return 0;
  });

  const styles = {
    page: { minHeight: '100vh', backgroundColor: isDark ? '#0f172a' : '#f8fafc', padding: '40px 20px' },
    container: { maxWidth: '900px', margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '40px', color: isDark ? '#f1f5f9' : '#0f172a' },
    title: { fontSize: '36px', fontWeight: '800', margin: '0 0 12px 0' },
    subtitle: { fontSize: '16px', color: '#94a3b8', margin: 0 },
    controls: { display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center' },
    sortBtn: (active) => ({
      padding: '10px 20px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      backgroundColor: active ? '#4f46e5' : (isDark ? '#334155' : '#e2e8f0'),
      color: active ? 'white' : (isDark ? '#cbd5e1' : '#0f172a'),
      transition: '0.3s'
    }),
    card: { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '16px', padding: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0' },
    rank: { fontSize: '28px', fontWeight: '800', color: '#4f46e5', minWidth: '50px', textAlign: 'center' },
    avatar: { width: '60px', height: '60px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '20px', flexShrink: 0 },
    content: { flex: 1 },
    name: { fontSize: '18px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#0f172a', margin: '0 0 4px 0' },
    location: { fontSize: '13px', color: '#94a3b8', margin: '0 0 8px 0' },
    stats: { display: 'flex', gap: '20px', fontSize: '13px' },
    statItem: { color: isDark ? '#cbd5e1' : '#475569' },
    rating: { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' },
    ratingValue: { fontSize: '24px', fontWeight: '800', color: '#f59e0b' },
    ratingDetails: { textAlign: 'right', fontSize: '13px', color: '#94a3b8' },
    loading: { textAlign: 'center', padding: '60px 20px', color: isDark ? '#cbd5e1' : '#64748b' },
    empty: { textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }
  };

  if (loading) {
    return <div style={styles.page}><div style={styles.loading}>Loading leaderboard...</div></div>;
  }

  return (
    <div style={styles.page}>
      {selectedUserProfile && (
        <UserProfileModal userId={selectedUserProfile} onClose={() => setSelectedUserProfile(null)} />
      )}
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏆 Leaderboard</h1>
          <p style={styles.subtitle}>Top Skill Exchange Contributors</p>
        </div>

        <div style={styles.controls}>
          <button onClick={() => setSortBy('rating')} style={styles.sortBtn(sortBy === 'rating')}>⭐ Top Rated</button>
          <button onClick={() => setSortBy('exchanges')} style={styles.sortBtn(sortBy === 'exchanges')}>🔄 Most Exchanges</button>
          <button onClick={() => setSortBy('reviews')} style={styles.sortBtn(sortBy === 'reviews')}>💬 Most Reviews</button>
        </div>

        {sortedUsers.length === 0 ? (
          <div style={styles.empty}>No users yet</div>
        ) : (
          sortedUsers.map((user, idx) => {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';

            return (
              <div key={user._id} style={styles.card} onClick={() => setSelectedUserProfile(user._id)}>
                <div style={styles.rank}>{medalEmoji || `#${idx + 1}`}</div>
                <div style={styles.avatar}>{initials}</div>
                <div style={styles.content}>
                  <p style={styles.name}>{user.name}</p>
                  <p style={styles.location}>📍 {user.location || 'Not specified'}</p>
                  <div style={styles.stats}>
                    <span style={styles.statItem}>🔄 {user.completedExchanges} exchanges</span>
                    <span style={styles.statItem}>💬 {user.totalRatings} reviews</span>
                  </div>
                </div>
                <div style={styles.rating}>
                  <div style={styles.ratingValue}>{user.rating ? user.rating.toFixed(1) : '0'}</div>
                  <div style={styles.ratingDetails}>
                    <div>⭐ Rating</div>
                    <div>{user.totalRatings > 0 ? `${user.totalRatings} reviews` : 'No reviews'}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
