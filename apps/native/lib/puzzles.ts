import { generatePuzzle, puzzleSeed, type Puzzle } from "@wordquilt/generator";
import { kitchenThings, kitchenTitles } from "@wordquilt/generator/data/kitchen-things";
import { morningRitual, morningTitles } from "@wordquilt/generator/data/morning-ritual";
import { DIFFICULTY_RAMP } from "@wordquilt/generator";

/**
 * Which puzzle is which.
 *
 * Every puzzle in the app is identified by `packId` + `index`, or by a Daily's
 * date. That identity is what progress records, so it has to be resolvable from
 * a route — a screen that cannot say which puzzle it is showing cannot mark it
 * sewn, and the Puzzle and Reveal screens must independently resolve to the
 * SAME board or the reveal would show a different puzzle than the one played.
 *
 * Generation is a pure function of (packId, index), so both screens calling
 * this with the same arguments get the same grid without passing one around.
 */

export interface PackDefinition {
  id: string;
  name: string;
  /** How many puzzles the pack contains. */
  size: number;
  theme: typeof kitchenThings;
  titles: typeof kitchenTitles;
  /** Free packs are part of the 120; paid ones live behind the Wall. */
  free: boolean;
}

/**
 * The packs that exist today.
 *
 * Only two themes are authored so far — the launch set needs six free and five
 * paid, and curating that vocabulary is the real launch risk named in the
 * handover. Everything below is wired so adding a theme is a data change.
 */
export const PACKS: PackDefinition[] = [
  {
    id: "morning-ritual",
    name: "Breakfast",
    size: 20,
    theme: morningRitual,
    titles: morningTitles,
    free: true,
  },
  {
    id: "kitchen-things",
    name: "Kitchen Things",
    size: 20,
    theme: kitchenThings,
    titles: kitchenTitles,
    free: true,
  },
];

export const findPack = (id: string): PackDefinition | undefined =>
  PACKS.find((p) => p.id === id);

/** Slugify a display name back to a pack id, for links built from a name. */
export const packIdFromName = (name: string): string =>
  PACKS.find((p) => p.name.toLowerCase() === name.toLowerCase())?.id ??
  name.toLowerCase().replace(/\s+/g, "-");

/**
 * Build puzzle `index` of `packId`.
 *
 * The difficulty ramp is walked across the pack, so a pack opens at 6×6 and
 * finishes at 9×9 rather than jumping. Returns null when the pack's vocabulary
 * cannot satisfy that grid — the caller must handle it rather than showing a
 * broken board, and it is a signal the pool needs more words.
 */
export function buildPuzzle(packId: string, index: number): Puzzle | null {
  const pack = findPack(packId);
  if (!pack) return null;

  const step = Math.min(
    DIFFICULTY_RAMP.length - 1,
    Math.floor((index / Math.max(1, pack.size)) * DIFFICULTY_RAMP.length),
  );
  const spec = DIFFICULTY_RAMP[step]!;

  const result = generatePuzzle({
    theme: pack.theme,
    titles: pack.titles,
    spec,
    seed: puzzleSeed(pack.id, index),
  });
  if (result.ok) return result.puzzle;

  // Fall back down the ramp rather than failing outright: a smaller grid needs
  // fewer letters, so a pool that cannot fill 9×9 can usually still fill 6×6.
  // A player should never meet an empty screen because a pool is thin.
  for (let s = step - 1; s >= 0; s--) {
    const retry = generatePuzzle({
      theme: pack.theme,
      titles: pack.titles,
      spec: DIFFICULTY_RAMP[s]!,
      seed: puzzleSeed(pack.id, index),
    });
    if (retry.ok) return retry.puzzle;
  }
  return null;
}

/**
 * The Daily.
 *
 * Seeded from the DATE, so everyone playing on the same day gets the same
 * puzzle, and any past day regenerates identically — which is what makes
 * catch-up work without storing a single grid.
 */
export function buildDaily(date: string): Puzzle | null {
  const pack = PACKS[0]!;
  const result = generatePuzzle({
    theme: pack.theme,
    titles: pack.titles,
    spec: DIFFICULTY_RAMP[1]!,
    seed: puzzleSeed("daily", dateSeed(date)),
  });
  return result.ok ? result.puzzle : null;
}

/** Turn `YYYY-MM-DD` into a stable number. */
function dateSeed(date: string): number {
  return Number(date.replace(/-/g, "")) || 0;
}
