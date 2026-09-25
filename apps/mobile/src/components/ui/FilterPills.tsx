import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme/tokens';

interface FilterPillsProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  options,
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => {
          const isActive = option === selected;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.pill,
                isActive ? styles.activePill : styles.inactivePill,
              ]}
              onPress={() => onSelect(option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  isActive ? styles.activeText : styles.inactiveText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  scrollContent: {
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  pill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  inactivePill: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeText: {
    color: COLORS.textInverse,
  },
  inactiveText: {
    color: COLORS.textSecondary,
  },
});
