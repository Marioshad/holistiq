// AuthPersistenceService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';

const AUTH_STORAGE_KEY = 'firebase_auth_user';

export class AuthPersistenceService {
  /**
   * Save user authentication data to AsyncStorage
   */
  static async saveUser(user: User | null): Promise<void> {
    try {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastSignInTime: user.metadata.lastSignInTime,
          creationTime: user.metadata.creationTime,
        };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving user to AsyncStorage:', error);
    }
  }

  /**
   * Get saved user authentication data from AsyncStorage
   */
  static async getSavedUser(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user from AsyncStorage:', error);
      return null;
    }
  }

  /**
   * Clear saved user authentication data
   */
  static async clearSavedUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing user from AsyncStorage:', error);
    }
  }

  /**
   * Check if user is authenticated based on saved data
   */
  static async isUserAuthenticated(): Promise<boolean> {
    try {
      const userData = await this.getSavedUser();
      if (!userData) return false;

      // Check if the saved session is still valid (not expired)
      const lastSignInTime = new Date(userData.lastSignInTime);
      const now = new Date();
      const hoursSinceLastSignIn = (now.getTime() - lastSignInTime.getTime()) / (1000 * 60 * 60);

      // Consider session valid for 7 days
      return hoursSinceLastSignIn < 24 * 7;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }
}

export default AuthPersistenceService; 