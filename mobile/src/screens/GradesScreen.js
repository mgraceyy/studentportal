import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import AnimatedBackground from '../components/AnimatedBackground';

export default function GradesScreen() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGrades = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data } = await api.get('/students/me/grades');
      setGrades(data);
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
    loadGrades(false);
  }, [loadGrades]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <Text style={styles.pageTitle}>Academic Grades</Text>
      <Text style={styles.pageSubtitle}>Review your official grade records per subject and semester.</Text>
      <FlatList
        data={grades}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadGrades(true)} tintColor={COLORS.primary} />}
        keyExtractor={(item, index) => `${item.subject_code}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.subject}>{item.subject_code} - {item.subject_name}</Text>
            <Text style={styles.detail}>Semester: {item.semester}</Text>
            <Text style={styles.grade}>Grade: {item.grade}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No grades found.</Text>}
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
  grade: { fontSize: 18, fontWeight: '800', color: '#153557', marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textLight },
});
