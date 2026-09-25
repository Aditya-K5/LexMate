import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../theme/tokens';

interface FileBadgeProps {
  type: string;
}

export const FileBadge: React.FC<FileBadgeProps> = ({ type }) => {
  const norm = type.toUpperCase();
  let bg = COLORS.surfaceSubtle;
  let color = COLORS.textSecondary;

  if (norm.includes('PDF')) {
    bg = COLORS.redLight;
    color = COLORS.red;
  } else if (norm.includes('DOC') || norm.includes('WORD')) {
    bg = COLORS.blueLight;
    color = COLORS.blue;
  } else if (norm.includes('ZIP') || norm.includes('ARCHIVE')) {
    bg = COLORS.greenLight;
    color = COLORS.greenDark;
  }

  const label = norm.includes('PDF')
    ? 'PDF'
    : norm.includes('ZIP')
    ? 'ZIP'
    : norm.includes('DOC')
    ? 'DOC'
    : norm.slice(0, 3);

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

interface DocumentCardProps {
  title: string;
  subtitle: string;
  type: string;
  onPress?: () => void;
  onOptionsPress?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  subtitle,
  type,
  onPress,
  onOptionsPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <FileBadge type={type} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onOptionsPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  info: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
