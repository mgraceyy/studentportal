import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import AnimatedBackground from '../components/AnimatedBackground';

export default function EnrollmentScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [termOptions, setTermOptions] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [showTermDropdown, setShowTermDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showRefresh = false, termOverride = null) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [statusRes, termsRes] = await Promise.all([
        api.get('/students/enrollment-status'),
        api.get('/students/enrollment-terms'),
      ]);

      const terms = termsRes.data || [];
      const fallbackTerm = terms.length > 0 ? terms[0] : null;
      const resolvedTerm = termOverride || selectedTerm || fallbackTerm;

      const subjectsRes = await api.get('/students/subjects/by-term', {
        params: resolvedTerm ? {
          semester: resolvedTerm.semester,
          academic_year: resolvedTerm.academic_year,
        } : {},
      });

      setEnrollmentStatus(statusRes.data);
      setTermOptions(terms);
      setSelectedTerm(resolvedTerm);
      setSubjects(subjectsRes.data || []);
    } catch (_) {
    } finally {
      if (showRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => { loadData(false); }, [loadData]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.headerTermBtn} onPress={() => setShowTermDropdown((v) => !v)}>
          <Text style={styles.headerTermBtnText} numberOfLines={1}>
            {selectedTerm ? `${selectedTerm.semester}` : 'Select Term'}
          </Text>
          <Text style={styles.headerTermArrow}>{showTermDropdown ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedTerm, showTermDropdown]);

  const isOpen = enrollmentStatus?.is_open;
  const isLatestTerm = selectedTerm?.is_latest;
  const canModifyEnrollment = isOpen && isLatestTerm;

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
              loadData(false, selectedTerm);
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
              loadData(false, selectedTerm);
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
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={() => showTermDropdown && setShowTermDropdown(false)}>
      <AnimatedBackground />
      <Text style={styles.pageTitle}>Enrollment Center</Text>
      <Text style={styles.pageSubtitle}>Manage your official subject registration for the current term.</Text>

      {showTermDropdown && (
        <View style={styles.termDropdownMenu}>
          {termOptions.map((term) => {
            const selected = selectedTerm && selectedTerm.semester === term.semester && selectedTerm.academic_year === term.academic_year;
            return (
              <TouchableOpacity
                key={`${term.semester}-${term.academic_year}`}
                style={[styles.termOption, selected && styles.termOptionSelected]}
                onPress={() => {
                  setShowTermDropdown(false);
                  loadData(false, term);
                }}
              >
                <View>
                  <Text style={[styles.termOptionTitle, selected && styles.termOptionTitleSelected]}>{term.semester} • {term.academic_year}</Text>
                  <Text style={styles.termOptionMeta}>
                    {term.enrollment_state === 'enrolled' ? `Enrolled (${term.enrolled_count})` : 'Not enrolled yet'}
                  </Text>
                </View>
                {term.is_latest && <Text style={styles.latestTag}>LATEST</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

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

      <FlatList
        data={subjects}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true, selectedTerm)} tintColor={COLORS.primary} />}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const alreadyEnrolled = item.already_enrolled;

          return (
            <View style={styles.card}>
              <Text style={styles.subject}>{item.code} - {item.name}</Text>
              <Text style={styles.detail}>{item.units} units | {item.semester} {item.academic_year}</Text>
              {item.day && <Text style={styles.detail}>{item.day} {item.time_start}-{item.time_end} | Room {item.room}</Text>}
              <Text style={styles.detail}>Slots: {item.current_slots}/{item.max_slots}</Text>
              {alreadyEnrolled ? (
                canModifyEnrollment ? (
                  <TouchableOpacity style={styles.dropBtn} onPress={() => handleDrop({ id: item.enrollment_id, subject_code: item.code, subject_name: item.name })}>
                    <Text style={styles.dropBtnText}>Drop Subject</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.enrolledBtn}>
                    <Text style={styles.enrolledBtnText}>Enrolled</Text>
                  </View>
                )
              ) : canModifyEnrollment && item.can_enroll ? (
                <TouchableOpacity style={styles.enrollBtn} onPress={() => handleEnroll(item)}>
                  <Text style={styles.enrollBtnText}>Enroll</Text>
                </TouchableOpacity>
              ) : canModifyEnrollment && !item.can_enroll ? (
                <View style={styles.disabledBtn}>
                  <Text style={styles.disabledBtnText}>Subject Full</Text>
                </View>
              ) : (
                <View style={styles.disabledBtn}>
                  <Text style={styles.disabledBtnText}>{isLatestTerm ? 'Enrollment Closed' : 'Past Term (View Only)'}</Text>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No subjects found for this term.</Text>}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 14, backgroundColor: '#EAF1F8' },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#163657' },
  pageSubtitle: { marginTop: 4, marginBottom: 10, fontSize: 13, color: '#5D7087' },
  headerTermBtn: {
    maxWidth: 200,
    backgroundColor: '#214A70',
    borderWidth: 1,
    borderColor: '#3B6287',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 16,
  },
  headerTermBtnText: { maxWidth: 148, fontSize: 13, color: '#FFFFFF', fontWeight: '700' },
  headerTermArrow: { color: '#D5E6F7', fontSize: 12, fontWeight: '700' },
  termDropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8E3EE',
    marginBottom: 10,
    overflow: 'hidden',
  },
  termOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3F8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  termOptionSelected: { backgroundColor: '#F2F7FC' },
  termOptionTitle: { fontSize: 13, color: '#1E3F60', fontWeight: '700' },
  termOptionTitleSelected: { color: '#143A5D' },
  termOptionMeta: { fontSize: 11, color: '#627A92', marginTop: 2 },
  latestTag: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    backgroundColor: '#1F5E97',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  banner: { backgroundColor: '#B73A3A', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginBottom: 10 },
  bannerText: { color: COLORS.white, fontSize: 13, textAlign: 'center' },
  bannerOpen: { backgroundColor: '#2F7D47', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginBottom: 10 },
  bannerOpenText: { color: COLORS.white, fontSize: 13, textAlign: 'center' },
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
  detail: { fontSize: 13, color: '#607489', marginTop: 5 },
  enrollBtn: { marginTop: 12, backgroundColor: '#173A63', padding: 11, borderRadius: 8, alignItems: 'center' },
  enrollBtnText: { color: COLORS.white, fontWeight: '600' },
  enrolledBtn: { marginTop: 12, backgroundColor: '#2F7D47', padding: 11, borderRadius: 8, alignItems: 'center' },
  enrolledBtnText: { color: COLORS.white, fontWeight: '600' },
  dropBtn: { marginTop: 12, backgroundColor: '#B74848', padding: 11, borderRadius: 8, alignItems: 'center' },
  dropBtnText: { color: COLORS.white, fontWeight: '700' },
  disabledBtn: { marginTop: 12, backgroundColor: '#D8E1EB', padding: 11, borderRadius: 8, alignItems: 'center' },
  disabledBtnText: { color: '#61758B', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textLight },
});
