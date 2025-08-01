import React from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
import { Card, Title, Paragraph, Button, List, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const AboutScreen: React.FC = () => {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerContainer}>
              <MaterialIcons name="favorite" size={64} color="#6200EE" />
              <Title style={styles.appTitle}>Holistiq</Title>
              <Paragraph style={styles.version}>Version 1.0.0</Paragraph>
            </View>
            
            <Paragraph style={styles.description}>
              A comprehensive mobile app designed to help you track and maintain healthy daily habits. 
              Plan your meals, manage supplements, track exercise, and monitor stretching routines all in one place.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Features</Title>
            <List.Item
              title="Daily Habit Tracking"
              description="Track meals, supplements, exercise, and stretching"
              left={props => <List.Icon {...props} icon="calendar-today" />}
            />
            <List.Item
              title="Monthly Planning"
              description="Set goals and make notes for long-term planning"
              left={props => <List.Icon {...props} icon="calendar-month" />}
            />
            <List.Item
              title="Progress Analytics"
              description="View your progress with detailed statistics"
              left={props => <List.Icon {...props} icon="analytics" />}
            />
            <List.Item
              title="Smart Reminders"
              description="Get notified about your daily habits"
              left={props => <List.Icon {...props} icon="notifications" />}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Technology</Title>
            <List.Item
              title="React Native"
              description="Cross-platform mobile development"
              left={props => <List.Icon {...props} icon="phone-android" />}
            />
            <List.Item
              title="Expo"
              description="Streamlined development and deployment"
              left={props => <List.Icon {...props} icon="rocket-launch" />}
            />
            <List.Item
              title="TypeScript"
              description="Type-safe JavaScript development"
              left={props => <List.Icon {...props} icon="code" />}
            />
            <List.Item
              title="AsyncStorage"
              description="Local data persistence"
              left={props => <List.Icon {...props} icon="storage" />}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Support & Feedback</Title>
            <List.Item
              title="Report a Bug"
              description="Help us improve the app"
              left={props => <List.Icon {...props} icon="bug-report" />}
              onPress={() => handleOpenLink('mailto:support@healthyhabits.app?subject=Bug Report')}
            />
            <List.Item
              title="Request a Feature"
              description="Suggest new features"
              left={props => <List.Icon {...props} icon="lightbulb" />}
              onPress={() => handleOpenLink('mailto:support@healthyhabits.app?subject=Feature Request')}
            />
            <List.Item
              title="Rate the App"
              description="Leave a review on the app store"
              left={props => <List.Icon {...props} icon="star" />}
              onPress={() => {}}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Legal</Title>
            <List.Item
              title="Privacy Policy"
              description="How we protect your data"
              left={props => <List.Icon {...props} icon="privacy-tip" />}
              onPress={() => {}}
            />
            <List.Item
              title="Terms of Service"
              description="App usage terms and conditions"
              left={props => <List.Icon {...props} icon="description" />}
              onPress={() => {}}
            />
            <List.Item
              title="Open Source Licenses"
              description="Third-party licenses"
              left={props => <List.Icon {...props} icon="open-in-new" />}
              onPress={() => {}}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Developer</Title>
            <Paragraph style={styles.developerInfo}>
              Built with ❤️ using React Native and Expo
            </Paragraph>
            <Paragraph style={styles.developerInfo}>
              © 2025 Holistiq. All rights reserved.
            </Paragraph>
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
  card: {
    margin: 16,
    marginBottom: 12,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#333',
  },
  developerInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default AboutScreen; 