import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DebugOverlayProps {
  filename: string;
  type?: 'screen' | 'component';
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({ filename, type = 'component' }) => {
  return (
    <View style={[styles.container, type === 'screen' ? styles.screenContainer : styles.componentContainer]}>
      <Text style={[styles.text, type === 'screen' ? styles.screenText : styles.componentText]}>
        {type === 'screen' ? '📱' : '🧩'} {filename}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  screenContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)', // Red background for screens
    borderBottomWidth: 1,
    borderBottomColor: '#DC2626',
  },
  componentContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)', // Blue background for components
    borderBottomWidth: 1,
    borderBottomColor: '#2563EB',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  screenText: {
    fontSize: 14,
  },
  componentText: {
    fontSize: 12,
  },
});

export default DebugOverlay; 