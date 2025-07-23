# Firestore Migration Guide for EntryService

## Overview
The EntryService has been successfully migrated from AsyncStorage to Firestore, providing cloud-based data persistence with real-time synchronization and user-specific data isolation.

## Key Changes

### 🔄 **Method Signature Updates**

#### **Before (AsyncStorage):**
```typescript
// Get entries
static async getEntriesByCategory(category: EntryCategory): Promise<Entry[]>
static async getAllEntries(): Promise<Entry[]>
static async getEntryById(id: string): Promise<Entry | null>

// Create/Update/Delete
static async createEntry(entryData: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entry>
static async updateEntry(id: string, updates: Partial<Omit<Entry, 'id' | 'createdAt'>>): Promise<Entry | null>
static async deleteEntry(id: string): Promise<boolean>
```

#### **After (Firestore):**
```typescript
// Get entries (with optional userId parameter)
static async getEntries(userId?: string): Promise<Entry[]>
static async getEntriesByCategory(category: EntryCategory, userId?: string): Promise<Entry[]>
static async getAllEntries(userId?: string): Promise<Entry[]>
static async getEntryById(entryId: string, userId?: string): Promise<Entry | null>

// Create/Update/Delete (with required userId)
static async addEntry(userId: string, entryData: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entry>
static async updateEntry(userId: string, entryId: string, updates: Partial<Omit<Entry, 'id' | 'createdAt'>>): Promise<Entry | null>
static async deleteEntry(userId: string, entryId: string): Promise<boolean>

// Legacy method for backward compatibility
static async createEntry(entryData: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entry>
```

### 🔐 **Authentication Integration**
- All operations now require user authentication
- Uses `auth.currentUser?.uid` for user identification
- Automatic fallback handling for unauthenticated users

### 🕓 **Timestamp Management**
- Uses Firestore `serverTimestamp()` for `createdAt` and `updatedAt`
- Automatic conversion between Firestore Timestamps and ISO strings
- Consistent timestamp handling across all operations

### 🧹 **Data Sanitization**
- Automatic removal of `undefined` values before sending to Firestore
- Prevents "Unsupported field value: undefined" errors
- Optional filtering for null values and empty strings
- Debug logging for data structure validation

## Usage Examples

### **Basic Usage (Recommended)**
```typescript
import EntryService from '../services/EntryService';
import { auth } from '../../firebase';

// Get current user's entries
const entries = await EntryService.getEntries();

// Get entries by category
const supplements = await EntryService.getEntriesByCategory('supplements');

// Create a new entry
const newEntry = await EntryService.createEntry({
  title: 'Vitamin D',
  category: 'vitamins',
  type: 'pill',
  dose: '1000 IU',
  description: 'Daily vitamin D supplement'
});

// Update an entry
const userId = auth.currentUser?.uid;
if (userId) {
  await EntryService.updateEntry(userId, entryId, {
    title: 'Updated Vitamin D',
    dose: '2000 IU'
  });
}

// Delete an entry
if (userId) {
  await EntryService.deleteEntry(userId, entryId);
}
```

### **Advanced Usage (Explicit User ID)**
```typescript
// For admin operations or cross-user data access
const userId = 'specific-user-id';

// Get entries for specific user
const userEntries = await EntryService.getEntries(userId);

// Add entry for specific user
await EntryService.addEntry(userId, {
  title: 'Protein Shake',
  category: 'nutrition',
  calories: 250,
  mealType: 'snack'
});
```

### **Error Handling**
```typescript
try {
  const entries = await EntryService.getEntries();
  // Handle success
} catch (error) {
  if (error.message === 'User must be authenticated to access entries') {
    // Handle authentication error
    console.log('User not authenticated');
  } else {
    // Handle other errors
    console.error('Error accessing entries:', error);
  }
}
```

## Firestore Document Structure

### **Collection Path:**
```
users/{userId}/entries/{entryId}
```

### **Document Fields:**
```typescript
{
  title: string,
  category: EntryCategory,
  label?: string,
  description?: string,
  color?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Category-specific fields
  type?: SupplementType,           // supplements, vitamins
  dose?: string,                   // supplements, vitamins
  doseUnit?: string,               // supplements, vitamins
  doseAmount?: number,             // supplements, vitamins
  
  calories?: number,               // nutrition
  servingSize?: string,            // nutrition
  mealType?: string,               // nutrition
  
  duration?: number,               // fitness, wellness, health
  intensity?: string,              // fitness
  muscleGroups?: string[],         // fitness
  equipment?: string[],            // fitness
  caloriesBurned?: number,         // fitness
  type?: string,                   // fitness, wellness, health
  
  moodBefore?: string,             // wellness
  moodAfter?: string,              // wellness
  
  provider?: string,               // health
  
  dosage?: string,                 // medicine
  frequency?: string,              // medicine
  prescribedBy?: string,           // medicine
  refillDate?: string,             // medicine
  sideEffects?: string[]           // medicine
}
```

## Security Rules (Firestore Console)

### **Recommended Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own entries
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Migration Checklist

### ✅ **Completed:**
- [x] Updated EntryService to use Firestore
- [x] Added authentication integration
- [x] Implemented proper timestamp handling
- [x] Added user-specific data isolation
- [x] Updated method signatures with userId parameters
- [x] Added backward compatibility for createEntry method
- [x] Updated AddEditEntryScreen to use new methods
- [x] Updated EntryListScreen to use new methods
- [x] Updated EntryDetailsScreen to use new methods
- [x] Updated DailyScreen to use new methods
- [x] Updated EntryManagementScreen to use new methods
- [x] Updated ScheduleRecordBottomSheet to use new methods
- [x] Updated EntryEditDrawer to use new methods

### 🔄 **Pending Updates:**
- [x] All components updated successfully

### 🧪 **Testing Required:**
- [ ] Test entry creation with authentication
- [ ] Test entry updates with authentication
- [ ] Test entry deletion with authentication
- [ ] Test data persistence across app restarts
- [ ] Test offline/online synchronization
- [ ] Test user-specific data isolation

## Benefits of Firestore Migration

### **✅ Advantages:**
- **Cloud Storage**: Data persists across devices
- **Real-time Sync**: Automatic synchronization
- **User Isolation**: Secure, user-specific data
- **Scalability**: Handles large datasets efficiently
- **Offline Support**: Works offline with sync when online
- **Backup & Recovery**: Automatic data backup

### **⚠️ Considerations:**
- **Internet Dependency**: Requires internet for initial sync
- **Authentication Required**: Users must be logged in
- **Firebase Costs**: Potential costs for high usage
- **Complexity**: More complex than local storage

## Troubleshooting

### **Common Issues:**

1. **"User must be authenticated" Error**
   - Ensure user is logged in before accessing entries
   - Check Firebase Auth state

2. **"Entry not found" Error**
   - Verify entry ID exists
   - Check user permissions

3. **"Function addDoc() called with invalid data. Unsupported field value: undefined" Error**
   - Data is automatically sanitized to remove undefined values
   - Check console logs for cleaned data structure
   - Ensure all required fields have valid values

4. **Timestamp Conversion Issues**
   - Use provided helper methods for timestamp conversion
   - Avoid manual timestamp manipulation

5. **Network Connectivity Issues**
   - Firestore works offline with local cache
   - Data syncs when connection is restored

## Support

For issues or questions about the Firestore migration:
1. Check Firebase Console for authentication status
2. Verify Firestore security rules
3. Check network connectivity
4. Review error logs in console 