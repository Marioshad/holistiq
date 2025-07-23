import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList, MonthlyNote } from '../../types';
import StorageService from '../../services/StorageService';

type MonthlyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainApp'>;

const MonthlyScreen: React.FC = () => {
  const navigation = useNavigation<MonthlyScreenNavigationProp>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [monthlyNotes, setMonthlyNotes] = useState<{ [key: string]: MonthlyNote }>({});
  const [currentMonth, setCurrentMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadMonthlyNotes();
  }, [currentMonth]);

  const loadMonthlyNotes = async () => {
    try {
      const year = parseInt(currentMonth.split('-')[0]);
      const month = parseInt(currentMonth.split('-')[1]);
      
      // Load notes for the current month
      const daysInMonth = new Date(year, month, 0).getDate();
      const notes: { [key: string]: MonthlyNote } = {};
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const note = await StorageService.getMonthlyNote(date);
        if (note) {
          notes[date] = note;
        }
      }
      
      setMonthlyNotes(notes);
    } catch (error) {
      Alert.alert('Error', 'Failed to load monthly notes');
    }
  };

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
    navigation.navigate('MonthlyDetail', { date: day.dateString });
  };

  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};
    
    Object.keys(monthlyNotes).forEach(date => {
      const note = monthlyNotes[date];
      if (note.note || note.goals.length > 0 || note.checklist.length > 0) {
        marked[date] = {
          marked: true,
          dotColor: '#2563EB',
        };
      }
    });

    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#2563EB',
      };
    }

    return marked;
  };

  const handleMonthChange = (month: DateData) => {
    setCurrentMonth(month.dateString.slice(0, 7));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.calendarCard}>
          <Card.Content>
            <Calendar
              onDayPress={handleDateSelect}
              onMonthChange={handleMonthChange}
              markedDates={getMarkedDates()}
              theme={{
                selectedDayBackgroundColor: '#2563EB',
                todayTextColor: '#2563EB',
                arrowColor: '#2563EB',
                dotColor: '#2563EB',
                selectedDotColor: '#ffffff',
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#6B7280',
                dayTextColor: '#1F2937',
                monthTextColor: '#1F2937',
                indicatorColor: '#2563EB',
                textDayFontWeight: '500',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
            />
          </Card.Content>
        </Card>

        <Card style={styles.instructionCard}>
          <Card.Content>
            <Title style={styles.instructionTitle}>Monthly Planning</Title>
            <Paragraph style={styles.instructionText}>
              Tap on any date to add notes, set goals, or create checklist items for that day.
              Days with content are marked with a dot.
            </Paragraph>
          </Card.Content>
        </Card>

        {Object.keys(monthlyNotes).length > 0 && (
          <Card style={styles.notesContainerCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Recent Planning</Title>
              {Object.entries(monthlyNotes)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 5)
                .map(([date, note]) => (
                  <Card key={date} style={styles.noteCard}>
                    <Card.Content>
                      <Title style={styles.noteDate}>
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Title>
                      {note.note && (
                        <Paragraph numberOfLines={2} style={styles.noteText}>
                          {note.note}
                        </Paragraph>
                      )}
                      <View style={styles.statsContainer}>
                        {note.goals.length > 0 && (
                          <View style={styles.statPill}>
                            <Text style={styles.statText}>
                              {note.goals.length} Goals
                            </Text>
                          </View>
                        )}
                        {note.checklist.length > 0 && (
                          <View style={styles.statPill}>
                            <Text style={styles.statText}>
                              {note.checklist.filter(item => item.completed).length}/{note.checklist.length} Tasks
                            </Text>
                          </View>
                        )}
                      </View>
                    </Card.Content>
                  </Card>
                ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  scrollView: {
    flex: 1,
  },
  calendarCard: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  instructionCard: {
    margin: 16,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  notesContainerCard: {
    margin: 16,
    marginTop: 4,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1F2937',
  },
  noteCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  noteDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
});

export default MonthlyScreen; 