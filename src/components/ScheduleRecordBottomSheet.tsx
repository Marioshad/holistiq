import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { DateTimePicker } from './forms';
import DebugOverlay from './DebugOverlay';
import {
  Entry,
  EntryCategory,
  ScheduleBottomSheetData,
  ScheduleStep,
  RootStackParamList,
} from '../types';
import EntryService from '../services/EntryService';
import ScheduleService from '../services/ScheduleService';
import { FormButton } from '../components/forms';
import { colors, shadows } from '../styles/styleGuide';
import { useToast } from '../contexts/ToastContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AddEditEntryScreen from '../modal-screens/AddEditEntryScreen';
import { Platform } from 'react-native';
import UserService from '../services/UserService';

const { width } = Dimensions.get('window');

// 🎨 STYLE GUIDE TOKENS
const COLORS = {
  primary: '#8A65F3',
  primaryDark: '#6A4DD7',
  secondary: '#66B6FF',
  alert: '#F17FB1',
  success: '#8EF0C9',
  yellow: '#FEC260',
  card: '#FFFFFF',
  background: '#F8F8FC',
  textPrimary: '#1E1E1E',
  textMuted: '#888888',
};

const FONTS = {
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.textPrimary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
};

const SHADOW = shadows.md; // Use style guide shadow instead of custom platform logic

const windowWidth = Dimensions.get("window").width;
const CARD_SIZE = Math.floor((windowWidth - 24 * 2 - 20) / 3);

const hexToRgb = (hex: string) => {
  const normalizedHex = hex.replace('#', '');
  const bigint = parseInt(normalizedHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
};

interface ScheduleRecordBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate?: string;
  onScheduleComplete?: () => void;
}

const ScheduleRecordBottomSheet: React.FC<ScheduleRecordBottomSheetProps> = ({
  isVisible,
  onClose,
  selectedDate,
  onScheduleComplete,
}) => {
  // Animation refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Gesture handler for swipe down to close
  const panGestureRef = useRef(null);
  const translateY = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      
      // Close if swiped down more than 100px or with high velocity
      if (translationY > 100 || velocityY > 500) {
        handleClose();
      } else {
        // Reset position if not swiped enough
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sheetMode, setSheetMode] = useState<'select' | 'add'>('select');

  const [scheduleData, setScheduleData] = useState<ScheduleBottomSheetData>({
    step: 'category',
    startDate: selectedDate || new Date().toISOString().split('T')[0],
  });

  const categories = [
    {
      id: 'nutrition' as EntryCategory,
      title: 'Nutrition',
      icon: 'food-apple',
      color: COLORS.alert,
      description: 'Meals and food items',
    },
    {
      id: 'supplements' as EntryCategory,
      title: 'Supplements',
      icon: 'bottle-soda',
      color: COLORS.secondary,
      description: 'Pills, capsules, powders',
    },
    {
      id: 'vitamins' as EntryCategory,
      title: 'Vitamins',
      icon: 'pill',
      color: COLORS.yellow,
      description: 'Vitamins and minerals',
    },
    {
      id: 'fitness' as EntryCategory,
      title: 'Fitness',
      icon: 'dumbbell',
      color: COLORS.primary,
      description: 'Workouts and activities',
    },
    {
      id: 'wellness' as EntryCategory,
      title: 'Wellness',
      icon: 'meditation',
      color: COLORS.success,
      description: 'Meditation, mindfulness, self-care',
    },
    {
      id: 'health' as EntryCategory,
      title: 'Health',
      icon: 'heart-pulse',
      color: COLORS.primaryDark,
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

  const categoryColors: Record<EntryCategory, string> = {
    nutrition: COLORS.alert,
    supplements: COLORS.secondary,
    vitamins: COLORS.yellow,
    fitness: COLORS.primary,
    wellness: COLORS.success,
    health: COLORS.primaryDark,
    medicine: '#FFD57E',
  };

  const { showSuccess } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (isVisible) {
      resetFlow();
      // Start animations when bottom sheet becomes visible
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when bottom sheet is hidden
      slideAnim.setValue(0);
      backdropAnim.setValue(0);
      scaleAnim.setValue(0.95);
    }
  }, [isVisible]);

  useEffect(() => {
    if (scheduleData.selectedCategory) {
      loadEntriesForCategory(scheduleData.selectedCategory);
    }
  }, [scheduleData.selectedCategory]);

  useEffect(() => {
    filterEntries();
  }, [entries, searchQuery]);

  const resetFlow = () => {
    setScheduleData({
      step: 'category',
      startDate: selectedDate || new Date().toISOString().split('T')[0],
    });
    setSearchQuery('');
  };

  const loadEntriesForCategory = async (category: EntryCategory) => {
    setIsLoading(true);
    try {
      const categoryEntries = await EntryService.getEntriesByCategory(category);
      setEntries(categoryEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load entries for this category');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEntries = () => {
    if (!searchQuery.trim()) {
      setFilteredEntries(entries);
      return;
    }

    const filtered = entries.filter((entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.description && entry.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.label && entry.label.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredEntries(filtered);
  };

  const handleCategorySelect = (category: EntryCategory) => {
    setScheduleData(prev => ({
      ...prev,
      step: 'record',
      selectedCategory: category,
    }));
  };

  const handleRecordSelect = (entry: Entry) => {
    setScheduleData(prev => ({
      ...prev,
      step: 'schedule',
      selectedEntry: entry,
    }));
  };

  const handleCreateNewRecord = () => {
    // Check if user's email is verified
    if (!UserService.isEmailVerified()) {
      Alert.alert(
        'Email Verification Required',
        'Please verify your email address before creating new entries. Check your email for a verification link.',
        [
          { text: 'OK', style: 'cancel' },
          { 
            text: 'Resend Email', 
            onPress: async () => {
              try {
                const result = await UserService.sendEmailVerification();
                if (result.success) {
                  showSuccess(result.message);
                } else {
                  Alert.alert('Error', result.message);
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to send verification email');
              }
            }
          }
        ]
      );
      return;
    }
    
    setSheetMode('add');
  };

  const handleScheduleConfirm = async () => {
    setIsLoading(true);

    if (!scheduleData.selectedEntry || !scheduleData.startDate) {
      Alert.alert('Error', 'Please select a record and date');
      setIsLoading(false);
      return;
    }

    try {
      const startDate = new Date(scheduleData.startDate);
      const endDate = scheduleData.endDate ? new Date(scheduleData.endDate) : startDate;
      const dates = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (const date of dates) {
        await ScheduleService.scheduleActivity(
          scheduleData.selectedEntry.id,
          date,
          date,
          scheduleData.time,
          scheduleData.note
        );
      }

      const dayCount = dates.length;
      const message = dayCount === 1
        ? 'Record scheduled successfully!'
        : `Record scheduled for ${dayCount} days successfully!`;

      showSuccess(message);
      setTimeout(() => {
        onScheduleComplete?.();
        onClose();
      }, 1200);
    } catch (error) {
      console.error('Error scheduling activity:', error);
      Alert.alert('Error', 'Failed to schedule the record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackStep = () => {
    switch (scheduleData.step) {
      case 'record':
        setScheduleData(prev => ({ ...prev, step: 'category', selectedCategory: undefined }));
        break;
      case 'schedule':
        setScheduleData(prev => ({ ...prev, step: 'record', selectedEntry: undefined }));
        break;
      case 'confirm':
        setScheduleData(prev => ({ ...prev, step: 'schedule' }));
        break;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Modal backdrop handling is built into Modal component

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Drag Handle */}
      <View style={styles.dragHandle} />
      
      <TouchableOpacity onPress={handleBackStep} style={styles.arrowLeftAbsolute}>
        {scheduleData.step !== 'category' && (
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        )}
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {scheduleData.step === 'category' && 'New Entry'}
        {scheduleData.step === 'record' && 'Select Record'}
        {scheduleData.step === 'schedule' && 'Set Schedule'}
        {scheduleData.step === 'confirm' && 'Confirm Schedule'}
      </Text>
      <TouchableOpacity onPress={handleClose} style={styles.closeButtonAbsolute}>
        <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
      </TouchableOpacity>
      <View style={styles.progressBar}>
        {['category', 'record', 'schedule'].map((step, index) => (
          <View
            key={step}
            style={[
              styles.progressDot,
              {
                backgroundColor: 
                  index < ['category', 'record', 'schedule'].indexOf(scheduleData.step) + 1
                    ? '#2563EB'
                    : '#E5E7EB',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderCategoryStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add New Entry</Text>
      <Text style={styles.stepDescription}>
        Choose a category to find the record you want to schedule
      </Text>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryCard,
                {
                  backgroundColor: item.color // 0.56 = ~'90'
                },
              ]}
              onPress={() => handleCategorySelect(item.id)}
            >
              <View style={styles.overlay} />
              <MaterialCommunityIcons
                name={item.icon as any}
                size={24}
                color={item.color}
              />
              <Text style={[
                styles.categoryLabel,
                { color: '#5b5b5b' }, // Softer, visible grey
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesList}
          columnWrapperStyle={{ gap: 10 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );

  const renderRecordStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepDescription}>
        Select a {scheduleData.selectedCategory} record to schedule
      </Text>
      
      {filteredEntries.length > 10 && (
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search records..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      )}

      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.recordCard, { backgroundColor: (item.color || categoryColors[item.category]), marginBottom: 15 }]}
            onPress={() => {
              handleRecordSelect(item)
            }}
          >
            <View style={styles.overlay} />
            <View style={styles.recordInfo}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordTitle}>{item.title}</Text>
                {(item.color || categoryColors[item.category]) && (
                  <View style={[styles.colorDot, { backgroundColor: (item.color || categoryColors[item.category]) }]} />
                )}
              </View>
              {item.label && <Text style={styles.recordLabel}>{item.label}</Text>}
              {item.description && <Text style={styles.recordDescription}>{item.description}</Text>}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        style={styles.recordsList}
        showsVerticalScrollIndicator={false}
      />

      {filteredEntries.length === 0 && !isLoading && (
        <View style={styles.noRecordsContainer}>
          <MaterialCommunityIcons name="plus-circle-outline" size={48} color="#9CA3AF" />
          <Text style={styles.noRecordsText}>No records found</Text>
        </View>
      )}

      <View style={{ alignItems: 'center', marginTop: 12 }}>
        <FormButton
          title="Create New Record"
          onPress={handleCreateNewRecord}
          variant="primary"
          size="small"
          icon="add"
        />
      </View>
    </View>
  );

  const renderScheduleStep = () => (
    <View style={styles.stepContainer}>
      <View style={{ padding: 15, backgroundColor: colors.card, borderRadius: 20 }}>
        <Text style={styles.stepDescription}>
          Set when to schedule "{scheduleData.selectedEntry?.title}"
        </Text>
        <View>
          <View>
            <Text style={styles.sectionTitle}>Start Date</Text>
            <DateTimePicker
              mode="date"
              value={scheduleData.startDate || new Date().toISOString().split('T')[0]}
              onChange={(date) => setScheduleData(prev => ({ 
                ...prev, 
                startDate: date,
                endDate: prev.endDate && prev.endDate < date ? date : prev.endDate 
              }))}
              placeholder="Select start date"
              style={{ marginBottom: 12 }}
            />
          </View>
          <View>
            <Text style={styles.sectionTitle}>End Date (Optional)</Text>
            <DateTimePicker
              mode="date"
              value={scheduleData.endDate || scheduleData.startDate || new Date().toISOString().split('T')[0]}
              onChange={(date) => setScheduleData(prev => ({ ...prev, endDate: date }))}
              minimumDate={scheduleData.startDate}
              placeholder="Select end date for recurring schedule"
              style={{ marginBottom: 12 }}
            />
          </View>
        </View>
        <Text style={styles.dateHelpText}>
          Leave as same day for one-time schedule, or select a future date to schedule daily until then
        </Text>
        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Time (Optional)</Text>
          <DateTimePicker
            mode="time"
            value={scheduleData.time || ''}
            onChange={(time) => setScheduleData(prev => ({ ...prev, time }))}
            placeholder="Select time"
            style={{ marginBottom: 12 }}
          />
        </View>
        <View style={styles.noteSection}>
          <View style={{ backgroundColor: '#c49aff40', borderRadius: 12, marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>Note (Optional)</Text>
            <TextInput
              style={[styles.noteInput, { backgroundColor: 'transparent', minHeight: 60, borderRadius: 16, borderColor: colors.border, padding: 12, fontSize: 16, color: colors.text, borderWidth: 1 }]}
              placeholder="Add a note..."
              value={scheduleData.note}
              onChangeText={(note) => setScheduleData(prev => ({ ...prev, note }))}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
        <FormButton
          title={isLoading ? 'Scheduling...' : 'Schedule Record'}
          onPress={handleScheduleConfirm}
          variant="primary"
          size="large"
          icon="schedule"
          loading={isLoading}
          disabled={isLoading}
          style={{ marginTop: 16 }}
        />
      </View>
    </View>
  );

  const renderContent = () => {
    if (sheetMode === 'add') {
      return (
        <AddEditEntryScreen
          category={scheduleData.selectedCategory}
          onClose={() => setSheetMode('select')}
        />
      );
    }
    switch (scheduleData.step) {
      case 'category':
        return renderCategoryStep();
      case 'record':
        return renderRecordStep();
      case 'schedule':
        return renderScheduleStep();
      default:
        return renderCategoryStep();
    }
  };

  // Add debug logging
  console.log('ScheduleRecordBottomSheet isVisible:', isVisible);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.modalOverlay, { display: isVisible ? 'flex' : 'none' }]}>
      <DebugOverlay filename="ScheduleRecordBottomSheet.tsx" type="component" />
      
      {/* Animated backdrop */}
      <Animated.View 
        style={[
          styles.backdrop,
          {
            opacity: backdropAnim,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          activeOpacity={1} 
          onPress={handleClose}
        />
      </Animated.View>
      
      {/* Animated bottom sheet container */}
      <PanGestureHandler
        ref={panGestureRef}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetY={[-10, 10]} // Only activate for vertical gestures
        failOffsetX={[-20, 20]} // Fail if horizontal gesture is detected
      >
        <Animated.View 
          style={[
            styles.bottomSheetContainer,
            {
              transform: [
                {
                  translateY: Animated.add(
                    slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0], // Start 600px below, animate to 0
                    }),
                    translateY
                  ),
                },
                {
                  scale: scaleAnim,
                },
              ],
            },
          ]}
        >
          <View style={styles.modalContainer}>
            {renderHeader()}
            <ScrollView 
              style={styles.scrollableContent}
              contentContainerStyle={styles.scrollableContentContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
            >
              {renderContent()}
            </ScrollView>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1001,
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheetContainer: {
    height: '85%', // Increased height for better content display
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...shadows.xl, // Use style guide shadow instead of custom platform logic
    zIndex: 1002,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollableContent: {
    flex: 1,
    paddingBottom: 20,
  },
  scrollableContentContainer: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...FONTS.title,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    padding: 4,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonAbsolute: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    ...FONTS.title,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.textMuted,
    marginBottom: 20,
    textAlign: 'center',
  },
  categoriesList: {
    paddingBottom: 20,
    gap: 14,
  },
  categoriesContainer: {
    alignItems: 'center',
  },
  categoryCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // or dark overlay
  },
  categoryLabel: {
    marginTop: 8,
    ...FONTS.label,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 48,
    ...SHADOW,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '300',
    color: COLORS.textPrimary,
  },
  recordsList: {
    flex: 1,
    padding: 15,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    ...SHADOW,
  },
  recordInfo: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textPrimary,
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  recordLabel: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.primary,
    marginBottom: 2,
  },
  recordDescription: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.textMuted,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textMuted,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  dateSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '300',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  timeSection: {
    marginBottom: 20,
  },
  timeInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '300',
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noteSection: {
    marginBottom: 32,
  },
  noteInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '300',
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  scheduleButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...SHADOW,
  },
  disabledButton: {
    backgroundColor: COLORS.textMuted,
  },
  scheduleButtonText: {
    ...FONTS.button,
  },
  dateHelpText: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  createNewButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    ...SHADOW,
  },
  createNewButtonText: {
    ...FONTS.button,
    marginLeft: 8,
  },
  createNewOptionButton: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  createNewOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  noRecordsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  noRecordsText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textMuted,
    marginTop: 16,
    marginBottom: 8,
  },
  arrowLeftAbsolute: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
});

export default ScheduleRecordBottomSheet; 