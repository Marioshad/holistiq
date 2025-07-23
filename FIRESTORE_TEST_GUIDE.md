# Firestore Integration Testing Guide

## 🧪 **Testing Checklist**

### **1. Authentication Testing**
- [ ] User can log in successfully
- [ ] User ID is properly retrieved (`auth.currentUser?.uid`)
- [ ] Unauthenticated users get appropriate error messages
- [ ] Email verification status is checked

### **2. Entry Creation Testing**
- [ ] Create entries in each category:
  - [ ] Nutrition entry
  - [ ] Supplement entry
  - [ ] Vitamin entry
  - [ ] Fitness entry
  - [ ] Wellness entry
  - [ ] Health entry
  - [ ] Medicine entry
- [ ] Verify entries appear in Firebase Console
- [ ] Check timestamps are properly set
- [ ] Verify user-specific data isolation

### **3. Entry Retrieval Testing**
- [ ] Load entries by category
- [ ] Load all entries
- [ ] Search entries by title/description
- [ ] Get entry by ID
- [ ] Verify data is properly formatted

### **4. Entry Update Testing**
- [ ] Update entry title
- [ ] Update entry description
- [ ] Update category-specific fields
- [ ] Verify `updatedAt` timestamp changes
- [ ] Check changes persist after app restart

### **5. Entry Deletion Testing**
- [ ] Delete entries
- [ ] Verify entries are removed from Firebase
- [ ] Check entries don't reappear after refresh

### **6. Cross-Device Testing**
- [ ] Create entry on one device
- [ ] Verify entry appears on another device
- [ ] Update entry on one device
- [ ] Verify update appears on another device

### **7. Offline/Online Testing**
- [ ] Create entry while offline
- [ ] Verify entry syncs when online
- [ ] Update entry while offline
- [ ] Verify update syncs when online

## 🔍 **Manual Testing Steps**

### **Step 1: Authentication**
```typescript
// Check if user is authenticated
console.log('User ID:', auth.currentUser?.uid);
console.log('Email verified:', auth.currentUser?.emailVerified);
```

### **Step 2: Create Test Entry**
1. Open the app
2. Navigate to Entry Management
3. Select a category (e.g., "Supplements")
4. Click "Add Entry"
5. Fill in the form:
   - Title: "Test Vitamin D"
   - Type: "pill"
   - Dose: "1000 IU"
   - Description: "Test entry for Firestore"
6. Save the entry
7. Check Firebase Console → Firestore → users/{userId}/entries

### **Step 3: Verify Data Structure**
In Firebase Console, verify the document structure:
```json
{
  "title": "Test Vitamin D",
  "category": "supplements",
  "type": "pill",
  "dose": "1000 IU",
  "description": "Test entry for Firestore",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **Step 4: Test Retrieval**
1. Navigate to Entry List for the category
2. Verify the entry appears
3. Check search functionality
4. Verify entry details are correct

### **Step 5: Test Update**
1. Open the entry for editing
2. Change the title to "Updated Test Vitamin D"
3. Save the changes
4. Verify the update in Firebase Console
5. Check that `updatedAt` timestamp changed

### **Step 6: Test Deletion**
1. Delete the test entry
2. Verify it's removed from the list
3. Check Firebase Console to confirm deletion

## 🐛 **Common Issues & Solutions**

### **Issue: "User must be authenticated" Error**
**Cause:** User not logged in or Firebase Auth not initialized
**Solution:**
- Ensure user is logged in
- Check Firebase configuration
- Verify `auth.currentUser` exists

### **Issue: "Entry not found" Error**
**Cause:** Entry ID doesn't exist or wrong user ID
**Solution:**
- Verify entry exists in Firebase Console
- Check user ID matches entry owner
- Ensure proper error handling

### **Issue: Timestamp Conversion Errors**
**Cause:** Incorrect timestamp format
**Solution:**
- Use provided helper methods
- Don't manually manipulate timestamps
- Check Firestore timestamp format

### **Issue: Network Connectivity Errors**
**Cause:** No internet connection
**Solution:**
- Firestore works offline with local cache
- Data syncs when connection is restored
- Check network status

## 📊 **Performance Testing**

### **Load Testing**
- [ ] Test with 100+ entries
- [ ] Verify query performance
- [ ] Check memory usage
- [ ] Test pagination if needed

### **Concurrent Access**
- [ ] Multiple users accessing same app
- [ ] Verify data isolation
- [ ] Test concurrent updates

## 🔒 **Security Testing**

### **User Isolation**
- [ ] User A cannot access User B's entries
- [ ] Verify Firestore security rules
- [ ] Test unauthorized access attempts

### **Data Validation**
- [ ] Test with invalid data
- [ ] Verify proper error handling
- [ ] Check input sanitization

## 📱 **Device Testing**

### **Platform Testing**
- [ ] iOS device testing
- [ ] Android device testing
- [ ] Web browser testing
- [ ] Cross-platform consistency

### **Version Testing**
- [ ] Test on different React Native versions
- [ ] Test on different Firebase SDK versions
- [ ] Verify backward compatibility

## 🎯 **Success Criteria**

### **Functional Requirements**
- [ ] All CRUD operations work correctly
- [ ] Data persists across app restarts
- [ ] Real-time synchronization works
- [ ] User-specific data isolation
- [ ] Proper error handling

### **Performance Requirements**
- [ ] Entry creation < 2 seconds
- [ ] Entry retrieval < 1 second
- [ ] Smooth UI interactions
- [ ] Minimal memory usage

### **Security Requirements**
- [ ] Users can only access their own data
- [ ] Authentication required for all operations
- [ ] Proper error messages for unauthorized access

## 📝 **Test Results Template**

```
Test Date: _______________
Tester: _______________
App Version: _______________

✅ Authentication: PASS/FAIL
✅ Entry Creation: PASS/FAIL
✅ Entry Retrieval: PASS/FAIL
✅ Entry Update: PASS/FAIL
✅ Entry Deletion: PASS/FAIL
✅ Cross-Device Sync: PASS/FAIL
✅ Offline/Online: PASS/FAIL
✅ Performance: PASS/FAIL
✅ Security: PASS/FAIL

Issues Found:
1. _______________
2. _______________
3. _______________

Notes:
_______________
_______________
``` 