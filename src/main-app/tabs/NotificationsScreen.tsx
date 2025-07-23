import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const NotificationsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.mainCard}>
          <Card.Content>
            <View style={styles.iconContainer}>
              <MaterialIcons name="notifications" size={64} color="#2563EB" />
            </View>
            <Title style={styles.title}>Smart Notifications</Title>
            <Paragraph style={styles.description}>
              Stay on track with intelligent reminders and notifications 
              tailored to your habits and schedule.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.featuresCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Notification Types</Title>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#FEF2F2' }]}>
                  <MaterialIcons name="restaurant" size={24} color="#EF4444" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Meal Planning</Text>
                  <Text style={styles.featureDescription}>
                    Gentle reminders for meal prep and nutrition goals
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#F0FDFA' }]}>
                  <MaterialIcons name="local-pharmacy" size={24} color="#059669" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Health & Supplements</Text>
                  <Text style={styles.featureDescription}>
                    Scheduled alerts for medications and vitamins
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialIcons name="fitness-center" size={24} color="#2563EB" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Exercise & Fitness</Text>
                  <Text style={styles.featureDescription}>
                    Workout reminders and activity prompts
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#F0FDF4' }]}>
                  <MaterialIcons name="accessibility" size={24} color="#16A34A" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Wellness & Recovery</Text>
                  <Text style={styles.featureDescription}>
                    Mindfulness breaks and stretching sessions
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#FFFBEB' }]}>
                  <MaterialIcons name="calendar-today" size={24} color="#D97706" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Weekly Reviews</Text>
                  <Text style={styles.featureDescription}>
                    Progress check-ins and goal planning sessions
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Smart Features</Title>
            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <MaterialIcons name="schedule" size={20} color="#6B7280" />
                <Text style={styles.settingText}>Adaptive timing based on your schedule</Text>
              </View>
              <View style={styles.settingItem}>
                <MaterialIcons name="psychology" size={20} color="#6B7280" />
                <Text style={styles.settingText}>AI-powered frequency optimization</Text>
              </View>
              <View style={styles.settingItem}>
                <MaterialIcons name="snooze" size={20} color="#6B7280" />
                <Text style={styles.settingText}>Intelligent snooze suggestions</Text>
              </View>
              <View style={styles.settingItem}>
                <MaterialIcons name="show-chart" size={20} color="#6B7280" />
                <Text style={styles.settingText}>Progress-based adjustments</Text>
              </View>
              <View style={styles.settingItem}>
                <MaterialIcons name="do-not-disturb" size={20} color="#6B7280" />
                <Text style={styles.settingText}>Smart quiet hours detection</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <MaterialIcons name="build" size={32} color="#7C3AED" />
              <View style={styles.statusInfo}>
                <Title style={styles.statusTitle}>Coming Soon</Title>
                <Paragraph style={styles.statusText}>
                  We're crafting the perfect notification system that learns from your habits 
                  and helps you stay motivated without being intrusive.
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>
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
  mainCard: {
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  featuresCard: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1F2937',
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  settingsCard: {
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
  settingsList: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  settingText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  statusCard: {
    margin: 16,
    marginTop: 4,
    borderRadius: 20,
    backgroundColor: '#F4F3FF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#5B21B6',
  },
  statusText: {
    fontSize: 14,
    color: '#6D28D9',
    lineHeight: 20,
  },
});

export default NotificationsScreen; 