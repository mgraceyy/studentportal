import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import AnimatedBackground from '../components/AnimatedBackground';

function initialsFromName(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return (parts[0][0] || 'U').toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

function safeDisplayText(value) {
  const text = String(value ?? '');
  // Spacer avoids Android right-edge glyph clipping in rounded bubbles.
  return `${text} `;
}

function getPresenceFromTimestamp(timestamp) {
  const now = Date.now();
  const last = timestamp ? new Date(timestamp).getTime() : 0;
  const diffMinutes = (now - last) / (1000 * 60);

  if (!last || Number.isNaN(last)) {
    return { key: 'offline', label: 'Offline', color: '#D94B4B' };
  }
  if (diffMinutes <= 5) {
    return { key: 'online', label: 'Online', color: '#2FBF62' };
  }
  if (diffMinutes <= 30) {
    return { key: 'busy', label: 'Busy', color: '#E4B529' };
  }
  return { key: 'offline', label: 'Offline', color: '#D94B4B' };
}

function EnvelopeIcon({ size = 18, color = '#FFFFFF' }) {
  const width = size;
  const height = Math.round(size * 0.72);
  const stroke = Math.max(1, Math.round(size * 0.1));
  const innerTop = Math.max(2, Math.round(size * 0.12));
  const innerHorizontalPad = Math.max(2, Math.round(size * 0.14));

  return (
    <View style={{ width, height, position: 'relative' }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: Math.max(3, Math.round(size * 0.12)),
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: innerTop,
          left: innerHorizontalPad,
          width: width * 0.46,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke,
          transform: [{ rotate: '34deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: innerTop,
          right: innerHorizontalPad,
          width: width * 0.46,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke,
          transform: [{ rotate: '-34deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: innerHorizontalPad,
          right: innerHorizontalPad,
          bottom: Math.max(2, Math.round(size * 0.14)),
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke,
          opacity: 0.4,
        }}
      />
    </View>
  );
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState(null);
  const [thread, setThread] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [newReceiverId, setNewReceiverId] = useState('');
  const [newBody, setNewBody] = useState('');
  const [refreshingConversations, setRefreshingConversations] = useState(false);
  const [refreshingThread, setRefreshingThread] = useState(false);

  const loadConversations = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshingConversations(true);
    try {
      const { data } = await api.get('/messages');
      setConversations(data);
    } catch (_) {
    } finally {
      if (showRefresh) setRefreshingConversations(false);
      setLoading(false);
    }
  }, []);

  // Always poll conversations every 5s
  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const fetchThread = useCallback(async (partnerId, showRefresh = false) => {
    if (showRefresh) setRefreshingThread(true);
    try {
      const { data } = await api.get(`/messages/${partnerId}`);
      setThread(data);
    } catch (_) {
    } finally {
      if (showRefresh) setRefreshingThread(false);
    }
  }, []);

  // Poll thread every 5s when a conversation is open
  useEffect(() => {
    if (!activeThread) return;
    const interval = setInterval(() => fetchThread(activeThread.partnerId), 5000);
    return () => clearInterval(interval);
  }, [activeThread, fetchThread]);

  const openThread = (partnerId, partnerName, lastMessageAt) => {
    setActiveThread({ partnerId, partnerName, lastMessageAt });
    setThreadLoading(true);
    fetchThread(partnerId)
      .finally(() => setThreadLoading(false));
  };

  const handleSendReply = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { receiver_id: activeThread.partnerId, body: body.trim() });
      setBody('');
      const { data } = await api.get(`/messages/${activeThread.partnerId}`);
      setThread(data);
      loadConversations();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleSendNew = async () => {
    if (!newReceiverId.trim() || !newBody.trim()) {
      return Alert.alert('Validation', 'Please fill in both fields.');
    }
    const id = parseInt(newReceiverId, 10);
    if (isNaN(id)) return Alert.alert('Validation', 'Recipient ID must be a number.');
    setSending(true);
    try {
      await api.post('/messages', { receiver_id: id, body: newBody.trim() });
      Alert.alert('Sent', 'Message sent successfully.');
      setShowCompose(false);
      setNewReceiverId('');
      setNewBody('');
      loadConversations();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  // Thread view
  if (activeThread) {
    const threadLastActivity = thread.length > 0 ? thread[thread.length - 1]?.created_at : activeThread.lastMessageAt;
    const threadPresence = getPresenceFromTimestamp(threadLastActivity);

    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AnimatedBackground />
        <View style={styles.threadHeader}>
          <TouchableOpacity style={styles.backPill} onPress={() => { setActiveThread(null); loadConversations(); }}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <View style={styles.threadAvatar}>
            <Text style={styles.threadAvatarText}>{initialsFromName(activeThread.partnerName)}</Text>
            <View style={[styles.avatarPresenceDot, { backgroundColor: threadPresence.color }]} />
          </View>
          <View style={styles.threadTitleBlock}>
            <Text style={styles.threadTitle}>{activeThread.partnerName}</Text>
            <Text style={styles.threadStatus}>{threadPresence.label} • Pull down to refresh chat</Text>
          </View>
        </View>
        {threadLoading ? (
          <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
        ) : (
          <FlatList
            data={thread}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 10 }}
            refreshControl={<RefreshControl refreshing={refreshingThread} onRefresh={() => fetchThread(activeThread.partnerId, true)} tintColor={COLORS.primary} />}
            renderItem={({ item }) => {
              const isMine = item.sender_id !== activeThread.partnerId;
              return (
                <View style={[styles.messageBlock, isMine ? styles.myMessageBlock : styles.theirMessageBlock]}>
                  <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.bubbleText, isMine ? styles.myBubbleText : styles.theirBubbleText]}>{safeDisplayText(item.body)}</Text>
                  </View>
                  <Text style={[styles.bubbleTime, isMine && styles.myBubbleTime]}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.empty}>No messages yet. Say hello!</Text>}
          />
        )}
        <View style={styles.replyBar}>
          <View style={styles.replyInputWrap}>
            <TextInput
              style={styles.replyInput}
              placeholder="Message"
              placeholderTextColor="#7A8EA5"
              value={body}
              onChangeText={setBody}
              multiline
            />
          </View>
          <TouchableOpacity style={styles.replyBtn} onPress={handleSendReply} disabled={sending}>
            {sending ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.replyBtnText}>➤</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Compose view
  if (showCompose) {
    return (
      <View style={styles.container}>
        <AnimatedBackground />
        <View style={styles.threadHeader}>
          <TouchableOpacity style={styles.backPill} onPress={() => { setShowCompose(false); setNewReceiverId(''); setNewBody(''); }}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <View style={styles.threadAvatar}>
            <EnvelopeIcon size={15} color="#FFFFFF" />
          </View>
          <View style={styles.threadTitleBlock}>
            <Text style={styles.threadTitle}>Compose Message</Text>
            <Text style={styles.threadStatus}>Start a new conversation</Text>
          </View>
        </View>
        <View style={styles.composeCard}>
          <Text style={styles.composeLabel}>Recipient User ID</Text>
          <TextInput style={styles.input} placeholder="e.g. 12" value={newReceiverId} onChangeText={setNewReceiverId} keyboardType="numeric" />
          <Text style={styles.composeLabel}>Message</Text>
          <TextInput style={[styles.input, styles.composeInput]} placeholder="Write your message..." value={newBody} onChangeText={setNewBody} multiline textAlignVertical="top" />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendNew} disabled={sending}>
            {sending ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.sendBtnText}>Send Message</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Messages</Text>
        <Text style={styles.pageSubtitle}>Stay connected with your classmates, advisers, and campus updates.</Text>
      </View>
      <FlatList
        data={conversations}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={<RefreshControl refreshing={refreshingConversations} onRefresh={() => loadConversations(true)} tintColor={COLORS.primary} />}
        keyExtractor={(item) => item.partner_id.toString()}
        renderItem={({ item }) => {
          const presence = getPresenceFromTimestamp(item.last_message_at);

          return (
          <TouchableOpacity style={styles.card} onPress={() => openThread(item.partner_id, item.partner_name, item.last_message_at)}>
            <View style={styles.listAvatar}>
              <Text style={styles.listAvatarText}>{initialsFromName(item.partner_name)}</Text>
              <View style={[styles.avatarPresenceDot, { backgroundColor: presence.color }]} />
            </View>
            <View style={styles.messageHeaderRow}>
              <Text style={styles.sender} numberOfLines={1}>{item.partner_name}</Text>
              <Text style={styles.time}>{new Date(item.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <Text style={styles.preview}>{safeDisplayText(item.last_message)}</Text>
            <View style={styles.cardMetaRow}>
              <Text style={styles.metaTag}>Conversation</Text>
              {item.unread_count > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{item.unread_count > 99 ? '99+' : item.unread_count}</Text>
                </View>
              ) : (
                <Text style={styles.openHint}>Open</Text>
              )}
            </View>
          </TouchableOpacity>
        );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet.</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowCompose(true)} activeOpacity={0.9}>
        <View style={styles.fabInner}>
        <EnvelopeIcon size={22} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF1F8' },
  pageHeader: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#113454', letterSpacing: 0.2 },
  pageSubtitle: { marginTop: 4, fontSize: 13, color: '#57708A', lineHeight: 18 },
  threadHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#113454', paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: '#2D5578' },
  backPill: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF1F', alignItems: 'center', justifyContent: 'center' },
  backBtn: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginTop: -1 },
  threadAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF2B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFFFFF3A', position: 'relative' },
  threadTitleBlock: { flex: 1 },
  threadTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  threadStatus: { color: '#D2E3F5', fontSize: 11, marginTop: 2 },
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingLeft: 60,
    paddingRight: 14,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D4E0EC',
    shadowColor: '#0F2233',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  listAvatar: { position: 'absolute', left: 14, top: 14, width: 36, height: 36, borderRadius: 18, backgroundColor: '#DEECFA', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C9DDF1' },
  listAvatarText: { color: '#1D486F', fontSize: 12, fontWeight: '800' },
  avatarPresenceDot: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 5.5,
    right: -1,
    bottom: -1,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  messageHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sender: { flex: 1, marginRight: 8, fontSize: 16, fontWeight: '700', color: '#1A395A' },
  preview: {
    fontSize: 13,
    color: '#607489',
    marginTop: 4,
    lineHeight: 19,
    flexShrink: 1,
    paddingRight: 8,
  },
  time: { fontSize: 11, color: '#6B8095', fontWeight: '600' },
  cardMetaRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaTag: { fontSize: 10, color: '#65809A', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' },
  openHint: { fontSize: 11, color: '#4B6783', fontWeight: '700' },
  unreadBadge: { backgroundColor: '#D43838', borderRadius: 10, minWidth: 22, height: 22, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  unreadBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textLight },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#113454',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0A2034',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C4A73',
    borderWidth: 1,
    borderColor: '#2C608E',
  },
  messageBlock: { maxWidth: '84%', marginBottom: 8 },
  myMessageBlock: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirMessageBlock: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 18,
    overflow: 'visible',
  },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#1A5EA2', borderBottomRightRadius: 6 },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D9E3EE', borderBottomLeftRadius: 6 },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
    includeFontPadding: true,
    textAlignVertical: 'auto',
    paddingRight: 6,
  },
  myBubbleText: { color: COLORS.white },
  theirBubbleText: { color: '#2E4861' },
  bubbleTime: { fontSize: 10, color: '#8FA1B5', marginTop: 4, textAlign: 'left' },
  myBubbleTime: { color: '#C8D9EA' },
  replyBar: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: COLORS.white, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#D6E0EA' },
  replyInputWrap: { flex: 1, backgroundColor: '#F4F8FC', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 2, marginRight: 8, borderWidth: 1, borderColor: '#D2DFEC' },
  replyInput: { fontSize: 14, maxHeight: 100, color: '#2E4861' },
  replyBtn: { width: 42, height: 42, backgroundColor: '#1C4F7D', borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  replyBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14, marginLeft: 1 },
  composeCard: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D4E0EC',
    shadowColor: '#0E2234',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  composeLabel: { fontSize: 12, fontWeight: '700', color: '#3E5872', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F5F9FD', padding: 14, borderRadius: 12, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#D1DFEC', color: '#2E4861' },
  composeInput: { minHeight: 130 },
  sendBtn: { backgroundColor: '#113454', padding: 14, borderRadius: 12, alignItems: 'center' },
  sendBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});
