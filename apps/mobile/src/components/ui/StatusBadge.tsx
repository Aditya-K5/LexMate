import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme/tokens';

export type StatusVariant =
  | 'HEARING'
  | 'MEETING'
  | 'ONGOING'
  | 'ON HOLD'
  | 'DEADLINE'
  | 'PRO'
  | 'COMPLETED'
  | 'PENDING';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant }) => {
  const norm = (variant || label).toUpperCase() as StatusVariant;

  let bg = COLORS.surfaceSubtle;
  let text = COLORS.textSecondary;

  if (norm === 'HEARING' || norm === 'PRO') {
    bg = norm === 'PRO' ? COLORS.blueBadge : COLORS.blueLight;
    text = COLORS.blue;
  } else if (norm === 'MEETING' || norm === 'ONGOING') {
    bg = COLORS.greenLight;
    text = COLORS.greenDark;
  } else if (norm === 'ON HOLD' || norm === 'PENDING') {
    bg = COLORS.amberLight;
    text = COLORS.amberDark;
  } else if (norm === 'DEADLINE') {
    bg = COLORS.redLight;
    text = COLORS.red;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
