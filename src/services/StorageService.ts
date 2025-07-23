import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyHabits, MonthlyNote, MealPlan, Supplement, Exercise, Stretching } from '../types';

const STORAGE_KEYS = {
  DAILY_HABITS: 'daily_habits',
  MONTHLY_NOTES: 'monthly_notes',
  USER_PREFERENCES: 'user_preferences',
};

export class StorageService {
  // Daily Habits Management
  static async getDailyHabits(date: string): Promise<DailyHabits | null> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.DAILY_HABITS}_${date}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting daily habits:', error);
      return null;
    }
  }

  static async saveDailyHabits(date: string, habits: DailyHabits): Promise<boolean> {
    try {
      await AsyncStorage.setItem(`${STORAGE_KEYS.DAILY_HABITS}_${date}`, JSON.stringify(habits));
      return true;
    } catch (error) {
      console.error('Error saving daily habits:', error);
      return false;
    }
  }

  static async getOrCreateDailyHabits(date: string): Promise<DailyHabits> {
    const existing = await this.getDailyHabits(date);
    if (existing) {
      return existing;
    }

    const newHabits: DailyHabits = {
      date,
      meals: {
        id: `meal_${date}`,
        breakfast: '',
        lunch: '',
        dinner: '',
        snacks: [],
        notes: '',
      },
      supplements: [],
      exercises: [],
      stretching: [],
      notes: '',
      goals: [],
    };

    await this.saveDailyHabits(date, newHabits);
    return newHabits;
  }

  // Monthly Notes Management
  static async getMonthlyNote(date: string): Promise<MonthlyNote | null> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.MONTHLY_NOTES}_${date}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting monthly note:', error);
      return null;
    }
  }

  static async saveMonthlyNote(date: string, note: MonthlyNote): Promise<boolean> {
    try {
      await AsyncStorage.setItem(`${STORAGE_KEYS.MONTHLY_NOTES}_${date}`, JSON.stringify(note));
      return true;
    } catch (error) {
      console.error('Error saving monthly note:', error);
      return false;
    }
  }

  static async getOrCreateMonthlyNote(date: string): Promise<MonthlyNote> {
    const existing = await this.getMonthlyNote(date);
    if (existing) {
      return existing;
    }

    const newNote: MonthlyNote = {
      date,
      note: '',
      goals: [],
      checklist: [],
    };

    await this.saveMonthlyNote(date, newNote);
    return newNote;
  }

  // Utility Methods
  static async getAllDailyHabitsForMonth(year: number, month: number): Promise<DailyHabits[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const dailyHabitsKeys = keys.filter(key => 
        key.startsWith(STORAGE_KEYS.DAILY_HABITS) && 
        key.includes(`${year}-${month.toString().padStart(2, '0')}`)
      );

      const habits: DailyHabits[] = [];
      for (const key of dailyHabitsKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          habits.push(JSON.parse(data));
        }
      }

      return habits.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error getting monthly habits:', error);
      return [];
    }
  }

  static async clearAllData(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Helper methods for generating unique IDs
  static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static parseDate(dateString: string): Date {
    return new Date(dateString + 'T00:00:00');
  }
}

export default StorageService; 