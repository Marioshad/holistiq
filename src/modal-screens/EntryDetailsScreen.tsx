import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from 'react-native-paper';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { DateTimePicker } from '../components/forms';
import DebugOverlay from '../components/DebugOverlay';
import { Entry, ScheduledActivity } from '../types';
import EntryService from '../services/EntryService';
import { shadows } from '../styles/styleGuide';
import { auth } from '../../firebase';
// import ScheduleService from '../services/ScheduleService';

interface EntryDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      entry: Entry;
      activityId?: string;
      completionDate?: string;
    };
  };
}

const EntryDetailsScreen: React.FC<EntryDetailsScreenProps> = ({ navigation, route }) => {
  const { entry, activityId, completionDate } = route.params;

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

  // Form state
  const [title, setTitle] = useState(entry.title || '');
  const [label, setLabel] = useState(entry.label || '');
  const [description, setDescription] = useState(entry.description || '');
  const [completedAt, setCompletedAt] = useState(completionDate || new Date().toISOString());
  const [isLoading, setIsLoading] = useState(false);

  // Start animations when component mounts
  useEffect(() => {
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
  }, []);

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
      navigation.goBack();
    });
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons = {
      'nutrition': 'restaurant',
      'supplements': 'local-pharmacy',
      'vitamins': 'local-pharmacy',
      'exercise': 'fitness-center',
      'mind': 'psychology',
      'wellness': 'spa',
    };
    return categoryIcons[category.toLowerCase()] || 'circle';
  };

  const getCategoryLabel = (category: string) => {
    const categoryLabels = {
      'nutrition': 'Nutrition',
      'supplements': 'Supplements',
      'vitamins': 'Vitamins',
      'exercise': 'Exercise',
      'mind': 'Mind',
      'wellness': 'Wellness',
    };
    return categoryLabels[category.toLowerCase()] || category;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setIsLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User must be authenticated to save entries');
      }

      // Check if entry exists in storage first
      const existingEntry = await EntryService.getEntryById(entry.id, userId);
      
      if (existingEntry) {
        // Update existing entry
        const updates = {
          title: title.trim(),
          label: label.trim(),
          description: description.trim(),
        };

        await EntryService.updateEntry(userId, entry.id, updates);
        Alert.alert('Success', 'Entry updated successfully');
      } else {
        // Create new entry (for legacy tasks that don't exist in storage)
        const newEntry = {
          title: title.trim(),
          category: entry.category,
          label: label.trim(),
          description: description.trim(),
          color: entry.color,
        };

        await EntryService.createEntry(newEntry);
        Alert.alert('Success', 'Entry created successfully');
      }

      // TODO: Update the scheduled activity if needed
      // if (activityId) {
      //   await ScheduleService.updateScheduledActivity(activityId, {
      //     completedAt: completedAt,
      //   });
      // }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCompletionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCompletionTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.modalOverlay}>
      <DebugOverlay filename="EntryDetailsScreen.tsx" type="screen" />
      
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
            {/* Header */}
            <View style={styles.header}>
              {/* Drag Handle */}
              <View style={styles.dragHandle} />
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
              >
                <MaterialIcons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Entry Details</Text>
              <TouchableOpacity 
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <KeyboardAvoidingView
              style={styles.content}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                {/* Top Summary Section */}
                <Card style={styles.summaryCard}>
                  <View style={styles.summaryContent}>
                    <View style={styles.categoryIconContainer}>
                      <MaterialIcons 
                        name={getCategoryIcon(entry.category) as any} 
                        size={32} 
                        color={entry.color || '#2563EB'} 
                      />
                    </View>
                    <View style={styles.categoryPill}>
                      <Text style={[styles.categoryText, { color: entry.color || '#2563EB' }]}>
                        {getCategoryLabel(entry.category)}
                      </Text>
                    </View>
                  </View>
                </Card>

                {/* Entry Fields Section */}
                <Card style={styles.sectionCard}>
                  <View style={styles.sectionContent}>
                    <Text style={styles.sectionTitle}>Entry Details</Text>
                    
                    {/* Title Field */}
                    <View style={styles.fieldContainer}>
                      <View style={styles.fieldHeader}>
                        <MaterialIcons name="edit" size={20} color="#6B7280" />
                        <Text style={styles.fieldLabel}>Title *</Text>
                      </View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., Morning Run"
                        placeholderTextColor="#9CA3AF"
                        value={title}
                        onChangeText={setTitle}
                      />
                    </View>

                    {/* Label Field */}
                    <View style={styles.fieldContainer}>
                      <View style={styles.fieldHeader}>
                        <MaterialIcons name="label" size={20} color="#6B7280" />
                        <Text style={styles.fieldLabel}>Label</Text>
                      </View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter label (optional)"
                        placeholderTextColor="#9CA3AF"
                        value={label}
                        onChangeText={setLabel}
                      />
                    </View>

                    {/* Description Field */}
                    <View style={styles.fieldContainer}>
                      <View style={styles.fieldHeader}>
                        <MaterialIcons name="description" size={20} color="#6B7280" />
                        <Text style={styles.fieldLabel}>Description</Text>
                      </View>
                      <TextInput
                        style={[styles.textInput, styles.textArea]}
                        placeholder="Enter description (optional)"
                        placeholderTextColor="#9CA3AF"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                      />
                    </View>
                  </View>
                </Card>

                {/* Completion Date Section */}
                <Card style={styles.sectionCard}>
                  <View style={styles.sectionContent}>
                    <View style={styles.sectionHeader}>
                      <MaterialIcons name="event" size={20} color="#6B7280" />
                      <Text style={styles.sectionTitle}>Completion Date</Text>
                    </View>

                    <View style={styles.dateTimeContainer}>
                      <View style={styles.dateTimeRow}>
                        <View style={styles.dateTimeField}>
                          <Text style={styles.dateTimeLabel}>Date</Text>
                          <DateTimePicker
                            mode="date"
                            value={completedAt.split('T')[0]}
                            onChange={(date) => {
                              const time = completedAt.split('T')[1] || '12:00:00.000Z';
                              setCompletedAt(`${date}T${time}`);
                            }}
                            placeholder="Select date"
                          />
                        </View>
                        <View style={styles.dateTimeField}>
                          <Text style={styles.dateTimeLabel}>Time</Text>
                          <DateTimePicker
                            mode="time"
                            value={completedAt.split('T')[1]?.substring(0, 5) || '12:00'}
                            onChange={(time) => {
                              const date = completedAt.split('T')[0];
                              setCompletedAt(`${date}T${time}:00.000Z`);
                            }}
                            placeholder="Select time"
                          />
                        </View>
                      </View>
                      
                      <View style={styles.completionSummary}>
                        <Text style={styles.completionText}>
                          Completed on {formatCompletionDate(completedAt)} at {formatCompletionTime(completedAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>

                {/* Update Button */}
                <TouchableOpacity
                  style={[styles.updateButton, isLoading && styles.updateButtonDisabled]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <Text style={styles.updateButtonText}>
                    {isLoading ? 'Updating...' : 'Update Entry'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  // Modal styles
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
    height: '75%', // 3/4 height
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...shadows.xl, // Use style guide shadow instead of custom platform logic
    zIndex: 1002,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    ...shadows.sm, // Use style guide shadow instead of custom platform logic
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    ...shadows.lg, // Use style guide shadow instead of custom platform logic
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryPill: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '400',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    ...shadows.lg, // Use style guide shadow instead of custom platform logic
  },
  sectionContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1F2937',
    marginLeft: 8,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1F2937',
    marginLeft: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '300',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    marginTop: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeField: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 8,
  },
  completionSummary: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  completionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1F2937',
  },
  updateButton: {
    backgroundColor: '#2563EB',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    ...shadows.lg, // Use style guide shadow instead of custom platform logic
  },
  updateButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 12,
  },
});

export default EntryDetailsScreen; 