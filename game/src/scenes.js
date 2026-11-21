// Harbour Lights — scene definitions: which picture pair each round shows and
// where every planted difference sits (image coordinates, 560 x 420 panels).
// The pictures themselves are drawn by the session's scene generator;
// this file is the single source of truth the game and the playtest share.
export const SCENES = [
  {
    id: 'round1',
    name: 'Morning Harbour',
    timeSeconds: 150,
    leftImage: 'assets/round1-left.png',
    rightImage: 'assets/round1-right.png',
    differences: [
      { id: 'gull', label: 'A gull has flown away', x: 180, y: 52, r: 16 },
      { id: 'boat', label: 'The red boat is repainted teal', x: 196, y: 300, r: 30 },
      { id: 'crate', label: 'An extra crate on the pier', x: 268, y: 318, r: 18 },
      { id: 'window', label: 'The lighthouse window went dark', x: 74, y: 126, r: 12 },
      { id: 'flag', label: 'The lighthouse flag is blue now', x: 89, y: 41, r: 14 },
      { id: 'buoy', label: 'The buoy drifted left', x: 489, y: 311, r: 16 },
      { id: 'cat', label: 'The pier cat wandered off', x: 313, y: 350, r: 18 },
    ],
  },
  {
    id: 'round2',
    name: 'Lantern Dusk',
    timeSeconds: 150,
    leftImage: 'assets/round2-left.png',
    rightImage: 'assets/round2-right.png',
    differences: [
      { id: 'gull', label: 'A gull has flown away', x: 250, y: 88, r: 16 },
      { id: 'lantern', label: 'The right lantern is out', x: 440, y: 283, r: 16 },
      { id: 'rope', label: 'The coiled rope is gone', x: 371, y: 367, r: 20 },
      { id: 'sail', label: "The small boat's sail turned orange", x: 313, y: 228, r: 14 },
      { id: 'cloud', label: 'A cloud drifted away', x: 326, y: 45, r: 26 },
      { id: 'crate', label: 'A crate vanished from the stack', x: 236, y: 292, r: 16 },
      { id: 'window', label: 'The boat cabin window went dark', x: 191, y: 273, r: 10 },
      { id: 'flag', label: 'The lighthouse flag is yellow now', x: 89, y: 41, r: 14 },
      { id: 'cat', label: 'The pier cat wandered off', x: 313, y: 350, r: 18 },
      { id: 'buoy', label: 'The buoy drifted right', x: 489, y: 311, r: 16 },
    ],
  },
  {
    id: 'round3',
    name: 'Midnight Tide',
    timeSeconds: 180,
    leftImage: 'assets/round3-left.png',
    rightImage: 'assets/round3-right.png',
    differences: [
      { id: 'gull', label: 'A gull has flown away', x: 130, y: 70, r: 14 },
      { id: 'star', label: 'A star faded from the sky', x: 200, y: 25, r: 10 },
      { id: 'moon', label: 'The moon lost its crater', x: 491, y: 49, r: 12 },
      { id: 'lantern', label: 'The left lantern is out', x: 120, y: 283, r: 16 },
      { id: 'rope', label: 'The coiled rope is gone', x: 371, y: 367, r: 20 },
      { id: 'window', label: 'The lighthouse window went dark', x: 74, y: 126, r: 12 },
      { id: 'flag', label: 'The lighthouse flag is green now', x: 89, y: 41, r: 14 },
      { id: 'sail', label: "The small boat's sail turned pink", x: 312, y: 232, r: 14 },
      { id: 'crate', label: 'An extra crate on the pier', x: 268, y: 318, r: 18 },
      { id: 'buoy', label: 'The buoy drifted left', x: 489, y: 311, r: 16 },
      { id: 'cat', label: 'The pier cat wandered off', x: 313, y: 350, r: 18 },
      { id: 'boat', label: 'The yellow boat is repainted purple', x: 328, y: 270, r: 24 },
    ],
  },
];

export function sceneForRound(roundIndex) {
  return SCENES[roundIndex];
}

export function differenceCount(roundIndex) {
  return SCENES[roundIndex].differences.length;
}
