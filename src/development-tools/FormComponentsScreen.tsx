import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import FormInput from '../components/forms/FormInput';
import FormPicker from '../components/forms/FormPicker';
import FormButton from '../components/forms/FormButton';
import DateTimePicker from '../components/forms/DateTimePicker';
import ColorPicker from '../components/forms/ColorPicker';
import DebugOverlay from '../components/DebugOverlay';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  buttonStyles,
  cardStyles,
  textStyles,
  gradients,
} from '../styles/styleGuide';

const FormComponentsScreen: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const categories = [
    { label: 'Fitness', value: 'fitness' },
    { label: 'Wellness', value: 'wellness' },
    { label: 'Medicine', value: 'medicine' },
    { label: 'Supplements', value: 'supplements' },
    { label: 'Nutrition', value: 'nutrition' },
    { label: 'Vitamins', value: 'vitamins' },
    { label: 'Health', value: 'health' },
  ];

  const sizeOptions = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'xl' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <DebugOverlay filename="FormComponentsScreen.tsx" type="screen" />
      
      <LinearGradient
        colors={[...gradients.primary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Form Components</Text>
        <Text style={styles.headerSubtitle}>Reusable UI Components</Text>
      </LinearGradient>
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Text Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text Inputs</Text>
          
          <View style={cardStyles.base}>
            <FormInput
              label="Full Name"
              icon="person"
              value=""
              onChangeText={() => {}}
              placeholder="Enter your full name"
              required
            />
            
            <FormInput
              label="Email Address"
              icon="email"
              value=""
              onChangeText={() => {}}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <FormInput
              label="Password"
              icon="lock"
              value=""
              onChangeText={() => {}}
              placeholder="Enter your password"
              secureTextEntry
              required
            />

            <FormInput
              label="Search Input"
              icon="search"
              value=""
              onChangeText={() => {}}
              placeholder="Search for something..."
              showClearButton
              onClear={() => {}}
            />

            <FormInput
              label="Description"
              icon="description"
              value=""
              onChangeText={() => {}}
              placeholder="Enter a detailed description"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              containerStyle={styles.textAreaContainer}
            />

            <FormInput
              label="Input with Error"
              icon="error"
              value=""
              onChangeText={() => {}}
              placeholder="This input has an error"
              error="This field is required and cannot be empty"
            />

            <FormInput
              label="Disabled Input"
              icon="block"
              value="Disabled value"
              onChangeText={() => {}}
              placeholder="This input is disabled"
              editable={false}
            />
          </View>
        </View>

        {/* Pickers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickers & Selectors</Text>
          
          <View style={cardStyles.base}>
            <FormPicker
              label="Category Selection"
              icon="category"
              value=""
              options={categories}
              onValueChange={() => {}}
              placeholder="Select a category"
              required
            />

            <FormPicker
              label="Size Selection"
              icon="straighten"
              value=""
              options={sizeOptions}
              onValueChange={() => {}}
              placeholder="Choose a size"
              required
            />

            <FormPicker
              label="Disabled Picker"
              icon="block"
              value=""
              options={categories}
              onValueChange={() => {}}
              placeholder="This picker is disabled"
              disabled
            />
          </View>
        </View>

        {/* Date & Time Pickers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time Pickers</Text>
          
          <View style={cardStyles.base}>
            <DateTimePicker
              mode="date"
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Select date"
            />
            
            <DateTimePicker
              mode="time"
              value={selectedTime}
              onChange={setSelectedTime}
              placeholder="Select time"
            />
          </View>
        </View>

        {/* Color Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Picker</Text>
          
          <View style={cardStyles.base}>
            <ColorPicker
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buttons</Text>
          
          <View style={cardStyles.base}>
            <View style={styles.buttonGroup}>
              <FormButton
                title="Primary Button"
                onPress={() => {}}
                variant="primary"
                icon="check"
                fullWidth
              />
              
              <FormButton
                title="Secondary Button"
                onPress={() => {}}
                variant="secondary"
                icon="add"
                fullWidth
              />
              
              <FormButton
                title="Outline Button"
                onPress={() => {}}
                variant="outline"
                icon="edit"
                fullWidth
              />
              
              <FormButton
                title="Danger Button"
                onPress={() => {}}
                variant="danger"
                icon="delete"
                fullWidth
              />
            </View>

            <View style={styles.buttonGroup}>
              <Text style={styles.buttonGroupTitle}>Button Sizes</Text>
              
              <FormButton
                title="Small"
                onPress={() => {}}
                size="small"
                icon="star"
              />
              
              <FormButton
                title="Medium"
                onPress={() => {}}
                size="medium"
                icon="star"
              />
              
              <FormButton
                title="Large"
                onPress={() => {}}
                size="large"
                icon="star"
              />
            </View>

            <View style={styles.buttonGroup}>
              <Text style={styles.buttonGroupTitle}>Button States</Text>
              
              <FormButton
                title="Loading Button"
                onPress={() => {}}
                loading
                fullWidth
              />
              
              <FormButton
                title="Disabled Button"
                onPress={() => {}}
                disabled
                fullWidth
              />
            </View>
          </View>
        </View>

        {/* Component Documentation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Component Documentation</Text>
          
          <View style={cardStyles.base}>
            <Text style={styles.docTitle}>FormInput Props</Text>
            <Text style={styles.docText}>
              • label: string - Input label with optional icon{'\n'}
              • icon: MaterialIcons name - Icon to display with label{'\n'}
              • error: string - Error message to display{'\n'}
              • required: boolean - Shows required indicator{'\n'}
              • showClearButton: boolean - Shows clear button when value exists{'\n'}
              • onClear: function - Callback when clear button is pressed
            </Text>

            <Text style={styles.docTitle}>FormPicker Props</Text>
            <Text style={styles.docText}>
              • options: Array of objects with label and value properties{'\n'}
              • onValueChange: function - Callback when value changes{'\n'}
              • placeholder: string - Placeholder text{'\n'}
              • disabled: boolean - Disables the picker
            </Text>

            <Text style={styles.docTitle}>FormButton Props</Text>
            <Text style={styles.docText}>
              • variant: 'primary' | 'secondary' | 'outline' | 'danger'{'\n'}
              • size: 'small' | 'medium' | 'large'{'\n'}
              • icon: MaterialIcons name - Icon to display{'\n'}
              • iconPosition: 'left' | 'right' - Icon position{'\n'}
              • loading: boolean - Shows loading spinner{'\n'}
              • disabled: boolean - Disables the button{'\n'}
              • fullWidth: boolean - Makes button full width
            </Text>
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
    ...shadows.lg,
  },
  headerTitle: {
    ...textStyles.title,
    color: colors.card,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    ...textStyles.body,
    color: colors.card,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...textStyles.sectionTitle,
    marginBottom: spacing.lg,
    paddingLeft: spacing.sm,
  },
  textAreaContainer: {
    marginBottom: spacing.xl,
  },
  buttonGroup: {
    marginBottom: spacing.xl,
  },
  buttonGroupTitle: {
    ...textStyles.subheader,
    marginBottom: spacing.md,
    textAlign: 'center' as const,
  },
  docTitle: {
    ...textStyles.subheader,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  docText: {
    ...textStyles.body,
    lineHeight: typography.lineRelaxed * typography.sm,
  },
});

export default FormComponentsScreen; 