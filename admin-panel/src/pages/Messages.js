import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 120px)',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  // ── Left Sidebar ──
  sidebar: {
    width: 300,
    borderRight: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: '16px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  sidebarTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a2e' },
  searchInput: {
    padding: '8px 12px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  newChatBtn: {
    padding: '8px 12px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  conversationList: {
    flex: 1,
    overflowY: 'auto',
  },
  convItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #f5f5f5',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    transition: 'background 0.15s',
  },
  convAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#1a1a2e',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 700,
    flexShrink: 0,
  },
  convInfo: { flex: 1, minWidth: 0 },
  convName: { fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 2 },
  convPreview: {
    fontSize: 12,
    color: '#999',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  convMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  convTime: { fontSize: 11, color: '#bbb' },
  unreadBadge: {
    background: '#1a1a2e',
    color: '#fff',
    borderRadius: '50%',
    width: 18,
    height: 18,
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyConv: {
    padding: '32px 16px',
    textAlign: 'center',
    color: '#bbb',
    fontSize: 13,
  },
  // ── Chat Area ──
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  chatHeader: {
    padding: '14px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  chatHeaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#1a1a2e',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
  },
  chatHeaderName: { fontSize: 15, fontWeight: 700, color: '#1a1a2e' },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  noChatSelected: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#bbb',
    gap: 8,
  },
  noChatIcon: { fontSize: 48 },
  bubbleRow: {
    display: 'flex',
    flexDirection: 'column',
  },
  bubble: {
    maxWidth: '70%',
    padding: '10px 14px',
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  bubbleMine: {
    background: '#1a1a2e',
    color: '#fff',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  bubbleTheirs: {
    background: '#f0f0f0',
    color: '#333',
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  bubbleTime: {
    fontSize: 10,
    color: '#bbb',
    marginTop: 2,
  },
  bubbleTimeMine: { textAlign: 'right' },
  dateLabel: {
    textAlign: 'center',
    fontSize: 11,
    color: '#bbb',
    margin: '8px 0',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    padding: '12px 16px',
    borderTop: '1px solid #eee',
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
  },
  msgInput: {
    flex: 1,
    padding: '10px 14px',
    border: '1.5px solid #ddd',
    borderRadius: 20,
    fontSize: 14,
    outline: 'none',
    resize: 'none',
    maxHeight: 100,
    fontFamily: 'inherit',
    lineHeight: 1.5,
  },
  sendBtn: {
    padding: '10px 18px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  },
  // ── New Chat Modal ──
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a2e' },
  closeBtn: {
    background: 'none', border: 'none', fontSize: 22, color: '#999', cursor: 'pointer',
  },
  studentList: {
    maxHeight: 320,
    overflowY: 'auto',
  },
  studentItem: {
    padding: '12px 20px',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
    fontSize: 14,
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  studentItemAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#e3f2fd',
    color: '#1565c0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  modalSearch: {
    padding: '10px 20px',
    borderBottom: '1px solid #eee',
  },
  modalSearchInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
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

  // New chat modal
  const [showNewChat, setShowNewChat] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

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
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Messages</h1>
        <p style={{ fontSize: 14, color: '#888', marginTop: 2 }}>Chat with students</p>
      </div>

      <div style={styles.container}>
        {/* Left — Conversations */}
        <div style={styles.sidebar}>
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

        {/* Right — Chat */}
        <div style={styles.chatArea}>
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
