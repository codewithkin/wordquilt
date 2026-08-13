import { packWords } from "./pack.ts";
import { createRng, puzzleSeed, type Rng } from "./rng.ts";
import { selectWordSet } from "./select.ts";
import { bankCapacity, generateObliqueTitle, type TitleBank } from "./titles.ts";
import { lettersOnly, type GridSpec, type Puzzle, type Theme } from "./types.ts";

/**
 * Generate one puzzle, and generate a whole pack.
 *
 * Order matters and is not negotiable: select a word set hitting the exact
 * letter total FIRST, then pack it. Packing first and hoping the leftovers come
 * out right does not work — the arithmetic is the binding constraint.
 */

export interface GenerateOptions {
  theme: Theme;
  titles: TitleBank;
  spec: GridSpec;
  seed: number;
  /** Words already used in this pack, if enforcing no-repeat. */
  usedWords?: ReadonlySet<string>;
  /** Titles already used in this pack. */
  usedTitles?: ReadonlySet<string>;
  /** Force a specific phrase; otherwise one is chosen by seed. */
  phrase?: string;
}

export type GenerateResult =
  | { ok: true; puzzle: Puzzle; attempts: number }
  | { ok: false; reason: string; stage: "phrase" | "select" | "pack" | "title" };

export function generatePuzzle(options: GenerateOptions): GenerateResult {
  const { theme, titles, spec, seed, usedWords, usedTitles, phrase } = options;
  const rng = createRng(seed);
  const cells = spec.rows * spec.cols;

  // A puzzle is only viable if some phrase leaves a word budget the pool can
  // hit exactly. Try phrases in a seeded order rather than committing to one.
  const phraseOrder = phrase ? [phrase] : rng.shuffle(theme.phrases);
  if (phraseOrder.length === 0) {
    return { ok: false, stage: "phrase", reason: "theme has no phrases" };
  }

  let attempts = 0;
  const failures: string[] = [];

  for (const candidate of phraseOrder) {
    const letters = lettersOnly(candidate);
    const targetLetters = cells - letters.length;

    if (targetLetters <= 0) {
      failures.push(`"${candidate}" (${letters.length}) does not fit ${cells} cells`);
      continue;
    }

    attempts++;
    const selection = selectWordSet({
      pool: theme.words,
      targetLetters,
      wordCount: spec.wordCount,
      rng,
      exclude: usedWords,
    });
    if (!selection.ok) {
      failures.push(`"${candidate}": ${selection.reason}`);
      continue;
    }

    const packed = packWords({
      rows: spec.rows,
      cols: spec.cols,
      words: selection.words,
      rng,
    });
    if (!packed.ok) {
      failures.push(`"${candidate}": ${packed.reason}`);
      continue;
    }

    const title = generateObliqueTitle({
      bank: titles,
      rng,
      hiddenWords: selection.words,
      forbidden: [candidate, theme.name],
      used: usedTitles ?? new Set(),
    });
    if (!title.ok) {
      return { ok: false, stage: "title", reason: title.reason };
    }

    // Lay the words down, then fill what is left with the phrase in reading
    // order. The leftover cells were never steered anywhere — the phrase is
    // assigned to wherever the packing happened to leave gaps.
    const grid: string[][] = Array.from({ length: spec.rows }, () =>
      Array.from({ length: spec.cols }, () => ""),
    );
    for (const placement of packed.placements) {
      placement.path.forEach((cell, i) => {
        grid[cell.row]![cell.col] = placement.word[i]!;
      });
    }

    const leftover = [];
    let letterIndex = 0;
    for (let row = 0; row < spec.rows; row++) {
      for (let col = 0; col < spec.cols; col++) {
        if (grid[row]![col] !== "") continue;
        grid[row]![col] = letters[letterIndex++]!;
        leftover.push({ row, col });
      }
    }

    // Belt and braces. If this ever fires, the arithmetic above is wrong and
    // the reveal — the entire product — would be silently broken.
    if (letterIndex !== letters.length) {
      return {
        ok: false,
        stage: "pack",
        reason: `leftover cells (${letterIndex}) != phrase letters (${letters.length})`,
      };
    }

    return {
      ok: true,
      attempts,
      puzzle: {
        rows: spec.rows,
        cols: spec.cols,
        grid,
        placements: packed.placements,
        leftover,
        theme: candidate,
        obliqueTitle: title.title,
        seed,
      },
    };
  }

  return {
    ok: false,
    stage: "select",
    reason: `no phrase worked for ${spec.rows}×${spec.cols}/${spec.wordCount}: ${failures.join("; ")}`,
  };
}

/** Read the theme back off a finished puzzle, the way the Reveal screen does. */
export function readTheme(puzzle: Puzzle): string {
  return puzzle.leftover.map(({ row, col }) => puzzle.grid[row]![col]!).join("");
}

export interface GeneratePackOptions {
  theme: Theme;
  titles: TitleBank;
  packId: string;
  size: number;
  /** The difficulty ramp to walk across the pack. */
  ramp: readonly GridSpec[];
  /**
   * Enforce that no word appears twice in the whole pack.
   *
   * NOTE: at 50 puzzles × ~8 words this needs a ~400-word pool, not the 200
   * the handover assumes. See `docs/generator-spike.md` — the two numbers in
   * the brief are not compatible and the owner has to pick one.
   */
  noWordRepeatInPack?: boolean;
}

export interface PackReport {
  puzzles: Puzzle[];
  failures: { index: number; stage: string; reason: string }[];
  /** How many times each word was placed across the pack. */
  wordUsage: Map<string, number>;
}

export function generatePack(options: GeneratePackOptions): PackReport {
  const { theme, titles, packId, size, ramp, noWordRepeatInPack = false } = options;

  const puzzles: Puzzle[] = [];
  const failures: PackReport["failures"] = [];
  const usedWords = new Set<string>();
  const usedTitles = new Set<string>();
  const wordUsage = new Map<string, number>();

  for (let i = 0; i < size; i++) {
    // Walk the ramp across the pack so difficulty climbs rather than jumping.
    const spec = ramp[Math.min(ramp.length - 1, Math.floor((i / size) * ramp.length))]!;

    const result = generatePuzzle({
      theme,
      titles,
      spec,
      seed: puzzleSeed(packId, i),
      usedWords: noWordRepeatInPack ? usedWords : undefined,
      usedTitles,
    });

    if (!result.ok) {
      failures.push({ index: i, stage: result.stage, reason: result.reason });
      continue;
    }

    puzzles.push(result.puzzle);
    usedTitles.add(result.puzzle.obliqueTitle);
    for (const p of result.puzzle.placements) {
      usedWords.add(p.word);
      wordUsage.set(p.word, (wordUsage.get(p.word) ?? 0) + 1);
    }
  }

  return { puzzles, failures, wordUsage };
}

export { bankCapacity, createRng, puzzleSeed, type Rng, type TitleBank };
