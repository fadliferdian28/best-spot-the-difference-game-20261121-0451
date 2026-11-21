// Harbour Lights — pointer and keyboard input: converts a click on either
// panel into picture coordinates, hit-tests it against the unfound
// differences, and reports a hit or a miss to the caller.
import { PANEL_WIDTH, PANEL_HEIGHT } from './config.js';
import { SCENES } from './scenes.js';

export function picturePointFromEvent(event, panel) {
  const rect = panel.getBoundingClientRect();
  const image = panel.querySelector('.panel-image');
  const imageRect = image ? image.getBoundingClientRect() : rect;
  const x = (event.clientX - imageRect.left) / imageRect.width * PANEL_WIDTH;
  const y = (event.clientY - imageRect.top) / imageRect.height * PANEL_HEIGHT;
  return { x, y };
}

export function hitDifference(state, point) {
  const scene = SCENES[state.roundIndex];
  for (const difference of scene.differences) {
    if (state.foundIds.has(difference.id)) continue;
    const dx = point.x - difference.x;
    const dy = point.y - difference.y;
    if (dx * dx + dy * dy <= difference.r * difference.r) return difference;
  }
  return null;
}

export function wireKeyboard(handleKey) {
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'h' || key === 'r' || key === 'm') {
      event.preventDefault();
      handleKey(key);
    }
  });
}
