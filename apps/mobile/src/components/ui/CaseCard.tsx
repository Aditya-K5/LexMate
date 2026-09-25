import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../theme/tokens';
import { StatusBadge, StatusVariant } from './StatusBadge';

interface CaseCardProps {
  title: string;
  subtitle: string;
  status: string;
  statusVariant?: StatusVariant;
  nextHearingDate?: string;
  onPress: () => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({
  title,
  subtitle,
  status,
  statusVariant,
  nextHearingDate,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <StatusBadge label={status} variant={statusVariant} />
      </View>

      <Text style={styles.subtitle} numberOfLines={1}>
        {subtitle}
      </Text>

      {nextHearingDate && (
        <View style={styles.bottomRow}>
          <Text style={styles.hearingLabel}>
            Next Hearing:{' '}
            <Text style={styles.hearingValue}>{nextHearingDate}</Text>
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceSubtle,
    paddingTop: SPACING.sm,
    marginTop: 2,
  },
  hearingLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  hearingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
