/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Navigation } from './components/Navigation.tsx';
import { Header } from './components/Header.tsx';
import { DanceTab } from './components/DanceTab.tsx';
import { WorkoutTab } from './components/WorkoutTab.tsx';
import { WaterTab } from './components/WaterTab.tsx';
import { CreatineTab } from './components/CreatineTab.tsx';
import { CelebrationModal } from './components/CelebrationModal.tsx';
import { RewardsModal } from './components/RewardsModal.tsx';
import { InfoModal } from './components/InfoModal.tsx';
import { HistoryModal } from './components/HistoryModal.tsx';

import {
  WorkoutDay,
  WorkoutHistoryItem,
  DailyWorkoutProgress,
  WaterState,
  CreatineState,
  DanceState,
  DailyHabit,
  RewardItem,
} from './types/index.ts';

import {
  loadWorkoutsConfig,
  saveWorkoutsConfig,
  loadWorkoutTabsOrder,
  saveWorkoutTabsOrder,
  loadTodayWorkoutProgress,
  saveTodayWorkoutProgress,
  loadWorkoutHistory,
  addWorkoutToHistory,
  loadWaterState,
  saveWaterState,
  loadCreatineState,
  saveCreatineState,
  loadDanceState,
  saveDanceState,
  loadPuddingBalance,
  savePuddingBalance,
  loadCustomRewards,
  saveCustomRewards,
  loadDailyHabits,
  saveDailyHabits,
  loadLastActiveDate,
  saveLastActiveDate,
} from './utils/storage.ts';

import {
  calculateWaterPercentage,
  getLocalDateString,
  DEFAULT_PRESET_WORKOUTS,
} from './utils/fitnessLogic.ts';

import { playCutePop, playCelebrationFanfare } from './utils/audio.ts';

export default function App() {
  const [todayStr, setTodayStr] = useState<string>(() => getLocalDateString());

  // Navigation: 'dance' | 'workout' | 'water' | 'creatine'
  const [activeTab, setActiveTab] = useState<ActiveTab>('dance');

  // Workouts configuration & tabs
  const [workouts, setWorkouts] = useState<Record<string, WorkoutDay>>(() => loadWorkoutsConfig());
  const [workoutTabsOrder, setWorkoutTabsOrder] = useState<string[]>(() => loadWorkoutTabsOrder());

  // Today workout progress
  const [workoutProgress, setWorkoutProgress] = useState<DailyWorkoutProgress>(() =>
    loadTodayWorkoutProgress(getLocalDateString(), loadWorkoutTabsOrder()[0] || 'A')
  );

  // History
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>(() =>
    loadWorkoutHistory()
  );

  // Water State
  const [waterState, setWaterState] = useState<WaterState>(() => loadWaterState(getLocalDateString()));

  // Creatine State
  const [creatineState, setCreatineState] = useState<CreatineState>(() => loadCreatineState());

  // Dance State
  const [danceState, setDanceState] = useState<DanceState>(() => loadDanceState(getLocalDateString()));

  // Daily Habits
  const [dailyHabits, setDailyHabits] = useState<DailyHabit[]>(() => loadDailyHabits());

  // Pudding Currency Balance
  const [puddingBalance, setPuddingBalance] = useState<number>(() => loadPuddingBalance());

  // Rewards List
  const [customRewards, setCustomRewards] = useState<RewardItem[]>(() => loadCustomRewards());

  // Modals
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [celebrationDetails, setCelebrationDetails] = useState<{
    name: string;
    type: 'workout' | 'dance';
    earned: number;
  }>({ name: '', type: 'workout', earned: 2 });

  const [isRewardsOpen, setIsRewardsOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Reload all states from localStorage (e.g. after backup restore)
  const reloadAllStates = useCallback(() => {
    const currentDay = getLocalDateString();
    setTodayStr(currentDay);
    const tabs = loadWorkoutTabsOrder();
    setWorkoutTabsOrder(tabs);
    setWorkouts(loadWorkoutsConfig());
    setWorkoutProgress(loadTodayWorkoutProgress(currentDay, tabs[0] || 'A'));
    setWorkoutHistory(loadWorkoutHistory());
    setWaterState(loadWaterState(currentDay));
    setCreatineState(loadCreatineState());
    setDanceState(loadDanceState(currentDay));
    setDailyHabits(loadDailyHabits());
    setPuddingBalance(loadPuddingBalance());
    setCustomRewards(loadCustomRewards());
  }, []);

  // MIDNIGHT AUTO-RESET MONITOR
  useEffect(() => {
    const checkMidnight = () => {
      const nowDay = getLocalDateString();
      const lastActive = loadLastActiveDate();

      if (lastActive && lastActive !== nowDay) {
        // A new day has begun!
        saveLastActiveDate(nowDay);
        setTodayStr(nowDay);

        // Reset today's water to 0 (preserve goal)
        const freshWater = {
          date: nowDay,
          currentMl: 0,
          goalMl: waterState.goalMl || 2000,
          history: [],
          puddingAwardedToday: false,
        };
        setWaterState(freshWater);
        saveWaterState(freshWater);

        // Reset today's workout progress sets (keep custom loads/workouts)
        const freshWorkoutProgress: DailyWorkoutProgress = {
          date: nowDay,
          activeWorkout: workoutTabsOrder[0] || 'A',
          logs: {},
          completedToday: false,
        };
        setWorkoutProgress(freshWorkoutProgress);
        saveTodayWorkoutProgress(freshWorkoutProgress);

        // Reset dance session for today
        const freshDance: DanceState = {
          date: nowDay,
          customBlocks: danceState.customBlocks,
          completedToday: false,
          totalMinutesToday: 0,
        };
        setDanceState(freshDance);
        saveDanceState(freshDance);

        // Reset creatine pudding awarded for today
        const freshCreatine: CreatineState = {
          ...creatineState,
          puddingAwardedToday: false,
        };
        setCreatineState(freshCreatine);
        saveCreatineState(freshCreatine);
      }
    };

    // Check on mount and periodically every 30 seconds
    checkMidnight();
    const interval = setInterval(checkMidnight, 30000);
    return () => clearInterval(interval);
  }, [waterState.goalMl, workoutTabsOrder, danceState.customBlocks, creatineState]);

  // Award Pudding Points helper
  const handleAwardPuddings = (amount: number, reason: string) => {
    setPuddingBalance((prev) => {
      const updated = prev + amount;
      savePuddingBalance(updated);
      return updated;
    });
  };

  // Deduct Pudding Points helper
  const handleDeductPuddings = (amount: number, reason: string): boolean => {
    if (puddingBalance < amount) return false;
    const updated = Math.max(0, puddingBalance - amount);
    setPuddingBalance(updated);
    savePuddingBalance(updated);
    return true;
  };

  // Workouts CRUD update
  const handleUpdateWorkouts = (newWorkouts: Record<string, WorkoutDay>, newOrder: string[]) => {
    setWorkouts(newWorkouts);
    setWorkoutTabsOrder(newOrder);
    saveWorkoutsConfig(newWorkouts);
    saveWorkoutTabsOrder(newOrder);
  };

  // Workout today progress update
  const handleUpdateWorkoutProgress = (newProgress: DailyWorkoutProgress) => {
    setWorkoutProgress(newProgress);
    saveTodayWorkoutProgress(newProgress);
  };

  // Complete Workout Session
  const handleCompleteWorkout = () => {
    const activeWorkout = workouts[workoutProgress.activeWorkout] || {
      id: workoutProgress.activeWorkout,
      name: `Treino ${workoutProgress.activeWorkout}`,
      exercises: [],
    };
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedProgress: DailyWorkoutProgress = {
      ...workoutProgress,
      completedToday: true,
      completedAt: timeNow,
    };
    handleUpdateWorkoutProgress(updatedProgress);

    const historyItem: WorkoutHistoryItem = {
      id: `w_${todayStr}_${activeWorkout.id}_${Date.now()}`,
      date: todayStr,
      workoutId: activeWorkout.id,
      workoutName: activeWorkout.name + (activeWorkout.subtitle ? ` (${activeWorkout.subtitle})` : ''),
      type: 'musculacao',
      completedAt: timeNow,
      totalSets: activeWorkout.exercises.reduce((acc, ex) => acc + ex.targetSeries, 0),
    };

    const newHistory = addWorkoutToHistory(historyItem);
    setWorkoutHistory(newHistory);

    // Award +2 Puddings
    handleAwardPuddings(2, `Conclusão: ${activeWorkout.name}`);

    // Celebration
    setCelebrationDetails({
      name: activeWorkout.name,
      type: 'workout',
      earned: 2,
    });
    setIsCelebrationOpen(true);
  };

  // Complete Dance Session
  const handleCompleteDance = (minutesDanced: number) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedDance: DanceState = {
      ...danceState,
      completedToday: true,
      completedAt: timeNow,
      totalMinutesToday: (danceState.totalMinutesToday || 0) + minutesDanced,
    };
    setDanceState(updatedDance);
    saveDanceState(updatedDance);

    const historyItem: WorkoutHistoryItem = {
      id: `dance_${todayStr}_${Date.now()}`,
      date: todayStr,
      workoutId: 'danca',
      workoutName: `Dança & Ritmo (${minutesDanced} min)`,
      type: 'danca',
      completedAt: timeNow,
      durationMinutes: minutesDanced,
    };

    const newHistory = addWorkoutToHistory(historyItem);
    setWorkoutHistory(newHistory);

    // Award +2 Puddings
    handleAwardPuddings(2, `Sessão de Dança (${minutesDanced} min)`);

    // Celebration
    setCelebrationDetails({
      name: `Dança Livre & Ritmo (${minutesDanced} min)`,
      type: 'dance',
      earned: 2,
    });
    setIsCelebrationOpen(true);
  };

  // Water update
  const handleUpdateWater = (newWater: WaterState) => {
    setWaterState(newWater);
    saveWaterState(newWater);
  };

  // Creatine update
  const handleUpdateCreatine = (newCreatine: CreatineState) => {
    setCreatineState(newCreatine);
    saveCreatineState(newCreatine);
  };

  // Dance state update
  const handleUpdateDance = (newDance: DanceState) => {
    setDanceState(newDance);
    saveDanceState(newDance);
  };

  // Habits update
  const handleUpdateDailyHabits = (newHabits: DailyHabit[]) => {
    setDailyHabits(newHabits);
    saveDailyHabits(newHabits);
  };

  // Rewards list update
  const handleUpdateRewards = (newRewards: RewardItem[]) => {
    setCustomRewards(newRewards);
    saveCustomRewards(newRewards);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('purin_workout_history');
    setWorkoutHistory([]);
  };

  const waterPercentage = calculateWaterPercentage(waterState.currentMl, waterState.goalMl);
  const creatineDone = Boolean(creatineState.records[todayStr]);

  return (
    <div className="min-h-screen bg-[#FEF9E7] text-[#4A2810] flex flex-col justify-between">
      {/* Mobile-first centered frame */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#FFFDF2] shadow-xl border-x border-[#F3E7C4] relative">
        {/* Header with Pudding Currency Balance */}
        <Header
          onOpenHelp={() => setIsInfoOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenRewards={() => setIsRewardsOpen(true)}
          completedWorkoutsCount={workoutHistory.length}
          puddingBalance={puddingBalance}
        />

        {/* Main Tabs Container */}
        <main className="flex-1 px-4 py-3">
          {activeTab === 'dance' && (
            <DanceTab
              danceState={danceState}
              onUpdateDanceState={handleUpdateDance}
              onCompleteDance={handleCompleteDance}
            />
          )}

          {activeTab === 'workout' && (
            <WorkoutTab
              workouts={workouts}
              workoutTabsOrder={workoutTabsOrder}
              progress={workoutProgress}
              onUpdateWorkouts={handleUpdateWorkouts}
              onUpdateProgress={handleUpdateWorkoutProgress}
              onCompleteWorkout={handleCompleteWorkout}
            />
          )}

          {activeTab === 'water' && (
            <WaterTab
              waterState={waterState}
              onUpdateWater={handleUpdateWater}
              onAwardPudding={handleAwardPuddings}
            />
          )}

          {activeTab === 'creatine' && (
            <CreatineTab
              creatineState={creatineState}
              onUpdateCreatine={handleUpdateCreatine}
              dailyHabits={dailyHabits}
              onUpdateDailyHabits={handleUpdateDailyHabits}
              onAwardPudding={handleAwardPuddings}
            />
          )}
        </main>

        {/* Bottom Navigation with Dance Tab */}
        <Navigation
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          waterPercentage={waterPercentage}
          creatineDone={creatineDone}
        />

        {/* Celebration Modal (Workout or Dance) */}
        <CelebrationModal
          isOpen={isCelebrationOpen}
          onClose={() => setIsCelebrationOpen(false)}
          workoutName={celebrationDetails.name}
          type={celebrationDetails.type}
          earnedPuddings={celebrationDetails.earned}
        />

        {/* Lojinha de Mimos Modal */}
        <RewardsModal
          isOpen={isRewardsOpen}
          onClose={() => setIsRewardsOpen(false)}
          puddingBalance={puddingBalance}
          onDeductPuddings={handleDeductPuddings}
          rewards={customRewards}
          onUpdateRewards={handleUpdateRewards}
        />

        {/* Info & Backup Modal */}
        <InfoModal
          isOpen={isInfoOpen}
          onClose={() => setIsInfoOpen(false)}
          onRestoreBackupSuccess={reloadAllStates}
        />

        {/* History Modal */}
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={workoutHistory}
          onClearHistory={handleClearHistory}
        />
      </div>
    </div>
  );
}
