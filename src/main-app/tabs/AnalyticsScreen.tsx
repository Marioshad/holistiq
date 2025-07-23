import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const AnalyticsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.mainCard}>
          <Card.Content>
            <View style={styles.iconContainer}>
              <MaterialIcons name="analytics" size={64} color="#2563EB" />
            </View>
            <Title style={styles.title}>Analytics Dashboard</Title>
            <Paragraph style={styles.description}>
              Get detailed insights and track your progress with comprehensive analytics 
              for all your healthy habits and productivity goals.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.featuresCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Coming Soon</Title>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <MaterialIcons name="show-chart" size={24} color="#10B981" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Progress Tracking</Text>
                  <Text style={styles.featureDescription}>
                    Monitor completion rates and trends over time
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <MaterialIcons name="bar-chart" size={24} color="#3B82F6" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Visual Reports</Text>
                  <Text style={styles.featureDescription}>
                    Interactive charts and graphs for better insights
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <MaterialIcons name="emoji-events" size={24} color="#F59E0B" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Goal Achievement</Text>
                  <Text style={styles.featureDescription}>
                    Track milestone completions and streaks
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <MaterialIcons name="insights" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Smart Insights</Text>
                  <Text style={styles.featureDescription}>
                    AI-powered recommendations and patterns
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <MaterialIcons name="calendar-today" size={24} color="#EF4444" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Time Analytics</Text>
                  <Text style={styles.featureDescription}>
                    Optimize your daily schedule and habits
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <MaterialIcons name="construction" size={32} color="#F59E0B" />
              <View style={styles.statusInfo}>
                <Title style={styles.statusTitle}>In Development</Title>
                <Paragraph style={styles.statusText}>
                  Our team is working hard to bring you powerful analytics features. 
                  Stay tuned for the next update!
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
      },
    }),
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
    backgroundColor: '#F8FAFC',
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
  statusCard: {
    margin: 16,
    marginTop: 4,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FED7AA',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
    }),
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
    color: '#92400E',
  },
  statusText: {
    fontSize: 14,
    color: '#A16207',
    lineHeight: 20,
  },
});

export default AnalyticsScreen; 