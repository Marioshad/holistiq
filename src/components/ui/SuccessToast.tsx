import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../styles/styleGuide';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  position?: 'top' | 'bottom';
  type?: 'success' | 'error' | 'info' | 'warning';
}

const { width } = Dimensions.get('window');

const typeConfig = {
  success: {
    backgroundColor: colors.success,
    icon: 'check-circle',
    iconColor: colors.card,
  },
  error: {
    backgroundColor: colors.error,
    icon: 'error',
    iconColor: colors.card,
  },
  info: {
    backgroundColor: colors.info,
    icon: 'info',
    iconColor: colors.card,
  },
  warning: {
    backgroundColor: colors.warning,
    icon: 'warning',
    iconColor: colors.card,
  },
};

const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  onHide,
  duration = 3000,
  position = 'bottom',
  type = 'success',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(position === 'bottom' ? 100 : -100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      const timer = setTimeout(() => {
        hideToast();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === 'bottom' ? 100 : -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;
  const config = typeConfig[type] || typeConfig.success;

  if (visible) console.log('Toast visible:', type, message);

  return (
    <Animated.View
      style={[
        styles.container,
        styles[position],
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: config.backgroundColor }]}> 
        <View style={styles.iconContainer}>
          <MaterialIcons name={config.icon as any} size={24} color={config.iconColor} />
        </View>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
          <MaterialIcons name="close" size={20} color={config.iconColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  top: {
    top: 60, // Account for status bar
  },
  bottom: {
    bottom: 40, // Account for safe area
  },
  toast: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    height:  65,
    ...shadows.lg,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  message: {
    flex: 1,
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.card,
    letterSpacing: typography.letterNormal,
  },
  closeButton: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
});

export default Toast; 