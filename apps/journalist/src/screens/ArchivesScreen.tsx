import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { api } from '@/services/api';

interface Publication {
  id: string;
  title: string;
  mediaName: string;
  date: string;
  type: string;
}

const COLORS = {
  navy: '#0D1B3E',
  orange: '#E8742E',
  gold: '#C8A45C',
  green: '#1A7A3C',
  ivory: '#FAF8F4',
  warmGray: '#8A8278',
};

const TYPE_FILTERS = ['Toutes', 'Article', 'Interview', 'Reportage', 'Tribune', 'Enquête'];

const TYPE_BADGE_COLORS: Record<string, string> = {
  Article: COLORS.navy,
  Interview: COLORS.green,
  Reportage: COLORS.orange,
  Tribune: COLORS.gold,
  Enquête: '#8B5CF6',
};

export default function ArchivesScreen() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Toutes');

  const loadData = useCallback(async () => {
    try {
      const data = await api.get<{ publications: Publication[] }>('/journalist/publications');
      setPublications(data.publications || []);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger les archives');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = publications.filter((p) => {
    const matchType = activeFilter === 'Toutes' || p.type === activeFilter;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.mediaName.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const renderItem = ({ item }: { item: Publication }) => {
    const badgeColor = TYPE_BADGE_COLORS[item.type] || COLORS.warmGray;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: badgeColor + '18' }]}>
            <Text style={[styles.typeBadgeText, { color: badgeColor }]}>{item.type}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.mediaName}>{item.mediaName}</Text>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.orange} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.screenTitle}>Archives</Text>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor={COLORS.warmGray}
              value={search}
              onChangeText={setSearch}
            />

            {/* Filter tabs */}
            <View style={styles.filterRow}>
              {TYPE_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[styles.filterTabText, activeFilter === f && styles.filterTabTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune publication trouvée</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.ivory },
  screenTitle: { fontSize: 26, fontWeight: '800', color: COLORS.navy, marginBottom: 16 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.navy,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0DDD8',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E8E6E1',
  },
  filterTabActive: { backgroundColor: COLORS.orange },
  filterTabText: { fontSize: 13, fontWeight: '600', color: COLORS.navy },
  filterTabTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.navy, marginRight: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  mediaName: { fontSize: 13, color: COLORS.warmGray },
  date: { fontSize: 12, color: COLORS.warmGray },
  empty: { fontSize: 14, color: COLORS.warmGray, textAlign: 'center', paddingVertical: 20 },
});
