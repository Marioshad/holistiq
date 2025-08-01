import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  buttonStyles,
} from '../../styles/styleGuide';

interface FormButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const FormButton: React.FC<FormButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    let buttonStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      gap: 8,
    };
    
    // Apply size-specific padding
    switch (size) {
      case 'small':
        buttonStyle = { ...buttonStyle, paddingHorizontal: 16, paddingVertical: 8 };
        break;
      case 'medium':
        buttonStyle = { ...buttonStyle, paddingHorizontal: 20, paddingVertical: 12 };
        break;
      case 'large':
        buttonStyle = { ...buttonStyle, paddingHorizontal: 24, paddingVertical: 16 };
        break;
    }
    
    // Apply variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = { ...buttonStyle, ...buttonStyles.primary };
        break;
      case 'secondary':
        buttonStyle = { ...buttonStyle, ...buttonStyles.secondary };
        break;
      case 'outline':
        buttonStyle = { ...buttonStyle, ...buttonStyles.outline };
        break;
      case 'danger':
        buttonStyle = { ...buttonStyle, ...buttonStyles.danger };
        break;
    }
    
    if (disabled) {
      buttonStyle = { 
        ...buttonStyle, 
        backgroundColor: colors.disabled,
        borderColor: colors.border,
        ...shadows.sm,
      };
    }
    
    if (fullWidth) {
      buttonStyle = { ...buttonStyle, width: '100%' };
    }
    
    return buttonStyle;
  };

  const getTextStyle = (): TextStyle => {
    let textStyleObj: TextStyle = {
      textAlign: 'center',
      letterSpacing: typography.letterWide,
    };
    
    // Apply size-specific font size
    switch (size) {
      case 'small':
        textStyleObj = { ...textStyleObj, fontSize: typography.sm };
        break;
      case 'medium':
        textStyleObj = { ...textStyleObj, fontSize: typography.base };
        break;
      case 'large':
        textStyleObj = { ...textStyleObj, fontSize: typography.lg };
        break;
    }
    
    // Apply variant text styles
    switch (variant) {
      case 'primary':
        textStyleObj = { ...textStyleObj, ...buttonStyles.primaryText };
        break;
      case 'secondary':
        textStyleObj = { ...textStyleObj, ...buttonStyles.secondaryText };
        break;
      case 'outline':
        textStyleObj = { ...textStyleObj, ...buttonStyles.outlineText };
        break;
      case 'danger':
        textStyleObj = { ...textStyleObj, ...buttonStyles.dangerText };
        break;
    }
    
    if (disabled) {
      textStyleObj = { ...textStyleObj, color: colors.textMuted };
    }
    
    return textStyleObj;
  };

  const getIconColor = () => {
    if (disabled) return colors.textMuted;
    
    switch (variant) {
      case 'primary':
        return colors.card;
      case 'secondary':
        return colors.primary;
      case 'outline':
        return colors.primary;
      case 'danger':
        return colors.card;
      default:
        return colors.card;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getIconColor()} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconContainer}>
              <MaterialIcons 
                name={icon} 
                size={getIconSize()} 
                color={getIconColor()} 
              />
            </View>
          )}
          
          <Text style={[getTextStyle(), textStyle]}>
            {title}
          </Text>
          
          {icon && iconPosition === 'right' && (
            <View style={styles.iconContainer}>
              <MaterialIcons 
                name={icon} 
                size={getIconSize()} 
                color={getIconColor()} 
              />
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
});

export default FormButton; 