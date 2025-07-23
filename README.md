# Healthy Habits Tracker

A comprehensive mobile app built with React Native and Expo for tracking daily healthy habits including meals, supplements, stretching, and exercise.

## Features

### 🗓 Daily Calendar View
- Interactive calendar showing current week with swipe/scroll navigation
- Tappable cards for each habit category:
  - **Meal Plan**: Track breakfast, lunch, dinner, and snacks
  - **Supplements**: Manage dosages and track completion
  - **Stretching**: Log stretching sessions and duration
  - **Exercise**: Track workouts and completion status
- Progress indicators showing completion status for each habit type

### 📅 Monthly Planning View
- Monthly calendar grid layout for long-term planning
- Tap any date to add:
  - Detailed notes for the day
  - Personal goals and objectives
  - Checklist items with completion tracking
- Visual indicators for days with content

### 📊 Analytics (Coming Soon)
- Habit completion rate tracking
- Weekly and monthly trend analysis
- Goal achievement statistics
- Progress visualization charts

### 🔔 Notifications (Coming Soon)
- Smart reminders for daily habits
- Customizable notification schedules
- Weekly goal review prompts

## Tech Stack

- **React Native** with Expo SDK 49
- **TypeScript** for type safety
- **React Navigation** for navigation
- **React Native Paper** for UI components
- **React Native Calendars** for calendar functionality
- **AsyncStorage** for local data persistence
- **React Native Vector Icons** for icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd healthy-habits-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web
```

### Development Setup

The app uses Expo for development, which provides:
- Hot reloading for faster development
- Easy device testing with Expo Go app
- Built-in bundling and deployment tools

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── HabitCard.tsx   # Habit display card component
├── screens/            # Main app screens
│   ├── DailyScreen.tsx
│   ├── MonthlyScreen.tsx
│   ├── HabitDetailScreen.tsx
│   ├── MonthlyDetailScreen.tsx
│   ├── AnalyticsScreen.tsx
│   └── NotificationsScreen.tsx
├── services/           # Data and business logic
│   └── StorageService.ts
├── types/             # TypeScript type definitions
│   └── index.ts
└── utils/             # Utility functions
```

## Data Storage

The app uses AsyncStorage for local data persistence with the following structure:

- **Daily Habits**: Stored per date with meal plans, supplements, exercises, and stretching data
- **Monthly Notes**: Goals, notes, and checklists for specific dates
- **User Preferences**: App settings and configurations

### Data Structure

```typescript
interface DailyHabits {
  date: string;
  meals: MealPlan;
  supplements: Supplement[];
  exercises: Exercise[];
  stretching: Stretching[];
  notes?: string;
  goals?: string[];
}

interface MonthlyNote {
  date: string;
  note: string;
  goals: string[];
  checklist: ChecklistItem[];
}
```

## Future Enhancements

The app is designed with scalability in mind for future backend integration:

- **Firebase Integration**: Real-time syncing across devices
- **User Authentication**: Personal accounts and data security
- **Cloud Backup**: Automatic data backup and restore
- **Social Features**: Share progress with friends
- **Advanced Analytics**: Machine learning insights
- **Wearable Integration**: Sync with fitness trackers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email [your-email] or create an issue in the GitHub repository.

---

Built with ❤️ using React Native and Expo 