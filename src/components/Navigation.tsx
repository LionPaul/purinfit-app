import React from 'react';
import { Droplets, Sparkles, Flame, Dumbbell } from 'lucide-react';
import { playCutePop } from '../utils/audio.ts';

export type ActiveTab = 'dance' | 'workout' | 'water' | 'creatine';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  waterPercentage: number;
  creatineDone: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  waterPercentage,
  creatineDone,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    playCutePop();
    onChangeTab(tab);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF2]/95 backdrop-blur-md border-t-2 border-[#F6E09D] px-2 py-1.5 shadow-lg"
      aria-label="Navegação principal"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5">
        {/* Dance Tab */}
        <button
          onClick={() => handleTabClick('dance')}
          aria-label="Aba Dança e Ritmo"
          aria-selected={activeTab === 'dance'}
          role="tab"
          className={`py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'dance'
              ? 'bg-[#FAD02C] text-[#5A3317] font-black shadow-sm border-b-2 border-[#D97706] scale-102'
              : 'text-[#8C5E3C] hover:bg-[#FEF3C7] font-bold'
          }`}
        >
          <span className="text-lg">💃</span>
          <span className="text-[10px] mt-0.5 tracking-tight font-black">Dança</span>
        </button>

        {/* Workout Tab (Musculação 20-45 min) */}
        <button
          onClick={() => handleTabClick('workout')}
          aria-label="Aba Musculação (20-45 min)"
          aria-selected={activeTab === 'workout'}
          role="tab"
          className={`py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'workout'
              ? 'bg-[#FAD02C] text-[#5A3317] font-black shadow-sm border-b-2 border-[#D97706] scale-102'
              : 'text-[#8C5E3C] hover:bg-[#FEF3C7] font-bold'
          }`}
        >
          <span className="text-lg">🏋️‍♀️</span>
          <span className="text-[10px] mt-0.5 tracking-tight font-black">Musculação</span>
        </button>

        {/* Water Tab */}
        <button
          onClick={() => handleTabClick('water')}
          aria-label="Aba Água e Hidratação"
          aria-selected={activeTab === 'water'}
          role="tab"
          className={`py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'water'
              ? 'bg-[#FAD02C] text-[#5A3317] font-black shadow-sm border-b-2 border-[#D97706] scale-102'
              : 'text-[#8C5E3C] hover:bg-[#FEF3C7] font-bold'
          }`}
        >
          <div className="relative">
            <Droplets className={`w-4 h-4 ${activeTab === 'water' ? 'text-[#0284C7]' : 'text-[#3B82F6]'}`} />
            {waterPercentage >= 100 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#10B981] border border-white" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-black">
            Água ({waterPercentage}%)
          </span>
        </button>

        {/* Creatine Tab */}
        <button
          onClick={() => handleTabClick('creatine')}
          aria-label="Aba Check de Creatina e Cuidados"
          aria-selected={activeTab === 'creatine'}
          role="tab"
          className={`py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'creatine'
              ? 'bg-[#FAD02C] text-[#5A3317] font-black shadow-sm border-b-2 border-[#D97706] scale-102'
              : 'text-[#8C5E3C] hover:bg-[#FEF3C7] font-bold'
          }`}
        >
          <div className="relative">
            <Sparkles className={`w-4 h-4 ${activeTab === 'creatine' ? 'text-[#D97706]' : 'text-[#F59E0B]'}`} />
            {creatineDone && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#10B981] border border-white" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-black">Creatina</span>
        </button>
      </div>
    </nav>
  );
};
