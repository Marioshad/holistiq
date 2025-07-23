# Firebase Data Not Appearing - Troubleshooting Guide

## 🔍 **Quick Diagnostic Steps**

### 1. **Check Authentication Status**
- Open the app and go to **Drawer Menu → Firebase Debug**
- Check if you see "✅ Authenticated" with your email
- If you see "❌ Not authenticated", you need to log in first

### 2. **Test Firestore Connection**
- In the Firebase Debug screen, tap "Test Firestore Connection"
- This will create a test document to verify connectivity
- Check the console logs for any errors

### 3. **Check Firebase Console**
- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project
- Go to **Firestore Database**
- Look for collections: `users/{userId}/entries` and `users/{userId}/scheduledActivities`

## 🚨 **Common Issues & Solutions**

### **Issue 1: User Not Authenticated**
**Symptoms:**
- Firebase Debug shows "❌ Not authenticated"
- No data appears in Firebase Console

**Solution:**
1. Log out and log back in
2. Check if email verification is required
3. Verify Firebase Auth is properly configured

### **Issue 2: Firestore Rules Blocking Access**
**Symptoms:**
- User is authenticated but data doesn't appear
- Console shows permission errors

**Solution:**
Update Firestore security rules in Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId}/scheduledActivities/{activityId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### **Issue 3: Network Connectivity**
**Symptoms:**
- App works offline but data doesn't sync
- Console shows network errors

**Solution:**
1. Check internet connection
2. Firestore works offline with local cache
3. Data will sync when connection is restored

### **Issue 4: Firebase Configuration**
**Symptoms:**
- App crashes on startup
- Firebase services not initialized

**Solution:**
1. Check `firebase.ts` configuration
2. Verify API keys and project settings
3. Ensure Firebase project is properly set up

## 🧪 **Testing Steps**

### **Step 1: Create Test Data**
1. Open Firebase Debug screen
2. Tap "Create Test Entry"
3. Tap "Create Test Scheduled Activity"
4. Check if data appears in Firebase Console

### **Step 2: Verify Data Retrieval**
1. Tap "Load Entries" and "Load Scheduled Activities"
2. Check if data appears in the debug screen
3. Verify counts match expected values

### **Step 3: Check Console Logs**
1. Open browser developer tools or React Native debugger
2. Look for Firebase-related logs
3. Check for any error messages

## 📊 **Debug Information**

### **What to Check in Firebase Console:**

1. **Authentication:**
   - Go to Authentication → Users
   - Verify your user account exists
   - Check if email is verified

2. **Firestore Database:**
   - Go to Firestore Database
   - Look for `users` collection
   - Check for your user ID as a document
   - Look for `entries` and `scheduledActivities` subcollections

3. **Project Settings:**
   - Go to Project Settings
   - Verify Firebase configuration
   - Check if Firestore is enabled

### **Console Logs to Look For:**

**Successful Operations:**
```
Getting all entries for userId: [user-id]
Found X entries
Converted X entries
```

**Error Messages:**
```
Error getting entries: FirebaseError: Missing or insufficient permissions
Error adding entry: FirebaseError: Function addDoc() called with invalid data
```

## 🔧 **Manual Testing**

### **Test Entry Creation:**
```typescript
// In Firebase Debug screen, this should work:
const testEntry = await EntryService.addEntry(userId, {
  title: 'Test Entry',
  category: 'supplements',
  description: 'Test entry',
  color: '#FF6B6B'
});
```

### **Test Scheduled Activity Creation:**
```typescript
// In Firebase Debug screen, this should work:
const testActivity = await ScheduleService.scheduleActivity(
  userId,
  entryId,
  '2024-01-01',
  '2024-01-01',
  '09:00',
  'Test activity'
);
```

## 📱 **App-Specific Debugging**

### **Using the Debug Screen:**
1. Open the app
2. Go to Drawer Menu → Firebase Debug
3. Use the buttons to test different operations
4. Check the results and console logs

### **Common Debug Actions:**
- **Refresh Auth Status**: Check if user is logged in
- **Test Firestore Connection**: Verify basic connectivity
- **Debug All Data**: Log all data to console
- **Create Test Data**: Add sample entries and activities
- **Load Data**: Retrieve and display existing data

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the console logs** for specific error messages
2. **Verify Firebase project setup** in Firebase Console
3. **Test with the debug screen** to isolate the issue
4. **Check network connectivity** and Firebase service status
5. **Verify authentication state** and user permissions

## 📞 **Support**

For additional help:
1. Check Firebase documentation
2. Review error messages in console
3. Test with the debug screen
4. Verify all configuration steps are complete 