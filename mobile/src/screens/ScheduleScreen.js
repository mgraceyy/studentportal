import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function ScheduleScreen() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/me/schedule')
      .then(({ data }) => setSchedule(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={schedule}
        keyExtractor={(item, index) => `${item.subject_code}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.subject}>{item.subject_code} - {item.subject_name}</Text>
            <Text style={styles.detail}>{item.day} | {item.time_start} - {item.time_end}</Text>
            <Text style={styles.detail}>Room: {item.room}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No schedule found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 8, marginBottom: 12 },
  subject: { fontSize: 18, fontWeight: '600', color: COLORS.primary },
  detail: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textLight },
});
