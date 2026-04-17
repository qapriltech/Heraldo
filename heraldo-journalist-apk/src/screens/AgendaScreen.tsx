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
import { api } from '../services/api';

interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  location?: string;
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

const TYPE_COLORS: Record<string, string> = {
  conference: COLORS.orange,
  interview: COLORS.green,
  deadline: '#D94040',
  meeting: COLORS.gold,
  other: COLORS.warmGray,
};

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isThisWeek(d: Date) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
}

export default function AgendaScreen({ navigation }: any) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const data = await api.get<{ events: AgendaEvent[] }>('/journalist/agenda');
      setEvents(data.events || []);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger l\'agenda');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const now = new Date();
  const todayEvents = events.filter((e) => isSameDay(new Date(e.date), now));
  const weekEvents = events.filter((e) => {
    const d = new Date(e.date);
    return !isSameDay(d, now) && isThisWeek(d) && d >= now;
  });
  const laterEvents = events.filter((e) => {
    const d = new Date(e.date);
    return !isSameDay(d, now) && !isThisWeek(d) && d >= now;
  });

  const renderEvent = (event: AgendaEvent) => {
    const dotColor = TYPE_COLORS[event.type] || COLORS.warmGray;
    const d = new Date(event.date);
    return (
      <View key={event.id} style={styles.eventCard}>
        <View style={[styles.typeDot, { backgroundColor: dotColor }]} />
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventTime}>
            {d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
            {' '}{d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {event.location ? (
            <Text style={styles.eventLocation}>{event.location}</Text>
          ) : null}
        </View>
        <View style={[styles.typeBadge, { backgroundColor: dotColor + '20' }]}>
          <Text style={[styles.typeBadgeText, { color: dotColor }]}>{event.type}</Text>
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
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadEvents(); }} tintColor={COLORS.orange} />}
      >
        <Text style={styles.screenTitle}>Agenda</Text>

        {/* Aujourd'hui */}
        <Text style={styles.sectionTitle}>Aujourd'hui</Text>
        {todayEvents.length === 0 ? (
          <Text style={styles.empty}>Aucun événement aujourd'hui</Text>
        ) : (
          todayEvents.map(renderEvent)
        )}

        {/* Cette semaine */}
        <Text style={styles.sectionTitle}>Cette semaine</Text>
        {weekEvents.length === 0 ? (
          <Text style={styles.empty}>Aucun autre événement cette semaine</Text>
        ) : (
          weekEvents.map(renderEvent)
        )}

        {/* Plus tard */}
        {laterEvents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>À venir</Text>
            {laterEvents.map(renderEvent)}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => Alert.alert('Nouvel événement', 'Fonctionnalité à venir')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  content: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.ivory },
  screenTitle: { fontSize: 26, fontWeight: '800', color: COLORS.navy, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, marginBottom: 10, marginTop: 20 },
  empty: { fontSize: 14, color: COLORS.warmGray, paddingVertical: 8 },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  typeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  eventContent: { flex: 1 },
  eventTitle: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginBottom: 2 },
  eventTime: { fontSize: 13, color: COLORS.warmGray },
  eventLocation: { fontSize: 12, color: COLORS.warmGray, marginTop: 2 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.orange,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '600', marginTop: -2 },
});
