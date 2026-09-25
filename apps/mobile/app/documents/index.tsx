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
import { COLORS, SPACING } from '../../src/theme/tokens';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { FilterPills } from '../../src/components/ui/FilterPills';
import { DocumentCard } from '../../src/components/ui/DocumentCard';
import { SearchBar } from '../../src/components/ui/SearchBar';
import { apiClient } from '../../src/lib/api-client';

interface DocItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  category: string;
}

const INITIAL_DOCS: DocItem[] = [
  {
    id: '1',
    title: 'Petition.pdf',
    subtitle: 'Sharma vs Singh • 14 Aug 2025',
    type: 'PDF',
    category: 'Case Files',
  },
  {
    id: '2',
    title: 'Evidence_1.pdf',
    subtitle: 'Sharma vs Singh • 02 Sep 2025',
    type: 'PDF',
    category: 'Case Files',
  },
  {
    id: '3',
    title: 'Court Order.pdf',
    subtitle: 'Sharma vs Singh • 18 Sep 2025',
    type: 'PDF',
    category: 'Case Files',
  },
  {
    id: '4',
    title: 'Agreement.pdf',
    subtitle: 'ABC Ltd vs XYZ • 10 Jan 2025',
    type: 'DOC',
    category: 'Case Files',
  },
  {
    id: '5',
    title: 'Id_Proofs.zip',
    subtitle: 'Client Documents • 21 May 2025',
    type: 'ZIP',
    category: 'Client Docs',
  },
  {
    id: '6',
    title: 'Draft_Arguments.docx',
    subtitle: 'Templates • 15 Apr 2025',
    type: 'DOC',
    category: 'Templates',
  },
];

export default function DocumentsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await apiClient.get<DocItem[]>('/documents');
      if (Array.isArray(res) && res.length > 0) {
        setDocs(res);
      }
    } catch {
      // Keeps Figma design documents
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'All') return true;
      return doc.category === selectedCategory;
    });
  }, [docs, searchQuery, selectedCategory]);

  const handleDocOptions = (doc: DocItem) => {
    Alert.alert(doc.title, 'Choose an action', [
      { text: 'View Document' },
      { text: 'Share File' },
      { text: 'Download' },
      { text: 'Delete', style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <ScreenHeader
          title="Documents"
          centeredTitle
          showBack
          rightAction={
            <TouchableOpacity
              onPress={() => setSearchOpen(!searchOpen)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={searchOpen ? 'close' : 'search-outline'}
                size={22}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
          }
        />

        {searchOpen && (
          <SearchBar
            placeholder="Search documents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        )}

        {/* Filter Pills */}
        <FilterPills
          options={['All', 'Case Files', 'Client Docs', 'Templates']}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Document Items List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {filteredDocs.map((item) => (
            <DocumentCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              type={item.type}
              onPress={() => handleDocOptions(item)}
              onOptionsPress={() => handleDocOptions(item)}
            />
          ))}

          {filteredDocs.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No documents in this category</Text>
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
