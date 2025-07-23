import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { EntryCategory } from '../../types';
import EntryService from '../../services/EntryService';
import DebugOverlay from '../../components/DebugOverlay';
import { shadows } from '../../styles/styleGuide';

interface EntryManagementScreenProps {
  navigation: any;
}

const EntryManagementScreen: React.FC<EntryManagementScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState<{
    totalEntries: number;
    entriesByCategory: Record<EntryCategory, number>;
    recentEntries: any[];
  }>({
    totalEntries: 0,
    entriesByCategory: {
      nutrition: 0,
      supplements: 0,
      vitamins: 0,
      fitness: 0,
      wellness: 0,
      health: 0,
      medicine: 0,
    },
    recentEntries: [],
  });

  const categories = [
    {
      id: 'nutrition' as EntryCategory,
      title: 'Nutrition',
      icon: 'food-apple',
      color: '#F17FB1', // COLORS.alert
      description: 'Meals and food items',
    },
    {
      id: 'supplements' as EntryCategory,
      title: 'Supplements',
      icon: 'bottle-soda',
      color: '#66B6FF', // COLORS.secondary
      description: 'Pills, capsules, powders',
    },
    {
      id: 'vitamins' as EntryCategory,
      title: 'Vitamins',
      icon: 'pill',
      color: '#FEC260', // COLORS.yellow
      description: 'Vitamins and minerals',
    },
    {
      id: 'fitness' as EntryCategory,
      title: 'Fitness',
      icon: 'dumbbell',
      color: '#8A65F3', // COLORS.primary
      description: 'Workouts and activities',
    },
    {
      id: 'wellness' as EntryCategory,
      title: 'Wellness',
      icon: 'meditation',
      color: '#8EF0C9', // COLORS.success
      description: 'Meditation, mindfulness, self-care',
    },
    {
      id: 'health' as EntryCategory,
      title: 'Health',
      icon: 'heart-pulse',
      color: '#6A4DD7', // COLORS.primaryDark
      description: 'Medical appointments, monitoring',
    },
    {
      id: 'medicine' as EntryCategory,
      title: 'Medicine',
      icon: 'medical-bag',
      color: '#FFD57E',
      description: 'Prescriptions, medications',
    },
  ];

  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  const loadStats = async () => {
    try {
      const entryStats = await EntryService.getEntryStats();
      setStats(entryStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const handleCategoryPress = (category: EntryCategory) => {
    navigation.navigate('EntryList', { category });
  };

  const handleAddEntry = () => {
    setCategoryPickerVisible(true);
  };

  const handleCategorySelectForAdd = (categoryId: EntryCategory) => {
    setCategoryPickerVisible(false);
    navigation.navigate('AddEditEntry', { category: categoryId });
  };

  const renderCategoryCard = (category: typeof categories[0]) => (
    <TouchableOpacity
      key={category.id}
      style=
      {[styles.categoryCard, 
        { 
          backgroundColor: category.color, // solid base
          borderLeftColor: category.color 
        }
      ]}
      onPress={() => handleCategoryPress(category.id)}
    >
      {/* Semi-transparent overlay */}
      <View style={styles.overlay} />
      <View style={styles.categoryContent}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '70' }]}> 
          <MaterialCommunityIcons name={category.icon as any} size={24} color="#5b5b5b" />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
        </View>
      </View>
      <View style={styles.categoryMeta}>
        <Text style={styles.entryCount}>
          {stats.entriesByCategory[category.id] || 0} entries
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <DebugOverlay filename="EntryManagementScreen.tsx" type="screen" />
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FD" />
      
      {/* Header */}
      <View style={styles.headerModern}>
        <Text style={styles.headerTitleModern}>Entry Management</Text>
        <TouchableOpacity style={styles.addButtonModern} onPress={handleAddEntry}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <Modal
        visible={categoryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={styles.modalCategoryButton}
                onPress={() => handleCategorySelectForAdd(cat.id)}
              >
                <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} style={{ marginRight: 12 }} />
                <Text style={styles.modalCategoryText}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setCategoryPickerVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalEntries}</Text>
              <Text style={styles.statLabel}>Total Entries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{categories.length}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.recentEntries.length}</Text>
              <Text style={styles.statLabel}>Recent</Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {categories.map(renderCategoryCard)}
        </View>

        {/* Recent Entries */}
        {stats.recentEntries.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Recent Entries</Text>
            {stats.recentEntries.slice(0, 5).map((entry, index) => (
              <View key={entry.id} style={styles.recentItem}>
                <View style={styles.recentIcon}>
                  <MaterialCommunityIcons 
                    name={categories.find(c => c.id === entry.category)?.icon as any} 
                    size={16} 
                    color={categories.find(c => c.id === entry.category)?.color || '#6B7280'} 
                  />
                </View>
                <View style={styles.recentContent}>
                  <Text style={styles.recentTitle}>{entry.title}</Text>
                  <Text style={styles.recentCategory}>
                    {categories.find(c => c.id === entry.category)?.title || entry.category}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EntryList', { category: entry.category })}
                >
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm, // Use style guide shadow instead of custom platform logic
  },
  headerModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.md, // Use style guide shadow instead of custom platform logic
  },
  headerTitleModern: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  addButtonModern: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8A65F3',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md, // Use style guide shadow instead of custom platform logic
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: 320,
    alignItems: 'center',
    ...shadows.lg, // Use style guide shadow instead of custom platform logic
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  modalCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F7F8FD',
    width: '100%',
  },
  modalCategoryText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  modalCancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#8A65F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md, // Use style guide shadow instead of custom platform logic
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    ...shadows.md, // Use style guide shadow instead of custom platform logic
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.56)', // or adjust for your opacity/color
    zIndex: 0,
  },
  entryCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  recentContainer: {
    marginBottom: 24,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    ...shadows.sm, // Use style guide shadow instead of custom platform logic
  },
  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  recentCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default EntryManagementScreen; 