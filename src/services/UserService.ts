import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError,
  sendEmailVerification,
  sendPasswordResetEmail,
  applyActionCode,
  confirmPasswordReset
} from 'firebase/auth';
import { auth } from '../../firebase';
import { UserProfile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthPersistenceService from './AuthPersistenceService';

export class UserService {
  private static currentUser: UserProfile | null = null;
  private static authStateListeners: ((user: UserProfile | null) => void)[] = [];

  // Authentication methods
  static async register(name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      
      // Create user profile but DON'T set as current user yet
      const newUser: UserProfile = {
        id: firebaseUser.uid,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        createdAt: new Date().toISOString(),
        preferences: {
          notifications: true,
          theme: 'light',
          reminderTime: '09:00',
        },
      };

      // Set as current user
      this.currentUser = newUser;
      this.notifyAuthStateListeners(newUser);

      return { 
        success: true, 
        message: 'Registration successful! Please check your email to verify your account before signing in.', 
        user: newUser 
      };
    } catch (error) {
      const authError = error as AuthError;
      
      // Handle Firebase Auth errors
      switch (authError.code) {
        case 'auth/email-already-in-use':
          return { success: false, message: 'User with this email already exists' };
        case 'auth/invalid-email':
          return { success: false, message: 'Please enter a valid email address' };
        case 'auth/weak-password':
          return { success: false, message: 'Password should be at least 6 characters' };
        case 'auth/operation-not-allowed':
          return { success: false, message: 'Email/password accounts are not enabled. Please contact support.' };
        default:
          return { success: false, message: 'Registration failed. Please try again.' };
      }
    }
  }

  static async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: UserProfile; needsVerification?: boolean }> {
    try {
      // Validate email format first
      if (!this.validateEmail(email)) {
        return { 
          success: false, 
          message: 'Please enter a valid email address (e.g., user@example.com)' 
        };
      }

      // Check if email is empty
      if (!email.trim()) {
        return { 
          success: false, 
          message: 'Email address is required' 
        };
      }

      // Check if password is empty
      if (!password.trim()) {
        return { 
          success: false, 
          message: 'Password is required' 
        };
      }

      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;
      
      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        return { 
          success: false, 
          message: 'Please verify your email address before signing in. You can request a new verification email from the login screen.',
          needsVerification: true
        };
      }
      
      // Create user profile from Firebase user
      const userProfile: UserProfile = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0], // Fallback to email prefix if no display name
        email: firebaseUser.email || email,
        createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        preferences: {
          notifications: true,
          theme: 'light',
          reminderTime: '09:00',
        },
      };

      // Set as current user
      this.currentUser = userProfile;
      this.notifyAuthStateListeners(userProfile);

      return { success: true, message: 'Login successful! Welcome back.', user: userProfile };
    } catch (error) {
      const authError = error as AuthError;
      
      // Handle Firebase Auth errors
      switch (authError.code) {
        case 'auth/user-not-found':
          return { 
            success: false, 
            message: `No account found with email "${email}". Please check your email or create a new account.` 
          };
        case 'auth/wrong-password':
          return { 
            success: false, 
            message: 'Incorrect password. Please check your password and try again.' 
          };
        case 'auth/invalid-email':
          return { 
            success: false, 
            message: 'Please enter a valid email address' 
          };
        case 'auth/user-disabled':
          return { 
            success: false, 
            message: 'This account has been disabled. Please contact support.' 
          };
        case 'auth/too-many-requests':
          return { 
            success: false, 
            message: 'Too many failed attempts. Please wait a few minutes before trying again.' 
          };
        case 'auth/invalid-credential':
          return {
            success: false,
            message: 'Invalid credentials. Please check your email and password.'
          };
        case 'auth/network-request-failed':
          return {
            success: false,
            message: 'Network error. Please check your internet connection and try again.'
          };
        case 'auth/internal-error':
          return {
            success: false,
            message: 'Internal error. Please try again later.'
          };
        default:
          return { 
            success: false, 
            message: `Something went wrong during login (${authError.code}). Please try again or contact support.` 
          };
      }
    }
  }

  static async logout(): Promise<boolean> {
    try {
      if (__DEV__) {
        console.log('UserService: Logging out user');
      }
      
      // Sign out from Firebase Auth
      await signOut(auth);
      
      // Clear current user
      this.currentUser = null;
      
      // Clear cached user profile
      await this.clearCachedUserProfile();
      
      // Notify listeners
      this.notifyAuthStateListeners(null);
      
      if (__DEV__) {
        console.log('UserService: Logout completed successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }

  // Clear all authentication data (useful for debugging emulator issues)
  static async clearAllAuthData(): Promise<void> {
    try {
      if (__DEV__) {
        console.log('UserService: Clearing all authentication data');
      }
      
      // Clear current user
      this.currentUser = null;
      
      // Clear cached user profile
      await this.clearCachedUserProfile();
      
      // Clear any other auth-related data
      await AsyncStorage.removeItem('cachedUserProfile');
      
      // Notify listeners
      this.notifyAuthStateListeners(null);
      
      if (__DEV__) {
        console.log('UserService: All authentication data cleared');
      }
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // User profile methods
  static async getCurrentUser(): Promise<UserProfile | null> {
    return this.currentUser;
  }

  static async setCurrentUser(user: UserProfile): Promise<void> {
    this.currentUser = user;
    this.notifyAuthStateListeners(user);
  }

  static async updateUserProfile(updatedUser: UserProfile): Promise<boolean> {
    try {
      this.currentUser = updatedUser;
      this.notifyAuthStateListeners(updatedUser);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // Firebase Auth state listener
  static onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Initialize Firebase Auth state listener
  static initializeAuthStateListener(): void {
    if (__DEV__) {
      console.log('UserService: Initializing auth state listener');
    }
    
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (__DEV__) {
        console.log('UserService: Firebase auth state changed:', {
          hasUser: !!firebaseUser,
          userId: firebaseUser?.uid,
          email: firebaseUser?.email,
          emailVerified: firebaseUser?.emailVerified,
          timestamp: new Date().toISOString()
        });
      }
      
      if (firebaseUser) {
        // User is signed in - check if email is verified
        const userProfile: UserProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
          preferences: {
            notifications: true,
            theme: 'light',
            reminderTime: '09:00',
          },
          // Add emailVerified property for app logic
          emailVerified: firebaseUser.emailVerified,
        } as UserProfile & { emailVerified: boolean };
        
        this.currentUser = userProfile;
        this.notifyAuthStateListeners(userProfile);
        
        // Cache the user profile and save to persistence
        this.cacheUserProfile(userProfile);
        await AuthPersistenceService.saveUser(firebaseUser);
        
        if (__DEV__) {
          console.log('UserService: User signed in and cached:', {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name
          });
        }
      } else {
        // User is signed out
        this.currentUser = null;
        this.notifyAuthStateListeners(null);
        
        // Clear cached user profile and persistence
        this.clearCachedUserProfile();
        await AuthPersistenceService.clearSavedUser();
        
        if (__DEV__) {
          console.log('UserService: User signed out and cache cleared');
        }
      }
    });
  }

  // Cache user profile to AsyncStorage
  private static async cacheUserProfile(userProfile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem('cachedUserProfile', JSON.stringify(userProfile));
    } catch (error) {
      console.warn('Failed to cache user profile:', error);
    }
  }

  // Clear cached user profile
  private static async clearCachedUserProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem('cachedUserProfile');
    } catch (error) {
      console.warn('Failed to clear cached user profile:', error);
    }
  }

  // Get cached user profile
  static async getCachedUserProfile(): Promise<UserProfile | null> {
    try {
      const cached = await AsyncStorage.getItem('cachedUserProfile');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to get cached user profile:', error);
    }
    return null;
  }

  // Check for saved authentication state
  static async checkSavedAuthState(): Promise<UserProfile | null> {
    try {
      const savedUser = await AuthPersistenceService.getSavedUser();
      if (savedUser && await AuthPersistenceService.isUserAuthenticated()) {
        // Create a user profile from saved data
        const userProfile: UserProfile = {
          id: savedUser.uid,
          name: savedUser.displayName || savedUser.email?.split('@')[0] || 'User',
          email: savedUser.email || '',
          createdAt: savedUser.creationTime || new Date().toISOString(),
          preferences: {
            notifications: true,
            theme: 'light',
            reminderTime: '09:00',
          },
          emailVerified: savedUser.emailVerified,
        } as UserProfile & { emailVerified: boolean };

        this.currentUser = userProfile;
        this.notifyAuthStateListeners(userProfile);
        
        if (__DEV__) {
          console.log('UserService: Restored user from persistence:', {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            source: 'checkSavedAuthState',
            timestamp: new Date().toISOString()
          });
        }
        
        return userProfile;
      } else {
        if (__DEV__) {
          console.log('UserService: No valid saved auth state found:', {
            hasSavedUser: !!savedUser,
            isAuthenticated: savedUser ? await AuthPersistenceService.isUserAuthenticated() : false,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.warn('Failed to check saved auth state:', error);
    }
    return null;
  }

  private static notifyAuthStateListeners(user: UserProfile | null): void {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  // Legacy method for backward compatibility - now uses Firebase Auth state
  static async isLoggedIn(): Promise<boolean> {
    return this.currentUser !== null;
  }

  // Utility methods
  static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long' };
    }
    return { valid: true, message: 'Password is valid' };
  }

  // Remove legacy methods that are no longer needed
  static async getAllUsers(): Promise<UserProfile[]> {
    console.warn('getAllUsers() is deprecated with Firebase Auth');
    return [];
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    console.warn('changePassword() needs to be implemented with Firebase Auth');
    return { success: false, message: 'Password change not implemented yet' };
  }

  static async deleteAccount(): Promise<boolean> {
    console.warn('deleteAccount() needs to be implemented with Firebase Auth');
    return false;
  }

  // Email verification methods
  // Rate limiting for email verification
  private static lastVerificationRequest: { [email: string]: number } = {};
  private static readonly VERIFICATION_COOLDOWN = 60000; // 1 minute cooldown

  static async sendEmailVerification(): Promise<{ success: boolean; message: string }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, message: 'No user is currently signed in' };
      }

      if (currentUser.emailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      const email = currentUser.email;
      if (!email) {
        return { success: false, message: 'No email address found for current user' };
      }

      // Check rate limiting
      const now = Date.now();
      const lastRequest = this.lastVerificationRequest[email];
      if (lastRequest && (now - lastRequest) < this.VERIFICATION_COOLDOWN) {
        const remainingTime = Math.ceil((this.VERIFICATION_COOLDOWN - (now - lastRequest)) / 1000);
        return { 
          success: false, 
          message: `Please wait ${remainingTime} seconds before requesting another verification email.` 
        };
      }

      // Update last request time
      this.lastVerificationRequest[email] = now;

      await sendEmailVerification(currentUser);
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      const authError = error as AuthError;
      
      switch (authError.code) {
        case 'auth/too-many-requests':
          return { 
            success: false, 
            message: 'Too many verification requests. Please wait a few minutes before trying again.' 
          };
        case 'auth/network-request-failed':
          return { 
            success: false, 
            message: 'Network error. Please check your internet connection and try again.' 
          };
        default:
          return { success: false, message: 'Failed to send verification email. Please try again.' };
      }
    }
  }

  static async verifyEmail(actionCode: string): Promise<{ success: boolean; message: string }> {
    try {
      await applyActionCode(auth, actionCode);
      return { success: true, message: 'Email verified successfully! You can now sign in.' };
    } catch (error) {
      const authError = error as AuthError;
      
      switch (authError.code) {
        case 'auth/invalid-action-code':
          return { success: false, message: 'Invalid verification link. Please request a new one.' };
        case 'auth/expired-action-code':
          return { success: false, message: 'Verification link has expired. Please request a new one.' };
        default:
          return { success: false, message: 'Failed to verify email. Please try again.' };
      }
    }
  }

  // Rate limiting for password reset
  private static lastPasswordResetRequest: { [email: string]: number } = {};
  private static readonly PASSWORD_RESET_COOLDOWN = 60000; // 1 minute cooldown

  // Password reset methods
  static async sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.validateEmail(email)) {
        return { success: false, message: 'Please enter a valid email address' };
      }

      const trimmedEmail = email.trim();

      // Check rate limiting
      const now = Date.now();
      const lastRequest = this.lastPasswordResetRequest[trimmedEmail];
      if (lastRequest && (now - lastRequest) < this.PASSWORD_RESET_COOLDOWN) {
        const remainingTime = Math.ceil((this.PASSWORD_RESET_COOLDOWN - (now - lastRequest)) / 1000);
        return { 
          success: false, 
          message: `Please wait ${remainingTime} seconds before requesting another password reset.` 
        };
      }

      // Update last request time
      this.lastPasswordResetRequest[trimmedEmail] = now;

      await sendPasswordResetEmail(auth, trimmedEmail);
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      const authError = error as AuthError;
      
      switch (authError.code) {
        case 'auth/user-not-found':
          return { success: false, message: 'No account found with this email address' };
        case 'auth/invalid-email':
          return { success: false, message: 'Please enter a valid email address' };
        case 'auth/too-many-requests':
          return { 
            success: false, 
            message: 'Too many reset requests. Please wait a few minutes before trying again.' 
          };
        case 'auth/network-request-failed':
          return { 
            success: false, 
            message: 'Network error. Please check your internet connection and try again.' 
          };
        default:
          return { success: false, message: 'Failed to send reset email. Please try again.' };
      }
    }
  }

  static async confirmPasswordReset(actionCode: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      if (newPassword.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long' };
      }

      await confirmPasswordReset(auth, actionCode, newPassword);
      return { success: true, message: 'Password reset successfully! You can now sign in with your new password.' };
    } catch (error) {
      const authError = error as AuthError;
      
      switch (authError.code) {
        case 'auth/invalid-action-code':
          return { success: false, message: 'Invalid reset link. Please request a new one.' };
        case 'auth/expired-action-code':
          return { success: false, message: 'Reset link has expired. Please request a new one.' };
        case 'auth/weak-password':
          return { success: false, message: 'Password is too weak. Please choose a stronger password.' };
        default:
          return { success: false, message: 'Failed to reset password. Please try again.' };
      }
    }
  }

  // Check if current user's email is verified
  static isEmailVerified(): boolean {
    const currentUser = auth.currentUser;
    return currentUser ? currentUser.emailVerified : false;
  }

  // Debug methods for development
  static async createTestUser(): Promise<{ success: boolean; message: string; credentials?: { email: string; password: string } }> {
    try {
      const testEmail = 'test@example.com';
      const testPassword = 'password123';
      const testName = 'Test User';

      // Try to create test user with Firebase
      const result = await this.register(testName, testEmail, testPassword);
      
      if (result.success) {
        return { 
          success: true, 
          message: 'Test user created successfully', 
          credentials: { email: testEmail, password: testPassword }
        };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error creating test user:', error);
      return { success: false, message: 'Failed to create test user' };
    }
  }

  static async debugStorage(): Promise<void> {
    try {
      console.log('=== DEBUGGING FIREBASE AUTH ===');
      console.log('Current user:', this.currentUser ? { id: this.currentUser.id, name: this.currentUser.name, email: this.currentUser.email } : 'None');
      console.log('Firebase auth current user:', auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : 'None');
      console.log('=== END DEBUG ===');
    } catch (error) {
      console.error('Error debugging Firebase Auth:', error);
    }
  }

  static async clearAllData(): Promise<boolean> {
    try {
      // Sign out current user
      await this.logout();
      // Clear rate limiting data
      this.lastVerificationRequest = {};
      this.lastPasswordResetRequest = {};
      return true;
    } catch (error) {
      console.error('Error clearing Firebase Auth data:', error);
      return false;
    }
  }

  // Clear rate limiting data (useful for testing or when user changes)
  static clearRateLimitingData(): void {
    this.lastVerificationRequest = {};
    this.lastPasswordResetRequest = {};
  }
}

export default UserService; 