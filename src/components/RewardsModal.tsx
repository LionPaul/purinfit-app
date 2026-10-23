import React, { useState } from 'react';
import { RewardItem } from '../types/index.ts';
import { generateWhatsAppRewardUrl } from '../utils/fitnessLogic.ts';
import { playBoing, playCutePop } from '../utils/audio.ts';
import { PompomMascot } from './PompomMascot.tsx';
import {
  X,
  Crown,
  Sparkles,
  Send,
  Plus,
  Trash2,
  Heart,
  MessageCircle,
  AlertCircle,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  puddingBalance: number;
  onDeductPuddings: (amount: number, reason: string) => boolean;
  rewards: RewardItem[];
  onUpdateRewards: (rewards: RewardItem[]) => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  puddingBalance,
  onDeductPuddings,
  rewards,
  onUpdateRewards,
}) => {
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [customDemandText, setCustomDemandText] = useState('');
  const [customDemandCost, setCustomDemandCost] = useState(2);
  const [errorMessage, setErrorMessage] = useState('');

  // Add custom reward modal state
  const [isAddingCustomReward, setIsAddingCustomReward] = useState(false);
  const [newRewTitle, setNewRewTitle] = useState('');
  const [newRewCost, setNewRewCost] = useState(2);
  const [newRewDesc, setNewRewDesc] = useState('');
  const [newRewIcon, setNewRewIcon] = useState('🎁');

  if (!isOpen) return null;

  const handleClaimStandardReward = (reward: RewardItem) => {
    setErrorMessage('');
    if (puddingBalance < reward.cost) {
      playCutePop();
      setErrorMessage(`Você precisa de ${reward.cost} 🍮 para resgatar este mimo! Cumpra mais hábitos para ganhar!`);
      return;
    }

    const success = onDeductPuddings(reward.cost, `Resgate: ${reward.title}`);
    if (success) {
      playBoing();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#FAD02C', '#F59E0B', '#FFA5A5', '#7A4B29'],
        });
      } catch {
        // Safe fallback
      }

      // Generate WhatsApp share link
      const waUrl = generateWhatsAppRewardUrl(reward.title, reward.description);
      window.open(waUrl, '_blank');
      onClose();
    }
  };

  const handleClaimCustomDemand = () => {
    setErrorMessage('');
    if (!customDemandText.trim()) {
      setErrorMessage('Digite qual é o seu desejo ou exigência especial!');
      return;
    }

    if (puddingBalance < customDemandCost) {
      playCutePop();
      setErrorMessage(`Você precisa de ${customDemandCost} 🍮 para enviar esta exigência!`);
      return;
    }

    const success = onDeductPuddings(customDemandCost, `Exigência da Rainha: ${customDemandText}`);
    if (success) {
      playBoing();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#FAD02C', '#F59E0B', '#FFA5A5'],
        });
      } catch {
        // Safe fallback
      }

      const waUrl = generateWhatsAppRewardUrl(`Pedido Especial: ${customDemandText.trim()}`, 'Resgatado no aplicativo PurinFit!');
      window.open(waUrl, '_blank');
      setCustomDemandText('');
      onClose();
    }
  };

  const handleSaveNewReward = () => {
    if (!newRewTitle.trim()) return;
    playCutePop();
    const newRew: RewardItem = {
      id: `rew_${Date.now()}`,
      title: newRewTitle.trim(),
      cost: Math.max(1, newRewCost),
      description: newRewDesc.trim(),
      icon: newRewIcon || '🎁',
    };
    onUpdateRewards([...rewards, newRew]);
    setIsAddingCustomReward(false);
    setNewRewTitle('');
    setNewRewDesc('');
  };

  const handleDeleteReward = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playCutePop();
    const updated = rewards.filter((r) => r.id !== id);
    onUpdateRewards(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-md bg-[#FFFDF2] rounded-3xl border-3 border-[#F7C815] p-5 shadow-2xl my-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rewards-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fechar Lojinha de Mimos"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#FEF3C7] text-[#7A4B29] hover:bg-[#FDE68A] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header & Gift Mascot */}
        <div className="text-center pb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-black uppercase tracking-wider mb-2 border border-[#FDE68A]">
            <Gift className="w-4 h-4 text-[#E68A00]" />
            <span>Lojinha de Mimos</span>
            <Sparkles className="w-4 h-4 text-[#E68A00]" />
          </div>

          <h2 id="rewards-title" className="text-xl font-black text-[#5A3317] tracking-tight">
            Troque seus Pudins por Mimos! 🍮✨
          </h2>
          <p className="text-xs text-[#7A4B29] font-semibold mt-0.5">
            Você se cuidou, treinou e bebeu água. Agora é a vez de resgatar um agrado especial!
          </p>

          {/* Current Pudding Balance Display */}
          <div className="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-linear-to-r from-[#FEF3C7] via-[#FFFBEB] to-[#FEF3C7] border-2 border-[#FAD02C] shadow-xs">
            <span className="text-2xl">🍮</span>
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#92400E]">Seu Saldo</span>
              <p className="text-lg font-black text-[#5A3317] leading-none">
                {puddingBalance} {puddingBalance === 1 ? 'Pudim' : 'Pudins'}
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="my-2 p-2.5 rounded-xl bg-[#FEE2E2] border border-[#F87171] text-[#991B1B] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SPECIAL BOX: "Mimo Personalizado / Pedido Especial ✨" */}
        <div className="mt-4 bg-[#FEF9E7] border-2 border-dashed border-[#FAD02C] rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-xs text-[#92400E]">
              <Gift className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Mimo Personalizado / Pedido Especial ✨</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-black text-[#7A4B29]">
              <span>Custo:</span>
              <select
                value={customDemandCost}
                onChange={(e) => setCustomDemandCost(parseInt(e.target.value, 10))}
                className="bg-white border border-[#F3E7C4] rounded-md px-1 py-0.5 font-black text-xs"
              >
                <option value={1}>1 🍮</option>
                <option value={2}>2 🍮</option>
                <option value={3}>3 🍮</option>
                <option value={4}>4 🍮</option>
                <option value={5}>5 🍮</option>
              </select>
            </div>
          </div>

          <textarea
            rows={2}
            value={customDemandText}
            onChange={(e) => setCustomDemandText(e.target.value)}
            placeholder="Ex: Fazer um doce gostoso, massagem, escolher onde vamos comer..."
            className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C] resize-none"
          />

          <button
            onClick={handleClaimCustomDemand}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FAD02C] hover:bg-[#F7C815] active:scale-95 text-[#5A3317] font-black text-xs shadow-xs border-b-2 border-[#D97706] flex items-center justify-center gap-2 transition-transform"
          >
            <MessageCircle className="w-4 h-4 fill-[#25D366] text-white" />
            <span>Enviar Pedido Direto no WhatsApp ({customDemandCost} 🍮)</span>
          </button>
        </div>

        {/* Standard Rewards List */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8C5E3C] uppercase tracking-wider">
              Cardápio Oficial de Mimos
            </span>
            <button
              onClick={() => setIsAddingCustomReward(true)}
              className="text-[11px] font-black text-[#92400E] hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Criar Mimo
            </button>
          </div>

          <div className="space-y-2">
            {rewards.map((reward) => {
              const canAfford = puddingBalance >= reward.cost;
              return (
                <div
                  key={reward.id}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2.5 ${
                    canAfford
                      ? 'border-[#F6E09D] bg-white hover:border-[#FAD02C]'
                      : 'border-[#F3E7C4] bg-white/60 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    <span className="text-2xl flex-shrink-0">{reward.icon || '🍮'}</span>
                    <div>
                      <div className="text-xs font-black text-[#5A3317] leading-tight">
                        {reward.title}
                      </div>
                      {reward.description && (
                        <div className="text-[10px] font-semibold text-[#8C5E3C] mt-0.5">
                          {reward.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] font-black text-xs border border-[#FDE68A]">
                      {reward.cost} 🍮
                    </span>

                    <button
                      onClick={() => handleClaimStandardReward(reward)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition-all ${
                        canAfford
                          ? 'bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xs active:scale-95'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white text-transparent" />
                      <span>Pedir</span>
                    </button>

                    <button
                      onClick={(e) => handleDeleteReward(reward.id, e)}
                      className="p-1 rounded-lg text-gray-400 hover:text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
                      title="Excluir mimo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal: Add New Custom Reward */}
        {isAddingCustomReward && (
          <div className="mt-4 p-3 bg-white border-2 border-[#FAD02C] rounded-2xl space-y-2">
            <h4 className="text-xs font-black text-[#5A3317]">Criar Novo Mimo</h4>
            <input
              type="text"
              placeholder="Ex: Fazer panquecas no domingo de manhã..."
              value={newRewTitle}
              onChange={(e) => setNewRewTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-bold text-[#5A3317] bg-[#FEF9E7] border border-[#F3E7C4] rounded-xl focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[#8C5E3C]">Custo em Pudins</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newRewCost}
                  onChange={(e) => setNewRewCost(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-2 py-1 text-xs font-bold text-[#5A3317] bg-[#FEF9E7] border border-[#F3E7C4] rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8C5E3C]">Ícone</label>
                <input
                  type="text"
                  value={newRewIcon}
                  onChange={(e) => setNewRewIcon(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-bold text-[#5A3317] bg-[#FEF9E7] border border-[#F3E7C4] rounded-lg text-center"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSaveNewReward}
                className="flex-1 py-1.5 rounded-xl bg-[#FAD02C] font-black text-xs text-[#5A3317]"
              >
                Salvar Mimo
              </button>
              <button
                onClick={() => setIsAddingCustomReward(false)}
                className="py-1.5 px-3 rounded-xl bg-gray-100 font-bold text-xs text-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
