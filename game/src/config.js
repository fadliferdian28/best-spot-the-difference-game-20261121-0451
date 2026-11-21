// Harbour Lights — tuning constants for every round, the timer and the score.
// One place owns the numbers so a round can be rebalanced without touching logic.
export const PANEL_WIDTH = 560;
export const PANEL_HEIGHT = 420;
export const WRONG_CLICK_PENALTY_SECONDS = 5;
export const HINTS_PER_ROUND = 3;
export const HINT_COOLDOWN_SECONDS = 5;
export const HINT_PULSE_MS = 2500;
export const FIND_POINTS = 100;
export const TIME_BONUS_PER_SECOND = 10;
export const PERFECT_ROUND_BONUS = 250;
export const LOW_TIME_WARNING_SECONDS = 30;

export const ROUNDS = [
  { index: 0, name: 'Morning Harbour', subtitle: 'The harbour wakes up — 7 differences, fairly visible', timeSeconds: 150 },
  { index: 1, name: 'Lantern Dusk', subtitle: 'Lanterns lit, colours shift — 10 differences, subtler', timeSeconds: 150 },
  { index: 2, name: 'Midnight Tide', subtitle: 'Under the moon — 12 differences, tiny and near-identical', timeSeconds: 180 },
];
