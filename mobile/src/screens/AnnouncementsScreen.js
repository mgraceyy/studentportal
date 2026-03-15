import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import AnimatedBackground from '../components/AnimatedBackground';

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnnouncements = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data);
    } catch (_) {
    } finally {
      if (showRefresh) setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements(false);
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>AVC</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.pageTitle}>Announcements Board</Text>
          <Text style={styles.pageSubtitle}>Official campus updates, deadlines, and institutional advisories.</Text>
        </View>
      </View>

      <FlatList
        data={announcements}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAnnouncements(true)} tintColor={COLORS.primary} />}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardAccent} />
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.datePill}>
                <Text style={styles.datePillText}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
            </View>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.meta}>Issued by {item.posted_by}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No announcements yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 14, backgroundColor: '#EAF1F8' },
  hero: {
    borderRadius: 14,
    backgroundColor: '#153557',
    borderWidth: 1,
    borderColor: '#204A70',
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF1F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF45',
  },
  heroBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroCopy: { flex: 1 },
  pageTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  pageSubtitle: { marginTop: 3, fontSize: 12, color: '#CEE0F2' },
  listContent: { paddingBottom: 16 },
  card: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D9E3EE',
    shadowColor: '#0A1F33',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#2A5E90',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  datePill: {
    backgroundColor: '#ECF3FA',
    borderWidth: 1,
    borderColor: '#D2E0EE',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  datePillText: {
    fontSize: 10,
    color: '#4B647E',
    fontWeight: '700',
  },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1A395A', paddingRight: 4 },
  body: { fontSize: 14, color: '#324B64', marginTop: 8, lineHeight: 20 },
  meta: { fontSize: 12, color: '#667A8F', marginTop: 10, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textLight },
});
