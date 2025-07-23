export interface HabitData {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
}

export interface MealPlan {
  id: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snacks?: string[];
  notes?: string;
}

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  taken: boolean;
  timeToTake?: string;
}

export interface Exercise {
  id: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'other';
  duration?: number;
  completed: boolean;
  notes?: string;
}

export interface Stretching {
  id: string;
  name: string;
  duration?: number;
  completed: boolean;
  bodyPart?: string;
}

// New Entry Management System Types
export type EntryCategory = 'nutrition' | 'supplements' | 'vitamins' | 'fitness' | 'wellness' | 'health' | 'medicine';

export type SupplementType = 'pill' | 'capsule' | 'tablet' | 'powder' | 'liquid' | 'syrup' | 'gummy' | 'softgel' | 'drops' | 'spray';

export interface BaseEntry {
  id: string;
  title: string;
  category: EntryCategory;
  label?: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplementEntry extends BaseEntry {
  category: 'supplements' | 'vitamins';
  type?: SupplementType;
  dose?: string; // e.g., "2 pills", "10ml", "1 scoop"
  doseUnit?: string; // e.g., "pills", "ml", "mg", "g", "scoops"
  doseAmount?: number; // e.g., 2, 10, 1
}

export interface NutritionEntry extends BaseEntry {
  category: 'nutrition';
  calories?: number;
  servingSize?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface FitnessEntry extends BaseEntry {
  category: 'fitness';
  duration?: number; // in minutes
  intensity?: 'low' | 'moderate' | 'high';
  muscleGroups?: string[];
  equipment?: string[];
  type?: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  caloriesBurned?: number;
}

export interface WellnessEntry extends BaseEntry {
  category: 'wellness';
  duration?: number; // in minutes
  type?: 'meditation' | 'breathing' | 'journaling' | 'reading' | 'mindfulness' | 'spa' | 'massage' | 'relaxation' | 'selfcare' | 'stretching' | 'other';
  moodBefore?: 'poor' | 'fair' | 'good' | 'excellent';
  moodAfter?: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface HealthEntry extends BaseEntry {
  category: 'health';
  type?: 'checkup' | 'medication' | 'therapy' | 'monitoring' | 'other';
  duration?: number; // in minutes
  provider?: string; // doctor, clinic, etc.
}

export interface MedicineEntry extends BaseEntry {
  category: 'medicine';
  type?: 'prescription' | 'over-the-counter' | 'emergency' | 'other';
  dosage?: string;
  frequency?: string; // e.g., "twice daily", "as needed"
  prescribedBy?: string; // doctor name
  refillDate?: string;
  sideEffects?: string[];
}

export type Entry = SupplementEntry | NutritionEntry | FitnessEntry | WellnessEntry | HealthEntry | MedicineEntry;

// Scheduled Activities System Types
export interface ScheduledActivity {
  id: string;
  entryId: string; // References the original Entry by ID
  startDate: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format (optional, for range scheduling)
  time?: string; // Optional time in HH:MM format
  completed: boolean;
  completedAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailySchedule {
  date: string; // YYYY-MM-DD format
  activities: ScheduledActivity[];
}

export type ScheduleStep = 'category' | 'record' | 'schedule' | 'confirm';

export interface ScheduleBottomSheetData {
  step: ScheduleStep;
  selectedCategory?: EntryCategory;
  selectedEntry?: Entry;
  startDate?: string;
  endDate?: string;
  time?: string;
  note?: string;
}

export interface EntryTemplate {
  id: string;
  name: string;
  category: EntryCategory;
  entries: Entry[];
}

export interface DailyHabits {
  date: string; // YYYY-MM-DD format
  meals: MealPlan;
  supplements: Supplement[];
  exercises: Exercise[];
  stretching: Stretching[];
  notes?: string;
  goals?: string[];
}

export interface MonthlyNote {
  date: string; // YYYY-MM-DD format
  note: string;
  goals: string[];
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
    reminderTime: string;
  };
}

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  MainApp: undefined;
  HabitDetail: {
    date: string;
    habitType: 'meals' | 'supplements' | 'exercises' | 'stretching';
  };
  MonthlyDetail: {
    date: string;
  };
  EntryList: {
    category: EntryCategory;
  };
  AddEditEntry: {
    category: EntryCategory;
    entry?: Entry;
    isEditing?: boolean;
  };
  EntryDetail: {
    entry: Entry;
  };
};

export type DrawerParamList = {
  Home: undefined;
  Settings: undefined;
  Profile: undefined;
  About: undefined;
  EntryManagement: undefined;
  FormComponents: undefined; // Development only
  StyleGuide: undefined; // Development only
  AuthDebug: undefined; // Development only - Firebase debugging
};

export type MainTabParamList = {
  Daily: undefined;
  Monthly: undefined;
  Analytics: undefined;
  Notifications: undefined;
}; 