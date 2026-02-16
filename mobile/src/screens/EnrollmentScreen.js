import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function EnrollmentScreen() {
  const [subjects, setSubjects] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('available');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/students/enrollment-status'),
      api.get('/students/subjects/available'),
      api.get('/students/me/enrollments'),
    ])
      .then(([statusRes, subRes, enrRes]) => {
        setEnrollmentStatus(statusRes.data);
        setSubjects(subRes.data);
        setEnrollments(enrRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const isOpen = enrollmentStatus?.is_open;

  const handleEnroll = (subject) => {
    Alert.alert(
      'Confirm Enrollment',
      `Enroll in ${subject.code} - ${subject.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enroll',
          onPress: async () => {
            try {
              await api.post('/students/me/enroll', {
                subject_id: subject.id,
                semester: subject.semester,
                academic_year: subject.academic_year,
              });
              Alert.alert('Success', 'Enrolled successfully.');
              loadData();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'Enrollment failed.');
            }
          },
        },
      ]
    );
  };

  const handleDrop = (enrollment) => {
    Alert.alert(
      'Confirm Drop',
      `Drop ${enrollment.subject_code} - ${enrollment.subject_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Drop',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/students/me/enroll/${enrollment.id}`);
              Alert.alert('Success', 'Subject dropped.');
              loadData();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'Drop failed.');
            }
          },
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      {enrollmentStatus && !isOpen && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{enrollmentStatus.message}</Text>
        </View>
      )}
      {enrollmentStatus && isOpen && (
        <View style={styles.bannerOpen}>
          <Text style={styles.bannerOpenText}>Enrollment is open.</Text>
        </View>
      )}

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'available' && styles.activeTab]} onPress={() => setTab('available')}>
          <Text style={[styles.tabText, tab === 'available' && styles.activeTabText]}>Available</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'enrolled' && styles.activeTab]} onPress={() => setTab('enrolled')}>
          <Text style={[styles.tabText, tab === 'enrolled' && styles.activeTabText]}>My Enrollments</Text>
        </TouchableOpacity>
      </View>

      {tab === 'available' ? (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.subject}>{item.code} - {item.name}</Text>
              <Text style={styles.detail}>{item.units} units | {item.semester} {item.academic_year}</Text>
              {item.day && <Text style={styles.detail}>{item.day} {item.time_start}-{item.time_end} | Room {item.room}</Text>}
              <Text style={styles.detail}>Slots: {item.current_slots}/{item.max_slots}</Text>
              {isOpen ? (
                <TouchableOpacity style={styles.enrollBtn} onPress={() => handleEnroll(item)}>
                  <Text style={styles.enrollBtnText}>Enroll</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.disabledBtn}>
                  <Text style={styles.disabledBtnText}>Enrollment Closed</Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No subjects available.</Text>}
        />
      ) : (
        <FlatList
          data={enrollments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.subject}>{item.subject_code} - {item.subject_name}</Text>
              <Text style={styles.detail}>{item.units} units | {item.semester} {item.academic_year}</Text>
              {item.day && <Text style={styles.detail}>{item.day} {item.time_start}-{item.time_end} | Room {item.room}</Text>}
              {isOpen ? (
                <TouchableOpacity style={styles.dropBtn} onPress={() => handleDrop(item)}>
                  <Text style={styles.dropBtnText}>Drop</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.disabledBtn}>
                  <Text style={styles.disabledBtnText}>Dropping Closed</Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No enrollments yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  banner: { backgroundColor: COLORS.error, paddingVertical: 10, paddingHorizontal: 16 },
  bannerText: { color: COLORS.white, fontSize: 13, textAlign: 'center' },
  bannerOpen: { backgroundColor: COLORS.success, paddingVertical: 10, paddingHorizontal: 16 },
  bannerOpenText: { color: COLORS.white, fontSize: 13, textAlign: 'center' },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.white },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textLight },
  activeTabText: { color: COLORS.primary, fontWeight: '600' },
  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 8, marginHorizontal: 16, marginTop: 12 },
  subject: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  detail: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
  enrollBtn: { marginTop: 10, backgroundColor: COLORS.primary, padding: 10, borderRadius: 6, alignItems: 'center' },
  enrollBtnText: { color: COLORS.white, fontWeight: '600' },
  dropBtn: { marginTop: 10, backgroundColor: COLORS.error, padding: 10, borderRadius: 6, alignItems: 'center' },
  dropBtnText: { color: COLORS.white, fontWeight: '600' },
  disabledBtn: { marginTop: 10, backgroundColor: '#CCCCCC', padding: 10, borderRadius: 6, alignItems: 'center' },
  disabledBtnText: { color: '#666666', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textLight },
});
