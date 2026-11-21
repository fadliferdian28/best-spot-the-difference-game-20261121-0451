// Harbour Lights — the game state machine: menu, playing, round-complete, final.
// Holds the score, the timer, found differences and hints; knows nothing about
// the DOM, so the playtest can drive it without a browser.
import { FIND_POINTS, TIME_BONUS_PER_SECOND, PERFECT_ROUND_BONUS, WRONG_CLICK_PENALTY_SECONDS, HINTS_PER_ROUND } from './config.js';
import { SCENES } from './scenes.js';

export const PHASES = {
  MENU: 'menu',
  PLAYING: 'playing',
  ROUND_COMPLETE: 'round-complete',
  FINAL: 'final',
};

export function createGameState() {
  return {
    phase: PHASES.MENU,
    roundIndex: 0,
    score: 0,
    timeLeft: SCENES[0].timeSeconds,
    foundIds: new Set(),
    hintsLeft: HINTS_PER_ROUND,
    hintCooldownUntil: 0,
    wrongClicks: 0,
    roundScores: [],
    lastRoundBonus: 0,
    lastRoundPerfect: false,
    lastFoundLabel: '',
  };
}

export function startRound(state, roundIndex) {
  const scene = SCENES[roundIndex];
  state.phase = PHASES.PLAYING;
  state.roundIndex = roundIndex;
  state.timeLeft = scene.timeSeconds;
  state.foundIds = new Set();
  state.hintsLeft = HINTS_PER_ROUND;
  state.hintCooldownUntil = 0;
  state.wrongClicks = 0;
  state.lastRoundBonus = 0;
  state.lastRoundPerfect = false;
  state.lastFoundLabel = '';
}

export function totalDifferences(state) {
  return SCENES[state.roundIndex].differences.length;
}

export function foundCount(state) {
  return state.foundIds.size;
}

export function roundIsComplete(state) {
  return foundCount(state) >= totalDifferences(state);
}

export function markFound(state, difference) {
  if (state.phase !== PHASES.PLAYING) return false;
  if (state.foundIds.has(difference.id)) return false;
  state.foundIds.add(difference.id);
  state.score += FIND_POINTS;
  state.lastFoundLabel = difference.label;
  if (roundIsComplete(state)) {
    finishRound(state);
  }
  return true;
}

export function finishRound(state) {
  const perfect = state.wrongClicks === 0;
  const timeBonus = Math.round(state.timeLeft) * TIME_BONUS_PER_SECOND;
  const perfectBonus = perfect ? PERFECT_ROUND_BONUS : 0;
  state.lastRoundBonus = timeBonus + perfectBonus;
  state.lastRoundPerfect = perfect;
  state.score += state.lastRoundBonus;
  state.roundScores.push(state.score);
  state.phase = state.roundIndex >= SCENES.length - 1 ? PHASES.FINAL : PHASES.ROUND_COMPLETE;
}

export function applyWrongClick(state) {
  if (state.phase !== PHASES.PLAYING) return;
  state.wrongClicks += 1;
  state.timeLeft = Math.max(0, state.timeLeft - WRONG_CLICK_PENALTY_SECONDS);
  if (state.timeLeft <= 0) {
    state.phase = state.roundIndex >= SCENES.length - 1 ? PHASES.FINAL : PHASES.ROUND_COMPLETE;
    state.lastRoundBonus = 0;
  }
}

export function spendHint(state, nowMs) {
  if (state.phase !== PHASES.PLAYING) return null;
  if (state.hintsLeft <= 0) return null;
  if (nowMs < state.hintCooldownUntil) return null;
  const unfound = SCENES[state.roundIndex].differences.filter((d) => !state.foundIds.has(d.id));
  if (unfound.length === 0) return null;
  state.hintsLeft -= 1;
  state.hintCooldownUntil = nowMs + 5000;
  return unfound[0];
}

export function tickTimer(state, seconds) {
  if (state.phase !== PHASES.PLAYING) return;
  state.timeLeft = Math.max(0, state.timeLeft - seconds);
  if (state.timeLeft <= 0) {
    state.lastRoundBonus = 0;
    state.phase = state.roundIndex >= SCENES.length - 1 ? PHASES.FINAL : PHASES.ROUND_COMPLETE;
  }
}

export function bestRoundScore(state) {
  if (state.roundScores.length === 0) return 0;
  return Math.max(...state.roundScores);
}
