// Holistiq Style Guide - Centralized Design System
// Based on the reference design with modern, clean aesthetics
import { Platform } from 'react-native';

// Color Palette
export const colors = {
  // Primary Colors
  primary: 'rgb(196, 154, 255)', // Updated purple
  secondary: '#66B6FF',
  success: '#4CAF50',
  alert: '#FF6B6B',
  warning: '#FFA726',
  
  // Neutral Colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  background: '#F7F8FD',
  card: '#FFFFFF',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  
  // Status Colors
  error: '#EF4444',
    info: '#3B82F6',
  disabled: '#D1D5DB',
  
  // Gradient Colors
  gradientStart: 'rgb(196, 154, 255)',
  gradientEnd: '#66B6FF',
} as const;

export const typography = {
  // Font Sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  
  // Font Weights
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  
  // Line Heights
  lineTight: 1.2,
  lineNormal: 1.4,
  lineRelaxed: 1.6,
  
  // Letter Spacing
  letterTight: -0.5,
  letterNormal: 0,
  letterWide: 0.5,
  letterWider: 1,
};

export const spacing = {
  // Base spacing scale (4px increments)
  xs: 1,
  sm: 3,
  md: 5,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 30, // For buttons
};

export const shadows = {
  // Light and soft shadows
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    android: {
      elevation: 6,
    },
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),
};

// Button Styles
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: 14,
    paddingHorizontal: 24,
    ...shadows.md,
  },
  primaryText: {
    color: colors.card,
    fontSize: typography.base,
    fontWeight: typography.semibold,
    textAlign: 'center' as const,
    letterSpacing: typography.letterWide,
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  secondaryText: {
    color: colors.primary,
    fontSize: typography.base,
    fontWeight: typography.semibold,
    textAlign: 'center' as const,
    letterSpacing: typography.letterWide,
  },
  outline: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingVertical: 14,
    paddingHorizontal: 24,
    ...shadows.sm,
  },
  outlineText: {
    color: colors.text,
    fontSize: typography.base,
    fontWeight: typography.semibold,
    textAlign: 'center' as const,
    letterSpacing: typography.letterWide,
  },
  danger: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    paddingVertical: 14,
    paddingHorizontal: 24,
    ...shadows.md,
  },
  dangerText: {
    color: colors.card,
    fontSize: typography.base,
    fontWeight: typography.semibold,
    textAlign: 'center' as const,
    letterSpacing: typography.letterWide,
  },
};

// Card Styles
export const cardStyles = {
  base: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    marginVertical: spacing.md,
    ...shadows.md,
  },
  header: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    ...shadows.lg,
  },
};

// Input Styles
export const inputStyles = {
  base: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    paddingHorizontal: 12,
    paddingVertical: 12,
    ...shadows.sm,
  },
  focused: {
    borderColor: colors.primary,
    ...shadows.md,
  },
  error: {
    borderColor: colors.error,
    backgroundColor: '#FEF2F2',
  },
  label: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: typography.letterWide,
  },
  text: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
    letterSpacing: typography.letterNormal,
  },
  placeholder: {
    color: colors.textSecondary,
  },
};

// Tag/Label Styles
export const tagStyles = {
  base: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    fontSize: typography.xs,
    fontWeight: typography.medium,
  },
  project: {
    backgroundColor: colors.primary,
    color: colors.card,
  },
  uxDesign: {
    backgroundColor: colors.secondary,
    color: colors.card,
  },
  developer: {
    backgroundColor: colors.success,
    color: colors.text,
  },
  alert: {
    backgroundColor: colors.alert,
    color: colors.card,
  },
};

// Modal Styles
export const modalStyles = {
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    ...shadows.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
    letterSpacing: typography.letterWide,
  },
};

// Icon Styles
export const iconStyles = {
  base: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  primary: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  secondary: {
    backgroundColor: colors.secondary,
    ...shadows.md,
  },
  success: {
    backgroundColor: colors.success,
    ...shadows.md,
  },
  alert: {
    backgroundColor: colors.alert,
    ...shadows.md,
  },
};

// Typography Styles
export const textStyles = {
  title: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.text,
    letterSpacing: typography.letterWide,
  },
  subheader: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    letterSpacing: typography.letterNormal,
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
    letterSpacing: typography.letterWide,
  },
  body: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.text,
    letterSpacing: typography.letterNormal,
  },
  muted: {
    fontSize: typography.xs,
    fontWeight: typography.normal,
    color: colors.textSecondary,
    letterSpacing: typography.letterNormal,
  },
  textCentered: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    includeFontPadding: Platform.OS === 'android' ? false : undefined,
    textAlignVertical: Platform.OS === 'android' ? 'center' : undefined,
    color: colors.text,
  },
};

// Gradients
export const gradients = {
  primary: ['rgb(196, 154, 255)', '#66B6FF'],
  secondary: ['#66B6FF', '#4CAF50'],
  success: ['#4CAF50', '#45A049'],
  alert: ['#FF6B6B', '#FF5252'],
  warning: ['#FFA726', '#FF9800'],
} as const;

// Animation Durations
export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Z-Index Scale
export const zIndex = {
  base: 1,
  card: 10,
  modal: 100,
  overlay: 200,
  tooltip: 300,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  buttonStyles,
  cardStyles,
  inputStyles,
  tagStyles,
  modalStyles,
  iconStyles,
  textStyles,
  gradients,
  animations,
  zIndex,
}; 