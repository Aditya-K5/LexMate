import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../src/theme/tokens';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { apiClient } from '../../src/lib/api-client';

interface PaymentItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  caseName: string;
  amount: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  date: string;
}

const INITIAL_PAYMENTS: PaymentItem[] = [
  {
    id: '1',
    invoiceNumber: '#INV-2025-01',
    clientName: 'Raj Sharma',
    caseName: 'Sharma vs Singh',
    amount: '₹30,000',
    status: 'PAID',
    date: '15 Sep 2025',
  },
  {
    id: '2',
    invoiceNumber: '#INV-2025-02',
    clientName: 'Raj Sharma',
    caseName: 'Sharma vs Verma',
    amount: '₹20,000',
    status: 'PENDING',
    date: 'Due 30 Sep 2025',
  },
  {
    id: '3',
    invoiceNumber: '#INV-2025-03',
    clientName: 'ABC Ltd',
    caseName: 'ABC Ltd vs XYZ',
    amount: '₹22,000',
    status: 'PENDING',
    date: 'Due 05 Oct 2025',
  },
];

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<PaymentItem[]>(INITIAL_PAYMENTS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = async () => {
    try {
      const res = await apiClient.get<PaymentItem[]>('/payments');
      if (Array.isArray(res) && res.length > 0) {
        setPayments(res);
      }
    } catch {
      // Retains default payments
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader
          title="Payments & Billing"
          centeredTitle
          showBack
          rightAction={
            <TouchableOpacity
              onPress={() => Alert.alert('New Invoice', 'Generate a new legal fee invoice or retainer')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="add" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          }
        />

        {/* 2 Stat Cards matching Figma Payment Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Fee</Text>
            <Text style={[styles.statValue, { color: COLORS.red }]}>₹42,000</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Collected</Text>
            <Text style={[styles.statValue, { color: COLORS.green }]}>₹30,000</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Invoices</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {payments.map((p) => (
            <View key={p.id} style={styles.paymentCard}>
              <View style={styles.paymentLeft}>
                <Text style={styles.invoiceNumber}>{p.invoiceNumber}</Text>
                <Text style={styles.clientCase}>
                  {p.clientName} • {p.caseName}
                </Text>
                <Text style={styles.paymentDate}>{p.date}</Text>
              </View>
              <View style={styles.paymentRight}>
                <Text
                  style={[
                    styles.amount,
                    { color: p.status === 'PAID' ? COLORS.green : COLORS.red },
                  ]}
                >
                  {p.amount}
                </Text>
                <StatusBadge
                  label={p.status}
                  variant={p.status === 'PAID' ? 'COMPLETED' : 'DEADLINE'}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginVertical: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  paymentLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  clientCase: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  paymentRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
  },
});
