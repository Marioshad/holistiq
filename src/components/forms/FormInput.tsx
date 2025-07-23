import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  inputStyles,
  iconStyles,
  textStyles,
} from '../../styles/styleGuide';

interface FormInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  error?: string;
  successMessage?: string;
  required?: boolean;
  containerStyle?: any;
  labelStyle?: any;
  inputStyle?: any;
  onClear?: () => void;
  showClearButton?: boolean;
  isValid?: boolean;
  hasInteracted?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  icon,
  error,
  successMessage,
  required = false,
  containerStyle,
  labelStyle,
  inputStyle,
  onClear,
  showClearButton = false,
  value,
  isValid,
  hasInteracted,
  ...textInputProps
}) => {
  // Determine input container style based on validation state
  const getInputContainerStyle = () => {
    if (!hasInteracted) {
      return styles.inputContainer;
    }
    
    if (isValid) {
      return [styles.inputContainer, styles.inputValid];
    } else if (error) {
      return [styles.inputContainer, styles.inputInvalid];
    }
    
    return styles.inputContainer;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          {icon && (
            <View style={[styles.iconContainer, {backgroundColor: colors.card  }]}>
              <MaterialIcons name={icon} size={20} color={colors.primary} />
            </View>
          )}
          <Text style={[inputStyles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      <View 
      style={getInputContainerStyle()}
      >
        <View style={{ borderRadius: 12 }}>
          <TextInput
            {...textInputProps}
            style={[styles.input, inputStyle, { backgroundColor: 'transparent' }]}
            value={value}
            onChangeText={textInputProps.onChangeText}
            placeholder={textInputProps.placeholder}
            placeholderTextColor={textInputProps.placeholderTextColor || '#9CA3AF'}
            secureTextEntry={textInputProps.secureTextEntry}
            autoCapitalize={textInputProps.autoCapitalize}
            autoCorrect={textInputProps.autoCorrect}
            keyboardType={textInputProps.keyboardType}
            editable={textInputProps.editable}
            onBlur={textInputProps.onBlur}
            onFocus={textInputProps.onFocus}
            maxLength={textInputProps.maxLength}
            multiline={textInputProps.multiline}
            numberOfLines={textInputProps.numberOfLines}
            textContentType={textInputProps.textContentType}
            autoComplete={textInputProps.autoComplete}
            importantForAutofill={textInputProps.importantForAutofill}
            testID={textInputProps.testID}
          />
        </View>
        
        {showClearButton && value && value.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={onClear}>
            <MaterialIcons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {successMessage && isValid && hasInteracted && (
        <View style={styles.successContainer}>
          <MaterialIcons name="check-circle" size={16} color={colors.success} />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  inputContainer: {
    ...inputStyles.base,
  },
  inputValid: {
    borderColor: colors.success + '40', // Soft green with 40% opacity
    backgroundColor: colors.success + '08', // Very soft green background
  },
  inputInvalid: {
    borderColor: colors.error + '40', // Soft red with 40% opacity
    backgroundColor: colors.error + '08', // Very soft red background
  },
  required: {
    color: colors.error,
    fontWeight: typography.bold,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
    ...shadows.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingLeft: spacing.xs,
  },
  errorText: {
    fontSize: typography.sm,
    color: colors.error,
    marginLeft: spacing.sm,
    fontWeight: typography.medium,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingLeft: spacing.xs,
  },
  successText: {
    fontSize: typography.sm,
    color: colors.success,
    marginLeft: spacing.sm,
    fontWeight: typography.medium,
  },
  iconContainer: {
    marginRight: spacing.sm,
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    top: -2
  },
});

export default FormInput; 