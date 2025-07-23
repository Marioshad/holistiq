# ScheduleService Firestore Migration Guide

## Overview
The ScheduleService has been successfully migrated from AsyncStorage to Firestore, providing cloud-based data persistence for scheduled activities with real-time synchronization and user-specific data isolation.

## Key Changes

### 🔄 **Method Signature Updates**

#### **Before (AsyncStorage):**
```typescript
// Get activities
async getAllScheduledActivities(): Promise<ScheduledActivity[]>
async getActivitiesForDate(date: string): Promise<ScheduledActivity[]>
async getActivitiesForDateRange(startDate: string, endDate: string): Promise<ScheduledActivity[]>

// Schedule/Update/Delete
async scheduleActivity(entryId: string, startDate: string, endDate?: string, time?: string, note?: string): Promise<ScheduledActivity>
async updateScheduledActivity(activityId: string, updates: Partial<ScheduledActivity>): Promise<ScheduledActivity | null>
async deleteScheduledActivity(activityId: string): Promise<boolean>
async completeActivity(activityId: string): Promise<ScheduledActivity | null>
async uncompleteActivity(activityId: string): Promise<ScheduledActivity | null>
```

#### **After (Firestore):**
```typescript
// Get activities (with optional userId parameter)
async getAllScheduledActivities(userId?: string): Promise<ScheduledActivity[]>
async getActivitiesForDate(date: string, userId?: string): Promise<ScheduledActivity[]>
async getActivitiesForDateRange(startDate: string, endDate: string, userId?: string): Promise<ScheduledActivity[]>

// Schedule/Update/Delete (with required userId)
async scheduleActivity(userId: string, entryId: string, startDate: string, endDate?: string, time?: string, note?: string): Promise<ScheduledActivity>
async updateScheduledActivity(userId: string, activityId: string, updates: Partial<Omit<ScheduledActivity, 'id' | 'createdAt'>>): Promise<ScheduledActivity | null>
async deleteScheduledActivity(userId: string, activityId: string): Promise<boolean>
async completeActivity(userId: string, activityId: string): Promise<ScheduledActivity | null>
async uncompleteActivity(userId: string, activityId: string): Promise<ScheduledActivity | null>

// Legacy method for backward compatibility
async scheduleActivityLegacy(entryId: string, startDate: string, endDate?: string, time?: string, note?: string): Promise<ScheduledActivity>
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
- Debug logging for data structure validation

## Usage Examples

### **Basic Usage (Recommended)**
```typescript
import ScheduleService from '../services/ScheduleService';
import { auth } from '../../firebase';

// Get current user's scheduled activities
const activities = await ScheduleService.getAllScheduledActivities();

// Get activities for a specific date
const todayActivities = await ScheduleService.getActivitiesForDate('2024-01-01');

// Schedule a new activity
const newActivity = await ScheduleService.scheduleActivity(
  auth.currentUser?.uid || '',
  'entry-id-123',
  '2024-01-01',
  '2024-01-03',
  '09:00',
  'Take vitamin D'
);

// Complete an activity
const userId = auth.currentUser?.uid;
if (userId) {
  await ScheduleService.completeActivity(userId, activityId);
}

// Delete an activity
if (userId) {
  await ScheduleService.deleteScheduledActivity(userId, activityId);
}
```

### **Advanced Usage (Explicit User ID)**
```typescript
// For admin operations or cross-user data access
const userId = 'specific-user-id';

// Get activities for specific user
const userActivities = await ScheduleService.getAllScheduledActivities(userId);

// Schedule activity for specific user
await ScheduleService.scheduleActivity(
  userId,
  'entry-id-123',
  '2024-01-01',
  '2024-01-03',
  '09:00',
  'Take vitamin D'
);
```

### **Error Handling**
```typescript
try {
  const activities = await ScheduleService.getAllScheduledActivities();
  // Handle success
} catch (error) {
  if (error.message === 'User must be authenticated to access scheduled activities') {
    // Handle authentication error
    console.log('User not authenticated');
  } else {
    // Handle other errors
    console.error('Error accessing scheduled activities:', error);
  }
}
```

## Firestore Document Structure

### **Collection Path:**
```
users/{userId}/scheduledActivities/{activityId}
```

### **Document Fields:**
```typescript
{
  entryId: string,           // References the original Entry by ID
  startDate: string,         // YYYY-MM-DD format
  endDate?: string,          // YYYY-MM-DD format (optional, for range scheduling)
  time?: string,             // Optional time in HH:MM format
  completed: boolean,        // Whether the activity is completed
  completedAt?: Timestamp,   // When the activity was completed
  note?: string,             // Optional note about the activity
  createdAt: Timestamp,      // When the activity was created
  updatedAt: Timestamp,      // When the activity was last updated
}
```

## Security Rules (Firestore Console)

### **Recommended Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own scheduled activities
    match /users/{userId}/scheduledActivities/{activityId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
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
- [x] Updated ScheduleService to use Firestore
- [x] Added authentication integration
- [x] Implemented proper timestamp handling
- [x] Added user-specific data isolation
- [x] Updated method signatures with userId parameters
- [x] Added backward compatibility for scheduleActivity method
- [x] Added data sanitization
- [x] Updated DailyScreen to use new methods
- [x] Updated ScheduleRecordBottomSheet to use new methods

### 🔄 **Pending Updates:**
- [x] All components updated successfully

### 🧪 **Testing Required:**
- [ ] Test activity scheduling with authentication
- [ ] Test activity updates with authentication
- [ ] Test activity deletion with authentication
- [ ] Test data persistence across app restarts
- [ ] Test offline/online synchronization
- [ ] Test user-specific data isolation
- [ ] Test date range queries
- [ ] Test activity completion/uncompletion

## Benefits of Firestore Migration

### **✅ Advantages:**
- **Cloud Storage**: Scheduled activities persist across devices
- **Real-time Sync**: Automatic synchronization of schedule changes
- **User Isolation**: Secure, user-specific scheduled activities
- **Scalability**: Handles large numbers of scheduled activities efficiently
- **Offline Support**: Works offline with sync when online
- **Backup & Recovery**: Automatic data backup
- **Cross-Device Scheduling**: Schedule on one device, see on all devices

### **⚠️ Considerations:**
- **Internet Dependency**: Requires internet for initial sync
- **Authentication Required**: Users must be logged in
- **Firebase Costs**: Potential costs for high usage
- **Complexity**: More complex than local storage

## Troubleshooting

### **Common Issues:**

1. **"User must be authenticated" Error**
   - Ensure user is logged in before accessing scheduled activities
   - Check Firebase Auth state

2. **"Scheduled activity not found" Error**
   - Verify activity ID exists
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

## Debug Methods

### **Debug All Scheduled Activities:**
```typescript
// Add this to any component temporarily to debug
import ScheduleService from '../services/ScheduleService';

// In a useEffect or button press
ScheduleService.debugGetAllScheduledActivities();
```

### **Console Logs:**
The service now includes comprehensive logging:
- Document conversion logs
- Query result counts
- Data sanitization logs
- Error details with original data

## Support

For issues or questions about the ScheduleService Firestore migration:
1. Check Firebase Console for authentication status
2. Verify Firestore security rules
3. Check network connectivity
4. Review error logs in console
5. Use debug methods to inspect data 