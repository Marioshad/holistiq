import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { DateTimePicker } from './forms';
import { ScheduledActivity, Entry } from '../types';
import ScheduleService from '../services/ScheduleService';
import { FormButton } from './forms';
import { colors, shadows, spacing, typography, borderRadius } from '../styles/styleGuide';
import { useToast } from '../contexts/ToastContext';
import { auth } from '../../firebase';

const { width, height } = Dimensions.get('window');

interface TaskEditDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  activity: ScheduledActivity | null;
  entry: Entry | null;
  onUpdateComplete?: () => void;
}

const TaskEditDrawer: React.FC<TaskEditDrawerProps> = ({
  isVisible,
  onClose,
  activity,
  entry,
  onUpdateComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    startDate: '',
    endDate: '',
    time: '',
  });

  const [hasFutureActivities, setHasFutureActivities] = useState(false);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const toastContext = useToast();
  
  const showToast = (type: string, message: string) => {
    if (type === 'success') {
      toastContext.showSuccess(message);
    } else if (type === 'error') {
      toastContext.showError(message);
    } else if (type === 'warning') {
      toastContext.showWarning(message);
    } else {
      toastContext.showInfo(message);
    }
  };

  useEffect(() => {
    if (isVisible) {
      // Initialize edit data with current activity values
      if (activity) {
        setEditData({
          startDate: activity.startDate,
          endDate: activity.endDate || '',
          time: activity.time || '',
        });
      }
      
      // Check for future activities
      checkForFutureActivities();
      
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, activity, entry]);

  const checkForFutureActivities = async () => {
    if (!activity || !entry) return;
    
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // Get activities for the next 30 days starting from tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const futureActivities = await ScheduleService.getActivitiesForDateRange(
        tomorrow.toISOString().split('T')[0],
        futureDate.toISOString().split('T')[0],
        userId
      );
      
      // Check if there are other activities for the same entry
      const hasOtherFutureActivities = futureActivities.some(
        act => act.entryId === activity.entryId && act.id !== activity.id
      );
      
      setHasFutureActivities(hasOtherFutureActivities);
    } catch (error) {
      console.error('Error checking for future activities:', error);
    }
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY } = event.nativeEvent;
      if (translationY > 100) {
        handleClose();
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleSave = async () => {
    if (!activity || !entry) {
      Alert.alert('Error', 'No activity to update');
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User must be authenticated');
      return;
    }

    // Proceed with update
    await performUpdate(activity, entry, editData);
  };

  const performUpdate = async (
    activity: ScheduledActivity,
    entry: Entry,
    editData: any
  ) => {
    setIsLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'User must be authenticated');
        return;
      }

      // Update scheduled activity
      await ScheduleService.updateScheduledActivity(userId, activity.id, {
        startDate: editData.startDate,
        endDate: editData.endDate || undefined,
        time: editData.time || undefined,
      });

      showToast('success', 'Task updated successfully');
      onUpdateComplete?.();
      handleClose();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfirmation = async (updateFuture: boolean) => {
    setShowUpdateConfirmation(false);
    
    if (!pendingUpdate) return;

    const { activity, entry, editData } = pendingUpdate;
    setPendingUpdate(null);

    if (updateFuture) {
      // Update all future activities for this entry
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        // Get all future activities for this entry
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 365); // Check next year
        
        const futureActivities = await ScheduleService.getActivitiesForDateRange(
          tomorrow.toISOString().split('T')[0],
          futureDate.toISOString().split('T')[0],
          userId
        );
        
        const entryFutureActivities = futureActivities.filter(
          act => act.entryId === activity.entryId
        );

        // Update all future activities
        for (const futureActivity of entryFutureActivities) {
          await ScheduleService.updateScheduledActivity(userId, futureActivity.id, {
            startDate: editData.startDate,
            endDate: editData.endDate || undefined,
            time: editData.time || undefined,
          });
        }

        showToast('success', `Updated current and ${entryFutureActivities.length} future activities`);
      } catch (error) {
        console.error('Error updating future activities:', error);
        Alert.alert('Error', 'Failed to update future activities');
      }
    } else {
      // Update only current activity
      await performUpdate(activity, entry, editData);
    }

    onUpdateComplete?.();
    handleClose();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <MaterialIcons name="close" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Edit Schedule</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.entryInfo, { borderLeftColor: entry?.color || colors.primary }]}>
        <Text style={styles.entryTitle}>{entry?.title}</Text>
        <Text style={styles.entryCategory}>{entry?.label}</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Start Date</Text>
        <DateTimePicker
          mode="date"
          value={editData.startDate}
          onChange={(date) => setEditData(prev => ({ 
            ...prev, 
            startDate: date,
            endDate: prev.endDate && prev.endDate < date ? date : prev.endDate 
          }))}
          placeholder="Select start date"
          style={styles.input}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>End Date (Optional)</Text>
        <DateTimePicker
          mode="date"
          value={editData.endDate}
          onChange={(date) => setEditData(prev => ({ ...prev, endDate: date }))}
          minimumDate={editData.startDate}
          placeholder="Select end date for recurring schedule"
          style={styles.input}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Time (Optional)</Text>
        <DateTimePicker
          mode="time"
          value={editData.time}
          onChange={(time) => setEditData(prev => ({ ...prev, time }))}
          placeholder="Select time"
          style={styles.input}
        />
      </View>

      {hasFutureActivities && (
        <View style={styles.warningContainer}>
          <MaterialIcons name="warning" size={16} color="#F59E0B" />
          <Text style={styles.warningText}>
            This entry has future scheduled activities. You can choose to update only this activity or all future activities.
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <FormButton
          variant="primary"
          onPress={handleSave}
          loading={isLoading}
          style={styles.saveButton}
          title="Save Changes"
        />
      </View>
    </ScrollView>
  );

  return (
    <>
      {isVisible && (
        <View style={styles.overlay}>
          <Animated.View 
            style={[
              styles.backdrop, 
              { opacity: backdropAnim }
            ]} 
          />
          
          <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
            <Animated.View
              style={[
                styles.drawer,
                {
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              {renderHeader()}
              {renderContent()}
            </Animated.View>
          </PanGestureHandler>
        </View>
      )}

      {/* Update Confirmation Dialog */}
      {showUpdateConfirmation && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="warning" size={24} color="#F59E0B" />
              <Text style={styles.modalTitle}>Update Future Activities?</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              This entry has future scheduled activities. Would you like to update only this activity or all future activities?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => handleUpdateConfirmation(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>This Activity Only</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => handleUpdateConfirmation(true)}
              >
                <Text style={styles.modalButtonTextPrimary}>All Future Activities</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowUpdateConfirmation(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '90%',
    ...shadows.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  entryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
  },
  entryTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
    flex: 1,
  },
  entryCategory: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    marginBottom: 0,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  warningText: {
    fontSize: typography.sm,
    color: '#92400E',
    marginLeft: spacing.sm,
    flex: 1,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  saveButton: {
    marginBottom: 0,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    margin: spacing.lg,
    maxWidth: 400,
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  modalMessage: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  modalButtonTextSecondary: {
    color: colors.text,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
});

export default TaskEditDrawer; 