import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { api } from '../services/api';

interface RevenueStats {
  total: number;
  thisMonth: number;
  thisYear: number;
  pending: number;
}

interface Transaction {
  id: string;
  institutionName: string;
  amount: number;
  date: string;
  status: string;
}

const COLORS = {
  navy: '#0D1B3E',
  orange: '#E8742E',
  gold: '#C8A45C',
  green: '#1A7A3C',
  ivory: '#FAF8F4',
  warmGray: '#8A8278',
};

export default function RevenuesScreen() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsData, txData] = await Promise.all([
        api.get<RevenueStats>('/journalist/revenues/stats'),
        api.get<{ transactions: Transaction[] }>('/journalist/revenues/transactions'),
      ]);
      setStats(statsData);
      setTransactions(txData.transactions || []);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger les revenus');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const formatAmount = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  const summaryCards = [
    { label: 'Ce mois', value: stats?.thisMonth ?? 0, color: COLORS.orange },
    { label: 'Cette année', value: stats?.thisYear ?? 0, color: COLORS.navy },
    { label: 'En attente', value: stats?.pending ?? 0, color: COLORS.warmGray },
  ];

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const statusColor = item.status === 'paid' ? COLORS.green : item.status === 'pending' ? COLORS.gold : COLORS.warmGray;
    return (
      <View style={styles.txCard}>
        <View style={styles.txLeft}>
          <Text style={styles.txInstitution}>{item.institutionName}</Text>
          <Text style={styles.txDate}>
            {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.txRight}>
          <Text style={styles.txAmount}>{formatAmount(item.amount)}</Text>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.screenTitle}>Revenus</Text>

            {/* Big Total */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total cumulé</Text>
              <Text style={styles.totalAmount}>{formatAmount(stats?.total ?? 0)}</Text>
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              {summaryCards.map((card, i) => (
                <View key={i} style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatAmount(card.value)}</Text>
                  <Text style={styles.summaryLabel}>{card.label}</Text>
                  <View style={[styles.summaryStripe, { backgroundColor: card.color }]} />
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Transactions</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune transaction</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.ivory },
  screenTitle: { fontSize: 26, fontWeight: '800', color: COLORS.navy, marginBottom: 20 },
  totalCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: { fontSize: 14, color: COLORS.warmGray, marginBottom: 4 },
  totalAmount: { fontSize: 32, fontWeight: '800', color: COLORS.gold },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  summaryValue: { fontSize: 13, fontWeight: '700', color: COLORS.navy, textAlign: 'center' },
  summaryLabel: { fontSize: 11, color: COLORS.warmGray, marginTop: 2 },
  summaryStripe: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  txLeft: { flex: 1 },
  txInstitution: { fontSize: 14, fontWeight: '600', color: COLORS.navy },
  txDate: { fontSize: 12, color: COLORS.warmGray, marginTop: 2 },
  txRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  txAmount: { fontSize: 14, fontWeight: '700', color: COLORS.navy },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { fontSize: 14, color: COLORS.warmGray, textAlign: 'center', paddingVertical: 20 },
});
