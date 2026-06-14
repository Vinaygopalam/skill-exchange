import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import API_BASE_URL from '../config';
import EmojiPicker from 'emoji-picker-react';
import UserProfileModal from '../components/UserProfileModal';

const socket = io(API_BASE_URL);

function Chat() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState('');
  const [exchangeCompleted, setExchangeCompleted] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [otherUserOnline, setOtherUserOnline] = useState('offline');
  const [otherUserLastSeen, setOtherUserLastSeen] = useState(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isFocusedRef = useRef(true);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const { isDark, toggleTheme } = useTheme();

  const quickReplies = [
    'Sounds good!',
    'Thanks for the update!',
    'Can we chat later?',
    'I have the files ready.'
  ];

  const getMessagePreview = (data) => {
    if (data?.attachments?.length) {
      return `${data.attachments.length} attachment${data.attachments.length > 1 ? 's' : ''}`;
    }
    return (data?.message || '').trim() || 'Sent a message';
  };

  const markRoomMessagesRead = useCallback(async (loadedMessages) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      if (!storedUser?.id || !token) return;

      const unreadIds = loadedMessages
        .filter((msg) => msg.senderId !== storedUser.id && msg.status !== 'read')
        .map((msg) => msg._id);

      if (!unreadIds.length) return;

      const res = await axios.put(`${API_BASE_URL}/api/messages/read/${roomId}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.updatedIds?.length) {
        setMessages((prev) => prev.map((msg) => (
          res.data.updatedIds.includes(msg._id) ? { ...msg, status: 'read' } : msg
        )));
        res.data.updatedIds.forEach((messageId) => {
          socket.emit('message_read', {
            roomId,
            messageId,
            senderId: storedUser.id,
            senderName: storedUser.name
          });
        });
      }
    } catch (err) {
      console.log(err);
    }
  }, [roomId]);

  const fetchRequestDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await axios.get(`${API_BASE_URL}/api/requests/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequestDetails(res.data);
      setExchangeCompleted(res.data.status === 'completed');
      if (res.data.fromUser && res.data.toUser) {
        const otherId = res.data.fromUser._id === storedUser.id ? res.data.toUser._id : res.data.fromUser._id;
        setOtherUserId(otherId);
        socket.emit('get_user_status', otherId, (status) => {
          setOtherUserOnline(status.onlineStatus);
          setOtherUserLastSeen(status.lastSeen);
        });
      }
    } catch (err) {
      console.log(err);
    }
  }, [roomId]);

  const loadMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/messages/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      await markRoomMessagesRead(res.data);
    } catch (err) { console.log(err); }
  }, [markRoomMessagesRead, roomId]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    socket.emit('register_user', parsedUser.id);
    socket.emit('join_room', roomId);
    loadMessages();
    fetchRequestDetails();
    
    if (otherUserId) {
      socket.emit('get_user_status', otherUserId, (status) => {
        setOtherUserOnline(status.onlineStatus);
        setOtherUserLastSeen(status.lastSeen);
      });
    }
  }, [fetchRequestDetails, loadMessages, navigate, otherUserId, roomId]);

  useEffect(() => {
    const handleFocus = () => {
      isFocusedRef.current = true;
    };
    const handleBlur = () => {
      isFocusedRef.current = false;
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
      if (data.senderId !== user?.id) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser?.id) {
          socket.emit('message_delivered', { roomId, messageId: data._id, senderId: storedUser.id, senderName: storedUser.name });
          socket.emit('message_read', { roomId, messageId: data._id, senderId: storedUser.id, senderName: storedUser.name });
        }
        if (!isFocusedRef.current && Notification.permission === 'granted') {
          const preview = getMessagePreview(data);
          new Notification(`New message from ${data.sender}`, {
            body: preview.length > 50 ? preview.substring(0, 50) + '...' : preview,
            icon: '/favicon.ico'
          });
        }
      }
    });

    socket.on('user_status', (data) => {
      if (data.userId === otherUserId) {
        setOtherUserOnline(data.onlineStatus);
        setOtherUserLastSeen(data.lastSeen);
      }
    });

    socket.on('typing', (data) => {
      if (data.senderId !== user?.id) {
        setIsOtherTyping(true);
        setTypingUserName(data.senderName || 'They');
      }
    });

    socket.on('stop_typing', (data) => {
      if (data.senderId !== user?.id) {
        setIsOtherTyping(false);
      }
    });

    socket.on('message_delivered', (data) => {
      setMessages((prev) => prev.map((msg) => msg._id === data.messageId ? { ...msg, status: 'delivered' } : msg));
    });

    socket.on('message_read', (data) => {
      setMessages((prev) => prev.map((msg) => msg._id === data.messageId ? { ...msg, status: 'read' } : msg));
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_status');
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('message_delivered');
      socket.off('message_read');
    };
  }, [user, roomId, otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const convertedFiles = await Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
        data: reader.result,
        type: file.type || 'file'
      });
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    })));

    setAttachedFiles((prev) => [...prev, ...convertedFiles]);
    event.target.value = '';
  };

  const handleQuickReply = (reply) => {
    setMessage(reply);
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    const hasAttachments = attachedFiles.length > 0;

    if (!trimmedMessage && !hasAttachments) return;

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const contentPreview = trimmedMessage || `Sent ${attachedFiles.length} attachment${attachedFiles.length > 1 ? 's' : ''}`;
    const msgData = {
      roomId,
      message: trimmedMessage || contentPreview,
      sender: storedUser?.name,
      senderId: storedUser?.id,
      attachments: attachedFiles,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    stopTyping();

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/messages`, msgData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const savedMessage = { ...res.data, sender: storedUser?.name, senderId: storedUser?.id, time: msgData.time };
      socket.emit('send_message', savedMessage);
      setMessages((prev) => [...prev, savedMessage]);
    } catch (err) {
      // Surface server-side failure (common with large file payloads)
      console.log('sendMessage error:', err?.response?.status, err?.response?.data || err?.message);
      alert(`Failed to send: ${err?.response?.status || ''} ${err?.response?.data?.message || err?.message || ''}`);
    }

    setMessage('');
    setAttachedFiles([]);
    setShowEmojiPicker(false);
  };

  const deleteMessage = async (msgId, index) => {
    try {
      const token = localStorage.getItem('token');
      if (msgId) {
        await axios.delete(`${API_BASE_URL}/api/messages/${msgId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setMessages((prev) => prev.filter((_, i) => i !== index));
      setHoveredMsg(null);
    } catch (err) {
      console.log(err);
    }
  };

  const stopTyping = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (isTypingRef.current && storedUser?.id) {
      socket.emit('stop_typing', { roomId, senderId: storedUser.id, senderName: storedUser.name });
      isTypingRef.current = false;
    }
    clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (e) => {
    const nextMessage = e.target.value;
    setMessage(nextMessage);
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!storedUser?.id) return;
    if (!isTypingRef.current) {
      socket.emit('typing', { roomId, senderId: storedUser.id, senderName: storedUser.name });
      isTypingRef.current = true;
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { roomId, senderId: storedUser.id, senderName: storedUser.name });
      isTypingRef.current = false;
    }, 1200);
  };

  const onEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const markExchangeComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE_URL}/api/requests/${roomId}`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExchangeCompleted(true);
      setShowRating(true);
      setRequestDetails((prev) => prev ? { ...prev, status: res.data.request?.status || 'completed' } : prev);
    } catch (err) {
      console.log(err);
      alert('Failed to mark exchange complete');
    }
  };

  const submitReview = async (toUserId) => {
    const targetUserId = toUserId || otherUserId;
    if (!targetUserId) {
      alert('Unable to determine who to review. Please try again.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/reviews`,
        { toUser: targetUserId, requestId: roomId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRatingSuccess('Review submitted! Thank you!');
      setShowRating(false);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

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
    onlineDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: otherUserOnline === 'online' ? '#22c55e' : '#64748b', boxShadow: otherUserOnline === 'online' ? '0 0 0 3px rgba(34,197,94,0.3)' : 'none' },
    onlineStatusText: { fontSize: '12px', color: '#cbd5e1', marginLeft: '6px' },
    chatTitle: { color: 'white', margin: 0, fontSize: '18px', fontWeight: '700' },
    chatSubtitle: { color: 'rgba(255,255,255,0.5)', margin: '2px 0 0 0', fontSize: '12px' },
    typingIndicator: { fontSize: '13px', color: '#cbd5e1', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' },
    typingDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'typingPulse 1.2s infinite ease-in-out' },
    readReceipt: { marginTop: '6px', textAlign: 'right', fontSize: '11px', color: '#94a3b8' },
    quickReplyBar: { display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '12px 20px 0', backgroundColor: isDark ? '#1e293b' : '#ffffff', borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0' },
    quickReplyChip: { padding: '8px 12px', borderRadius: '999px', border: isDark ? '1px solid #475569' : '1px solid #cbd5e1', backgroundColor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#f1f5f9' : '#1e293b', fontSize: '12px', cursor: 'pointer' },
    attachmentPreviewBar: { display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '12px 20px', backgroundColor: isDark ? '#1e293b' : '#ffffff', borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0' },
    attachmentChip: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '999px', backgroundColor: isDark ? '#0f172a' : '#f1f5f9', color: isDark ? '#f8fafc' : '#1e293b', border: isDark ? '1px solid #334155' : '1px solid #d0d7e3' },
    attachmentRemoveBtn: { border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', lineHeight: 1, color: 'inherit' },
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
    input: { flex: 1, padding: '14px 20px', borderRadius: '50px', border: isDark ? '1.5px solid #334155' : '1.5px solid #e2e8f0', fontSize: '15px', backgroundColor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#f1f5f9' : '#1e293b', outline: 'none' },
    sendBtn: { padding: '14px 28px', background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 12px rgba(79,70,229,0.4)' },
    emojiBtn: { background: 'none', border: 'none', fontSize: '26px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
    attachBtn: { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
    deleteBtn: { background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontSize: '13px', padding: '3px 7px', marginLeft: '6px', transition: '0.2s', alignSelf: 'center' },
    headerActions: { display: 'flex', alignItems: 'center', gap: '10px' }
  };

  return (
    <div style={styles.page}>
      {selectedUserProfile && (
        <UserProfileModal userId={selectedUserProfile} onClose={() => setSelectedUserProfile(null)} />
      )}
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

          {/* Header */}
          <div style={styles.chatHeader}>
            <div style={{...styles.chatHeaderLeft, cursor: 'pointer' }} onClick={() => {
              if (otherUserId) {
                setSelectedUserProfile(otherUserId);
              } else {
                const otherUser = messages.find(m => m.senderId !== user?.id);
                if (otherUser) setSelectedUserProfile(otherUser.senderId);
              }
            }}>
              <div style={styles.onlineDot}></div>
              <div>
                <h3 style={styles.chatTitle}>Skill Exchange Chat</h3>
                <p style={styles.chatSubtitle}>
                  {otherUserOnline === 'online' ? (
                    <span style={{ color: '#86efac' }}>🟢 Online</span>
) : otherUserLastSeen ? (
                     <span style={{ color: '#94a3b8' }}>
                       ⚫ Last seen {(() => {
                         const lastSeenDate = new Date(otherUserLastSeen);
                         const today = new Date();
                         const isToday = lastSeenDate.toDateString() === today.toDateString();
                         return isToday
                           ? lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                           : lastSeenDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                       })()}
                     </span>
                   ) : (
                    <span style={{ color: '#94a3b8' }}>⚫ Offline</span>
                  )}
                </p>
              </div>
            </div>
            <div style={styles.headerActions}>
              {!exchangeCompleted && !showRating && !ratingSuccess && (
                <button onClick={markExchangeComplete} style={styles.rateHeaderBtn}>✓ Mark Complete</button>
              )}
              {exchangeCompleted && !showRating && !ratingSuccess && (
                <button onClick={() => setShowRating(true)} style={styles.rateHeaderBtn}>⭐ Leave Review</button>
              )}
              {ratingSuccess && (
                <span style={styles.ratingSuccessBadge}>✓ Review submitted!</span>
              )}
            </div>
          </div>

          {isOtherTyping && (
            <div style={styles.typingIndicator}>
              <span style={styles.typingDot}></span>
              {typingUserName || 'They'} is typing...
            </div>
          )}

          {/* Rating Banner */}
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
                <button onClick={() => submitReview()} style={styles.submitBtn}>Submit Review</button>
              </div>
            </div>
          )}

          {/* Messages */}
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
                const statusLabel = msg.status === 'sent' ? 'Sent' : msg.status === 'delivered' ? 'Delivered' : 'Seen';
                const statusIcon = msg.status === 'sent' ? '✓' : msg.status === 'delivered' ? '✓✓' : '✓✓✓';
                return (
                  <div
                    key={msg._id || index}
                    onMouseEnter={() => setHoveredMsg(index)}
                    onMouseLeave={() => setHoveredMsg(null)}
                    style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '8px', alignItems: 'flex-end' }}
                  >
                    {isMe && hoveredMsg === index && (
                      <button
                        onClick={() => deleteMessage(msg._id, index)}
                        style={styles.deleteBtn}
                        title="Delete message"
                      >
                        🗑️
                      </button>
                    )}

                    <div style={{ maxWidth: '68%' }}>
                      {!isMe && <p style={styles.msgSenderName}>{msg.sender}</p>}
                      <div style={{
                        padding: '12px 18px',
                        borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        backgroundColor: isMe ? '#3b82f6' : (isDark ? '#334155' : '#ffffff'),
                        color: isMe ? '#ffffff' : (isDark ? '#f1f5f9' : '#1e293b'),
                        boxShadow: isMe ? '0 4px 12px rgba(22,101,52,0.2)' : '0 2px 6px rgba(0,0,0,0.06)'
                      }}>
                        {msg.message && <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5' }}>{msg.message}</p>}
{Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: msg.message ? '10px' : 0 }}>
                             {msg.attachments.map((attachment, attachmentIndex) => (
                               <div key={`${attachment.fileName}-${attachmentIndex}`} style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(148,163,184,0.16)', border: isMe ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(148,163,184,0.28)' }}>
                                 {attachment.contentType?.startsWith('image/') ? (
                                   <img src={attachment.data} alt={attachment.fileName} style={{ display: 'block', maxWidth: '240px', width: '100%' }} />
                                 ) : (
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px' }}>
                                     <span style={{ fontSize: '18px' }}>📎</span>
                                     <button
                                       onClick={() => {
                                         const link = document.createElement('a');
                                         link.href = attachment.data;
                                         link.download = attachment.fileName || 'download';
                                         document.body.appendChild(link);
                                         link.click();
                                         document.body.removeChild(link);
                                       }}
                                       style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: 0, textDecoration: 'underline' }}
                                     >
                                       {attachment.fileName}
                                     </button>
                                   </div>
                                 )}
                               </div>
                             ))}
                           </div>
                         )}
                        <p style={{ margin: '6px 0 0 0', fontSize: '10px', textAlign: 'right', color: isMe ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>
                          {msg.time || new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {isMe && msg.status && (
                        <p style={{ ...styles.readReceipt, color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>
                          {`${statusIcon} ${statusLabel}`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.quickReplyBar}>
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => handleQuickReply(reply)}
                style={styles.quickReplyChip}
              >
                {reply}
              </button>
            ))}
          </div>

          {attachedFiles.length > 0 && (
            <div style={styles.attachmentPreviewBar}>
              {attachedFiles.map((file, index) => (
                <div key={`${file.fileName}-${index}`} style={styles.attachmentChip}>
                  <span style={{ fontSize: '16px' }}>{file.contentType?.startsWith('image/') ? '🖼️' : '📎'}</span>
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>{file.fileName}</span>
                  <button
                    onClick={() => setAttachedFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                    style={styles.attachmentRemoveBtn}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Row with Emoji Picker */}
          <div style={{ position: 'relative' }} ref={emojiPickerRef}>

            {/* 😊 Emoji Picker Popup */}
            {showEmojiPicker && (
              <div style={{ position: 'absolute', bottom: '70px', left: '20px', zIndex: 1000 }}>
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={isDark ? 'dark' : 'light'}
                  height={400}
                  width={320}
                  searchPlaceholder="Search emoji..."
                />
              </div>
            )}

            <div style={styles.inputRow}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={styles.emojiBtn}
                title="Pick an emoji"
              >
                {showEmojiPicker ? '😄' : '😊'}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                style={styles.attachBtn}
                title="Attach a file"
              >
                📎
              </button>

              <input
                type="text"
                value={message}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                style={styles.input}
                placeholder="Type a message or attach a file..."
              />

              <button onClick={sendMessage} style={styles.sendBtn}>Send</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Chat;
