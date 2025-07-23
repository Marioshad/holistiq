import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  cardStyles,
} from '../../styles/styleGuide';

interface PasswordRequirementsProps {
  password: string;
  confirmPassword: string;
  showConfirmPassword?: boolean;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  confirmPassword,
  showConfirmPassword = true,
}) => {
  const requirements = [
    {
      id: 'length6',
      label: 'At least 6 characters',
      isValid: password.length >= 6,
    },
    {
      id: 'length8',
      label: 'At least 8 characters (recommended)',
      isValid: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter',
      isValid: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'Contains lowercase letter',
      isValid: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'Contains number',
      isValid: /\d/.test(password),
    },
    ...(showConfirmPassword ? [{
      id: 'match',
      label: 'Passwords match',
      isValid: password === confirmPassword && confirmPassword.length > 0,
    }] : []),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Password Requirements</Text>
      
      {requirements.map((requirement) => (
        <View key={requirement.id} style={styles.requirement}>
          <MaterialIcons 
            name={requirement.isValid ? 'check-circle' : 'radio-button-unchecked'} 
            size={16} 
            color={requirement.isValid ? colors.success : colors.textSecondary} 
          />
          <Text style={[
            styles.requirementText, 
            requirement.isValid && styles.requirementTextMet
          ]}>
            {requirement.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  requirementText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  requirementTextMet: {
    color: colors.success,
  },
});

export default PasswordRequirements; 