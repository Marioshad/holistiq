import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entry, EntryCategory, SupplementEntry, NutritionEntry, FitnessEntry, WellnessEntry, HealthEntry, MedicineEntry, BaseEntry } from '../types';

const STORAGE_KEYS = {
  ENTRIES: 'entries',
  ENTRY_TEMPLATES: 'entry_templates',
};

export class EntryService {
  // Generate unique ID for entries
  static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Get all entries for a specific category
  static async getEntriesByCategory(category: EntryCategory): Promise<Entry[]> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.ENTRIES}_${category}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting entries by category:', error);
      return [];
    }
  }

  // Get all entries across all categories
  static async getAllEntries(): Promise<Entry[]> {
    try {
      const categories: EntryCategory[] = ['nutrition', 'supplements', 'vitamins', 'fitness', 'wellness', 'health', 'medicine'];
      const allEntries: Entry[] = [];

      for (const category of categories) {
        const entries = await this.getEntriesByCategory(category);
        allEntries.push(...entries);
      }

      return allEntries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      console.error('Error getting all entries:', error);
      return [];
    }
  }

  // Get entry by ID
  static async getEntryById(id: string): Promise<Entry | null> {
    try {
      const allEntries = await this.getAllEntries();
      return allEntries.find(entry => entry.id === id) || null;
    } catch (error) {
      console.error('Error getting entry by ID:', error);
      return null;
    }
  }

  // Create a new entry
  static async createEntry(entryData: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entry> {
    try {
      const now = new Date().toISOString();
      const newEntry: Entry = {
        ...entryData,
        id: this.generateId(),
        createdAt: now,
        updatedAt: now,
      } as Entry;

      const existingEntries = await this.getEntriesByCategory(entryData.category);
      const updatedEntries = [...existingEntries, newEntry];

      await AsyncStorage.setItem(
        `${STORAGE_KEYS.ENTRIES}_${entryData.category}`,
        JSON.stringify(updatedEntries)
      );

      return newEntry;
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  }

  // Update an existing entry
  static async updateEntry(id: string, updates: Partial<Omit<Entry, 'id' | 'createdAt'>>): Promise<Entry | null> {
    try {
      const existingEntry = await this.getEntryById(id);
      if (!existingEntry) {
        console.warn(`Entry with id ${id} not found for update`);
        throw new Error('Entry not found');
      }

      const updatedEntry: Entry = {
        ...existingEntry,
        ...updates,
        updatedAt: new Date().toISOString(),
      } as Entry;

      const existingEntries = await this.getEntriesByCategory(existingEntry.category);
      const updatedEntries = existingEntries.map(entry => 
        entry.id === id ? updatedEntry : entry
      );

      await AsyncStorage.setItem(
        `${STORAGE_KEYS.ENTRIES}_${existingEntry.category}`,
        JSON.stringify(updatedEntries)
      );

      return updatedEntry;
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }

  // Delete an entry
  static async deleteEntry(id: string): Promise<boolean> {
    try {
      const existingEntry = await this.getEntryById(id);
      if (!existingEntry) {
        throw new Error('Entry not found');
      }

      const existingEntries = await this.getEntriesByCategory(existingEntry.category);
      const updatedEntries = existingEntries.filter(entry => entry.id !== id);

      await AsyncStorage.setItem(
        `${STORAGE_KEYS.ENTRIES}_${existingEntry.category}`,
        JSON.stringify(updatedEntries)
      );

      return true;
    } catch (error) {
      console.error('Error deleting entry:', error);
      return false;
    }
  }

  // Search entries by title or description
  static async searchEntries(query: string, category?: EntryCategory): Promise<Entry[]> {
    try {
      const entries = category 
        ? await this.getEntriesByCategory(category)
        : await this.getAllEntries();

      const lowercaseQuery = query.toLowerCase();
      return entries.filter(entry => 
        entry.title.toLowerCase().includes(lowercaseQuery) ||
        entry.description?.toLowerCase().includes(lowercaseQuery) ||
        entry.label?.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching entries:', error);
      return [];
    }
  }

  // Get entries by color
  static async getEntriesByColor(color: string): Promise<Entry[]> {
    try {
      const allEntries = await this.getAllEntries();
      return allEntries.filter(entry => entry.color === color);
    } catch (error) {
      console.error('Error getting entries by color:', error);
      return [];
    }
  }

  // Helper method to create default supplement entry
  static createSupplementEntry(data: Omit<SupplementEntry, 'id' | 'createdAt' | 'updatedAt'>): Omit<SupplementEntry, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      ...data,
      category: data.category as 'supplements' | 'vitamins',
    };
  }

  // Helper method to create default nutrition entry
  static createNutritionEntry(data: Omit<NutritionEntry, 'id' | 'createdAt' | 'updatedAt'>): Omit<NutritionEntry, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      ...data,
      category: 'nutrition',
    };
  }

  // Helper method to create default fitness entry
  static createFitnessEntry(data: Omit<FitnessEntry, 'id' | 'createdAt' | 'updatedAt'>): Omit<FitnessEntry, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      ...data,
      category: 'fitness',
    };
  }

  // Helper method to create default wellness entry
  static createWellnessEntry(data: Omit<WellnessEntry, 'id' | 'createdAt' | 'updatedAt'>): Omit<WellnessEntry, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      ...data,
      category: 'wellness',
    };
  }

  // Helper method to create default medicine entry
  static createMedicineEntry(data: Omit<MedicineEntry, 'id' | 'createdAt' | 'updatedAt'>): Omit<MedicineEntry, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      ...data,
      category: 'medicine',
    };
  }

  // Clear all entries (for testing/reset purposes)
  static async clearAllEntries(): Promise<boolean> {
    try {
      const categories: EntryCategory[] = ['nutrition', 'supplements', 'vitamins', 'fitness', 'wellness', 'health', 'medicine'];
      
      for (const category of categories) {
        await AsyncStorage.removeItem(`${STORAGE_KEYS.ENTRIES}_${category}`);
      }

      return true;
    } catch (error) {
      console.error('Error clearing all entries:', error);
      return false;
    }
  }

  // Get statistics for entries
  static async getEntryStats(): Promise<{
    totalEntries: number;
    entriesByCategory: Record<EntryCategory, number>;
    recentEntries: Entry[];
  }> {
    try {
      const allEntries = await this.getAllEntries();
      const entriesByCategory: Record<EntryCategory, number> = {
        nutrition: 0,
        supplements: 0,
        vitamins: 0,
        fitness: 0,
        wellness: 0,
        health: 0,
        medicine: 0,
      };

      allEntries.forEach(entry => {
        entriesByCategory[entry.category]++;
      });

      const recentEntries = allEntries.slice(0, 10);

      return {
        totalEntries: allEntries.length,
        entriesByCategory,
        recentEntries,
      };
    } catch (error) {
      console.error('Error getting entry stats:', error);
      return {
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
      };
    }
  }
}

export default EntryService; 