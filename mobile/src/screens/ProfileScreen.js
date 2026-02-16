import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/me')
      .then(({ data }) => setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  if (!profile) return <View style={styles.container}><Text>Could not load profile.</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.detail}>Email: {profile.email}</Text>
      <Text style={styles.detail}>Student No: {profile.student_number}</Text>
      <Text style={styles.detail}>Course: {profile.course}</Text>
      <Text style={styles.detail}>Year {profile.year_level} - Section {profile.section}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: COLORS.background },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 16 },
  detail: { fontSize: 16, color: COLORS.text, marginBottom: 8 },
});
