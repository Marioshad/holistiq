import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { getTimeBasedGreeting } from '../../utils/greetings';
import { colors, typography } from '../../styles/styleGuide';

interface TimeBasedGreetingProps {
  name?: string;
  style?: any;
  variant?: 'header' | 'subtitle' | 'welcome';
}

const TimeBasedGreeting: React.FC<TimeBasedGreetingProps> = ({ 
  name, 
  style, 
  variant = 'header' 
}) => {
  const greeting = getTimeBasedGreeting(name);

  const getTextStyle = () => {
    switch (variant) {
      case 'header':
        return styles.header;
      case 'subtitle':
        return styles.subtitle;
      case 'welcome':
        return styles.welcome;
      default:
        return styles.header;
    }
  };

  return (
    <Text style={[getTextStyle(), style]}>
      {greeting}
    </Text>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
    letterSpacing: typography.letterWide,
  },
  subtitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    letterSpacing: typography.letterNormal,
  },
  welcome: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
    letterSpacing: typography.letterNormal,
  },
});

export default TimeBasedGreeting; 