import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScheduledActivity, DailySchedule, Entry } from '../types';

class ScheduleService {
  private static readonly SCHEDULE_KEY = '@schedule_activities';
  private static readonly DAILY_SCHEDULE_KEY = '@daily_schedules';

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Get all scheduled activities
  async getAllScheduledActivities(): Promise<ScheduledActivity[]> {
    try {
      const data = await AsyncStorage.getItem(ScheduleService.SCHEDULE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting scheduled activities:', error);
      return [];
    }
  }

  // Get scheduled activities for a specific date
  async getActivitiesForDate(date: string): Promise<ScheduledActivity[]> {
    try {
      const allActivities = await this.getAllScheduledActivities();
      return allActivities.filter(activity => {
        const activityStart = new Date(activity.startDate);
        const activityEnd = activity.endDate ? new Date(activity.endDate) : activityStart;
        const targetDate = new Date(date);
        
        return targetDate >= activityStart && targetDate <= activityEnd;
      });
    } catch (error) {
      console.error('Error getting activities for date:', error);
      return [];
    }
  }

  // Get scheduled activities for a date range
  async getActivitiesForDateRange(startDate: string, endDate: string): Promise<ScheduledActivity[]> {
    try {
      const allActivities = await this.getAllScheduledActivities();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return allActivities.filter(activity => {
        const activityStart = new Date(activity.startDate);
        const activityEnd = activity.endDate ? new Date(activity.endDate) : activityStart;
        
        // Check if activity overlaps with the requested range
        return (activityStart <= end && activityEnd >= start);
      });
    } catch (error) {
      console.error('Error getting activities for date range:', error);
      return [];
    }
  }

  // Schedule a new activity
  async scheduleActivity(
    entryId: string, 
    startDate: string, 
    endDate?: string, 
    time?: string, 
    note?: string
  ): Promise<ScheduledActivity> {
    try {
      const newActivity: ScheduledActivity = {
        id: this.generateId(),
        entryId,
        startDate,
        endDate,
        time,
        completed: false,
        note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const activities = await this.getAllScheduledActivities();
      activities.push(newActivity);
      
      await AsyncStorage.setItem(ScheduleService.SCHEDULE_KEY, JSON.stringify(activities));
      return newActivity;
    } catch (error) {
      console.error('Error scheduling activity:', error);
      throw error;
    }
  }

  // Update scheduled activity
  async updateScheduledActivity(activityId: string, updates: Partial<ScheduledActivity>): Promise<ScheduledActivity | null> {
    try {
      const activities = await this.getAllScheduledActivities();
      const activityIndex = activities.findIndex(a => a.id === activityId);
      
      if (activityIndex === -1) {
        console.error('Activity not found:', activityId);
        return null;
      }

      activities[activityIndex] = {
        ...activities[activityIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(ScheduleService.SCHEDULE_KEY, JSON.stringify(activities));
      return activities[activityIndex];
    } catch (error) {
      console.error('Error updating scheduled activity:', error);
      throw error;
    }
  }

  // Mark activity as completed
  async completeActivity(activityId: string): Promise<ScheduledActivity | null> {
    return this.updateScheduledActivity(activityId, {
      completed: true,
      completedAt: new Date().toISOString(),
    });
  }

  // Mark activity as not completed
  async uncompleteActivity(activityId: string): Promise<ScheduledActivity | null> {
    return this.updateScheduledActivity(activityId, {
      completed: false,
      completedAt: undefined,
    });
  }

  // Delete scheduled activity
  async deleteScheduledActivity(activityId: string): Promise<boolean> {
    try {
      const activities = await this.getAllScheduledActivities();
      const filteredActivities = activities.filter(a => a.id !== activityId);
      
      await AsyncStorage.setItem(ScheduleService.SCHEDULE_KEY, JSON.stringify(filteredActivities));
      return true;
    } catch (error) {
      console.error('Error deleting scheduled activity:', error);
      return false;
    }
  }

  // Delete all activities for a specific entry
  async deleteActivitiesForEntry(entryId: string): Promise<boolean> {
    try {
      const activities = await this.getAllScheduledActivities();
      const filteredActivities = activities.filter(a => a.entryId !== entryId);
      
      await AsyncStorage.setItem(ScheduleService.SCHEDULE_KEY, JSON.stringify(filteredActivities));
      return true;
    } catch (error) {
      console.error('Error deleting activities for entry:', error);
      return false;
    }
  }

  // Get upcoming activities (next 7 days)
  async getUpcomingActivities(): Promise<ScheduledActivity[]> {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return this.getActivitiesForDateRange(
      today.toISOString().split('T')[0],
      nextWeek.toISOString().split('T')[0]
    );
  }

  // Get statistics
  async getScheduleStats(): Promise<{
    totalActivities: number;
    completedActivities: number;
    upcomingActivities: number;
    activitiesByCategory: Record<string, number>;
  }> {
    try {
      const activities = await this.getAllScheduledActivities();
      const upcomingActivities = await this.getUpcomingActivities();
      
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

  // Clear all scheduled activities (for testing/reset)
  async clearAllActivities(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(ScheduleService.SCHEDULE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing all activities:', error);
      return false;
    }
  }
}

export default new ScheduleService(); 