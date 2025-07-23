import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DebugOverlay from '../DebugOverlay';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  style?: object;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorSelect, style }) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#A8E6CF', '#D7BDE2',
  ];

  return (
    <View style={[styles.container, style]}>
      <DebugOverlay filename="ColorPicker.tsx" type="component" />
      
      <Text style={styles.label}>Color</Text>
      
      <View style={styles.colorGrid}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColorOption,
            ]}
            onPress={() => onColorSelect(color)}
            activeOpacity={0.8}
          >
            {selectedColor === color && (
              <View style={styles.checkContainer}>
                <MaterialIcons name="check" size={20} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F0F1FA',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#F0F1FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedColor: {
    borderColor: '#6C63FF',
    borderWidth: 3,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  selectedColorOption: {
    borderColor: '#6C63FF',
    borderWidth: 3,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  checkContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default ColorPicker; 