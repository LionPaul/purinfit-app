import type {
  WorkoutDay,
  ExerciseLog,
  ExerciseDefinition,
  DanceBlock,
  RewardItem,
  DailyHabit,
} from '../types/index.ts';

export const DEFAULT_PRESET_WORKOUTS: Record<string, WorkoutDay> = {
  A: {
    id: 'A',
    name: 'Treino A',
    subtitle: 'Pernas & Postura',
    tag: 'Foco Inferior & Costas',
    exercises: [
      {
        id: 'leg_press',
        name: 'Leg Press 45° ou Horizontal',
        focus: 'Perna inteira com segurança máxima',
        targetSeries: 3,
        targetReps: '10 a 12 repetições',
        note: 'Apoie bem a lombar no banco. Movimento suave e controlado.',
        category: 'pernas',
        recommendation: 'Use carga bem leve para começar sentindo segurança.',
        restSeconds: 120,
        substituteName: 'Agachamento com Halter Leve',
        substituteReps: '10 a 12 repetições',
        isUsingSubstitute: false,
      },
      {
        id: 'puxada_alta',
        name: 'Puxada Alta na Polia (aberta)',
        focus: 'Melhora postura e desenha as costas',
        targetSeries: 3,
        targetReps: '10 a 12 repetições',
        note: 'Puxe em direção ao peitoral superior, mantendo o peito aberto.',
        category: 'costas',
        recommendation: 'Sinta as costas abraçando as escápulas.',
        restSeconds: 120,
        substituteName: 'Pulldown / Graviton',
        substituteReps: '10 a 12 repetições',
        isUsingSubstitute: false,
      },
      {
        id: 'cadeira_abdutora',
        name: 'Cadeira Abdutora',
        focus: 'Glúteo confortável sentada',
        targetSeries: 3,
        targetReps: '15 repetições',
        note: 'Sente com postura ereta e abra com controle.',
        category: 'gluteo',
        recommendation: 'Muito gostosa e confortável de fazer.',
        restSeconds: 120,
        substituteName: 'Glúteo na Máquina',
        substituteReps: '12 a 15 repetições',
        isUsingSubstitute: false,
      },
      {
        id: 'prancha_abdominal',
        name: 'Prancha Abdominal',
        focus: 'Core firme sem forçar o pescoço',
        targetSeries: 2,
        targetReps: '20 a 30 segundos',
        note: 'Apoie antebraços no chão, abdômen ativado e respire calma.',
        category: 'core',
        recommendation: 'Pode apoiar os joelhos no chão se preferir!',
        restSeconds: 120,
        substituteName: 'Abdominal Máquina Sentada (sem chão)',
        substituteReps: '12 repetições',
        isUsingSubstitute: false,
      },
    ],
  },
  B: {
    id: 'B',
    name: 'Treino B',
    subtitle: 'Membros Superiores & Glúteo',
    tag: 'Foco Coxa, Peito & Glúteo',
    exercises: [
      {
        id: 'cadeira_extensora',
        name: 'Cadeira Extensora',
        focus: 'Frente da coxa (quadríceps)',
        targetSeries: 3,
        targetReps: '10 a 12 repetições',
        note: 'Ajuste o rolo na canela. Suba suave e segure 1 segundo no topo.',
        category: 'pernas',
        recommendation: 'Deixe um peso que você sinta confortável.',
        restSeconds: 120,
        substituteName: 'Afundo Apoiado',
        substituteReps: '10 repetições cada perna',
        isUsingSubstitute: false,
      },
      {
        id: 'supino_maquina',
        name: 'Supino na Máquina',
        focus: 'Peitoral, ombros e postura',
        targetSeries: 3,
        targetReps: '10 repetições',
        note: 'Máquina guiada confortável. Empurre sem trancar os cotovelos.',
        category: 'peito_ombro',
        recommendation: 'Mais seguro e confortável que barra livre.',
        restSeconds: 120,
        substituteName: 'Desenvolvimento com Halteres Leves (2kg)',
        substituteReps: '10 repetições',
        isUsingSubstitute: false,
      },
      {
        id: 'elevacao_pelvica',
        name: 'Elevação Pélvica na Máquina',
        focus: 'Glúteo isolado e firme',
        targetSeries: 3,
        targetReps: '12 repetições',
        note: 'Aperte o bumbum no ponto mais alto por 1 segundo.',
        category: 'gluteo',
        recommendation: 'Excelente para tonificar sem sobrecarregar a coluna.',
        restSeconds: 120,
        substituteName: 'Glúteo Polia / Ponte no Colchonete',
        substituteReps: '12 repetições',
        isUsingSubstitute: false,
      },
      {
        id: 'triceps_polia',
        name: 'Tríceps na Polia com corda',
        focus: 'Músculo do tchauzinho',
        targetSeries: 2,
        targetReps: '12 repetições',
        note: 'Mantenha os cotovelos coladinhos na lateral do corpo.',
        category: 'braco',
        recommendation: 'Abra a corda no final do movimento.',
        restSeconds: 120,
        substituteName: 'Tríceps Máquina',
        substituteReps: '12 repetições',
        isUsingSubstitute: false,
      },
    ],
  },
  C: {
    id: 'C',
    name: 'Treino C',
    subtitle: 'Posterior de Coxa & Costas',
    tag: 'Foco Posterior, Ombros & Panturrilha',
    exercises: [
      {
        id: 'cadeira_flexora',
        name: 'Cadeira Flexora',
        focus: 'Atrás da coxa (isquiotibiais)',
        targetSeries: 3,
        targetReps: '10 a 12 repetições',
        note: 'Puxe os calcanhares para trás com calma.',
        category: 'pernas',
        recommendation: 'Ajuste o banco para seus joelhos ficarem alinhados.',
        restSeconds: 120,
        substituteName: 'Mesa Flexora / Stiff Leve',
        substituteReps: '10 a 12 repetições',
        isUsingSubstitute: false,
      },
      {
        id: 'remada_baixa',
        name: 'Remada Baixa sentada na máquina/polia',
        focus: 'Costas bem alinhadas e postura elegante',
        targetSeries: 3,
        targetReps: '10 a 12 repetições',
        note: 'Puxe o triângulo no umbigo estufando o peito com carinho.',
        category: 'costas',
        recommendation: 'Puxada gostosa que alivia dores nas costas.',
        restSeconds: 120,
        substituteName: 'Remada Curvada com Halteres',
        substituteReps: '10 repetições',
        isUsingSubstitute: false,
      },
      {
        id: 'elevacao_lateral',
        name: 'Elevação Lateral com halteres leves (1kg a 2kg)',
        focus: 'Desenha os ombros e dá formato lindo',
        targetSeries: 3,
        targetReps: '12 a 15 repetições',
        note: 'Halteres levinhos! Eleve até a altura dos ombros.',
        category: 'peito_ombro',
        recommendation: 'Sem pressa: halter de 1kg ou 2kg já faz mágica.',
        restSeconds: 120,
        substituteName: 'Desenvolvimento Halteres Leves',
        substituteReps: '10 a 12 repetições',
        isUsingSubstitute: false,
      },
      {
        id: 'panturrilha',
        name: 'Panturrilha em pé ou na máquina',
        focus: 'Circulação sanguínea e pernas tonificadas',
        targetSeries: 2,
        targetReps: '15 repetições',
        note: 'Fique na ponta dos pés, segure 1 segundo e desça devagar.',
        category: 'pernas',
        recommendation: 'O segundo coração do corpo! Super rápido de fazer.',
        restSeconds: 120,
        substituteName: 'Panturrilha no Degrau / Sentada',
        substituteReps: '15 repetições',
        isUsingSubstitute: false,
      },
    ],
  },
};

export const DEFAULT_DANCE_BLOCKS: DanceBlock[] = [
  {
    id: 'block_aquecimento',
    title: 'Aquecimento Fofo',
    durationSeconds: 180, // 03:00
    musicUrl: '',
  },
  {
    id: 'block_coreografia',
    title: 'Treino de Coreografia',
    durationSeconds: 600, // 10:00
    musicUrl: '',
  },
  {
    id: 'block_cardio_livre',
    title: 'Dança Livre / Cardio Gostoso',
    durationSeconds: 420, // 07:00
    musicUrl: '',
  },
];

export const DEFAULT_REWARDS: RewardItem[] = [
  {
    id: 'rew_massagem',
    title: 'Massagem nos pés ou costas por 15 min',
    cost: 2,
    description: 'Com óleo cheiroso ou creme, bem relaxante.',
    icon: '💆‍♀️',
  },
  {
    id: 'rew_lanche',
    title: 'Buscar água, doce ou lanche sem reclamar',
    cost: 1,
    description: 'Serviço carinhoso com entrega rápida.',
    icon: '🛏️',
  },
  {
    id: 'rew_filme',
    title: 'Escolher o filme ou onde vamos comer hoje',
    cost: 3,
    description: 'Poder de decisão sem discussão!',
    icon: '🍕',
  },
  {
    id: 'rew_obediencia',
    title: 'Pedido Especial: Tarefa à minha escolha',
    cost: 4,
    description: 'Um agrado especial que deve ser cumprido com carinho!',
    icon: '🎁',
  },
];

export const DEFAULT_DAILY_HABITS: DailyHabit[] = [
  {
    id: 'hab_vitaminas',
    title: 'Tomar Vitaminas / Remédios',
    icon: '💊',
    completedDates: {},
  },
  {
    id: 'hab_skincare',
    title: 'Skincare do Dia',
    icon: '✨',
    completedDates: {},
  },
  {
    id: 'hab_alongamento',
    title: 'Alongar 5 minutinhos',
    icon: '🧘‍♀️',
    completedDates: {},
  },
];

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthIndex = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)} de ${monthNames[monthIndex] || month}`;
}

export function formatSecondsToMMSS(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function parseMMSSToSeconds(str: string): number {
  if (!str) return 0;
  const parts = str.trim().split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  const justMins = parseInt(str, 10) || 0;
  return justMins * 60;
}

export function calculateWorkoutProgress(
  exercises: { id: string; targetSeries: number }[],
  logs: Record<string, ExerciseLog>
): { completedSets: number; totalSets: number; percentage: number; isAllCompleted: boolean } {
  let completedSets = 0;
  let totalSets = 0;

  for (const ex of exercises) {
    totalSets += ex.targetSeries;
    const log = logs[ex.id];
    if (log && Array.isArray(log.completedSets)) {
      const checkedCount = log.completedSets.filter(Boolean).length;
      completedSets += checkedCount;
    }
  }

  const percentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  return {
    completedSets,
    totalSets,
    percentage,
    isAllCompleted: totalSets > 0 && completedSets >= totalSets,
  };
}

export function calculateWaterPercentage(currentMl: number, goalMl: number): number {
  if (goalMl <= 0) return 0;
  return Math.min(Math.round((currentMl / goalMl) * 100), 150);
}

export function getWaterCheerMessage(currentMl: number, goalMl: number): {
  message: string;
  emoji: string;
  level: 'starter' | 'ongoing' | 'halfway' | 'almost' | 'achieved' | 'super';
} {
  const pct = goalMl > 0 ? (currentMl / goalMl) * 100 : 0;

  if (pct === 0) {
    return {
      message: 'Comece o dia com um golinho refrescante! O Pompompurin já pegou a dele 🍮',
      emoji: '🌤️',
      level: 'starter',
    };
  }
  if (pct < 30) {
    return {
      message: 'Hidratando com carinho! Cada gole é autocuidado e pele radiante ✨',
      emoji: '💧',
      level: 'ongoing',
    };
  }
  if (pct < 60) {
    return {
      message: 'Metadinha do caminho já foi! Você está mandando super bem!',
      emoji: '🍯',
      level: 'halfway',
    };
  }
  if (pct < 100) {
    return {
      message: 'Quase lá! Falta muito pouquinho para bater a meta de hoje!',
      emoji: '🍮',
      level: 'almost',
    };
  }
  if (pct === 100) {
    return {
      message: 'Meta de água batida com sucesso! Você é uma fofura super hidratada! 💛',
      emoji: '🎉',
      level: 'achieved',
    };
  }
  return {
    message: 'Uau, hidratação de rainha! O Purin está dando pulinhos de alegria! 👑💧',
    emoji: '⭐',
    level: 'super',
  };
}

export function calculateCreatineStreak(
  records: Record<string, boolean>,
  todayDateStr: string = getLocalDateString()
): number {
  let streak = 0;
  const today = new Date(todayDateStr + 'T12:00:00');
  
  const takenToday = Boolean(records[todayDateStr]);
  let checkDate = new Date(today);

  if (takenToday) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = getLocalDateString(checkDate);
    if (records[dateStr]) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getPastDaysList(numDays: number = 7, referenceDateStr: string = getLocalDateString()) {
  const list = [];
  const ref = new Date(referenceDateStr + 'T12:00:00');
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    list.push({
      dateStr,
      dayNum: d.getDate(),
      dayLabel: dayLabels[d.getDay()],
      isToday: i === 0,
    });
  }

  return list;
}

/**
 * Generate a prefilled WhatsApp share message for claiming a reward
 */
export function generateWhatsAppRewardUrl(rewardTitle: string, customNote?: string): string {
  let text = `Oii! 🍮✨\n\nAcabei de cumprir minha rotina de autocuidado no PurinFit e vim resgatar um mimo com meus pudins:\n\n✨ *${rewardTitle}* ✨`;
  if (customNote) {
    text += `\n\nDetalhes do pedido: "${customNote}"`;
  }
  text += `\n\nFavor cumprir com carinho, porque hoje eu mandei super bem! Te amo muito! 💛🍮✨`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
