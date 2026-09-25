import React, { useState, useEffect, useMemo } from 'react';
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
import { COLORS, RADIUS, SPACING } from '../../src/theme/tokens';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { FilterPills } from '../../src/components/ui/FilterPills';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { apiClient } from '../../src/lib/api-client';

interface TaskItem {
  id: string;
  title: string;
  caseName: string;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  completed: boolean;
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: '1',
    title: 'File written submission',
    caseName: 'Sharma vs Singh',
    dueDate: 'Today, 24 Sep 2025',
    priority: 'HIGH',
    completed: false,
  },
  {
    id: '2',
    title: 'Client affidavit notarization',
    caseName: 'ABC Ltd vs XYZ',
    dueDate: 'Tomorrow, 25 Sep 2025',
    priority: 'HIGH',
    completed: false,
  },
  {
    id: '3',
    title: 'Witness cross-examination notes',
    caseName: 'Patel vs State',
    dueDate: '28 Sep 2025',
    priority: 'MEDIUM',
    completed: false,
  },
  {
    id: '4',
    title: 'Draft rejoinder notice',
    caseName: 'Mehta vs Ramesh',
    dueDate: '15 Oct 2025',
    priority: 'LOW',
    completed: true,
  },
];

export default function TasksScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await apiClient.get<TaskItem[]>('/tasks');
      if (Array.isArray(res) && res.length > 0) {
        setTasks(res);
      }
    } catch {
      // Retains default tasks
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Pending') return !t.completed;
      if (selectedFilter === 'Completed') return t.completed;
      return true;
    });
  }, [tasks, selectedFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader
          title="Tasks & Deadlines"
          centeredTitle
          showBack
          rightAction={
            <TouchableOpacity
              onPress={() => Alert.alert('Add Task', 'Create new court deadline or task')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="add" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          }
        />

        <FilterPills
          options={['All', 'Pending', 'Completed']}
          selected={selectedFilter}
          onSelect={setSelectedFilter}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {filteredTasks.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.taskCard}
              onPress={() => toggleTask(t.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={t.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={t.completed ? COLORS.green : COLORS.textMuted}
                style={styles.checkIcon}
              />
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, t.completed && styles.completedTitle]}>
                  {t.title}
                </Text>
                <Text style={styles.taskMeta}>
                  {t.caseName} • Due: {t.dueDate}
                </Text>
              </View>
              <StatusBadge
                label={t.completed ? 'DONE' : t.priority}
                variant={t.completed ? 'COMPLETED' : t.priority === 'HIGH' ? 'DEADLINE' : 'PENDING'}
              />
            </TouchableOpacity>
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
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  checkIcon: {
    marginRight: SPACING.md,
  },
  taskInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  taskMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
