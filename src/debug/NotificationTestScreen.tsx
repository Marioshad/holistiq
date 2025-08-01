import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Title, Button, List, Switch, TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationService from '../services/NotificationService';
import * as Notifications from 'expo-notifications';

const NotificationTestScreen: React.FC = () => {
  const [scheduledNotifications, setScheduledNotifications] = useState<Notifications.NotificationRequest[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<string>('Unknown');
  const [pushToken, setPushToken] = useState<string>('');
  const [testTitle, setTestTitle] = useState('Test Notification');
  const [testBody, setTestBody] = useState('This is a test notification');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotificationData();
  }, []);

  const loadNotificationData = async () => {
    try {
      // Get scheduled notifications
      const notifications = await NotificationService.getScheduledNotifications();
      setScheduledNotifications(notifications);

      // Get permission status
      const permissions = await NotificationService.getPermissionsStatus();
      setPermissionStatus('Granted'); // Simplified for now

      // Get push token
      const token = NotificationService.getPushToken();
      setPushToken(token || 'No token available');
    } catch (error) {
      console.error('Error loading notification data:', error);
    }
  };

  const requestPermissions = async () => {
    setLoading(true);
    try {
      await NotificationService.requestPermissions();
      setPermissionStatus('Granted');
      Alert.alert('Success', 'Permission granted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to request permissions');
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setLoading(true);
    try {
      const notificationId = await NotificationService.sendImmediateNotification(
        testTitle,
        testBody,
        { type: 'test', timestamp: new Date().toISOString() }
      );
      
      if (notificationId) {
        Alert.alert('Success', `Test notification sent! ID: ${notificationId}`);
        loadNotificationData(); // Refresh the list
      } else {
        Alert.alert('Error', 'Failed to send test notification');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to send test notification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const scheduleTestNotification = async () => {
    setLoading(true);
    try {
      // Schedule notification for 5 seconds from now
      const futureDate = new Date();
      futureDate.setSeconds(futureDate.getSeconds() + 5);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: testTitle,
          body: testBody,
          data: { type: 'scheduled_test', timestamp: new Date().toISOString() },
          sound: 'default',
        },
        trigger: {
          date: futureDate,
        },
      });

      Alert.alert('Success', `Test notification scheduled for 5 seconds from now! ID: ${notificationId}`);
      loadNotificationData(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', `Failed to schedule test notification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testReminderNotification = async () => {
    setLoading(true);
    try {
      const result = await NotificationService.testReminderNotification();
      
      if (result.mainId && result.reminderId) {
        Alert.alert(
          'Success', 
          `Reminder notification test scheduled!\n\nMain notification ID: ${result.mainId}\nReminder notification ID: ${result.reminderId}\n\nYou'll receive a reminder in 15 minutes, then the main notification 2 minutes later.`
        );
        loadNotificationData(); // Refresh the list
      } else {
        Alert.alert('Error', 'Failed to schedule reminder notification test');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to test reminder notification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelAllNotifications = async () => {
    setLoading(true);
    try {
      await NotificationService.cancelAllNotifications();
      Alert.alert('Success', 'All notifications cancelled');
      loadNotificationData(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel notifications');
    } finally {
      setLoading(false);
    }
  };

  const cancelNotification = async (notificationId: string) => {
    try {
      await NotificationService.cancelNotification(notificationId);
      Alert.alert('Success', 'Notification cancelled');
      loadNotificationData(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel notification');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notification Test Screen</Text>

      {/* Status Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Notification Status</Title>
          
          <List.Item
            title="Permission Status"
            description={permissionStatus}
            left={props => <List.Icon {...props} icon="shield-check" />}
          />

          <List.Item
            title="Push Token"
            description={pushToken.substring(0, 50) + '...'}
            left={props => <List.Icon {...props} icon="key" />}
          />

          <List.Item
            title="Scheduled Notifications"
            description={`${scheduledNotifications.length} notifications`}
            left={props => <List.Icon {...props} icon="schedule" />}
          />
        </Card.Content>
      </Card>

      {/* Actions Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Actions</Title>
          
          <Button
            mode="contained"
            onPress={requestPermissions}
            loading={loading}
            style={styles.button}
            icon="shield-check"
          >
            Request Permissions
          </Button>

          <Button
            mode="contained"
            onPress={loadNotificationData}
            style={styles.button}
            icon="refresh"
          >
            Refresh Data
          </Button>

          <Button
            mode="contained"
            onPress={cancelAllNotifications}
            loading={loading}
            style={styles.button}
            icon="delete-sweep"
            buttonColor="#FF6B6B"
          >
            Cancel All Notifications
          </Button>
        </Card.Content>
      </Card>

      {/* Test Notification Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Test Notifications</Title>
          
          <TextInput
            label="Notification Title"
            value={testTitle}
            onChangeText={setTestTitle}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Notification Body"
            value={testBody}
            onChangeText={setTestBody}
            mode="outlined"
            style={styles.input}
            multiline
          />

          <Button
            mode="contained"
            onPress={sendTestNotification}
            loading={loading}
            style={styles.button}
            icon="send"
          >
            Send Immediate Notification
          </Button>

          <Button
            mode="contained"
            onPress={scheduleTestNotification}
            loading={loading}
            style={styles.button}
            icon="schedule"
          >
            Schedule Test Notification (5s)
          </Button>

          <Button
            mode="contained"
            onPress={testReminderNotification}
            loading={loading}
            style={styles.button}
            icon="alarm"
            buttonColor="#4CAF50"
          >
            Test Reminder Notification (2min + 15min reminder)
          </Button>
        </Card.Content>
      </Card>

      {/* Scheduled Notifications List */}
      {scheduledNotifications.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Scheduled Notifications</Title>
            
            {scheduledNotifications.map((notification, index) => {
              const data = notification.content.data as any;
              const isReminder = data?.type === 'reminder_activity';
              const isMain = data?.type === 'scheduled_activity';
              
              return (
                <List.Item
                  key={notification.identifier}
                  title={notification.content.title}
                  description={`${notification.content.body}\nType: ${isReminder ? 'Reminder' : isMain ? 'Main' : 'Other'}`}
                  left={props => (
                    <List.Icon 
                      {...props} 
                      icon={isReminder ? "alarm" : "schedule"} 
                      color={isReminder ? "#4CAF50" : "#2563EB"}
                    />
                  )}
                  right={() => (
                    <TouchableOpacity
                      onPress={() => cancelNotification(notification.identifier)}
                      style={styles.cancelButton}
                    >
                      <MaterialIcons name="close" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                  )}
                  style={styles.notificationItem}
                />
              );
            })}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1F2937',
  },
  card: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    marginVertical: 8,
  },
  input: {
    marginVertical: 8,
  },
  notificationItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cancelButton: {
    padding: 8,
  },
});

export default NotificationTestScreen; 