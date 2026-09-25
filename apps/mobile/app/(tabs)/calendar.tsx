import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../src/theme/tokens';
import { DatePickerStrip, DayItem } from '../../src/components/ui/DatePickerStrip';
import { ScheduleCard } from '../../src/components/ui/ScheduleCard';
import { StatusVariant } from '../../src/components/ui/StatusBadge';
import { apiClient } from '../../src/lib/api-client';

interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeVariant: StatusVariant;
  accentColor: string;
  caseId?: string;
}

const WEEK_DAYS: DayItem[] = [
  { dayName: 'Mon', dayNumber: 22, dateString: '2025-09-22' },
  { dayName: 'Tue', dayNumber: 23, dateString: '2025-09-23' },
  { dayName: 'Wed', dayNumber: 24, dateString: '2025-09-24' },
  { dayName: 'Thu', dayNumber: 25, dateString: '2025-09-25' },
  { dayName: 'Fri', dayNumber: 26, dateString: '2025-09-26' },
  { dayName: 'Sat', dayNumber: 27, dateString: '2025-09-27' },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    time: '10:30 AM',
    title: 'Sharma vs Singh',
    subtitle: 'District Court • Court Room 4',
    badgeLabel: 'HEARING',
    badgeVariant: 'HEARING',
    accentColor: COLORS.blue,
    caseId: '1',
  },
  {
    id: '2',
    time: '12:30 PM',
    title: 'Client Meeting',
    subtitle: 'Video Call',
    badgeLabel: 'MEETING',
    badgeVariant: 'MEETING',
    accentColor: COLORS.green,
  },
  {
    id: '3',
    time: '02:30 PM',
    title: 'ABC Ltd vs XYZ',
    subtitle: 'High Court • Court Room 12',
    badgeLabel: 'HEARING',
    badgeVariant: 'HEARING',
    accentColor: COLORS.blue,
    caseId: '2',
  },
  {
    id: '4',
    time: '04:30 PM',
    title: 'File Affidavit',
    subtitle: 'Deadline',
    badgeLabel: 'DEADLINE',
    badgeVariant: 'DEADLINE',
    accentColor: COLORS.red,
  },
];

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('2025-09-24');
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHearings = async () => {
    try {
      const res = await apiClient.get<CalendarEvent[]>('/hearings');
      if (Array.isArray(res) && res.length > 0) {
        setEvents(res);
      }
    } catch {
      // Keeps Figma design showcase items
    }
  };

  useEffect(() => {
    fetchHearings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHearings();
    setRefreshing(false);
  };

  const handleAddEvent = () => {
    Alert.alert('New Event', 'Add a hearing, client meeting, or filing deadline.', [
      { text: 'Add Hearing' },
      { text: 'Add Meeting' },
      { text: 'Add Deadline' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddEvent}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Date Strip */}
        <DatePickerStrip
          days={WEEK_DAYS}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Selected Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>Today, 24 September 2025</Text>
        </View>

        {/* Timeline Events List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.timelineContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {events.map((evt) => (
            <View key={evt.id} style={styles.timelineRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{evt.time}</Text>
              </View>
              <View style={styles.cardColumn}>
                <ScheduleCard
                  title={evt.title}
                  subtitle={evt.subtitle}
                  badgeLabel={evt.badgeLabel}
                  badgeVariant={evt.badgeVariant}
                  accentColor={evt.accentColor}
                  onPress={() => {
                    if (evt.caseId) {
                      router.push(`/cases/${evt.caseId}`);
                    }
                  }}
                />
              </View>
            </View>
          ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateHeader: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  dateHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timelineContent: {
    paddingBottom: SPACING.xxl,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  timeColumn: {
    width: 68,
    paddingTop: SPACING.md,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  cardColumn: {
    flex: 1,
  },
});
