export type WorkoutDayId = string;

export interface ExerciseDefinition {
  id: string;
  name: string;
  focus?: string;
  targetSeries: number;
  targetReps: string;
  note?: string;
  category?: string;
  recommendation?: string;
  restSeconds?: number;
  substituteName?: string;
  substituteReps?: string;
  isUsingSubstitute?: boolean;
}

export interface WorkoutDay {
  id: string;
  name: string;
  subtitle?: string;
  tag?: string;
  exercises: ExerciseDefinition[];
}

export interface ExerciseLog {
  completedSets: boolean[];
  weightKg: string;
}

export interface DailyWorkoutProgress {
  date: string; // YYYY-MM-DD
  activeWorkout: string;
  logs: Record<string, ExerciseLog>;
  completedToday: boolean;
  completedAt?: string;
}

export interface WaterState {
  date: string; // YYYY-MM-DD
  currentMl: number;
  goalMl: number;
  history: Array<{ timestamp: string; amount: number }>;
  puddingAwardedToday?: boolean;
}

export interface CreatineState {
  records: Record<string, boolean>; // 'YYYY-MM-DD' -> true
  lastTakenDate: string | null;
  puddingAwardedToday?: boolean;
}

export interface DanceBlock {
  id: string;
  title: string;
  durationSeconds: number; // e.g. 180 for 03:00
  musicUrl?: string; // YouTube / Spotify link
}

export interface DanceState {
  date: string; // YYYY-MM-DD
  customBlocks: DanceBlock[];
  completedToday: boolean;
  completedAt?: string;
  totalMinutesToday: number;
}

export interface DailyHabit {
  id: string;
  title: string;
  icon?: string;
  completedDates: Record<string, boolean>; // 'YYYY-MM-DD' -> true
}

export interface RewardItem {
  id: string;
  title: string;
  cost: number; // Puddings
  description?: string;
  icon?: string;
}

export interface WorkoutHistoryItem {
  id: string;
  date: string;
  workoutId: string;
  workoutName: string;
  type: 'musculacao' | 'danca';
  completedAt: string;
  totalSets?: number;
  durationMinutes?: number;
}

export interface PurinBackupData {
  version: number;
  exportedAt: string;
  workouts: Record<string, WorkoutDay>;
  workoutTabsOrder: string[];
  workoutProgress: DailyWorkoutProgress;
  workoutHistory: WorkoutHistoryItem[];
  waterState: WaterState;
  creatineState: CreatineState;
  danceState: DanceState;
  dailyHabits: DailyHabit[];
  puddingBalance: number;
  customRewards: RewardItem[];
  lastActiveDate: string;
}
