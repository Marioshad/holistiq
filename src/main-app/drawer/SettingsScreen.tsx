import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, List, Switch, Button, TextInput, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import UserService from '../../services/UserService';
import NotificationService from '../../services/NotificationService';
import { UserProfile } from '../../types';

interface SettingsScreenProps {
  onLogout: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onLogout }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  
  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await UserService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const updatePreference = async (key: keyof UserProfile['preferences'], value: any) => {
    if (!user) return;

    try {
      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          [key]: value,
        },
      };

      const success = await UserService.updateUserProfile(updatedUser);
      if (success) {
        setUser(updatedUser);
      } else {
        Alert.alert('Error', 'Failed to update preferences');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences');
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !currentPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    const passwordValidation = UserService.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      Alert.alert('Error', passwordValidation.message);
      return;
    }

    setLoading(true);
    try {
      const result = await UserService.changePassword(currentPassword, newPassword);
      if (result.success) {
        Alert.alert('Success', result.message);
        setShowPasswordChange(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const success = await UserService.logout();
            if (success) {
              onLogout();
            } else {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await UserService.deleteAccount();
            if (success) {
              Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
              onLogout();
            } else {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Profile</Title>
            <List.Item
              title={user.name}
              description={user.email}
              left={props => <List.Icon {...props} icon="account" />}
            />
            <List.Item
              title="Member since"
              description={new Date(user.createdAt).toLocaleDateString()}
              left={props => <List.Icon {...props} icon="calendar" />}
            />
          </Card.Content>
        </Card>

        {/* Preferences Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Preferences</Title>
            
            <List.Item
              title="Notifications"
              description="Receive habit reminders"
              left={props => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={user.preferences.notifications}
                  onValueChange={(value) => updatePreference('notifications', value)}
                />
              )}
            />

            <List.Item
              title="Theme"
              description={user.preferences.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              left={props => <List.Icon {...props} icon="palette" />}
              right={() => (
                <Switch
                  value={user.preferences.theme === 'dark'}
                  onValueChange={(value) => updatePreference('theme', value ? 'dark' : 'light')}
                />
              )}
            />

            <List.Item
              title="Reminder Time"
              description={user.preferences.reminderTime}
              left={props => <List.Icon {...props} icon="clock" />}
              onPress={() => Alert.alert('Coming Soon', 'Time picker will be available in the next update')}
            />

            <List.Item
              title="Push Notifications"
              description="Get notified about scheduled activities"
              left={props => <List.Icon {...props} icon="notifications" />}
              right={() => (
                <Switch
                  value={notificationEnabled}
                  onValueChange={async (value) => {
                    if (value) {
                      try {
                        const status = await NotificationService.requestPermissions();
                        setNotificationEnabled(true);
                        Alert.alert('Success', 'Notifications enabled!');
                      } catch (error) {
                        Alert.alert('Error', 'Failed to request notification permissions');
                      }
                    } else {
                      setNotificationEnabled(false);
                      Alert.alert('Info', 'Notifications disabled. You can re-enable them anytime.');
                    }
                  }}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Security Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Security</Title>
            
            <List.Item
              title="Change Password"
              description="Update your account password"
              left={props => <List.Icon {...props} icon="lock" />}
              onPress={() => setShowPasswordChange(!showPasswordChange)}
            />

            {showPasswordChange && (
              <View style={styles.passwordChangeContainer}>
                <TextInput
                  label="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Confirm New Password"
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  secureTextEntry
                  mode="outlined"
                  style={styles.input}
                />
                <View style={styles.passwordButtonContainer}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setShowPasswordChange(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}
                    style={styles.passwordButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handlePasswordChange}
                    loading={loading}
                    style={styles.passwordButton}
                  >
                    Update
                  </Button>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Data Management Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Data Management</Title>
            
            <List.Item
              title="Export Data"
              description="Export your habit data"
              left={props => <List.Icon {...props} icon="download" />}
              onPress={() => Alert.alert('Coming Soon', 'Data export will be available in the next update')}
            />

            <List.Item
              title="Clear All Data"
              description="Reset all your habit data"
              left={props => <List.Icon {...props} icon="delete-sweep" />}
              onPress={() => Alert.alert('Coming Soon', 'Data clearing will be available in the next update')}
            />
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Account Actions</Title>
            
            <Button
              mode="outlined"
              onPress={handleLogout}
              style={styles.actionButton}
              icon="logout"
            >
              Logout
            </Button>

            <Button
              mode="outlined"
              onPress={handleDeleteAccount}
              style={[styles.actionButton, styles.deleteButton]}
              buttonColor="#FF6B6B"
              textColor="#fff"
              icon="delete"
            >
              Delete Account
            </Button>
          </Card.Content>
        </Card>

        {/* App Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>About</Title>
            <List.Item
              title="App Version"
              description="1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
            />
            <List.Item
              title="Support"
              description="Get help and support"
              left={props => <List.Icon {...props} icon="help" />}
              onPress={() => Alert.alert('Support', 'For support, please contact us at support@healthyhabits.app')}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 12,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  passwordChangeContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    marginBottom: 12,
  },
  passwordButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  passwordButton: {
    flex: 0.48,
  },
  actionButton: {
    marginTop: 12,
  },
  deleteButton: {
    marginTop: 8,
  },
});

export default SettingsScreen; 