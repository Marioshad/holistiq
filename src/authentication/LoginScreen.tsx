import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import UserService from '../services/UserService';
import { useToast } from '../contexts/ToastContext';
import { colors, typography, spacing, borderRadius, buttonStyles } from '../styles/styleGuide';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
  onShowEmailVerification?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onNavigateToRegister, onShowEmailVerification }) => {
  const { showSuccess } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [verificationCooldown, setVerificationCooldown] = useState(0);
  const [passwordResetCooldown, setPasswordResetCooldown] = useState(0);

  // Handle countdown timers
  useEffect(() => {
    if (verificationCooldown > 0) {
      const timer = setTimeout(() => {
        setVerificationCooldown(verificationCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationCooldown]);

  useEffect(() => {
    if (passwordResetCooldown > 0) {
      const timer = setTimeout(() => {
        setPasswordResetCooldown(passwordResetCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [passwordResetCooldown]);

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
    if (passwordError) setPasswordError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
    if (emailError) setEmailError('');
  };

  const handleLogin = async () => {
    if (isLoading) return;

    clearErrors();

    // Validation
    let hasErrors = false;

    if (!email.trim()) {
      setEmailError('Email address is required');
      hasErrors = true;
    } else if (!UserService.validateEmail(email.trim())) {
      setEmailError('Invalid email format');
      hasErrors = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      hasErrors = true;
    }

    if (hasErrors) {
      Alert.alert('Please Fix Errors', 'Please correct the highlighted fields to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await UserService.login(email.trim(), password);

      if (result.success) {
        showSuccess(result.message);
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        // Handle email verification requirement
        if (result.needsVerification) {
          if (onShowEmailVerification) {
            onShowEmailVerification();
          } else {
            Alert.alert(
              'Email Verification Required',
              result.message,
              [
                { text: 'Resend Email', onPress: handleResendVerification },
                { text: 'OK', style: 'cancel' }
              ]
            );
          }
        } else {
          // Enhanced error handling with inline errors and Alert
          if (result.message.includes('No account found')) {
            setEmailError('No account found with this email.');
            Alert.alert(
              'Account Not Found',
              result.message + '\n\nWould you like to create a new account instead?',
              [
                { text: 'Try Again', style: 'cancel' },
                { 
                  text: 'Create Account', 
                  onPress: onNavigateToRegister
                }
              ]
            );
          } else if (result.message.includes('Incorrect password')) {
            setPasswordError('Incorrect password.');
            Alert.alert(
              'Wrong Password',
              result.message + '\n\nTip: Make sure Caps Lock is off and check for typos.',
              [{ text: 'Try Again' }]
            );
          } else if (result.message.includes('valid email')) {
            setEmailError('Invalid email address.');
            Alert.alert('Invalid Email', result.message);
          } else if (result.message.includes('Invalid credentials')) {
            setEmailError('Invalid credentials. Please check your email and password.');
          } else if (result.message.includes('corrupted')) {
            setEmailError('Account data is corrupted.');
            Alert.alert(
              'Account Issue',
              result.message + '\n\nThis usually happens if data was cleared or corrupted.',
              [
                { text: 'Try Again', style: 'cancel' },
                { 
                  text: 'Create New Account', 
                  onPress: onNavigateToRegister
                }
              ]
            );
          } else if (result.message.includes('Network error')) {
            setEmailError('');
            setPasswordError('');
            Alert.alert('Network Error', result.message);
          } else {
            setEmailError('');
            setPasswordError('');
            Alert.alert('Sign In Failed', result.message || 'Unknown error. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Connection Error', 
        'Something went wrong while trying to sign in. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const result = await UserService.sendEmailVerification();
      if (result.success) {
        showSuccess(result.message);
        setVerificationCooldown(60); // Start 60 second cooldown
      } else {
        // Check if it's a rate limiting error
        if (result.message.includes('wait') && result.message.includes('seconds')) {
          const match = result.message.match(/(\d+)/);
          if (match) {
            setVerificationCooldown(parseInt(match[1]));
          }
        }
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification email');
    }
  };

  const handleForgotPassword = () => {
    setShowPasswordReset(true);
    setResetEmail(email); // Pre-fill with current email
  };

  const handlePasswordReset = async () => {
    if (!resetEmail.trim() || !UserService.validateEmail(resetEmail.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsResettingPassword(true);

    try {
      const result = await UserService.sendPasswordResetEmail(resetEmail.trim());
      if (result.success) {
        showSuccess(result.message);
        setShowPasswordReset(false);
        setResetEmail('');
        setPasswordResetCooldown(60); // Start 60 second cooldown
      } else {
        // Check if it's a rate limiting error
        if (result.message.includes('wait') && result.message.includes('seconds')) {
          const match = result.message.match(/(\d+)/);
          if (match) {
            setPasswordResetCooldown(parseInt(match[1]));
          }
        }
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email');
    } finally {
      setIsResettingPassword(false);
    }
  };


  if (showPasswordReset) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#F7F8FD" />
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => setShowPasswordReset(false)}
            >
              <MaterialIcons name="arrow-back" size={24} color="#2563EB" />
            </TouchableOpacity>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
          </View>

          {/* Password Reset Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                label="Email"
                value={resetEmail}
                onChangeText={setResetEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                disabled={isResettingPassword}
                outlineColor="#E5E7EB"
                activeOutlineColor="#2563EB"
                theme={{
                  colors: {
                    background: '#FFFFFF',
                    surface: '#FFFFFF',
                  }
                }}
              />
            </View>

            <TouchableOpacity
              style={[styles.signInButton, isResettingPassword && styles.signInButtonDisabled]}
              onPress={handlePasswordReset}
              disabled={isResettingPassword}
            >
              <Text style={styles.signInButtonText}>
                {isResettingPassword ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => setShowPasswordReset(false)}
              disabled={isResettingPassword}
            >
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FD" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="favorite" size={32} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue your wellness journey</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={handleEmailChange}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              disabled={isLoading}
              error={!!emailError}
              outlineColor="#E5E7EB"
              activeOutlineColor="#2563EB"
              theme={{
                colors: {
                  background: '#FFFFFF',
                  surface: '#FFFFFF',
                }
              }}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Password"
              value={password}
              onChangeText={handlePasswordChange}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              disabled={isLoading}
              error={!!passwordError}
              outlineColor="#E5E7EB"
              activeOutlineColor="#2563EB"
              theme={{
                colors: {
                  background: '#FFFFFF',
                  surface: '#FFFFFF',
                }
              }}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerPrompt}>
            <Text style={styles.registerPromptText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateToRegister} disabled={isLoading}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...buttonStyles.primary,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...buttonStyles.outline,
    borderWidth: 0,
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    elevation: undefined,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.card,
  },
  errorText: {
    fontSize: typography.xs,
    color: colors.error,
    marginTop: 4,
    marginLeft: spacing.md,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  signInButton: {
    ...buttonStyles.primary,
    marginBottom: spacing.xl,
  },
  signInButtonDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.7,
  },
  signInButtonText: {
    ...buttonStyles.primaryText,
    fontSize: typography.lg,
  },
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  backToLoginText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  registerPromptText: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.semibold,
    marginLeft: 4,
  },
});

export default LoginScreen; 