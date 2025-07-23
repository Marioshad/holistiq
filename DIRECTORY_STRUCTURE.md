# Healthyr App - Directory Structure

## 📁 New Organized Directory Structure

The app has been reorganized into logical categories for better maintainability and developer experience.

### 🏗️ **Root Structure**
```
src/
├── authentication/          # User authentication screens
├── onboarding/             # First-time user experience
├── main-app/               # Main application screens
│   ├── drawer/            # Drawer navigation screens
│   └── tabs/              # Tab navigation screens
├── modal-screens/          # Modal/popup screens
├── development-tools/      # Development and debugging tools
├── components/             # Reusable UI components
├── styles/                 # Design system and styling
├── services/               # Business logic and API calls
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
└── navigation/             # Navigation components
```

### 🔐 **Authentication** (`src/authentication/`)
- `LoginScreen.tsx` - User login interface
- `RegisterScreen.tsx` - User registration interface

### 🎯 **Onboarding** (`src/onboarding/`)
- `OnboardingScreen.tsx` - First-time user introduction

### 📱 **Main App** (`src/main-app/`)

#### **Drawer Screens** (`src/main-app/drawer/`)
- `SettingsScreen.tsx` - App settings and preferences
- `ProfileScreen.tsx` - User profile management
- `AboutScreen.tsx` - App information and credits
- `EntryManagementScreen.tsx` - Health entry management

#### **Tab Screens** (`src/main-app/tabs/`)
- `DailyScreen.tsx` - Daily health tracking
- `MonthlyScreen.tsx` - Monthly overview and planning
- `AnalyticsScreen.tsx` - Health data analytics
- `NotificationsScreen.tsx` - Reminders and notifications

### 🪟 **Modal Screens** (`src/modal-screens/`)
- `HabitDetailScreen.tsx` - Detailed habit view
- `MonthlyDetailScreen.tsx` - Daily detail view
- `EntryListScreen.tsx` - List entries by category
- `AddEditEntryScreen.tsx` - Create or edit health entries
- `EntryDetailsScreen.tsx` - View entry details

### 🛠️ **Development Tools** (`src/development-tools/`)
- `FormComponentsScreen.tsx` - Form component showcase
- `StyleGuideScreen.tsx` - Design system reference

### 🧩 **Components** (`src/components/`)
- `DrawerContent.tsx` - Custom drawer navigation
- `DebugOverlay.tsx` - Development debugging tool
- `forms/` - Form components
  - `FormInput.tsx`
  - `FormPicker.tsx`
  - `FormButton.tsx`
  - `DateTimePicker.tsx`
  - `ColorPicker.tsx`

### 🎨 **Styles** (`src/styles/`)
- `styleGuide.ts` - Centralized design system
- `componentTemplate.tsx` - Component template
- `README.md` - Style guide documentation

### 🔧 **Services** (`src/services/`)
- `UserService.ts` - User authentication and management

### 📝 **Types** (`src/types/`)
- `index.ts` - TypeScript type definitions

### 🧰 **Utils** (`src/utils/`)
- Utility functions and helpers

### 🧭 **Navigation** (`src/navigation/`)
- Navigation-related components

## 🎯 **Benefits of New Structure**

### **1. Logical Organization**
- Screens are grouped by their purpose and navigation type
- Easy to find related functionality
- Clear separation of concerns

### **2. Developer Experience**
- Intuitive file locations
- Reduced cognitive load
- Faster navigation between related files

### **3. Scalability**
- Easy to add new screens in appropriate categories
- Clear patterns for new features
- Maintainable as the app grows

### **4. Team Collaboration**
- New developers can quickly understand the structure
- Consistent organization across the codebase
- Clear ownership of different areas

## 🔄 **Migration Summary**

### **Files Moved:**
- **Authentication:** 2 files → `src/authentication/`
- **Onboarding:** 1 file → `src/onboarding/`
- **Main App Drawer:** 4 files → `src/main-app/drawer/`
- **Main App Tabs:** 4 files → `src/main-app/tabs/`
- **Modal Screens:** 5 files → `src/modal-screens/`
- **Development Tools:** 2 files → `src/development-tools/`

### **Files Updated:**
- `App.tsx` - Updated all import paths
- `app-flow-structure.json` - Updated all file paths
- `DIRECTORY_STRUCTURE.md` - Created comprehensive documentation

### **Directories Removed:**
- `src/screens/` - Replaced with categorized directories

## 🚀 **Next Steps**

1. **Test the app** to ensure all imports work correctly
2. **Update any remaining import paths** in other files if needed
3. **Follow the new structure** for any new screens or components
4. **Use the Style Guide** for consistent design patterns
5. **Reference this documentation** for team onboarding

The new structure provides a clean, organized foundation for the Healthyr app's continued development! 🎉 