import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { ScheduledActivity, DailySchedule, Entry } from '../types';
import NotificationService from './NotificationService';
import EntryService from './EntryService';

class ScheduleService {
  // Get current user ID with fallback
  private getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  // Check if user is authenticated
  private isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  // Get user's scheduled activities collection reference
  private getUserScheduledActivitiesCollection(userId: string) {
    return collection(db, 'users', userId, 'scheduledActivities');
  }

  // Convert Firestore timestamp to ISO string
  private timestampToISO(timestamp: Timestamp | Date | string | null | undefined): string {
    try {
      if (!timestamp) {
        return new Date().toISOString();
      }
      
      // If it's already a string, return it
      if (typeof timestamp === 'string') {
        return timestamp;
      }
      
      // If it's a Firestore Timestamp, convert to Date
      if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
        const firestoreTimestamp = timestamp as Timestamp;
        if (firestoreTimestamp.toDate && typeof firestoreTimestamp.toDate === 'function') {
          return firestoreTimestamp.toDate().toISOString();
        }
      }
      
      // If it's a Date object, convert to ISO string
      if (timestamp instanceof Date) {
        return timestamp.toISOString();
      }
      
      // Handle Firestore Timestamp objects that might not have toDate method
      if (timestamp && typeof timestamp === 'object' && timestamp.seconds !== undefined) {
        // This is a Firestore Timestamp with seconds/nanoseconds
        const seconds = timestamp.seconds;
        const nanoseconds = timestamp.nanoseconds || 0;
        const date = new Date(seconds * 1000 + nanoseconds / 1000000);
        return date.toISOString();
      }
      
      // Fallback to current date
      return new Date().toISOString();
    } catch (error) {
      console.error('Error in timestampToISO:', error, 'Timestamp:', timestamp, 'Type:', typeof timestamp);
      return new Date().toISOString();
    }
  }

  // Convert ISO string to Firestore timestamp
  private isoToTimestamp(isoString: string): Timestamp {
    return Timestamp.fromDate(new Date(isoString));
  }

  // Convert Firestore document to ScheduledActivity object
  private docToScheduledActivity(doc: QueryDocumentSnapshot<DocumentData>): ScheduledActivity {
    const data = doc.data();
    
    try {
      // Log the timestamp data for debugging
      if (__DEV__) {
        console.log('Scheduled Activity timestamps:', {
          docId: doc.id,
          createdAt: data.createdAt,
          createdAtType: typeof data.createdAt,
          updatedAt: data.updatedAt,
          updatedAtType: typeof data.updatedAt,
          completedAt: data.completedAt,
          completedAtType: typeof data.completedAt,
        });
      }
      
      const activity = {
        id: doc.id,
        entryId: data.entryId,
        startDate: data.startDate,
        endDate: data.endDate,
        time: data.time,
        completed: data.completed || false,
        completedAt: data.completedAt ? this.timestampToISO(data.completedAt) : undefined,
        note: data.note,
        createdAt: this.timestampToISO(data.createdAt),
        updatedAt: this.timestampToISO(data.updatedAt),
      } as ScheduledActivity;
      
      return activity;
    } catch (error) {
      console.error('Error converting document to ScheduledActivity:', error, 'Document ID:', doc.id, 'Data:', data);
      // Return a fallback activity with current timestamps
      return {
        id: doc.id,
        entryId: data?.entryId || '',
        startDate: data?.startDate || new Date().toISOString(),
        endDate: data?.endDate,
        time: data?.time || '',
        completed: data?.completed || false,
        completedAt: data?.completedAt ? this.timestampToISO(data.completedAt) : undefined,
        note: data?.note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ScheduledActivity;
    }
  }

  // Convert ScheduledActivity object to Firestore document data
  private scheduledActivityToDocData(activity: Omit<ScheduledActivity, 'id' | 'createdAt' | 'updatedAt'>): DocumentData {
    const { id, createdAt, updatedAt, ...activityData } = activity as any;
    const cleanedData = this.cleanData(activityData);
    return {
      ...cleanedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  }

  // Clean data by removing undefined values and handling other Firestore restrictions
  private cleanData<T extends object>(data: T): T {
    return Object.fromEntries(
      Object.entries(data).filter(([_, v]) => {
        // Remove undefined values
        if (v === undefined) return false;
        
        // Remove null values (optional - uncomment if you want to remove nulls too)
        // if (v === null) return false;
        
        // Remove empty strings (optional - uncomment if you want to remove empty strings)
        // if (typeof v === 'string' && v.trim() === '') return false;
        
        return true;
      })
    ) as T;
  }

  // Get all scheduled activities for a user
  async getAllScheduledActivities(userId?: string): Promise<ScheduledActivity[]> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        return [];
      }

      const activitiesRef = this.getUserScheduledActivitiesCollection(currentUserId);
      
      // Try ordered query first, fallback to simple query if index is missing
      let querySnapshot;
      try {
        // Try with ordering
        const q = query(activitiesRef, orderBy('updatedAt', 'desc'));
        querySnapshot = await getDocs(q);
      } catch (orderError) {
        console.warn('OrderBy failed, trying simple query:', orderError);
        // Fallback to simple query without ordering
        querySnapshot = await getDocs(activitiesRef);
      }
      
      const activities = querySnapshot.docs.map(doc => this.docToScheduledActivity(doc));
      return activities;
    } catch (error) {
      console.error('Error getting scheduled activities:', error);
      return [];
    }
  }

  // Get scheduled activities for a specific date
  async getActivitiesForDate(date: string, userId?: string): Promise<ScheduledActivity[]> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        return [];
      }

      const allActivities = await this.getAllScheduledActivities(currentUserId);
      const filteredActivities = allActivities.filter(activity => {
        const activityStart = new Date(activity.startDate);
        const activityEnd = activity.endDate ? new Date(activity.endDate) : activityStart;
        const targetDate = new Date(date);
        
        return targetDate >= activityStart && targetDate <= activityEnd;
      });

      return filteredActivities;
    } catch (error) {
      console.error('Error getting activities for date:', error);
      return [];
    }
  }

  // Get scheduled activities for a date range
  async getActivitiesForDateRange(startDate: string, endDate: string, userId?: string): Promise<ScheduledActivity[]> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        return [];
      }

      const allActivities = await this.getAllScheduledActivities(currentUserId);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const filteredActivities = allActivities.filter(activity => {
        const activityStart = new Date(activity.startDate);
        const activityEnd = activity.endDate ? new Date(activity.endDate) : activityStart;
        
        // Check if activity overlaps with the requested range
        return (activityStart <= end && activityEnd >= start);
      });

      return filteredActivities;
    } catch (error) {
      console.error('Error getting activities for date range:', error);
      return [];
    }
  }

  // Schedule a new activity for a user
  async scheduleActivity(
    userId: string,
    entryId: string, 
    startDate: string, 
    endDate?: string, 
    time?: string, 
    note?: string
  ): Promise<ScheduledActivity> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to schedule activities');
      }

      const newActivity: Omit<ScheduledActivity, 'id' | 'createdAt' | 'updatedAt'> = {
        entryId,
        startDate,
        endDate,
        time,
        completed: false,
        note,
      };

      const activitiesRef = this.getUserScheduledActivitiesCollection(userId);
      const docData = this.scheduledActivityToDocData(newActivity);
      
      const docRef = await addDoc(activitiesRef, docData);
      
      // Get the created document to return with proper timestamps
      const createdDoc = await getDoc(docRef);
      if (createdDoc.exists()) {
        const scheduledActivity = this.docToScheduledActivity(createdDoc as QueryDocumentSnapshot<DocumentData>);
        
        // Schedule notification for this activity (non-blocking)
        this.scheduleNotificationAsync(scheduledActivity, userId);
        
        return scheduledActivity;
      }
      
      throw new Error('Failed to create scheduled activity');
    } catch (error) {
      console.error('Error scheduling activity:', error);
      console.error('Activity data that caused error:', JSON.stringify({ entryId, startDate, endDate, time, note }, null, 2));
      throw error;
    }
  }

  // Update scheduled activity for a user
  async updateScheduledActivity(userId: string, activityId: string, updates: Partial<Omit<ScheduledActivity, 'id' | 'createdAt'>>): Promise<ScheduledActivity | null> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to update scheduled activities');
      }

      const activityRef = doc(db, 'users', userId, 'scheduledActivities', activityId);
      
      // Check if activity exists
      const activityDoc = await getDoc(activityRef);
      if (!activityDoc.exists()) {
        throw new Error('Scheduled activity not found');
      }

      const cleanedUpdates = this.cleanData(updates);
      const updateData = {
        ...cleanedUpdates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(activityRef, updateData);
      
      // Get the updated document
      const updatedDoc = await getDoc(activityRef);
      return this.docToScheduledActivity(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error updating scheduled activity:', error);
      throw error;
    }
  }

  // Mark activity as completed
  async completeActivity(userId: string, activityId: string): Promise<ScheduledActivity | null> {
    return this.updateScheduledActivity(userId, activityId, {
      completed: true,
      completedAt: new Date().toISOString(),
    });
  }

  // Mark activity as not completed
  async uncompleteActivity(userId: string, activityId: string): Promise<ScheduledActivity | null> {
    return this.updateScheduledActivity(userId, activityId, {
      completed: false,
      completedAt: undefined,
    });
  }

  // Delete scheduled activity for a user
  async deleteScheduledActivity(userId: string, activityId: string): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to delete scheduled activities');
      }

      const activityRef = doc(db, 'users', userId, 'scheduledActivities', activityId);
      
      // Check if activity exists
      const activityDoc = await getDoc(activityRef);
      if (!activityDoc.exists()) {
        throw new Error('Scheduled activity not found');
      }

      await deleteDoc(activityRef);
      
      // Cancel notifications for this activity
      try {
        await NotificationService.cancelActivityNotifications(activityId);
      } catch (notificationError) {
        console.warn('Failed to cancel notifications for deleted activity:', notificationError);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting scheduled activity:', error);
      throw error;
    }
  }

  // Delete all activities for a specific entry
  async deleteActivitiesForEntry(userId: string, entryId: string): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to delete scheduled activities');
      }

      const activities = await this.getAllScheduledActivities(userId);
      const activitiesToDelete = activities.filter(a => a.entryId === entryId);
      
      const deletePromises = activitiesToDelete.map(activity => 
        this.deleteScheduledActivity(userId, activity.id)
      );
      
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error deleting activities for entry:', error);
      return false;
    }
  }

  // Get upcoming activities (next 7 days)
  async getUpcomingActivities(userId?: string): Promise<ScheduledActivity[]> {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return this.getActivitiesForDateRange(
      today.toISOString().split('T')[0],
      nextWeek.toISOString().split('T')[0],
      userId
    );
  }

  // Get statistics
  async getScheduleStats(userId?: string): Promise<{
    totalActivities: number;
    completedActivities: number;
    upcomingActivities: number;
    activitiesByCategory: Record<string, number>;
  }> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        return {
          totalActivities: 0,
          completedActivities: 0,
          upcomingActivities: 0,
          activitiesByCategory: {},
        };
      }

      const activities = await this.getAllScheduledActivities(currentUserId);
      const upcomingActivities = await this.getUpcomingActivities(currentUserId);
      
      const stats = {
        totalActivities: activities.length,
        completedActivities: activities.filter(a => a.completed).length,
        upcomingActivities: upcomingActivities.length,
        activitiesByCategory: {} as Record<string, number>,
      };

      return stats;
    } catch (error) {
      console.error('Error getting schedule stats:', error);
      return {
        totalActivities: 0,
        completedActivities: 0,
        upcomingActivities: 0,
        activitiesByCategory: {},
      };
    }
  }

  // Helper method to format date for display
  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  // Helper method to check if date is today
  isToday(date: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  }

  // Helper method to get date range days
  getDateRangeDays(startDate: string, endDate?: string): string[] {
    const days: string[] = [];
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    
    const current = new Date(start);
    while (current <= end) {
      days.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }

  // Clear all scheduled activities for a user (for testing/reset)
  async clearAllActivities(userId?: string): Promise<boolean> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('No user ID provided and no authenticated user');
      }

      const activities = await this.getAllScheduledActivities(currentUserId);
      const deletePromises = activities.map(activity => 
        this.deleteScheduledActivity(currentUserId, activity.id)
      );
      
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error clearing all activities:', error);
      return false;
    }
  }



  // Get entry details for notifications
  private async getEntryDetails(entryId: string, userId: string): Promise<Entry | null> {
    try {
      return await EntryService.getEntryById(entryId, userId);
    } catch (error) {
      console.error('Error getting entry details:', error);
      return null;
    }
  }

  // Schedule notification asynchronously (non-blocking)
  private scheduleNotificationAsync(scheduledActivity: ScheduledActivity, userId: string): void {
    // Use setTimeout to make this non-blocking
    setTimeout(async () => {
      try {
        // Get the entry details for notification
        const entry = await this.getEntryDetails(scheduledActivity.entryId, userId);
        if (entry) {
          if (scheduledActivity.endDate && scheduledActivity.endDate !== scheduledActivity.startDate) {
            // Recurring activity - schedule multiple notifications
            await NotificationService.scheduleRecurringActivityNotifications(
              scheduledActivity,
              entry.title,
              scheduledActivity.endDate
            );
          } else {
            // Single activity - schedule one notification
            await NotificationService.scheduleActivityNotification(scheduledActivity, entry.title);
          }
        }
      } catch (notificationError) {
        console.warn('Failed to schedule notification for activity:', notificationError);
        // Don't fail the activity creation if notification fails
      }
    }, 0);
  }

  // Legacy method for backward compatibility (without userId parameter)
  async scheduleActivityLegacy(
    entryId: string, 
    startDate: string, 
    endDate?: string, 
    time?: string, 
    note?: string
  ): Promise<ScheduledActivity> {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User must be authenticated to schedule activities');
    }
    return this.scheduleActivity(currentUserId, entryId, startDate, endDate, time, note);
  }
}

export default new ScheduleService(); 