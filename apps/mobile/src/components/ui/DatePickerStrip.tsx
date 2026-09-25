import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme/tokens';

export interface DayItem {
  dayName: string; // "Mon", "Tue", etc.
  dayNumber: number; // 22, 23, etc.
  dateString: string; // ISO date or unique key
}

interface DatePickerStripProps {
  days: DayItem[];
  selectedDate: string;
  onSelectDate: (dateString: string) => void;
}

export const DatePickerStrip: React.FC<DatePickerStripProps> = ({
  days,
  selectedDate,
  onSelectDate,
}) => {
  return (
    <View style={styles.container}>
      {days.map((item) => {
        const isSelected = item.dateString === selectedDate;
        return (
          <TouchableOpacity
            key={item.dateString}
            style={[styles.dayCard, isSelected && styles.selectedDayCard]}
            onPress={() => onSelectDate(item.dateString)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayName,
                isSelected ? styles.selectedText : styles.unselectedName,
              ]}
            >
              {item.dayName}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                isSelected ? styles.selectedText : styles.unselectedNumber,
              ]}
            >
              {item.dayNumber}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
  },
  dayCard: {
    flex: 1,
    maxWidth: 50,
    height: 64,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  selectedDayCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  selectedText: {
    color: COLORS.textInverse,
  },
  unselectedName: {
    color: COLORS.textSecondary,
  },
  unselectedNumber: {
    color: COLORS.textPrimary,
  },
});
