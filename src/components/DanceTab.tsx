import React, { useState, useEffect } from 'react';
import { DanceState, DanceBlock } from '../types/index.ts';
import { formatSecondsToMMSS, parseMMSSToSeconds } from '../utils/fitnessLogic.ts';
import { playCutePop, playBoing, playWaterSip } from '../utils/audio.ts';
import { requestScreenWakeLock, releaseScreenWakeLock } from '../utils/wakeLock.ts';
import { PompomMascot } from './PompomMascot.tsx';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  Sparkles,
  Music,
  CheckCircle2,
  Clock,
  Heart,
  Flame,
} from 'lucide-react';

interface DanceTabProps {
  danceState: DanceState;
  onUpdateDanceState: (state: DanceState) => void;
  onCompleteDance: (minutesDanced: number) => void;
}

export const DanceTab: React.FC<DanceTabProps> = ({
  danceState,
  onUpdateDanceState,
  onCompleteDance,
}) => {
  // Timer state
  const [selectedDuration, setSelectedDuration] = useState<number>(15 * 60); // default 15 min
  const [remainingSeconds, setRemainingSeconds] = useState<number>(15 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Custom quick time input modal/state
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('20');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Edit / Add Block state
  const [editingBlock, setEditingBlock] = useState<DanceBlock | null>(null);
  const [isAddingBlock, setIsAddingBlock] = useState<boolean>(false);
  const [blockTitle, setBlockTitle] = useState<string>('');
  const [blockDurationMMSS, setBlockDurationMMSS] = useState<string>('05:00');
  const [blockMusicUrl, setBlockMusicUrl] = useState<string>('');

  // Countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playBoing();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Keep screen awake while dance session is actively running
  useEffect(() => {
    if (isRunning) {
      requestScreenWakeLock();
    } else {
      releaseScreenWakeLock();
    }
    return () => {
      releaseScreenWakeLock();
    };
  }, [isRunning]);

  const handleSelectQuickMinutes = (mins: number) => {
    playCutePop();
    const secs = mins * 60;
    setSelectedDuration(secs);
    setRemainingSeconds(secs);
    setIsRunning(false);
    setActiveBlockId(null);
  };

  const handleApplyCustomMinutes = () => {
    const mins = parseInt(customMinutesInput, 10);
    if (!isNaN(mins) && mins > 0) {
      handleSelectQuickMinutes(mins);
      setShowCustomModal(false);
    }
  };

  const handleSelectBlock = (block: DanceBlock) => {
    playCutePop();
    setSelectedDuration(block.durationSeconds);
    setRemainingSeconds(block.durationSeconds);
    setActiveBlockId(block.id);
    setIsRunning(false);
  };

  const handleTogglePlay = () => {
    playCutePop();
    if (remainingSeconds <= 0) {
      setRemainingSeconds(selectedDuration);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    playCutePop();
    setIsRunning(false);
    setRemainingSeconds(selectedDuration);
  };

  const handleCompleteSession = () => {
    const minutes = Math.max(1, Math.round((selectedDuration - remainingSeconds) / 60) || Math.round(selectedDuration / 60));
    onCompleteDance(minutes);
  };

  // Block CRUD
  const handleOpenAddBlock = () => {
    playCutePop();
    setBlockTitle('');
    setBlockDurationMMSS('05:00');
    setBlockMusicUrl('');
    setEditingBlock(null);
    setIsAddingBlock(true);
  };

  const handleOpenEditBlock = (block: DanceBlock) => {
    playCutePop();
    setEditingBlock(block);
    setBlockTitle(block.title);
    setBlockDurationMMSS(formatSecondsToMMSS(block.durationSeconds));
    setBlockMusicUrl(block.musicUrl || '');
    setIsAddingBlock(true);
  };

  const handleSaveBlock = () => {
    playCutePop();
    if (!blockTitle.trim()) return;
    const durSecs = parseMMSSToSeconds(blockDurationMMSS) || 300;

    if (editingBlock) {
      // Update
      const updated = danceState.customBlocks.map((b) =>
        b.id === editingBlock.id
          ? { ...b, title: blockTitle.trim(), durationSeconds: durSecs, musicUrl: blockMusicUrl.trim() }
          : b
      );
      onUpdateDanceState({ ...danceState, customBlocks: updated });
    } else {
      // Create
      const newBlock: DanceBlock = {
        id: `dance_${Date.now()}`,
        title: blockTitle.trim(),
        durationSeconds: durSecs,
        musicUrl: blockMusicUrl.trim(),
      };
      onUpdateDanceState({
        ...danceState,
        customBlocks: [...danceState.customBlocks, newBlock],
      });
    }
    setIsAddingBlock(false);
    setEditingBlock(null);
  };

  const handleDeleteBlock = (blockId: string) => {
    playCutePop();
    const updated = danceState.customBlocks.filter((b) => b.id !== blockId);
    onUpdateDanceState({ ...danceState, customBlocks: updated });
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  };

  // Calculate elapsed progress percentage
  const elapsedSecs = selectedDuration - remainingSeconds;
  const progressPercent = selectedDuration > 0 ? Math.min(100, Math.round((elapsedSecs / selectedDuration) * 100)) : 0;

  return (
    <div className="space-y-4 pb-24">
      {/* Dance & Rhythm Header Encouragement */}
      <div className="bg-[#FFFDF2] border-2 border-[#F6E09D] rounded-3xl p-3.5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-xl flex-shrink-0">
            💃
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#92400E] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E68A00]" />
              Dança & Ritmo Anti-Trauma
            </h2>
            <p className="text-[11px] font-semibold text-[#7A4B29] leading-tight mt-0.5">
              Não quer academia hoje? Dançar queima calorias, liberta endorfina e vale como treino pago!
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] font-black text-xs border border-[#FDE68A]">
            +2 🍮
          </span>
        </div>
      </div>

      {/* Main Dancing Mascot & Big Timer Card */}
      <div className="bg-[#FFFDF2] border-2 border-[#F6E09D] rounded-3xl p-5 shadow-xs flex flex-col items-center relative overflow-hidden">
        {/* Animated Mascot: wobbles enthusiastically when dancing/timer is running */}
        <div className={`transition-transform duration-300 ${isRunning ? 'scale-110 animate-pudding' : ''}`}>
          <PompomMascot
            mood={isRunning ? 'celebrate' : 'happy'}
            size="md"
            interactiveMode="tongue"
            speechText={
              isRunning
                ? 'Solta o corpinho e dança! O Purin está no ritmo com você! 🍮💃'
                : 'Escolha a duração e aperte o play para dançar!'
            }
          />
        </div>

        {/* Big Countdown Timer */}
        <div className="mt-4 text-center">
          <div className="text-5xl font-black text-[#5A3317] font-mono tracking-tight drop-shadow-xs">
            {formatSecondsToMMSS(remainingSeconds)}
          </div>
          <div className="text-xs font-extrabold text-[#8C5E3C] mt-1">
            {activeBlockId
              ? `Bloco: ${danceState.customBlocks.find((b) => b.id === activeBlockId)?.title || 'Coreografia'}`
              : `Sessão Livre de ${Math.round(selectedDuration / 60)} minutos`}
          </div>

          {/* Progress bar */}
          <div className="w-48 h-2.5 bg-[#FEF3C7] rounded-full mx-auto mt-2 overflow-hidden border border-[#FDE68A]">
            <div
              className="h-full bg-linear-to-r from-[#FAD02C] to-[#F59E0B] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timer Play / Pause / Reset Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleTogglePlay}
            aria-label={isRunning ? 'Pausar dança' : 'Iniciar dança'}
            className="px-6 py-3 rounded-2xl bg-[#FAD02C] hover:bg-[#F7C815] active:scale-95 text-[#5A3317] font-black text-base shadow-md border-b-3 border-[#D97706] flex items-center gap-2 transition-transform"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-[#5A3317]" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-[#5A3317]" />
                <span>Iniciar Dança! 💃</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            aria-label="Reiniciar timer de dança"
            className="p-3 rounded-2xl bg-[#FEF3C7] text-[#7A4B29] hover:bg-[#FDE68A] active:scale-95 border border-[#FDE68A] transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Time Selector Buttons */}
        <div className="mt-4 pt-3 border-t border-[#F3E7C4] w-full">
          <div className="text-[11px] font-black text-[#8C5E3C] uppercase tracking-wider mb-2 text-center">
            Duração Rápida (Minutos)
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[10, 15, 20, 30].map((mins) => {
              const secs = mins * 60;
              const isSelected = selectedDuration === secs && !activeBlockId;
              return (
                <button
                  key={mins}
                  onClick={() => handleSelectQuickMinutes(mins)}
                  className={`py-2 px-1 rounded-xl text-center text-xs font-black transition-all ${
                    isSelected
                      ? 'bg-[#FAD02C] text-[#5A3317] border-b-2 border-[#D97706] shadow-xs'
                      : 'bg-[#FEF9E7] text-[#7A4B29] hover:bg-[#FEF3C7] border border-[#F3E7C4]'
                  }`}
                >
                  {mins}m
                </button>
              );
            })}
            <button
              onClick={() => setShowCustomModal(true)}
              className="py-2 px-1 rounded-xl text-center text-xs font-black bg-[#FEF9E7] text-[#7A4B29] hover:bg-[#FEF3C7] border border-[#F3E7C4]"
            >
              Outro ✏️
            </button>
          </div>
        </div>
      </div>

      {/* Routine Blocks (Mode 2: Agnóstico e Editável) */}
      <div className="bg-[#FFFDF2] border-2 border-[#F6E09D] rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#5A3317] flex items-center gap-1.5">
              <Music className="w-4 h-4 text-[#D97706]" />
              Blocos & Rotina de Dança
            </h3>
            <p className="text-[11px] text-[#8C5E3C] font-semibold">
              Toque em um bloco para carregar o tempo ou abra suas músicas favoritas!
            </p>
          </div>
          <button
            onClick={handleOpenAddBlock}
            className="px-2.5 py-1.5 rounded-xl bg-[#FAD02C] hover:bg-[#F7C815] text-[#5A3317] font-black text-xs flex items-center gap-1 shadow-xs border-b-2 border-[#D97706]"
          >
            <Plus className="w-3.5 h-3.5" /> Bloco
          </button>
        </div>

        {/* Blocks List */}
        <div className="space-y-2">
          {danceState.customBlocks.map((block) => {
            const isBlockActive = activeBlockId === block.id;
            return (
              <div
                key={block.id}
                className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2 ${
                  isBlockActive
                    ? 'border-[#FAD02C] bg-[#FFFBEB] shadow-xs'
                    : 'border-[#F3E7C4] bg-[#FEF9E7]/60 hover:bg-[#FEF9E7]'
                }`}
              >
                {/* Clickable Area to Load Time */}
                <button
                  type="button"
                  onClick={() => handleSelectBlock(block)}
                  className="flex items-center gap-2.5 flex-1 text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isBlockActive ? 'bg-[#FAD02C] text-[#5A3317]' : 'bg-[#FEF3C7] text-[#7A4B29]'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#5A3317]">{block.title}</div>
                    <div className="text-[10px] font-bold text-[#8C5E3C]">
                      {formatSecondsToMMSS(block.durationSeconds)} min
                    </div>
                  </div>
                </button>

                {/* External Music Link & Edit / Delete */}
                <div className="flex items-center gap-1">
                  {block.musicUrl && (
                    <a
                      href={block.musicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ouvir no YouTube / Spotify"
                      className="p-1.5 rounded-lg bg-[#E0F2FE] text-[#0284C7] hover:bg-[#BAE6FD] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => handleOpenEditBlock(block)}
                    className="p-1.5 rounded-lg bg-[#FEF3C7] text-[#7A4B29] hover:bg-[#FDE68A] transition-colors"
                    title="Editar bloco"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-1.5 rounded-lg text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
                    title="Excluir bloco"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete Dance Session Button */}
      <div className="pt-1">
        <button
          onClick={handleCompleteSession}
          className="w-full py-4 px-6 rounded-2xl bg-[#FAD02C] hover:bg-[#F7C815] active:scale-98 text-[#5A3317] font-black text-base shadow-md border-b-4 border-[#D97706] transition-transform flex items-center justify-center gap-2"
        >
          <span className="text-xl">💃</span>
          <span>Concluir Sessão de Dança! 💃🍮 (+2 🍮)</span>
        </button>
        <p className="text-[11px] font-bold text-center text-[#8C5E3C] mt-2">
          Gera o mesmo resultado de bem-estar da academia e garante +2 Pudins para sua Lojinha de Mimos!
        </p>
      </div>

      {/* Modal: Custom Minutes Quick Input */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-[#FFFDF2] rounded-3xl border-3 border-[#F7C815] p-5 shadow-2xl text-center">
            <h4 className="text-sm font-black text-[#5A3317]">Tempo Customizado</h4>
            <p className="text-xs text-[#7A4B29] mt-1">Quantos minutos você deseja dançar?</p>
            <input
              type="number"
              min="1"
              max="120"
              value={customMinutesInput}
              onChange={(e) => setCustomMinutesInput(e.target.value)}
              className="mt-3 w-28 mx-auto text-center font-black text-2xl text-[#5A3317] bg-white border-2 border-[#FAD02C] rounded-2xl py-2 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={handleApplyCustomMinutes}
                className="py-2.5 rounded-xl bg-[#FAD02C] font-black text-xs text-[#5A3317] border-b-2 border-[#D97706]"
              >
                Aplicar
              </button>
              <button
                onClick={() => setShowCustomModal(false)}
                className="py-2.5 rounded-xl bg-[#FEF3C7] font-bold text-xs text-[#7A4B29]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Dance Block */}
      {isAddingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#FFFDF2] rounded-3xl border-3 border-[#F7C815] p-5 shadow-2xl space-y-3">
            <h4 className="text-sm font-black text-[#5A3317]">
              {editingBlock ? 'Editar Bloco de Dança' : 'Novo Bloco de Dança'}
            </h4>
            <div>
              <label className="text-[11px] font-black text-[#8C5E3C] uppercase">Nome do Bloco</label>
              <input
                type="text"
                placeholder="Ex: Aquecimento, Coreografia K-pop..."
                value={blockTitle}
                onChange={(e) => setBlockTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-[#8C5E3C] uppercase">Duração (MM:SS)</label>
              <input
                type="text"
                placeholder="Ex: 05:00 ou 10:00"
                value={blockDurationMMSS}
                onChange={(e) => setBlockDurationMMSS(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-[#8C5E3C] uppercase">
                Link da Música / Vídeo (Opcional - YouTube/Spotify)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={blockMusicUrl}
                onChange={(e) => setBlockMusicUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-[#5A3317] bg-white border-2 border-[#F3E7C4] rounded-xl focus:outline-none focus:border-[#FAD02C]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleSaveBlock}
                className="py-2.5 rounded-xl bg-[#FAD02C] font-black text-xs text-[#5A3317] border-b-2 border-[#D97706]"
              >
                Salvar Bloco
              </button>
              <button
                onClick={() => setIsAddingBlock(false)}
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
