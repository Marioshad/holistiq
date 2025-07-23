// Holistiq Component Template
// Use this template when creating new components to ensure consistency with the design system

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  // Add other imports as needed
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// Import the style guide
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  buttonStyles,
  cardStyles,
  inputStyles,
  textStyles,
  iconStyles,
} from './styleGuide';

// Component Interface
interface ComponentNameProps {
  title?: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  // Add other props as needed
}

// Component Implementation
const ComponentName: React.FC<ComponentNameProps> = ({
  title = 'Default Title',
  onPress,
  variant = 'primary',
  disabled = false,
  // Destructure other props
}) => {
  // Component logic here
  
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={[iconStyles.base, iconStyles.primary]}>
          <MaterialIcons name="star" size={20} color={colors.card} />
        </View>
        <Text style={textStyles.title}>{title}</Text>
      </View>

      {/* Content Section */}
      <View style={cardStyles.base}>
        <Text style={textStyles.body}>
          This is a template component following the Holistiq design system.
        </Text>
        
        {/* Example Button */}
        <TouchableOpacity
          style={[
            buttonStyles[variant],
            disabled && styles.disabledButton
          ]}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Text style={buttonStyles[`${variant}Text`]}>
            Action Button
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles using the design system
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
    ...shadows.sm, // Reduce shadow for disabled state
  },
  // Add other component-specific styles here
});

export default ComponentName;

/*
🎨 HOLISTIQ STYLE GUIDE CHECKLIST
Use this checklist when creating new components:

✅ COLORS
- Use colors.primary (#8A65F3) for main actions and highlights
- Use colors.secondary (#66B6FF) for info elements
- Use colors.success (#8EF0C9) for positive states
- Use colors.alert (#F17FB1) for warnings/alerts
- Use colors.text (#1E1E1E) for primary text
- Use colors.textSecondary (#888888) for secondary text

✅ TYPOGRAPHY
- Use textStyles.title for main headings (24px, bold)
- Use textStyles.subheader for section headers (18px, semibold)
- Use textStyles.body for regular text (14px, medium)
- Use textStyles.muted for subtle text (12px, normal)
- Always include letterSpacing for better readability

✅ SPACING
- Use spacing.xs (4px) for tight spacing
- Use spacing.sm (8px) for small gaps
- Use spacing.md (12px) for medium spacing
- Use spacing.base (16px) for standard spacing
- Use spacing.lg (20px) for larger spacing
- Use spacing.xl (24px) for extra large spacing

✅ BORDER RADIUS
- Use borderRadius.sm (8px) for small elements
- Use borderRadius.md (12px) for medium elements
- Use borderRadius.lg (16px) for large elements
- Use borderRadius.xl (20px) for extra large elements
- Use borderRadius['2xl'] (24px) for cards
- Use borderRadius.full (30px) for buttons

✅ SHADOWS
- Use shadows.sm for subtle elevation
- Use shadows.md for medium elevation
- Use shadows.lg for high elevation
- Use shadows.xl for maximum elevation

✅ BUTTONS
- Use buttonStyles.primary for main actions
- Use buttonStyles.secondary for secondary actions
- Use buttonStyles.outline for subtle actions
- Use buttonStyles.danger for destructive actions
- Always include activeOpacity={0.8} for touch feedback

✅ CARDS
- Use cardStyles.base for standard cards
- Use cardStyles.header for header sections
- Always include proper padding and shadows

✅ ICONS
- Use iconStyles.base for standard icons
- Use iconStyles.primary for primary actions
- Use iconStyles.secondary for info actions
- Use iconStyles.success for positive actions
- Use iconStyles.alert for warning actions

✅ LAYOUT
- Use flex: 1 for full-width/height containers
- Use flexDirection: 'row' for horizontal layouts
- Use alignItems: 'center' for vertical centering
- Use justifyContent: 'space-between' for distributed layouts
- Use gap for consistent spacing between elements

✅ ACCESSIBILITY
- Include proper disabled states
- Use appropriate touch targets (minimum 44px)
- Provide visual feedback for interactions
- Use semantic color combinations

✅ PERFORMANCE
- Use StyleSheet.create for all styles
- Avoid inline styles when possible
- Use proper component composition
- Implement proper prop types

Remember: Consistency is key! Always refer to this style guide when creating new components.
*/ 