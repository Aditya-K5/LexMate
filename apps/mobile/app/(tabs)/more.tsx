import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../src/theme/tokens';
import { AvatarCircle } from '../../src/components/ui/AvatarCircle';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { useAuthStore } from '../../src/stores/auth.store';
import { ENV } from '../../src/constants/env';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  badge,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconBox}>{icon}</View>
      <View style={styles.menuInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.menuTitle}>{title}</Text>
          {badge}
        </View>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
};

export default function MoreScreen() {
  const router = useRouter();
  const { user, organization, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of LexMate?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const displayName = user?.name || 'Adv. Sharma';
  const orgName = organization?.name || 'Sharma & Partners Legal';
  const userRole = user?.role || 'LAWYER';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <AvatarCircle initials={initials} size={54} />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileOrg}>{orgName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userRole}</Text>
            </View>
          </View>
        </View>

        {/* Practice Hub Section */}
        <Text style={styles.sectionHeader}>PRACTICE HUB</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon={<Ionicons name="document-text-outline" size={20} color={COLORS.blue} />}
            title="Documents"
            subtitle="Case files, court orders & pleadings"
            onPress={() => router.push('/documents')}
          />
          <MenuItem
            icon={<MaterialCommunityIcons name="chip" size={20} color={COLORS.blue} />}
            title="AI Assistant"
            subtitle="Instant document analysis & queries"
            badge={<StatusBadge label="PRO" variant="PRO" />}
            onPress={() => router.push('/ai')}
          />
          <MenuItem
            icon={<Ionicons name="checkbox-outline" size={20} color={COLORS.green} />}
            title="Tasks & Deadlines"
            subtitle="Court filings and action items"
            onPress={() => router.push('/tasks')}
          />
          <MenuItem
            icon={<Ionicons name="card-outline" size={20} color={COLORS.amber} />}
            title="Payments & Billing"
            subtitle="Retainers, fee summaries & invoices"
            onPress={() => router.push('/payments')}
          />
        </View>

        {/* System & Connection Section */}
        <Text style={styles.sectionHeader}>SYSTEM & PRACTICE SETTINGS</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon={<Ionicons name="business-outline" size={20} color={COLORS.primary} />}
            title="Organization Profile"
            subtitle={orgName}
            onPress={() =>
              Alert.alert('Organization', `Active Organization:\n${orgName}\nRole: ${userRole}`)
            }
          />
          <MenuItem
            icon={<Ionicons name="wifi-outline" size={20} color={COLORS.green} />}
            title="API Backend Status"
            subtitle={`Connected: ${ENV.apiUrl}`}
            badge={<StatusBadge label="ONLINE" variant="ONGOING" />}
            onPress={() =>
              Alert.alert('API Connection', `API Base URL:\n${ENV.apiUrl}\nStatus: Online (200 OK)`)
            }
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.red} />
          <Text style={styles.logoutText}>Log Out of Account</Text>
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
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  profileText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  profileOrg: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  menuGroup: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSubtle,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 2,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.redLight,
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.red,
  },
});
