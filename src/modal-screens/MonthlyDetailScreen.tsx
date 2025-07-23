import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, Chip, Appbar, List } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import { RootStackParamList, MonthlyNote, ChecklistItem } from '../types';
import StorageService from '../services/StorageService';

type MonthlyDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MonthlyDetail'>;
type MonthlyDetailScreenRouteProp = RouteProp<RootStackParamList, 'MonthlyDetail'>;

const MonthlyDetailScreen: React.FC = () => {
  const navigation = useNavigation<MonthlyDetailScreenNavigationProp>();
  const route = useRoute<MonthlyDetailScreenRouteProp>();
  const { date } = route.params;

  const [monthlyNote, setMonthlyNote] = useState<MonthlyNote | null>(null);
  const [newGoal, setNewGoal] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthlyNote();
  }, []);

  const loadMonthlyNote = async () => {
    try {
      const note = await StorageService.getOrCreateMonthlyNote(date);
      setMonthlyNote(note);
    } catch (error) {
      Alert.alert('Error', 'Failed to load monthly note');
    } finally {
      setLoading(false);
    }
  };

  const saveMonthlyNote = async () => {
    if (!monthlyNote) return;
    
    try {
      await StorageService.saveMonthlyNote(date, monthlyNote);
      Alert.alert('Success', 'Notes saved successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes');
    }
  };

  const addGoal = () => {
    if (!monthlyNote || !newGoal.trim()) return;
    
    setMonthlyNote({
      ...monthlyNote,
      goals: [...monthlyNote.goals, newGoal.trim()],
    });
    setNewGoal('');
  };

  const removeGoal = (index: number) => {
    if (!monthlyNote) return;
    
    const updatedGoals = monthlyNote.goals.filter((_, i) => i !== index);
    setMonthlyNote({
      ...monthlyNote,
      goals: updatedGoals,
    });
  };

  const addChecklistItem = () => {
    if (!monthlyNote || !newChecklistItem.trim()) return;
    
    const newItem: ChecklistItem = {
      id: StorageService.generateId(),
      text: newChecklistItem.trim(),
      completed: false,
    };
    
    setMonthlyNote({
      ...monthlyNote,
      checklist: [...monthlyNote.checklist, newItem],
    });
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (itemId: string) => {
    if (!monthlyNote) return;
    
    const updatedChecklist = monthlyNote.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    setMonthlyNote({
      ...monthlyNote,
      checklist: updatedChecklist,
    });
  };

  const removeChecklistItem = (itemId: string) => {
    if (!monthlyNote) return;
    
    const updatedChecklist = monthlyNote.checklist.filter(item => item.id !== itemId);
    setMonthlyNote({
      ...monthlyNote,
      checklist: updatedChecklist,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!monthlyNote) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error loading data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Day Details" />
        <Appbar.Action icon="check" onPress={saveMonthlyNote} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.dateText}>
          {new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Daily Notes</Title>
            <TextInput
              label="Add your notes for this day..."
              value={monthlyNote.note}
              onChangeText={(text) => setMonthlyNote({
                ...monthlyNote,
                note: text,
              })}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Goals</Title>
            <View style={styles.inputRow}>
              <TextInput
                label="Add a goal"
                value={newGoal}
                onChangeText={setNewGoal}
                mode="outlined"
                style={styles.flexInput}
              />
              <Button mode="contained" onPress={addGoal} style={styles.addButton}>
                Add
              </Button>
            </View>
            {monthlyNote.goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <Text style={styles.goalText}>{goal}</Text>
                <Button
                  mode="text"
                  onPress={() => removeGoal(index)}
                  textColor="#FF6B6B"
                >
                  Remove
                </Button>
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Checklist</Title>
            <View style={styles.inputRow}>
              <TextInput
                label="Add a task"
                value={newChecklistItem}
                onChangeText={setNewChecklistItem}
                mode="outlined"
                style={styles.flexInput}
              />
              <Button mode="contained" onPress={addChecklistItem} style={styles.addButton}>
                Add
              </Button>
            </View>
            {monthlyNote.checklist.map((item) => (
              <List.Item
                key={item.id}
                title={item.text}
                left={() => (
                  <Chip
                    selected={item.completed}
                    onPress={() => toggleChecklistItem(item.id)}
                    mode="outlined"
                    style={styles.checkbox}
                  >
                    {item.completed ? '✓' : '○'}
                  </Chip>
                )}
                right={() => (
                  <Button
                    mode="text"
                    onPress={() => removeChecklistItem(item.id)}
                    textColor="#FF6B6B"
                  >
                    Remove
                  </Button>
                )}
                style={[
                  styles.checklistItem,
                  item.completed && styles.completedItem,
                ]}
              />
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  flexInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    minWidth: 60,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  goalText: {
    flex: 1,
    fontSize: 16,
  },
  checklistItem: {
    backgroundColor: '#f9f9f9',
    marginBottom: 4,
    borderRadius: 4,
  },
  completedItem: {
    backgroundColor: '#e8f5e8',
  },
  checkbox: {
    marginLeft: 8,
  },
});

export default MonthlyDetailScreen; 