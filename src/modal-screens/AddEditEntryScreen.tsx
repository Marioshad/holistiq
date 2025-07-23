import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import { Entry, EntryCategory, SupplementType, SupplementEntry, NutritionEntry, FitnessEntry, WellnessEntry, HealthEntry, MedicineEntry } from '../types';
import EntryService from '../services/EntryService';
import { ColorPicker } from '../components/forms';
import { FormInput, FormPicker, FormButton } from '../components/forms';
import DebugOverlay from '../components/DebugOverlay';
import UserService from '../services/UserService';

interface AddEditEntryScreenProps {
  navigation?: any;
  route?: {
    params: {
      category: EntryCategory;
      entry?: Entry;
      isEditing?: boolean;
    };
  };
  // For direct usage as a component:
  category?: EntryCategory;
  entry?: Entry;
  isEditing?: boolean;
  onClose?: () => void;
}

const AddEditEntryScreen: React.FC<AddEditEntryScreenProps> = (props) => {
  // Support both navigation/route and direct props
  const category = props.route?.params?.category ?? props.category;
  const entry = props.route?.params?.entry ?? props.entry;
  const isEditing = props.route?.params?.isEditing ?? props.isEditing ?? false;
  const navigation = props.navigation;
  const onClose = props.onClose;

  // Form state
  const [title, setTitle] = useState(entry?.title || '');
  const [label, setLabel] = useState(entry?.label || '');
  const [description, setDescription] = useState(entry?.description || '');
  const [color, setColor] = useState(entry?.color || '');
  const [isLoading, setIsLoading] = useState(false);

  // Supplement/Vitamin specific fields
  const [supplementType, setSupplementType] = useState<SupplementType | ''>((entry as SupplementEntry)?.type || '');
  const [doseAmount, setDoseAmount] = useState(String((entry as SupplementEntry)?.doseAmount || ''));
  const [doseUnit, setDoseUnit] = useState((entry as SupplementEntry)?.doseUnit || '');

  // Nutrition specific fields
  const [calories, setCalories] = useState(String((entry as NutritionEntry)?.calories || ''));
  const [servingSize, setServingSize] = useState((entry as NutritionEntry)?.servingSize || '');
  const [mealType, setMealType] = useState((entry as NutritionEntry)?.mealType || '');

  // Fitness specific fields
  const [duration, setDuration] = useState(String((entry as FitnessEntry)?.duration || ''));
  const [intensity, setIntensity] = useState((entry as FitnessEntry)?.intensity || '');
  const [muscleGroups, setMuscleGroups] = useState((entry as FitnessEntry)?.muscleGroups?.join(', ') || '');
  const [equipment, setEquipment] = useState((entry as FitnessEntry)?.equipment?.join(', ') || '');
  const [caloriesBurned, setCaloriesBurned] = useState(String((entry as FitnessEntry)?.caloriesBurned || ''));

  // Wellness specific fields
  const [wellnessDuration, setWellnessDuration] = useState(String((entry as WellnessEntry)?.duration || ''));
  const [wellnessType, setWellnessType] = useState((entry as WellnessEntry)?.type || '');
  const [moodBefore, setMoodBefore] = useState((entry as WellnessEntry)?.moodBefore || '');
  const [moodAfter, setMoodAfter] = useState((entry as WellnessEntry)?.moodAfter || '');

  // Health specific fields
  const [healthType, setHealthType] = useState((entry as HealthEntry)?.type || '');
  const [healthDuration, setHealthDuration] = useState(String((entry as HealthEntry)?.duration || ''));
  const [provider, setProvider] = useState((entry as HealthEntry)?.provider || '');

  // Medicine specific fields
  const [medicineType, setMedicineType] = useState((entry as MedicineEntry)?.type || '');
  const [dosage, setDosage] = useState((entry as MedicineEntry)?.dosage || '');
  const [frequency, setFrequency] = useState((entry as MedicineEntry)?.frequency || '');
  const [prescribedBy, setPrescribedBy] = useState((entry as MedicineEntry)?.prescribedBy || '');
  const [refillDate, setRefillDate] = useState((entry as MedicineEntry)?.refillDate || '');

  const categoryTitles = {
    nutrition: 'Nutrition',
    supplements: 'Supplements',
    vitamins: 'Vitamins',
    fitness: 'Fitness',
    wellness: 'Wellness',
    health: 'Health',
    medicine: 'Medicine',
  };

  const supplementTypes: SupplementType[] = [
    'pill', 'capsule', 'tablet', 'powder', 'liquid', 'syrup', 'gummy', 'softgel', 'drops', 'spray'
  ];

  const doseUnits = ['pills', 'capsules', 'tablets', 'scoops', 'ml', 'mg', 'g', 'drops', 'sprays'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const intensityLevels = ['low', 'moderate', 'high'];
  const wellnessTypes = ['meditation', 'breathing', 'journaling', 'reading', 'mindfulness', 'spa', 'massage', 'relaxation', 'selfcare', 'stretching', 'other'];
  const healthTypes = ['checkup', 'medication', 'therapy', 'monitoring', 'other'];
  const medicineTypes = ['prescription', 'over-the-counter', 'emergency', 'other'];
  const moodOptions = ['poor', 'fair', 'good', 'excellent'];

  const getDoseText = (): string => {
    if (!supplementType || !doseAmount || !doseUnit) return '';
    return `${doseAmount} ${doseUnit}`;
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    // Check if user's email is verified
    if (!UserService.isEmailVerified()) {
      Alert.alert(
        'Email Verification Required',
        'Please verify your email address before saving entries. Check your email for a verification link.',
        [
          { text: 'OK', style: 'cancel' },
          { 
            text: 'Resend Email', 
            onPress: async () => {
              try {
                const result = await UserService.sendEmailVerification();
                if (result.success) {
                  // You might want to show a toast here
                  Alert.alert('Success', result.message);
                } else {
                  Alert.alert('Error', result.message);
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to send verification email');
              }
            }
          }
        ]
      );
      return;
    }

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setIsLoading(true);
    try {
      const baseData = {
        title: title.trim(),
        category,
        label: label.trim() || undefined,
        description: description.trim() || undefined,
      };

      let entryData: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>;

      switch (category) {
        case 'supplements':
        case 'vitamins':
          entryData = {
            ...baseData,
            category,
            type: supplementType || undefined,
            doseAmount: doseAmount ? parseInt(doseAmount) : undefined,
            doseUnit: doseUnit || undefined,
            dose: getDoseText() || undefined,
          } as Omit<SupplementEntry, 'id' | 'createdAt' | 'updatedAt'>;
          break;

        case 'nutrition':
          entryData = {
            ...baseData,
            category: 'nutrition',
            calories: calories ? parseInt(calories) : undefined,
            servingSize: servingSize || undefined,
            mealType: mealType as any || undefined,
          } as Omit<NutritionEntry, 'id' | 'createdAt' | 'updatedAt'>;
          break;

        case 'fitness':
          entryData = {
            ...baseData,
            category: 'fitness',
            duration: duration ? parseInt(duration) : undefined,
            intensity: intensity as any || undefined,
            muscleGroups: muscleGroups ? muscleGroups.split(',').map(g => g.trim()).filter(g => g) : undefined,
            equipment: equipment ? equipment.split(',').map(e => e.trim()).filter(e => e) : undefined,
            caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : undefined,
          } as Omit<FitnessEntry, 'id' | 'createdAt' | 'updatedAt'>;
          break;

        case 'wellness':
          entryData = {
            ...baseData,
            category: 'wellness',
            duration: wellnessDuration ? parseInt(wellnessDuration) : undefined,
            type: wellnessType as any || undefined,
            moodBefore: moodBefore as any || undefined,
            moodAfter: moodAfter as any || undefined,
          } as Omit<WellnessEntry, 'id' | 'createdAt' | 'updatedAt'>;
          break;

        case 'health':
          entryData = {
            ...baseData,
            category: 'health',
            type: healthType as any || undefined,
            duration: healthDuration ? parseInt(healthDuration) : undefined,
            provider: provider || undefined,
          } as Omit<HealthEntry, 'id' | 'createdAt' | 'updatedAt'>;
          break;

        case 'medicine':
          entryData = {
            ...baseData,
            category: 'medicine',
            type: medicineType as any || undefined,
            dosage: dosage || undefined,
            frequency: frequency || undefined,
            prescribedBy: prescribedBy || undefined,
            refillDate: refillDate || undefined,
          } as Omit<MedicineEntry, 'id' | 'createdAt' | 'updatedAt'>;
          break;

        default:
          throw new Error('Invalid category');
      }

      if (isEditing && entry) {
        await EntryService.updateEntry(entry.id, entryData);
      } else {
        await EntryService.createEntry(entryData);
      }

      if (navigation) { navigation.goBack(); } else if (onClose) { onClose(); }
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSupplementFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Supplement Details</Text>
      
      <FormPicker
        label="Type"
        value={supplementType}
        onValueChange={(itemValue) => setSupplementType(itemValue as SupplementType)}
        options={supplementTypes.map(type => ({ label: type.charAt(0).toUpperCase() + type.slice(1), value: type }))}
        placeholder="Select type..."
        containerStyle={styles.formPickerContainer}
      />

      {supplementType && (
        <View style={styles.doseContainer}>
          <Text style={styles.label}>Dose</Text>
          <View style={styles.doseInputs}>
            <FormInput
              label="Amount"
              placeholder="Amount"
              value={doseAmount}
              onChangeText={setDoseAmount}
              icon="straighten"
              keyboardType="numeric"
              containerStyle={styles.doseAmountInput}
            />
            <FormPicker
              label="Unit"
              value={doseUnit}
              onValueChange={(itemValue) => setDoseUnit(itemValue)}
              options={doseUnits.map(unit => ({ label: unit, value: unit }))}
              placeholder="Unit"
              containerStyle={styles.doseUnitPicker}
            />
          </View>
          {getDoseText() && (
            <Text style={styles.doseText}>{getDoseText()}</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderNutritionFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Nutrition Details</Text>
      
      <FormInput
        label="Calories"
        placeholder="Enter calories"
        value={calories}
        onChangeText={setCalories}
        icon="local-fire-department"
        keyboardType="numeric"
      />

      <FormInput
        label="Serving Size"
        placeholder="e.g., 1 cup, 100g"
        value={servingSize}
        onChangeText={setServingSize}
        icon="restaurant"
      />

      <FormPicker
        label="Meal Type"
        value={mealType}
        onValueChange={(itemValue) => setMealType(itemValue)}
        options={mealTypes.map(type => ({ label: type.charAt(0).toUpperCase() + type.slice(1), value: type }))}
        placeholder="Select meal type..."
        containerStyle={styles.formPickerContainer}
      />
    </View>
  );

  const renderExerciseFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Exercise Details</Text>
      
      <FormInput
        label="Duration (minutes)"
        placeholder="Enter duration"
        value={duration}
        onChangeText={setDuration}
        icon="timer"
        keyboardType="numeric"
      />

      <FormPicker
        label="Intensity"
        value={intensity}
        onValueChange={(itemValue) => setIntensity(itemValue)}
        options={intensityLevels.map(level => ({ label: level.charAt(0).toUpperCase() + level.slice(1), value: level }))}
        placeholder="Select intensity..."
        containerStyle={styles.formPickerContainer}
      />

      <FormInput
        label="Muscle Groups"
        placeholder="e.g., chest, arms, legs (comma separated)"
        value={muscleGroups}
        onChangeText={setMuscleGroups}
        icon="fitness-center"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        containerStyle={styles.textAreaContainer}
      />

      <FormInput
        label="Equipment"
        placeholder="e.g., dumbbells, barbell (comma separated)"
        value={equipment}
        onChangeText={setEquipment}
        icon="fitness-center"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        containerStyle={styles.textAreaContainer}
      />
    </View>
  );

  const renderFitnessFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Fitness Activity Details</Text>
      
      <FormInput
        label="Duration (minutes)"
        placeholder="Enter duration"
        value={duration}
        onChangeText={setDuration}
        icon="timer"
        keyboardType="numeric"
      />

      <FormPicker
        label="Intensity"
        value={intensity}
        onValueChange={(itemValue) => setIntensity(itemValue)}
        options={intensityLevels.map(level => ({ label: level.charAt(0).toUpperCase() + level.slice(1), value: level }))}
        placeholder="Select intensity..."
        containerStyle={styles.formPickerContainer}
      />

      <FormInput
        label="Muscle Groups"
        placeholder="e.g., chest, back, legs"
        value={muscleGroups}
        onChangeText={setMuscleGroups}
        icon="fitness-center"
      />

      <FormInput
        label="Equipment"
        placeholder="e.g., dumbbells, barbell"
        value={equipment}
        onChangeText={setEquipment}
        icon="fitness-center"
      />

      <FormInput
        label="Calories Burned"
        placeholder="Enter calories burned"
        value={caloriesBurned}
        onChangeText={setCaloriesBurned}
        icon="local-fire-department"
        keyboardType="numeric"
      />
    </View>
  );

  const renderWellnessFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Wellness Activity Details</Text>
      
      <FormInput
        label="Duration (minutes)"
        placeholder="Enter duration"
        value={wellnessDuration}
        onChangeText={setWellnessDuration}
        icon="timer"
        keyboardType="numeric"
      />

      <FormPicker
        label="Type"
        value={wellnessType}
        onValueChange={(itemValue) => setWellnessType(itemValue)}
        options={wellnessTypes.map(type => ({ label: type.charAt(0).toUpperCase() + type.slice(1), value: type }))}
        placeholder="Select type..."
        containerStyle={styles.formPickerContainer}
      />

      <FormPicker
        label="Mood Before"
        value={moodBefore}
        onValueChange={(itemValue) => setMoodBefore(itemValue)}
        options={moodOptions.map(mood => ({ label: mood.charAt(0).toUpperCase() + mood.slice(1), value: mood }))}
        placeholder="Select mood..."
        containerStyle={styles.formPickerContainer}
      />

      <FormPicker
        label="Mood After"
        value={moodAfter}
        onValueChange={(itemValue) => setMoodAfter(itemValue)}
        options={moodOptions.map(mood => ({ label: mood.charAt(0).toUpperCase() + mood.slice(1), value: mood }))}
        placeholder="Select mood..."
        containerStyle={styles.formPickerContainer}
      />
    </View>
  );

  const renderHealthFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Health Activity Details</Text>
      
      <FormPicker
        label="Type"
        value={healthType}
        onValueChange={(itemValue) => setHealthType(itemValue)}
        options={healthTypes.map(type => ({ label: type.charAt(0).toUpperCase() + type.slice(1), value: type }))}
        placeholder="Select type..."
        containerStyle={styles.formPickerContainer}
      />

      <FormInput
        label="Duration (minutes)"
        placeholder="Enter duration"
        value={healthDuration}
        onChangeText={setHealthDuration}
        icon="timer"
        keyboardType="numeric"
      />

      <FormInput
        label="Provider"
        placeholder="Doctor, clinic, etc."
        value={provider}
        onChangeText={setProvider}
        icon="account-circle"
      />
    </View>
  );

  const renderMedicineFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Medicine Details</Text>
      
      <FormPicker
        label="Type"
        value={medicineType}
        onValueChange={(itemValue) => setMedicineType(itemValue)}
        options={medicineTypes.map(type => ({ label: type.charAt(0).toUpperCase() + type.slice(1), value: type }))}
        placeholder="Select type..."
        containerStyle={styles.formPickerContainer}
      />

      <FormInput
        label="Dosage"
        placeholder="e.g., 10mg, 2 tablets"
        value={dosage}
        onChangeText={setDosage}
        icon="medical-services"
      />

      <FormInput
        label="Frequency"
        placeholder="e.g., twice daily, as needed"
        value={frequency}
        onChangeText={setFrequency}
        icon="repeat"
      />

      <FormInput
        label="Prescribed By"
        placeholder="Doctor name"
        value={prescribedBy}
        onChangeText={setPrescribedBy}
        icon="account-circle"
      />

      <FormInput
        label="Refill Date"
        placeholder="YYYY-MM-DD"
        value={refillDate}
        onChangeText={setRefillDate}
        icon="calendar-today"
      />
    </View>
  );

  const renderCategorySpecificFields = () => {
    switch (category) {
      case 'supplements':
        return renderSupplementFields();
      case 'vitamins':
        return renderSupplementFields(); // Vitamins are also supplements
      case 'nutrition':
        return renderNutritionFields();
      case 'fitness':
        return renderFitnessFields();
      case 'wellness':
        return renderWellnessFields();
      case 'health':
        return renderHealthFields();
      case 'medicine':
        return renderMedicineFields();
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={() => navigation.goBack()}
    >
      <View style={styles.modalOverlay}>
        {/* Soft dark overlay */}
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={() => navigation.goBack()}
        />
        
        {/* Bottom sheet container - 3/4 height */}
        <View style={styles.bottomSheetContainer}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {isEditing ? 'Edit' : 'Add'} {categoryTitles[category]}
              </Text>
              <FormButton
                title={isLoading ? 'Saving...' : 'Save'}
                onPress={handleSave}
                variant="primary"
                size="small"
                icon="save"
                loading={isLoading}
                disabled={isLoading}
              />
            </View>

            {/* Content */}
            <KeyboardAvoidingView
              style={styles.content}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <FormInput
            label="Title"
            placeholder="Enter title"
            value={title}
            onChangeText={setTitle}
            icon="edit"
            required
          />

          <FormInput
            label="Label"
            placeholder="Enter label (optional)"
            value={label}
            onChangeText={setLabel}
            icon="label"
          />

          <FormInput
            label="Description"
            placeholder="Enter description (optional)"
            value={description}
            onChangeText={setDescription}
            icon="description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            containerStyle={styles.textAreaContainer}
          />
        </View>

        {/* Category-specific fields will be rendered here */}
        {renderCategorySpecificFields()}


        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <FormButton
            title={isLoading ? 'Saving...' : (isEditing ? 'Update Entry' : 'Create Entry')}
            onPress={handleSave}
            variant="primary"
            size="large"
            icon="save"
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          />
        </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  doseContainer: {
    marginBottom: 16,
  },
  doseInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  doseAmountInput: {
    flex: 1,
  },
  doseUnitPicker: {
    flex: 1,
  },
  dosePreview: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  doseText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bottomSheetContainer: {
    height: '75%', // 3/4 height
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  formPickerContainer: {
    marginBottom: 16,
  },
  textAreaContainer: {
    marginTop: 16,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
});

export default AddEditEntryScreen; 