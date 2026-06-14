import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useTheme } from '../ThemeContext';

function UserCard({ userId, onViewProfile }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  const fetchUserProfile = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/auth/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  if (loading || !userProfile) {
    return <div style={styles.skeletonCard}></div>;
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase();
  const averageRating = userProfile.totalRatings > 0 
    ? (userProfile.reviews.reduce((acc, r) => acc + r.rating, 0) / userProfile.reviews.length).toFixed(1)
    : 0;

  const styles = {
    card: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      padding: '16px',
      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: isDark ? '0 8px 16px rgba(0,0,0,0.3)' : '0 8px 16px rgba(0,0,0,0.15)',
        transform: 'translateY(-2px)'
      }
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '16px',
      flexShrink: 0
    },
    nameSection: {
      flex: 1
    },
    name: {
      fontSize: '15px',
      fontWeight: '700',
      color: isDark ? '#f1f5f9' : '#0f172a',
      margin: 0
    },
    ratingBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginTop: '4px'
    },
    stars: {
      color: '#f59e0b',
      fontSize: '13px'
    },
    ratingText: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '600'
    },
    bio: {
      fontSize: '13px',
      color: isDark ? '#cbd5e1' : '#475569',
      margin: '0 0 12px 0',
      lineHeight: '1.4',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    skills: {
      marginBottom: '12px'
    },
    skillsLabel: {
      fontSize: '11px',
      fontWeight: '700',
      color: '#94a3b8',
      textTransform: 'uppercase',
      marginBottom: '6px'
    },
    skillTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px'
    },
    skillTag: {
      fontSize: '12px',
      backgroundColor: isDark ? '#334155' : '#f1f5f9',
      color: isDark ? '#cbd5e1' : '#475569',
      padding: '4px 10px',
      borderRadius: '20px',
      fontWeight: '500'
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '12px',
      borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
      fontSize: '12px'
    },
    stats: {
      display: 'flex',
      gap: '12px',
      color: '#64748b'
    },
    viewBtn: {
      padding: '6px 14px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    },
    skeletonCard: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      padding: '16px',
      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
      height: '220px',
      animation: 'pulse 2s infinite',
      '@keyframes pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 }
      }
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    if (onViewProfile) {
      onViewProfile(userProfile._id);
    }
  };

  return (
    <div style={styles.card} onClick={handleCardClick}>
      {/* Header with Avatar and Name */}
      <div style={styles.cardHeader}>
        <div style={styles.avatar}>{getInitials(userProfile.name)}</div>
        <div style={styles.nameSection}>
          <p style={styles.name}>{userProfile.name}</p>
          <div style={styles.ratingBadge}>
            <span style={styles.stars}>★ {averageRating}</span>
            <span style={styles.ratingText}>({userProfile.totalRatings} reviews)</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {userProfile.bio && (
        <p style={styles.bio}>{userProfile.bio}</p>
      )}

      {/* Location */}
      {userProfile.location && (
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>
          📍 {userProfile.location}
        </p>
      )}

      {/* Skills Offered */}
      {userProfile.skillsOffered?.length > 0 && (
        <div style={styles.skills}>
          <p style={styles.skillsLabel}>Skills Offered</p>
          <div style={styles.skillTags}>
            {userProfile.skillsOffered.slice(0, 3).map((skill, idx) => (
              <span key={idx} style={styles.skillTag}>{skill}</span>
            ))}
            {userProfile.skillsOffered.length > 3 && (
              <span style={styles.skillTag}>+{userProfile.skillsOffered.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.stats}>
          <span>📚 {userProfile.skillsOffered?.length || 0} skills</span>
        </div>
        <button
          style={styles.viewBtn}
          onClick={(e) => {
            e.stopPropagation();
            if (onViewProfile) onViewProfile(userProfile._id);
          }}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

export default UserCard;
