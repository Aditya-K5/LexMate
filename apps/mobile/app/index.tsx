import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS, RADIUS, SPACING } from '../src/theme/tokens';
import { AppButton } from '../src/components/ui/AppButton';
import { useAuthStore } from '../src/stores/auth.store';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Top/Center Content */}
        <View style={styles.heroSection}>
          {/* Scales of Justice Icon Container */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="scale-balance"
              size={48}
              color={COLORS.textInverse}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>LexMate</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Your Practice. Organized.</Text>

          {/* Description */}
          <Text style={styles.description}>
            Manage your cases, clients, hearings, documents and billing — all in one unified place.
          </Text>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionSection}>
          <AppButton
            title="Get Started"
            variant="secondary"
            onPress={() => router.push('/(auth)/register')}
            style={styles.getStartedButton}
          />
          <AppButton
            title="Log In"
            variant="darkOutline"
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
          />
          <AppButton
            title="Continue to App"
            variant="darkOutline"
            onPress={() => router.replace('/(tabs)')}
            style={styles.guestButton}
            textStyle={styles.guestText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.xxl,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xl,
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textInverse,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  actionSection: {
    gap: SPACING.md,
    paddingBottom: SPACING.md,
  },
  getStartedButton: {
    backgroundColor: COLORS.surface,
  },
  loginButton: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.borderDark,
  },
  guestButton: {
    height: 38,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  guestText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
