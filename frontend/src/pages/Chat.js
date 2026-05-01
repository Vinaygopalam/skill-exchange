import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import API_BASE_URL from '../config';

const socket = io(API_BASE_URL);

function Chat() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState('');
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    socket.emit('join_room', roomId);
    loadMessages();
  }, [roomId]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => { socket.off('receive_message'); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/messages/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) { console.log(err); }
  };

  const sendMessage = async () => {
    if (message.trim() === '') return;
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const msgData = {
      roomId,
      message,
      sender: storedUser?.name,
      senderId: storedUser?.id,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/messages`, msgData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) { console.log(err); }
    socket.emit('send_message', msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const submitRating = async (toUserId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/auth/rate/${toUserId}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRatingSuccess('Rating submitted! Thank you!');
      setShowRating(false);
    } catch (err) { console.log(err); }
  };

  // ✅ styles inside component so isDark works
  const styles = {
    page: { minHeight: '100vh', backgroundColor: isDark ? '#0f172a' : '#f8fafc', transition: 'background-color 0.3s ease' },
    navbar: { backgroundColor: isDark ? '#0f172a' : '#166534', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
    brandIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' },
    brandName: { fontSize: '18px', fontWeight: '700', color: '#ffffff' },
    navLinks: { display: 'flex', gap: '8px', alignItems: 'center' },
    navLink: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '500' },
    themeBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px' },
    container: { maxWidth: '860px', margin: '32px auto', padding: '0 24px' },
    chatWrapper: { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0' },
    chatHeader: { background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    chatHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    onlineDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.3)' },
    chatTitle: { color: 'white', margin: 0, fontSize: '18px', fontWeight: '700' },
    chatSubtitle: { color: 'rgba(255,255,255,0.5)', margin: '2px 0 0 0', fontSize: '12px' },
    rateHeaderBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
    ratingSuccessBadge: { backgroundColor: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
    ratingBanner: { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0', padding: '20px 24px' },
    ratingLabel: { fontSize: '15px', fontWeight: '600', color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: '12px' },
    stars: { display: 'flex', gap: '6px', marginBottom: '14px' },
    ratingInput: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: isDark ? '1.5px solid #334155' : '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px', backgroundColor: isDark ? '#1e293b' : 'white', color: isDark ? '#f1f5f9' : '#1e293b' },
    ratingBtns: { display: 'flex', gap: '10px' },
    cancelBtn: { flex: 1, padding: '10px', backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#cbd5e1' : '#64748b', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    submitBtn: { flex: 2, padding: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    messagesBox: { height: '460px', overflowY: 'auto', padding: '24px', backgroundColor: isDark ? '#0f172a' : '#f0f4ff', display: 'flex', flexDirection: 'column', gap: '4px' },
    emptyChat: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px' },
    emptyChatIcon: { fontSize: '48px' },
    emptyChatText: { fontSize: '18px', fontWeight: '600', color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 },
    emptyChatSub: { fontSize: '14px', color: '#94a3b8', margin: 0 },
    msgSenderName: { fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600', paddingLeft: '4px' },
    inputRow: { padding: '16px 20px', display: 'flex', gap: '12px', borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0', backgroundColor: isDark ? '#1e293b' : '#ffffff', alignItems: 'center' },
    input: { flex: 1, padding: '14px 20px', borderRadius: '50px', border: isDark ? '1.5px solid #334155' : '1.5px solid #e2e8f0', fontSize: '15px', backgroundColor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#f1f5f9' : '#1e293b' },
    sendBtn: { padding: '14px 28px', background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 12px rgba(79,70,229,0.4)' },
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <div style={styles.brandIcon}>SE</div>
          <span style={styles.brandName}>SkillExchange</span>
        </div>
        <div style={styles.navLinks}>
          <button onClick={() => navigate('/requests')} style={styles.navLink}>Back to Requests</button>
          <button onClick={() => navigate('/dashboard')} style={styles.navLink}>Dashboard</button>
          <button onClick={toggleTheme} style={styles.themeBtn}>{isDark ? '🌙' : '☀️'}</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.chatWrapper}>
          <div style={styles.chatHeader}>
            <div style={styles.chatHeaderLeft}>
              <div style={styles.onlineDot}></div>
              <div>
                <h3 style={styles.chatTitle}>Skill Exchange Chat</h3>
                <p style={styles.chatSubtitle}>Room: {roomId?.slice(0, 12)}...</p>
              </div>
            </div>
            {!showRating && !ratingSuccess && (
              <button onClick={() => setShowRating(true)} style={styles.rateHeaderBtn}>Rate Exchange</button>
            )}
            {ratingSuccess && (
              <span style={styles.ratingSuccessBadge}>Rated!</span>
            )}
          </div>

          {showRating && (
            <div style={styles.ratingBanner}>
              <p style={styles.ratingLabel}>How was your exchange?</p>
              <div style={styles.stars}>
                {[1,2,3,4,5].map((star) => (
                  <span key={star} onClick={() => setRating(star)} style={{ fontSize: '32px', cursor: 'pointer', color: star <= rating ? '#f59e0b' : '#e2e8f0', transition: '0.2s' }}>★</span>
                ))}
              </div>
              <input value={comment} onChange={(e) => setComment(e.target.value)} style={styles.ratingInput} placeholder="Leave a comment (optional)..." />
              <div style={styles.ratingBtns}>
                <button onClick={() => setShowRating(false)} style={styles.cancelBtn}>Cancel</button>
                <button onClick={() => submitRating(messages.find(m => m.senderId !== user?.id)?.senderId)} style={styles.submitBtn}>Submit Rating</button>
              </div>
            </div>
          )}

          <div style={styles.messagesBox}>
            {messages.length === 0 ? (
              <div style={styles.emptyChat}>
                <div style={styles.emptyChatIcon}>💬</div>
                <p style={styles.emptyChatText}>No messages yet</p>
                <p style={styles.emptyChatSub}>Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
                    <div style={{ maxWidth: '65%' }}>
                      {!isMe && <p style={styles.msgSenderName}>{msg.sender}</p>}
                      <div style={{
                        padding: '12px 18px',
                        borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        backgroundColor: isMe ? '#3b82f6' : (isDark ? '#334155' : '#ffffff'),
                        color: isMe ? '#ffffff' : (isDark ? '#f1f5f9' : '#1e293b'),
                        boxShadow: isMe ? '0 4px 12px rgba(22,101,52,0.2)' : '0 2px 6px rgba(0,0,0,0.06)'
                      }}>
                        <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5' }}>{msg.message}</p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '10px', textAlign: 'right', color: isMe ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>
                          {msg.time || new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputRow}>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} style={styles.input} placeholder="Type a message..." />
            <button onClick={sendMessage} style={styles.sendBtn}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
