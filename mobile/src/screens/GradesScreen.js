import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function GradesScreen() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/me/grades')
      .then(({ data }) => setGrades(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={grades}
        keyExtractor={(item, index) => `${item.subject}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.subject}>{item.subject}</Text>
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
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 8, marginBottom: 12 },
  subject: { fontSize: 18, fontWeight: '600', color: COLORS.primary },
  detail: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  grade: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textLight },
});
