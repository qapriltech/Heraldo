import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/stores/auth';
import { api } from '@/services/api';

interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  bio?: string;
  specialties: string[];
  zones: string[];
  languages: string[];
  photoUrl?: string;
  profileCompletion: number;
  publications: Publication[];
}

interface Publication {
  id: string;
  title: string;
  mediaName: string;
  date: string;
  type: string;
  featured: boolean;
}

const COLORS = {
  navy: '#0D1B3E',
  orange: '#E8742E',
  gold: '#C8A45C',
  green: '#1A7A3C',
  ivory: '#FAF8F4',
  warmGray: '#8A8278',
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ bio: '', specialties: '', zones: '', languages: '' });

  const loadProfile = useCallback(async () => {
    try {
      const data = await api.get<Profile>('/journalist/profile');
      setProfile(data);
      setEditData({
        bio: data.bio || '',
        specialties: data.specialties?.join(', ') || '',
        zones: data.zones?.join(', ') || '',
        languages: data.languages?.join(', ') || '',
      });
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger le profil');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/journalist/profile', {
        bio: editData.bio,
        specialties: editData.specialties.split(',').map((s) => s.trim()).filter(Boolean),
        zones: editData.zones.split(',').map((s) => s.trim()).filter(Boolean),
        languages: editData.languages.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setEditing(false);
      await loadProfile();
      Alert.alert('Succès', 'Profil mis à jour');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de sauvegarder');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  const initials = (profile?.fullName || user?.fullName || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const completionPct = profile?.profileCompletion ?? 0;
  const sortedPubs = [...(profile?.publications || [])].sort((a, b) =>
    a.featured === b.featured ? 0 : a.featured ? -1 : 1
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProfile(); }} tintColor={COLORS.orange} />}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
        <Text style={styles.name}>{profile?.fullName || user?.fullName}</Text>
        <Text style={styles.email}>{profile?.email || user?.email}</Text>
      </View>

      {/* Completion Bar */}
      <View style={styles.completionContainer}>
        <View style={styles.completionHeader}>
          <Text style={styles.completionLabel}>Profil complété</Text>
          <Text style={styles.completionPct}>{completionPct}%</Text>
        </View>
        <View style={styles.completionTrack}>
          <View style={[styles.completionFill, { width: `${completionPct}%` }]} />
        </View>
      </View>

      {/* Edit Toggle */}
      <TouchableOpacity
        style={styles.editToggle}
        onPress={() => setEditing(!editing)}
      >
        <Text style={styles.editToggleText}>{editing ? 'Annuler' : 'Modifier le profil'}</Text>
      </TouchableOpacity>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        {editing ? (
          <TextInput
            style={styles.textArea}
            multiline
            value={editData.bio}
            onChangeText={(v) => setEditData({ ...editData, bio: v })}
            placeholder="Décrivez votre parcours..."
            placeholderTextColor={COLORS.warmGray}
          />
        ) : (
          <Text style={styles.fieldValue}>{profile?.bio || 'Non renseigné'}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spécialités</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={editData.specialties}
            onChangeText={(v) => setEditData({ ...editData, specialties: v })}
            placeholder="Politique, Économie, Sport..."
            placeholderTextColor={COLORS.warmGray}
          />
        ) : (
          <View style={styles.tagRow}>
            {(profile?.specialties || []).map((s, i) => (
              <View key={i} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
            ))}
            {(!profile?.specialties || profile.specialties.length === 0) && (
              <Text style={styles.fieldValue}>Non renseigné</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zones</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={editData.zones}
            onChangeText={(v) => setEditData({ ...editData, zones: v })}
            placeholder="Abidjan, Bouaké, Yamoussoukro..."
            placeholderTextColor={COLORS.warmGray}
          />
        ) : (
          <View style={styles.tagRow}>
            {(profile?.zones || []).map((z, i) => (
              <View key={i} style={[styles.tag, styles.tagZone]}><Text style={styles.tagText}>{z}</Text></View>
            ))}
            {(!profile?.zones || profile.zones.length === 0) && (
              <Text style={styles.fieldValue}>Non renseigné</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Langues</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={editData.languages}
            onChangeText={(v) => setEditData({ ...editData, languages: v })}
            placeholder="Français, Anglais, Dioula..."
            placeholderTextColor={COLORS.warmGray}
          />
        ) : (
          <Text style={styles.fieldValue}>
            {profile?.languages?.join(', ') || 'Non renseigné'}
          </Text>
        )}
      </View>

      {editing && (
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Publications */}
      <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Publications</Text>
      {sortedPubs.length === 0 ? (
        <Text style={styles.fieldValue}>Aucune publication</Text>
      ) : (
        sortedPubs.map((pub) => (
          <View key={pub.id} style={styles.pubCard}>
            {pub.featured && (
              <View style={styles.featuredBadge}><Text style={styles.featuredText}>A la une</Text></View>
            )}
            <Text style={styles.pubTitle}>{pub.title}</Text>
            <View style={styles.pubMeta}>
              <Text style={styles.pubMedia}>{pub.mediaName}</Text>
              <Text style={styles.pubDate}>
                {new Date(pub.date).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            <View style={[styles.tag, { alignSelf: 'flex-start', marginTop: 6 }]}>
              <Text style={styles.tagText}>{pub.type}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.ivory },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: COLORS.gold, fontSize: 28, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.navy },
  email: { fontSize: 14, color: COLORS.warmGray, marginTop: 2 },
  completionContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16 },
  completionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  completionLabel: { fontSize: 13, color: COLORS.warmGray },
  completionPct: { fontSize: 13, fontWeight: '700', color: COLORS.green },
  completionTrack: { height: 6, backgroundColor: '#E8E6E1', borderRadius: 3 },
  completionFill: { height: 6, backgroundColor: COLORS.green, borderRadius: 3 },
  editToggle: { alignSelf: 'flex-end', marginBottom: 16 },
  editToggleText: { color: COLORS.orange, fontSize: 14, fontWeight: '600' },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginBottom: 6 },
  fieldValue: { fontSize: 14, color: COLORS.warmGray, lineHeight: 20 },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0DDD8',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.navy,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0DDD8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.navy,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#EDE9E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagZone: { backgroundColor: '#E3F0E8' },
  tagText: { fontSize: 12, fontWeight: '600', color: COLORS.navy },
  saveButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pubCard: {
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
  featuredBadge: {
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  featuredText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  pubTitle: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginBottom: 4 },
  pubMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  pubMedia: { fontSize: 13, color: COLORS.warmGray },
  pubDate: { fontSize: 12, color: COLORS.warmGray },
});
