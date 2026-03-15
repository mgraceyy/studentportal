import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView, TextInput, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import AnimatedBackground from '../components/AnimatedBackground';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data } = await api.get('/students/me');
      setProfile(data);
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
    loadProfile(false);
  }, [loadProfile]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Error', 'All fields are required.');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'New passwords do not match.');
    }
    if (newPassword.length < 6) {
      return Alert.alert('Error', 'New password must be at least 6 characters.');
    }
    setChangingPassword(true);
    try {
      await api.put('/students/me/password', { current_password: currentPassword, new_password: newPassword });
      Alert.alert('Success', 'Password changed successfully.');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post('/auth/logout');
          } catch (_) {}
          await AsyncStorage.removeItem('token');
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  if (!profile) return <View style={styles.container}><Text>Could not load profile.</Text></View>;

  const fullName = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(' ');

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProfile(true)} tintColor={COLORS.primary} />}
      >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')}
          </Text>
        </View>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.studentNo}>{profile.student_number}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <InfoRow label="Email" value={profile.email} />
        <InfoRow label="Mobile" value={profile.mobile_number || 'N/A'} />
        <InfoRow label="Address" value={profile.address || 'N/A'} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Academic Information</Text>
        <InfoRow label="Course" value={profile.course} />
        <InfoRow label="Year Level" value={`${profile.year_level === 1 ? '1st' : profile.year_level === 2 ? '2nd' : profile.year_level === 3 ? '3rd' : `${profile.year_level}th`} Year`} />
        <InfoRow label="Section" value={profile.section} />
        <InfoRow label="Status" value={profile.status === 'enrolled' ? 'Enrolled' : 'Not Enrolled'} />
      </View>

      <TouchableOpacity style={styles.changePwBtn} onPress={() => setShowChangePassword(!showChangePassword)}>
        <Text style={styles.changePwText}>{showChangePassword ? 'Cancel' : 'Change Password'}</Text>
      </TouchableOpacity>

      {showChangePassword && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <TextInput style={styles.input} placeholder="Current Password" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
          <TextInput style={styles.input} placeholder="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          <TextInput style={styles.input} placeholder="Confirm New Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
          <TouchableOpacity style={styles.savePwBtn} onPress={handleChangePassword} disabled={changingPassword}>
            <Text style={styles.logoutText}>{changingPassword ? 'Saving...' : 'Save Password'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{`${label}:`}</Text>
      <Text style={styles.value}>{String(value ?? '')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF1F8' },
  header: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#153557' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#2F6AA3', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  studentNo: { fontSize: 14, color: '#FFFFFFAA', marginTop: 4 },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D9E3EE',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#173A63', marginBottom: 12 },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    paddingRight: 6,
  },
  label: {
    fontSize: 12,
    color: '#607489',
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 3,
    includeFontPadding: true,
  },
  value: {
    fontSize: 15,
    color: '#2E4861',
    fontWeight: '600',
    lineHeight: 21,
    includeFontPadding: true,
    paddingRight: 4,
    flexShrink: 1,
  },
  changePwBtn: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#2F6AA3', padding: 14, borderRadius: 10, alignItems: 'center' },
  changePwText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#D6E0EA', borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 14, color: '#2E4861' },
  savePwBtn: { backgroundColor: '#153557', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  logoutBtn: { marginHorizontal: 16, marginVertical: 24, backgroundColor: '#B73A3A', padding: 14, borderRadius: 10, alignItems: 'center' },
  logoutText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});
