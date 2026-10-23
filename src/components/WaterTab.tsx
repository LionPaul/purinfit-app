import React, { useState } from 'react';
import { WaterState } from '../types/index.ts';
import { calculateWaterPercentage, getWaterCheerMessage } from '../utils/fitnessLogic.ts';
import { playWaterSip, playCutePop } from '../utils/audio.ts';
import { PompomMascot } from './PompomMascot.tsx';
import { Droplet, Plus, RotateCcw, Sparkles, Check, Heart, Minus, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WaterTabProps {
  waterState: WaterState;
  onUpdateWater: (newState: WaterState) => void;
  onAwardPudding?: (amount: number, reason: string) => void;
}

export const WaterTab: React.FC<WaterTabProps> = ({
  waterState,
  onUpdateWater,
  onAwardPudding,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalInput, setTempGoalInput] = useState(String(waterState.goalMl || 2000));

  const percentage = calculateWaterPercentage(waterState.currentMl, waterState.goalMl);
  const cheer = getWaterCheerMessage(waterState.currentMl, waterState.goalMl);

  const handleAddWater = (amount: number) => {
    playWaterSip();
    const newAmount = Math.max(0, waterState.currentMl + amount);
    const newHistory = [
      ...waterState.history,
      { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amount },
    ];

    let awarded = waterState.puddingAwardedToday;
    if (newAmount >= waterState.goalMl && !waterState.puddingAwardedToday && waterState.goalMl > 0) {
      awarded = true;
      if (onAwardPudding) {
        onAwardPudding(1, 'Meta de Água batida! 💧');
      }
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#60A5FA', '#FAD02C'],
        });
      } catch {
        // Safe fallback
      }
    }

    onUpdateWater({
      ...waterState,
      currentMl: newAmount,
      history: newHistory,
      puddingAwardedToday: awarded,
    });
  };

  const handleReset = () => {
    playCutePop();
    onUpdateWater({
      ...waterState,
      currentMl: 0,
      history: [],
    });
    setShowResetConfirm(false);
  };

  const handleSaveGoal = () => {
    playCutePop();
    const val = parseInt(tempGoalInput, 10);
    if (!isNaN(val) && val >= 500 && val <= 6000) {
      onUpdateWater({
        ...waterState,
        goalMl: val,
      });
    }
    setIsEditingGoal(false);
  };

  const fillHeight = Math.min(percentage, 100);

  return (
    <div className="space-y-4 pb-24">
      {/* Top Hydration Mascot Banner with Fanbase Backside / Butt Easter Egg */}
      <div className="bg-[#FFFDF2] border-2 border-[#F6E09D] rounded-3xl p-3.5 shadow-xs text-center">
        <PompomMascot mood="water" size="md" speechText={cheer.message} allowToggleBack={true} />
      </div>

      {/* Main Visual Tumbler Card */}
      <div className="bg-[#FFFDF2] border-2 border-[#F6E09D] rounded-3xl p-5 shadow-xs flex flex-col items-center">
        {/* Goal Indicator with Click-to-Edit */}
        <div className="flex items-center justify-between w-full mb-3 px-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#8C5E3C] uppercase tracking-wider">
            <Droplet className="w-4 h-4 text-[#3B82F6] fill-[#3B82F6]" />
            <span>Meta Diária</span>
          </div>

          {!isEditingGoal ? (
            <button
              onClick={() => {
                setTempGoalInput(String(waterState.goalMl));
                setIsEditingGoal(true);
              }}
              title="Clique para editar a meta de água"
              className="px-3 py-1 rounded-full bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] font-black text-xs border border-[#BAE6FD] flex items-center gap-1 transition-colors"
            >
              <span>{waterState.goalMl} ml</span>
              <Edit3 className="w-3 h-3 text-[#0369A1]" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="500"
                max="6000"
                step="100"
                value={tempGoalInput}
                onChange={(e) => setTempGoalInput(e.target.value)}
                className="w-20 px-2 py-0.5 text-xs font-black text-[#0369A1] bg-white border border-[#0284C7] rounded-lg text-center"
              />
              <button
                onClick={handleSaveGoal}
                className="px-2 py-0.5 rounded-lg bg-[#0284C7] text-white text-[10px] font-black"
              >
                Salvar
              </button>
              <button
                onClick={() => setIsEditingGoal(false)}
                className="px-1.5 py-0.5 rounded-lg bg-gray-200 text-gray-700 text-[10px]"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Visual Tumbler / Bottle */}
        <div className="relative w-44 h-64 bg-white rounded-t-3xl rounded-b-4xl border-4 border-[#7A4B29] overflow-hidden shadow-inner flex flex-col justify-end p-1">
          {/* Tumbler Lid / Straw decoration */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-[#FAD02C] border-b-2 border-[#7A4B29]" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-5 bg-[#FAD02C] border-2 border-[#7A4B29] rounded-t-md" />

          {/* Liquid level */}
          <div
            className="w-full bg-linear-to-t from-[#3B82F6] via-[#60A5FA] to-[#93C5FD] transition-all duration-700 ease-out relative rounded-b-3xl"
            style={{ height: `${fillHeight}%` }}
          >
            {/* Wave top effect */}
            {fillHeight > 0 && (
              <div className="absolute -top-2 left-0 right-0 h-3 overflow-hidden">
                <svg
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  className="w-[200%] h-full fill-[#93C5FD] animate-pulse"
                >
                  <path d="M 0 10 Q 25 0 50 10 Q 75 20 100 10 Q 125 0 150 10 Q 175 20 200 10 L 200 20 L 0 20 Z" />
                </svg>
              </div>
            )}

            {/* Floating tiny bubbles */}
            {fillHeight > 15 && (
              <>
                <div className="absolute bottom-4 left-6 w-2.5 h-2.5 rounded-full bg-white/60 animate-bounce" />
                <div className="absolute bottom-12 right-8 w-2 h-2 rounded-full bg-white/70 animate-pulse" />
                <div className="absolute bottom-20 left-10 w-3 h-3 rounded-full bg-white/50" />
              </>
            )}
          </div>

          {/* Center text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none drop-shadow-sm">
            <span className="text-3xl font-black text-[#5A3317] tracking-tight">
              {waterState.currentMl} <span className="text-sm">ml</span>
            </span>
            <span className="text-xs font-black text-[#7A4B29] bg-[#FFFDF2]/90 px-2.5 py-0.5 rounded-full border border-[#FDE68A] mt-1">
              {percentage}% da meta
            </span>
            {percentage >= 100 && (
              <span className="mt-1 flex items-center gap-1 text-[11px] font-black text-[#047857] bg-[#D1FAE5] px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-[#10B981]" /> Meta Atingida! (+1 🍮)
              </span>
            )}
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-3 w-full mt-5">
          <button
            onClick={() => handleAddWater(250)}
            className="py-3 px-4 rounded-2xl bg-[#FAD02C] hover:bg-[#F7C815] active:scale-95 text-[#5A3317] font-black text-sm shadow-sm border-b-3 border-[#D97706] transition-transform flex items-center justify-center gap-2"
          >
            <span className="text-lg">🥛</span>
            <span>+250 ml (Copo)</span>
          </button>

          <button
            onClick={() => handleAddWater(500)}
            className="py-3 px-4 rounded-2xl bg-[#FAD02C] hover:bg-[#F7C815] active:scale-95 text-[#5A3317] font-black text-sm shadow-sm border-b-3 border-[#D97706] transition-transform flex items-center justify-center gap-2"
          >
            <span className="text-lg">🍶</span>
            <span>+500 ml (Garrafa)</span>
          </button>
        </div>

        {/* Secondary adjustments (+100, -100, zerar) */}
        <div className="flex items-center justify-between w-full mt-3 pt-3 border-t border-[#F3E7C4] text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAddWater(100)}
              className="px-2.5 py-1.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#7A4B29] font-bold text-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> 100 ml
            </button>
            <button
              onClick={() => handleAddWater(-100)}
              disabled={waterState.currentMl <= 0}
              className="px-2.5 py-1.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] disabled:opacity-40 text-[#7A4B29] font-bold text-xs transition-colors flex items-center gap-1"
            >
              <Minus className="w-3 h-3" /> 100 ml
            </button>
          </div>

          <div>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-2.5 py-1.5 rounded-xl text-[#92400E] hover:bg-[#FEF3C7] font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Zerar
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-[#FEE2E2] p-1 rounded-xl">
                <span className="text-[10px] text-[#991B1B] font-bold px-1">Zerar hoje?</span>
                <button
                  onClick={handleReset}
                  className="px-1.5 py-0.5 rounded-lg bg-[#EF4444] text-white text-[10px] font-black"
                >
                  Sim
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-1.5 py-0.5 rounded-lg bg-white text-[#5A3317] text-[10px] font-bold"
                >
                  Não
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hydration Benefit Tip */}
      <div className="bg-[#FFFDF2] border-2 border-[#F6E09D] rounded-2xl p-3.5 shadow-xs flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0284C7] flex-shrink-0 flex items-center justify-center font-bold">
          <Heart className="w-4 h-4 fill-[#0284C7]" />
        </div>
        <div>
          <h3 className="text-xs font-black text-[#5A3317]">Por que água no treino de 20 min?</h3>
          <p className="text-xs text-[#7A4B29] mt-0.5 font-semibold leading-relaxed">
            Água lubrifica as articulações, evita dores de cabeça pós-exercício e garante que seu corpo funcione leve e desinchado.
          </p>
        </div>
      </div>
    </div>
  );
};
