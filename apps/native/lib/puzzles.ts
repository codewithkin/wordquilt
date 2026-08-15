import {
  DIFFICULTY_RAMP,
  generatePuzzle,
  puzzleSeed,
  type Puzzle,
  type Theme,
  type TitleBank,
} from "@wordquilt/generator";
import { birds, birdsTitles } from "@wordquilt/generator/data/birds";
import { books, booksTitles } from "@wordquilt/generator/data/books";
import { breakfast, breakfastTitles } from "@wordquilt/generator/data/breakfast";
import { kitchenThings, kitchenTitles } from "@wordquilt/generator/data/kitchen-things";
import { morningRitual, morningTitles } from "@wordquilt/generator/data/morning-ritual";
import { theGarden, theGardenTitles } from "@wordquilt/generator/data/the-garden";
import { theSea, theSeaTitles } from "@wordquilt/generator/data/the-sea";
import { trains, trainsTitles } from "@wordquilt/generator/data/trains";

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
  theme: Theme;
  titles: TitleBank;
  /** Free packs need no purchase; paid ones live behind the Wall. */
  free: boolean;
  /**
   * Shown in the Store and on the Wall. Real money, stated plainly — there is
   * no coin, gem or bundle currency in this app (constraint 6).
   */
  price?: string;
}

/**
 * The launch library: 50 free puzzles and 150 paid ones.
 *
 * Pack size is 30 for paid packs because the spike measured it, not because it
 * sounded right — at 50 a ~190-word pool starves and builds 36/50, and the fix
 * is 50% more curation on the exact work the handover names as the launch risk.
 * See `progress/03-generator-spike.md`.
 *
 * The free packs sit at 25 each. Adding a theme is a data change: write the
 * pool, add a row here, and `pnpm check:vocabulary` will tell you whether it
 * actually builds before a player ever meets it.
 */
export const PACKS: PackDefinition[] = [
  { id: "breakfast", name: "Breakfast", size: 25, theme: breakfast, titles: breakfastTitles, free: true },
  { id: "kitchen-things", name: "Kitchen Things", size: 25, theme: kitchenThings, titles: kitchenTitles, free: true },
  { id: "the-garden", name: "The Garden", size: 30, theme: theGarden, titles: theGardenTitles, free: false, price: "$2.99" },
  { id: "the-sea", name: "The Sea", size: 30, theme: theSea, titles: theSeaTitles, free: false, price: "$2.99" },
  { id: "birds", name: "Birds", size: 30, theme: birds, titles: birdsTitles, free: false, price: "$2.99" },
  { id: "books", name: "Books", size: 30, theme: books, titles: booksTitles, free: false, price: "$2.99" },
  { id: "trains", name: "Trains", size: 30, theme: trains, titles: trainsTitles, free: false, price: "$2.99" },
];

export const FREE_PACKS = PACKS.filter((p) => p.free);
export const PAID_PACKS = PACKS.filter((p) => !p.free);

/** How many puzzles a player can reach without paying anything. */
export const FREE_PUZZLE_COUNT = FREE_PACKS.reduce((n, p) => n + p.size, 0);

export const findPack = (id: string): PackDefinition | undefined =>
  PACKS.find((p) => p.id === id);

/** Slugify a display name back to a pack id, for links built from a name. */
export const packIdFromName = (name: string): string =>
  PACKS.find((p) => p.name.toLowerCase() === name.toLowerCase())?.id ??
  name.toLowerCase().replace(/\s+/g, "-");

/**
 * Build a whole pack at once, and remember it.
 *
 * A pack is generated as a SEQUENCE rather than 30 independent puzzles, because
 * the no-repeat rules are sequential by nature: a title bank is only
 * non-repeating if each draw knows what the earlier ones took, and the same goes
 * for the two-uses-per-word budget. Generating puzzle 14 on its own gets a grid
 * that is perfectly valid and a title the player may already have seen — 6 of 30
 * titles repeated when measured that way.
 *
 * It is still a pure function of `packId`: same pack, same 30 boards, every
 * launch and on every device. The cache is a speed convenience, not the source
 * of identity. Cost is ~200ms per pack, paid once when a pack is first opened.
 */
const packCache = new Map<string, (Puzzle | null)[]>();

export function buildPack(packId: string): (Puzzle | null)[] {
  const cached = packCache.get(packId);
  if (cached) return cached;

  const pack = findPack(packId);
  if (!pack) return [];

  const puzzles: (Puzzle | null)[] = [];
  const usedTitles = new Set<string>();
  const usage = new Map<string, number>();

  for (let index = 0; index < pack.size; index++) {
    // Walk the ramp across the pack, so it opens at 6×6 and finishes at 9×9
    // rather than jumping.
    const step = Math.min(
      DIFFICULTY_RAMP.length - 1,
      Math.floor((index / Math.max(1, pack.size)) * DIFFICULTY_RAMP.length),
    );

    // Fall back down the ramp rather than failing outright: a smaller grid needs
    // fewer letters, so a pool that cannot fill 9×9 can usually still fill 6×6.
    // A player should never meet an empty screen because a pool is thin.
    let made: Puzzle | null = null;
    for (let s = step; s >= 0 && !made; s--) {
      const result = generatePuzzle({
        theme: pack.theme,
        titles: pack.titles,
        spec: DIFFICULTY_RAMP[s]!,
        seed: puzzleSeed(pack.id, index),
        usedTitles,
        usage,
        maxUsesPerWord: 2,
      });
      if (result.ok) made = result.puzzle;
    }

    puzzles.push(made);
    if (!made) continue;
    usedTitles.add(made.obliqueTitle);
    for (const p of made.placements) usage.set(p.word, (usage.get(p.word) ?? 0) + 1);
  }

  packCache.set(packId, puzzles);
  return puzzles;
}

/**
 * Build puzzle `index` of `packId`.
 *
 * Returns null when the pack's vocabulary cannot satisfy any grid at that index
 * — the caller must handle it rather than showing a broken board, and it is a
 * signal the pool needs more words. `pnpm check:vocabulary` fails on it too, so
 * it should never reach a player.
 */
export function buildPuzzle(packId: string, index: number): Puzzle | null {
  return buildPack(packId)[index] ?? null;
}

/**
 * The Daily.
 *
 * Seeded from the DATE, so everyone playing on the same day gets the same
 * puzzle, and any past day regenerates identically — which is what makes
 * catch-up work without storing a single grid.
 *
 * It draws on the onboarding pool rather than a pack, so the Daily never spends
 * a pack's vocabulary or spoils a puzzle someone has not reached yet.
 */
export function buildDaily(date: string): Puzzle | null {
  const result = generatePuzzle({
    theme: morningRitual,
    titles: morningTitles,
    spec: DIFFICULTY_RAMP[1]!,
    seed: puzzleSeed("daily", dateSeed(date)),
  });
  return result.ok ? result.puzzle : null;
}

/** Turn `YYYY-MM-DD` into a stable number. */
function dateSeed(date: string): number {
  return Number(date.replace(/-/g, "")) || 0;
}
