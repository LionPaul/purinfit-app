import React from 'react';
import { formatDateDisplay, getLocalDateString } from '../utils/fitnessLogic.ts';
import { Calendar, HelpCircle, Gift } from 'lucide-react';

interface HeaderProps {
  onOpenHelp: () => void;
  onOpenHistory: () => void;
  onOpenRewards: () => void;
  completedWorkoutsCount: number;
  puddingBalance: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  onOpenHistory,
  onOpenRewards,
  completedWorkoutsCount,
  puddingBalance,
}) => {
  const todayFormatted = formatDateDisplay(getLocalDateString());

  return (
    <header className="sticky top-0 z-30 bg-[#FEF9E7]/95 backdrop-blur-xs border-b border-[#F6E09D] px-3.5 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          {/* Mini Purin Beret icon */}
          <div className="w-9 h-9 rounded-2xl bg-[#FFE785] border-2 border-[#7A4B29] flex items-center justify-center text-lg shadow-xs flex-shrink-0">
            🍮
          </div>
          <div>
            <h1 className="text-base font-black text-[#5A3317] tracking-tight leading-none">
              PurinFit
            </h1>
            <p className="text-[10px] font-bold text-[#8C5E3C] mt-0.5">
              {todayFormatted}
            </p>
          </div>
        </div>

        {/* Action icons: Pudding Currency Button + History + Info */}
        <div className="flex items-center gap-1.5">
          {/* Lojinha de Mimos / Pudding Balance */}
          <button
            onClick={onOpenRewards}
            aria-label="Abrir Lojinha de Mimos"
            className="px-2.5 py-1.5 rounded-xl bg-linear-to-r from-[#FEF3C7] to-[#FFFBEB] hover:bg-[#FDE68A] text-[#92400E] border-2 border-[#FAD02C] transition-all flex items-center gap-1 text-xs font-black shadow-xs active:scale-95"
            title="Lojinha de Mimos: Troque seus pudins por agrados especiais"
          >
            <span className="text-sm">🍮</span>
            <span>{puddingBalance}</span>
            <Gift className="w-3.5 h-3.5 text-[#D97706]" />
          </button>

          {/* Workouts History */}
          <button
            onClick={onOpenHistory}
            aria-label="Ver histórico de treinos e dança"
            className="p-1.5 rounded-xl bg-[#FFFDF2] hover:bg-[#FEF3C7] text-[#7A4B29] border border-[#F3E7C4] transition-colors flex items-center gap-1 text-xs font-bold"
            title="Histórico de atividades"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[11px] font-extrabold">{completedWorkoutsCount}</span>
          </button>

          {/* Help & Backup */}
          <button
            onClick={onOpenHelp}
            aria-label="Guia anti-trauma e Backup"
            className="p-1.5 rounded-xl bg-[#FFFDF2] hover:bg-[#FEF3C7] text-[#7A4B29] border border-[#F3E7C4] transition-colors"
            title="Guia & Backup"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
