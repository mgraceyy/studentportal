import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function MessagesScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/messages')
      .then(({ data }) => setMessages(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.sender}>{item.sender_name}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 8, marginBottom: 12 },
  sender: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  body: { fontSize: 14, color: COLORS.text, marginTop: 4 },
  time: { fontSize: 12, color: COLORS.textLight, marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textLight },
});
