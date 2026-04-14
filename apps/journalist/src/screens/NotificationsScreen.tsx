import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { api } from '@/services/api';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'invitation' | 'fcm' | 'forum' | 'system';
  read: boolean;
  createdAt: string;
}

const COLORS = {
  navy: '#0D1B3E',
  orange: '#E8742E',
  gold: '#C8A45C',
  green: '#1A7A3C',
  ivory: '#FAF8F4',
  warmGray: '#8A8278',
};

const FILTERS = ['Toutes', 'Invitations', 'FCM', 'Forum'] as const;
type FilterType = typeof FILTERS[number];

const FILTER_MAP: Record<FilterType, string | null> = {
  Toutes: null,
  Invitations: 'invitation',
  FCM: 'fcm',
  Forum: 'forum',
};

const TYPE_ICONS: Record<string, string> = {
  invitation: '\u2709',
  fcm: '\uD83D\uDD14',
  forum: '\uD83D\uDCAC',
  system: '\u2699',
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('Toutes');

  const loadData = useCallback(async () => {
    try {
      const data = await api.get<{ notifications: NotificationItem[] }>('/journalist/notifications');
      setNotifications(data.notifications || []);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger les notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/journalist/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, read: true } : n)
      );
    } catch {
      // Silent
    }
  };

  const filtered = notifications.filter((n) => {
    const filterType = FILTER_MAP[activeFilter];
    return !filterType || n.type === filterType;
  });

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const icon = TYPE_ICONS[item.type] || '\u2022';
    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.notifUnread]}
        onPress={() => { if (!item.read) markAsRead(item.id); }}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, !item.read && styles.notifTitleBold]}>{item.title}</Text>
          <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.notifTime}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
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
            <Text style={styles.screenTitle}>Notifications</Text>
            <View style={styles.filterRow}>
              {FILTERS.map((f) => (
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
          <Text style={styles.empty}>Aucune notification</Text>
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
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E8E6E1',
  },
  filterTabActive: { backgroundColor: COLORS.orange },
  filterTabText: { fontSize: 13, fontWeight: '600', color: COLORS.navy },
  filterTabTextActive: { color: '#fff' },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  notifUnread: { backgroundColor: '#FFF9F5', borderLeftWidth: 3, borderLeftColor: COLORS.orange },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 16 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, color: COLORS.navy, marginBottom: 2 },
  notifTitleBold: { fontWeight: '700' },
  notifBody: { fontSize: 13, color: COLORS.warmGray, lineHeight: 18 },
  notifTime: { fontSize: 11, color: COLORS.warmGray, marginTop: 4 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.orange,
    marginLeft: 8,
  },
  empty: { fontSize: 14, color: COLORS.warmGray, textAlign: 'center', paddingVertical: 20 },
});
