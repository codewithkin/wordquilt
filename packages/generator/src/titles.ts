import type { Rng } from "./rng.ts";

/**
 * Oblique titles — the hint shown DURING play.
 *
 * Generated per theme with variation, not authored per puzzle (D-016). At 370
 * puzzles growing 50/month, authoring is ~370 lines of editorial at launch and
 * a permanent monthly tax; generation makes a new pack cost one small block of
 * writing instead of fifty lines.
 *
 * ── What an oblique title is for ────────────────────────────────────────────
 * It guides the search without naming the theme. A fully secret theme was
 * rejected in design: with no hint, players pattern-scan for any word and the
 * theme becomes a post-hoc credit sequence rather than part of solving.
 *
 * So the bar is: close enough to orient, far enough that the reveal still
 * lands. "Something's brewing" for Kitchen Things. Never "Kitchen Things".
 *
 * ── The rules generation has to hold ────────────────────────────────────────
 *   1. It must never contain the theme phrase or the theme name — that would
 *      spoil the only moment the product exists for.
 *   2. It must never contain a word hidden in that puzzle, for the same reason.
 *   3. It must not repeat within a pack. A player working through 50 puzzles
 *      notices repetition faster than anything else — the handover is explicit
 *      that the most engaged players are the ones who catch it.
 *   4. It must be deterministic per puzzle.
 *
 * Rules 1–3 are enforced here and asserted in the tests, not left to whoever
 * writes the next theme's fragments.
 */

export interface TitleBank {
  /**
   * Sentence frames with a single `{}` slot.
   * e.g. "Before anyone else is {}." + "up"
   */
  frames: readonly string[];
  /** Fillers for the slot. */
  fillers: readonly string[];
  /**
   * Complete titles that need no assembly. Use these for the lines that only
   * work whole — the best oblique titles usually are not compositional.
   */
  standalone?: readonly string[];
}

/**
 * How many distinct titles a bank can produce.
 *
 * Check this against pack size when authoring a theme. A 50-puzzle pack needs
 * at least 50, and comfortably more so that the choices are not forced.
 */
export const bankCapacity = (bank: TitleBank): number =>
  bank.frames.length * bank.fillers.length + (bank.standalone?.length ?? 0);

export interface TitleOptions {
  bank: TitleBank;
  rng: Rng;
  /** Words hidden in THIS puzzle. A title may not contain any of them. */
  hiddenWords: readonly string[];
  /** The theme phrase and name. A title may not contain either. */
  forbidden: readonly string[];
  /** Titles already used in this pack. */
  used: ReadonlySet<string>;
}

export type TitleResult =
  | { ok: true; title: string }
  | { ok: false; reason: string };

/** Does `title` leak any forbidden term? Whole words only, case-insensitive. */
function leaks(title: string, terms: readonly string[]): string | null {
  const haystack = title.toLowerCase();
  for (const term of terms) {
    const t = term.toLowerCase().trim();
    if (t.length < 3) continue;
    // Word-boundary match, so "pan" does not trip on "expand".
    if (new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(haystack)) {
      return term;
    }
  }
  return null;
}

export function generateObliqueTitle(options: TitleOptions): TitleResult {
  const { bank, rng, hiddenWords, forbidden, used } = options;

  const banned = [...forbidden, ...hiddenWords];

  // Build the full candidate space, then walk it in a seeded order. Building
  // it whole (rather than sampling with retries) means "this bank is exhausted"
  // is a definite answer instead of a timeout.
  const candidates: string[] = [...(bank.standalone ?? [])];
  for (const frame of bank.frames) {
    for (const filler of bank.fillers) {
      candidates.push(frame.replace("{}", filler));
    }
  }

  let blockedByLeak = 0;
  let blockedByReuse = 0;

  for (const title of rng.shuffle(candidates)) {
    if (used.has(title)) {
      blockedByReuse++;
      continue;
    }
    if (leaks(title, banned)) {
      blockedByLeak++;
      continue;
    }
    return { ok: true, title };
  }

  return {
    ok: false,
    reason:
      `no usable title: ${candidates.length} candidates, ` +
      `${blockedByReuse} already used in this pack, ${blockedByLeak} would leak a word`,
  };
}
