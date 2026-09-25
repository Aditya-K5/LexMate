import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../src/theme/tokens';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { AvatarCircle } from '../../src/components/ui/AvatarCircle';
import { SegmentedTabs } from '../../src/components/ui/SegmentedTabs';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { DocumentCard } from '../../src/components/ui/DocumentCard';
import { apiClient } from '../../src/lib/api-client';

export default function ClientProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');

  const [client, setClient] = useState({
    id: id || '1',
    name: 'Raj Sharma',
    initials: 'RS',
    email: 'raj.sharma@email.com',
    phone: '+91 98765-43210',
    totalDue: '₹20,000',
    totalPaid: '₹30,000',
    activeCases: [
      {
        id: '1',
        title: 'Sharma vs Singh',
        status: 'ONGOING',
        court: 'District Court • Case No: 2024/00123',
      },
      {
        id: '5',
        title: 'Sharma vs Verma',
        status: 'ONGOING',
        court: 'High Court • Case No: 2024/00456',
      },
    ],
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        if (id && id !== '1') {
          const res = await apiClient.get<typeof client>(`/clients/${id}`);
          if (res) setClient((prev) => ({ ...prev, ...res }));
        }
      } catch {
        // Retains Figma defaults
      }
    };
    fetchClient();
  }, [id]);

  const handleCall = () => {
    Linking.openURL(`tel:${client.phone}`).catch(() => {
      Alert.alert('Call Client', `Dialing ${client.phone}`);
    });
  };

  const handleWhatsApp = () => {
    const cleanPhone = client.phone.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${cleanPhone}`).catch(() => {
      Alert.alert('WhatsApp', `Opening WhatsApp for ${client.phone}`);
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${client.email}`).catch(() => {
      Alert.alert('Email Client', `Composing to ${client.email}`);
    });
  };

  const handleMoreOptions = () => {
    Alert.alert('Client Options', 'Choose an action for this client', [
      { text: 'Edit Client Info' },
      { text: 'Add New Case' },
      { text: 'Record Payment' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <ScreenHeader
          title="Client Profile"
          centeredTitle
          showBack
          rightAction={
            <TouchableOpacity onPress={handleMoreOptions} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          }
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Client Identity Block */}
          <View style={styles.profileHeader}>
            <AvatarCircle initials={client.initials} size={60} />
            <View style={styles.nameBlock}>
              <Text style={styles.clientName}>{client.name}</Text>
              <Text style={styles.clientMeta}>{client.email}</Text>
              <Text style={styles.clientMeta}>{client.phone}</Text>
            </View>
          </View>

          {/* Quick Action Buttons (Call, WhatsApp, Email) */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCall} activeOpacity={0.7}>
              <Ionicons name="call-outline" size={16} color={COLORS.textPrimary} />
              <Text style={styles.actionBtnText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleWhatsApp} activeOpacity={0.7}>
              <Ionicons name="chatbubble-outline" size={16} color={COLORS.textPrimary} />
              <Text style={styles.actionBtnText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleEmail} activeOpacity={0.7}>
              <Ionicons name="mail-outline" size={16} color={COLORS.textPrimary} />
              <Text style={styles.actionBtnText}>Email</Text>
            </TouchableOpacity>
          </View>

          {/* 4 Segmented Tabs */}
          <SegmentedTabs
            tabs={['Overview', 'Cases', 'Payments', 'Documents']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          {activeTab === 'Overview' && (
            <View>
              {/* Active Cases Section */}
              <Text style={styles.sectionHeading}>
                Active Cases ({client.activeCases.length})
              </Text>
              {client.activeCases.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.caseCard}
                  onPress={() => router.push(`/cases/${c.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.caseTopRow}>
                    <Text style={styles.caseTitle} numberOfLines={1}>
                      {c.title}
                    </Text>
                    <StatusBadge label={c.status} variant="ONGOING" />
                  </View>
                  <Text style={styles.caseSubtitle} numberOfLines={1}>
                    {c.court}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Payment Summary Section */}
              <Text style={[styles.sectionHeading, { marginTop: SPACING.lg }]}>
                Payment Summary
              </Text>
              <View style={styles.paymentsRow}>
                <View style={styles.paymentCard}>
                  <Text style={styles.paymentLabel}>Total Due</Text>
                  <Text style={[styles.paymentValue, { color: COLORS.red }]}>
                    {client.totalDue}
                  </Text>
                </View>

                <View style={styles.paymentCard}>
                  <Text style={styles.paymentLabel}>Total Paid</Text>
                  <Text style={[styles.paymentValue, { color: COLORS.green }]}>
                    {client.totalPaid}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'Cases' && (
            <View>
              <Text style={styles.sectionHeading}>All Client Cases ({client.activeCases.length})</Text>
              {client.activeCases.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.caseCard}
                  onPress={() => router.push(`/cases/${c.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.caseTopRow}>
                    <Text style={styles.caseTitle}>{c.title}</Text>
                    <StatusBadge label={c.status} variant="ONGOING" />
                  </View>
                  <Text style={styles.caseSubtitle}>{c.court}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'Payments' && (
            <View>
              <Text style={styles.sectionHeading}>Payment Invoices</Text>
              <View style={styles.invoiceCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invoiceTitle}>Retainer Invoice #INV-2025-01</Text>
                  <Text style={styles.invoiceSubtitle}>Sharma vs Singh • Due 15 Sep 2025</Text>
                </View>
                <Text style={[styles.paymentValue, { color: COLORS.green }]}>₹30,000</Text>
              </View>

              <View style={styles.invoiceCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invoiceTitle}>Hearing Appearance #INV-2025-02</Text>
                  <Text style={styles.invoiceSubtitle}>Sharma vs Verma • Due 30 Sep 2025</Text>
                </View>
                <Text style={[styles.paymentValue, { color: COLORS.red }]}>₹20,000</Text>
              </View>
            </View>
          )}

          {activeTab === 'Documents' && (
            <View>
              <Text style={styles.sectionHeading}>Client Documents ({2})</Text>
              <DocumentCard
                title="Id_Proofs.zip"
                subtitle="Client Documents • 21 May 2025"
                type="ZIP"
              />
              <DocumentCard
                title="Vakalatnama_Signed.pdf"
                subtitle="Sharma vs Singh • 14 Aug 2025"
                type="PDF"
              />
            </View>
          )}
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
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  nameBlock: {
    marginLeft: SPACING.lg,
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  clientMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  caseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  caseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  caseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  caseSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  paymentsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  paymentLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  invoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  invoiceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  invoiceSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
