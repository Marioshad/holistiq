import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
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
  modalStyles,
} from '../../styles/styleGuide';

interface FormPickerProps {
  label?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  value?: string;
  placeholder?: string;
  options: Array<{ label: string; value: string }>;
  onValueChange: (value: string) => void;
  error?: string;
  required?: boolean;
  containerStyle?: any;
  labelStyle?: any;
  disabled?: boolean;
}

const FormPicker: React.FC<FormPickerProps> = ({
  label,
  icon,
  value,
  placeholder = 'Select an option',
  options,
  onValueChange,
  error,
  required = false,
  containerStyle,
  labelStyle,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: colors.primary, ...shadows.md }]}>
              <MaterialIcons name={icon} size={20} color={colors.card} />
            </View>
          )}
          <Text style={[inputStyles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.pickerButton,
          error && inputStyles.error,
          disabled && styles.pickerButtonDisabled,
        ]}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={styles.pickerContent}>
          <Text style={[inputStyles.text, !selectedOption && styles.placeholderText]}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <View style={[styles.arrowContainer, { 
            width: 40, 
            height: 40, 
            borderRadius: borderRadius.xl, 
            backgroundColor: colors.border, 
            alignItems: 'center' as const, 
            justifyContent: 'center' as const, 
            ...shadows.sm 
          }]}>
            <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
      
      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Modal for picker options */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsVisible(false)}
          />
          
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOptionItem,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={[
                    styles.optionText,
                    item.value === value && styles.selectedOptionText,
                  ]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <View style={[styles.checkContainer, { 
                      width: 40, 
                      height: 40, 
                      borderRadius: borderRadius.xl, 
                      backgroundColor: colors.primary, 
                      alignItems: 'center' as const, 
                      justifyContent: 'center' as const, 
                      ...shadows.md 
                    }]}>
                      <MaterialIcons name="check" size={20} color={colors.card} />
                    </View>
                  )}
                </TouchableOpacity>
              )}
              style={styles.optionsList}
            />
          </View>
        </View>
      </Modal>
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
    marginBottom: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  required: {
    color: colors.error,
    fontWeight: typography.bold,
  },
  pickerButton: {
    ...inputStyles.base,
  },
  pickerButtonDisabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.border,
    opacity: 0.6,
    ...shadows.sm,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  arrowContainer: {
    marginLeft: spacing.md,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: modalStyles.backdrop.backgroundColor,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    width: '80%',
    maxWidth: 400,
    maxHeight: '60%',
    paddingBottom: spacing.lg,
    ...shadows.xl,
  },
  modalHeader: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: typography.letterWide,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedOptionItem: {
    backgroundColor: colors.divider,
  },
  optionText: {
    fontSize: typography.base,
    color: colors.text,
    fontWeight: typography.medium,
    letterSpacing: typography.letterNormal,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  checkContainer: {
    marginLeft: spacing.md,
  },
});

export default FormPicker; 