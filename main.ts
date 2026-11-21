// Harbour Lights — the entry hand-in for make.fun.
// Copies this repository's game/ and screenshots/ into the grader's output
// directory and writes the dossier buildDossier derives from exactly those
// files, so the submitted dossier always matches the shipped game.
import { buildDossier } from './vendor/makefun-game.ts';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The caps this bounty grades under: the dossier text cap, the screenshot
// limits, and the game tree limits from the competition's gate.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyTreeIntoOutput(folderName: string): void {
  const source = join(here, folderName);
  const target = join(destination, folderName);
  if (!existsSync(source)) return;
  cpSync(source, target, { recursive: true });
}

function handInEntry(): void {
  mkdirSync(destination, { recursive: true });
  // Start from a clean output directory so a stale file can never leak in.
  for (const leftover of ['game', 'screenshots', 'dossier.json']) {
    const stale = join(destination, leftover);
    if (existsSync(stale)) rmSync(stale, { recursive: true, force: true });
  }
  copyTreeIntoOutput('game');
  copyTreeIntoOutput('screenshots');
  const dossier = buildDossier(destination, dossierCaps);
  writeFileSync(join(destination, 'dossier.json'), dossier);
}

handInEntry();
