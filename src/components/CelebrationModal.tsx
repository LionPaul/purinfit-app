import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PompomMascot } from './PompomMascot.tsx';
import { playCelebrationFanfare } from '../utils/audio.ts';
import { Sparkles, X, Heart, Crown } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutName: string;
  type?: 'workout' | 'dance';
  earnedPuddings?: number;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  workoutName,
  type = 'workout',
  earnedPuddings = 2,
}) => {
  useEffect(() => {
    if (isOpen) {
      playCelebrationFanfare();
      try {
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FAD02C', '#FFE57F', '#7A4B29', '#FFA5A5', '#FFF9E7', '#FBBF24'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FAD02C', '#FFA5A5', '#F59E0B'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FAD02C', '#FFA5A5', '#7A4B29'],
          });
        }, 250);
      } catch {
        // Fallback gracefully
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-sm bg-[#FFFDF2] rounded-3xl border-3 border-[#F7C815] p-6 shadow-2xl text-center transform transition-all animate-pudding overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
      >
        {/* Close icon button */}
        <button
          onClick={onClose}
          aria-label="Fechar celebração"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FEF3C7] text-[#7A4B29] hover:bg-[#FDE68A] flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top pudding banner decor */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-xs font-bold text-[#7A4B29] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#E68A00]" />
          <span>{type === 'dance' ? 'Sessão de Dança Concluída!' : 'Missão 20 Minutos Concluída!'}</span>
          <Sparkles className="w-3.5 h-3.5 text-[#E68A00]" />
        </div>

        {/* Mascot Center */}
        <div className="my-2">
          <PompomMascot mood="celebrate" size="lg" />
        </div>

        {/* Main message */}
        <h2 id="celebration-title" className="text-2xl font-black text-[#5A3317] tracking-tight leading-tight mt-1">
          Você foi maravilhosa hoje! 🍮✨
        </h2>

        <p className="text-sm font-semibold text-[#7A4B29] mt-2 leading-relaxed px-2">
          <span className="font-extrabold text-[#92400E] block text-base mb-1">
            {type === 'dance'
              ? 'Dancinha paga com sucesso!'
              : '20 minutinhos pagos com sucesso!'}
          </span>
          Sem trauma, sem exaustão e cuidando da sua saúde com carinho e consistência.
        </p>

        {/* Reward badge card */}
        <div className="mt-4 p-3 bg-[#FEF9E7] border-2 border-dashed border-[#FAD02C] rounded-2xl flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5 text-left">
            <span className="text-3xl">{type === 'dance' ? '💃' : '🍮'}</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#92400E]">
                {type === 'dance' ? 'Dança Registrada' : 'Treino Salvo'}
              </span>
              <p className="text-xs font-black text-[#5A3317]">{workoutName}</p>
            </div>
          </div>

          <div className="text-right flex items-center gap-1 bg-[#FEF3C7] px-2.5 py-1 rounded-xl border border-[#FDE68A]">
            <Crown className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="text-xs font-black text-[#92400E]">+{earnedPuddings} 🍮</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="mt-5 w-full py-3.5 px-6 rounded-2xl bg-[#FAD02C] hover:bg-[#F7C815] active:scale-98 text-[#5A3317] font-black text-base shadow-md border-b-4 border-[#D97706] transition-transform flex items-center justify-center gap-2"
        >
          <Heart className="w-5 h-5 fill-[#5A3317]" />
          <span>Comemorar e Continuar!</span>
        </button>
      </div>
    </div>
  );
};
