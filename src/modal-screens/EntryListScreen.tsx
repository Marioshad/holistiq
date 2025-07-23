import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { Entry, EntryCategory } from '../types';
import EntryService from '../services/EntryService';
import ConfirmationModal from '../components/ConfirmationModal';
import DebugOverlay from '../components/DebugOverlay';
import { shadows } from '../styles/styleGuide';

interface EntryListScreenProps {
  navigation: any;
  route: {
    params: {
      category: EntryCategory;
    };
  };
}

const EntryListScreen: React.FC<EntryListScreenProps> = ({ navigation, route }) => {
  const { category } = route.params;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<Entry | null>(null);
  const [sheetMode, setSheetMode] = useState<'select' | 'add'>('select');

  const categoryTitles = {
    nutrition: 'Nutrition',
    supplements: 'Supplements',
    vitamins: 'Vitamins',
    exercise: 'Exercise',
    mind: 'Mind Activities',
  };

  const categoryIcons = {
    nutrition: 'food-apple',
    supplements: 'bottle-soda',
    vitamins: 'pill',
    fitness: 'dumbbell',
    wellness: 'meditation',
    health: 'heart-pulse',
    medicine: 'medical-bag',
    exercise: 'dumbbell', // fallback for legacy data
    mind: 'meditation',   // fallback for legacy data
  };

  const categoryColors = {
    nutrition: '#F17FB1',
    supplements: '#66B6FF',
    vitamins: '#FEC260',
    fitness: '#8A65F3',
    wellness: '#8EF0C9',
    health: '#6A4DD7',
    medicine: '#FFD57E',
  };

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const loadedEntries = await EntryService.getEntriesByCategory(category);
      setEntries(loadedEntries);
      setFilteredEntries(loadedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load entries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [category])
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.label?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEntries(filtered);
    }
  }, [searchQuery, entries]);

  const handleDeleteEntry = (entry: Entry) => {
    setEntryToDelete(entry);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      try {
        await EntryService.deleteEntry(entryToDelete.id);
        await loadEntries();
        setDeleteModalVisible(false);
        setEntryToDelete(null);
      } catch (error) {
        console.error('Error deleting entry:', error);
        Alert.alert('Error', 'Failed to delete entry. Please try again.');
      }
    }
  };

  const neumorphicShadow = shadows.md; // Use style guide shadow instead of custom platform logic

  const renderEntry = ({ item }: { item: Entry }) => (
    <View style={[
      styles.entryCard,
      {
        backgroundColor: (categoryColors[item.category] || '#fff'),
        borderRadius: 16,
        marginBottom: 16,
        ...neumorphicShadow,
      },
    ]}>
      {/* Semi-transparent overlay */}
      <View style={styles.overlay} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: (categoryColors[item.category] || '#fff') + '70',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}>
          <MaterialCommunityIcons name={categoryIcons[item.category] as any} size={22} color="#5b5b5b" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 2 }}>{item.title}</Text>
          {item.label && <Text style={{ fontSize: 14, color: '#6B7280' }}>{item.label}</Text>}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 4 }}
            onPress={() => navigation.navigate('AddEditEntry', { category: item.category, entry: item, isEditing: true })}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => handleDeleteEntry(item)}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      {item.description && (
        <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 8 }}>{item.description}</Text>
      )}
      {/* Add more details as needed */}
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F8FD" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <View style={[styles.categoryIcon, { backgroundColor: categoryColors[category] }]}>
              <MaterialCommunityIcons name={categoryIcons[category] as any} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>{categoryTitles[category]}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              navigation.navigate('AddEditEntry', { category });
            }}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#8A65F3"  style={{backgroundColor: '#8A65F340',width: 35, height: 35, borderRadius: 12, borderWidth: 2, padding: 5, borderColor: '#8A65F3', display: 'flex', alignItems: 'center', justifyContent: 'center'}} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{ backgroundColor: '#c49aff', borderRadius: 12, marginHorizontal: 12, marginBottom: 12 }}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
              <TextInput
                style={[styles.searchInput, { backgroundColor: 'transparent' }]}
                placeholder="Search entries..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialCommunityIcons name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Entries List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading entries...</Text>
          </View>
        ) : filteredEntries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name={categoryIcons[category] as any} size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No {categoryTitles[category]} Yet</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'No entries match your search' : 'Get started by adding your first entry'}
            </Text>
            <View style={{ borderRadius: 12, marginTop: 16, alignItems: 'center' }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#8A65F3', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8, gap: 8, ...neumorphicShadow }}
                  onPress={() => {
                    navigation.navigate('AddEditEntry', { category });
                  }}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>Add Entry</Text>
                </TouchableOpacity>
              </View>
          </View>
        ) : (
          <View>
          <FlatList
            data={filteredEntries}
            renderItem={renderEntry}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[categoryColors[category]]}
              />
            }
          />
          <View style={{ borderRadius: 12, marginTop: 16, alignItems: 'center' }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#8A65F3', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8, gap: 8, ...neumorphicShadow }}
                  onPress={() => {
                    navigation.navigate('AddEditEntry', { category });
                  }}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>Add Entry</Text>
                </TouchableOpacity>
              </View>
          </View>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          visible={deleteModalVisible}
          onClose={() => {
            setDeleteModalVisible(false);
            setEntryToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Entry"
          message={`Are you sure you want to delete "${entryToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          isDangerous={true}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  listContainer: {
    padding: 20,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.md, // Use style guide shadow instead of custom platform logic
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  entryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  entryDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  supplementDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  detailChipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.56)', // or adjust for your opacity/color
    zIndex: 0,
  },
});

export default EntryListScreen; 