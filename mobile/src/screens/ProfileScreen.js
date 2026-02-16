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

  const fullName = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{fullName}</Text>
      <Text style={styles.detail}>Email: {profile.email}</Text>
      <Text style={styles.detail}>Mobile: {profile.mobile_number || 'N/A'}</Text>
      <Text style={styles.detail}>Address: {profile.address || 'N/A'}</Text>
      <Text style={styles.detail}>Student No: {profile.student_number}</Text>
      <Text style={styles.detail}>Course: {profile.course}</Text>
      <Text style={styles.detail}>Year {profile.year_level} - Section {profile.section}</Text>
      <Text style={styles.detail}>Status: {profile.status === 'enrolled' ? 'Enrolled' : 'Not Enrolled'}</Text>
      <Text style={styles.detail}>Tuition Balance: {Number(profile.tuition_balance).toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: COLORS.background },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 16 },
  detail: { fontSize: 16, color: COLORS.text, marginBottom: 8 },
});
