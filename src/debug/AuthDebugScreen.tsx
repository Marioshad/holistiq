import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { auth, db } from '../../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import EntryService from '../services/EntryService';
import ScheduleService from '../services/ScheduleService';

const AuthDebugScreen: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [userId, setUserId] = useState<string>('');
  const [entries, setEntries] = useState<any[]>([]);
  const [scheduledActivities, setScheduledActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const user = auth.currentUser;
    if (user) {
      setAuthStatus(`✅ Authenticated: ${user.email}`);
      setUserId(user.uid);
      console.log('Current user:', user);
    } else {
      setAuthStatus('❌ Not authenticated');
      setUserId('');
      console.log('No authenticated user');
    }
  };

  const testFirestoreConnection = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Test basic Firestore connection
      const testCollection = collection(db, 'users', user.uid, 'test');
      const testDoc = await addDoc(testCollection, {
        message: 'Test connection',
        timestamp: serverTimestamp(),
      });

      Alert.alert('Success', `Test document created with ID: ${testDoc.id}`);
      console.log('Test document created:', testDoc.id);
    } catch (error) {
      console.error('Firestore test error:', error);
      Alert.alert('Error', `Firestore test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      console.log('Loading entries for user:', user.uid);
      const userEntries = await EntryService.getAllEntries(user.uid);
      setEntries(userEntries);
      console.log('Loaded entries:', userEntries.length);
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', `Failed to load entries: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadScheduledActivities = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      console.log('Loading scheduled activities for user:', user.uid);
      const activities = await ScheduleService.getAllScheduledActivities(user.uid);
      setScheduledActivities(activities);
      console.log('Loaded scheduled activities:', activities.length);
    } catch (error) {
      console.error('Error loading scheduled activities:', error);
      Alert.alert('Error', `Failed to load scheduled activities: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const debugAllData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      console.log('=== DEBUGGING ALL DATA ===');
      console.log('User ID:', user.uid);
      console.log('User Email:', user.email);

      // Debug entries
      await EntryService.debugGetAllEntries(user.uid);

      // Debug scheduled activities
      await ScheduleService.debugGetAllScheduledActivities(user.uid);

      Alert.alert('Success', 'Debug data logged to console');
    } catch (error) {
      console.error('Debug error:', error);
      Alert.alert('Error', `Debug failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestEntry = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const testEntry = {
        title: 'Test Entry',
        category: 'supplements' as const,
        description: 'Test entry for debugging',
        color: '#FF6B6B',
      };

      console.log('Creating test entry:', testEntry);
      const newEntry = await EntryService.addEntry(user.uid, testEntry);
      console.log('Test entry created:', newEntry);

      Alert.alert('Success', `Test entry created with ID: ${newEntry.id}`);
      loadEntries(); // Refresh the list
    } catch (error) {
      console.error('Error creating test entry:', error);
      Alert.alert('Error', `Failed to create test entry: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestScheduledActivity = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // First create a test entry
      const testEntry = {
        title: 'Test Entry for Schedule',
        category: 'supplements' as const,
        description: 'Test entry for scheduled activity',
        color: '#4ECDC4',
      };

      const newEntry = await EntryService.addEntry(user.uid, testEntry);
      console.log('Created test entry for schedule:', newEntry);

      // Then create a scheduled activity
      const testActivity = await ScheduleService.scheduleActivity(
        user.uid,
        newEntry.id,
        new Date().toISOString().split('T')[0], // Today
        new Date().toISOString().split('T')[0], // Today
        '09:00',
        'Test scheduled activity'
      );

      console.log('Test scheduled activity created:', testActivity);
      Alert.alert('Success', `Test scheduled activity created with ID: ${testActivity.id}`);
      loadScheduledActivities(); // Refresh the list
    } catch (error) {
      console.error('Error creating test scheduled activity:', error);
      Alert.alert('Error', `Failed to create test scheduled activity: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Debug Screen</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication Status</Text>
        <Text style={styles.statusText}>{authStatus}</Text>
        {userId && <Text style={styles.userIdText}>User ID: {userId}</Text>}
        
        <TouchableOpacity style={styles.button} onPress={checkAuthStatus}>
          <Text style={styles.buttonText}>Refresh Auth Status</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Firestore Connection Test</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={testFirestoreConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Test Firestore Connection'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Operations</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={debugAllData}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Debugging...' : 'Debug All Data (Console)'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Data Creation</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={createTestEntry}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Test Entry'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={createTestScheduledActivity}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Test Scheduled Activity'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Load Data</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={loadEntries}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : `Load Entries (${entries.length})`}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={loadScheduledActivities}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : `Load Scheduled Activities (${scheduledActivities.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {entries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entries ({entries.length})</Text>
          {entries.map((entry, index) => (
            <View key={entry.id || index} style={styles.dataItem}>
              <Text style={styles.dataTitle}>{entry.title}</Text>
              <Text style={styles.dataSubtitle}>Category: {entry.category}</Text>
              <Text style={styles.dataSubtitle}>ID: {entry.id}</Text>
            </View>
          ))}
        </View>
      )}

      {scheduledActivities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Activities ({scheduledActivities.length})</Text>
          {scheduledActivities.map((activity, index) => (
            <View key={activity.id || index} style={styles.dataItem}>
              <Text style={styles.dataTitle}>Entry ID: {activity.entryId}</Text>
              <Text style={styles.dataSubtitle}>Date: {activity.startDate}</Text>
              <Text style={styles.dataSubtitle}>Time: {activity.time || 'No time'}</Text>
              <Text style={styles.dataSubtitle}>Completed: {activity.completed ? 'Yes' : 'No'}</Text>
            </View>
          ))}
        </View>
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
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
  },
  userIdText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  dataItem: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dataSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default AuthDebugScreen; 