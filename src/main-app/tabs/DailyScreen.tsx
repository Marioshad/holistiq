import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList, DailyHabits, ScheduledActivity, Entry, EntryCategory } from '../../types';
import StorageService from '../../services/StorageService';
import UserService from '../../services/UserService';
import ScheduleService from '../../services/ScheduleService';
import EntryService from '../../services/EntryService';
import ScheduleRecordBottomSheet from '../../components/ScheduleRecordBottomSheet';
import EntryEditDrawer from '../../components/EntryEditDrawer';
import DebugOverlay from '../../components/DebugOverlay';
import TimeBasedGreeting from '../../components/ui/TimeBasedGreeting';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../styles/styleGuide';

type DailyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainApp'>;

interface TaskItem {
  id: string;
  title: string;
  category: string;
  time: string;
  completed: boolean;
  color: string;
  type?: string;
  label?: string;
  note?: string;
}

interface DateItem {
  date: string;
  day: string;
  dayName: string;
  isSelected: boolean;
  isToday: boolean;
}

const DailyScreen: React.FC = () => {
  const navigation = useNavigation<DailyScreenNavigationProp>();
  const [selectedDate, setSelectedDate] = useState<string>(StorageService.formatDate(new Date()));
  const [dailyHabits, setDailyHabits] = useState<DailyHabits | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>(getFormattedDate(new Date()));
  
  // New state for scheduled activities
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([]);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [entriesMap, setEntriesMap] = useState<Map<string, Entry>>(new Map());

  // State for entry edit drawer
  const [isEntryEditDrawerVisible, setIsEntryEditDrawerVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>(undefined);
  const [selectedCompletionDate, setSelectedCompletionDate] = useState<string | undefined>(undefined);

  // New state for email verification
  const [isEmailVerified, setIsEmailVerified] = useState(true);

  useEffect(() => {
    loadUserData();
    loadDailyHabits(selectedDate);
    loadScheduledActivities(selectedDate);
    checkEmailVerificationStatus();
  }, [selectedDate]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadScheduledActivities(selectedDate);
    }, [selectedDate])
  );

  function getFormattedDate(date: Date): string {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }); // Mon
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' }); // July
    return `${weekday}, ${day}${getOrdinal(day)} ${month}`;
  }
  
  function getOrdinal(n: number): string {
    if (n > 3 && n < 21) return 'th'; // 11th–13th
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  const loadUserData = async () => {
    try {
      const user = await UserService.getCurrentUser();
      if (user) {
        setUserName(user.name.split(' ')[0]); // First name only
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadDailyHabits = async (date: string) => {
    setLoading(true);
    try {
      const habits = await StorageService.getOrCreateDailyHabits(date);
      setDailyHabits(habits);
    } catch (error) {
      Alert.alert('Error', 'Failed to load daily habits');
    } finally {
      setLoading(false);
    }
  };

  const loadScheduledActivities = async (date: string) => {
    try {
      const activities = await ScheduleService.getActivitiesForDate(date);
      setScheduledActivities(activities);
      
      // Load entry details for each activity
      const entryIds = activities.map(a => a.entryId);
      const newEntriesMap = new Map();
      
      for (const entryId of entryIds) {
        try {
          const entry = await EntryService.getEntryById(entryId);
          if (entry) {
            newEntriesMap.set(entryId, entry);
          }
        } catch (error) {
          console.error('Error loading entry:', entryId, error);
        }
      }
      
      setEntriesMap(newEntriesMap);
    } catch (error) {
      console.error('Error loading scheduled activities:', error);
    }
  };

  const generateDateList = (): DateItem[] => {
    const dates: DateItem[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 3); // Show 3 days before today

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateString = StorageService.formatDate(date);
      const isToday = dateString === StorageService.formatDate(today);
      const isSelected = dateString === selectedDate;

      dates.push({
        date: dateString,
        day: date.getDate().toString(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isSelected,
        isToday,
      });
    }

    return dates;
  };

  const isTaskInPast = (taskTime: string, taskDate: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    // If task is on a past date, it's in the past
    if (taskDate < today) return true;
    
    // If task is today but the time has passed
    if (taskDate === today && taskTime && taskTime < currentTime) return true;
    
    return false;
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons = {
      'Nutrition': 'restaurant',
      'Health': 'local-pharmacy',
      'Supplements': 'local-pharmacy', 
      'Vitamins': 'medication',
      'Fitness': 'fitness-center',
      'Wellness': 'spa',
      'Medicine': 'healing',
    };
    return categoryIcons[category] || 'circle';
  };

  // Helper function to map display categories to entry categories
  const mapDisplayCategoryToEntryCategory = (displayCategory: string): EntryCategory => {
    const categoryMap: { [key: string]: EntryCategory } = {
      'Nutrition': 'nutrition',
      'Health': 'health',
      'Supplements': 'supplements',
      'Vitamins': 'vitamins',
      'Fitness': 'fitness',
      'Wellness': 'wellness',
      'Medicine': 'medicine',
    };
    return categoryMap[displayCategory] || 'nutrition';
  };

  const convertHabitsToTasks = (): TaskItem[] => {
    const tasks: TaskItem[] = [];

    // Add legacy habit tasks if they exist
    if (dailyHabits) {
      tasks.push(
        {
          id: 'breakfast',
          title: dailyHabits.meals?.breakfast || 'Plan Breakfast',
          category: 'Nutrition',
          time: '08:00',
          completed: !!dailyHabits.meals?.breakfast,
          color: '#FF6B6B',
        },
        {
          id: 'supplements',
          title: `Supplements (${dailyHabits.supplements?.length || 0})`,
          category: 'Health',
          time: '09:00',
          completed: dailyHabits.supplements?.some(s => s.taken) || false,
          color: '#4ECDC4',
        },
        {
          id: 'lunch',
          title: dailyHabits.meals?.lunch || 'Plan Lunch',
          category: 'Nutrition',
          time: '12:30',
          completed: !!dailyHabits.meals?.lunch,
          color: '#FF6B6B',
        },
        {
          id: 'exercise',
          title: `Exercise (${dailyHabits.exercises?.length || 0} planned)`,
          category: 'Fitness',
          time: '15:00',
          completed: dailyHabits.exercises?.some(e => e.completed) || false,
          color: '#45B7D1',
        },
        {
          id: 'dinner',
          title: dailyHabits.meals?.dinner || 'Plan Dinner',
          category: 'Nutrition',
          time: '18:30',
          completed: !!dailyHabits.meals?.dinner,
          color: '#FF6B6B',
        },
        {
          id: 'stretching',
          title: `Stretching (${dailyHabits.stretching?.length || 0} planned)`,
          category: 'Wellness',
          time: '20:00',
          completed: dailyHabits.stretching?.some(s => s.completed) || false,
          color: '#96CEB4',
        }
      );
    }

    // Add scheduled activities with enhanced details
    scheduledActivities.forEach(activity => {
      const entry = entriesMap.get(activity.entryId);
      if (entry) {
        const categoryColors = {
          nutrition: '#22C55E',
          supplements: '#3B82F6',
          vitamins: '#F59E0B',
          fitness: '#45B7D1',
          wellness: '#96CEB4',
          health: '#4ECDC4',
          medicine: '#EF4444',
        };

        // Get entry type/label for display
        let displayType = '';
        if (entry.category === 'supplements' || entry.category === 'vitamins') {
          const suppEntry = entry as any;
          displayType = suppEntry.type || suppEntry.doseAmount + ' ' + suppEntry.doseUnit || '';
        } else if (entry.category === 'nutrition') {
          const nutEntry = entry as any;
          displayType = nutEntry.mealType || 'meal';
        } else if (entry.category === 'fitness') {
          const fitnessEntry = entry as any;
          displayType = fitnessEntry.duration ? `${fitnessEntry.duration} min` : 'workout';
        } else if (entry.category === 'wellness') {
          const wellnessEntry = entry as any;
          displayType = wellnessEntry.type || 'session';
        } else if (entry.category === 'medicine') {
          const medicineEntry = entry as any;
          displayType = medicineEntry.dosage || 'dose';
        }

        tasks.push({
          id: activity.id,
          title: entry.title,
          category: entry.category.charAt(0).toUpperCase() + entry.category.slice(1),
          time: activity.time || '09:00',
          completed: activity.completed,
          color: entry.color || categoryColors[entry.category] || '#6B7280',
          type: displayType,
          label: entry.label,
          note: activity.note,
        });
      }
    });

    return tasks.sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleTaskToggle = async (taskId: string) => {
    // Check if it's a scheduled activity
    const activity = scheduledActivities.find(a => a.id === taskId);
    if (activity) {
      try {
        if (activity.completed) {
          await ScheduleService.uncompleteActivity(taskId);
        } else {
          await ScheduleService.completeActivity(taskId);
        }
        loadScheduledActivities(selectedDate);
      } catch (error) {
        console.error('Error toggling activity:', error);
        Alert.alert('Error', 'Failed to update activity status');
      }
    } else {
      // Handle legacy habit tasks
      navigation.navigate('HabitDetail', {
        date: selectedDate,
        habitType: 'meals',
      });
    }
  };

  const handleDateSelect = (dateItem: DateItem) => {
    setSelectedDate(dateItem.date);
  };

  const handleTaskPress = async (task: TaskItem) => {
    // Check if it's a scheduled activity
    const activity = scheduledActivities.find(a => a.id === task.id);
    if (activity) {
      try {
        // For scheduled activities, fetch the entry and open edit drawer
        const entry = await EntryService.getEntryById(activity.entryId);
        if (entry) {
          setSelectedEntry(entry);
          setSelectedActivityId(activity.id);
          setSelectedCompletionDate(activity.completedAt);
          setIsEntryEditDrawerVisible(true);
        } else {
          Alert.alert('Error', 'Entry not found');
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
        Alert.alert('Error', 'Failed to load entry details');
      }
    } else {
      // Handle legacy habit tasks - create temporary entries for editing
      const entryCategory = mapDisplayCategoryToEntryCategory(task.category);
      
      // Create a temporary entry for viewing/editing
      const tempEntry: Entry = {
        id: task.id,
        title: task.title,
        category: entryCategory,
        label: task.category,
        description: `Legacy ${task.category.toLowerCase()} entry`,
        color: task.color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Entry;

      setSelectedEntry(tempEntry);
      setSelectedActivityId(undefined);
      setSelectedCompletionDate(undefined);
      setIsEntryEditDrawerVisible(true);
    }
  };

  const handleEntryUpdated = () => {
    // Refresh the scheduled activities to show updated data
    loadScheduledActivities(selectedDate);
  };

  const isPastDate = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    return date < today;
  };

  const renderDateItem = ({ item }: { item: DateItem }) => {
    const isPast = isPastDate(item.date);
    
    return (
      <TouchableOpacity
        style={[
          styles.dateItem,
          item.isSelected && styles.selectedDateItem,
          item.isToday && !item.isSelected && styles.todayDateItem,
          isPast && styles.pastDateItem,
        ]}
        onPress={() => handleDateSelect(item)}
      >
        <Text style={[
          styles.dayName,
          item.isSelected && styles.selectedDateText,
          isPast && !item.isSelected && styles.pastDateText,
        ]}>
          {item.dayName}
        </Text>
        <Text style={[
          styles.dayNumber,
          item.isSelected && styles.selectedDateText,
          isPast && !item.isSelected && styles.pastDateText,
        ]}>
          {item.day}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTaskItem = ({ item }: { item: TaskItem }) => {
    const isPast = isTaskInPast(item.time, selectedDate);
    const categoryIcon = getCategoryIcon(item.category);

    return (
      <TouchableOpacity onPress={() => handleTaskPress(item)}>
        <Card style={[
          styles.taskCard, 
          isPast && styles.pastTaskCard
        ]}>
          <View style={styles.taskContent}>
            <View style={styles.taskLeft}>
              <View style={styles.timeContainer}>
                <Text style={[
                  styles.taskTime,
                  isPast && styles.pastTaskTime
                ]}>
                  {item.time}
                </Text>
              </View>
              <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '20' }]}>
                <MaterialIcons 
                  name={categoryIcon as any} 
                  size={20} 
                  color={isPast ? '#6B7280' : item.color} 
                />
              </View>
              <View style={styles.taskInfo}>
                <View style={styles.taskHeader}>
                  <View style={[styles.categoryPill, { backgroundColor: item.color + '20' }]}>
                    <Text style={[
                      styles.categoryText, 
                      { color: isPast ? '#6B7280' : item.color }
                    ]}>
                      {item.category}
                    </Text>
                  </View>
                  {item.type && (
                    <Text style={[styles.taskType, isPast && styles.pastTaskType]}>
                      {item.type}
                    </Text>
                  )}
                </View>
                <Text style={[
                  styles.taskTitle,
                  isPast && styles.pastTaskTitle
                ]}>
                  {item.title}
                </Text>
                {item.label && (
                  <Text style={[styles.taskLabel, isPast && styles.pastTaskLabel]}>
                    {item.label}
                  </Text>
                )}
                {item.note && (
                  <Text style={[styles.taskNote, isPast && styles.pastTaskNote]}>
                    {item.note}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.taskRight}>
              {/* Completion toggle button for scheduled activities */}
              {scheduledActivities.find(a => a.id === item.id) && (
                <TouchableOpacity 
                  style={styles.completionToggle}
                  onPress={() => handleTaskToggle(item.id)}
                >
                  <MaterialIcons 
                    name={item.completed ? "check-circle" : "radio-button-unchecked"} 
                    size={24} 
                    color={item.completed ? "#10B981" : "#9CA3AF"} 
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.menuButton}>
                <MaterialIcons name="more-vert" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              {item.completed && !scheduledActivities.find(a => a.id === item.id) && (
                <View style={styles.completedIndicator}>
                  <MaterialIcons name="check-circle" size={20} color="#10B981" />
                </View>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const checkEmailVerificationStatus = () => {
    const verified = UserService.isEmailVerified();
    setIsEmailVerified(verified);
  };

  const handleAddEntry = () => {
    if (!isEmailVerified) {
      Alert.alert(
        'Email Verification Required',
        'Please verify your email address before adding entries. Check your email for a verification link.',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Resend Email', onPress: handleResendVerification }
        ]
      );
      return;
    }
    
    setIsBottomSheetVisible(true);
  };

  const handleResendVerification = async () => {
    try {
      const result = await UserService.sendEmailVerification();
      if (result.success) {
        // You might want to show a toast here
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification email');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const dateList = generateDateList();
  const tasks = convertHabitsToTasks();

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <TimeBasedGreeting name={userName} variant="header" />
            <Text style={styles.date}>{currentMonth}</Text>
          </View>
          {/* <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => {
              // TODO: Navigate to profile when available
              console.log('Profile button pressed');
            }}
          >
            <MaterialIcons name="person" size={24} color="#1F2937" />
          </TouchableOpacity> */}
        </View>
        
        {/* Date Selector */}
        <View style={styles.scrollWrapper}>
          <FlatList
            data={generateDateList()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderDateItem}
            keyExtractor={(item) => item.date}
            style={styles.dateList}
            contentContainerStyle={styles.dateListContent}
          />

          {/* Left fade */}
          <LinearGradient
            colors={['#F8F8FC', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fadeLeft, { pointerEvents: 'none' }]}
          />

          {/* Right fade */}
          <LinearGradient
            colors={['transparent', '#F8F8FC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fadeRight, { pointerEvents: 'none' }]}
          />
        </View>
      </View>

      {/* Email Verification Banner */}
      {!isEmailVerified && (
        <View style={styles.verificationBanner}>
          <MaterialIcons name="warning" size={20} color="#FFFFFF" />
          <Text style={styles.verificationText}>
            Please verify your email address to access all features
          </Text>
          <TouchableOpacity onPress={handleResendVerification}>
            <Text style={styles.verificationLink}>Resend</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tasks Section */}
        <View style={styles.todaysTasksWrapper}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Tasks</Text>
              <Text style={styles.taskCount}>
                {tasks.filter(t => t.completed).length}/{tasks.length} completed
              </Text>
            </View>
            
            {tasks.map((task) => (
              <View key={task.id} style={styles.taskContainer}>
                {renderTaskItem({ item: task })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FAB for scheduling */}
      <TouchableOpacity
        style={[
          styles.fab,
          !isEmailVerified && styles.addButtonDisabled
        ]}
        onPress={handleAddEntry}
        disabled={!isEmailVerified}
      >
        <MaterialIcons name="add" size={24} color={isEmailVerified ? "#FFFFFF" : "#9CA3AF"} />
      </TouchableOpacity>

      {/* Schedule Record Bottom Sheet */}
      <ScheduleRecordBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        selectedDate={selectedDate}
        onScheduleComplete={() => {
          loadScheduledActivities(selectedDate);
        }}
      />

      {/* Entry Edit Drawer */}
      {selectedEntry && (
        <EntryEditDrawer
          isVisible={isEntryEditDrawerVisible}
          onClose={() => {
            setIsEntryEditDrawerVisible(false);
            setSelectedEntry(null);
            setSelectedActivityId(undefined);
            setSelectedCompletionDate(undefined);
          }}
          entry={selectedEntry}
          activityId={selectedActivityId}
          completionDate={selectedCompletionDate}
          onEntryUpdated={handleEntryUpdated}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#F7F8FD',
    backgroundColor: '#c49aff5c',
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,    
    ...shadows.sm, // Use style guide shadow instead of custom platform logic
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  profileButton: {
    padding: 8,
  },
  date: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
    marginTop: spacing.xs,
  },
  dateList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dateListContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    minWidth: 60,
    ...shadows.sm, // Use style guide shadow instead of custom platform logic
  },
  selectedDateItem: {
    backgroundColor: '#8a65f3',
  },
  todayDateItem: {
    borderWidth: 2,
    borderColor: '#8a65f3',
  },
  dayName: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  pastDateItem: {
    opacity: 0.7,
  },
  pastDateText: {
    color: '#6B7280',
    fontWeight: '400',
  },
  scrollWrapper: {
    position: 'relative',
    height: 70, // adjust based on item height
    justifyContent: 'center',
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 10,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  todaysTasksWrapper: {
    padding: 5,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for FAB
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '600',
  },
  taskCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  taskContainer: {
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    ...shadows.sm, // Use style guide shadow instead of custom platform logic
  },
  pastTaskCard: {
    backgroundColor: '#F8F9FA',
    opacity: 0.85,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    marginRight: 16,
  },
  taskTime: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    width: 40,
  },
  pastTaskTime: {
    color: '#6B7280',
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  taskType: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  pastTaskType: {
    color: '#6B7280',
  },
  taskTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  pastTaskTitle: {
    color: '#6B7280',
  },
  taskLabel: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 2,
  },
  pastTaskLabel: {
    color: '#6B7280',
  },
  taskNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  pastTaskNote: {
    color: '#6B7280',
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    padding: 4,
  },
  completionToggle: {
    padding: 4,
    marginRight: 4,
  },
  completedIndicator: {
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C49AFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg, // Use style guide shadow instead of custom platform logic
    zIndex: 1000,
  },
  verificationBanner: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  verificationText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  verificationLink: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  addButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default DailyScreen; 