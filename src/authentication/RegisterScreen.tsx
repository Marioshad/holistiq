import React, { useState, useEffect, useRef } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
import UserService from '../services/UserService';
import FormInput from '../components/forms/FormInput';
import FormButton from '../components/forms/FormButton';
import PasswordRequirements from '../components/forms/PasswordRequirements';
import { useToast } from '../contexts/ToastContext';
import { getTimeBasedWelcome } from '../utils/greetings';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  inputStyles,
  buttonStyles,
  cardStyles,
} from '../styles/styleGuide';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

interface ValidationState {
  name: { isValid: boolean; message: string; hasInteracted: boolean };
  email: { isValid: boolean; message: string; hasInteracted: boolean };
  password: { isValid: boolean; message: string; hasInteracted: boolean };
  confirmPassword: { isValid: boolean; message: string; hasInteracted: boolean };
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const { showSuccess } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation state with interaction tracking
  const [validation, setValidation] = useState<ValidationState>({
    name: { isValid: false, message: '', hasInteracted: false },
    email: { isValid: false, message: '', hasInteracted: false },
    password: { isValid: false, message: '', hasInteracted: false },
    confirmPassword: { isValid: false, message: '', hasInteracted: false },
  });

  // Debounce timers
  const nameTimerRef = useRef<NodeJS.Timeout>();
  const emailTimerRef = useRef<NodeJS.Timeout>();
  const passwordTimerRef = useRef<NodeJS.Timeout>();
  const confirmPasswordTimerRef = useRef<NodeJS.Timeout>();

  // Debounced validation functions
  const debouncedValidateName = (value: string) => {
    if (nameTimerRef.current) {
      clearTimeout(nameTimerRef.current);
    }
    
    nameTimerRef.current = setTimeout(() => {
      validateName(value);
    }, 500); // 500ms delay
  };

  const debouncedValidateEmail = (value: string) => {
    if (emailTimerRef.current) {
      clearTimeout(emailTimerRef.current);
    }
    
    emailTimerRef.current = setTimeout(() => {
      validateEmail(value);
    }, 500); // 500ms delay
  };

  const debouncedValidatePassword = (value: string) => {
    if (passwordTimerRef.current) {
      clearTimeout(passwordTimerRef.current);
    }
    
    passwordTimerRef.current = setTimeout(() => {
      validatePassword(value);
    }, 500); // 500ms delay
  };

  const debouncedValidateConfirmPassword = (passwordValue: string, confirmValue: string) => {
    if (confirmPasswordTimerRef.current) {
      clearTimeout(confirmPasswordTimerRef.current);
    }
    
    confirmPasswordTimerRef.current = setTimeout(() => {
      validateConfirmPassword(passwordValue, confirmValue);
    }, 500); // 500ms delay
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (nameTimerRef.current) clearTimeout(nameTimerRef.current);
      if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
      if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current);
      if (confirmPasswordTimerRef.current) clearTimeout(confirmPasswordTimerRef.current);
    };
  }, []);

  const validateName = (value: string) => {
    if (!value.trim()) {
      setValidation(prev => ({
        ...prev,
        name: { isValid: false, message: 'Full name is required', hasInteracted: true }
      }));
    } else if (value.trim().length < 2) {
      setValidation(prev => ({
        ...prev,
        name: { isValid: false, message: 'Name must be at least 2 characters', hasInteracted: true }
      }));
    } else {
      setValidation(prev => ({
        ...prev,
        name: { isValid: true, message: '', hasInteracted: true }
      }));
    }
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setValidation(prev => ({
        ...prev,
        email: { isValid: false, message: 'Email address is required', hasInteracted: true }
      }));
    } else if (!UserService.validateEmail(value.trim())) {
      setValidation(prev => ({
        ...prev,
        email: { isValid: false, message: 'Please enter a valid email address', hasInteracted: true }
      }));
    } else {
      setValidation(prev => ({
        ...prev,
        email: { isValid: true, message: '', hasInteracted: true }
      }));
    }
  };

  const validatePassword = (value: string) => {
    const passwordValidation = UserService.validatePassword(value);
    setValidation(prev => ({
      ...prev,
      password: { 
        isValid: passwordValidation.valid, 
        message: passwordValidation.message,
        hasInteracted: true
      }
    }));
  };

  const validateConfirmPassword = (passwordValue: string, confirmValue: string) => {
    if (!confirmValue.trim()) {
      setValidation(prev => ({
        ...prev,
        confirmPassword: { isValid: false, message: 'Please confirm your password', hasInteracted: true }
      }));
    } else if (passwordValue !== confirmValue) {
      setValidation(prev => ({
        ...prev,
        confirmPassword: { isValid: false, message: 'Passwords do not match', hasInteracted: true }
      }));
    } else {
      setValidation(prev => ({
        ...prev,
        confirmPassword: { isValid: true, message: '', hasInteracted: true }
      }));
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    debouncedValidateName(text);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    debouncedValidateEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    debouncedValidatePassword(text);
    debouncedValidateConfirmPassword(text, confirmPassword);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    debouncedValidateConfirmPassword(password, text);
  };

  const isFormValid = () => {
    return validation.name.isValid && 
           validation.email.isValid && 
           validation.password.isValid && 
           validation.confirmPassword.isValid;
  };

  // Show validation message only if user has interacted with the field
  const getValidationMessage = (field: keyof ValidationState) => {
    return validation[field].hasInteracted ? validation[field].message : '';
  };

  const handleRegister = async () => {
    if (isLoading || !isFormValid()) return;

    setIsLoading(true);

    try {
      const result = await UserService.register(name.trim(), email.trim(), password);

      if (result.success) {
        // Show success toast with time-based greeting and email verification notice
        const welcomeMessage = getTimeBasedWelcome(name.trim());
        showSuccess(welcomeMessage + '\n\nPlease check your email to verify your account before signing in.');
        
        // Navigate to login screen after a short delay
        setTimeout(() => {
          onNavigateToLogin();
        }, 2000); // Longer delay to allow user to read the message
      } else {
        // Enhanced error handling
        if (result.message.includes('already exists')) {
          Alert.alert(
            'Account Already Exists',
            result.message + '\n\nWould you like to sign in instead?',
            [
              { text: 'Try Again', style: 'cancel' },
              { 
                text: 'Sign In', 
                onPress: onNavigateToLogin
              }
            ]
          );
        } else {
          Alert.alert('Registration Failed', result.message);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Connection Error', 
        'Something went wrong while creating your account. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              <MaterialIcons name="person-add" size={32} color={colors.card} />
            </View>
          </View>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join us to start your wellness journey</Text>
        </View>

        {/* Registration Form */}
        <View style={styles.formContainer}>
          {/* Form Validation Status */}
          {!isFormValid() && 
           (validation.name.hasInteracted || validation.email.hasInteracted || validation.password.hasInteracted || validation.confirmPassword.hasInteracted) && (
            <View style={styles.validationStatus}>
              <MaterialIcons name="info" size={20} color={colors.warning} />
              <Text style={styles.validationStatusText}>
                Please complete all required fields correctly
              </Text>
            </View>
          )}

          <FormInput
            label="Full Name"
            value={name}
            onChangeText={handleNameChange}
            error={getValidationMessage('name')}
            successMessage={validation.name.isValid ? 'Name looks good' : ''}
            required
            isValid={validation.name.isValid}
            hasInteracted={validation.name.hasInteracted}
          />

          <FormInput
            label="Email"
            value={email}
            onChangeText={handleEmailChange}
            error={getValidationMessage('email')}
            successMessage={validation.email.isValid ? 'Email format is valid' : ''}
            required
            isValid={validation.email.isValid}
            hasInteracted={validation.email.hasInteracted}
          />

          <FormInput
            label="Password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!showPassword}
            error={getValidationMessage('password')}
            successMessage={validation.password.isValid ? 'Password meets requirements' : ''}
            required
            isValid={validation.password.isValid}
            hasInteracted={validation.password.hasInteracted}
          />

          {/* Password Requirements */}
          {validation.password.hasInteracted && (
            <PasswordRequirements 
              password={password} 
              confirmPassword={confirmPassword}
            />
          )}

          <FormInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            secureTextEntry={!showConfirmPassword}
            error={getValidationMessage('confirmPassword')}
            successMessage={validation.confirmPassword.isValid ? 'Passwords match' : ''}
            required
            isValid={validation.confirmPassword.isValid}
            hasInteracted={validation.confirmPassword.hasInteracted}
          />

          <FormButton
            title={isLoading ? 'Creating Account...' : 'Register'}
            onPress={handleRegister}
            disabled={isLoading || !isFormValid()}
          />

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateToLogin} disabled={isLoading}>
              <Text style={styles.loginLink}>Sign in</Text>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  title: {
    fontSize: typography['2xl'],
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
  },
  formContainer: {
    ...cardStyles.base,
    marginBottom: spacing.xl,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  validationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    borderWidth: 1,
    borderColor: colors.warning + '30',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  validationStatusText: {
    fontSize: typography.sm,
    color: colors.warning,
    marginLeft: spacing.sm,
    fontWeight: typography.medium,
  },
});

export default RegisterScreen; 