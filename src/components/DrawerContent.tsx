import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  DrawerContentScrollView, 
  DrawerContentComponentProps,
  DrawerItem
} from '@react-navigation/drawer';
import { 
  Avatar, 
  Title, 
  Caption, 
  Paragraph, 
  Drawer, 
  Text, 
  TouchableRipple,
  Switch,
  Divider
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import UserService from '../services/UserService';
import { UserProfile } from '../types';

interface DrawerContentProps extends DrawerContentComponentProps {
  onLogout: () => void;
}

const DrawerContent: React.FC<DrawerContentProps> = ({ navigation, onLogout, ...props }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await UserService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLogout = async () => {
    const success = await UserService.logout();
    if (success) {
      onLogout();
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.drawerContent}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          {/* User Info Section */}
          <View style={styles.userInfoSection}>
            <View style={styles.userInfo}>
              <Avatar.Text 
                size={60} 
                label={user ? getInitials(user.name) : 'U'} 
                style={styles.avatar}
              />
              <View style={styles.userDetails}>
                <Title style={styles.title}>{user?.name || 'User'}</Title>
                <Caption style={styles.caption}>{user?.email || 'user@example.com'}</Caption>
              </View>
            </View>
          </View>

          <Divider />

          {/* Navigation Items */}
          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              icon={({ color, size }) => (
                <MaterialIcons name="home" color={color} size={size} />
              )}
              label="Home"
              onPress={() => navigation.navigate('Home')}
              focused={props.state.index === 0}
            />
            
            <DrawerItem
              icon={({ color, size }) => (
                <MaterialIcons name="settings" color={color} size={size} />
              )}
              label="Settings"
              onPress={() => navigation.navigate('Settings')}
              focused={props.state.index === 1}
            />

            <DrawerItem
              icon={({ color, size }) => (
                <MaterialIcons name="person" color={color} size={size} />
              )}
              label="Profile"
              onPress={() => navigation.navigate('Profile')}
              focused={props.state.index === 2}
            />

            <DrawerItem
              icon={({ color, size }) => (
                <MaterialIcons name="info" color={color} size={size} />
              )}
              label="About"
              onPress={() => navigation.navigate('About')}
              focused={props.state.index === 3}
            />

            <DrawerItem
              icon={({ color, size }) => (
                <MaterialIcons name="storage" color={color} size={size} />
              )}
              label="Entry Management"
              onPress={() => navigation.navigate('EntryManagement')}
              focused={props.state.index === 4}
            />
          </Drawer.Section>

          <Divider />

          {/* Development Section */}
          <Drawer.Section title="Development" style={styles.developmentSection}>
            <DrawerItem
              icon={({ color, size }) => (
                <MaterialIcons name="build" color={color} size={size} />
              )}
              label="Form Components"
              onPress={() => navigation.navigate('FormComponents')}
              focused={props.state.index === 5}
            />

            <DrawerItem
              icon={({ color, size }) => (
                <MaterialIcons name="palette" color={color} size={size} />
              )}
              label="Style Guide"
              onPress={() => navigation.navigate('StyleGuide')}
              focused={props.state.index === 6}
            />

            <DrawerItem
              icon={({ color, size }) => (
                <MaterialIcons name="bug-report" color={color} size={size} />
              )}
              label="Firebase Debug"
              onPress={() => navigation.navigate('AuthDebug')}
              focused={props.state.index === 7}
            />
          </Drawer.Section>

          <Divider />

          {/* Quick Actions */}
          <Drawer.Section title="Quick Actions">
            <DrawerItem
              icon={({ color, size }) => (
                <MaterialIcons name="backup" color={color} size={size} />
              )}
              label="Backup Data"
              onPress={() => {
                // Handle backup
                console.log('Backup pressed');
              }}
            />

            <DrawerItem
              icon={({ color, size }) => (
                <MaterialIcons name="help" color={color} size={size} />
              )}
              label="Help & Support"
              onPress={() => {
                // Handle help
                console.log('Help pressed');
              }}
            />
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomDrawerSection}>
        <Divider />
        <DrawerItem
          icon={({ color, size }) => (
            <MaterialIcons name="logout" color={color} size={size} />
          )}
          label="Logout"
          onPress={handleLogout}
          labelStyle={styles.logoutLabel}
        />
        
        <View style={styles.appVersion}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#6200EE',
  },
  userDetails: {
    marginLeft: 15,
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    color: '#666',
  },
  drawerSection: {
    marginTop: 15,
  },
  developmentSection: {
    marginTop: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 8,
    paddingVertical: 8,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
  logoutLabel: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  appVersion: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default DrawerContent; 