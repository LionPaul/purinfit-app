import React, { useState, useEffect, useRef } from 'react';
import {
  WorkoutDay,
  ExerciseDefinition,
  ExerciseLog,
  DailyWorkoutProgress,
} from '../types/index.ts';
import {
  calculateWorkoutProgress,
  DEFAULT_PRESET_WORKOUTS,
  formatSecondsToMMSS,
} from '../utils/fitnessLogic.ts';
import { playCutePop, playBoing, triggerHaptic } from '../utils/audio.ts';
import { requestScreenWakeLock, releaseScreenWakeLock } from '../utils/wakeLock.ts';
import {
  Check,
  Dumbbell,
  Sparkles,
  Info,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Clock,
  RotateCcw,
  Play,
  Pause,
  FastForward,
  Timer as TimerIcon,
  Flame,
} from 'lucide-react';

interface ActiveSetState {
  exerciseId: string;
  setIndex: number;
  startedAt: number;
  elapsedSeconds: number;
}

interface ActiveRestState {
  exerciseId: string;
  setIndex: number; // The set that was just finished
  secondsRemaining: number;
  totalSeconds: number;
}

interface WorkoutTabProps {
  workouts: Record<string, WorkoutDay>;
  workoutTabsOrder: string[];
  progress: DailyWorkoutProgress;
  onUpdateWorkouts: (workouts: Record<string, WorkoutDay>, order: string[]) => void;
  onUpdateProgress: (newProgress: DailyWorkoutProgress) => void;
  onCompleteWorkout: () => void;
}

export const WorkoutTab: React.FC<WorkoutTabProps> = ({
  workouts,
  workoutTabsOrder,
  progress,
  onUpdateWorkouts,
  onUpdateProgress,
  onCompleteWorkout,
}) => {
  // Active workout day fallback
  const activeTabId = workoutTabsOrder.includes(progress.activeWorkout)
    ? progress.activeWorkout
    : workoutTabsOrder[0] || 'A';

  const activeWorkout: WorkoutDay = workouts[activeTabId] || {
    id: activeTabId,
    name: `Treino ${activeTabId}`,
    exercises: [],
  };

  const progressStats = calculateWorkoutProgress(activeWorkout.exercises, progress.logs);

  // Active Set & Rest State (guided execution flow)
  const [activeSet, setActiveSet] = useState<ActiveSetState | null>(null);
  const [activeRest, setActiveRest] = useState<ActiveRestState | null>(null);

  // Modals for Tab CRUD
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [newTabSubtitle, setNewTabSubtitle] = useState('');

  const [editingTab, setEditingTab] = useState<WorkoutDay | null>(null);
  const [editTabName, setEditTabName] = useState('');
  const [editTabSubtitle, setEditTabSubtitle] = useState('');

  // Exercise CRUD modal
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseDefinition | null>(null);
  const [exName, setExName] = useState('');
  const [exSeries, setExSeries] = useState(3);
  const [exReps, setExReps] = useState('10 a 12');
  const [exRest, setExRest] = useState(120); // Default 120s as requested
  const [exSubName, setExSubName] = useState('');
  const [exSubReps, setExSubReps] = useState('');
  const [exNote, setExNote] = useState('');

  // Timer interval for active set duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeSet) {
      interval = setInterval(() => {
        setActiveSet((prev) =>
          prev
            ? {
                ...prev,
                elapsedSeconds: Math.floor((Date.now() - prev.startedAt) / 1000),
              }
            : null
        );
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSet?.startedAt]);

  // Timer interval for active rest countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeRest && activeRest.secondsRemaining > 0) {
      interval = setInterval(() => {
        setActiveRest((prev) => {
          if (!prev) return null;
          if (prev.secondsRemaining <= 1) {
            playBoing();
            return {
              ...prev,
              secondsRemaining: 0,
            };
          }
          return {
            ...prev,
            secondsRemaining: prev.secondsRemaining - 1,
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeRest?.secondsRemaining]);

  // Keep screen awake while a set or rest countdown is actively running
  useEffect(() => {
    if (activeSet || (activeRest && activeRest.secondsRemaining > 0)) {
      requestScreenWakeLock();
    } else {
      releaseScreenWakeLock();
    }
    return () => {
      releaseScreenWakeLock();
    };
  }, [Boolean(activeSet), Boolean(activeRest && activeRest.secondsRemaining > 0)]);

  // Tab switching
  const handleSelectWorkout = (id: string) => {
    playCutePop();
    onUpdateProgress({
      ...progress,
      activeWorkout: id,
    });
  };

  // Direct toggle set completion (manual tap on series button)
  const handleToggleSet = (exerciseId: string, setIndex: number, targetSeries: number) => {
    playCutePop();
    const currentLog: ExerciseLog = progress.logs[exerciseId] || {
      completedSets: new Array(targetSeries).fill(false),
      weightKg: '',
    };

    const updatedSets = [...(currentLog.completedSets || new Array(targetSeries).fill(false))];
    while (updatedSets.length < targetSeries) {
      updatedSets.push(false);
    }
    updatedSets[setIndex] = !updatedSets[setIndex];

    onUpdateProgress({
      ...progress,
      logs: {
        ...progress.logs,
        [exerciseId]: {
          ...currentLog,
          completedSets: updatedSets,
        },
      },
    });

    // If we just uncompleted the set that is active, clear active set
    if (activeSet && activeSet.exerciseId === exerciseId && activeSet.setIndex === setIndex && !updatedSets[setIndex]) {
      setActiveSet(null);
    }
  };

  // Start executing a set
  const handleStartSet = (exerciseId: string, setIndex: number) => {
    playCutePop();
    setActiveRest(null); // Stop any running rest
    setActiveSet({
      exerciseId,
      setIndex,
      startedAt: Date.now(),
      elapsedSeconds: 0,
    });
  };

  // Conclude a set & immediately trigger rest timer (default 120s or custom)
  const handleCompleteSetAndRest = (exercise: ExerciseDefinition, setIndex: number) => {
    playCutePop();
    const targetSeries = exercise.targetSeries;
    const currentLog: ExerciseLog = progress.logs[exercise.id] || {
      completedSets: new Array(targetSeries).fill(false),
      weightKg: '',
    };

    const updatedSets = [...(currentLog.completedSets || new Array(targetSeries).fill(false))];
    while (updatedSets.length < targetSeries) {
      updatedSets.push(false);
    }
    updatedSets[setIndex] = true;

    onUpdateProgress({
      ...progress,
      logs: {
        ...progress.logs,
        [exercise.id]: {
          ...currentLog,
          completedSets: updatedSets,
        },
      },
    });

    setActiveSet(null);

    // If there are more sets, start rest countdown
    const restDuration = exercise.restSeconds || 120;
    setActiveRest({
      exerciseId: exercise.id,
      setIndex,
      secondsRemaining: restDuration,
      totalSeconds: restDuration,
    });
  };

  // Add 30 seconds to the running rest
  const handleAdd30sRest = () => {
    playCutePop();
    if (activeRest) {
      setActiveRest({
        ...activeRest,
        secondsRemaining: activeRest.secondsRemaining + 30,
        totalSeconds: activeRest.totalSeconds + 30,
      });
    }
  };

  // Skip or finish rest
  const handleSkipRest = () => {
    playCutePop();
    setActiveRest(null);
  };

  // Cancel currently running set
  const handleCancelActiveSet = () => {
    playCutePop();
    setActiveSet(null);
  };

  // Weight entry
  const handleWeightChange = (exerciseId: string, weight: string, targetSeries: number) => {
    const currentLog: ExerciseLog = progress.logs[exerciseId] || {
      completedSets: new Array(targetSeries).fill(false),
      weightKg: '',
    };

    onUpdateProgress({
      ...progress,
      logs: {
        ...progress.logs,
        [exerciseId]: {
          ...currentLog,
          weightKg: weight,
        },
      },
    });
  };

  // Toggle Substitute Exercise (Aparelho Ocupado? Trocar 🔄)
  const handleToggleSubstitute = (exerciseId: string) => {
    playBoing();
    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          isUsingSubstitute: !ex.isUsingSubstitute,
        };
      }
      return ex;
    });

    const updatedWorkout = {
      ...activeWorkout,
      exercises: updatedExercises,
    };

    onUpdateWorkouts(
      {
        ...workouts,
        [activeTabId]: updatedWorkout,
      },
      workoutTabsOrder
    );
  };

  // Preset Loaders
  const handleLoadDefaultPresets = () => {
    playCutePop();
    if (window.confirm('Carregar o Treino Leve de 20-45min padrão (com descanso de 120s e todos os planos B)?')) {
      onUpdateWorkouts(DEFAULT_PRESET_WORKOUTS, ['A', 'B', 'C']);
      onUpdateProgress({
        ...progress,
        activeWorkout: 'A',
      });
      setActiveSet(null);
      setActiveRest(null);
    }
  };

  const handleClearWorkoutsToZero = () => {
    playCutePop();
    if (window.confirm('Deseja deixar as abas vazias para criar do zero?')) {
      const emptyWorkouts: Record<string, WorkoutDay> = {
        A: { id: 'A', name: 'Treino A', subtitle: 'Meu Treino', exercises: [] },
      };
      onUpdateWorkouts(emptyWorkouts, ['A']);
      onUpdateProgress({
        ...progress,
        activeWorkout: 'A',
        logs: {},
      });
      setActiveSet(null);
      setActiveRest(null);
    }
  };

  // Tab Add / Edit / Delete
  const handleAddTab = () => {
    if (!newTabName.trim()) return;
    playCutePop();
    const newId = `T_${Date.now()}`;
    const newWorkout: WorkoutDay = {
      id: newId,
      name: newTabName.trim(),
      subtitle: newTabSubtitle.trim() || 'Foco Personalizado',
      exercises: [],
    };
    const newOrder = [...workoutTabsOrder, newId];
    onUpdateWorkouts({ ...workouts, [newId]: newWorkout }, newOrder);
    onUpdateProgress({ ...progress, activeWorkout: newId });
    setIsAddingTab(false);
    setNewTabName('');
    setNewTabSubtitle('');
  };

  const handleSaveEditTab = () => {
    if (!editingTab || !editTabName.trim()) return;
    playCutePop();
    const updated = {
      ...editingTab,
      name: editTabName.trim(),
      subtitle: editTabSubtitle.trim(),
    };
    onUpdateWorkouts({ ...workouts, [editingTab.id]: updated }, workoutTabsOrder);
    setEditingTab(null);
  };

  const handleDeleteTab = (tabId: string) => {
    if (workoutTabsOrder.length <= 1) {
      alert('Você precisa ter pelo menos 1 aba de treino!');
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir a aba "${workouts[tabId]?.name}"?`)) {
      playCutePop();
      const newOrder = workoutTabsOrder.filter((id) => id !== tabId);
      const newWorkouts = { ...workouts };
      delete newWorkouts[tabId];
      onUpdateWorkouts(newWorkouts, newOrder);
      if (progress.activeWorkout === tabId) {
        onUpdateProgress({ ...progress, activeWorkout: newOrder[0] });
      }
    }
  };

  // Exercise CRUD
  const handleOpenAddExercise = () => {
    playCutePop();
    setEditingExercise(null);
    setExName('');
    setExSeries(3);
    setExReps('10 a 12');
    setExRest(120); // Default 120s
    setExSubName('');
    setExSubReps('');
    setExNote('');
    setIsExerciseModalOpen(true);
  };

  const handleOpenEditExercise = (ex: ExerciseDefinition) => {
    playCutePop();
    setEditingExercise(ex);
    setExName(ex.name);
    setExSeries(ex.targetSeries);
    setExReps(ex.targetReps);
    setExRest(ex.restSeconds ?? 120);
    setExSubName(ex.substituteName || '');
    setExSubReps(ex.substituteReps || '');
    setExNote(ex.note || '');
    setIsExerciseModalOpen(true);
  };

  const handleSaveExercise = () => {
    if (!exName.trim()) return;
    playCutePop();

    if (editingExercise) {
      // Edit
      const updated = activeWorkout.exercises.map((e) =>
        e.id === editingExercise.id
          ? {
              ...e,
              name: exName.trim(),
              targetSeries: Math.max(1, exSeries),
              targetReps: exReps.trim() || '10 a 12',
              restSeconds: exRest,
              substituteName: exSubName.trim(),
              substituteReps: exSubReps.trim(),
              note: exNote.trim(),
            }
          : e
      );
      onUpdateWorkouts(
        {
          ...workouts,
          [activeTabId]: { ...activeWorkout, exercises: updated },
        },
        workoutTabsOrder
      );
    } else {
      // Create new
      const newEx: ExerciseDefinition = {
        id: `ex_${Date.now()}`,
        name: exName.trim(),
        targetSeries: Math.max(1, exSeries),
        targetReps: exReps.trim() || '10 a 12',
        restSeconds: exRest,
        substituteName: exSubName.trim(),
        substituteReps: exSubReps.trim(),
        note: exNote.trim(),
        isUsingSubstitute: false,
      };
      onUpdateWorkouts(
        {
          ...workouts,
          [activeTabId]: {
            ...activeWorkout,
            exercises: [...activeWorkout.exercises, newEx],
          },
        },
        workoutTabsOrder
      );
    }

    setIsExerciseModalOpen(false);
    setEditingExercise(null);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    playCutePop();
    const updated = activeWorkout.exercises.filter((e) => e.id !== exerciseId);
    onUpdateWorkouts(
      {
        ...workouts,
        [activeTabId]: { ...activeWorkout, exercises: updated },
      },
      workoutTabsOrder
    );
    if (activeSet?.exerciseId === exerciseId) setActiveSet(null);
    if (activeRest?.exerciseId === exerciseId) setActiveRest(null);
  };

  // Find active exercise name for top banner
  const restingExercise = activeRest
    ? activeWorkout.exercises.find((e) => e.id === activeRest.exerciseId)
    : null;

  return (
    <div className="space-y-4 pb-24">
      {/* Anti-Trauma Golden Rule Card */}
      <div className="bg-[#FFFDF2] border-2 border-[#F6E09D] rounded-2xl p-3.5 shadow-xs flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex-shrink-0 flex items-center justify-center text-xl">
          🍮
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#92400E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D97706]" />
              Musculação (20-45 min)
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] font-black text-[10px] border border-[#FDE68A]">
              +2 🍮
            </span>
          </div>
          <p className="text-xs text-[#7A4B29] mt-0.5 leading-relaxed font-semibold">
            Sem pressa e sem trauma: inicie a série, aperte <strong>"Descansar"</strong> ao terminar e deixe o app cronometrar seu descanso (120s padrão, 100% customizável). Se o aparelho estiver ocupado, toque em <strong>"Ocupado? Trocar 🔄"</strong>!
          </p>
        </div>
      </div>

      {/* Persistent Rest Banner (Shown whenever rest is active) */}
      {activeRest && (
        <div className="bg-linear-to-r from-[#FEF3C7] via-[#FFFBEB] to-[#FEF3C7] border-2 border-[#FAD02C] rounded-2xl p-3.5 shadow-md animate-pulse-gentle">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAD02C] text-[#5A3317] flex items-center justify-center font-black text-xl shadow-xs">
                ⏱️
              </div>
              <div>
                <div className="text-[11px] font-black text-[#92400E] uppercase tracking-wide flex items-center gap-1">
                  <span>Descanso Ativo</span>
                  {restingExercise && (
                    <span className="text-[#7A4B29] font-bold">
                      · {restingExercise.isUsingSubstitute && restingExercise.substituteName ? restingExercise.substituteName : restingExercise.name}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black text-[#5A3317] font-mono leading-none mt-0.5">
                  {formatSecondsToMMSS(activeRest.secondsRemaining)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAdd30sRest}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FEF3C7] text-[#7A4B29] border border-[#F3E7C4] text-xs font-black shadow-xs active:scale-95 transition-all"
                title="Adicionar mais 30 segundos ao descanso"
              >
                +30s
              </button>
              <button
                onClick={handleSkipRest}
                className="px-3 py-1.5 rounded-xl bg-[#FAD02C] hover:bg-[#F7C815] text-[#5A3317] border-b-2 border-[#D97706] text-xs font-black shadow-xs active:scale-95 transition-all flex items-center gap-1"
                title="Pular descanso e ir para próxima série"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{activeRest.secondsRemaining === 0 ? 'Iniciar Próxima ▶️' : 'Pular Descanso'}</span>
              </button>
            </div>
          </div>

          {/* Progress bar of rest */}
          <div className="w-full h-2 bg-[#FEF3C7] rounded-full overflow-hidden mt-2.5 border border-[#FDE68A]">
            <div
              className="h-full bg-linear-to-r from-[#FAD02C] to-[#F59E0B] rounded-full transition-all duration-300"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    ((activeRest.totalSeconds - activeRest.secondsRemaining) / (activeRest.totalSeconds || 1)) * 100
                  )
                )}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-[#8C5E3C] font-semibold text-center mt-1.5">
            {activeRest.secondsRemaining === 0
              ? '✨ Descanso finalizado! Pronto para a próxima série quando quiser.'
              : 'Respire fundo, tome um gole de água e solte os ombros. 💧🍮'}
          </p>
        </div>
      )}

      {/* Tabs Manager (Horizontal scrollable selector + Add Tab button) */}
      <div className="bg-[#FFFDF2] border-2 border-[#F3E7C4] rounded-2xl p-1.5 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Seletor de treinos">
          {workoutTabsOrder.map((tabId) => {
            const isSelected = activeTabId === tabId;
            const dayData = workouts[tabId] || { id: tabId, name: `Treino ${tabId}` };
            return (
              <div key={tabId} className="flex-shrink-0 flex items-center">
                <button
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectWorkout(tabId)}
                  className={`py-2 px-3.5 rounded-xl text-center transition-all flex flex-col items-center justify-center min-w-[96px] ${
                    isSelected
                      ? 'bg-[#FAD02C] text-[#5A3317] font-black shadow-sm border-b-2 border-[#D97706]'
                      : 'bg-[#FEF9E7] text-[#8C5E3C] hover:bg-[#FEF3C7] font-bold border border-[#F3E7C4]'
                  }`}
                >
                  <span className="text-xs font-black tracking-tight truncate max-w-[120px]">
                    {dayData.name}
                  </span>
                  {dayData.subtitle && (
                    <span className="text-[9px] opacity-85 truncate max-w-[110px] font-semibold">
                      {dayData.subtitle}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {/* Add Tab Button */}
          <button
            onClick={() => setIsAddingTab(true)}
            aria-label="Criar nova aba de treino"
            className="p-2.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#7A4B29] border border-[#FDE68A] flex items-center justify-center font-black text-xs flex-shrink-0 h-[48px]"
            title="Adicionar nova aba de treino"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Controls Bar: Edit Tab Name, Delete Tab, Add Exercise */}
      <div className="flex items-center justify-between text-xs px-1 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setEditingTab(activeWorkout);
              setEditTabName(activeWorkout.name);
              setEditTabSubtitle(activeWorkout.subtitle || '');
            }}
            className="px-2.5 py-1 rounded-lg bg-[#FFFDF2] hover:bg-[#FEF3C7] text-[#7A4B29] border border-[#F3E7C4] font-bold text-[11px] flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" /> Renomear Aba
          </button>
          <button
            onClick={() => handleDeleteTab(activeTabId)}
            className="px-2 py-1 rounded-lg bg-[#FFFDF2] hover:bg-[#FEE2E2] text-[#991B1B] border border-[#F3E7C4] font-bold text-[11px] flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Excluir Aba
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleOpenAddExercise}
            className="px-3 py-1 rounded-xl bg-[#FAD02C] hover:bg-[#F7C815] text-[#5A3317] font-black text-xs flex items-center gap-1 shadow-xs border-b-2 border-[#D97706]"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Exercício
          </button>
        </div>
      </div>

      {/* Workout Progress Bar */}
      <div className="bg-[#FFFDF2] border-2 border-[#F6E09D] rounded-2xl p-3 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-extrabold text-[#5A3317]">
            Progresso: {activeWorkout.name}
          </span>
          <span className="font-black text-[#92400E]">
            {progressStats.completedSets} de {progressStats.totalSets} séries ({progressStats.percentage}%)
          </span>
        </div>
        <div className="w-full h-3 bg-[#FEF3C7] rounded-full overflow-hidden p-0.5 border border-[#FDE68A]">
          <div
            className="h-full bg-linear-to-r from-[#FAD02C] to-[#F59E0B] rounded-full transition-all duration-300"
            style={{ width: `${progressStats.percentage}%` }}
          />
        </div>
      </div>

      {/* Empty State if no exercises */}
      {activeWorkout.exercises.length === 0 && (
        <div className="bg-[#FFFDF2] border-2 border-dashed border-[#FAD02C] rounded-3xl p-6 text-center space-y-3">
          <span className="text-4xl block">🍮</span>
          <h3 className="text-sm font-black text-[#5A3317]">Nenhum exercício nesta aba ainda</h3>
          <p className="text-xs text-[#7A4B29] max-w-xs mx-auto">
            Você pode adicionar exercícios livres ou restaurar os treinos pré-montados com descanso de 120s!
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <button
              onClick={handleOpenAddExercise}
              className="px-3.5 py-2 rounded-xl bg-[#FAD02C] text-[#5A3317] font-black text-xs border-b-2 border-[#D97706]"
            >
              + Adicionar Exercício
            </button>
            <button
              onClick={handleLoadDefaultPresets}
              className="px-3.5 py-2 rounded-xl bg-[#FEF3C7] text-[#7A4B29] font-bold text-xs border border-[#FDE68A]"
            >
              Carregar Padrão 20-45min
            </button>
          </div>
        </div>
      )}

      {/* Exercises List */}
      <div className="space-y-3" role="tabpanel">
        {activeWorkout.exercises.map((ex, index) => {
          const log = progress.logs[ex.id] || {
            completedSets: new Array(ex.targetSeries).fill(false),
            weightKg: '',
          };
          const completedCount = log.completedSets.filter(Boolean).length;
          const isDone = completedCount >= ex.targetSeries;
          const isUsingSub = Boolean(ex.isUsingSubstitute);
          const currentDisplayName = isUsingSub && ex.substituteName ? ex.substituteName : ex.name;
          const currentTargetReps = isUsingSub && ex.substituteReps ? ex.substituteReps : ex.targetReps;
          const restSeconds = ex.restSeconds || 120;

          // Next incomplete set index
          const nextIncompleteIndex = log.completedSets.findIndex((done) => !done);
          const isCurrentlyWorkingThis = activeSet?.exerciseId === ex.id;
          const isCurrentlyRestingThis = activeRest?.exerciseId === ex.id;

          return (
            <div
              key={ex.id}
              className={`bg-[#FFFDF2] border-2 rounded-2xl p-4 shadow-xs transition-all ${
                isCurrentlyWorkingThis
                  ? 'border-[#F59E0B] ring-2 ring-[#FAD02C]/50 bg-[#FFFBEB]'
                  : isDone
                  ? 'border-[#34D399] bg-[#F0FDF4]/70'
                  : isUsingSub
                  ? 'border-[#F59E0B] bg-[#FFFBEB]'
                  : 'border-[#F6E09D]'
              }`}
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] font-black text-[10px] uppercase tracking-wider">
                      Exercício {index + 1} de {activeWorkout.exercises.length}
                    </span>
                    {isUsingSub ? (
                      <span className="text-[10px] font-black text-[#92400E] bg-[#FDE68A] px-2 py-0.5 rounded-md border border-[#F59E0B]">
                        Plano B Ativo 🔄
                      </span>
                    ) : (
                      ex.focus && (
                        <span className="text-xs font-bold text-[#8C5E3C] bg-white px-2 py-0.5 rounded-md border border-[#F3E7C4]">
                          {ex.focus}
                        </span>
                      )
                    )}
                    <span className="text-[10px] font-bold text-[#7A4B29] bg-[#FEF3C7] px-2 py-0.5 rounded-md border border-[#FDE68A] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D97706]" />
                      Descanso: {restSeconds}s
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#5A3317] mt-1.5 leading-snug">
                    {currentDisplayName}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  {/* Edit & Delete Exercise */}
                  <button
                    onClick={() => handleOpenEditExercise(ex)}
                    className="p-1.5 rounded-lg text-[#7A4B29] hover:bg-[#FEF3C7] transition-colors"
                    title="Editar exercício"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(ex.id)}
                    className="p-1.5 rounded-lg text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
                    title="Excluir exercício"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {isDone && (
                    <span className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center font-bold ml-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>

              {/* Target Reps, Rest & Note */}
              <div className="mt-2 text-xs font-semibold text-[#7A4B29] bg-[#FEF9E7] p-2.5 rounded-xl border border-[#FDE68A] flex items-start justify-between gap-2">
                <div className="flex items-start gap-1.5">
                  <Info className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#92400E]">
                      Alvo: {ex.targetSeries} séries de {currentTargetReps}
                    </p>
                    {ex.note && <p className="text-[11px] text-[#7A4B29] mt-0.5">{ex.note}</p>}
                  </div>
                </div>

                {/* Aparelho Ocupado? Trocar 🔄 Button */}
                {ex.substituteName && (
                  <button
                    onClick={() => handleToggleSubstitute(ex.id)}
                    aria-label={`Trocar ${ex.name} pelo substituto ${ex.substituteName}`}
                    className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all border ${
                      isUsingSub
                        ? 'bg-[#FAD02C] text-[#5A3317] border-[#D97706] shadow-xs'
                        : 'bg-white hover:bg-[#FEF3C7] text-[#7A4B29] border-[#F3E7C4]'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3 text-[#D97706]" />
                    <span>{isUsingSub ? 'Voltar Principal' : 'Ocupado? Trocar 🔄'}</span>
                  </button>
                )}
              </div>

              {/* Active Set Companion Card (Start -> Doing Set -> Conclude & Rest -> Countdown) */}
              <div className="mt-3 bg-white/90 border-2 border-[#F3E7C4] rounded-xl p-3 shadow-2xs">
                {isCurrentlyWorkingThis ? (
                  /* Currently doing set */
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                        <span className="text-xs font-black text-[#5A3317]">
                          Executando Série {activeSet.setIndex + 1} de {ex.targetSeries}
                        </span>
                      </div>
                      <span className="font-mono font-black text-xs text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded-md">
                        {formatSecondsToMMSS(activeSet.elapsedSeconds)}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#7A4B29] font-semibold">
                      Faça suas {currentTargetReps} repetições com calma. Quando terminar, aperte o botão abaixo para começar o descanso!
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleCompleteSetAndRest(ex, activeSet.setIndex)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] active:scale-98 text-white font-black text-xs shadow-xs border-b-2 border-[#047857] flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Terminei a Série {activeSet.setIndex + 1}! Descansar ⏱️</span>
                      </button>

                      <button
                        onClick={handleCancelActiveSet}
                        className="py-2.5 px-3 rounded-xl bg-[#FEF3C7] hover:bg-[#FEE2E2] text-[#7A4B29] text-xs font-bold"
                        title="Cancelar série atual"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : isCurrentlyRestingThis ? (
                  /* Currently resting on this exercise */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#92400E]">
                        <TimerIcon className="w-4 h-4 text-[#D97706]" />
                        <span>Descansando da Série {activeRest.setIndex + 1}...</span>
                      </div>
                      <span className="font-mono font-black text-sm text-[#5A3317] bg-[#FEF3C7] px-2 py-0.5 rounded-md">
                        {formatSecondsToMMSS(activeRest.secondsRemaining)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleAdd30sRest}
                        className="px-2.5 py-1.5 rounded-xl bg-[#FEF9E7] hover:bg-[#FEF3C7] text-[#7A4B29] border border-[#FDE68A] text-xs font-bold"
                      >
                        +30s descanso
                      </button>
                      <button
                        onClick={handleSkipRest}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-[#FAD02C] hover:bg-[#F7C815] text-[#5A3317] border-b-2 border-[#D97706] text-xs font-black flex items-center justify-center gap-1"
                      >
                        <FastForward className="w-3.5 h-3.5" />
                        <span>Pular e Ir para Próxima</span>
                      </button>
                    </div>
                  </div>
                ) : isDone ? (
                  /* All sets done for this exercise */
                  <div className="flex items-center justify-between text-xs py-0.5">
                    <span className="text-[#059669] font-black flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Todas as {ex.targetSeries} séries concluídas!
                    </span>
                    <span className="text-[10px] text-[#8C5E3C] font-bold">Excelente trabalho! 🍮</span>
                  </div>
                ) : (
                  /* Ready to start next set */
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-xs">
                      <span className="font-extrabold text-[#5A3317]">
                        Próxima: Série {nextIncompleteIndex !== -1 ? nextIncompleteIndex + 1 : 1}
                      </span>
                      <span className="text-[#8C5E3C] text-[11px] block font-semibold">
                        {currentTargetReps} reps · Descanso de {restSeconds}s
                      </span>
                    </div>

                    <button
                      onClick={() => handleStartSet(ex.id, nextIncompleteIndex !== -1 ? nextIncompleteIndex : 0)}
                      className="py-2 px-3.5 rounded-xl bg-[#FAD02C] hover:bg-[#F7C815] active:scale-98 text-[#5A3317] font-black text-xs shadow-xs border-b-2 border-[#D97706] flex items-center gap-1.5 transition-transform"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#5A3317]" />
                      <span>Começar Série {nextIncompleteIndex !== -1 ? nextIncompleteIndex + 1 : 1} ▶️</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Series Checkboxes & Weight field */}
              <div className="mt-3 pt-3 border-t border-[#F3E7C4] flex items-center justify-between gap-3 flex-wrap">
                {/* Series Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-[#8C5E3C] uppercase">
                    Séries:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: ex.targetSeries }).map((_, sIdx) => {
                      const isChecked = Boolean(log.completedSets?.[sIdx]);
                      return (
                        <button
                          key={sIdx}
                          onClick={() => handleToggleSet(ex.id, sIdx, ex.targetSeries)}
                          aria-label={`${currentDisplayName} - Série ${sIdx + 1} ${isChecked ? 'concluída' : 'pendente'}`}
                          className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-[#34D399] text-white shadow-xs scale-105 border-b-2 border-[#059669]'
                              : 'bg-[#FEF3C7] text-[#7A4B29] border-2 border-[#FDE68A] hover:bg-[#FDE047]'
                          }`}
                        >
                          {isChecked ? <Check className="w-4 h-4 stroke-[3]" /> : sIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Weight Input Field */}
                <div className="flex items-center gap-1.5">
                  <label htmlFor={`weight-${ex.id}`} className="text-[11px] font-extrabold text-[#8C5E3C] flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5 text-[#92400E]" /> Carga:
                  </label>
                  <input
                    id={`weight-${ex.id}`}
                    type="text"
                    value={log.weightKg || ''}
                    onChange={(e) => handleWeightChange(ex.id, e.target.value, ex.targetSeries)}
                    placeholder="ex: 5 kg"
                    className="w-24 px-2 py-1 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] focus:border-[#FAD02C] focus:outline-none rounded-xl text-center placeholder-[#C4A482]"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preset restore helper options */}
      <div className="flex items-center justify-center gap-2 pt-1 text-xs">
        <button
          onClick={handleLoadDefaultPresets}
          className="text-[11px] text-[#8C5E3C] hover:underline font-bold flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Restaurar Treino Leve 20-45min (Padrão)
        </button>
        <span className="text-[#C4A482]">·</span>
        <button
          onClick={handleClearWorkoutsToZero}
          className="text-[11px] text-[#8C5E3C] hover:underline font-bold"
        >
          Deixar Abas Vazias
        </button>
      </div>

      {/* Concluir Treino Button */}
      <div className="pt-2">
        <button
          onClick={onCompleteWorkout}
          className="w-full py-4 px-6 rounded-2xl bg-[#FAD02C] hover:bg-[#F7C815] active:scale-98 text-[#5A3317] font-black text-base shadow-md border-b-4 border-[#D97706] transition-transform flex items-center justify-center gap-2"
        >
          <span className="text-xl">🍮</span>
          <span>Concluir Treino de Hoje! ✨ (+2 🍮)</span>
        </button>
        <p className="text-[11px] font-bold text-center text-[#8C5E3C] mt-2">
          Treininho sem estresse feito gera saúde e garante +2 Pudins para você resgatar na Lojinha de Mimos!
        </p>
      </div>

      {/* Modal: Add New Tab */}
      {isAddingTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-[#FFFDF2] rounded-3xl border-3 border-[#F7C815] p-5 shadow-2xl space-y-3">
            <h4 className="text-sm font-black text-[#5A3317]">Criar Nova Aba de Treino</h4>
            <div>
              <label className="text-[11px] font-black text-[#8C5E3C] uppercase">Nome da Aba</label>
              <input
                type="text"
                placeholder="Ex: Treino D, Glúteo Turbo..."
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-[#8C5E3C] uppercase">Subtítulo (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Foco Inferiores & Core"
                value={newTabSubtitle}
                onChange={(e) => setNewTabSubtitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleAddTab}
                className="py-2.5 rounded-xl bg-[#FAD02C] font-black text-xs text-[#5A3317] border-b-2 border-[#D97706]"
              >
                Criar Aba
              </button>
              <button
                onClick={() => setIsAddingTab(false)}
                className="py-2.5 rounded-xl bg-[#FEF3C7] font-bold text-xs text-[#7A4B29]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Tab Name */}
      {editingTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-[#FFFDF2] rounded-3xl border-3 border-[#F7C815] p-5 shadow-2xl space-y-3">
            <h4 className="text-sm font-black text-[#5A3317]">Renomear Aba de Treino</h4>
            <div>
              <label className="text-[11px] font-black text-[#8C5E3C] uppercase">Nome</label>
              <input
                type="text"
                value={editTabName}
                onChange={(e) => setEditTabName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-[#8C5E3C] uppercase">Subtítulo</label>
              <input
                type="text"
                value={editTabSubtitle}
                onChange={(e) => setEditTabSubtitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleSaveEditTab}
                className="py-2.5 rounded-xl bg-[#FAD02C] font-black text-xs text-[#5A3317] border-b-2 border-[#D97706]"
              >
                Salvar
              </button>
              <button
                onClick={() => setEditingTab(null)}
                className="py-2.5 rounded-xl bg-[#FEF3C7] font-bold text-xs text-[#7A4B29]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Exercise (Includes 120s Default Rest and Custom Rest) */}
      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-sm bg-[#FFFDF2] rounded-3xl border-3 border-[#F7C815] p-5 shadow-2xl space-y-3 my-6 max-h-[88vh] overflow-y-auto">
            <h4 className="text-sm font-black text-[#5A3317]">
              {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
            </h4>

            <div>
              <label className="text-[11px] font-black text-[#8C5E3C] uppercase">Nome do Exercício</label>
              <input
                type="text"
                placeholder="Ex: Leg Press, Agachamento..."
                value={exName}
                onChange={(e) => setExName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-black text-[#8C5E3C] uppercase">Número de Séries</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={exSeries}
                  onChange={(e) => setExSeries(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-[#8C5E3C] uppercase">Reps Alvo</label>
                <input
                  type="text"
                  placeholder="Ex: 10 a 12 ou 15"
                  value={exReps}
                  onChange={(e) => setExReps(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
                />
              </div>
            </div>

            {/* Rest Duration Field (Default 120s with fast presets) */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-[#8C5E3C] uppercase">
                  Tempo de Descanso entre Séries
                </label>
                <span className="text-[11px] font-black text-[#D97706] font-mono">
                  {exRest}s ({Math.floor(exRest / 60)}m{exRest % 60 ? ` ${exRest % 60}s` : ''})
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mt-1">
                {[60, 90, 120, 180].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setExRest(sec)}
                    className={`py-1.5 text-[11px] font-black rounded-lg border transition-all ${
                      exRest === sec
                        ? 'bg-[#FAD02C] text-[#5A3317] border-[#D97706]'
                        : 'bg-white text-[#7A4B29] border-[#F3E7C4] hover:bg-[#FEF3C7]'
                    }`}
                  >
                    {sec}s {sec === 120 ? '⭐' : ''}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-[#8C5E3C] font-semibold">Customizado:</span>
                <input
                  type="number"
                  min="15"
                  max="600"
                  step="5"
                  value={exRest}
                  onChange={(e) => setExRest(Math.max(15, parseInt(e.target.value, 10) || 60))}
                  className="w-20 px-2 py-1 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-lg text-center focus:border-[#FAD02C] focus:outline-none"
                />
                <span className="text-[10px] text-[#8C5E3C]">segundos</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black text-[#8C5E3C] uppercase">
                Exercício Substituto (Plano B se aparelho ocupado)
              </label>
              <input
                type="text"
                placeholder="Ex: Agachamento com Halteres / Graviton"
                value={exSubName}
                onChange={(e) => setExSubName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-[#8C5E3C] uppercase">Dica / Postura (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Mantenha coluna ereta e joelhos alinhados"
                value={exNote}
                onChange={(e) => setExNote(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleSaveExercise}
                className="py-2.5 rounded-xl bg-[#FAD02C] font-black text-xs text-[#5A3317] border-b-2 border-[#D97706]"
              >
                Salvar Exercício
              </button>
              <button
                onClick={() => setIsExerciseModalOpen(false)}
                className="py-2.5 rounded-xl bg-[#FEF3C7] font-bold text-xs text-[#7A4B29]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
