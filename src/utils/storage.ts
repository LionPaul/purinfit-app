import type {
  WorkoutDay,
  WorkoutHistoryItem,
  DailyWorkoutProgress,
  WaterState,
  CreatineState,
  DanceState,
  DailyHabit,
  RewardItem,
  PurinBackupData,
} from '../types/index.ts';
import {
  getLocalDateString,
  DEFAULT_PRESET_WORKOUTS,
  DEFAULT_DANCE_BLOCKS,
  DEFAULT_REWARDS,
  DEFAULT_DAILY_HABITS,
} from './fitnessLogic.ts';

const KEYS = {
  WORKOUTS: 'purin_workouts_config',
  WORKOUT_TABS: 'purin_workout_tabs_order',
  WORKOUT_PROGRESS: 'purin_workout_today',
  WORKOUT_HISTORY: 'purin_workout_history',
  WATER_STATE: 'purin_water_state',
  CREATINE_STATE: 'purin_creatine_state',
  DANCE_STATE: 'purin_dance_state',
  PUDDING_BALANCE: 'purin_pudding_balance',
  CUSTOM_REWARDS: 'purin_custom_rewards',
  DAILY_HABITS: 'purin_daily_habits',
  LAST_ACTIVE_DATE: 'purin_last_active_date',
};

// Workouts CRUD configuration
export function loadWorkoutsConfig(): Record<string, WorkoutDay> {
  try {
    const raw = localStorage.getItem(KEYS.WORKOUTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error loading workouts config', e);
  }
  return DEFAULT_PRESET_WORKOUTS;
}

export function saveWorkoutsConfig(workouts: Record<string, WorkoutDay>): void {
  try {
    localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
  } catch (e) {
    console.warn('Error saving workouts config', e);
  }
}

export function loadWorkoutTabsOrder(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.WORKOUT_TABS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error loading workout tabs order', e);
  }
  return ['A', 'B', 'C'];
}

export function saveWorkoutTabsOrder(tabs: string[]): void {
  try {
    localStorage.setItem(KEYS.WORKOUT_TABS, JSON.stringify(tabs));
  } catch (e) {
    console.warn('Error saving workout tabs order', e);
  }
}

// Workout today progress
export function loadTodayWorkoutProgress(
  dateStr: string = getLocalDateString(),
  defaultTab: string = 'A'
): DailyWorkoutProgress {
  try {
    const raw = localStorage.getItem(KEYS.WORKOUT_PROGRESS);
    if (raw) {
      const data: DailyWorkoutProgress = JSON.parse(raw);
      if (data && data.date === dateStr) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Error reading workout progress from localStorage', e);
  }

  return {
    date: dateStr,
    activeWorkout: defaultTab,
    logs: {},
    completedToday: false,
  };
}

export function saveTodayWorkoutProgress(progress: DailyWorkoutProgress): void {
  try {
    localStorage.setItem(KEYS.WORKOUT_PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.warn('Error saving workout progress', e);
  }
}

// Workout & Dance History
export function loadWorkoutHistory(): WorkoutHistoryItem[] {
  try {
    const raw = localStorage.getItem(KEYS.WORKOUT_HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading workout history', e);
  }
  return [];
}

export function addWorkoutToHistory(item: WorkoutHistoryItem): WorkoutHistoryItem[] {
  try {
    const history = loadWorkoutHistory();
    const filtered = history.filter(
      (h) => !(h.date === item.date && h.workoutId === item.workoutId && h.type === item.type)
    );
    const updated = [item, ...filtered];
    localStorage.setItem(KEYS.WORKOUT_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Error appending to workout history', e);
    return [];
  }
}

// Water state
export function loadWaterState(dateStr: string = getLocalDateString()): WaterState {
  try {
    const raw = localStorage.getItem(KEYS.WATER_STATE);
    if (raw) {
      const parsed: WaterState = JSON.parse(raw);
      if (parsed && parsed.date === dateStr) {
        return parsed;
      }
      return {
        date: dateStr,
        currentMl: 0,
        goalMl: parsed.goalMl || 2000,
        history: [],
        puddingAwardedToday: false,
      };
    }
  } catch (e) {
    console.warn('Error loading water state', e);
  }

  return {
    date: dateStr,
    currentMl: 0,
    goalMl: 2000,
    history: [],
    puddingAwardedToday: false,
  };
}

export function saveWaterState(state: WaterState): void {
  try {
    localStorage.setItem(KEYS.WATER_STATE, JSON.stringify(state));
  } catch (e) {
    console.warn('Error saving water state', e);
  }
}

// Creatine state
export function loadCreatineState(): CreatineState {
  try {
    const raw = localStorage.getItem(KEYS.CREATINE_STATE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error loading creatine state', e);
  }

  return {
    records: {},
    lastTakenDate: null,
    puddingAwardedToday: false,
  };
}

export function saveCreatineState(state: CreatineState): void {
  try {
    localStorage.setItem(KEYS.CREATINE_STATE, JSON.stringify(state));
  } catch (e) {
    console.warn('Error saving creatine state', e);
  }
}

// Dance State
export function loadDanceState(dateStr: string = getLocalDateString()): DanceState {
  try {
    const raw = localStorage.getItem(KEYS.DANCE_STATE);
    if (raw) {
      const parsed: DanceState = JSON.parse(raw);
      if (parsed) {
        const blocks = parsed.customBlocks && parsed.customBlocks.length > 0
          ? parsed.customBlocks
          : DEFAULT_DANCE_BLOCKS;
        if (parsed.date === dateStr) {
          return {
            ...parsed,
            customBlocks: blocks,
          };
        }
        return {
          date: dateStr,
          customBlocks: blocks,
          completedToday: false,
          totalMinutesToday: 0,
        };
      }
    }
  } catch (e) {
    console.warn('Error loading dance state', e);
  }

  return {
    date: dateStr,
    customBlocks: DEFAULT_DANCE_BLOCKS,
    completedToday: false,
    totalMinutesToday: 0,
  };
}

export function saveDanceState(state: DanceState): void {
  try {
    localStorage.setItem(KEYS.DANCE_STATE, JSON.stringify(state));
  } catch (e) {
    console.warn('Error saving dance state', e);
  }
}

// Pudding Currency (Balance)
export function loadPuddingBalance(): number {
  try {
    const raw = localStorage.getItem(KEYS.PUDDING_BALANCE);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
  } catch (e) {
    console.warn('Error loading pudding balance', e);
  }
  return 2; // Starter gift of 2 puddings for queen
}

export function savePuddingBalance(balance: number): void {
  try {
    localStorage.setItem(KEYS.PUDDING_BALANCE, String(Math.max(0, balance)));
  } catch (e) {
    console.warn('Error saving pudding balance', e);
  }
}

// Custom Rewards List
export function loadCustomRewards(): RewardItem[] {
  try {
    const raw = localStorage.getItem(KEYS.CUSTOM_REWARDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error loading custom rewards', e);
  }
  return DEFAULT_REWARDS;
}

export function saveCustomRewards(rewards: RewardItem[]): void {
  try {
    localStorage.setItem(KEYS.CUSTOM_REWARDS, JSON.stringify(rewards));
  } catch (e) {
    console.warn('Error saving custom rewards', e);
  }
}

// Daily Habits
export function loadDailyHabits(): DailyHabit[] {
  try {
    const raw = localStorage.getItem(KEYS.DAILY_HABITS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error loading daily habits', e);
  }
  return DEFAULT_DAILY_HABITS;
}

export function saveDailyHabits(habits: DailyHabit[]): void {
  try {
    localStorage.setItem(KEYS.DAILY_HABITS, JSON.stringify(habits));
  } catch (e) {
    console.warn('Error saving daily habits', e);
  }
}

// Last Active Date for Midnight Auto-Reset
export function loadLastActiveDate(): string {
  try {
    const raw = localStorage.getItem(KEYS.LAST_ACTIVE_DATE);
    if (raw) return raw;
  } catch (e) {
    console.warn('Error loading last active date', e);
  }
  return getLocalDateString();
}

export function saveLastActiveDate(dateStr: string): void {
  try {
    localStorage.setItem(KEYS.LAST_ACTIVE_DATE, dateStr);
  } catch (e) {
    console.warn('Error saving last active date', e);
  }
}

// Export Full Backup
export function exportPurinBackup(): PurinBackupData {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    workouts: loadWorkoutsConfig(),
    workoutTabsOrder: loadWorkoutTabsOrder(),
    workoutProgress: loadTodayWorkoutProgress(),
    workoutHistory: loadWorkoutHistory(),
    waterState: loadWaterState(),
    creatineState: loadCreatineState(),
    danceState: loadDanceState(),
    dailyHabits: loadDailyHabits(),
    puddingBalance: loadPuddingBalance(),
    customRewards: loadCustomRewards(),
    lastActiveDate: loadLastActiveDate(),
  };
}

// Import Full Backup
export function importPurinBackup(backup: PurinBackupData): boolean {
  try {
    if (!backup || typeof backup !== 'object') return false;

    if (backup.workouts) saveWorkoutsConfig(backup.workouts);
    if (backup.workoutTabsOrder) saveWorkoutTabsOrder(backup.workoutTabsOrder);
    if (backup.workoutProgress) saveTodayWorkoutProgress(backup.workoutProgress);
    if (backup.workoutHistory) {
      localStorage.setItem(KEYS.WORKOUT_HISTORY, JSON.stringify(backup.workoutHistory));
    }
    if (backup.waterState) saveWaterState(backup.waterState);
    if (backup.creatineState) saveCreatineState(backup.creatineState);
    if (backup.danceState) saveDanceState(backup.danceState);
    if (backup.dailyHabits) saveDailyHabits(backup.dailyHabits);
    if (typeof backup.puddingBalance === 'number') savePuddingBalance(backup.puddingBalance);
    if (backup.customRewards) saveCustomRewards(backup.customRewards);
    if (backup.lastActiveDate) saveLastActiveDate(backup.lastActiveDate);

    return true;
  } catch (e) {
    console.error('Error importing Purin backup', e);
    return false;
  }
}
