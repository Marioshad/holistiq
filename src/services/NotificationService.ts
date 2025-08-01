import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { ScheduledActivity } from '../types';
import UserService from './UserService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    try {
      
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return;
      }

      // Get push token
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        this.expoPushToken = token.data;
      } else {
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      // Check if app was launched from a notification
      await this.checkInitialNotification();

    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  // Check if app was launched from a notification
  private async checkInitialNotification(): Promise<void> {
    try {
      const initialNotification = await Notifications.getLastNotificationResponseAsync();
      if (initialNotification) {
        if (__DEV__) {
          console.log('NotificationService: App launched from notification:', {
            data: initialNotification.notification.request.content.data,
            timestamp: new Date().toISOString()
          });
        }
        
        // Handle the initial notification
        await this.handleNotificationNavigation(initialNotification.notification.request.content.data);
      }
    } catch (error) {
      console.error('Error checking initial notification:', error);
    }
  }

  // Set up notification listeners
  private setupNotificationListeners(): void {
    // Listen for incoming notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
    });

    // Listen for notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification response
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { notification } = response;
    const data = notification.request.content.data;
    
    if (__DEV__) {
      console.log('NotificationService: Notification clicked:', {
        data,
        timestamp: new Date().toISOString()
      });
    }
    
    // Ensure authentication state is restored before handling navigation
    this.handleNotificationNavigation(data);
  }

  // Handle navigation based on notification data
  private async handleNotificationNavigation(data: any): Promise<void> {
    try {
      // Check if user is authenticated
      const isAuthenticated = await UserService.isLoggedIn();
      
      if (__DEV__) {
        console.log('NotificationService: Auth check result:', {
          isAuthenticated,
          data,
          timestamp: new Date().toISOString()
        });
      }

      if (!isAuthenticated) {
        // Try to restore authentication state
        const savedUser = await UserService.checkSavedAuthState();
        if (savedUser) {
          if (__DEV__) {
            console.log('NotificationService: Restored auth state from notification click');
          }
        } else {
          if (__DEV__) {
            console.log('NotificationService: No saved auth state found');
          }
          return; // User needs to log in first
        }
      }

      // Handle navigation based on notification type
      if (data?.type === 'scheduled_activity') {
        // Navigate to the scheduled activity or daily screen
        // This will be handled by the app navigation system
        if (__DEV__) {
          console.log('NotificationService: Navigating to scheduled activity:', data);
        }
      } else if (data?.type === 'reminder_activity') {
        // Navigate to the scheduled activity (same as main notification)
        // This will be handled by the app navigation system
        if (__DEV__) {
          console.log('NotificationService: Navigating to reminder activity:', data);
        }
      }
    } catch (error) {
      console.error('NotificationService: Error handling notification navigation:', error);
    }
  }

  // Schedule a notification for a specific activity
  async scheduleActivityNotification(activity: ScheduledActivity, entryTitle: string): Promise<string | null> {
    try {
      if (!activity.time) {
        return null;
      }

      // Parse the scheduled date and time
      const scheduledDate = new Date(`${activity.startDate}T${activity.time}`);
      
      // Check if the time has already passed
      if (scheduledDate <= new Date()) {
        return null;
      }

      // Create notification content
      const notificationContent = {
        title: `Time for: ${entryTitle}`,
        body: activity.note || `It's time for your scheduled ${entryTitle.toLowerCase()}`,
        data: {
          type: 'scheduled_activity',
          activityId: activity.id,
          entryId: activity.entryId,
          entryTitle: entryTitle,
          category: 'scheduled_reminder',
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        channelId: 'scheduled-activities',
      };

      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: {
          date: scheduledDate,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling activity notification:', error);
      return null;
    }
  }

  // Schedule a reminder notification 15 minutes before the scheduled time
  async scheduleReminderNotification(activity: ScheduledActivity, entryTitle: string): Promise<string | null> {
    try {
      if (!activity.time) {
        return null;
      }

      // Parse the scheduled date and time
      const scheduledDate = new Date(`${activity.startDate}T${activity.time}`);
      
      // Calculate reminder time (15 minutes before)
      const reminderDate = new Date(scheduledDate.getTime() - (15 * 60 * 1000));
      
      // Check if the reminder time has already passed
      if (reminderDate <= new Date()) {
        return null;
      }

      // Create reminder notification content
      const reminderContent = {
        title: `Reminder: ${entryTitle} in 15 minutes`,
        body: `Your ${entryTitle.toLowerCase()} is scheduled to start in 15 minutes`,
        data: {
          type: 'reminder_activity',
          activityId: activity.id,
          entryId: activity.entryId,
          entryTitle: entryTitle,
          category: 'reminder',
          scheduledTime: scheduledDate.toISOString(),
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        channelId: 'scheduled-activities',
      };

      // Schedule the reminder notification
      const reminderId = await Notifications.scheduleNotificationAsync({
        content: reminderContent,
        trigger: {
          date: reminderDate,
        },
      });

      if (__DEV__) {
        console.log('NotificationService: Scheduled reminder notification:', {
          activityId: activity.id,
          entryTitle,
          reminderTime: reminderDate.toISOString(),
          scheduledTime: scheduledDate.toISOString(),
          reminderId
        });
      }

      return reminderId;
    } catch (error) {
      console.error('Error scheduling reminder notification:', error);
      return null;
    }
  }

  // Schedule both reminder and main notification for an activity
  async scheduleActivityWithReminder(activity: ScheduledActivity, entryTitle: string): Promise<{ mainNotificationId: string | null; reminderNotificationId: string | null }> {
    try {
      // Schedule the main notification
      const mainNotificationId = await this.scheduleActivityNotification(activity, entryTitle);
      
      // Schedule the reminder notification
      const reminderNotificationId = await this.scheduleReminderNotification(activity, entryTitle);

      if (__DEV__) {
        console.log('NotificationService: Scheduled activity with reminder:', {
          activityId: activity.id,
          entryTitle,
          mainNotificationId,
          reminderNotificationId
        });
      }

      return { mainNotificationId, reminderNotificationId };
    } catch (error) {
      console.error('Error scheduling activity with reminder:', error);
      return { mainNotificationId: null, reminderNotificationId: null };
    }
  }

  // Schedule multiple notifications for recurring activities
  async scheduleRecurringActivityNotifications(
    activity: ScheduledActivity, 
    entryTitle: string, 
    endDate?: string
  ): Promise<string[]> {
    try {
      if (!activity.time) {
        return [];
      }

      const notificationIds: string[] = [];
      const startDate = new Date(activity.startDate);
      const end = endDate ? new Date(endDate) : new Date(activity.startDate);
      
      // Performance optimization: Limit the number of notifications to prevent excessive scheduling
      const maxNotifications = 30; // Limit to 30 days worth of notifications
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(startDate.getDate() + maxNotifications);
      
      const actualEnd = end < maxEndDate ? end : maxEndDate;
      
      // Generate notifications for each day in the range
      const currentDate = new Date(startDate);
      let notificationCount = 0;
      
      while (currentDate <= actualEnd && notificationCount < maxNotifications) {
        const scheduledDate = new Date(`${currentDate.toISOString().split('T')[0]}T${activity.time}`);
        
        // Only schedule if the time hasn't passed
        if (scheduledDate > new Date()) {
          // Schedule both reminder and main notification
          const { mainNotificationId, reminderNotificationId } = await this.scheduleActivityWithReminder(
            { ...activity, startDate: currentDate.toISOString().split('T')[0] },
            entryTitle
          );
          
          if (mainNotificationId) {
            notificationIds.push(mainNotificationId);
          }
          if (reminderNotificationId) {
            notificationIds.push(reminderNotificationId);
          }
          
          notificationCount += 2; // Count both main and reminder notifications
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (__DEV__) {
        console.log('NotificationService: Scheduled recurring notifications with reminders:', {
          activityId: activity.id,
          entryTitle,
          totalNotifications: notificationIds.length,
          startDate: activity.startDate,
          endDate: actualEnd.toISOString().split('T')[0],
          limited: end > maxEndDate
        });
      }

      return notificationIds;
    } catch (error) {
      console.error('Error scheduling recurring activity notifications:', error);
      return [];
    }
  }

  // Cancel a specific notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Cancel all notifications for a specific activity
  async cancelActivityNotifications(activityId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const notificationsToCancel: string[] = [];
      
      // Collect all notifications to cancel
      for (const notification of scheduledNotifications) {
        const data = notification.content.data as any;
        if (data?.activityId === activityId) {
          notificationsToCancel.push(notification.identifier);
        }
      }
      
      // Batch cancel notifications for better performance
      if (notificationsToCancel.length > 0) {
        await Promise.all(notificationsToCancel.map(id => this.cancelNotification(id)));
        
        if (__DEV__) {
          console.log('NotificationService: Cancelled notifications:', {
            activityId,
            count: notificationsToCancel.length,
            notificationIds: notificationsToCancel
          });
        }
      }
      
    } catch (error) {
      console.error('Error cancelling activity notifications:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      
      if (__DEV__) {
        console.log('NotificationService: All scheduled notifications:', {
          count: notifications.length,
          notifications: notifications.map(n => ({
            id: n.identifier,
            title: n.content.title,
            type: n.content.data?.type,
            activityId: n.content.data?.activityId,
            scheduledTime: 'date' in n.trigger ? n.trigger.date : 'recurring'
          }))
        });
      }
      
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Send immediate notification (for testing)
  async sendImmediateNotification(title: string, body: string, data?: any): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // null means send immediately
      });
      
      return notificationId;
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      return null;
    }
  }

  // Test reminder notification functionality
  async testReminderNotification(): Promise<{ mainId: string | null; reminderId: string | null }> {
    try {
      // Create a test activity scheduled for 2 minutes from now
      const testTime = new Date();
      testTime.setMinutes(testTime.getMinutes() + 2);
      
      const testActivity: ScheduledActivity = {
        id: 'test-activity-' + Date.now(),
        entryId: 'test-entry',
        startDate: testTime.toISOString().split('T')[0],
        time: testTime.toTimeString().split(' ')[0],
        note: 'Test activity for reminder functionality',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Schedule both reminder and main notification
      const result = await this.scheduleActivityWithReminder(testActivity, 'Test Activity');
      
      if (__DEV__) {
        console.log('NotificationService: Test reminder notification scheduled:', {
          mainId: result.mainNotificationId,
          reminderId: result.reminderNotificationId,
          scheduledTime: testTime.toISOString(),
          reminderTime: new Date(testTime.getTime() - (15 * 60 * 1000)).toISOString()
        });
      }

      return {
        mainId: result.mainNotificationId,
        reminderId: result.reminderNotificationId
      };
    } catch (error) {
      console.error('Error testing reminder notification:', error);
      return { mainId: null, reminderId: null };
    }
  }

  // Set up notification channels (Android)
  async setupNotificationChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('scheduled-activities', {
        name: 'Scheduled Activities',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('general', {
        name: 'General',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }
  }

  // Get notification permissions status
  async getPermissionsStatus(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }

  // Request notification permissions
  async requestPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.requestPermissionsAsync();
  }

  // Clean up listeners
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Get push token
  getPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default NotificationService.getInstance(); 