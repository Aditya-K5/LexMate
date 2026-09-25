import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../src/theme/tokens';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { SegmentedTabs } from '../../src/components/ui/SegmentedTabs';
import { DocumentCard } from '../../src/components/ui/DocumentCard';
import { ScheduleCard } from '../../src/components/ui/ScheduleCard';
import { AppButton } from '../../src/components/ui/AppButton';
import { apiClient } from '../../src/lib/api-client';

export default function CaseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');

  // Case details matching Figma Screen 4
  const [caseData, setCaseData] = useState({
    title: 'Sharma vs Singh',
    status: 'ONGOING',
    caseType: 'Civil Suit',
    court: 'District Court',
    caseNumber: '2024/00123',
    clientName: 'Raj Sharma',
    clientId: '1',
    nextHearingDate: '24 Sep 2025',
    parties: 'Sharma (Plaintiff) vs Singh (Defendant)',
    currentStage: 'Evidence',
    financials: {
      totalFee: '₹50,000',
      paid: '₹30,000',
      pending: '₹20,000',
    },
  });

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        if (id && id !== '1') {
          const res = await apiClient.get<typeof caseData>(`/cases/${id}`);
          if (res) setCaseData((prev) => ({ ...prev, ...res }));
        }
      } catch {
        // Retains Figma showcase data
      }
    };
    fetchCaseDetails();
  }, [id]);

  const handleMoreOptions = () => {
    Alert.alert('Case Options', 'Select an action for this case', [
      { text: 'Edit Case' },
      { text: 'Share Case Summary' },
      { text: 'Archive Case', style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleAddDocument = () => {
    router.push('/documents');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <ScreenHeader
          title="Case Details"
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
          {/* Top Title & Status Block */}
          <View style={styles.heroSection}>
            <View style={styles.heroTitleRow}>
              <Text style={styles.heroTitle}>{caseData.title}</Text>
              <StatusBadge label={caseData.status} variant="ONGOING" />
            </View>
            <Text style={styles.heroSubtitle}>
              {caseData.caseType} • {caseData.court} • Case No: {caseData.caseNumber}
            </Text>
          </View>

          {/* 3 Horizontal Metadata Boxes */}
          <View style={styles.metaRow}>
            <TouchableOpacity
              style={styles.metaCard}
              onPress={() => router.push(`/clients/${caseData.clientId}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.metaLabel}>Client</Text>
              <Text style={styles.metaValue} numberOfLines={1}>{caseData.clientName}</Text>
            </TouchableOpacity>

            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Court</Text>
              <Text style={styles.metaValue} numberOfLines={1}>{caseData.court}</Text>
            </View>

            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Next Hearing</Text>
              <Text style={styles.metaValue} numberOfLines={1}>{caseData.nextHearingDate}</Text>
            </View>
          </View>

          {/* 4 Segmented Tabs */}
          <SegmentedTabs
            tabs={['Overview', 'Timeline', 'Documents', 'Tasks']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab 1: Overview */}
          {activeTab === 'Overview' && (
            <View>
              {/* Case Summary */}
              <Text style={styles.sectionHeading}>Case Summary</Text>
              <View style={styles.card}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Parties</Text>
                  <Text style={styles.summaryValue} numberOfLines={1}>
                    {caseData.parties}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Case Type</Text>
                  <Text style={styles.summaryValue}>{caseData.caseType}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Current Stage</Text>
                  <Text style={styles.summaryValue}>{caseData.currentStage}</Text>
                </View>
                <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.summaryLabel}>Next Hearing</Text>
                  <Text style={styles.summaryValue}>{caseData.nextHearingDate}</Text>
                </View>
              </View>

              {/* Financials */}
              <Text style={[styles.sectionHeading, { marginTop: SPACING.lg }]}>Financials</Text>
              <View style={styles.financialsRow}>
                <View style={styles.financialCard}>
                  <Text style={styles.financialLabel}>Total Fee</Text>
                  <Text style={[styles.financialValue, { color: COLORS.textPrimary }]}>
                    {caseData.financials.totalFee}
                  </Text>
                </View>

                <View style={styles.financialCard}>
                  <Text style={styles.financialLabel}>Paid</Text>
                  <Text style={[styles.financialValue, { color: COLORS.green }]}>
                    {caseData.financials.paid}
                  </Text>
                </View>

                <View style={styles.financialCard}>
                  <Text style={styles.financialLabel}>Pending</Text>
                  <Text style={[styles.financialValue, { color: COLORS.red }]}>
                    {caseData.financials.pending}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Tab 2: Timeline */}
          {activeTab === 'Timeline' && (
            <View>
              <Text style={styles.sectionHeading}>Hearings & Events Timeline</Text>
              <ScheduleCard
                title="Evidence Submission"
                subtitle="District Court, Room 4 • 24 Sep 2025"
                badgeLabel="HEARING"
                badgeVariant="HEARING"
                accentColor={COLORS.blue}
              />
              <ScheduleCard
                title="Interim Arguments"
                subtitle="District Court, Room 4 • 14 Aug 2025"
                badgeLabel="COMPLETED"
                badgeVariant="COMPLETED"
                accentColor={COLORS.green}
              />
              <ScheduleCard
                title="Notice Issued to Defendants"
                subtitle="District Court • 02 Jul 2025"
                badgeLabel="COMPLETED"
                badgeVariant="COMPLETED"
                accentColor={COLORS.textMuted}
              />
            </View>
          )}

          {/* Tab 3: Documents */}
          {activeTab === 'Documents' && (
            <View>
              <Text style={styles.sectionHeading}>Case Files ({3})</Text>
              <DocumentCard
                title="Petition.pdf"
                subtitle="Sharma vs Singh • 14 Aug 2025"
                type="PDF"
              />
              <DocumentCard
                title="Evidence_1.pdf"
                subtitle="Sharma vs Singh • 02 Sep 2025"
                type="PDF"
              />
              <DocumentCard
                title="Court Order.pdf"
                subtitle="Sharma vs Singh • 18 Sep 2025"
                type="PDF"
              />
            </View>
          )}

          {/* Tab 4: Tasks */}
          {activeTab === 'Tasks' && (
            <View>
              <Text style={styles.sectionHeading}>Case Tasks ({2})</Text>
              <View style={styles.card}>
                <View style={styles.taskRow}>
                  <Ionicons name="checkbox-outline" size={20} color={COLORS.primary} />
                  <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Text style={styles.taskTitle}>File written submission</Text>
                    <Text style={styles.taskMeta}>Due: Today • High Priority</Text>
                  </View>
                  <StatusBadge label="PENDING" variant="PENDING" />
                </View>
                <View style={[styles.taskRow, { borderBottomWidth: 0, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.surfaceSubtle }]}>
                  <Ionicons name="checkbox-outline" size={20} color={COLORS.primary} />
                  <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Text style={styles.taskTitle}>Witness cross-examination notes</Text>
                    <Text style={styles.taskMeta}>Due: 23 Sep 2025</Text>
                  </View>
                  <StatusBadge label="COMPLETED" variant="COMPLETED" />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom CTA Button */}
        <View style={styles.footerContainer}>
          <AppButton
            title="Add Document"
            onPress={handleAddDocument}
            variant="primary"
          />
        </View>
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
    paddingBottom: SPACING.xxxl * 2,
  },
  heroSection: {
    marginVertical: SPACING.sm,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  metaCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSubtle,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  financialsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  financialCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  taskMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
});
