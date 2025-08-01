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
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import UserService from '../services/UserService';
import { useToast } from '../contexts/ToastContext';

interface EmailVerificationScreenProps {
  onVerificationComplete: () => void;
  onBackToLogin: () => void;
  actionCode?: string; // For handling verification links
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ 
  onVerificationComplete, 
  onBackToLogin,
  actionCode 
}) => {
  const { showSuccess } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [verificationCooldown, setVerificationCooldown] = useState(0);

  useEffect(() => {
    // If actionCode is provided, automatically verify the email
    if (actionCode) {
      handleVerifyEmail(actionCode);
    }
  }, [actionCode]);

  // Handle countdown timer
  useEffect(() => {
    if (verificationCooldown > 0) {
      const timer = setTimeout(() => {
        setVerificationCooldown(verificationCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationCooldown]);

  const handleVerifyEmail = async (code: string) => {
    setIsVerifying(true);
    try {
      const result = await UserService.verifyEmail(code);
      if (result.success) {
        setVerificationStatus('success');
        showSuccess(result.message);
        setTimeout(() => {
          onVerificationComplete();
        }, 2000);
      } else {
        setVerificationStatus('error');
        Alert.alert('Verification Failed', result.message);
      }
    } catch (error) {
      setVerificationStatus('error');
      Alert.alert('Error', 'Failed to verify email');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEmailApp = () => {
    // Try to open the default email app
    Linking.openURL('mailto:');
  };

  // Log when the resend button's disabled state changes
  useEffect(() => {
  }, [isLoading, verificationCooldown]);

  if (verificationStatus === 'success') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F8FD" />
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={80} color="#10B981" />
          </View>
          <Text style={styles.title}>Email Verified!</Text>
          <Text style={styles.subtitle}>Your account has been successfully verified. You can now sign in.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onVerificationComplete}>
            <Text style={styles.primaryButtonText}>Continue to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F8FD" />
        <View style={styles.content}>
          <View style={styles.errorIcon}>
            <MaterialIcons name="error" size={80} color="#EF4444" />
          </View>
          <Text style={styles.title}>Verification Failed</Text>
          <Text style={styles.subtitle}>The verification link is invalid or has expired. Please request a new one.</Text>
          <TouchableOpacity 
            style={[styles.primaryButton, (isLoading || verificationCooldown > 0) && styles.primaryButtonDisabled]} 
            onPress={handleResendVerification} 
            disabled={isLoading || verificationCooldown > 0}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Sending...' : 
               verificationCooldown > 0 ? `Wait ${verificationCooldown}s` : 
               'Resend Verification Email'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onBackToLogin}>
            <Text style={styles.secondaryButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
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
          <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
            <MaterialIcons name="arrow-back" size={24} color="#2563EB" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="email" size={32} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>We've sent a verification link to your email address</Text>
        </View>

        {/* Verification Instructions */}
        <View style={styles.formContainer}>
          <View style={styles.instructionContainer}>
            <MaterialIcons name="info" size={24} color="#2563EB" />
            <Text style={styles.instructionText}>
              Please check your email and click the verification link to activate your account.
            </Text>
          </View>

          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>What to do next:</Text>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Check your email inbox (and spam folder)</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Click the verification link in the email</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Return to the app and sign in</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.emailButton} onPress={handleOpenEmailApp}>
            <MaterialIcons name="email" size={20} color="#2563EB" />
            <Text style={styles.emailButtonText}>Open Email App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, (isLoading || verificationCooldown > 0) && styles.primaryButtonDisabled]}
            onPress={handleResendVerification}
            disabled={isLoading || verificationCooldown > 0}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Sending...' : 
               verificationCooldown > 0 ? `Wait ${verificationCooldown}s` : 
               'Resend Verification Email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onBackToLogin}>
            <Text style={styles.secondaryButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>

        {isVerifying && (
          <View style={styles.verifyingContainer}>
            <Text style={styles.verifyingText}>Verifying your email...</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successIcon: {
    marginBottom: 24,
  },
  errorIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 8,
  },
  emailButtonText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  verifyingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EmailVerificationScreen; 