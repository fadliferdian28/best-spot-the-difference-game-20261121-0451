// Harbour Lights — bootstrap: reads the ?shot= query for deterministic
// screenshot states, wires the HUD, the panels, the keyboard and the timer,
// and keeps the visible game in step with the state machine.
import { HINT_PULSE_MS } from './config.js';
import { SCENES } from './scenes.js';
import { createGameState, startRound, markFound, applyWrongClick, spendHint, tickTimer, PHASES } from './state.js';
import { createSoundKit } from './audio.js';
import { buildPanels, placeMarker, showHintPulse, burstParticles, flashWrong, updateHud, showOverlay, hideOverlay } from './render.js';
import { picturePointFromEvent, hitDifference, wireKeyboard } from './input.js';

const state = createGameState();
const sounds = createSoundKit();
const stage = document.getElementById('stage');
const overlayRoot = document.getElementById('overlay');
const hud = {
  counter: document.getElementById('counter'),
  remaining: document.getElementById('remaining'),
  score: document.getElementById('score'),
  roundLabel: document.getElementById('round-label'),
  timeText: document.getElementById('time-text'),
  timeFill: document.getElementById('time-fill'),
  hintButton: document.getElementById('hint-button'),
  muteButton: document.getElementById('mute-button'),
  restartButton: document.getElementById('restart-button'),
  toast: document.getElementById('toast'),
};
let panels = [];
let shotMode = null;

function refreshHud() {
  updateHud(hud, state);
}

function openRound(roundIndex) {
  const scene = SCENES[roundIndex];
  startRound(state, roundIndex);
  panels = buildPanels(stage, scene, onPanelClick);
  hideOverlay(overlayRoot);
  refreshHud();
}

function onPanelClick(event, panel, layer) {
  if (state.phase !== PHASES.PLAYING) return;
  const point = picturePointFromEvent(event, panel);
  const difference = hitDifference(state, point);
  if (difference) {
    markFound(state, difference);
    sounds.chime();
    for (const p of panels) {
      placeMarker(p.layer, difference);
      burstParticles(p.layer, difference.x / 560 * 100, difference.y / 420 * 100);
    }
    refreshHud();
    if (state.phase === PHASES.ROUND_COMPLETE) {
      sounds.roundWin();
      showOverlay(overlayRoot, 'round-complete', state);
    } else if (state.phase === PHASES.FINAL) {
      sounds.finalWin();
      showOverlay(overlayRoot, 'final', state);
    }
  } else {
    applyWrongClick(state);
    sounds.wrong();
    flashWrong(stage);
    refreshHud();
    if (state.phase === PHASES.ROUND_COMPLETE || state.phase === PHASES.FINAL) {
      showOverlay(overlayRoot, state.phase === PHASES.FINAL ? 'final' : 'round-complete', state);
    }
  }
}

function useHint() {
  const difference = spendHint(state, Date.now());
  if (!difference) return;
  sounds.hint();
  showHintPulse(panels.map((p) => p.layer), difference);
  refreshHud();
}

function restartRound() {
  sounds.click();
  openRound(state.roundIndex);
}

function toggleMute() {
  const muted = sounds.toggleMute();
  hud.muteButton.textContent = muted ? 'Sound off — M' : 'Sound on — M';
}

function handleKey(key) {
  if (key === 'h') useHint();
  if (key === 'r' && state.phase === PHASES.PLAYING) restartRound();
  if (key === 'm') toggleMute();
}

// Deterministic screenshot states. The timer never runs in shot mode, so
// every screenshot of the same state looks identical.
function applyShot(shot) {
  shotMode = shot;
  if (shot === 'cover') {
    openRound(0);
    state.timeLeft = 118;
    markFoundSilently(0, 3);
  } else if (shot === 'round2') {
    openRound(1);
    state.timeLeft = 97;
    markFoundSilently(1, 5);
  } else if (shot === 'hint') {
    openRound(0);
    state.timeLeft = 132;
    markFoundSilently(0, 2);
    const unfound = SCENES[0].differences.find((d) => !state.foundIds.has(d.id));
    showHintPulse(panels.map((p) => p.layer), unfound);
    window.setInterval(() => {
      showHintPulse(panels.map((p) => p.layer), unfound);
    }, HINT_PULSE_MS - 400);
  } else if (shot === 'win') {
    openRound(0);
    state.timeLeft = 84;
    for (const difference of SCENES[0].differences) {
      markFound(state, difference);
      for (const p of panels) placeMarker(p.layer, difference);
    }
    showOverlay(overlayRoot, 'round-complete', state);
  }
  refreshHud();
}

function markFoundSilently(roundIndex, count) {
  const scene = SCENES[roundIndex];
  for (let i = 0; i < count; i++) {
    const difference = scene.differences[i];
    state.foundIds.add(difference.id);
    state.score += 100;
    state.lastFoundLabel = difference.label;
    for (const p of panels) placeMarker(p.layer, difference);
  }
}

hud.hintButton.addEventListener('click', useHint);
hud.restartButton.addEventListener('click', restartRound);
hud.muteButton.addEventListener('click', toggleMute);
overlayRoot.addEventListener('play-requested', () => { sounds.click(); openRound(0); });
overlayRoot.addEventListener('next-requested', () => { sounds.click(); openRound(state.roundIndex + 1); });
overlayRoot.addEventListener('again-requested', () => {
  sounds.click();
  state.score = 0;
  state.roundScores = [];
  openRound(0);
});
wireKeyboard(handleKey);

// The clock: half-second ticks while a round is actually being played.
window.setInterval(() => {
  if (shotMode) return;
  if (state.phase !== PHASES.PLAYING) return;
  tickTimer(state, 0.5);
  refreshHud();
  if (state.phase === PHASES.ROUND_COMPLETE || state.phase === PHASES.FINAL) {
    if (state.phase === PHASES.FINAL) sounds.finalWin(); else sounds.roundWin();
    showOverlay(overlayRoot, state.phase === PHASES.FINAL ? 'final' : 'round-complete', state);
  }
}, 500);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  applyShot(shot);
} else {
  openRound(0);
  showOverlay(overlayRoot, 'menu', state);
  state.phase = PHASES.MENU;
  refreshHud();
}

// Handle for the automated playtest: drives clicks and reads the state.
window.__spotdiff = { state, SCENES, PHASES };
