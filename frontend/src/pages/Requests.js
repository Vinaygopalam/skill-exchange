import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import { useTheme } from '../ThemeContext';
import UserProfileModal from '../components/UserProfileModal';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/messages/unread`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCounts(res.data);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const [recRes, sentRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/requests`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/requests/sent`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRequests(recRes.data);
      setSentRequests(sentRes.data);
      await fetchUnreadCounts();
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }, [fetchUnreadCounts]);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) { navigate('/login'); return; }
    fetchRequests();
  }, [fetchRequests, navigate]);

  const handleAction = async (id, status, request = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/api/requests/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRequests();
      if (status === 'completed') {
        setReviewTarget(request || response.data.request);
        setReviewRating(5);
        setReviewComment('');
      }
    } catch (err) { console.log(err); }
  };

  const closeReviewModal = () => {
    setReviewTarget(null);
    setReviewRating(5);
    setReviewComment('');
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    setReviewSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const toUserId = reviewTarget.fromUser?._id === currentUser._id
        ? reviewTarget.toUser?._id
        : reviewTarget.fromUser?._id;

      await axios.post(`${API_BASE_URL}/api/reviews`, {
        toUser: toUserId,
        requestId: reviewTarget._id,
        rating: reviewRating,
        comment: reviewComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      closeReviewModal();
      fetchRequests();
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase();
  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg,#3b82f6,#2563eb)',
      'linear-gradient(135deg,#8b5cf6,#7c3aed)',
      'linear-gradient(135deg,#f59e0b,#d97706)',
      'linear-gradient(135deg,#ef4444,#dc2626)',
      'linear-gradient(135deg,#22c55e,#166534)',
      'linear-gradient(135deg,#06b6d4,#0891b2)',
    ];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const allRequests = [...requests, ...sentRequests];
  const pendingAll = allRequests.filter(r => r.status === 'pending');
  const acceptedAll = allRequests.filter(r => r.status === 'accepted');
  const rejectedAll = allRequests.filter(r => r.status === 'rejected');
  const completedAll = allRequests.filter(r => r.status === 'completed');
  const pendingReceived = requests.filter(r => r.status === 'pending');
  const completedRequests = allRequests.filter(r => r.status === 'completed');

  const p2 = (a, b) => Math.round((a / (b || 1)) * 100);

  const styles = {
    page: { minHeight: '100vh', backgroundColor: isDark ? '#0f172a' : '#f1f5f9', transition: 'background-color 0.3s ease' },
    navbar: { background: isDark ? 'rgba(15,23,42,0.97)' : '#166534', backdropFilter: 'blur(12px)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 100 },
    navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
    brandIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(34,197,94,0.5)' },
    brandName: { fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px' },
    navLinks: { display: 'flex', gap: '8px', alignItems: 'center' },
    navLink: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '13px', fontWeight: '600' },
    themeBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px' },
    logoutBtn: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: '#fca5a5', fontSize: '13px', fontWeight: '600' },

    container: { maxWidth: '860px', margin: '0 auto', padding: '36px 24px 60px' },
    pageHeader: { marginBottom: '28px', animation: 'fadeInUp 0.5s ease 0.05s both' },
    pageTitle: { fontSize: '30px', fontWeight: '900', color: isDark ? '#f1f5f9' : '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' },
    pageSubtitle: { fontSize: '14px', color: '#64748b', margin: 0 },

    trackerCard: { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '24px', padding: '28px 32px', marginBottom: '24px', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)', animation: 'fadeInUp 0.5s ease 0.1s both' },
    trackerHeading: { fontSize: '11px', fontWeight: '800', color: isDark ? '#64748b' : '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px' },
    stagesRow: { display: 'flex', alignItems: 'center' },
    stageBlock: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    connector: { width: '48px', height: '4px', borderRadius: '4px', backgroundColor: isDark ? '#334155' : '#e2e8f0', flexShrink: 0, margin: '0 6px 24px', position: 'relative', overflow: 'hidden' },
    connectorFill: (pct) => ({ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#22c55e,#16a34a)', borderRadius: '4px', transition: 'width 1.2s ease' }),
    stageCircle: (bg, shadow) => ({ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: `0 4px 18px ${shadow}` }),
    stageNum: (color) => ({ fontSize: '26px', fontWeight: '900', color, lineHeight: 1 }),
    stageLabel: { fontSize: '11px', fontWeight: '700', color: isDark ? '#64748b' : '#94a3b8', textAlign: 'center', letterSpacing: '0.5px', textTransform: 'uppercase' },
    trackerDivider: { borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9', marginTop: '24px', paddingTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' },
    alertBox: (bg, border) => ({ flex: 1, minWidth: '180px', backgroundColor: bg, borderRadius: '14px', padding: '14px 18px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '12px' }),
    alertTitle: (color) => ({ fontSize: '13px', fontWeight: '800', color, margin: '0 0 2px 0' }),
    alertSub: { fontSize: '12px', color: '#94a3b8', margin: 0 },

    tabs: { display: 'flex', gap: '6px', backgroundColor: isDark ? '#1e293b' : '#e2e8f0', padding: '5px', borderRadius: '14px', marginBottom: '24px', animation: 'fadeInUp 0.5s ease 0.15s both' },
    tab: { flex: 1, padding: '10px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: isDark ? '#64748b' : '#94a3b8', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'all 0.25s ease' },
    activeTab: { backgroundColor: isDark ? '#334155' : '#ffffff', color: isDark ? '#f1f5f9' : '#0f172a', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    tabBadge: (bg, color) => ({ backgroundColor: bg, color, fontSize: '12px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px', minWidth: '26px', textAlign: 'center' }),

    loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '16px' },
    loadingText: { color: '#64748b', fontSize: '14px', fontWeight: '600' },
    empty: { textAlign: 'center', padding: '80px 20px', animation: 'scaleIn 0.4s ease' },
    emptyIcon: { fontSize: '56px', marginBottom: '16px' },
    emptyTitle: { fontSize: '22px', fontWeight: '800', color: isDark ? '#f1f5f9' : '#0f172a', margin: '0 0 8px 0' },
    emptyText: { fontSize: '14px', color: '#94a3b8', margin: 0 },
    list: { display: 'flex', flexDirection: 'column', gap: '14px' },

    card: { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '20px', padding: '22px 24px', border: isDark ? '1px solid #334155' : '1px solid #e8edf3', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.05)', animation: 'fadeInUp 0.4s ease both' },
    cardTop: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' },
    cardAvatar: { width: '46px', height: '46px', borderRadius: '14px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', flexShrink: 0 },
    cardInfo: { flex: 1 },
    cardName: { fontSize: '16px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#0f172a', margin: '0 0 3px 0' },
    cardLocation: { fontSize: '12px', color: '#94a3b8', margin: 0 },
    getStatusBadge: (status) => {
      const m = {
        pending:   { bg: isDark ? '#422006' : '#fef3c7', color: isDark ? '#fcd34d' : '#92400e', border: isDark ? '#92400e' : '#fde68a' },
        accepted:  { bg: isDark ? '#14532d' : '#dcfce7', color: isDark ? '#86efac' : '#166534', border: isDark ? '#16a34a' : '#bbf7d0' },
        rejected:  { bg: isDark ? '#450a0a' : '#fef2f2', color: isDark ? '#fca5a5' : '#dc2626', border: isDark ? '#dc2626' : '#fecaca' },
        completed: { bg: isDark ? '#0f172a' : '#ecfdf5', color: isDark ? '#a7f3d0' : '#0f766e', border: isDark ? '#065f46' : '#99f6e4' },
      };
      const c = m[status] || m.pending;
      return { fontSize: '11px', padding: '5px 14px', borderRadius: '20px', fontWeight: '700', textTransform: 'capitalize', flexShrink: 0, backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` };
    },
    skillInfo: { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9' },
    skillLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' },
    skillName: { fontSize: '14px', color: isDark ? '#f1f5f9' : '#0f172a', fontWeight: '700' },
    messageBox: { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderLeft: '3px solid #4f46e5', padding: '10px 14px', borderRadius: '0 10px 10px 0', marginBottom: '16px' },
    messageText: { fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', margin: 0 },
    actionBtns: { display: 'flex', gap: '10px', marginTop: '4px' },
    rejectBtn: { flex: 1, padding: '11px', backgroundColor: isDark ? '#450a0a' : '#fef2f2', color: isDark ? '#fca5a5' : '#dc2626', border: '1px solid #fecaca', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
    acceptBtn: { flex: 2, padding: '11px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 12px rgba(34,197,94,0.35)' },
    chatBtn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', marginTop: '4px', boxShadow: '0 4px 14px rgba(79,70,229,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    unreadBadge: { backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: '700', padding: '4px 9px', borderRadius: '999px', minWidth: '24px', textAlign: 'center' },
    modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
    modalCard: { width: 'min(540px,100%)', backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: '24px', padding: '28px 26px', boxShadow: '0 24px 80px rgba(15,23,42,0.35)', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' },
    modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
    modalTitle: { fontSize: '20px', fontWeight: '800', margin: 0, color: isDark ? '#f8fafc' : '#0f172a' },
    modalLabel: { fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0', color: isDark ? '#cbd5e1' : '#475569' },
    modalTextarea: { width: '100%', minHeight: '100px', borderRadius: '16px', border: isDark ? '1px solid #334155' : '1px solid #cbd5e1', backgroundColor: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', padding: '12px 14px', fontSize: '14px', outline: 'none' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '22px' },
    modalBtn: { borderRadius: '14px', border: 'none', padding: '10px 18px', cursor: 'pointer', fontWeight: '700' },
    modalCancel: { backgroundColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#475569' },
    modalSubmit: { background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white' },
    starRow: { display: 'flex', gap: '8px', marginTop: '8px' },
    starButton: (active) => ({ width: '40px', height: '40px', borderRadius: '12px', border: active ? '1px solid #22c55e' : '1px solid #64748b', backgroundColor: active ? '#22c55e' : isDark ? '#1e293b' : '#f1f5f9', color: active ? 'white' : '#94a3b8', cursor: 'pointer', fontSize: '18px' }),
  };

  const RequestCard = ({ req, isSent, index }) => {
    const statusSteps = req.status === 'rejected'
      ? [
          {key: 'pending', label: 'Requested', icon: '⏳'},
          {key: 'rejected', label: 'Rejected', icon: '❌'}
        ]
      : [
          {key: 'pending', label: 'Requested', icon: '⏳'},
          {key: 'accepted', label: 'Accepted', icon: '🤝'},
          {key: 'completed', label: 'Completed', icon: '✅'}
        ];

    const loggedInUserId = currentUser?._id;
    const canComplete = req.status === 'accepted' && [req.fromUser?._id, req.toUser?._id].includes(loggedInUserId);

    return (
      <div className="hover-lift" style={{ ...styles.card, animationDelay: `${index * 0.07}s` }}>
      <div style={styles.cardTop}>
        <div 
          style={{ ...styles.cardAvatar, background: getAvatarColor(isSent ? req.toUser?.name : req.fromUser?.name), cursor: 'pointer' }} 
          onClick={() => setSelectedUserProfile(isSent ? req.toUser?._id : req.fromUser?._id)}
          title="View profile"
        >
          {getInitials(isSent ? req.toUser?.name : req.fromUser?.name)}
        </div>
        <div style={{ ...styles.cardInfo, cursor: 'pointer' }} onClick={() => setSelectedUserProfile(isSent ? req.toUser?._id : req.fromUser?._id)}>
          <h4 style={styles.cardName}>{isSent ? req.toUser?.name : req.fromUser?.name}</h4>
          <p style={styles.cardLocation}>📍 {isSent ? req.toUser?.location : req.fromUser?.location}</p>
        </div>
        <span style={styles.getStatusBadge(req.status)}>{req.status}</span>
      </div>

      <div style={styles.skillInfo}>
        <span style={styles.skillLabel}>{isSent ? 'Requesting' : 'Wants to exchange'}</span>
        <span style={styles.skillName}>{req.skill?.title || '—'}</span>
      </div>

      {req.message && (
        <div style={styles.messageBox}>
          <p style={styles.messageText}>"{req.message}"</p>
        </div>
      )}

      {!isSent && req.status === 'pending' && (
        <div style={styles.actionBtns}>
          <button onClick={() => handleAction(req._id, 'rejected')} style={styles.rejectBtn}>✕ Decline</button>
          <button onClick={() => handleAction(req._id, 'accepted')} style={styles.acceptBtn}>✓ Accept</button>
        </div>
      )}

      {req.status === 'accepted' && (
        <button onClick={() => navigate(`/chat/${req._id}`)} style={styles.chatBtn}>
          💬 Open Chat
          {unreadCounts[req._id] > 0 && <span style={styles.unreadBadge}>{unreadCounts[req._id]}</span>}
        </button>
      )}

      {canComplete && (
        <button onClick={() => handleAction(req._id, 'completed', req)} style={{ ...styles.acceptBtn, marginTop: '12px', background: 'linear-gradient(135deg,#0f766e,#14b8a6)' }}>
          ✅ Mark Completed
        </button>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '18px' }}>
        {statusSteps.map((step, idx) => {
          const isActive = req.status === step.key || (req.status === 'accepted' && step.key === 'pending') || (req.status === 'completed' && step.key !== 'rejected');
          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? '#22c55e' : '#334155', color: 'white', fontSize: '14px' }}>
                {step.icon}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: isActive ? '#f8fafc' : '#94a3b8' }}>{step.label}</span>
              {idx < statusSteps.length - 1 && <span style={{ color: isActive ? '#22c55e' : '#64748b' }}>→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

  return (
    <div style={styles.page}>
      {selectedUserProfile && (
        <UserProfileModal userId={selectedUserProfile} onClose={() => setSelectedUserProfile(null)} />
      )}
      {reviewTarget && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Review the exchange</h3>
                <p style={styles.modalLabel}>Tell us how it went with {reviewTarget.fromUser?._id === currentUser._id ? reviewTarget.toUser?.name : reviewTarget.fromUser?.name}</p>
              </div>
              <button onClick={closeReviewModal} style={{ ...styles.modalBtn, ...styles.modalCancel }}>Close</button>
            </div>

            <label style={styles.modalLabel}>Your rating</label>
            <div style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setReviewRating(value)}
                  style={styles.starButton(value <= reviewRating)}
                >
                  {value}★
                </button>
              ))}
            </div>

            <label style={{ ...styles.modalLabel, marginTop: '20px' }}>Your comment</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share a quick note about the exchange..."
              style={styles.modalTextarea}
            />

            <div style={styles.modalFooter}>
              <button type="button" onClick={closeReviewModal} style={{ ...styles.modalBtn, ...styles.modalCancel }}>Cancel</button>
              <button
                type="button"
                onClick={submitReview}
                disabled={reviewSubmitting}
                style={{ ...styles.modalBtn, ...styles.modalSubmit, opacity: reviewSubmitting ? 0.7 : 1 }}
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <div style={styles.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>

        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>Exchange Hub</h2>
          <p style={styles.pageSubtitle}>Track and manage all your skill exchanges in one place</p>
        </div>

        {/* ===== EXCHANGE TRACKER ===== */}
        <div style={styles.trackerCard}>
          <p style={styles.trackerHeading}>🔄 Exchange Tracker</p>

          <div style={styles.stagesRow}>
            <div style={styles.stageBlock}>
              <div className="stage-pending" style={styles.stageCircle(isDark ? '#422006' : '#fef3c7', 'rgba(217,119,6,0.25)')}>⏳</div>
              <div style={styles.stageNum(isDark ? '#fcd34d' : '#d97706')}>{pendingAll.length}</div>
              <div style={styles.stageLabel}>Pending</div>
            </div>

            <div style={styles.connector}>
              <div style={styles.connectorFill(p2(acceptedAll.length, pendingAll.length + acceptedAll.length + rejectedAll.length + completedAll.length))} />
            </div>

            <div style={styles.stageBlock}>
              <div className="stage-active" style={styles.stageCircle(isDark ? '#14532d' : '#dcfce7', 'rgba(22,163,74,0.25)')}>🤝</div>
              <div style={styles.stageNum(isDark ? '#86efac' : '#16a34a')}>{acceptedAll.length}</div>
              <div style={styles.stageLabel}>Accepted</div>
            </div>

            <div style={styles.connector}>
              <div style={styles.connectorFill(p2(rejectedAll.length, pendingAll.length + acceptedAll.length + rejectedAll.length + completedAll.length))} />
            </div>

            <div style={styles.stageBlock}>
              <div className="stage-rejected" style={styles.stageCircle(isDark ? '#450a0a' : '#fef2f2', 'rgba(220,38,38,0.2)')}>❌</div>
              <div style={styles.stageNum(isDark ? '#fca5a5' : '#dc2626')}>{rejectedAll.length}</div>
              <div style={styles.stageLabel}>Rejected</div>
            </div>

            <div style={styles.connector}>
              <div style={styles.connectorFill(p2(completedAll.length, pendingAll.length + acceptedAll.length + rejectedAll.length + completedAll.length))} />
            </div>

            <div style={styles.stageBlock}>
              <div className="stage-completed" style={styles.stageCircle(isDark ? '#0f172a' : '#ecfdf5', 'rgba(20,184,166,0.2)')}>✅</div>
              <div style={styles.stageNum(isDark ? '#a7f3d0' : '#0f766e')}>{completedAll.length}</div>
              <div style={styles.stageLabel}>Completed</div>
            </div>
          </div>

          <div style={styles.trackerDivider}>
            {pendingReceived.length > 0 && (
              <div style={styles.alertBox(isDark ? '#422006' : '#fffbeb', isDark ? '#92400e' : '#fde68a')}>
                <span style={{ fontSize: '26px' }}>🔔</span>
                <div>
                  <p style={styles.alertTitle(isDark ? '#fcd34d' : '#92400e')}>{pendingReceived.length} request{pendingReceived.length > 1 ? 's' : ''} need your response</p>
                  <p style={styles.alertSub}>Check the Received tab below</p>
                </div>
              </div>
            )}
            {acceptedAll.length > 0 && (
              <div style={styles.alertBox(isDark ? '#14532d' : '#f0fdf4', isDark ? '#16a34a' : '#bbf7d0')}>
                <span style={{ fontSize: '26px' }}>🤝</span>
                <div>
                  <p style={styles.alertTitle(isDark ? '#86efac' : '#166534')}>{acceptedAll.length} accepted exchange{acceptedAll.length > 1 ? 's' : ''}</p>
                  <p style={styles.alertSub}>Chat with your active partners now.</p>
                </div>
              </div>
            )}
            {completedAll.length > 0 && (
              <div style={styles.alertBox(isDark ? '#0f172a' : '#ecfdf5', isDark ? '#a7f3d0' : '#0f766e')}>
                <span style={{ fontSize: '26px' }}>✅</span>
                <div>
                  <p style={styles.alertTitle(isDark ? '#a7f3d0' : '#0f766e')}>{completedAll.length} completed exchange{completedAll.length > 1 ? 's' : ''}</p>
                  <p style={styles.alertSub}>Great work — you can now review your partner.</p>
                </div>
              </div>
            )}
            {allRequests.length === 0 && (
              <div style={{ flex: 1, textAlign: 'center', padding: '12px', color: '#94a3b8', fontSize: '14px' }}>
                No exchanges yet — go connect on the Dashboard! 🚀
              </div>
            )}
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div style={styles.tabs}>
          {[
            { key: 'received', label: '📥 Received', count: pendingReceived.length, bg: '#fef3c7', color: '#92400e' },
            { key: 'sent',     label: '📤 Sent',     count: sentRequests.length,   bg: '#ede9fe', color: '#4f46e5' },
            { key: 'active',   label: '🤝 Accepted', count: acceptedAll.length,     bg: '#dcfce7', color: '#166534' },
            { key: 'completed',label: '✅ Completed',count: completedRequests.length, bg: '#ecfdf5', color: '#0f766e' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{ ...styles.tab, ...(activeTab === tab.key ? styles.activeTab : {}) }}
            >
              {tab.label}
              {tab.count > 0 && <span style={styles.tabBadge(tab.bg, tab.color)}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* ===== CONTENT ===== */}
        {loading ? (
          <div style={styles.loading}>
            <div className="spinner" />
            <p style={styles.loadingText}>Loading your exchanges...</p>
          </div>
        ) : (
          <>
            {activeTab === 'received' && (
              requests.length === 0 ? (
                <div style={styles.empty}>
                  <div style={styles.emptyIcon}>📭</div>
                  <h3 style={styles.emptyTitle}>No requests received yet</h3>
                  <p style={styles.emptyText}>When someone sends you a request it will appear here</p>
                </div>
              ) : (
                <div style={styles.list}>
                  {requests.map((req, i) => <RequestCard key={req._id} req={req} isSent={false} index={i} />)}
                </div>
              )
            )}

            {activeTab === 'sent' && (
              sentRequests.length === 0 ? (
                <div style={styles.empty}>
                  <div style={styles.emptyIcon}>📤</div>
                  <h3 style={styles.emptyTitle}>No sent requests</h3>
                  <p style={styles.emptyText}>Browse the Dashboard and connect with someone!</p>
                </div>
              ) : (
                <div style={styles.list}>
                  {sentRequests.map((req, i) => <RequestCard key={req._id} req={req} isSent={true} index={i} />)}
                </div>
              )
            )}

            {activeTab === 'active' && (
              acceptedAll.length === 0 ? (
                <div style={styles.empty}>
                  <div style={styles.emptyIcon}>🤝</div>
                  <h3 style={styles.emptyTitle}>No active exchanges</h3>
                  <p style={styles.emptyText}>Accept a request to start an active exchange!</p>
                </div>
              ) : (
                <div style={styles.list}>
                  {acceptedAll.map((req, i) => {
                    const isSent = sentRequests.some(sr => sr._id === req._id);
                    return <RequestCard key={req._id} req={req} isSent={isSent} index={i} />;
                  })}
                </div>
              )
            )}

            {activeTab === 'completed' && (
              completedRequests.length === 0 ? (
                <div style={styles.empty}>
                  <div style={styles.emptyIcon}>🎉</div>
                  <h3 style={styles.emptyTitle}>No completed exchanges yet</h3>
                  <p style={styles.emptyText}>Once an accepted exchange is marked complete, it’ll appear here.</p>
                </div>
              ) : (
                <div style={styles.list}>
                  {completedRequests.map((req, i) => {
                    const isSent = sentRequests.some(sr => sr._id === req._id);
                    return <RequestCard key={req._id} req={req} isSent={isSent} index={i} />;
                  })}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Requests;