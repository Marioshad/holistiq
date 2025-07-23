import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import UserService from '../../services/UserService';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/styleGuide';

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationCooldown, setVerificationCooldown] = useState(0);

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Handle countdown timer
  useEffect(() => {
    if (verificationCooldown > 0) {
      const timer = setTimeout(() => {
        setVerificationCooldown(verificationCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationCooldown]);

  const loadUserProfile = async () => {
    try {
      const currentUser = await UserService.getCurrentUser();
      setUser(currentUser);
      setIsEmailVerified(UserService.isEmailVerified());
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const result = await UserService.sendEmailVerification();
      if (result.success) {
        Alert.alert('Success', result.message);
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        {/* Email Verification Status */}
        {!isEmailVerified && (
          <View style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              <MaterialIcons name="warning" size={24} color="#F59E0B" />
              <Text style={styles.verificationTitle}>Email Not Verified</Text>
            </View>
            <Text style={styles.verificationText}>
              Please verify your email address to access all features and ensure account security.
            </Text>
            <TouchableOpacity 
              style={[styles.verificationButton, verificationCooldown > 0 && styles.verificationButtonDisabled]} 
              onPress={handleResendVerification}
              disabled={verificationCooldown > 0}
            >
              <MaterialIcons name="email" size={20} color="#FFFFFF" />
              <Text style={styles.verificationButtonText}>
                {verificationCooldown > 0 ? `Wait ${verificationCooldown}s` : 'Resend Verification Email'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.optionItem}>
            <MaterialIcons name="edit" size={24} color={colors.textSecondary} />
            <Text style={styles.optionText}>Edit Profile</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <MaterialIcons name="notifications" size={24} color={colors.textSecondary} />
            <Text style={styles.optionText}>Notifications</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <MaterialIcons name="security" size={24} color={colors.textSecondary} />
            <Text style={styles.optionText}>Privacy & Security</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.1</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  userName: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  verificationCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  verificationTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: '#92400E',
    marginLeft: spacing.sm,
  },
  verificationText: {
    fontSize: typography.base,
    color: '#92400E',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  verificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  verificationButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: '#FFFFFF',
  },
  verificationButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  optionText: {
    flex: 1,
    fontSize: typography.base,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  infoLabel: {
    fontSize: typography.base,
    color: colors.text,
  },
  infoValue: {
    fontSize: typography.base,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
});

export default ProfileScreen; 