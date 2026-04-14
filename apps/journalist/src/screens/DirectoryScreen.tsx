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
} from 'react-native';
import { api } from '@/services/api';

interface Journalist {
  id: string;
  fullName: string;
  mediaName: string;
  specialties: string[];
  zone?: string;
  isFollowed: boolean;
}

const COLORS = {
  navy: '#0D1B3E',
  orange: '#E8742E',
  gold: '#C8A45C',
  green: '#1A7A3C',
  ivory: '#FAF8F4',
  warmGray: '#8A8278',
};

const SPECIALTY_CHIPS = ['Politique', 'Économie', 'Sport', 'Culture', 'Société'];
const ZONE_CHIPS = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San Pedro', 'Korhogo'];

export default function DirectoryScreen() {
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await api.get<{ journalists: Journalist[] }>('/journalist/directory');
      setJournalists(data.journalists || []);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger l\'annuaire');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleFollow = async (id: string, currentlyFollowed: boolean) => {
    setTogglingId(id);
    try {
      if (currentlyFollowed) {
        await api.del(`/journalist/directory/${id}/follow`);
      } else {
        await api.post(`/journalist/directory/${id}/follow`);
      }
      setJournalists((prev) =>
        prev.map((j) => j.id === id ? { ...j, isFollowed: !j.isFollowed } : j)
      );
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Action impossible');
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = journalists.filter((j) => {
    const matchSearch = !search ||
      j.fullName.toLowerCase().includes(search.toLowerCase()) ||
      j.mediaName.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = !activeSpecialty || j.specialties.includes(activeSpecialty);
    const matchZone = !activeZone || j.zone === activeZone;
    return matchSearch && matchSpecialty && matchZone;
  });

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const renderItem = ({ item }: { item: Journalist }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.fullName)}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.media}>{item.mediaName}</Text>
        <View style={styles.tagRow}>
          {item.specialties.slice(0, 3).map((s, i) => (
            <View key={i} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.followBtn, item.isFollowed && styles.followBtnActive]}
        onPress={() => toggleFollow(item.id, item.isFollowed)}
        disabled={togglingId === item.id}
      >
        {togglingId === item.id ? (
          <ActivityIndicator size="small" color={item.isFollowed ? COLORS.orange : '#fff'} />
        ) : (
          <Text style={[styles.followBtnText, item.isFollowed && styles.followBtnTextActive]}>
            {item.isFollowed ? 'Suivi' : 'Suivre'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

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
        ListHeaderComponent={
          <View>
            <Text style={styles.screenTitle}>Annuaire</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un journaliste..."
              placeholderTextColor={COLORS.warmGray}
              value={search}
              onChangeText={setSearch}
            />

            {/* Specialty chips */}
            <View style={styles.chipRow}>
              {SPECIALTY_CHIPS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, activeSpecialty === s && styles.chipActive]}
                  onPress={() => setActiveSpecialty(activeSpecialty === s ? null : s)}
                >
                  <Text style={[styles.chipText, activeSpecialty === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Zone chips */}
            <View style={styles.chipRow}>
              {ZONE_CHIPS.map((z) => (
                <TouchableOpacity
                  key={z}
                  style={[styles.chip, styles.chipZone, activeZone === z && styles.chipZoneActive]}
                  onPress={() => setActiveZone(activeZone === z ? null : z)}
                >
                  <Text style={[styles.chipText, activeZone === z && styles.chipTextActive]}>{z}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun journaliste trouvé</Text>
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#E8E6E1',
  },
  chipActive: { backgroundColor: COLORS.orange },
  chipZone: { backgroundColor: '#E3F0E8' },
  chipZoneActive: { backgroundColor: COLORS.green },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.navy },
  chipTextActive: { color: '#fff' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: COLORS.gold, fontSize: 15, fontWeight: '700' },
  cardContent: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.navy },
  media: { fontSize: 12, color: COLORS.warmGray, marginTop: 1 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  tag: { backgroundColor: '#EDE9E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '600', color: COLORS.navy },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.orange,
    minWidth: 64,
    alignItems: 'center',
  },
  followBtnActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.orange,
  },
  followBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  followBtnTextActive: { color: COLORS.orange },
  empty: { fontSize: 14, color: COLORS.warmGray, textAlign: 'center', paddingVertical: 20 },
});
