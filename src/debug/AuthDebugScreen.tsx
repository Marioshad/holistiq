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
    } else {
      setAuthStatus('❌ Not authenticated');
      setUserId('');
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

      const userEntries = await EntryService.getAllEntries(user.uid);
      setEntries(userEntries);
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

      const activities = await ScheduleService.getAllScheduledActivities(user.uid);
      setScheduledActivities(activities);
    } catch (error) {
      console.error('Error loading scheduled activities:', error);
      Alert.alert('Error', `Failed to load scheduled activities: ${error.message}`);
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