import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) { navigate('/login'); return; }
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const [recRes, sentRes] = await Promise.all([
        axios.get('http://localhost:5000/api/requests', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/requests/sent', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRequests(recRes.data);
      setSentRequests(sentRes.data);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const handleAction = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/requests/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRequests();
    } catch (err) { console.log(err); }
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

  const allRequests = [...requests, ...sentRequests];
  const pendingAll = allRequests.filter(r => r.status === 'pending');
  const closedAll  = allRequests.filter(r => r.status === 'rejected');
  const activeInSent = sentRequests.filter(r => r.status === 'accepted');
  const activeInRec  = requests.filter(r => r.status === 'accepted');
  const allActive    = [...activeInRec, ...activeInSent];
  const pendingReceived = requests.filter(r => r.status === 'pending');

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
    tabBadge: (bg, color) => ({ backgroundColor: bg, color, fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '20px' }),

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
        pending:  { bg: isDark ? '#422006' : '#fef3c7', color: isDark ? '#fcd34d' : '#92400e', border: isDark ? '#92400e' : '#fde68a' },
        accepted: { bg: isDark ? '#14532d' : '#dcfce7', color: isDark ? '#86efac' : '#166534', border: isDark ? '#16a34a' : '#bbf7d0' },
        rejected: { bg: isDark ? '#450a0a' : '#fef2f2', color: isDark ? '#fca5a5' : '#dc2626', border: isDark ? '#dc2626' : '#fecaca' },
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
  };

  const RequestCard = ({ req, isSent, index }) => (
    <div className="hover-lift" style={{ ...styles.card, animationDelay: `${index * 0.07}s` }}>
      <div style={styles.cardTop}>
        <div style={{ ...styles.cardAvatar, background: getAvatarColor(isSent ? req.toUser?.name : req.fromUser?.name) }}>
          {getInitials(isSent ? req.toUser?.name : req.fromUser?.name)}
        </div>
        <div style={styles.cardInfo}>
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
        </button>
      )}
    </div>
  );

  return (
    <div style={styles.page}>
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
              <div style={styles.connectorFill(p2(allActive.length, pendingAll.length + allActive.length))} />
            </div>

            <div style={styles.stageBlock}>
              <div className="stage-active" style={styles.stageCircle(isDark ? '#14532d' : '#dcfce7', 'rgba(22,163,74,0.25)')}>🤝</div>
              <div style={styles.stageNum(isDark ? '#86efac' : '#16a34a')}>{allActive.length}</div>
              <div style={styles.stageLabel}>Active</div>
            </div>

            <div style={styles.connector}>
              <div style={styles.connectorFill(p2(closedAll.length, allActive.length + closedAll.length))} />
            </div>

            <div style={styles.stageBlock}>
              <div className="stage-done" style={styles.stageCircle(isDark ? '#1e1b4b' : '#ede9fe', 'rgba(79,70,229,0.2)')}>✅</div>
              <div style={styles.stageNum('#4f46e5')}>{closedAll.length}</div>
              <div style={styles.stageLabel}>Closed</div>
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
            {allActive.length > 0 && (
              <div style={styles.alertBox(isDark ? '#14532d' : '#f0fdf4', isDark ? '#16a34a' : '#bbf7d0')}>
                <span style={{ fontSize: '26px' }}>💬</span>
                <div>
                  <p style={styles.alertTitle(isDark ? '#86efac' : '#166534')}>{allActive.length} active exchange{allActive.length > 1 ? 's' : ''}</p>
                  <p style={styles.alertSub}>Ready to chat and learn!</p>
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
            { key: 'active',   label: '🤝 Active',   count: allActive.length,       bg: '#dcfce7', color: '#166534' },
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
              allActive.length === 0 ? (
                <div style={styles.empty}>
                  <div style={styles.emptyIcon}>🤝</div>
                  <h3 style={styles.emptyTitle}>No active exchanges</h3>
                  <p style={styles.emptyText}>Accept a request to start an active exchange!</p>
                </div>
              ) : (
                <div style={styles.list}>
                  {allActive.map((req, i) => {
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