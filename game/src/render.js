// Harbour Lights — everything the player sees: the two panels, gold-ring
// markers, hint pulses, particle bursts, the HUD and the overlay screens.
// Reads the state, never owns it.
import { PANEL_WIDTH, PANEL_HEIGHT, LOW_TIME_WARNING_SECONDS } from './config.js';
import { SCENES } from './scenes.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes + ':' + String(rest).padStart(2, '0');
}

export function buildPanels(stage, scene, onPanelClick) {
  stage.innerHTML = '';
  const panels = [];
  for (const side of ['left', 'right']) {
    const panel = el('div', 'panel panel-' + side);
    const label = el('div', 'panel-tag', side === 'left' ? 'LEFT — study me' : 'RIGHT — spot the change');
    const img = el('img', 'panel-image');
    img.src = side === 'left' ? scene.leftImage : scene.rightImage;
    img.alt = side === 'left' ? 'Harbour scene, left panel' : 'Harbour scene, right panel';
    img.draggable = false;
    const layer = el('div', 'marker-layer');
    panel.append(label, img, layer);
    panel.addEventListener('click', (event) => onPanelClick(event, panel, layer));
    stage.appendChild(panel);
    panels.push({ panel, layer });
  }
  return panels;
}

export function placeMarker(layer, difference) {
  const ring = el('div', 'found-ring');
  ring.style.left = (difference.x / PANEL_WIDTH * 100) + '%';
  ring.style.top = (difference.y / PANEL_HEIGHT * 100) + '%';
  ring.title = difference.label;
  layer.appendChild(ring);
  return ring;
}

export function showHintPulse(layers, difference) {
  const pulses = [];
  for (const layer of layers) {
    const pulse = el('div', 'hint-pulse');
    pulse.style.left = (difference.x / PANEL_WIDTH * 100) + '%';
    pulse.style.top = (difference.y / PANEL_HEIGHT * 100) + '%';
    layer.appendChild(pulse);
    pulses.push(pulse);
  }
  window.setTimeout(() => { for (const p of pulses) p.remove(); }, 2500);
  return pulses;
}

export function burstParticles(layer, xPercent, yPercent) {
  for (let i = 0; i < 10; i++) {
    const dot = el('div', 'spark');
    const angle = (i / 10) * Math.PI * 2;
    const distance = 26 + (i % 3) * 10;
    dot.style.left = xPercent + '%';
    dot.style.top = yPercent + '%';
    dot.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
    dot.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
    layer.appendChild(dot);
    window.setTimeout(() => dot.remove(), 700);
  }
}

export function flashWrong(stage) {
  stage.classList.remove('shake');
  void stage.offsetWidth;
  stage.classList.add('shake');
  const flash = el('div', 'wrong-flash');
  stage.appendChild(flash);
  window.setTimeout(() => flash.remove(), 450);
}

export function updateHud(hud, state) {
  const scene = SCENES[state.roundIndex];
  hud.counter.textContent = 'Found ' + state.foundIds.size + '/' + scene.differences.length;
  hud.remaining.textContent = (scene.differences.length - state.foundIds.size) + ' still hiding';
  hud.score.textContent = 'Score ' + state.score;
  hud.roundLabel.textContent = 'Round ' + (state.roundIndex + 1) + ' of 3 — ' + scene.name;
  hud.timeText.textContent = formatTime(state.timeLeft);
  const fraction = Math.max(0, state.timeLeft / scene.timeSeconds);
  hud.timeFill.style.width = (fraction * 100) + '%';
  hud.timeFill.classList.toggle('low', state.timeLeft <= LOW_TIME_WARNING_SECONDS);
  hud.timeText.classList.toggle('low', state.timeLeft <= LOW_TIME_WARNING_SECONDS);
  hud.hintButton.textContent = 'Hint (' + state.hintsLeft + ' left) — H';
  hud.hintButton.disabled = state.hintsLeft <= 0 || state.phase !== 'playing';
  hud.toast.textContent = state.lastFoundLabel ? 'Found: ' + state.lastFoundLabel : 'Click a difference in either picture.';
}

export function showOverlay(overlayRoot, kind, state) {
  overlayRoot.innerHTML = '';
  const scene = SCENES[state.roundIndex];
  if (kind === 'menu') {
    const box = el('div', 'overlay-box');
    box.append(
      el('h2', 'overlay-title', 'Harbour Lights'),
      el('p', 'overlay-sub', 'A spot-the-difference hunt in a small fishing harbour.'),
      el('p', 'overlay-text', 'Two pictures, side by side. They look the same — they are not. Click every difference in either picture. Three rounds, rising difficulty: 7, then 10, then 12 differences. A wrong click costs 5 seconds. Hints are limited — spend them wisely.'),
      el('p', 'overlay-keys', 'Mouse: click a difference   ·   H: hint   ·   R: restart round   ·   M: mute'),
    );
    const play = el('button', 'big-button', 'Start the hunt');
    play.id = 'play-button';
    play.addEventListener('click', () => overlayRoot.dispatchEvent(new CustomEvent('play-requested')));
    box.appendChild(play);
    overlayRoot.appendChild(box);
    overlayRoot.classList.remove('hidden');
    return;
  }
  if (kind === 'round-complete') {
    const box = el('div', 'overlay-box');
    box.append(
      el('h2', 'overlay-title', 'Round complete!'),
      el('p', 'overlay-sub', scene.name + ' — all ' + scene.differences.length + ' differences found.'),
      el('p', 'overlay-text', 'Time bonus: +' + state.lastRoundBonus + ' points' + (state.lastRoundPerfect ? ' — including a perfect-round bonus, no wrong clicks!' : '')),
      el('p', 'overlay-text', 'Score so far: ' + state.score),
    );
    const next = el('button', 'big-button', 'Next round');
    next.id = 'next-button';
    next.addEventListener('click', () => overlayRoot.dispatchEvent(new CustomEvent('next-requested')));
    box.appendChild(next);
    overlayRoot.appendChild(box);
    overlayRoot.classList.remove('hidden');
    return;
  }
  if (kind === 'final') {
    const box = el('div', 'overlay-box');
    box.append(
      el('h2', 'overlay-title', 'The harbour is yours!'),
      el('p', 'overlay-sub', 'All three rounds complete — every difference found.'),
      el('p', 'overlay-text', 'Final score: ' + state.score),
      el('p', 'overlay-text', 'Best round score: ' + Math.max(...state.roundScores)),
      el('p', 'overlay-text', 'Wrong clicks: ' + state.wrongClicks + ' this round. Play again and beat your score!'),
    );
    const again = el('button', 'big-button', 'Play again');
    again.id = 'again-button';
    again.addEventListener('click', () => overlayRoot.dispatchEvent(new CustomEvent('again-requested')));
    box.appendChild(again);
    overlayRoot.appendChild(box);
    overlayRoot.classList.remove('hidden');
    return;
  }
  overlayRoot.classList.add('hidden');
}

export function hideOverlay(overlayRoot) {
  overlayRoot.classList.add('hidden');
  overlayRoot.innerHTML = '';
}
