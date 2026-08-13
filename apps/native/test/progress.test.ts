import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FREE_HINTS_PER_DAY,
  emptyProgress,
  hintsAvailable,
  packSewnCount,
  sewDaily,
  sewPuzzle,
  spendHint,
  today,
  totalSquares,
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
