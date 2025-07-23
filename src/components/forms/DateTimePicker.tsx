import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DebugOverlay from '../DebugOverlay';
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

interface DateTimePickerProps {
  mode: 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
  minimumDate?: string;
  maximumDate?: string;
  placeholder?: string;
  style?: any;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  mode,
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder,
  style,
}) => {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [tempTime, setTempTime] = useState(value || '09:00');

  const formatDisplayValue = (val: string) => {
    if (!val) return placeholder || (mode === 'date' ? 'Select date' : 'Select time');
    
    if (mode === 'date') {
      const date = new Date(val);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else {
      // Format time to 12-hour format for display
      const [hours, minutes] = val.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    }
  };

  const handleNativeInputChange = (text: string) => {
    onChange(text);
  };

  const generateMaxDate = () => {
    if (maximumDate) return maximumDate;
    
    // Default to 6 months from today for date picker
    if (mode === 'date') {
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 6);
      return maxDate.toISOString().split('T')[0];
    }
    
    return undefined;
  };

  const generateMinDate = () => {
    if (minimumDate) return minimumDate;
    
    // Default to today for date picker
    if (mode === 'date') {
      return new Date().toISOString().split('T')[0];
    }
    
    return undefined;
  };

  const generateHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      hours.push(hour);
    }
    return hours;
  };

  const generateMinutes = () => {
    const minutes = [];
    for (let i = 0; i < 60; i += 15) { // 15-minute intervals
      const minute = i.toString().padStart(2, '0');
      minutes.push(minute);
    }
    return minutes;
  };

  const handleTimeConfirm = () => {
    onChange(tempTime);
    setIsPickerVisible(false);
  };

  const handleTimeCancel = () => {
    setTempTime(value || '09:00');
    setIsPickerVisible(false);
  };

  const renderDatePicker = () => {
    const currentDate = value || new Date().toISOString().split('T')[0];
    const [currentYear, currentMonth, currentDay] = currentDate.split('-');
    
    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
    const months = [
      { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
      { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
      { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
      { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' }
    ];
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

    return (
      <Modal
        visible={isPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsPickerVisible(false)}
          />
          
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerIconContainer}>
                <MaterialIcons name="calendar-today" size={24} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsPickerVisible(false)}
              >
                <MaterialIcons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerBody}>
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Year</Text>
                <View style={styles.scrollContainer}>
                  <ScrollView 
                    style={styles.pickerScrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                  >
                    {years.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.pickerOption,
                          currentYear === String(year) && styles.selectedPickerOption
                        ]}
                        onPress={() => {
                          const newDate = `${year}-${currentMonth}-${currentDay}`;
                          onChange(newDate);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          currentYear === String(year) && styles.selectedPickerOptionText
                        ]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.separatorContainer}>
                <Text style={styles.separatorText}>-</Text>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Month</Text>
                <View style={styles.scrollContainer}>
                  <ScrollView 
                    style={styles.pickerScrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                  >
                    {months.map((month) => (
                      <TouchableOpacity
                        key={month.value}
                        style={[
                          styles.pickerOption,
                          currentMonth === month.value && styles.selectedPickerOption
                        ]}
                        onPress={() => {
                          const newDate = `${currentYear}-${month.value}-${currentDay}`;
                          onChange(newDate);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          currentMonth === month.value && styles.selectedPickerOptionText
                        ]}>
                          {month.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.separatorContainer}>
                <Text style={styles.separatorText}>-</Text>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Day</Text>
                <View style={styles.scrollContainer}>
                  <ScrollView 
                    style={styles.pickerScrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                  >
                    {days.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.pickerOption,
                          currentDay === day && styles.selectedPickerOption
                        ]}
                        onPress={() => {
                          const newDate = `${currentYear}-${currentMonth}-${day}`;
                          onChange(newDate);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          currentDay === day && styles.selectedPickerOptionText
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.footerButton}
                onPress={() => setIsPickerVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.footerButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTimePicker = () => {
    const [currentHour, currentMinute] = tempTime.split(':');
    const hours = generateHours();
    const minutes = generateMinutes();

    return (
      <Modal
        visible={isPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={handleTimeCancel}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleTimeCancel}
          />
          
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerIconContainer}>
                <MaterialIcons name="access-time" size={24} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleTimeCancel}
              >
                <MaterialIcons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerBody}>
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Hour</Text>
                <View style={styles.scrollContainer}>
                  <ScrollView 
                    style={styles.pickerScrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                  >
                    {hours.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.pickerOption,
                          currentHour === hour && styles.selectedPickerOption
                        ]}
                        onPress={() => setTempTime(`${hour}:${currentMinute}`)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          currentHour === hour && styles.selectedPickerOptionText
                        ]}>
                          {hour}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.separatorContainer}>
                <Text style={styles.separatorText}>:</Text>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Minute</Text>
                <View style={styles.scrollContainer}>
                  <ScrollView 
                    style={styles.pickerScrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                  >
                    {minutes.map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.pickerOption,
                          currentMinute === minute && styles.selectedPickerOption
                        ]}
                        onPress={() => setTempTime(`${currentHour}:${minute}`)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          currentMinute === minute && styles.selectedPickerOptionText
                        ]}>
                          {minute}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.footerButton, styles.cancelFooterButton]}
                onPress={handleTimeCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelFooterButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.footerButton}
                onPress={handleTimeConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.footerButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, style]}>      
      {Platform.OS === 'web' ? (
        // Web implementation using HTML5 inputs
        <View style={styles.webContainer}>
          {mode === 'date' ? (
            <input
              style={{
                fontSize: typography.base,
                fontWeight: typography.medium,
                color: colors.text,
                padding: 0,
                border: 'none',
                outline: 'none',
                width: '100%',
                backgroundColor: 'transparent',
              }}
              type="date"
              value={value}
              onChange={(e) => handleNativeInputChange(e.target.value)}
              min={generateMinDate()}
              max={generateMaxDate()}
              placeholder={placeholder || 'Select date'}
            />
          ) : (
            <input
              style={{
                fontSize: typography.base,
                fontWeight: typography.medium,
                color: colors.text,
                padding: 0,
                border: 'none',
                outline: 'none',
                width: '100%',
                backgroundColor: 'transparent',
              }}
              type="time"
              value={value}
              onChange={(e) => handleNativeInputChange(e.target.value)}
              placeholder={placeholder || 'Select time'}
            />
          )}
        </View>
      ) : (
        // Mobile implementation using custom picker
        <>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setIsPickerVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.pickerContent}>
              <View style={styles.iconContainer}>
                <MaterialIcons 
                  name={mode === 'date' ? 'calendar-today' : 'access-time'} 
                  size={20} 
                  color={colors.primary} 
                />
              </View>
              <Text style={styles.pickerText}>
                {formatDisplayValue(value)}
              </Text>
              <View style={styles.arrowContainer}>
                <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
          
          {mode === 'time' && renderTimePicker()}
          {mode === 'date' && renderDatePicker()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  webContainer: {
    ...inputStyles.base,
  },
  webInput: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
    padding: 0,
    letterSpacing: typography.letterNormal,
  },
  pickerButton: {
    ...inputStyles.base,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  pickerText: {
    flex: 1,
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
    marginLeft: spacing.md,
    letterSpacing: typography.letterNormal,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
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
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  modalTitle: {
    ...modalStyles.title,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  pickerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 300,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.base,
    letterSpacing: typography.letterWide,
  },
  scrollContainer: {
    height: 200,
    width: '100%',
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 80,
  },
  pickerOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
    marginVertical: 2,
  },
  selectedPickerOption: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  pickerOptionText: {
    fontSize: typography.base,
    color: colors.text,
    fontWeight: typography.medium,
    letterSpacing: typography.letterNormal,
  },
  selectedPickerOptionText: {
    color: colors.card,
    fontWeight: typography.semibold,
  },
  separatorContainer: {
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separatorText: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.primary,
    marginHorizontal: spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.md,
  },
  cancelFooterButton: {
    backgroundColor: colors.divider,
    ...shadows.sm,
  },
  footerButtonText: {
    color: colors.card,
    fontWeight: typography.semibold,
    fontSize: typography.base,
    letterSpacing: typography.letterWide,
  },
  cancelFooterButtonText: {
    color: colors.textSecondary,
    fontWeight: typography.semibold,
    fontSize: typography.base,
    letterSpacing: typography.letterWide,
  },
});

export default DateTimePicker; 