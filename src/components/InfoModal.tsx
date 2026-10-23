import React, { useRef } from 'react';
import { exportPurinBackup, importPurinBackup } from '../utils/storage.ts';
import { PurinBackupData } from '../types/index.ts';
import { playCutePop, playBoing } from '../utils/audio.ts';
import {
  X,
  Smartphone,
  CheckCircle,
  Download,
  Upload,
  ShieldCheck,
  Heart,
  Sparkles,
} from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreBackupSuccess: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  onRestoreBackupSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    playCutePop();
    const backupData = exportPurinBackup();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `purinfit-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportClick = () => {
    playCutePop();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as PurinBackupData;
        const success = importPurinBackup(json);
        if (success) {
          playBoing();
          alert('Backup restaurado com sucesso! Seus dados foram carregados.');
          onRestoreBackupSuccess();
          onClose();
        } else {
          alert('Formato de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-md bg-[#FFFDF2] rounded-3xl border-3 border-[#F7C815] p-5 shadow-2xl my-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-title"
      >
        <button
          onClick={onClose}
          aria-label="Fechar guia"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FEF3C7] text-[#7A4B29] hover:bg-[#FDE68A] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🍮</span>
          <h2 id="info-title" className="text-lg font-black text-[#5A3317]">
            Guia & Backup PurinFit
          </h2>
        </div>

        <div className="space-y-3.5 text-xs text-[#7A4B29] font-semibold leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
          {/* Backup e Portabilidade */}
          <div className="bg-[#FEF3C7] p-3 rounded-2xl border-2 border-[#F59E0B]">
            <h3 className="font-black text-sm text-[#92400E] mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Backup & Portabilidade (JSON)
            </h3>
            <p className="mb-2.5">
              Nunca perca seus dados ao trocar de celular ou navegador! Baixe seu arquivo ou importe um backup salvo:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportBackup}
                className="py-2.5 px-2 rounded-xl bg-[#FAD02C] hover:bg-[#F7C815] text-[#5A3317] font-black text-xs flex items-center justify-center gap-1.5 border-b-2 border-[#D97706] shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar (.JSON)</span>
              </button>

              <button
                onClick={handleImportClick}
                className="py-2.5 px-2 rounded-xl bg-white hover:bg-[#FEF9E7] text-[#7A4B29] font-black text-xs flex items-center justify-center gap-1.5 border border-[#F3E7C4] shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar (.JSON)</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Section 1 */}
          <div className="bg-[#FEF9E7] p-3 rounded-2xl border border-[#FDE68A]">
            <h3 className="font-black text-sm text-[#92400E] mb-1">
              Dançar ou Treinar: Você no Controle
            </h3>
            <p>
              Em dias que não quiser academia, a aba <strong>Dança 💃</strong> tem o mesmo valor de treino pago. Solte a música, dance no seu quarto por 10 a 20 minutos e ganhe os mesmos <strong>+2 Pudins</strong> para resgatar mimos na sua Lojinha de Mimos!
            </p>
          </div>

          {/* Section 2: Regras de ouro */}
          <div className="bg-white p-3 rounded-2xl border border-[#F3E7C4] space-y-2">
            <h3 className="font-black text-sm text-[#5A3317]">
              As Regras Anti-Trauma:
            </h3>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
              <p>
                <strong>Aparelho Ocupado? Trocar 🔄:</strong> Nunca espere fila nem deite em colchonete sujo. Use o botão no card para alternar pelo Plano B imediatamente.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
              <p>
                <strong>Carga suave:</strong> Termine sentindo que conseguiria fazer mais 4 repetições. O foco do primeiro mês é construir o hábito sem dores excessivas!
              </p>
            </div>
          </div>

          {/* Section 3: Instalar como App no Celular */}
          <div className="bg-white p-3 rounded-2xl border border-[#F3E7C4]">
            <div className="flex items-center gap-1.5 font-black text-sm text-[#92400E] mb-1">
              <Smartphone className="w-4 h-4" />
              <span>Como virar um App no seu Celular:</span>
            </div>
            <p className="mb-2">
              Você pode colocar o ícone fofo do Pompompurin na sua tela de início sem precisar de loja:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>No iPhone (Safari):</strong> Toque no botão Compartilhar (quadrado com setinha para cima) e escolha <em>"Adicionar à Tela de Início"</em>.</li>
              <li><strong>No Android (Chrome):</strong> Toque nos 3 pontinhos no canto superior e selecione <em>"Adicionar à tela inicial"</em>.</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-2xl bg-[#FAD02C] hover:bg-[#F7C815] text-[#5A3317] font-black text-sm shadow-sm border-b-2 border-[#D97706]"
        >
          Entendido, vamos lá! 🍮
        </button>
      </div>
    </div>
  );
};
