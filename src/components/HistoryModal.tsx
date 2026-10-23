import React from 'react';
import { WorkoutHistoryItem } from '../types/index.ts';
import { formatDateDisplay } from '../utils/fitnessLogic.ts';
import { X, Trophy, Trash2, Dumbbell } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: WorkoutHistoryItem[];
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-sm bg-[#FFFDF2] rounded-3xl border-3 border-[#F7C815] p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        <button
          onClick={onClose}
          aria-label="Fechar histórico"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FEF3C7] text-[#7A4B29] hover:bg-[#FDE68A] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-[#E68A00]" />
          <h2 id="history-title" className="text-lg font-black text-[#5A3317]">
            Seus Treinos & Danças
          </h2>
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {history.length === 0 ? (
            <div className="text-center py-8 text-[#8C5E3C]">
              <span className="text-4xl block mb-2">🍮</span>
              <p className="text-xs font-bold">Nenhuma atividade registrada ainda.</p>
              <p className="text-[11px] text-[#A88B70] mt-1">
                Conclua um treino de academia ou uma sessão de dança para preencher seu histórico!
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-[#FEF9E7] border border-[#FDE68A] rounded-2xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{item.type === 'danca' ? '💃' : '🏋️‍♀️'}</span>
                  <div>
                    <div className="text-xs font-black text-[#5A3317]">{item.workoutName}</div>
                    <div className="text-[10px] font-semibold text-[#8C5E3C]">
                      {formatDateDisplay(item.date)} às {item.completedAt}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#047857] text-[10px] font-black">
                    {item.type === 'danca' ? 'Dança Paga ✨' : 'Treino Pago ✨'}
                  </span>
                  <span className="block text-[9px] font-black text-[#D97706] mt-0.5">+2 🍮</span>
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#F3E7C4] flex items-center justify-between text-xs">
            <span className="font-bold text-[#8C5E3C]">
              Total: {history.length} {history.length === 1 ? 'atividade' : 'atividades'}
            </span>
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja limpar o histórico de atividades?')) {
                  onClearHistory();
                }
              }}
              className="text-[#991B1B] hover:underline font-bold flex items-center gap-1 text-[11px]"
            >
              <Trash2 className="w-3 h-3" /> Limpar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
