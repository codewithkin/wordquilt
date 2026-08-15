import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FREE_HINTS_PER_DAY,
  buyPack,
  emptyProgress,
  freeContentExhausted,
  hintsAvailable,
  ownsPack,
  packSewnCount,
  sewDaily,
  sewPuzzle,
  spendHint,
  today,
  totalSquares,
  type PackFacts,
  type Progress,
} from "../lib/progress.ts";

/**
 * Progress is the player's quilt. These rules are the ones that would be
 * quietly cruel if they were wrong.
 */

describe("hints", () => {
  const DAY = "2026-08-12";

  it("starts with the free daily allowance", () => {
    assert.equal(hintsAvailable(emptyProgress, DAY), FREE_HINTS_PER_DAY);
  });

  it("REFILLS the next day rather than accumulating", () => {
    // Free hints refill; they never stack up and are never taken away, so
    // there is nothing to lose by not playing.
    let p = { ...emptyProgress, hintsDate: DAY, hintsUsedToday: 3 };
    assert.equal(hintsAvailable(p, DAY), 0);
    assert.equal(hintsAvailable(p, "2026-08-13"), FREE_HINTS_PER_DAY);
  });

  it("spends free hints before purchased ones", () => {
    // Spending someone's paid hints while they still have free ones would be
    // indefensible.
    let p = { ...emptyProgress, hintsPurchased: 10, hintsDate: DAY };
    p = spendHint(p, DAY);
    assert.equal(p.hintsPurchased, 10, "purchased untouched");
    assert.equal(p.hintsUsedToday, 1);
  });

  it("falls through to purchased hints once free ones are gone", () => {
    let p = { ...emptyProgress, hintsPurchased: 2, hintsDate: DAY, hintsUsedToday: FREE_HINTS_PER_DAY };
    p = spendHint(p, DAY);
    assert.equal(p.hintsPurchased, 1);
  });

  it("purchased hints never expire with the day", () => {
    const p = { ...emptyProgress, hintsPurchased: 5, hintsDate: DAY, hintsUsedToday: 3 };
    assert.equal(hintsAvailable(p, "2026-09-01"), FREE_HINTS_PER_DAY + 5);
  });

  it("cannot go negative", () => {
    let p = { ...emptyProgress, hintsDate: DAY, hintsUsedToday: FREE_HINTS_PER_DAY };
    p = spendHint(p, DAY);
    assert.ok(hintsAvailable(p, DAY) >= 0);
    assert.ok(p.hintsPurchased >= 0);
  });
});

describe("sewing", () => {
  it("re-sewing a puzzle is a no-op, not a double count", () => {
    let p = sewPuzzle(emptyProgress, "kitchen#1");
    p = sewPuzzle(p, "kitchen#1");
    assert.equal(p.sewn.length, 1);
  });

  it("counts squares across packs and dailies together", () => {
    let p = sewPuzzle(emptyProgress, "kitchen#1");
    p = sewPuzzle(p, "garden#2");
    p = sewDaily(p, "2026-08-12");
    assert.equal(totalSquares(p), 3);
  });

  it("counts per pack without matching a pack whose id is a prefix", () => {
    let p = sewPuzzle(emptyProgress, "rain#1");
    p = sewPuzzle(p, "rainforest#1");
    assert.equal(packSewnCount(p, "rain"), 1);
  });

  it("never removes anything — the set only grows", () => {
    let p = sewPuzzle(emptyProgress, "kitchen#1");
    p = sewDaily(p, "2026-08-12");
    p = sewPuzzle(p, "kitchen#2");
    assert.ok(p.sewn.includes("kitchen#1"));
    assert.ok(p.dailies.includes("2026-08-12"));
  });
});

describe("owning packs", () => {
  const free: PackFacts = { id: "breakfast", size: 2, free: true };
  const paid: PackFacts = { id: "the-sea", size: 2, free: false };

  it("gives everyone the free packs and nothing else", () => {
    assert.equal(ownsPack(emptyProgress, free), true);
    assert.equal(ownsPack(emptyProgress, paid), false);
  });

  it("buying twice is a no-op, so a restore can replay every purchase", () => {
    let p = buyPack(emptyProgress, "the-sea");
    p = buyPack(p, "the-sea");
    assert.deepEqual(p.packsOwned, ["the-sea"]);
  });

  it("never records a free pack as bought", () => {
    // Ownership is asked of `ownsPack`, so a pack that later becomes free needs
    // no migration of anybody's saved data.
    assert.deepEqual(emptyProgress.packsOwned, []);
    assert.equal(ownsPack(emptyProgress, free), true);
  });
});

describe("the Wall opens only when free content runs out", () => {
  const packs: PackFacts[] = [
    { id: "breakfast", size: 2, free: true },
    { id: "kitchen-things", size: 2, free: true },
    { id: "the-sea", size: 2, free: false },
  ];

  const sewAll = (p: Progress, packId: string, size: number): Progress => {
    for (let i = 0; i < size; i++) p = sewPuzzle(p, `${packId}#${i}`);
    return p;
  };

  it("stays shut while a free puzzle is still unplayed", () => {
    let p = sewAll(emptyProgress, "breakfast", 2);
    p = sewPuzzle(p, "kitchen-things#0");
    assert.equal(freeContentExhausted(p, packs), false);
  });

  it("opens once every free puzzle is sewn", () => {
    let p = sewAll(emptyProgress, "breakfast", 2);
    p = sewAll(p, "kitchen-things", 2);
    assert.equal(freeContentExhausted(p, packs), true);
  });

  it("does not count a paid pack the player has not bought", () => {
    let p = sewAll(emptyProgress, "breakfast", 2);
    p = sewAll(p, "kitchen-things", 2);
    // The Sea is unowned, so it is not content they have run out of.
    assert.equal(freeContentExhausted(p, packs), true);
  });

  it("shuts again when a bought pack is still unfinished", () => {
    // Someone who bought The Sea and has puzzles left in it has not run out of
    // anything, and asking them for money again would be a lie.
    let p = buyPack(emptyProgress, "the-sea");
    p = sewAll(p, "breakfast", 2);
    p = sewAll(p, "kitchen-things", 2);
    assert.equal(freeContentExhausted(p, packs), false);

    p = sewAll(p, "the-sea", 2);
    assert.equal(freeContentExhausted(p, packs), true);
  });

  it("is shut for a player who has done nothing", () => {
    assert.equal(freeContentExhausted(emptyProgress, packs), false);
  });
});

describe("today", () => {
  it("uses the local calendar date, not UTC", () => {
    // A player just before midnight must not see tomorrow's Daily, nor lose
    // today's hints an hour early.
    const late = new Date(2026, 7, 12, 23, 30);
    assert.equal(today(late), "2026-08-12");
  });

  it("zero-pads month and day", () => {
    assert.equal(today(new Date(2026, 0, 5)), "2026-01-05");
  });
});

describe("what progress deliberately does not store", () => {
  it("has no streak, no missed-day count, and no scores", () => {
    // A field that exists eventually gets displayed, and each of these would be
    // a way of telling a player they have let something slip (constraint 4).
    const banned = /streak|missed|score|rank|combo|lives|penalt/i;
    for (const key of Object.keys(emptyProgress)) {
      assert.ok(!banned.test(key), `progress must not have a "${key}" field`);
    }
  });
});
