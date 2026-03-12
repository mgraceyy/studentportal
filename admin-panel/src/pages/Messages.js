import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 120px)',
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  // ── Left Sidebar ──
  sidebar: {
    width: 300, borderRight: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', flexShrink: 0,
    background: '#fff',
  },
  sidebarHeader: {
    padding: '14px 16px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  sidebarTitle: { fontSize: 15, fontWeight: 700, color: '#0f172a' },
  searchInput: {
    padding: '8px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 13, outline: 'none',
    width: '100%', boxSizing: 'border-box', color: '#0f172a',
  },
  newChatBtn: {
    padding: '8px 12px', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13,
    fontWeight: 600, cursor: 'pointer', width: '100%',
  },
  conversationList: { flex: 1, overflowY: 'auto' },
  convItem: {
    padding: '11px 16px', borderBottom: '1px solid #f8fafc',
    cursor: 'pointer', display: 'flex', alignItems: 'flex-start',
    gap: 10, transition: 'background 0.12s',
  },
  convAvatar: {
    width: 38, height: 38, borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 13.5, fontWeight: 700, flexShrink: 0,
  },
  convInfo: { flex: 1, minWidth: 0 },
  convName: { fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginBottom: 2 },
  convPreview: {
    fontSize: 12, color: '#94a3b8', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  convMeta: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'flex-end', gap: 4, flexShrink: 0,
  },
  convTime: { fontSize: 11, color: '#94a3b8' },
  unreadBadge: {
    background: '#2563eb', color: '#fff', borderRadius: '50%',
    width: 18, height: 18, fontSize: 10, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyConv: {
    padding: '32px 16px', textAlign: 'center',
    color: '#94a3b8', fontSize: 13,
  },
  // ── Chat Area ──
  chatArea: {
    flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
    background: '#f8fafc',
  },
  chatHeader: {
    padding: '13px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#fff',
  },
  chatHeaderAvatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 13, fontWeight: 700,
  },
  chatHeaderName: { fontSize: 14.5, fontWeight: 700, color: '#0f172a' },
  messages: {
    flex: 1, overflowY: 'auto', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  noChatSelected: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    color: '#94a3b8', gap: 10,
  },
  noChatIcon: { fontSize: 44, opacity: 0.5 },
  bubbleRow: { display: 'flex', flexDirection: 'column' },
  bubble: {
    maxWidth: '70%', padding: '10px 14px', borderRadius: 16,
    fontSize: 13.5, lineHeight: 1.55, wordBreak: 'break-word',
  },
  bubbleMine: {
    background: '#2563eb', color: '#fff',
    borderBottomRightRadius: 4, alignSelf: 'flex-end',
  },
  bubbleTheirs: {
    background: '#fff', color: '#0f172a',
    borderBottomLeftRadius: 4, alignSelf: 'flex-start',
    border: '1px solid #e2e8f0',
  },
  bubbleTime: { fontSize: 10, color: '#94a3b8', marginTop: 3 },
  bubbleTimeMine: { textAlign: 'right' },
  dateLabel: {
    textAlign: 'center', fontSize: 11, color: '#94a3b8', margin: '8px 0',
    fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  inputRow: {
    padding: '12px 16px', borderTop: '1px solid #e2e8f0',
    display: 'flex', gap: 8, alignItems: 'flex-end', background: '#fff',
  },
  msgInput: {
    flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 20, fontSize: 13.5, outline: 'none',
    resize: 'none', maxHeight: 100, fontFamily: 'inherit',
    lineHeight: 1.5, color: '#0f172a', background: '#fff',
  },
  sendBtn: {
    padding: '10px 18px', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: 20, fontSize: 13.5,
    fontWeight: 600, cursor: 'pointer', flexShrink: 0,
  },
  // ── New Chat Modal ──
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#fff', borderRadius: 14, width: '100%', maxWidth: 420,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#0f172a' },
  closeBtn: {
    background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
    width: 30, height: 30, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', fontSize: 17,
  },
  studentList: { maxHeight: 320, overflowY: 'auto' },
  studentItem: {
    padding: '11px 20px', cursor: 'pointer', borderBottom: '1px solid #f8fafc',
    fontSize: 13.5, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10,
    transition: 'background 0.12s',
  },
  studentItemAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: '#eff6ff', color: '#2563eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, flexShrink: 0,
  },
  modalSearch: { padding: '10px 20px', borderBottom: '1px solid #e2e8f0' },
  modalSearchInput: {
    width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 13, outline: 'none',
    boxSizing: 'border-box', color: '#0f172a',
  },
};

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getAdminId() {
  const stored = localStorage.getItem('admin_id');
  if (stored) return parseInt(stored);
  // Fallback: decode from JWT token
  const token = localStorage.getItem('token');
  if (token) {
    try {
      return JSON.parse(atob(token.split('.')[1])).id;
    } catch (e) {}
  }
  return 0;
}

function Messages() {
  const adminId = getAdminId();

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null); // { id, name }
  const [thread, setThread] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [convSearch, setConvSearch] = useState('');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // New chat modal
  const [showNewChat, setShowNewChat] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/messages');
      setConversations(data);
    } catch (err) {
      console.error('fetchConversations error:', err.response?.data || err.message);
    }
  }, []);

  const fetchThread = useCallback(async (partnerId) => {
    try {
      const { data } = await api.get(`/messages/${partnerId}`);
      setThread(data);
    } catch (err) { /* silent */ }
  }, []);

  // Always poll conversations every 5s (for unread badges + new messages)
  useEffect(() => {
    fetchConversations();
    const convInterval = setInterval(fetchConversations, 5000);
    return () => clearInterval(convInterval);
  }, [fetchConversations]);

  // Poll thread every 5s when a conversation is open
  useEffect(() => {
    if (!activePartner) return;
    fetchThread(activePartner.id);
    pollingRef.current = setInterval(() => {
      fetchThread(activePartner.id);
    }, 5000);
    return () => clearInterval(pollingRef.current);
  }, [activePartner, fetchThread]);

  // Scroll to bottom when thread updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const selectConversation = (conv) => {
    setActivePartner({ id: conv.partner_id, name: conv.partner_name });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activePartner) return;

    const body = messageText.trim();

    // Optimistic update — show message instantly
    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender_id: adminId,
      receiver_id: activePartner.id,
      body,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setThread((prev) => [...prev, tempMsg]);
    setMessageText('');

    // Optimistically update conversation list
    setConversations((prev) => {
      const entry = {
        partner_id: activePartner.id,
        partner_name: activePartner.name,
        last_message: body,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      };
      return [entry, ...prev.filter((c) => c.partner_id !== activePartner.id)];
    });

    setSending(true);
    try {
      await api.post('/messages', { receiver_id: activePartner.id, body });
      await fetchThread(activePartner.id);
      await fetchConversations();
    } catch (err) {
      console.error('send error:', err.response?.data || err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // New chat
  const openNewChat = async () => {
    setStudentSearch('');
    try {
      const { data } = await api.get('/admin/students');
      setAllStudents(data.filter((s) => s.status !== 'deactivated'));
    } catch (err) { /* silent */ }
    setShowNewChat(true);
  };

  const startChat = (student) => {
    setActivePartner({ id: student.id, name: `${student.first_name} ${student.last_name}` });
    setShowNewChat(false);
    setThread([]);
  };

  // Group thread messages by date
  const groupedMessages = [];
  let lastDate = null;
  for (const msg of thread) {
    const dateLabel = formatDateLabel(msg.created_at);
    if (dateLabel !== lastDate) {
      groupedMessages.push({ type: 'date', label: dateLabel });
      lastDate = dateLabel;
    }
    groupedMessages.push({ type: 'message', ...msg });
  }

  const filteredConversations = conversations.filter((c) =>
    !convSearch || c.partner_name.toLowerCase().includes(convSearch.toLowerCase())
  );

  const filteredStudents = allStudents.filter((s) => {
    const q = studentSearch.toLowerCase();
    return !q || s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.student_number.toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>Messages</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Chat with students</p>
      </div>

      <div style={{
        ...styles.container,
        height: isMobile ? 'calc(100vh - 140px)' : styles.container.height,
      }}>
        {/* Left — Conversations (hidden on mobile when chat is open) */}
        <div style={{
          ...styles.sidebar,
          display: isMobile && activePartner ? 'none' : 'flex',
          width: isMobile ? '100%' : styles.sidebar.width,
          borderRight: isMobile && !activePartner ? 'none' : styles.sidebar.borderRight,
        }}>
          <div style={styles.sidebarHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={styles.sidebarTitle}>Conversations</span>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              style={styles.searchInput}
            />
            <button style={styles.newChatBtn} onClick={openNewChat}>+ New Message</button>
          </div>

          <div style={styles.conversationList}>
            {filteredConversations.length === 0 ? (
              <div style={styles.emptyConv}>
                {conversations.length === 0
                  ? 'No conversations yet.\nClick "+ New Message" to start.'
                  : 'No results found.'}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activePartner?.id === conv.partner_id;
                return (
                  <div
                    key={conv.partner_id}
                    style={{
                      ...styles.convItem,
                      background: isActive ? '#f0f4ff' : 'transparent',
                    }}
                    onClick={() => selectConversation(conv)}
                  >
                    <div style={styles.convAvatar}>
                      {getInitials(conv.partner_name)}
                    </div>
                    <div style={styles.convInfo}>
                      <div style={styles.convName}>{conv.partner_name}</div>
                      <div style={styles.convPreview}>{conv.last_message}</div>
                    </div>
                    <div style={styles.convMeta}>
                      <span style={styles.convTime}>
                        {formatTime(conv.last_message_at)}
                      </span>
                      {parseInt(conv.unread_count) > 0 && (
                        <span style={styles.unreadBadge}>{conv.unread_count}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right — Chat (hidden on mobile when no conversation selected) */}
        <div style={{
          ...styles.chatArea,
          display: isMobile && !activePartner ? 'none' : 'flex',
          width: isMobile ? '100%' : undefined,
        }}>
          {!activePartner ? (
            <div style={styles.noChatSelected}>
              <span style={styles.noChatIcon}>💬</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#bbb' }}>Select a conversation</span>
              <span style={{ fontSize: 13, color: '#ccc' }}>or start a new one</span>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={styles.chatHeader}>
                {isMobile && (
                  <button
                    onClick={() => setActivePartner(null)}
                    style={{
                      background: 'none', border: 'none', color: '#2563eb',
                      fontSize: 22, cursor: 'pointer', padding: '0 8px 0 0',
                      lineHeight: 1, display: 'flex', alignItems: 'center',
                    }}
                  >‹</button>
                )}
                <div style={styles.chatHeaderAvatar}>
                  {getInitials(activePartner.name)}
                </div>
                <div style={styles.chatHeaderName}>{activePartner.name}</div>
              </div>

              {/* Messages */}
              <div style={styles.messages}>
                {thread.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#ccc', fontSize: 13, marginTop: 40 }}>
                    No messages yet. Say hello!
                  </div>
                )}
                {groupedMessages.map((item, i) => {
                  if (item.type === 'date') {
                    return <div key={`date-${i}`} style={styles.dateLabel}>{item.label}</div>;
                  }
                  const isMine = item.sender_id === adminId;
                  return (
                    <div key={item.id} style={styles.bubbleRow}>
                      <div style={{ ...styles.bubble, ...(isMine ? styles.bubbleMine : styles.bubbleTheirs) }}>
                        {item.body}
                      </div>
                      <span style={{ ...styles.bubbleTime, ...(isMine ? styles.bubbleTimeMine : {}) }}>
                        {formatTime(item.created_at)}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form style={styles.inputRow} onSubmit={handleSend}>
                <textarea
                  style={styles.msgInput}
                  placeholder="Type a message... (Enter to send)"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  type="submit"
                  style={{ ...styles.sendBtn, opacity: sending || !messageText.trim() ? 0.6 : 1 }}
                  disabled={sending || !messageText.trim()}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div style={styles.overlay} onClick={() => setShowNewChat(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>New Message</span>
              <button style={styles.closeBtn} onClick={() => setShowNewChat(false)}>&times;</button>
            </div>
            <div style={styles.modalSearch}>
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={styles.modalSearchInput}
                autoFocus
              />
            </div>
            <div style={styles.studentList}>
              {filteredStudents.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#bbb', fontSize: 13 }}>
                  No students found.
                </div>
              ) : (
                filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    style={styles.studentItem}
                    onClick={() => startChat(s)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={styles.studentItemAvatar}>
                      {getInitials(`${s.first_name} ${s.last_name}`)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.last_name}, {s.first_name}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{s.student_number} · {s.course}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
