import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/stores/auth';
import { api } from '@/services/api';

interface KPIs {
  invitations: number;
  events: number;
  revenue: number;
  profileCompletion: number;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

const COLORS = {
  navy: '#0D1B3E',
  orange: '#E8742E',
  gold: '#C8A45C',
  green: '#1A7A3C',
  ivory: '#FAF8F4',
  warmGray: '#8A8278',
};

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [kpiData, notifData] = await Promise.all([
        api.get<KPIs>('/journalist/dashboard/kpis'),
        api.get<{ notifications: Notification[] }>('/journalist/notifications?limit=5'),
      ]);
      setKpis(kpiData);
      setNotifications(notifData.notifications || []);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger le tableau de bord');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  const firstName = user?.fullName?.split(' ')[0] || 'Journaliste';

  const kpiCards = [
    { label: 'Invitations', value: kpis?.invitations ?? 0, color: COLORS.orange },
    { label: 'Événements', value: kpis?.events ?? 0, color: COLORS.navy },
    { label: 'Revenus (FCFA)', value: kpis?.revenue ?? 0, color: COLORS.gold },
    { label: 'Profil', value: `${kpis?.profileCompletion ?? 0}%`, color: COLORS.green },
  ];

  const quickActions = [
    { label: 'Enregistrer', icon: '🎙', screen: 'Capture' },
    { label: 'Soumettre preuve', icon: '📄', screen: 'Archives' },
    { label: 'Voir agenda', icon: '📅', screen: 'Agenda' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour, {firstName}</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        {kpiCards.map((kpi, i) => (
          <View key={i} style={styles.kpiCard}>
            <View style={[styles.kpiDot, { backgroundColor: kpi.color }]} />
            <Text style={styles.kpiValue}>
              {typeof kpi.value === 'number' ? kpi.value.toLocaleString('fr-FR') : kpi.value}
            </Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.actionsRow}>
        {quickActions.map((action, i) => (
          <TouchableOpacity
            key={i}
            style={styles.actionCard}
            onPress={() => navigation?.navigate(action.screen)}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Notifications */}
      <Text style={styles.sectionTitle}>Notifications récentes</Text>
      {notifications.length === 0 ? (
        <Text style={styles.empty}>Aucune notification</Text>
      ) : (
        notifications.map((notif) => (
          <View key={notif.id} style={[styles.notifCard, !notif.read && styles.notifUnread]}>
            <Text style={styles.notifTitle}>{notif.title}</Text>
            <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
            <Text style={styles.notifTime}>
              {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  content: { padding: 20, paddingTop: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.ivory },
  header: { marginBottom: 24 },
  greeting: { fontSize: 26, fontWeight: '800', color: COLORS.navy },
  date: { fontSize: 14, color: COLORS.warmGray, marginTop: 4, textTransform: 'capitalize' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  kpiCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  kpiDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  kpiValue: { fontSize: 24, fontWeight: '800', color: COLORS.navy },
  kpiLabel: { fontSize: 12, color: COLORS.warmGray, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.navy, textAlign: 'center' },
  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  notifUnread: { borderLeftColor: COLORS.orange, backgroundColor: '#FFF9F5' },
  notifTitle: { fontSize: 14, fontWeight: '700', color: COLORS.navy, marginBottom: 4 },
  notifBody: { fontSize: 13, color: COLORS.warmGray, lineHeight: 18 },
  notifTime: { fontSize: 11, color: COLORS.warmGray, marginTop: 6 },
  empty: { fontSize: 14, color: COLORS.warmGray, textAlign: 'center', paddingVertical: 20 },
});
