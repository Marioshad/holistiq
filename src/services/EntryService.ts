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
import { Entry, EntryCategory, SupplementEntry, NutritionEntry, FitnessEntry, WellnessEntry, HealthEntry, MedicineEntry, BaseEntry } from '../types';

export class EntryService {
  // Get current user ID with fallback
  private static getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  // Check if user is authenticated
  private static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  // Get user's entries collection reference
  private static getUserEntriesCollection(userId: string) {
    return collection(db, 'users', userId, 'entries');
  }

  // Convert Firestore timestamp to ISO string
  private static timestampToISO(timestamp: Timestamp | Date | string | null | undefined): string {
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
  private static isoToTimestamp(isoString: string): Timestamp {
    return Timestamp.fromDate(new Date(isoString));
  }

  // Convert Firestore document to Entry object
  private static docToEntry(doc: QueryDocumentSnapshot<DocumentData>): Entry {
    const data = doc.data();
    
    try {
      // Log the timestamp data for debugging
      if (__DEV__) {
        console.log('Document timestamps:', {
          docId: doc.id,
          createdAt: data.createdAt,
          createdAtType: typeof data.createdAt,
          updatedAt: data.updatedAt,
          updatedAtType: typeof data.updatedAt,
        });
      }
      
      const entry = {
        id: doc.id,
        title: data.title,
        category: data.category,
        label: data.label,
        description: data.description,
        color: data.color,
        createdAt: this.timestampToISO(data.createdAt),
        updatedAt: this.timestampToISO(data.updatedAt),
        // Include category-specific fields without overriding base fields
        ...Object.fromEntries(
          Object.entries(data).filter(([key]) => 
            !['title', 'category', 'label', 'description', 'color', 'createdAt', 'updatedAt'].includes(key)
          )
        )
      } as Entry;
      
      return entry;
    } catch (error) {
      console.error('Error converting document to Entry:', error, 'Document ID:', doc.id, 'Data:', data);
      // Return a fallback entry with current timestamps
      return {
        id: doc.id,
        title: data?.title || 'Unknown Entry',
        category: data?.category || 'supplements',
        label: data?.label,
        description: data?.description,
        color: data?.color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Include category-specific fields without overriding base fields
        ...Object.fromEntries(
          Object.entries(data || {}).filter(([key]) => 
            !['title', 'category', 'label', 'description', 'color', 'createdAt', 'updatedAt'].includes(key)
          )
        )
      } as Entry;
    }
  }

  // Clean data by removing undefined values and handling other Firestore restrictions
  private static cleanData<T extends object>(data: T): T {
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

  // Convert Entry object to Firestore document data
  private static entryToDocData(entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): DocumentData {
    const { id, createdAt, updatedAt, ...entryData } = entry as any;
    const cleanedData = this.cleanData(entryData);
    return {
      ...cleanedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  }

  // Get all entries for a user
  static async getEntries(userId?: string): Promise<Entry[]> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        return [];
      }

      const entriesRef = this.getUserEntriesCollection(currentUserId);
      
      // Try ordered query first, fallback to simple query if index is missing
      let querySnapshot;
      try {
        const q = query(entriesRef, orderBy('updatedAt', 'desc'));
        querySnapshot = await getDocs(q);
      } catch (orderError) {
        console.warn('OrderBy failed, trying simple query:', orderError);
        // Fallback to simple query without ordering
        querySnapshot = await getDocs(entriesRef);
      }
      
      return querySnapshot.docs.map(doc => {
        try {
          return this.docToEntry(doc);
        } catch (error) {
          console.error('Error converting document to entry:', error, 'Document ID:', doc.id);
          // Return a fallback entry
          const data = doc.data();
          return {
            id: doc.id,
            title: data?.title || 'Unknown Entry',
            category: data?.category || 'supplements',
            label: data?.label,
            description: data?.description,
            color: data?.color,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...Object.fromEntries(
              Object.entries(data || {}).filter(([key]) => 
                !['title', 'category', 'label', 'description', 'color', 'createdAt', 'updatedAt'].includes(key)
              )
            )
          } as Entry;
        }
      });
    } catch (error) {
      console.error('Error getting entries:', error);
      return [];
    }
  }

  // Get entries by category for a user
  static async getEntriesByCategory(category: EntryCategory, userId?: string): Promise<Entry[]> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        return [];
      }

      const entriesRef = this.getUserEntriesCollection(currentUserId);
      
      // Try with orderBy first, fallback to simple where clause if it fails
      let querySnapshot;
      try {
        const q = query(
          entriesRef, 
          where('category', '==', category),
          orderBy('updatedAt', 'desc')
        );
        querySnapshot = await getDocs(q);
      } catch (orderByError) {
        console.warn('OrderBy failed, trying simple query:', orderByError);
        // Fallback to simple query without orderBy
        const q = query(entriesRef, where('category', '==', category));
        querySnapshot = await getDocs(q);
      }
      
      return querySnapshot.docs.map(doc => {
        try {
          return this.docToEntry(doc);
        } catch (error) {
          console.error('Error converting document to entry:', error, 'Document ID:', doc.id);
          // Return a fallback entry
          const data = doc.data();
          return {
            id: doc.id,
            title: data?.title || 'Unknown Entry',
            category: data?.category || 'supplements',
            label: data?.label,
            description: data?.description,
            color: data?.color,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...Object.fromEntries(
              Object.entries(data || {}).filter(([key]) => 
                !['title', 'category', 'label', 'description', 'color', 'createdAt', 'updatedAt'].includes(key)
              )
            )
          } as Entry;
        }
      });
    } catch (error) {
      console.error('Error getting entries by category:', error);
      return [];
    }
  }

  // Get all entries across all categories for a user
  static async getAllEntries(userId?: string): Promise<Entry[]> {
    return this.getEntries(userId);
  }

  // Get entry by ID for a user
  static async getEntryById(entryId: string, userId?: string): Promise<Entry | null> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        return null;
      }

      const entryRef = doc(db, 'users', currentUserId, 'entries', entryId);
      const entryDoc = await getDoc(entryRef);
      
      if (entryDoc.exists()) {
        return this.docToEntry(entryDoc as QueryDocumentSnapshot<DocumentData>);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting entry by ID:', error);
      return null;
    }
  }

  // Add a new entry for a user
  static async addEntry(userId: string, entryData: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entry> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to add entries');
      }

      const entriesRef = this.getUserEntriesCollection(userId);
      const docData = this.entryToDocData(entryData);
      
      const docRef = await addDoc(entriesRef, docData);
      
      // Get the created document to return with proper timestamps
      const createdDoc = await getDoc(docRef);
      if (createdDoc.exists()) {
        return this.docToEntry(createdDoc as QueryDocumentSnapshot<DocumentData>);
      }
      
      throw new Error('Failed to create entry');
    } catch (error) {
      console.error('Error adding entry:', error);
      console.error('Entry data that caused error:', JSON.stringify(entryData, null, 2));
      throw error;
    }
  }

  // Update an existing entry for a user
  static async updateEntry(userId: string, entryId: string, updates: Partial<Omit<Entry, 'id' | 'createdAt'>>): Promise<Entry | null> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to update entries');
      }

      const entryRef = doc(db, 'users', userId, 'entries', entryId);
      
      // Check if entry exists
      const entryDoc = await getDoc(entryRef);
      if (!entryDoc.exists()) {
        throw new Error('Entry not found');
      }

      const cleanedUpdates = this.cleanData(updates);
      const updateData = {
        ...cleanedUpdates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(entryRef, updateData);
      
      // Get the updated document
      const updatedDoc = await getDoc(entryRef);
      return this.docToEntry(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }

  // Delete an entry for a user
  static async deleteEntry(userId: string, entryId: string): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to delete entries');
      }

      const entryRef = doc(db, 'users', userId, 'entries', entryId);
      
      // Check if entry exists
      const entryDoc = await getDoc(entryRef);
      if (!entryDoc.exists()) {
        throw new Error('Entry not found');
      }

      await deleteDoc(entryRef);
      return true;
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }

  // Create a new entry (legacy method for backward compatibility)
  static async createEntry(entryData: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entry> {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User must be authenticated to create entries');
    }
    return this.addEntry(currentUserId, entryData);
  }

  // Search entries by title or description for a user
  static async searchEntries(query: string, category?: EntryCategory, userId?: string): Promise<Entry[]> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        return [];
      }

      const entries = category 
        ? await this.getEntriesByCategory(category, currentUserId)
        : await this.getEntries(currentUserId);

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

  // Get entries by color for a user
  static async getEntriesByColor(color: string, userId?: string): Promise<Entry[]> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        return [];
      }

      const entriesRef = this.getUserEntriesCollection(currentUserId);
      const q = query(
        entriesRef, 
        where('color', '==', color),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        try {
          return this.docToEntry(doc);
        } catch (error) {
          console.error('Error converting document to entry:', error, 'Document ID:', doc.id);
          // Return a fallback entry
          const data = doc.data();
          return {
            id: doc.id,
            title: data?.title || 'Unknown Entry',
            category: data?.category || 'supplements',
            label: data?.label,
            description: data?.description,
            color: data?.color,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...Object.fromEntries(
              Object.entries(data || {}).filter(([key]) => 
                !['title', 'category', 'label', 'description', 'color', 'createdAt', 'updatedAt'].includes(key)
              )
            )
          } as Entry;
        }
      });
    } catch (error) {
      console.error('Error getting entries by color:', error);
      return [];
    }
  }

  // Get recent entries for a user
  static async getRecentEntries(limitCount: number = 10, userId?: string): Promise<Entry[]> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        return [];
      }

      const entriesRef = this.getUserEntriesCollection(currentUserId);
      const q = query(entriesRef, orderBy('updatedAt', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        try {
          return this.docToEntry(doc);
        } catch (error) {
          console.error('Error converting document to entry:', error, 'Document ID:', doc.id);
          // Return a fallback entry
          const data = doc.data();
          return {
            id: doc.id,
            title: data?.title || 'Unknown Entry',
            category: data?.category || 'supplements',
            label: data?.label,
            description: data?.description,
            color: data?.color,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...Object.fromEntries(
              Object.entries(data || {}).filter(([key]) => 
                !['title', 'category', 'label', 'description', 'color', 'createdAt', 'updatedAt'].includes(key)
              )
            )
          } as Entry;
        }
      });
    } catch (error) {
      console.error('Error getting recent entries:', error);
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

  // Get statistics for entries for a user
  static async getEntryStats(userId?: string): Promise<{
    totalEntries: number;
    entriesByCategory: Record<EntryCategory, number>;
    recentEntries: Entry[];
  }> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
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

      const allEntries = await this.getEntries(currentUserId);
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

      const recentEntries = await this.getRecentEntries(10, currentUserId);

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

  // Clear all entries for a user (for testing/reset purposes)
  static async clearAllEntries(userId?: string): Promise<boolean> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('No user ID provided and no authenticated user');
      }

      const entries = await this.getEntries(currentUserId);
      const deletePromises = entries.map(entry => 
        this.deleteEntry(currentUserId, entry.id)
      );
      
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error clearing all entries:', error);
      return false;
    }
  }


}

export default EntryService; 