import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import AnimatedBackground from '../components/AnimatedBackground';

export default function ScheduleScreen() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSchedule = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data } = await api.get('/students/me/enrollments');
      const enrolledData = data.map(e => ({
        subject_code: e.subject_code,
        subject_name: e.subject_name,
        room: e.room || '-',
        day: e.day || '-',
        time_start: e.time_start || '-',
        time_end: e.time_end || '-',
      }));
      setSchedule(enrolledData);
    } catch (_) {
    } finally {
      if (showRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadSchedule(false);
  }, [loadSchedule]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <Text style={styles.pageTitle}>Class Schedule</Text>
      <Text style={styles.pageSubtitle}>Institution-approved class timetable for your enrolled subjects.</Text>
      <FlatList
        data={schedule}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadSchedule(true)} tintColor={COLORS.primary} />}
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
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 14, backgroundColor: '#EAF1F8' },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#163657' },
  pageSubtitle: { marginTop: 4, marginBottom: 12, fontSize: 13, color: '#5D7087' },
  listContent: { paddingBottom: 16 },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D9E3EE',
  },
  subject: { fontSize: 16, fontWeight: '700', color: '#1A395A' },
  detail: { fontSize: 13, color: '#607489', marginTop: 6 },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textLight },
});
