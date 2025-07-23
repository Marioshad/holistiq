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

export class UserService {
  private static currentUser: UserProfile | null = null;
  private static authStateListeners: ((user: UserProfile | null) => void)[] = [];

  // Authentication methods
  static async register(name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    try {
      console.log('🔥 Starting Firebase registration for:', email);
      console.log('🔥 Firebase config projectId:', 'holistiq-app');
      console.log('🔥 Firebase auth instance:', auth ? 'Initialized' : 'Not initialized');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;
      
      console.log('🔥 Firebase user created successfully!');
      console.log('🔥 Firebase UID:', firebaseUser.uid);
      console.log('🔥 Firebase email:', firebaseUser.email);
      console.log('🔥 Firebase emailVerified:', firebaseUser.emailVerified);
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      console.log('🔥 Email verification sent to:', firebaseUser.email);
      
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

      console.log('🔥 Created user profile:', newUser);
      
      // Set as current user
      this.currentUser = newUser;
      this.notifyAuthStateListeners(newUser);

      console.log('🔥 Registration completed successfully!');
      return { 
        success: true, 
        message: 'Registration successful! Please check your email to verify your account before signing in.', 
        user: newUser 
      };
    } catch (error) {
      console.error('🔥 Firebase registration error:', error);
      const authError = error as AuthError;
      
      console.log('🔥 Firebase error code:', authError.code);
      console.log('🔥 Firebase error message:', authError.message);
      
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

      console.log('🔥 Attempting Firebase login for:', email.toLowerCase());
      console.log('🔥 Firebase auth instance:', auth ? 'Initialized' : 'Not initialized');

      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;
      
      console.log('🔥 Firebase login successful!');
      console.log('🔥 Firebase UID:', firebaseUser.uid);
      console.log('🔥 Firebase email:', firebaseUser.email);
      console.log('🔥 Firebase emailVerified:', firebaseUser.emailVerified);
      
      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        console.log('🔥 User email not verified');
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

      console.log('🔥 Created user profile from Firebase:', userProfile);

      // Set as current user
      this.currentUser = userProfile;
      this.notifyAuthStateListeners(userProfile);

      return { success: true, message: 'Login successful! Welcome back.', user: userProfile };
    } catch (error) {
      console.error('🔥 Firebase login error:', error);
      const authError = error as AuthError;
      
      console.log('🔥 Firebase error code:', authError.code);
      console.log('🔥 Firebase error message:', authError.message);
      
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
      await signOut(auth);
      this.currentUser = null;
      this.notifyAuthStateListeners(null);
      return true;
    } catch (error) {
      console.error('Firebase logout error:', error);
      return false;
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
    console.log('🔥 Initializing Firebase Auth state listener...');
    onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      console.log('🔥 Firebase Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      
      if (firebaseUser) {
        // User is signed in - check if email is verified
        console.log('🔥 Firebase user details:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified
        });
        
        // Only set as current user if email is verified
        // Option 1: Do NOT sign out unverified users. Always set currentUser and notify listeners.
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
        console.log('🔥 User profile set from Firebase Auth state:', userProfile);
      } else {
        // User is signed out
        this.currentUser = null;
        this.notifyAuthStateListeners(null);
        console.log('🔥 User signed out, cleared current user');
      }
    });
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
      console.error('Error sending email verification:', error);
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
      console.error('Error verifying email:', error);
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
      console.error('Error sending password reset email:', error);
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
      console.error('Error confirming password reset:', error);
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
      console.log('Firebase Auth data cleared');
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