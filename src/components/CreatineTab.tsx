import React, { useState } from 'react';
import { CreatineState, DailyHabit } from '../types/index.ts';
import { calculateCreatineStreak, getPastDaysList, getLocalDateString } from '../utils/fitnessLogic.ts';
import { playCutePop } from '../utils/audio.ts';
import { PompomMascot } from './PompomMascot.tsx';
import { Sparkles, Flame, Check, Clock, ShieldCheck, Plus, Trash2, Heart, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreatineTabProps {
  creatineState: CreatineState;
  onUpdateCreatine: (newState: CreatineState) => void;
  dailyHabits: DailyHabit[];
  onUpdateDailyHabits: (habits: DailyHabit[]) => void;
  onAwardPudding?: (amount: number, reason: string) => void;
}

export const CreatineTab: React.FC<CreatineTabProps> = ({
  creatineState,
  onUpdateCreatine,
  dailyHabits,
  onUpdateDailyHabits,
  onAwardPudding,
}) => {
  const todayStr = getLocalDateString();
  const isTakenToday = Boolean(creatineState.records[todayStr]);
  const streak = calculateCreatineStreak(creatineState.records, todayStr);
  const pastDays = getPastDaysList(7, todayStr);

  // New Habit Modal state
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('✨');

  const handleToggle = () => {
    playCutePop();
    const newStatus = !isTakenToday;
    const newRecords = {
      ...creatineState.records,
      [todayStr]: newStatus,
    };

    let awarded = creatineState.puddingAwardedToday;
    if (newStatus && !creatineState.puddingAwardedToday) {
      awarded = true;
      if (onAwardPudding) {
        onAwardPudding(1, 'Creatina tomada com sucesso! ✨');
      }
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#FAD02C', '#FFE57F', '#FFA5A5', '#7A4B29'],
        });
      } catch {
        // Safe fallback
      }
    }

    onUpdateCreatine({
      records: newRecords,
      lastTakenDate: newStatus ? todayStr : creatineState.lastTakenDate,
      puddingAwardedToday: awarded,
    });
  };

  // Toggle habit for today
  const handleToggleHabit = (habitId: string) => {
    playCutePop();
    const updated = dailyHabits.map((h) => {
      if (h.id === habitId) {
        const currentDone = Boolean(h.completedDates[todayStr]);
        return {
          ...h,
          completedDates: {
            ...h.completedDates,
            [todayStr]: !currentDone,
          },
        };
      }
      return h;
    });
    onUpdateDailyHabits(updated);
  };

  const handleAddHabit = () => {
    if (!newHabitTitle.trim()) return;
    playCutePop();
    const newHabit: DailyHabit = {
      id: `hab_${Date.now()}`,
      title: newHabitTitle.trim(),
      icon: newHabitIcon || '✨',
      completedDates: {},
    };
    onUpdateDailyHabits([...dailyHabits, newHabit]);
    setIsAddingHabit(false);
    setNewHabitTitle('');
  };

  const handleDeleteHabit = (habitId: string) => {
    playCutePop();
    const updated = dailyHabits.filter((h) => h.id !== habitId);
    onUpdateDailyHabits(updated);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Mascot Banner */}
      <div className="bg-[#FFFDF2] border-2 border-[#F6E09D] rounded-3xl p-4 shadow-xs text-center">
        <PompomMascot
          mood={isTakenToday ? 'celebrate' : 'happy'}
          size="md"
          speechText={
            isTakenToday
              ? 'Maravilhosa! Creatina tomada! Seus músculos e energia agradecem 💛 (+1 🍮)'
              : 'Já tomou sua dose hoje? 3g a 5g garantem energia o dia todo!'
          }
        />
      </div>

      {/* Main Highlighted Creatine Card */}
      <div className="bg-[#FFFDF2] border-2 border-[#F6E09D] rounded-3xl p-5 shadow-xs text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-black uppercase tracking-wider mb-2 border border-[#FDE68A]">
          <Sparkles className="w-3.5 h-3.5 text-[#E68A00]" />
          <span>Hábito Diário Essencial (+1 🍮)</span>
        </div>

        <h2 className="text-xl font-black text-[#5A3317] tracking-tight">
          Você já tomou sua creatina hoje?
        </h2>

        <p className="text-xs text-[#7A4B29] font-semibold mt-1">
          Dica fofa: pode misturar na água, no suco ou no iogurte a qualquer hora do dia!
        </p>

        {/* Big Toggle Button */}
        <div className="mt-5">
          <button
            onClick={handleToggle}
            aria-pressed={isTakenToday}
            className={`w-full py-4 px-6 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-md border-b-4 ${
              isTakenToday
                ? 'bg-[#34D399] hover:bg-[#10B981] text-white border-[#059669] scale-[1.01]'
                : 'bg-[#FAD02C] hover:bg-[#F7C815] text-[#5A3317] border-[#D97706] active:scale-98'
            }`}
          >
            {isTakenToday ? (
              <>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <span>Tomada! ✨ (+1 🍮)</span>
              </>
            ) : (
              <>
                <Clock className="w-5 h-5" />
                <span>Ainda não ⏳</span>
              </>
            )}
          </button>
        </div>

        {/* Streak Counter Box */}
        <div className="mt-4 p-3.5 bg-[#FEF9E7] border-2 border-dashed border-[#FAD02C] rounded-2xl flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
            <Flame className="w-6 h-6 text-[#EA580C] fill-[#EA580C]" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#92400E]">
              Sequência de Consistência
            </div>
            <div className="text-base font-black text-[#5A3317]">
              {streak} {streak === 1 ? 'dia seguido' : 'dias seguidos'}! 🍮🔥
            </div>
          </div>
        </div>

        {/* 7 Days Mini Tracker */}
        <div className="mt-4 pt-3 border-t border-[#F3E7C4]">
          <div className="text-xs font-black text-[#8C5E3C] uppercase tracking-wider mb-2 text-left">
            Últimos 7 dias
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {pastDays.map((day) => {
              const checked = Boolean(creatineState.records[day.dateStr]);
              return (
                <div
                  key={day.dateStr}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    day.isToday
                      ? 'border-[#FAD02C] bg-[#FFFBEB] ring-2 ring-[#FAD02C]'
                      : 'border-[#F3E7C4] bg-white'
                  }`}
                >
                  <div className="text-[10px] font-bold text-[#8C5E3C]">{day.dayLabel}</div>
                  <div className="text-xs font-black text-[#5A3317] my-0.5">{day.dayNum}</div>
                  <div
                    className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-black ${
                      checked
                        ? 'bg-[#10B981] text-white shadow-xs'
                        : 'bg-[#F3E7C4] text-[#A88B70]'
                    }`}
                  >
                    {checked ? <Check className="w-3 h-3 stroke-[3]" /> : '·'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* NEW SECTION: "Meus Cuidados Diários ✨" */}
      <div className="bg-[#FFFDF2] border-2 border-[#F6E09D] rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#5A3317] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#E68A00]" />
              Meus Cuidados Diários ✨
            </h3>
            <p className="text-[11px] text-[#8C5E3C] font-semibold">
              Hábitos simples e gentis de autocuidado para o seu dia a dia.
            </p>
          </div>
          <button
            onClick={() => setIsAddingHabit(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#FAD02C] hover:bg-[#F7C815] text-[#5A3317] font-black text-xs flex items-center gap-1 shadow-xs border-b-2 border-[#D97706]"
          >
            <Plus className="w-3.5 h-3.5" /> Hábito
          </button>
        </div>

        {/* Habits List */}
        <div className="space-y-2">
          {dailyHabits.map((habit) => {
            const isDoneToday = Boolean(habit.completedDates[todayStr]);
            return (
              <div
                key={habit.id}
                className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2 ${
                  isDoneToday
                    ? 'border-[#34D399] bg-[#F0FDF4]/70 shadow-xs'
                    : 'border-[#F3E7C4] bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleHabit(habit.id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                      isDoneToday
                        ? 'bg-[#10B981] text-white shadow-xs'
                        : 'bg-[#FEF3C7] text-[#7A4B29] border border-[#FDE68A]'
                    }`}
                  >
                    {isDoneToday ? <Check className="w-4 h-4 stroke-[3]" /> : habit.icon || '✨'}
                  </div>
                  <div>
                    <span
                      className={`text-xs font-black transition-all ${
                        isDoneToday ? 'text-[#065F46] line-through opacity-80' : 'text-[#5A3317]'
                      }`}
                    >
                      {habit.title}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="p-1.5 rounded-lg text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
                  title="Excluir hábito"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Science & Comfort Anti-Trauma Myths Buster */}
      <div className="bg-[#FFFDF2] border-2 border-[#F6E09D] rounded-3xl p-4 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-[#5A3317] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#D97706]" />
          Por que a creatina é perfeita para quem odeia academia?
        </h3>

        <div className="space-y-2 text-xs font-semibold text-[#7A4B29] leading-relaxed">
          <div className="flex items-start gap-2 bg-[#FEF9E7] p-2.5 rounded-xl border border-[#FDE68A]">
            <span className="text-base flex-shrink-0">🙅‍♀️</span>
            <p>
              <strong className="text-[#92400E]">Não engorda e não incha:</strong> A hidratação da creatina vai para dentro da célula muscular (deixa os músculos firmes), e NÃO retém líquido debaixo da pele.
            </p>
          </div>

          <div className="flex items-start gap-2 bg-[#FEF9E7] p-2.5 rounded-xl border border-[#FDE68A]">
            <span className="text-base flex-shrink-0">⚡</span>
            <p>
              <strong className="text-[#92400E]">Menos cansaço no dia a dia:</strong> Ajuda na regeneração de ATP celular, dando disposição no trabalho, estudo e nas tarefas diárias.
            </p>
          </div>

          <div className="flex items-start gap-2 bg-[#FEF9E7] p-2.5 rounded-xl border border-[#FDE68A]">
            <span className="text-base flex-shrink-0">🍮</span>
            <p>
              <strong className="text-[#92400E]">Sem sofrimento pós-treino:</strong> Diminui a dor tardia no dia seguinte, para você não acordar travada sem conseguir sentar na cadeira!
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Add New Habit */}
      {isAddingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-[#FFFDF2] rounded-3xl border-3 border-[#F7C815] p-5 shadow-2xl space-y-3">
            <h4 className="text-sm font-black text-[#5A3317]">Novo Cuidado Diário</h4>
            <div>
              <label className="text-[11px] font-black text-[#8C5E3C] uppercase">Nome do Hábito</label>
              <input
                type="text"
                placeholder="Ex: Tomar Vitaminas, Ler 10 páginas..."
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-[#8C5E3C] uppercase">Ícone</label>
              <div className="flex items-center gap-2 mt-1">
                {['✨', '💊', '🧘‍♀️', '💧', '🥗', '📖'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewHabitIcon(emoji)}
                    className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border ${
                      newHabitIcon === emoji ? 'bg-[#FAD02C] border-[#D97706]' : 'bg-white border-[#F3E7C4]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleAddHabit}
                className="py-2.5 rounded-xl bg-[#FAD02C] font-black text-xs text-[#5A3317] border-b-2 border-[#D97706]"
              >
                Salvar
              </button>
              <button
                onClick={() => setIsAddingHabit(false)}
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
