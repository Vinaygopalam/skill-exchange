import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useTheme } from '../ThemeContext';

function UserProfileModal({ userId, onClose }) {
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

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase();
  const averageRating = userProfile?.totalRatings > 0
    ? (userProfile.reviews.reduce((acc, r) => acc + r.rating, 0) / userProfile.reviews.length).toFixed(1)
    : 0;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease'
    },
    modal: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '24px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '85vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
      animation: 'slideUp 0.3s ease'
    },
    header: {
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      padding: '32px 24px',
      color: 'white',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    avatar: {
      width: '64px',
      height: '64px',
      borderRadius: '16px',
      background: isDark ? '#334155' : 'rgba(255,255,255,0.2)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '24px',
      flexShrink: 0
    },
    nameSection: {
      flex: 1
    },
    name: {
      fontSize: '22px',
      fontWeight: '700',
      margin: '0 0 6px 0'
    },
    email: {
      fontSize: '13px',
      opacity: 0.9,
      margin: 0
    },
    closeBtn: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '8px',
      transition: 'all 0.2s ease'
    },
    content: {
      padding: '28px 24px'
    },
    section: {
      marginBottom: '28px'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '700',
      textTransform: 'uppercase',
      color: '#4f46e5',
      marginBottom: '12px',
      letterSpacing: '0.5px'
    },
    bio: {
      fontSize: '15px',
      lineHeight: '1.6',
      color: isDark ? '#cbd5e1' : '#475569',
      margin: 0
    },
    ratingSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    ratingValue: {
      fontSize: '28px',
      fontWeight: '800',
      color: isDark ? '#f1f5f9' : '#0f172a'
    },
    ratingDetails: {
      flex: 1
    },
    ratingInfo: {
      fontSize: '14px',
      color: isDark ? '#cbd5e1' : '#475569',
      margin: '0 0 4px 0'
    },
    stars: {
      color: '#f59e0b',
      fontSize: '14px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    infoItem: {
      padding: '12px',
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      borderRadius: '12px',
      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
    },
    infoLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#94a3b8',
      textTransform: 'uppercase',
      marginBottom: '6px'
    },
    infoValue: {
      fontSize: '18px',
      fontWeight: '700',
      color: isDark ? '#f1f5f9' : '#0f172a'
    },
    skillTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    skillTag: {
      fontSize: '13px',
      backgroundColor: '#4f46e5',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '20px',
      fontWeight: '500'
    },
    reviewsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    reviewItem: {
      padding: '12px',
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      borderRadius: '12px',
      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
    },
    reviewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    reviewRating: {
      color: '#f59e0b',
      fontSize: '13px',
      fontWeight: '600'
    },
    reviewText: {
      fontSize: '13px',
      color: isDark ? '#cbd5e1' : '#475569',
      fontStyle: 'italic',
      margin: 0
    },
    reviewDate: {
      fontSize: '11px',
      color: '#94a3b8',
      marginTop: '6px'
    },
    noReviews: {
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: '14px',
      padding: '20px',
      fontStyle: 'italic'
    }
  };

  if (loading) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: '60px 24px', textAlign: 'center', color: isDark ? '#f1f5f9' : '#0f172a' }}>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: '40px 24px', textAlign: 'center', color: isDark ? '#f1f5f9' : '#0f172a' }}>
            User not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.avatar}>{getInitials(userProfile.name)}</div>
            <div style={styles.nameSection}>
              <h2 style={styles.name}>{userProfile.name}</h2>
              <p style={styles.email}>{userProfile.email}</p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Bio */}
          {userProfile.bio && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📝 Bio</h3>
              <p style={styles.bio}>{userProfile.bio}</p>
            </div>
          )}

          {/* Rating & Reviews */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>⭐ Rating</h3>
            <div style={styles.ratingSection}>
              <div style={styles.ratingValue}>{averageRating}</div>
              <div style={styles.ratingDetails}>
                <p style={styles.ratingInfo}>
                  <span style={styles.stars}>{'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}</span>
                </p>
                <p style={styles.ratingInfo}>{userProfile.totalRatings} {userProfile.totalRatings === 1 ? 'review' : 'reviews'}</p>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div style={styles.section}>
            <div style={styles.infoGrid}>
              {userProfile.location && (
                <div style={styles.infoItem}>
                  <p style={styles.infoLabel}>📍 Location</p>
                  <p style={styles.infoValue}>{userProfile.location}</p>
                </div>
              )}
              <div style={styles.infoItem}>
                <p style={styles.infoLabel}>📚 Skills</p>
                <p style={styles.infoValue}>{userProfile.skillsOffered?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Skills Offered */}
          {userProfile.skillsOffered?.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>✨ Skills Offered</h3>
              <div style={styles.skillTags}>
                {userProfile.skillsOffered.map((skill, idx) => (
                  <span key={idx} style={styles.skillTag}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Skills Needed */}
          {userProfile.skillsNeeded?.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🎯 Skills Looking For</h3>
              <div style={styles.skillTags}>
                {userProfile.skillsNeeded.map((skill, idx) => (
                  <span key={idx} style={styles.skillTag}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {userProfile.reviews?.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>💬 Recent Reviews</h3>
              <div style={styles.reviewsContainer}>
                {userProfile.reviews.slice(-3).reverse().map((review, idx) => (
                  <div key={idx} style={styles.reviewItem}>
                    <div style={styles.reviewHeader}>
                      <span style={styles.reviewRating}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      <span style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {review.comment && (
                      <p style={styles.reviewText}>"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!userProfile.reviews || userProfile.reviews.length === 0) && (
            <div style={styles.section}>
              <p style={styles.noReviews}>No reviews yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;
