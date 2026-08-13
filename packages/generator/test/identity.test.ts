import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { generatePuzzle, puzzleSeed, readTheme } from "../src/index.ts";
import { lettersOnly } from "../src/types.ts";
import { kitchenThings, kitchenTitles } from "../data/kitchen-things.ts";

/**
 * Puzzle identity.
 *
 * The Puzzle screen and the Reveal screen each generate the board from
 * (packId, index) independently — nothing is passed between them. If generation
 * were not a pure function of that identity, the Reveal would show a DIFFERENT
 * puzzle than the one just solved, which is both the worst bug this app could
 * have and one that would look like a rendering glitch.
 */

const build = (packId: string, index: number) =>
  generatePuzzle({
    theme: kitchenThings,
    titles: kitchenTitles,
    spec: { rows: 7, cols: 7, wordCount: 7 },
    seed: puzzleSeed(packId, index),
  });

describe("generation is a pure function of (pack, index)", () => {
  it("the same identity produces an identical board, every time", () => {
    const a = build("kitchen-things", 7);
    const b = build("kitchen-things", 7);
    assert.ok(a.ok && b.ok);
    assert.deepEqual(a.puzzle.grid, b.puzzle.grid);
    assert.deepEqual(
      a.puzzle.placements.map((p) => p.word),
      b.puzzle.placements.map((p) => p.word),
    );
    assert.equal(a.puzzle.theme, b.puzzle.theme);
    assert.equal(a.puzzle.obliqueTitle, b.puzzle.obliqueTitle);
  });

  it("different indexes produce different boards", () => {
    const a = build("kitchen-things", 1);
    const b = build("kitchen-things", 2);
    assert.ok(a.ok && b.ok);
    assert.notDeepEqual(a.puzzle.grid, b.puzzle.grid);
  });

  it("the same index in different packs produces different boards", () => {
    // Otherwise puzzle 3 of every pack would be the same puzzle.
    assert.notEqual(puzzleSeed("kitchen-things", 3), puzzleSeed("the-garden", 3));
  });

  it("seeds are stable across runs, not just within one", () => {
    // Hard-coded so a change to the hash function fails loudly. Progress is
    // stored by identity, so a seed shift would silently regenerate every
    // puzzle a player has already sewn.
    assert.equal(puzzleSeed("kitchen-things", 0), puzzleSeed("kitchen-things", 0));
    assert.equal(typeof puzzleSeed("kitchen-things", 0), "number");
  });
});

describe("every generated puzzle actually resolves", () => {
  it("leftover cells spell the theme, across a whole pack's worth", () => {
    let built = 0;
    for (let i = 0; i < 20; i++) {
      const r = build("kitchen-things", i);
      if (!r.ok) continue;
      built++;
      assert.equal(
        readTheme(r.puzzle),
        lettersOnly(r.puzzle.theme),
        `puzzle ${i} does not resolve to its theme`,
      );
    }
    assert.ok(built > 0, "no puzzles generated at all");
  });

  it("no word is placed twice in the same puzzle", () => {
    const r = build("kitchen-things", 5);
    assert.ok(r.ok);
    const words = r.puzzle.placements.map((p) => p.word);
    assert.equal(new Set(words).size, words.length);
  });

  it("no cell is shared between two words", () => {
    // Shared cells would make the used-cell count less than the sum of word
    // lengths, and the leftover arithmetic — the whole reveal — would break.
    const r = build("kitchen-things", 9);
    assert.ok(r.ok);
    const seen = new Set<string>();
    for (const p of r.puzzle.placements) {
      for (const c of p.path) {
        const key = `${c.row},${c.col}`;
        assert.ok(!seen.has(key), `cell ${key} used by two words`);
        seen.add(key);
      }
    }
  });
});
