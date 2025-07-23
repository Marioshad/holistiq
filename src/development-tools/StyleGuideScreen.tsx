import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import DebugOverlay from '../components/DebugOverlay';
import { useToast } from '../contexts/ToastContext';
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
  tagStyles,
  gradients,
} from '../styles/styleGuide';

const StyleGuideScreen: React.FC = () => {
  const openTemplateFile = () => {
    // In a real app, you might want to open the file in the editor
    // For now, we'll just show an alert
    alert('Template file: src/styles/componentTemplate.tsx\n\nCopy this file to start building new components!');
  };

  const openStyleGuideFile = () => {
    alert('Style Guide file: src/styles/styleGuide.ts\n\nThis contains all design tokens and pre-built styles!');
  };

  const { showSuccess, showError, showInfo, showWarning } = useToast();

  return (
    <SafeAreaView style={styles.container}>
      
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={openTemplateFile}
              activeOpacity={0.8}
            >
              <View style={[iconStyles.base, iconStyles.primary]}>
                <MaterialIcons name="content-copy" size={24} color={colors.card} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Component Template</Text>
                <Text style={styles.actionSubtitle}>Copy template for new components</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={openStyleGuideFile}
              activeOpacity={0.8}
            >
              <View style={[iconStyles.base, iconStyles.secondary]}>
                <MaterialIcons name="palette" size={24} color={colors.card} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Design Tokens</Text>
                <Text style={styles.actionSubtitle}>View all colors, spacing, and styles</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Toast Debug Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toast Debug</Text>
          <View style={[styles.card, { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }]}> 
            <TouchableOpacity style={buttonStyles.primary} onPress={() => showSuccess('This is a success toast!', 999999)}>
              <Text style={buttonStyles.primaryText}>Show Success Toast</Text>
            </TouchableOpacity>
            <TouchableOpacity style={buttonStyles.danger} onPress={() => showError('This is an error toast!', 999999)}>
              <Text style={buttonStyles.dangerText}>Show Error Toast</Text>
            </TouchableOpacity>
            <TouchableOpacity style={buttonStyles.secondary} onPress={() => showInfo('This is an info toast!', 999999)}>
              <Text style={buttonStyles.secondaryText}>Show Info Toast</Text>
            </TouchableOpacity>
            <TouchableOpacity style={buttonStyles.outline} onPress={() => showWarning('This is a warning toast!', 999999)}>
              <Text style={buttonStyles.outlineText}>Show Warning Toast</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Color Palette */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Palette</Text>
          
          <View style={styles.card}>
            <View style={styles.colorGrid}>
              <View style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: colors.primary }]} />
                <Text style={styles.colorName}>Primary</Text>
                <Text style={styles.colorValue}>{colors.primary}</Text>
              </View>
              <View style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: colors.secondary }]} />
                <Text style={styles.colorName}>Secondary</Text>
                <Text style={styles.colorValue}>{colors.secondary}</Text>
              </View>
              <View style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: colors.success }]} />
                <Text style={styles.colorName}>Success</Text>
                <Text style={styles.colorValue}>{colors.success}</Text>
              </View>
              <View style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: colors.alert }]} />
                <Text style={styles.colorName}>Alert</Text>
                <Text style={styles.colorValue}>{colors.alert}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Typography */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Typography</Text>
          
          <View style={styles.card}>
            <Text style={textStyles.title}>Title (24px, Bold)</Text>
            <Text style={textStyles.subheader}>Subheader (18px, Semibold)</Text>
            <Text style={textStyles.sectionTitle}>Section Title (16px, Semibold)</Text>
            <Text style={textStyles.body}>Body Text (14px, Medium) - This is the standard text used throughout the app for regular content.</Text>
            <Text style={textStyles.muted}>Muted Text (12px, Normal) - Used for subtle information and secondary content.</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buttons</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={buttonStyles.primary} activeOpacity={0.8}>
              <Text style={buttonStyles.primaryText}>Primary Button</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={buttonStyles.secondary} activeOpacity={0.8}>
              <Text style={buttonStyles.secondaryText}>Secondary Button</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={buttonStyles.outline} activeOpacity={0.8}>
              <Text style={buttonStyles.outlineText}>Outline Button</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={buttonStyles.danger} activeOpacity={0.8}>
              <Text style={buttonStyles.dangerText}>Danger Button</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cards</Text>
          
          <View style={styles.card}>
            <Text style={textStyles.body}>This is a standard card with the base style. It includes proper padding, rounded corners, and subtle shadows.</Text>
          </View>
          
          <View style={cardStyles.header}>
            <Text style={textStyles.title}>Header Card</Text>
            <Text style={textStyles.body}>This card has extra padding and is used for header sections.</Text>
          </View>
        </View>

        {/* Icons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Icons</Text>
          
          <View style={styles.card}>
            <View style={styles.iconGrid}>
              <View style={styles.iconItem}>
                <View style={[iconStyles.base, iconStyles.primary]}>
                  <MaterialIcons name="star" size={20} color={colors.card} />
                </View>
                <Text style={styles.iconLabel}>Primary</Text>
              </View>
              <View style={styles.iconItem}>
                <View style={[iconStyles.base, iconStyles.secondary]}>
                  <MaterialIcons name="info" size={20} color={colors.card} />
                </View>
                <Text style={styles.iconLabel}>Secondary</Text>
              </View>
              <View style={styles.iconItem}>
                <View style={[iconStyles.base, iconStyles.success]}>
                  <MaterialIcons name="check" size={20} color={colors.text} />
                </View>
                <Text style={styles.iconLabel}>Success</Text>
              </View>
              <View style={styles.iconItem}>
                <View style={[iconStyles.base, iconStyles.alert]}>
                  <MaterialIcons name="warning" size={20} color={colors.card} />
                </View>
                <Text style={styles.iconLabel}>Alert</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags & Labels</Text>
          
          <View style={styles.card}>
            <View style={styles.tagGrid}>
              <View style={[tagStyles.base, tagStyles.project]}>
                <Text style={[tagStyles.base, tagStyles.project]}>Project</Text>
              </View>
              <View style={[tagStyles.base, tagStyles.uxDesign]}>
                <Text style={[tagStyles.base, tagStyles.uxDesign]}>UX Design</Text>
              </View>
              <View style={[tagStyles.base, tagStyles.developer]}>
                <Text style={[tagStyles.base, tagStyles.developer]}>Developer</Text>
              </View>
              <View style={[tagStyles.base, tagStyles.alert]}>
                <Text style={[tagStyles.base, tagStyles.alert]}>Alert</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Spacing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spacing Scale</Text>
          
          <View style={styles.card}>
            <View style={styles.spacingItem}>
              <View style={[styles.spacingBar, { width: spacing.xs }]} />
              <Text style={styles.spacingLabel}>xs: {spacing.xs}px</Text>
            </View>
            <View style={styles.spacingItem}>
              <View style={[styles.spacingBar, { width: spacing.sm }]} />
              <Text style={styles.spacingLabel}>sm: {spacing.sm}px</Text>
            </View>
            <View style={styles.spacingItem}>
              <View style={[styles.spacingBar, { width: spacing.md }]} />
              <Text style={styles.spacingLabel}>md: {spacing.md}px</Text>
            </View>
            <View style={styles.spacingItem}>
              <View style={[styles.spacingBar, { width: spacing.base }]} />
              <Text style={styles.spacingLabel}>base: {spacing.base}px</Text>
            </View>
            <View style={styles.spacingItem}>
              <View style={[styles.spacingBar, { width: spacing.lg }]} />
              <Text style={styles.spacingLabel}>lg: {spacing.lg}px</Text>
            </View>
            <View style={styles.spacingItem}>
              <View style={[styles.spacingBar, { width: spacing.xl }]} />
              <Text style={styles.spacingLabel}>xl: {spacing.xl}px</Text>
            </View>
          </View>
        </View>

        {/* Usage Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage Guidelines</Text>
          
          <View style={styles.card}>
            <Text style={textStyles.sectionTitle}>✅ Do's</Text>
            <Text style={textStyles.body}>• Use design tokens instead of hardcoded values</Text>
            <Text style={textStyles.body}>• Follow the spacing scale consistently</Text>
            <Text style={textStyles.body}>• Use semantic color names</Text>
            <Text style={textStyles.body}>• Include proper shadows and borders</Text>
            
            <Text style={[textStyles.sectionTitle, { marginTop: spacing.lg }]}>❌ Don'ts</Text>
            <Text style={textStyles.body}>• Don't use hardcoded colors or spacing</Text>
            <Text style={textStyles.body}>• Don't skip accessibility considerations</Text>
            <Text style={textStyles.body}>• Don't ignore the component template</Text>
            <Text style={textStyles.body}>• Don't create inconsistent layouts</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius['2xl'],
    ...shadows.lg,
  },
  headerTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.card,
    letterSpacing: typography.letterWide,
  },
  headerSubtitle: {
    fontSize: typography.lg,
    color: colors.card,
    marginTop: spacing.sm,
    opacity: 0.9,
    letterSpacing: typography.letterNormal,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  section: {
    marginTop: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: typography.letterWide,
  },
  card: {
    ...cardStyles.base,
    gap: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  actionContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
    letterSpacing: typography.letterWide,
  },
  actionSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  colorItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  colorName: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  colorValue: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  iconItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
  },
  iconLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  spacingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  spacingBar: {
    height: 20,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  spacingLabel: {
    fontSize: typography.sm,
    color: colors.text,
    fontWeight: typography.medium,
  },
});

export default StyleGuideScreen; 