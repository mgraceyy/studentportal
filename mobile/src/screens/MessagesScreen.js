import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

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

  const loadConversations = useCallback(() => {
    api.get('/messages')
      .then(({ data }) => { setConversations(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Always poll conversations every 5s
  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const fetchThread = useCallback((partnerId) => {
    api.get(`/messages/${partnerId}`)
      .then(({ data }) => setThread(data))
      .catch(() => {});
  }, []);

  // Poll thread every 5s when a conversation is open
  useEffect(() => {
    if (!activeThread) return;
    const interval = setInterval(() => fetchThread(activeThread.partnerId), 5000);
    return () => clearInterval(interval);
  }, [activeThread, fetchThread]);

  const openThread = (partnerId, partnerName) => {
    setActiveThread({ partnerId, partnerName });
    setThreadLoading(true);
    api.get(`/messages/${partnerId}`)
      .then(({ data }) => setThread(data))
      .catch(() => {})
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
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.threadHeader}>
          <TouchableOpacity onPress={() => { setActiveThread(null); loadConversations(); }}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.threadTitle}>{activeThread.partnerName}</Text>
        </View>
        {threadLoading ? (
          <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
        ) : (
          <FlatList
            data={thread}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => {
              const isMine = item.sender_id !== activeThread.partnerId;
              return (
                <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                  <Text style={[styles.bubbleText, isMine ? styles.myBubbleText : styles.theirBubbleText]}>{item.body}</Text>
                  <Text style={styles.bubbleTime}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.empty}>No messages yet. Say hello!</Text>}
          />
        )}
        <View style={styles.replyBar}>
          <TextInput
            style={styles.replyInput}
            placeholder="Type a message..."
            value={body}
            onChangeText={setBody}
            multiline
          />
          <TouchableOpacity style={styles.replyBtn} onPress={handleSendReply} disabled={sending}>
            {sending ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.replyBtnText}>Send</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Compose view
  if (showCompose) {
    return (
      <View style={styles.container}>
        <View style={styles.threadHeader}>
          <TouchableOpacity onPress={() => { setShowCompose(false); setNewReceiverId(''); setNewBody(''); }}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.threadTitle}>New Message</Text>
        </View>
        <View style={{ padding: 20 }}>
          <TextInput style={styles.input} placeholder="Recipient User ID" value={newReceiverId} onChangeText={setNewReceiverId} keyboardType="numeric" />
          <TextInput style={[styles.input, { height: 120 }]} placeholder="Type your message..." value={newBody} onChangeText={setNewBody} multiline textAlignVertical="top" />
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
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.partner_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openThread(item.partner_id, item.partner_name)}>
            <View style={styles.messageHeader}>
              <Text style={styles.sender}>{item.partner_name}</Text>
              <Text style={styles.time}>{new Date(item.last_message_at).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.preview} numberOfLines={1}>{item.last_message}</Text>
            {item.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet.</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowCompose(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  threadHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, padding: 16, gap: 12 },
  backBtn: { color: COLORS.white, fontSize: 16 },
  threadTitle: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 8, marginHorizontal: 16, marginTop: 12, position: 'relative' },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sender: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  preview: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
  time: { fontSize: 11, color: COLORS.textLight },
  unreadBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.secondary, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  unreadBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textLight },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabText: { fontSize: 28, color: COLORS.white, lineHeight: 30 },
  bubble: { maxWidth: '75%', padding: 10, borderRadius: 12, marginBottom: 8 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.white },
  myBubbleText: { color: COLORS.white },
  theirBubbleText: { color: COLORS.text },
  bubbleTime: { fontSize: 10, color: '#AAAAAA', marginTop: 4, textAlign: 'right' },
  replyBar: { flexDirection: 'row', padding: 12, backgroundColor: COLORS.white, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  replyInput: { flex: 1, backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, maxHeight: 100, marginRight: 8 },
  replyBtn: { backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  replyBtnText: { color: COLORS.white, fontWeight: '600' },
  input: { backgroundColor: COLORS.white, padding: 14, borderRadius: 8, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  sendBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
  sendBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});
