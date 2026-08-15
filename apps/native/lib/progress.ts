/**
 * Progress: what a player has actually done.
 *
 * PURE RULES ONLY — no native imports, so these can be tested directly by
 * `node --test`. Persistence lives in `progress-store.ts`.
 *
 * On-device only, like everything else (constraint 2). There is no account and
 * no sync, so this file IS the player's quilt — losing it loses everything they
 * have made, which is why Settings has to state the reinstall consequence
 * plainly rather than letting them discover it.
 *
 * ── What is deliberately NOT stored ─────────────────────────────────────────
 * No streak. No "last played" used for a chain. No count of days missed. No
 * scores, no times, no stars. Those fields do not exist here, because a field
 * that exists eventually gets displayed, and every one of them would be a way
 * of telling a player they have let something slip (constraint 4).
 *
 * What IS stored is a set of things done. Sets only grow.
 */

export interface Progress {
  /** Puzzle ids sewn, as `packId#index`. A set, because it only grows. */
  sewn: string[];
  /** Daily dates sewn, ISO `YYYY-MM-DD`. */
  dailies: string[];
  /** Hints used today, and the date that count belongs to. */
  hintsUsedToday: number;
  hintsDate: string;
  /** Hints bought, which never expire. Free hints refill daily; these do not. */
  hintsPurchased: number;
  /**
   * Pack ids bought. Free packs are never listed here — ownership is asked of
   * `ownsPack`, so a pack that later becomes free needs no migration.
   */
  packsOwned: string[];
}

export const FREE_HINTS_PER_DAY = 3;

export const emptyProgress: Progress = {
  sewn: [],
  dailies: [],
  hintsUsedToday: 0,
  hintsDate: "",
  hintsPurchased: 0,
  packsOwned: [],
};

/**
 * The shape entitlement rules need from a pack. Deliberately not
 * `PackDefinition` — this file stays free of imports so `node --test` can run
 * it directly, and the rules genuinely do not care what a pack's vocabulary is.
 */
export interface PackFacts {
  id: string;
  size: number;
  free: boolean;
}

/** A free pack is owned by everyone. Nothing else is owned until it is bought. */
export const ownsPack = (progress: Progress, pack: PackFacts): boolean =>
  pack.free || progress.packsOwned.includes(pack.id);

/** Buying is idempotent — a restore replays every purchase. */
export function buyPack(progress: Progress, packId: string): Progress {
  if (progress.packsOwned.includes(packId)) return progress;
  return { ...progress, packsOwned: [...progress.packsOwned, packId] };
}

/**
 * Has the player sewn every puzzle they can reach without paying?
 *
 * This is the ONLY thing that opens the Wall. Not a session count, not a timer,
 * not a number of days — running out of free content is the one moment the
 * offer is honest, and it is reached by forward navigation only (constraint 6).
 *
 * Owned paid packs count too: someone who bought The Garden and finished it has
 * not run out of anything while The Sea is still unopened.
 */
export function freeContentExhausted(
  progress: Progress,
  packs: readonly PackFacts[],
): boolean {
  const reachable = packs.filter((p) => ownsPack(progress, p));
  if (reachable.length === 0) return false;
  return reachable.every((p) => packSewnCount(progress, p.id) >= p.size);
}

export const puzzleId = (packId: string, index: number) => `${packId}#${index}`;

/** Local calendar date, not UTC — "today" means the player's today. */
export function today(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Free hints refill daily. They REFILL — they do not accumulate and they are
 * never taken away, so there is nothing to lose by not playing.
 */
export function hintsAvailable(progress: Progress, date = today()): number {
  const usedToday = progress.hintsDate === date ? progress.hintsUsedToday : 0;
  return Math.max(0, FREE_HINTS_PER_DAY - usedToday) + progress.hintsPurchased;
}

export function spendHint(progress: Progress, date = today()): Progress {
  const fresh = progress.hintsDate === date ? progress : { ...progress, hintsUsedToday: 0, hintsDate: date };
  const freeLeft = Math.max(0, FREE_HINTS_PER_DAY - fresh.hintsUsedToday);

  // Free hints are spent before purchased ones, always. Spending someone's
  // paid hints while they still have free ones would be indefensible.
  if (freeLeft > 0) {
    return { ...fresh, hintsUsedToday: fresh.hintsUsedToday + 1, hintsDate: date };
  }
  if (fresh.hintsPurchased > 0) {
    return { ...fresh, hintsPurchased: fresh.hintsPurchased - 1 };
  }
  return fresh;
}

/** Sets only grow, and re-sewing an already-sewn puzzle is a no-op. */
export function sewPuzzle(progress: Progress, id: string): Progress {
  if (progress.sewn.includes(id)) return progress;
  return { ...progress, sewn: [...progress.sewn, id] };
}

export function sewDaily(progress: Progress, date: string): Progress {
  if (progress.dailies.includes(date)) return progress;
  return { ...progress, dailies: [...progress.dailies, date] };
}

/** How many puzzles of a pack are sewn. */
export function packSewnCount(progress: Progress, packId: string): number {
  const prefix = `${packId}#`;
  return progress.sewn.filter((id) => id.startsWith(prefix)).length;
}

export const totalSquares = (progress: Progress): number =>
  progress.sewn.length + progress.dailies.length;
