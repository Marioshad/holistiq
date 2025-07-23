# Holistiq Style Guide 🎨

A comprehensive design system for the Holistiq app, ensuring consistency and maintainability across all components.

## 📁 Files

- `styleGuide.ts` - Centralized design tokens and styles
- `componentTemplate.tsx` - Template for creating new components
- `README.md` - This documentation

## 🚀 Quick Start

### 1. Import the Style Guide

```typescript
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
} from '../styles/styleGuide';
```

### 2. Use Design Tokens

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.xl,
    borderRadius: borderRadius['2xl'],
    ...shadows.md,
  },
  title: {
    ...textStyles.title,
    color: colors.primary,
  },
});
```

### 3. Use Pre-built Styles

```typescript
<TouchableOpacity style={buttonStyles.primary}>
  <Text style={buttonStyles.primaryText}>Action</Text>
</TouchableOpacity>

<View style={cardStyles.base}>
  <Text style={textStyles.body}>Content</Text>
</View>
```

## 🎨 Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `colors.primary` | `#8A65F3` | Main actions, buttons, highlights |
| `colors.primaryDark` | `#6A4DD7` | Gradient start, darker accents |
| `colors.secondary` | `#66B6FF` | Info cards, icons, progress tags |
| `colors.alert` | `#F17FB1` | Alert labels, icons, badges |
| `colors.success` | `#8EF0C9` | Success/status colors |
| `colors.background` | `#F8F8FC` | App background |
| `colors.card` | `#FFFFFF` | Cards, buttons |
| `colors.text` | `#1E1E1E` | Primary text |
| `colors.textSecondary` | `#888888` | Secondary text |
| `colors.textMuted` | `#B0B0B0` | Muted text |
| `colors.error` | `#FF6B6B` | Error states |
| `colors.border` | `#F0F0F8` | Light borders |

### Typography

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `typography.xs` | 12px | - | Small labels, tags |
| `typography.sm` | 14px | - | Body text |
| `typography.base` | 16px | - | Default text |
| `typography.lg` | 18px | - | Subheaders |
| `typography.xl` | 20px | - | Large text |
| `typography['2xl']` | 24px | - | Titles |
| `typography['3xl']` | 28px | - | Large titles |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `spacing.xs` | 4px | Tight spacing |
| `spacing.sm` | 8px | Small gaps |
| `spacing.md` | 12px | Medium spacing |
| `spacing.base` | 16px | Standard spacing |
| `spacing.lg` | 20px | Larger spacing |
| `spacing.xl` | 24px | Extra large spacing |
| `spacing['2xl']` | 32px | Very large spacing |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `borderRadius.sm` | 8px | Small elements |
| `borderRadius.md` | 12px | Medium elements |
| `borderRadius.lg` | 16px | Large elements |
| `borderRadius.xl` | 20px | Extra large elements |
| `borderRadius['2xl']` | 24px | Cards |
| `borderRadius.full` | 30px | Buttons |

## 🧩 Pre-built Styles

### Buttons

```typescript
// Primary Button
<TouchableOpacity style={buttonStyles.primary}>
  <Text style={buttonStyles.primaryText}>Primary Action</Text>
</TouchableOpacity>

// Secondary Button
<TouchableOpacity style={buttonStyles.secondary}>
  <Text style={buttonStyles.secondaryText}>Secondary Action</Text>
</TouchableOpacity>

// Outline Button
<TouchableOpacity style={buttonStyles.outline}>
  <Text style={buttonStyles.outlineText}>Outline Action</Text>
</TouchableOpacity>

// Danger Button
<TouchableOpacity style={buttonStyles.danger}>
  <Text style={buttonStyles.dangerText}>Delete</Text>
</TouchableOpacity>
```

### Cards

```typescript
// Standard Card
<View style={cardStyles.base}>
  <Text style={textStyles.body}>Card content</Text>
</View>

// Header Card
<View style={cardStyles.header}>
  <Text style={textStyles.title}>Header content</Text>
</View>
```

### Text Styles

```typescript
<Text style={textStyles.title}>Main Title</Text>
<Text style={textStyles.subheader}>Section Header</Text>
<Text style={textStyles.sectionTitle}>Component Title</Text>
<Text style={textStyles.body}>Regular text content</Text>
<Text style={textStyles.muted}>Subtle text</Text>
```

### Icons

```typescript
// Base Icon
<View style={iconStyles.base}>
  <MaterialIcons name="star" size={20} color={colors.text} />
</View>

// Primary Icon
<View style={iconStyles.primary}>
  <MaterialIcons name="check" size={20} color={colors.card} />
</View>

// Secondary Icon
<View style={iconStyles.secondary}>
  <MaterialIcons name="info" size={20} color={colors.card} />
</View>
```

## 📋 Component Creation Checklist

When creating new components, always follow this checklist:

### ✅ Colors
- [ ] Use `colors.primary` for main actions
- [ ] Use `colors.secondary` for info elements
- [ ] Use `colors.success` for positive states
- [ ] Use `colors.alert` for warnings
- [ ] Use `colors.text` for primary text
- [ ] Use `colors.textSecondary` for secondary text

### ✅ Typography
- [ ] Use `textStyles.title` for main headings
- [ ] Use `textStyles.subheader` for section headers
- [ ] Use `textStyles.body` for regular text
- [ ] Use `textStyles.muted` for subtle text
- [ ] Include proper letter spacing

### ✅ Spacing
- [ ] Use consistent spacing scale
- [ ] Use `spacing.xl` for container padding
- [ ] Use `spacing.md` for element gaps
- [ ] Use `spacing.sm` for tight spacing

### ✅ Layout
- [ ] Use proper flex properties
- [ ] Include proper touch targets (44px minimum)
- [ ] Use semantic color combinations
- [ ] Provide visual feedback for interactions

### ✅ Performance
- [ ] Use `StyleSheet.create` for all styles
- [ ] Avoid inline styles
- [ ] Use proper component composition
- [ ] Implement proper prop types

## 🔄 Migration Guide

When updating existing components to use the style guide:

1. **Import the style guide**
2. **Replace hardcoded colors** with `colors.*` tokens
3. **Replace hardcoded spacing** with `spacing.*` tokens
4. **Replace hardcoded typography** with `textStyles.*` or `typography.*`
5. **Replace hardcoded shadows** with `shadows.*` tokens
6. **Use pre-built styles** where applicable
7. **Test the component** to ensure visual consistency

## 🎯 Best Practices

1. **Always use the style guide** - Never hardcode design values
2. **Be consistent** - Use the same patterns across similar components
3. **Think in tokens** - Use semantic naming over specific values
4. **Test accessibility** - Ensure proper contrast and touch targets
5. **Document changes** - Update this guide when adding new tokens
6. **Use the template** - Start with `componentTemplate.tsx` for new components

## 🐛 Troubleshooting

### Common Issues

1. **TypeScript errors with font weights**
   - Use `as const` for font weight values
   - Ensure proper type definitions

2. **Inconsistent spacing**
   - Always use the spacing scale
   - Avoid magic numbers

3. **Color inconsistencies**
   - Use color tokens instead of hex values
   - Check the color palette for semantic meaning

### Getting Help

- Check the `componentTemplate.tsx` for examples
- Refer to existing components for patterns
- Use the checklist above for validation
- Test components across different screen sizes

---

**Remember: Consistency is key!** Always refer to this style guide when creating or updating components. 🚀 