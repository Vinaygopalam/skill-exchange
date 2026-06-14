import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import API_BASE_URL from '../config';

function StatsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const res = await axios.get(`${API_BASE_URL}/api/users/stats/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const styles = {
    page: { minHeight: '100vh', backgroundColor: isDark ? '#0f172a' : '#f8fafc', padding: '40px 20px' },
    container: { maxWidth: '1000px', margin: '0 auto' },
    header: { marginBottom: '40px', color: isDark ? '#f1f5f9' : '#0f172a' },
    title: { fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' },
    subtitle: { fontSize: '14px', color: '#94a3b8', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' },
    card: { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', textAlign: 'center' },
    cardIcon: { fontSize: '40px', marginBottom: '12px' },
    cardValue: { fontSize: '36px', fontWeight: '800', color: '#4f46e5', margin: '0 0 8px 0' },
    cardLabel: { fontSize: '14px', fontWeight: '600', color: '#94a3b8', margin: 0 },
    cardSubtext: { fontSize: '12px', color: '#64748b', marginTop: '8px', margin: 0 },
    section: { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0' },
    sectionTitle: { fontSize: '18px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: '20px', margin: '0 0 20px 0' },
    badgeContainer: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
    badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#4f46e5', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: '600' },
    badgeIcon: { fontSize: '18px' },
    progressBar: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
    progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569' },
    progressFill: { height: '8px', backgroundColor: isDark ? '#334155' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' },
    progressDone: (pct) => ({ height: '100%', backgroundColor: '#4f46e5', width: `${Math.min(pct, 100)}%`, transition: 'width 0.3s ease' }),
    loading: { textAlign: 'center', padding: '60px 20px', color: isDark ? '#cbd5e1' : '#64748b' }
  };

  if (loading) {
    return <div style={styles.page}><div style={styles.loading}>Loading your stats...</div></div>;
  }

  if (!stats) {
    return <div style={styles.page}><div style={styles.loading}>No data available</div></div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📊 Your Statistics</h1>
          <p style={styles.subtitle}>Track your skill exchange journey</p>
        </div>

        {/* Main Stats Grid */}
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>⭐</div>
            <p style={styles.cardValue}>{stats.rating?.toFixed(1) || '0'}</p>
            <p style={styles.cardLabel}>Average Rating</p>
            <p style={styles.cardSubtext}>{stats.totalRatings} reviews</p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>🔄</div>
            <p style={styles.cardValue}>{stats.completedExchanges}</p>
            <p style={styles.cardLabel}>Completed Exchanges</p>
            <p style={styles.cardSubtext}>{stats.successRate}% success rate</p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>✅</div>
            <p style={styles.cardValue}>{stats.acceptedRequests}</p>
            <p style={styles.cardLabel}>Accepted Requests</p>
            <p style={styles.cardSubtext}>Active exchanges</p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>📨</div>
            <p style={styles.cardValue}>{stats.sentRequests}</p>
            <p style={styles.cardLabel}>Requests Sent</p>
            <p style={styles.cardSubtext}>{stats.rejectedRequests} rejected</p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>✨</div>
            <p style={styles.cardValue}>{stats.skillsOffered}</p>
            <p style={styles.cardLabel}>Skills Offered</p>
            <p style={styles.cardSubtext}>Share your expertise</p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>🎯</div>
            <p style={styles.cardValue}>{stats.skillsNeeded}</p>
            <p style={styles.cardLabel}>Skills Learning</p>
            <p style={styles.cardSubtext}>Continue growing</p>
          </div>
        </div>

        {/* Progress Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📈 Progress</h3>
          
          <div style={styles.progressBar}>
            <div style={styles.progressLabel}>
              <span>Exchange Success Rate</span>
              <span>{stats.successRate}%</span>
            </div>
            <div style={styles.progressFill}>
              <div style={styles.progressDone(stats.successRate)} />
            </div>
          </div>

          <div style={styles.progressBar}>
            <div style={styles.progressLabel}>
              <span>Requests Fulfilled</span>
              <span>{stats.receivedRequests > 0 ? ((stats.completedExchanges / stats.receivedRequests) * 100).toFixed(0) : 0}%</span>
            </div>
            <div style={styles.progressFill}>
              <div style={styles.progressDone(stats.receivedRequests > 0 ? (stats.completedExchanges / stats.receivedRequests) * 100 : 0)} />
            </div>
          </div>

          <div style={styles.progressBar}>
            <div style={styles.progressLabel}>
              <span>Rating Goal (5 ⭐)</span>
              <span>{(stats.rating / 5 * 100).toFixed(0)}%</span>
            </div>
            <div style={styles.progressFill}>
              <div style={styles.progressDone((stats.rating / 5) * 100)} />
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🏆 Badges & Achievements</h3>
          {stats.badges && stats.badges.length > 0 ? (
            <div style={styles.badgeContainer}>
              {stats.badges.map((badge) => (
                <div key={badge._id} style={styles.badge}>
                  <span style={styles.badgeIcon}>{badge.icon}</span>
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', margin: 0 }}>Complete exchanges and leave reviews to unlock badges!</p>
          )}
        </div>

        {/* Member Since */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📅 Member Since</h3>
          <p style={{ fontSize: '16px', color: isDark ? '#cbd5e1' : '#475569', margin: 0 }}>
            {new Date(stats.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default StatsDashboard;
