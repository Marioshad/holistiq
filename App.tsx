import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { View, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList, MainTabParamList, DrawerParamList } from './src/types';
import UserService from './src/services/UserService';
import NotificationService from './src/services/NotificationService';
import { ToastProvider } from './src/contexts/ToastContext';
import { shadows } from './src/styles/styleGuide';

// Environment variables
import { ENABLE_DEV_SCREENS } from '@env';

// Auth Screens
import OnboardingScreen from './src/onboarding/OnboardingScreen';
import LoginScreen from './src/authentication/LoginScreen';
import RegisterScreen from './src/authentication/RegisterScreen';
import EmailVerificationScreen from './src/authentication/EmailVerificationScreen';

// Main App Screens
import DailyScreen from './src/main-app/tabs/DailyScreen';
import MonthlyScreen from './src/main-app/tabs/MonthlyScreen';
import AnalyticsScreen from './src/main-app/tabs/AnalyticsScreen';
import NotificationsScreen from './src/main-app/tabs/NotificationsScreen';
import HabitDetailScreen from './src/modal-screens/HabitDetailScreen';
import MonthlyDetailScreen from './src/modal-screens/MonthlyDetailScreen';

// Entry Management Screens
import EntryListScreen from './src/modal-screens/EntryListScreen';
import AddEditEntryScreen from './src/modal-screens/AddEditEntryScreen';
import EntryManagementScreen from './src/main-app/drawer/EntryManagementScreen';
import EntryDetailsScreen from './src/modal-screens/EntryDetailsScreen';

// Drawer Screens
import SettingsScreen from './src/main-app/drawer/SettingsScreen';
import ProfileScreen from './src/main-app/drawer/ProfileScreen';
import AboutScreen from './src/main-app/drawer/AboutScreen';

// Development Screens (conditionally imported)
let AuthDebugScreen: any = null;
let NotificationTestScreen: any = null;

// Fallback component for when dev screens are disabled
const DevScreenFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <Text style={{ fontSize: 18, textAlign: 'center', color: '#666' }}>
      Development screens are disabled in production mode.
    </Text>
    <Text style={{ fontSize: 14, textAlign: 'center', color: '#999', marginTop: 10 }}>
      Set ENABLE_DEV_SCREENS=true in your .env file to enable development tools.
    </Text>
  </View>
);

if (ENABLE_DEV_SCREENS === 'true') {
  AuthDebugScreen = require('./src/debug/AuthDebugScreen').default;
  NotificationTestScreen = require('./src/debug/NotificationTestScreen').default;
} else {
  // Use fallback components when dev screens are disabled
  AuthDebugScreen = DevScreenFallback;
  NotificationTestScreen = DevScreenFallback;
}

// Components
import DrawerContent from './src/components/DrawerContent';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// Custom theme with modern design system
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563EB', // Modern blue
    accent: '#3B82F6',
    background: '#F7F8FD', // Light grey background
    surface: '#FFFFFF', // White cards
    text: '#1F2937', // Dark text
    placeholder: '#9CA3AF',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Daily') {
            iconName = 'today';
          } else if (route.name === 'Monthly') {
            iconName = 'calendar-today';
          } else if (route.name === 'Analytics') {
            iconName = 'trending-up';
          } else if (route.name === 'Notifications') {
            iconName = 'notifications';
          } else {
            iconName = 'help';
          }

          return <MaterialIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          ...shadows.lg, // Use style guide shadow instead of custom platform logic
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 0,
        },
        headerTintColor: '#1F2937',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerLeft: () => (
          <MaterialIcons
            name="menu"
            size={24}
            color="#1F2937"
            style={{ marginLeft: 16 }}
            onPress={() => navigation.getParent()?.openDrawer?.()}
          />
        ),
        headerRight: () => (
          <MaterialIcons
            name="account-circle"
            size={28}
            color="#2563EB"
            style={{ marginRight: 16 }}
            onPress={() => navigation.getParent()?.navigate?.('Profile')}
          />
        ),
      })}
    >
      <Tab.Screen 
        name="Daily" 
        component={DailyScreen} 
        options={{ title: 'Today' }}
      />
      <Tab.Screen 
        name="Monthly" 
        component={MonthlyScreen} 
        options={{ title: 'Monthly' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Reminders' }}
      />
    </Tab.Navigator>
  );
}

function DrawerNavigator({ onLogout }: { onLogout: () => void }) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} onLogout={onLogout} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1F2937',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerLeft: () => (
          <MaterialIcons
            name="menu"
            size={24}
            color="#1F2937"
            style={{ marginLeft: 16 }}
            onPress={() => navigation.openDrawer()}
          />
        ),
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 280,
        },
        drawerActiveTintColor: '#2563EB',
        drawerInactiveTintColor: '#6B7280',
      })}
    >
      <Drawer.Screen 
        name="Home" 
        component={MainTabs}
        options={{ 
          title: 'Task Manager',
          headerShown: false, // MainTabs will handle its own headers
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        options={{ 
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="settings" color={color} size={size} />
          ),
        }}
      >
        {() => <SettingsScreen onLogout={onLogout} />}
      </Drawer.Screen>
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Profile',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ 
          title: 'About',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="info" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="EntryManagement" 
        component={EntryManagementScreen} 
        options={{ 
          title: 'Entry Management',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="storage" color={color} size={size} />
          ),
        }}
      />
      
      {/* Development Screens - Always registered but conditionally shown */}

      <Drawer.Screen 
        name="AuthDebug" 
        component={AuthDebugScreen} 
        options={{ 
          title: 'Firebase Debug',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="bug-report" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="NotificationTest" 
        component={NotificationTestScreen} 
        options={{ 
          title: 'Notification Test',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="notifications-active" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [initialNavigationState, setInitialNavigationState] = useState(undefined);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await checkAppState();
      await initializeFirebaseAuth();
      await loadNavigationState();
    };
    
    initializeApp();
  }, []);

  const loadNavigationState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('NAVIGATION_STATE');
      if (savedState) {
        setInitialNavigationState(JSON.parse(savedState));
      }
    } catch (error) {
      console.warn('Failed to load navigation state:', error);
    }
  };

  const saveNavigationState = async (state: any) => {
    try {
      await AsyncStorage.setItem('NAVIGATION_STATE', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  };

  const checkAppState = async () => {
    try {
      // Check onboarding status
      const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(onboardingStatus === 'true');
    } catch (error) {
      console.error('Error checking app state:', error);
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeFirebaseAuth = async () => {
    // Check for saved authentication state first
    const savedUser = await UserService.checkSavedAuthState();
    if (savedUser) {
      setIsLoggedIn(true);
      setAuthInitialized(true);
      
      // Initialize notification service when user is authenticated
      NotificationService.initialize().catch(error => {
        console.warn('Failed to initialize notification service:', error);
      });
      
      if (__DEV__) {
        console.log('App: Restored auth state on app start:', {
          userId: savedUser.id,
          email: savedUser.email,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Initialize Firebase Auth state listener
    UserService.initializeAuthStateListener();
    
    // Subscribe to auth state changes
    const unsubscribe = UserService.onAuthStateChanged((user) => {
      if (__DEV__) {
        console.log('App: Firebase Auth state changed:', { 
          user: user ? { id: user.id, email: user.email } : null,
          timestamp: new Date().toISOString()
        });
      }
      
      setIsLoggedIn(user !== null);
      setAuthInitialized(true);
      
      // Initialize notification service when user is authenticated
      if (user) {
        NotificationService.initialize().catch(error => {
          console.warn('Failed to initialize notification service:', error);
        });
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleAuthSuccess = () => {
    // Auth state will be automatically updated by Firebase Auth listener
    // No need to manually set isLoggedIn here
  };

  const handleEmailVerificationComplete = () => {
    setShowEmailVerification(false);
    setAuthScreen('login');
  };

  const handleBackToLogin = () => {
    setShowEmailVerification(false);
    setAuthScreen('login');
  };

  const handleLogout = async () => {
    try {
      await UserService.logout();
      // Clear navigation state on logout
      await AsyncStorage.removeItem('NAVIGATION_STATE');
      // Auth state will be automatically updated by Firebase Auth listener
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Development-only: Debug auth state
  useEffect(() => {
    if (__DEV__) {
      console.log('App: Auth state changed:', { 
        isLoggedIn, 
        authInitialized, 
        hasSeenOnboarding,
        isLoading 
      });
    }
  }, [isLoggedIn, authInitialized, hasSeenOnboarding, isLoading]);

  if (isLoading || !authInitialized) {
    return (
      <View style={styles.loadingContainer}>
        {/* You can add a loading spinner here */}
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <ToastProvider>
        <NavigationContainer
          initialState={initialNavigationState}
          onStateChange={saveNavigationState}
        >
          <StatusBar style="dark" backgroundColor="#F7F8FD" />
          {!hasSeenOnboarding ? (
            <Stack.Navigator>
              <Stack.Screen 
                name="Onboarding" 
                options={{ headerShown: false }}
              >
                {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
              </Stack.Screen>
            </Stack.Navigator>
          ) : isLoggedIn ? (
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#FFFFFF',
                },
                headerTintColor: '#1F2937',
                headerTitleStyle: {
                  fontWeight: '600',
                  fontSize: 18,
                },
              }}
            >
              <Stack.Screen 
                name="MainApp" 
                options={{ headerShown: false }}
              >
                {() => <DrawerNavigator onLogout={handleLogout} />}
              </Stack.Screen>
              <Stack.Screen 
                name="HabitDetail" 
                component={HabitDetailScreen}
                options={{ 
                  title: 'Task Details',
                  presentation: 'modal',
                  headerShown: true,
                }}
              />
              <Stack.Screen 
                name="MonthlyDetail" 
                component={MonthlyDetailScreen}
                options={{ 
                  title: 'Day Details',
                  presentation: 'modal',
                  headerShown: true,
                }}
              />
              <Stack.Screen 
                name="EntryList" 
                component={EntryListScreen}
                options={{ 
                  headerShown: true,
                }}
              />
              <Stack.Screen 
                name="AddEditEntry" 
                component={AddEditEntryScreen}
                options={{ 
                  headerShown: false,
                  presentation: 'modal',
                }}
              />
              <Stack.Screen 
                name="EntryDetail" 
                component={EntryDetailsScreen}
                options={{ 
                  headerShown: false,
                  presentation: 'modal',
                }}
              />
            </Stack.Navigator>
          ) : showEmailVerification ? (
            <EmailVerificationScreen 
              onVerificationComplete={handleEmailVerificationComplete}
              onBackToLogin={handleBackToLogin}
            />
          ) : (
            <View style={styles.authContainer}>
              {authScreen === 'login' ? (
                <LoginScreen 
                  onLoginSuccess={handleAuthSuccess}
                  onNavigateToRegister={() => setAuthScreen('register')}
                  onShowEmailVerification={() => setShowEmailVerification(true)}
                />
              ) : (
                <RegisterScreen 
                  onRegisterSuccess={handleAuthSuccess}
                  onNavigateToLogin={() => setAuthScreen('login')}
                />
              )}
            </View>
          )}
        </NavigationContainer>
      </ToastProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FD',
  },
  authContainer: {
    flex: 1,
  },
}); 