import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { RootStackParamList, DailyHabits, ScheduledActivity, Entry, EntryCategory } from '../../types';
import StorageService from '../../services/StorageService';
import UserService from '../../services/UserService';
import ScheduleService from '../../services/ScheduleService';
import EntryService from '../../services/EntryService';
import ScheduleEntry from '../../components/ScheduleEntry';
import TaskEditDrawer from '../../components/TaskEditDrawer';
import DebugOverlay from '../../components/DebugOverlay';
import TimeBasedGreeting from '../../components/ui/TimeBasedGreeting';
import ConfirmationModal from '../../components/ConfirmationModal';
import { auth } from '../../../firebase';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../styles/styleGuide';
import { useToast } from '../../contexts/ToastContext';

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
  const { showSuccess, showWarning } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(StorageService.formatDate(new Date()));
  const [dailyHabits, setDailyHabits] = useState<DailyHabits | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>(getFormattedDate(new Date()));
  
  // New state for scheduled activities
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([]);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [entriesMap, setEntriesMap] = useState<Map<string, Entry>>(new Map());
  const [loadingScheduledActivities, setLoadingScheduledActivities] = useState(false);

  // State for task edit drawer
  const [isTaskEditDrawerVisible, setIsTaskEditDrawerVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ScheduledActivity | null>(null);

  // New state for email verification
  const [isEmailVerified, setIsEmailVerified] = useState(true);

  // State for confirmation modal
  const [confirmationModal, setConfirmationModal] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDangerous: false,
  });

  // Swipeable Task Card Component with improved stability
  const SwipeableTaskCard = ({ task }: { task: TaskItem }) => {
    const translateX = useSharedValue(0);
    const isPast = isTaskInPast(task.time, selectedDate);
    const categoryIcon = getCategoryIcon(task.category);
    const [isLoading, setIsLoading] = useState(false);
    const spinValue = useSharedValue(0);

    // Initialize shared value properly
    useEffect(() => {
      translateX.value = 0;
    }, []);

    // Start rotation animation when loading
    useEffect(() => {
      if (isLoading) {
        spinValue.value = 0;
        spinValue.value = withRepeat(
          withTiming(360, { duration: 1000 }),
          -1, // Infinite repeat
          false // Don't reverse
        );
      } else {
        spinValue.value = 0;
      }
    }, [isLoading]);

    const spinStyle = useAnimatedStyle(() => {
      return {
        transform: [{ rotate: `${spinValue.value}deg` }],
      };
    });

    const handleTaskToggleWithLoader = async (taskId: string) => {
      setIsLoading(true);
      try {
        await handleTaskToggle(taskId);
      } finally {
        setIsLoading(false);
      }
    };

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, context: any) => {
        context.startX = translateX.value;
      },
      onActive: (event, context: any) => {
        // Limit swipe distance to 110px each side (action elements are 120px wide)
        const maxSwipeDistance = 110;
        const newValue = context.startX + event.translationX;
        
        if (newValue > maxSwipeDistance) {
          translateX.value = maxSwipeDistance;
        } else if (newValue < -maxSwipeDistance) {
          translateX.value = -maxSwipeDistance;
        } else {
          translateX.value = newValue;
        }
      },
      onEnd: (event) => {
        const shouldSnapBack = Math.abs(event.translationX) < 108; // Changed: 90% of 120px action width
        const shouldComplete = event.translationX < -108; // Changed: left swipe to complete at 90%
        const shouldDelete = event.translationX > 108; // Changed: right swipe to delete at 90%

        if (shouldSnapBack) {
          translateX.value = withSpring(0);
        } else if (shouldComplete) {
          runOnJS(handleTaskToggleWithLoader)(task.id);
          translateX.value = withSpring(0);
        } else if (shouldDelete) {
          runOnJS(showDeleteConfirmation)(task);
          translateX.value = withSpring(0);
        }
      },
    });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
      };
    });

    const leftActionStyle = useAnimatedStyle(() => {
      const opacity = withTiming(translateX.value > 0 ? Math.min(translateX.value / 100, 1) : 0); // Changed: right swipe shows left action
      return { opacity };
    });

    const rightActionStyle = useAnimatedStyle(() => {
      const opacity = withTiming(translateX.value < 0 ? Math.min(Math.abs(translateX.value) / 100, 1) : 0); // Changed: left swipe shows right action
      return { opacity };
    });

    return (
      <View style={styles.taskCardWrapper}>
        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Animated.View style={[styles.loadingSpinner, spinStyle]}>
              <MaterialIcons name="hourglass-empty" size={20} color="#FFFFFF" />
            </Animated.View>
          </View>
        )}

        <View style={styles.swipeableContainer}>
          {/* Left Action (Delete) - Now triggered by right swipe */}
          <Animated.View style={[styles.swipeAction, styles.deleteAction, leftActionStyle]}>
            <MaterialIcons name="delete" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Delete</Text>
          </Animated.View>

          {/* Right Action (Complete) - Now triggered by left swipe */}
          <Animated.View style={[styles.swipeAction, styles.completeAction, rightActionStyle]}>
            <MaterialIcons name="check" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Done</Text>
          </Animated.View>

          {/* Task Card */}
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.taskCardContainer, animatedStyle]}>
              <TouchableOpacity onPress={() => handleTaskPress(task)}>
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
                          {task.time}
                        </Text>
                      </View>
                      
                      <View style={styles.taskInfo}>
                        <View style={styles.taskHeader}>
                          <View style={[styles.categoryIconContainer, { backgroundColor: task.color }]}>
                            <View style={styles.overlay} />
                            <MaterialIcons 
                              name={categoryIcon as any} 
                              size={15} 
                              color={isPast ? '#6B7280' : task.color} 
                            />
                          </View>
                          <View style={[styles.categoryPill, { backgroundColor: task.color }]}>
                          <View style={styles.overlay} />
                            <Text style={[
                              styles.categoryText, 
                              { color: isPast ? '#6B7280' : task.color }
                            ]}>
                              {task.category}
                            </Text>
                          </View>
                        </View>
                        <Text style={[
                          styles.taskTitle,
                          isPast && styles.pastTaskTitle
                        ]}>
                          {task.title}
                        </Text>
                        {task.type && (
                          <Text style={[styles.taskType, isPast && styles.pastTaskType]}>
                            {task.type}
                          </Text>
                        )}
                        {task.label && (
                          <Text style={[styles.taskLabel, isPast && styles.pastTaskLabel]}>
                            {task.label}
                          </Text>
                        )}
                        {task.note && (
                          <Text style={[styles.taskNote, isPast && styles.pastTaskNote]}>
                            {task.note}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.taskRight}>
                      {/* Completion toggle button for scheduled activities */}
                      {scheduledActivities.find(a => a.id === task.id) && (
                        <TouchableOpacity 
                          style={styles.completionToggle}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleTaskToggleWithLoader(task.id);
                          }}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons 
                            name={task.completed ? "check-circle" : "radio-button-unchecked"} 
                            size={24} 
                            color={task.completed ? "#10B981" : "#9CA3AF"} 
                          />
                        </TouchableOpacity>
                      )}
                      {task.completed && !scheduledActivities.find(a => a.id === task.id) && (
                        <View style={styles.completedIndicator}>
                          <MaterialIcons name="check-circle" size={20} color="#10B981" />
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </View>
    );
  };

  useEffect(() => {
    loadUserData();
    loadDailyHabits(selectedDate);
    loadScheduledActivities(selectedDate);
    checkEmailVerificationStatus();
  }, []); // Only run once on mount

  // Separate effect for date changes - only reload scheduled activities
  useEffect(() => {
    loadScheduledActivities(selectedDate);
  }, [selectedDate]);

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

  const loadDailyHabits = async (date: string, setLoadingState: boolean = true) => {
    if (setLoadingState) {
      setLoading(true);
    }
    try {
      const habits = await StorageService.getOrCreateDailyHabits(date);
      setDailyHabits(habits);
    } catch (error) {
      Alert.alert('Error', 'Failed to load daily habits');
    } finally {
      if (setLoadingState) {
        setLoading(false);
      }
    }
  };

  const loadScheduledActivities = async (date: string) => {
    setLoadingScheduledActivities(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.warn('No authenticated user found');
        return;
      }

      const activities = await ScheduleService.getActivitiesForDate(date, userId);
      setScheduledActivities(activities);
      
      // Load entry details for each activity
      const entryIds = activities.map(a => a.entryId);
      const newEntriesMap = new Map();

      for (const entryId of entryIds) {
        try {
          const entry = await EntryService.getEntryById(entryId, userId);
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
      // Don't let Reanimated errors affect data loading
      if (error.message && error.message.includes('Reanimated')) {
        console.warn('Reanimated error detected, continuing with data loading...');
        return;
      }
    } finally {
      setLoadingScheduledActivities(false);
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
    const iconMap: { [key: string]: string } = {
      'Nutrition': 'restaurant',
      'Health': 'favorite',
      'Fitness': 'fitness-center',
      'Wellness': 'self-improvement',
      'Supplements': 'medication',
      'Vitamins': 'medication',
      'Medicine': 'medication',
    };
    return iconMap[category] || 'check-circle';
  };

  const convertHabitsToTasks = (): TaskItem[] => {
    const tasks: TaskItem[] = [];

    // Add legacy habit tasks if they exist
    // if (dailyHabits) {
    //   tasks.push(
    //     {
    //       id: 'breakfast',
    //       title: dailyHabits.meals?.breakfast || 'Plan Breakfast',
    //       category: 'Nutrition',
    //       time: '08:00',
    //       completed: !!dailyHabits.meals?.breakfast,
    //       color: '#FF6B6B',
    //     },
    //     {
    //       id: 'supplements',
    //       title: `Supplements (${dailyHabits.supplements?.length || 0})`,
    //       category: 'Health',
    //       time: '09:00',
    //       completed: dailyHabits.supplements?.some(s => s.taken) || false,
    //       color: '#4ECDC4',
    //     },
    //     {
    //       id: 'lunch',
    //       title: dailyHabits.meals?.lunch || 'Plan Lunch',
    //       category: 'Nutrition',
    //       time: '12:30',
    //       completed: !!dailyHabits.meals?.lunch,
    //       color: '#FF6B6B',
    //     },
    //     {
    //       id: 'exercise',
    //       title: `Exercise (${dailyHabits.exercises?.length || 0} planned)`,
    //       category: 'Fitness',
    //       time: '15:00',
    //       completed: dailyHabits.exercises?.some(e => e.completed) || false,
    //       color: '#45B7D1',
    //     },
    //     {
    //       id: 'dinner',
    //       title: dailyHabits.meals?.dinner || 'Plan Dinner',
    //       category: 'Nutrition',
    //       time: '18:30',
    //       completed: !!dailyHabits.meals?.dinner,
    //       color: '#FF6B6B',
    //     },
    //     {
    //       id: 'stretching',
    //       title: `Stretching (${dailyHabits.stretching?.length || 0} planned)`,
    //       category: 'Wellness',
    //       time: '20:00',
    //       completed: dailyHabits.stretching?.some(s => s.completed) || false,
    //       color: '#96CEB4',
    //     }
    //   );
    // }

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

        // Get entry type/label for display with more detailed information
        let displayType = '';
        if (entry.category === 'supplements' || entry.category === 'vitamins') {
          const suppEntry = entry as any;
          // For supplements/vitamins, prioritize showing the type (tablet, gummy, etc.)
          if (suppEntry.type) {
            displayType = suppEntry.type.charAt(0).toUpperCase() + suppEntry.type.slice(1).toLowerCase();
            // Add dose information if available
            if (suppEntry.doseAmount && suppEntry.doseUnit) {
              displayType += ` • ${suppEntry.doseAmount} ${suppEntry.doseUnit}`;
            } else if (suppEntry.dose) {
              displayType += ` • ${suppEntry.dose}`;
            }
          } else if (suppEntry.doseAmount && suppEntry.doseUnit) {
            displayType = `${suppEntry.doseAmount} ${suppEntry.doseUnit}`;
          } else if (suppEntry.dose) {
            displayType = suppEntry.dose;
          }
        } else if (entry.category === 'nutrition') {
          const nutEntry = entry as any;
          if (nutEntry.calories) {
            displayType = `${nutEntry.calories} cal`;
            if (nutEntry.mealType) {
              displayType += ` • ${nutEntry.mealType}`;
            }
          } else if (nutEntry.mealType) {
            displayType = nutEntry.mealType;
          } else if (nutEntry.servingSize) {
            displayType = nutEntry.servingSize;
          }
        } else if (entry.category === 'fitness') {
          const fitnessEntry = entry as any;
          if (fitnessEntry.duration) {
            displayType = `${fitnessEntry.duration} min`;
            if (fitnessEntry.intensity) {
              displayType += ` • ${fitnessEntry.intensity}`;
            }
          } else if (fitnessEntry.intensity) {
            displayType = fitnessEntry.intensity;
          } else if (fitnessEntry.type) {
            displayType = fitnessEntry.type;
          }
        } else if (entry.category === 'wellness') {
          const wellnessEntry = entry as any;
          if (wellnessEntry.duration) {
            displayType = `${wellnessEntry.duration} min`;
            if (wellnessEntry.type) {
              displayType += ` • ${wellnessEntry.type}`;
            }
          } else if (wellnessEntry.type) {
            displayType = wellnessEntry.type;
          }
        } else if (entry.category === 'health') {
          const healthEntry = entry as any;
          if (healthEntry.duration) {
            displayType = `${healthEntry.duration} min`;
            if (healthEntry.type) {
              displayType += ` • ${healthEntry.type}`;
            }
          } else if (healthEntry.type) {
            displayType = healthEntry.type;
          } else if (healthEntry.provider) {
            displayType = healthEntry.provider;
          }
        } else if (entry.category === 'medicine') {
          const medicineEntry = entry as any;
          if (medicineEntry.dosage) {
            displayType = medicineEntry.dosage;
            if (medicineEntry.frequency) {
              displayType += ` • ${medicineEntry.frequency}`;
            }
          } else if (medicineEntry.frequency) {
            displayType = medicineEntry.frequency;
          } else if (medicineEntry.type) {
            displayType = medicineEntry.type;
          }
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
        const userId = auth.currentUser?.uid;
        if (!userId) {
          Alert.alert('Error', 'User must be authenticated');
          return;
        }
        
        if (activity.completed) {
          await ScheduleService.uncompleteActivity(userId, taskId);
          showWarning('Task not completed!');
        } else {
          await ScheduleService.completeActivity(userId, taskId);
          showSuccess('Task completed!');
        }
        loadScheduledActivities(selectedDate);
      } catch (error) {
        Alert.alert('Error', 'Failed to update activity status');
      }
    } else {
      console.log('DailyScreen: No activity found, navigating to habit detail');
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
        const userId = auth.currentUser?.uid;
        if (!userId) {
          Alert.alert('Error', 'User must be authenticated');
          return;
        }

        // For scheduled activities, fetch the entry and open edit drawer
        const entry = await EntryService.getEntryById(activity.entryId, userId);
        if (entry) {
          setSelectedActivity(activity);
          setIsTaskEditDrawerVisible(true);
        } else {
          Alert.alert('Error', 'Entry not found');
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
        Alert.alert('Error', 'Failed to load entry details');
      }
    } else {
      Alert.alert('Info', 'This task cannot be edited.');
    }
  };

  // Removed handleEntryUpdated as it's no longer needed

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

  const showDeleteConfirmation = (task: TaskItem) => {
    setConfirmationModal({
      visible: true,
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      onConfirm: () => handleDeleteTask(task),
      isDangerous: true,
    });
  };

  const handleDeleteTask = async (task: TaskItem) => {
    try {
      // Check if it's a scheduled activity
      const activity = scheduledActivities.find(a => a.id === task.id);
      if (activity) {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          Alert.alert('Error', 'User must be authenticated');
          return;
        }
        await ScheduleService.deleteScheduledActivity(userId, task.id);
        loadScheduledActivities(selectedDate);
      } else {
        // Handle legacy habit tasks - you might want to implement this
        Alert.alert('Info', 'Legacy habit tasks cannot be deleted through swipe gestures.');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
    } finally {
      setConfirmationModal(prev => ({ ...prev, visible: false }));
    }
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
        Alert.alert('Success', 'Verification email sent!');
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
      <FlatList
        style={styles.content}
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View style={styles.todaysTasksWrapper}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Tasks</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.taskCount}>
                    {tasks.filter(t => t.completed).length}/{tasks.length} completed
                  </Text>
                  <TouchableOpacity onPress={() => loadScheduledActivities(selectedDate)} style={{ marginLeft: 4 }}>
                    <MaterialIcons name="refresh" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {loadingScheduledActivities ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading tasks...</Text>
                </View>
              ) : tasks.length > 0 ? (
                (() => {
                  const pastTasks = tasks.filter(task => isTaskInPast(task.time, selectedDate));
                  const futureTasks = tasks.filter(task => !isTaskInPast(task.time, selectedDate));
                  
                  // Sort past tasks by date descending (most recent first)
                  const sortedPastTasks = pastTasks.sort((a, b) => {
                    const dateA = new Date(selectedDate + ' ' + a.time);
                    const dateB = new Date(selectedDate + ' ' + b.time);
                    return dateB.getTime() - dateA.getTime();
                  });
                  
                  return (
                    <>
                      {/* Future Tasks */}
                      {futureTasks.map((task) => (
                        <View key={task.id} style={styles.taskContainer}>
                          <SwipeableTaskCard task={task} />
                        </View>
                      ))}
                      
                      {/* Divider between past and future tasks */}
                      {pastTasks.length > 0 && futureTasks.length > 0 && (
                        <View style={styles.taskDivider}>
                          <View style={styles.dividerLine} />
                          <Text style={styles.dividerText}>Past Tasks</Text>
                          <View style={styles.dividerLine} />
                        </View>
                      )}
                      
                      {/* Past Tasks */}
                      {sortedPastTasks.map((task) => (
                        <View key={task.id} style={styles.taskContainer}>
                          <SwipeableTaskCard task={task} />
                        </View>
                      ))}
                    </>
                  );
                })()
              ) : (
                <View style={styles.noTasksMessage}>
                  <MaterialIcons name="check-circle" size={40} color="#9CA3AF" />
                  <Text style={styles.noTasksText}>No tasks for today. Add one!</Text>
                </View>
              )}
            </View>
          </View>
        )}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
      />

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
      <ScheduleEntry
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        selectedDate={selectedDate}
        onScheduleComplete={() => {
          loadScheduledActivities(selectedDate);
        }}
      />

      {/* Task Edit Drawer */}
      {selectedActivity && (
        <TaskEditDrawer
          isVisible={isTaskEditDrawerVisible}
          onClose={() => {
            setIsTaskEditDrawerVisible(false);
            setSelectedActivity(null);
          }}
          activity={selectedActivity}
          entry={entriesMap.get(selectedActivity.entryId) || null}
          onUpdateComplete={() => {
            loadScheduledActivities(selectedDate);
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmationModal.visible}
        onClose={() => setConfirmationModal(prev => ({ ...prev, visible: false }))}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        isDangerous={confirmationModal.isDangerous}
      />
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.56)', // or adjust for your opacity/color
    zIndex: 0,
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
    backgroundColor: '#F3F4F6',
    opacity: 0.8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    width: 24,
    height: 24,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,
    marginBottom: 6,
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
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
    marginTop: 2,
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
  taskCardContainer: {
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  taskCardWrapper: {
    position: 'relative',
  },
  swipeableContainer: {
    overflow: 'hidden',
    borderRadius: 20,
    marginBottom: 12,
    position: 'relative',
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    zIndex: 0,
  },
  deleteAction: {
    left: 0,
    backgroundColor: '#EF4444',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  completeAction: {
    right: 0,
    backgroundColor: '#10B981',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  noTasksMessage: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    ...shadows.sm,
  },
  noTasksText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    zIndex: 999,
  },
  loadingSpinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C49AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastTaskOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent overlay
    borderRadius: 20,
    zIndex: 1, // Ensure it's above the card content
  },
  taskDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DailyScreen; 