import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PRESET_WORKOUTS,
  DEFAULT_DANCE_BLOCKS,
  DEFAULT_REWARDS,
  calculateWorkoutProgress,
  calculateWaterPercentage,
  getWaterCheerMessage,
  calculateCreatineStreak,
  formatSecondsToMMSS,
  parseMMSSToSeconds,
  generateWhatsAppRewardUrl,
} from './fitnessLogic.ts';

test('DEFAULT_PRESET_WORKOUTS has A, B, C with substitutes (Plano B)', () => {
  const wA = DEFAULT_PRESET_WORKOUTS.A;
  assert.equal(Boolean(wA), true);
  assert.equal(wA.exercises.length, 4);

  // Verify requested substitutes
  assert.equal(wA.exercises[0].substituteName, 'Agachamento com Halter Leve');
  assert.equal(wA.exercises[1].substituteName, 'Pulldown / Graviton');
  assert.equal(wA.exercises[2].substituteName, 'Glúteo na Máquina');
  assert.equal(wA.exercises[3].substituteName, 'Abdominal Máquina Sentada (sem chão)');

  const wB = DEFAULT_PRESET_WORKOUTS.B;
  assert.equal(wB.exercises[0].substituteName, 'Afundo Apoiado');
  assert.equal(wB.exercises[1].substituteName, 'Desenvolvimento com Halteres Leves (2kg)');
  assert.equal(wB.exercises[2].substituteName, 'Glúteo Polia / Ponte no Colchonete');
  assert.equal(wB.exercises[3].substituteName, 'Tríceps Máquina');
});

test('DEFAULT_DANCE_BLOCKS are properly configured', () => {
  assert.equal(DEFAULT_DANCE_BLOCKS.length, 3);
  assert.equal(DEFAULT_DANCE_BLOCKS[0].durationSeconds, 180); // 03:00
  assert.equal(DEFAULT_DANCE_BLOCKS[1].durationSeconds, 600); // 10:00
  assert.equal(DEFAULT_DANCE_BLOCKS[2].durationSeconds, 420); // 07:00
});

test('DEFAULT_REWARDS are set for Queen and boyfriend claims', () => {
  assert.equal(DEFAULT_REWARDS.length, 4);
  assert.equal(DEFAULT_REWARDS[0].cost, 2);
  assert.equal(DEFAULT_REWARDS[1].cost, 1);
  assert.equal(DEFAULT_REWARDS[2].cost, 3);
  assert.equal(DEFAULT_REWARDS[3].cost, 4);
});

test('formatSecondsToMMSS and parseMMSSToSeconds work bidirectionally', () => {
  assert.equal(formatSecondsToMMSS(180), '03:00');
  assert.equal(formatSecondsToMMSS(600), '10:00');
  assert.equal(formatSecondsToMMSS(65), '01:05');
  assert.equal(formatSecondsToMMSS(0), '00:00');

  assert.equal(parseMMSSToSeconds('03:00'), 180);
  assert.equal(parseMMSSToSeconds('10:00'), 600);
  assert.equal(parseMMSSToSeconds('01:05'), 65);
  assert.equal(parseMMSSToSeconds('15'), 900); // 15 minutes shortcut
});

test('generateWhatsAppRewardUrl produces valid wa.me share link', () => {
  const url = generateWhatsAppRewardUrl('Massagem nos pés por 15 min', 'Bem relaxante');
  assert.equal(url.startsWith('https://wa.me/?text='), true);
  assert.equal(url.includes(encodeURIComponent('Massagem nos pés por 15 min')), true);
  assert.equal(url.includes(encodeURIComponent('Bem relaxante')), true);
});

test('calculateWorkoutProgress works accurately', () => {
  const exercises = DEFAULT_PRESET_WORKOUTS.A.exercises;
  const empty = calculateWorkoutProgress(exercises, {});
  assert.equal(empty.totalSets, 11);
  assert.equal(empty.completedSets, 0);

  const partial = calculateWorkoutProgress(exercises, {
    leg_press: { completedSets: [true, true, false], weightKg: '20' },
  });
  assert.equal(partial.completedSets, 2);
  assert.equal(partial.isAllCompleted, false);
});

test('calculateWaterPercentage handles fractions and caps correctly', () => {
  assert.equal(calculateWaterPercentage(0, 2000), 0);
  assert.equal(calculateWaterPercentage(1000, 2000), 50);
  assert.equal(calculateWaterPercentage(2000, 2000), 100);
});

test('calculateCreatineStreak counts unbroken consecutive days correctly', () => {
  const refDate = '2026-10-23';
  assert.equal(calculateCreatineStreak({}, refDate), 0);
  assert.equal(calculateCreatineStreak({ '2026-10-23': true }, refDate), 1);
  assert.equal(calculateCreatineStreak({ '2026-10-23': true, '2026-10-22': true }, refDate), 2);
});
