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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../src/theme/tokens';
import { SearchBar } from '../../src/components/ui/SearchBar';
import { AvatarCircle } from '../../src/components/ui/AvatarCircle';
import { apiClient } from '../../src/lib/api-client';

interface ClientItem {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  activeCasesCount: number;
}

const INITIAL_CLIENTS: ClientItem[] = [
  {
    id: '1',
    name: 'Raj Sharma',
    initials: 'RS',
    email: 'raj.sharma@email.com',
    phone: '+91 98765-43210',
    activeCasesCount: 2,
  },
  {
    id: '2',
    name: 'ABC Ltd (Corp)',
    initials: 'AB',
    email: 'legal@abcltd.com',
    phone: '+91 98111-22334',
    activeCasesCount: 1,
  },
  {
    id: '3',
    name: 'Vikram Patel',
    initials: 'VP',
    email: 'vikram.patel@gmail.com',
    phone: '+91 97234-56789',
    activeCasesCount: 1,
  },
  {
    id: '4',
    name: 'Suresh Mehta',
    initials: 'SM',
    email: 'suresh.m@mehtagroup.in',
    phone: '+91 99887-76655',
    activeCasesCount: 1,
  },
];

export default function ClientsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<ClientItem[]>(INITIAL_CLIENTS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await apiClient.get<ClientItem[]>('/clients');
      if (Array.isArray(res) && res.length > 0) {
        setClients(res);
      }
    } catch {
      // Retains Figma clients
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  };

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      return (
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
      );
    });
  }, [clients, searchQuery]);

  const handleAddClient = () => {
    Alert.alert('New Client', 'Add a client to your practice directory.', [
      { text: 'Add Individual Client' },
      { text: 'Add Corporate Client' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Clients</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddClient}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <SearchBar
          placeholder="Search clients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* Clients List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {filteredClients.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.clientCard}
              onPress={() => router.push(`/clients/${client.id}`)}
              activeOpacity={0.7}
            >
              <AvatarCircle initials={client.initials} size={46} />
              <View style={styles.clientInfo}>
                <Text style={styles.clientName} numberOfLines={1}>
                  {client.name}
                </Text>
                <Text style={styles.clientContact} numberOfLines={1}>
                  {client.email}
                </Text>
                <Text style={styles.clientPhone}>{client.phone}</Text>
              </View>

              <View style={styles.rightColumn}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{client.activeCasesCount} Cases</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          ))}

          {filteredClients.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No clients found</Text>
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
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  clientInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  clientContact: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  badge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
