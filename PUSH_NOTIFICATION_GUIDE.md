# Push Notification Implementation Guide

## 🔔 **Overview**

Your app now has a comprehensive push notification system that automatically sends notifications when scheduled record times are met. The system integrates seamlessly with your existing Firestore-based scheduling system.

## 📦 **Required Dependencies**

Install these packages to enable push notifications:

```bash
npm install expo-notifications expo-device expo-constants
```

## 🏗️ **Architecture**

### **Components Created:**

1. **NotificationService** - Core notification management
2. **ScheduleService Integration** - Automatic notification scheduling
3. **Settings Integration** - User notification preferences
4. **Debug Tools** - Testing and troubleshooting

### **Key Features:**

- ✅ **Automatic Scheduling** - Notifications created when activities are scheduled
- ✅ **Recurring Notifications** - Support for multi-day schedules
- ✅ **Smart Cancellation** - Notifications removed when activities are deleted
- ✅ **Permission Management** - User-friendly permission requests
- ✅ **Debug Tools** - Comprehensive testing interface

## 🔧 **How It Works**

### **1. Activity Scheduling Flow:**
```
User schedules activity → ScheduleService creates activity → 
NotificationService schedules notification → Notification sent at scheduled time
```

### **2. Notification Types:**
- **Single Activity**: One notification at specified time
- **Recurring Activity**: Multiple notifications for date ranges
- **Test Notifications**: Immediate and scheduled test notifications

### **3. Notification Content:**
```typescript
{
  title: "Time for: [Entry Title]",
  body: "[Activity Note] or default message",
  data: {
    type: "scheduled_activity",
    activityId: "activity-id",
    entryId: "entry-id",
    entryTitle: "Entry Title"
  }
}
```

## 🚀 **Usage**

### **Automatic Notifications (No Code Required)**

When users schedule activities through your app:
1. **Single Day**: Notification scheduled for the specified time
2. **Multiple Days**: Notifications scheduled for each day in the range
3. **Time Required**: Only activities with time specified get notifications

### **Manual Testing**

Use the **Notification Test Screen** (Drawer → Notification Test):
- Send immediate test notifications
- Schedule test notifications
- View all scheduled notifications
- Cancel notifications
- Check permission status

### **Settings Management**

Users can manage notifications in **Settings**:
- Enable/disable push notifications
- Request permissions
- View notification status

## 📱 **User Experience**

### **Notification Behavior:**
- **Sound**: Default notification sound
- **Vibration**: Android vibration pattern
- **Priority**: High priority for scheduled activities
- **Channel**: Dedicated "Scheduled Activities" channel (Android)

### **Permission Flow:**
1. User enables notifications in Settings
2. System permission dialog appears
3. User grants permission
4. Notifications become active

### **Notification Actions:**
- **Tap**: Opens app (can be customized for navigation)
- **Swipe**: Dismisses notification
- **Auto-dismiss**: After user interaction

## 🔧 **Technical Implementation**

### **NotificationService Methods:**

```typescript
// Core functionality
await NotificationService.initialize();
await NotificationService.scheduleActivityNotification(activity, entryTitle);
await NotificationService.scheduleRecurringActivityNotifications(activity, entryTitle, endDate);

// Management
await NotificationService.cancelNotification(notificationId);
await NotificationService.cancelActivityNotifications(activityId);
await NotificationService.cancelAllNotifications();

// Testing
await NotificationService.sendImmediateNotification(title, body, data);
await NotificationService.getScheduledNotifications();
```

### **ScheduleService Integration:**

```typescript
// Automatic notification scheduling when creating activities
const scheduledActivity = await ScheduleService.scheduleActivity(userId, entryId, startDate, endDate, time, note);

// Automatic notification cancellation when deleting activities
await ScheduleService.deleteScheduledActivity(userId, activityId);
```

### **Firestore Document Structure:**

```typescript
// Scheduled activities with notification support
{
  entryId: string,
  startDate: string, // YYYY-MM-DD
  endDate?: string,  // YYYY-MM-DD (for recurring)
  time?: string,     // HH:MM (required for notifications)
  completed: boolean,
  note?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🧪 **Testing**

### **1. Permission Testing:**
```typescript
// Check if notifications are enabled
const permissions = await NotificationService.getPermissionsStatus();
console.log('Notifications enabled:', permissions.granted);
```

### **2. Immediate Notification Test:**
```typescript
// Send test notification immediately
await NotificationService.sendImmediateNotification(
  'Test Title',
  'Test message',
  { type: 'test' }
);
```

### **3. Scheduled Notification Test:**
```typescript
// Schedule notification for 5 seconds from now
const futureDate = new Date();
futureDate.setSeconds(futureDate.getSeconds() + 5);

await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Scheduled Test',
    body: 'This was scheduled 5 seconds ago',
    data: { type: 'test' }
  },
  trigger: { date: futureDate }
});
```

### **4. Activity Integration Test:**
```typescript
// Create a scheduled activity (will auto-schedule notification)
const activity = await ScheduleService.scheduleActivity(
  userId,
  entryId,
  '2024-01-01',
  '2024-01-01',
  '09:00',
  'Test activity'
);
```

## 🔍 **Debugging**

### **Common Issues:**

1. **Notifications Not Appearing:**
   - Check device notification settings
   - Verify app permissions
   - Test with immediate notifications

2. **Scheduled Notifications Not Working:**
   - Check if time is specified in activity
   - Verify scheduled time hasn't passed
   - Test with future dates

3. **Permission Issues:**
   - Request permissions manually
   - Check device settings
   - Restart app after permission grant

### **Debug Tools:**

1. **Notification Test Screen**: Comprehensive testing interface
2. **Console Logs**: Detailed logging for all operations
3. **Firebase Debug Screen**: Check data integrity

### **Log Messages to Look For:**

```typescript
// Successful scheduling
"Scheduled notification for activity [id] at [time]"

// Permission issues
"Notification permissions not granted"

// Time issues
"Scheduled time has already passed, skipping notification"

// Data issues
"No time specified for activity, skipping notification"
```

## 📋 **Configuration**

### **Android Configuration:**

The service automatically creates notification channels:
- **Scheduled Activities**: High priority, vibration, sound
- **General**: Default priority, sound only

### **iOS Configuration:**

No additional configuration required - uses system defaults.

### **Expo Configuration:**

Add to `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

## 🔄 **Lifecycle Management**

### **App Startup:**
```typescript
// Initialize when user is authenticated
if (user) {
  await NotificationService.initialize();
}
```

### **App Background:**
- Notifications continue to work
- Scheduled notifications fire as expected
- No additional configuration needed

### **App Foreground:**
- Notifications appear as alerts
- User can interact with notifications
- Background processing continues

### **Cleanup:**
```typescript
// Clean up listeners on app unmount
NotificationService.cleanup();
```

## 🎯 **Best Practices**

### **1. User Experience:**
- Request permissions at appropriate times
- Provide clear permission explanations
- Allow users to disable notifications
- Use meaningful notification content

### **2. Performance:**
- Don't schedule too many notifications
- Clean up old notifications
- Use appropriate notification priorities
- Handle permission denials gracefully

### **3. Testing:**
- Test on physical devices
- Test with different time zones
- Test permission flows
- Test notification interactions

## 🚀 **Next Steps**

### **Immediate:**
1. Install required dependencies
2. Test with Notification Test Screen
3. Schedule some activities with times
4. Verify notifications appear

### **Future Enhancements:**
- Custom notification sounds
- Rich notifications with images
- Action buttons on notifications
- Notification history
- Smart notification timing
- Do Not Disturb integration

## 📞 **Support**

For issues or questions:
1. Check the Notification Test Screen
2. Review console logs
3. Verify device settings
4. Test with immediate notifications
5. Check permission status

The notification system is designed to be robust and user-friendly, providing timely reminders for scheduled activities while respecting user preferences and device capabilities. 