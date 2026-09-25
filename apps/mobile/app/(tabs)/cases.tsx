import React, { useState, useEffect, useMemo } from 'react';
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
import { SearchBar } from '../../src/components/ui/SearchBar';
import { FilterPills } from '../../src/components/ui/FilterPills';
import { CaseCard } from '../../src/components/ui/CaseCard';
import { apiClient } from '../../src/lib/api-client';

interface CaseItem {
  id: string;
  title: string;
  status: 'ONGOING' | 'COMPLETED' | 'ON HOLD';
  subtitle: string;
  nextHearingDate: string;
}

const INITIAL_CASES: CaseItem[] = [
  {
    id: '1',
    title: 'Sharma vs Singh',
    status: 'ONGOING',
    subtitle: 'Civil • District Court • 2024/00123',
    nextHearingDate: '24 Sep 2025',
  },
  {
    id: '2',
    title: 'ABC Ltd vs XYZ',
    status: 'ONGOING',
    subtitle: 'Commercial • High Court • 2024/00347',
    nextHearingDate: '12 Oct 2025',
  },
  {
    id: '3',
    title: 'Patel vs State',
    status: 'ONGOING',
    subtitle: 'Criminal • Sessions Court • 2024/00109',
    nextHearingDate: '21 Nov 2025',
  },
  {
    id: '4',
    title: 'Mehta vs Ramesh',
    status: 'ON HOLD',
    subtitle: 'Civil • District Court • 2024/00321',
    nextHearingDate: '18 Dec 2025',
  },
];

export default function MyCasesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [cases, setCases] = useState<CaseItem[]>(INITIAL_CASES);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCases = async () => {
    try {
      const res = await apiClient.get<CaseItem[]>('/cases');
      if (Array.isArray(res) && res.length > 0) {
        setCases(res);
      }
    } catch {
      // Retains Figma cases on fresh dev database
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCases();
    setRefreshing(false);
  };

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Ongoing') return c.status === 'ONGOING';
      if (selectedFilter === 'Completed') return c.status === 'COMPLETED';
      if (selectedFilter === 'On Hold') return c.status === 'ON HOLD';
      return true;
    });
  }, [cases, searchQuery, selectedFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Cases</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/cases/1')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <SearchBar
          placeholder="Search cases..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* Filter Pills */}
        <FilterPills
          options={['All', 'Ongoing', 'Completed', 'On Hold']}
          selected={selectedFilter}
          onSelect={setSelectedFilter}
        />

        {/* Cases List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {filteredCases.map((item) => (
            <CaseCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              status={item.status}
              statusVariant={item.status}
              nextHearingDate={item.nextHearingDate}
              onPress={() => router.push(`/cases/${item.id}`)}
            />
          ))}

          {filteredCases.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No cases match your filter</Text>
            </View>
          )}
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
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  emptyContainer: {
    paddingVertical: SPACING.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
