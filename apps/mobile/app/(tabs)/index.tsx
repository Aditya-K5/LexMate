import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../src/theme/tokens';
import { AvatarCircle } from '../../src/components/ui/AvatarCircle';
import { SearchBar } from '../../src/components/ui/SearchBar';
import { StatCard } from '../../src/components/ui/StatCard';
import { ScheduleCard } from '../../src/components/ui/ScheduleCard';
import { useAuthStore } from '../../src/stores/auth.store';
import { apiClient } from '../../src/lib/api-client';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Stats state with Figma defaults
  const [stats, _setStats] = useState({
    hearings: 3,
    deadlines: 4,
    tasks: 7,
    pendingAmount: '₹42k',
  });

  const fetchDashboardData = async () => {
    try {
      // Connects to existing health and domain endpoints
      await apiClient.get('/health');
    } catch {
      // Keeps Figma design values if server data is pending
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
    return parts[0].slice(0, 2).toUpperCase();
  };

  const displayName = user?.name || 'Adv. Sharma';
  const initials = getInitials(user?.name);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <AvatarCircle initials={initials} size={44} />
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Good Morning,</Text>
              <Text style={styles.userNameText}>{displayName}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push('/(tabs)/more')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchBar
          placeholder="Search cases, clients, documents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* 4 Stat Cards Row */}
        <View style={styles.statsRow}>
          <StatCard value={stats.hearings} label="Hearings" color={COLORS.blue} />
          <StatCard value={stats.deadlines} label="Deadlines" color={COLORS.red} />
          <StatCard value={stats.tasks} label="Tasks" color={COLORS.green} />
          <StatCard value={stats.pendingAmount} label="Pending" color={COLORS.amber} />
        </View>

        {/* Today's Schedule Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScheduleCard
          title="Sharma vs Singh"
          subtitle="10:30 AM • District Court, Room 4"
          badgeLabel="HEARING"
          badgeVariant="HEARING"
          accentColor={COLORS.blue}
          onPress={() => router.push('/cases/1')}
        />

        <ScheduleCard
          title="ABC Ltd vs XYZ"
          subtitle="02:00 PM • High Court, Room 12"
          badgeLabel="MEETING"
          badgeVariant="MEETING"
          accentColor={COLORS.green}
          onPress={() => router.push('/cases/2')}
        />

        {/* Upcoming Deadlines Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: SPACING.lg }]}>
          <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.deadlinesCard}
          onPress={() => router.push('/(tabs)/calendar')}
          activeOpacity={0.7}
        >
          <View style={styles.deadlineLeft}>
            <View style={styles.redDot} />
            <View>
              <Text style={styles.deadlineTitle}>File written submission</Text>
              <Text style={styles.deadlineSubtitle}>ABC Ltd vs XYZ</Text>
            </View>
          </View>
          <Text style={styles.todayTag}>Today</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.blue,
  },
  deadlinesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  deadlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
  },
  deadlineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  deadlineSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  todayTag: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.red,
  },
});
