import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Card, Title, Chip, Avatar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import { RootStackParamList, DailyHabits, Supplement, Exercise, Stretching } from '../types';
import StorageService from '../services/StorageService';
import { shadows } from '../styles/styleGuide';

type HabitDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HabitDetail'>;
type HabitDetailScreenRouteProp = RouteProp<RootStackParamList, 'HabitDetail'>;

interface Category {
  id: string;
  name: string;
  color: string;
}

const categories: Category[] = [
  { id: 'nutrition', name: 'Nutrition', color: '#FF6B6B' },
  { id: 'health', name: 'Health', color: '#4ECDC4' },
  { id: 'fitness', name: 'Fitness', color: '#45B7D1' },
  { id: 'wellness', name: 'Wellness', color: '#96CEB4' },
  { id: 'lifestyle', name: 'Lifestyle', color: '#FFA07A' },
];

const teamMembers = [
  { id: '1', name: 'John', avatar: '👤' },
  { id: '2', name: 'Sarah', avatar: '👩' },
  { id: '3', name: 'Mike', avatar: '👨' },
];

const HabitDetailScreen: React.FC = () => {
  const navigation = useNavigation<HabitDetailScreenNavigationProp>();
  const route = useRoute<HabitDetailScreenRouteProp>();
  const { date, habitType } = route.params;

  const [dailyHabits, setDailyHabits] = useState<DailyHabits | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('nutrition');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasDeadline, setHasDeadline] = useState<boolean>(true);
  const [assignedMembers, setAssignedMembers] = useState<string[]>(['1']);

  useEffect(() => {
    loadHabitData();
  }, []);

  const loadHabitData = async () => {
    try {
      const habits = await StorageService.getOrCreateDailyHabits(date);
      setDailyHabits(habits);
      
      // Set initial task data based on habit type
      switch (habitType) {
        case 'meals':
          setTaskTitle('Plan Healthy Meals');
          setSelectedCategory('nutrition');
          break;
        case 'supplements':
          setTaskTitle('Take Daily Supplements');
          setSelectedCategory('health');
          break;
        case 'exercises':
          setTaskTitle('Complete Workout Routine');
          setSelectedCategory('fitness');
          break;
        case 'stretching':
          setTaskTitle('Stretching & Mobility');
          setSelectedCategory('wellness');
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load task data');
    } finally {
      setLoading(false);
    }
  };

  const saveTaskData = async () => {
    if (!dailyHabits || !taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    
    try {
      // Update the specific habit based on type
      const updatedHabits = { ...dailyHabits };
      
             switch (habitType) {
         case 'meals':
           if (!updatedHabits.meals) updatedHabits.meals = { 
             id: StorageService.generateId(),
             breakfast: '', 
             lunch: '', 
             dinner: '',
             notes: ''
           };
           updatedHabits.meals.breakfast = taskTitle; // Simplified for demo
           break;
         case 'supplements':
           if (!updatedHabits.supplements) updatedHabits.supplements = [];
           updatedHabits.supplements.push({
             id: StorageService.generateId(),
             name: taskTitle,
             dosage: '1 unit',
             taken: isCompleted,
             timeToTake: ''
           });
           break;
         case 'exercises':
           if (!updatedHabits.exercises) updatedHabits.exercises = [];
           updatedHabits.exercises.push({
             id: StorageService.generateId(),
             name: taskTitle,
             type: 'other',
             duration: 30,
             completed: isCompleted,
           });
           break;
         case 'stretching':
           if (!updatedHabits.stretching) updatedHabits.stretching = [];
           updatedHabits.stretching.push({
             id: StorageService.generateId(),
             name: taskTitle,
             duration: 15,
             completed: isCompleted,
           });
           break;
       }

      await StorageService.saveDailyHabits(date, updatedHabits);
      Alert.alert('Success', 'Task saved successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
    }
  };

  const toggleMemberAssignment = (memberId: string) => {
    setAssignedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.id === selectedCategory) || categories[0];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Task Title Input */}
        <Card style={styles.titleCard}>
          <Card.Content>
            <TextInput
              style={styles.titleInput}
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Enter task title..."
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{
                colors: {
                  background: 'transparent',
                  text: '#1F2937',
                  placeholder: '#9CA3AF',
                }
              }}
            />
          </Card.Content>
        </Card>

        {/* Done Button */}
        <TouchableOpacity
          style={[styles.doneButton, isCompleted && styles.doneButtonCompleted]}
          onPress={() => setIsCompleted(!isCompleted)}
        >
          <MaterialIcons 
            name={isCompleted ? "check-circle" : "radio-button-unchecked"} 
            size={24} 
            color="#FFFFFF" 
          />
          <Text style={styles.doneButtonText}>
            {isCompleted ? 'Completed' : 'Mark as Done'}
          </Text>
        </TouchableOpacity>

        {/* Category Selector */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Category</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryPill,
                      selectedCategory === category.id && styles.selectedCategoryPill,
                      { borderColor: category.color }
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.selectedCategoryText,
                      { color: selectedCategory === category.id ? '#FFFFFF' : category.color }
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.addCategoryButton}>
                  <MaterialIcons name="add" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Team Members */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Assigned To</Title>
            <View style={styles.membersContainer}>
              {teamMembers.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberAvatar,
                    assignedMembers.includes(member.id) && styles.selectedMemberAvatar
                  ]}
                  onPress={() => toggleMemberAssignment(member.id)}
                >
                  <Text style={styles.avatarText}>{member.avatar}</Text>
                  {assignedMembers.includes(member.id) && (
                    <View style={styles.selectedIndicator}>
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addMemberButton}>
                <MaterialIcons name="add" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Deadline */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.deadlineHeader}>
              <Title style={styles.sectionTitle}>Deadline</Title>
              <TouchableOpacity
                style={styles.toggleSwitch}
                onPress={() => setHasDeadline(!hasDeadline)}
              >
                <View style={[
                  styles.switchTrack,
                  hasDeadline && styles.switchTrackActive
                ]}>
                  <View style={[
                    styles.switchThumb,
                    hasDeadline && styles.switchThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
            </View>
            
            {hasDeadline ? (
              <TouchableOpacity style={styles.deadlineCard}>
                <View style={styles.deadlineContent}>
                  <MaterialIcons name="event" size={24} color="#2563EB" />
                  <View style={styles.deadlineInfo}>
                    <Text style={styles.deadlineDate}>
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.deadlineTime}>11:59 PM</Text>
                  </View>
                  <MaterialIcons name="keyboard-arrow-right" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.noDeadlineContainer}>
                <Text style={styles.noDeadlineText}>No deadline set</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveTaskData}
        >
          <MaterialIcons name="save" size={16} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Task</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FD',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  titleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    ...shadows.sm, // Use style guide shadow instead of custom platform logic
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: 'transparent',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 16,
    ...shadows.lg, // Use style guide shadow instead of custom platform logic
  },
  doneButtonCompleted: {
    backgroundColor: '#10B981',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    ...shadows.sm, // Use style guide shadow instead of custom platform logic
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  selectedCategoryPill: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  addCategoryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedMemberAvatar: {
    borderWidth: 3,
    borderColor: '#2563EB',
  },
  avatarText: {
    fontSize: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  deadlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleSwitch: {
    padding: 4,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchTrackActive: {
    backgroundColor: '#2563EB',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    ...shadows.sm, // Use style guide shadow instead of custom platform logic
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  deadlineCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deadlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  deadlineInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deadlineDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  deadlineTime: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  noDeadlineContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noDeadlineText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(138, 101, 243)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 32,
    gap: 8,
    ...shadows.md,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default HabitDetailScreen; 