import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canExtend,
  cellAt,
  defaultGeometry,
  extendTrace,
  isAdjacent,
  isViablePrefix,
  matchTrace,
  readTrace,
} from "../src/trace.ts";
import type { Cell, Placement } from "../src/types.ts";

/**
 * The trace rules are the only interaction the product has. A trace that
 * accepts a non-adjacent hop, or rejects a legitimate diagonal, breaks the
 * game — so these are tested directly rather than through the gesture handler.
 */

const c = (row: number, col: number): Cell => ({ row, col });
const geo = defaultGeometry(7, 7); // pitch 46, cell 44, pad 7

describe("hit testing", () => {
  it("maps a point in the middle of a cell to that cell", () => {
    // Cell (2,3) origin is x = 3*46 + 7 = 145, y = 2*46 = 92.
    assert.deepEqual(cellAt(145 + 20, 92 + 20, geo), c(2, 3));
  });

  it("maps the gutter BETWEEN two tiles to a cell, not to nothing", () => {
    // The 2px gap between cells: pitch 46, cell 44, so x = pad + 44..46 is
    // gutter. A finger crossing it is still tracing — treating it as a miss
    // makes the gesture feel broken.
    const gutterX = geo.pad + 45;
    assert.deepEqual(cellAt(gutterX, 10, geo), c(0, 0));
  });

  it("returns null outside the board", () => {
    assert.equal(cellAt(-50, 10, geo), null);
    assert.equal(cellAt(10, -50, geo), null);
    assert.equal(cellAt(10_000, 10, geo), null);
    assert.equal(cellAt(10, 10_000, geo), null);
  });

  it("maps the last cell of the board, not one past it", () => {
    const x = geo.pad + 6 * geo.pitch + 5;
    const y = 6 * geo.pitch + 5;
    assert.deepEqual(cellAt(x, y, geo), c(6, 6));
  });
});

describe("adjacency", () => {
  it("accepts all eight neighbours, diagonals included", () => {
    const centre = c(3, 3);
    const neighbours = [
      c(2, 2), c(2, 3), c(2, 4),
      c(3, 2), c(3, 4),
      c(4, 2), c(4, 3), c(4, 4),
    ];
    for (const n of neighbours) {
      assert.ok(isAdjacent(centre, n), `${n.row},${n.col} should be adjacent`);
    }
  });

  it("rejects a cell two steps away, and the cell itself", () => {
    assert.equal(isAdjacent(c(3, 3), c(3, 5)), false);
    assert.equal(isAdjacent(c(3, 3), c(5, 5)), false);
    assert.equal(isAdjacent(c(3, 3), c(3, 3)), false);
  });
});

describe("extending a trace", () => {
  it("rejects reusing a cell already in the trace", () => {
    const path = [c(0, 0), c(0, 1), c(0, 2)];
    assert.equal(canExtend(path, c(0, 1)), false);
  });

  it("rejects a non-adjacent hop", () => {
    assert.equal(canExtend([c(0, 0)], c(4, 4)), false);
  });

  it("backtracks when the finger returns to the previous cell", () => {
    // Players correct themselves mid-drag constantly. A trace that can only
    // grow forces them to lift and start over.
    const path = [c(0, 0), c(0, 1), c(0, 2)];
    assert.deepEqual(extendTrace(path, c(0, 1)), [c(0, 0), c(0, 1)]);
  });

  it("is a no-op when the finger stays on the current cell", () => {
    const path = [c(0, 0), c(0, 1)];
    assert.equal(extendTrace(path, c(0, 1)), path, "should return same reference");
  });

  it("is a no-op on an illegal step rather than throwing or truncating", () => {
    const path = [c(0, 0)];
    assert.equal(extendTrace(path, c(5, 5)), path);
  });

  it("grows along a diagonal", () => {
    let path: Cell[] = [];
    for (const cell of [c(0, 0), c(1, 1), c(2, 2)]) path = extendTrace(path, cell);
    assert.deepEqual(path, [c(0, 0), c(1, 1), c(2, 2)]);
  });
});

describe("reading and matching", () => {
  const grid = [
    ["K", "E", "T", "X"],
    ["X", "T", "L", "X"],
    ["X", "X", "E", "X"],
    ["K", "E", "T", "T"],
  ];

  const kettle: Placement = {
    word: "KETTLE",
    path: [c(0, 0), c(0, 1), c(0, 2), c(1, 1), c(1, 2), c(2, 2)],
  };
  const placements = [kettle];

  it("reads the letters a trace spells", () => {
    assert.equal(readTrace(kettle.path, grid), "KETTLE");
  });

  it("matches a trace that covers a placement forwards", () => {
    assert.equal(matchTrace(kettle.path, placements)?.word, "KETTLE");
  });

  it("matches the same placement traced backwards", () => {
    assert.equal(matchTrace([...kettle.path].reverse(), placements)?.word, "KETTLE");
  });

  it("rejects a trace that spells the word over the WRONG cells", () => {
    // This is the important one. Matching on spelling alone would sew a word
    // whose real placement is still unfound, leaving its cells wrongly counted
    // as used — which breaks the leftover arithmetic and therefore the reveal.
    const wrongCells = [c(3, 0), c(3, 1), c(3, 2), c(3, 3), c(1, 2), c(2, 2)];
    assert.equal(readTrace(wrongCells, grid), "KETTLE");
    assert.equal(matchTrace(wrongCells, placements), null);
  });

  it("rejects a single cell and an empty trace", () => {
    assert.equal(matchTrace([c(0, 0)], placements), null);
    assert.equal(matchTrace([], placements), null);
  });

  it("rejects a partial trace", () => {
    assert.equal(matchTrace(kettle.path.slice(0, 3), placements), null);
  });
});

describe("viable prefixes", () => {
  const kettle: Placement = {
    word: "KETTLE",
    path: [c(0, 0), c(0, 1), c(0, 2), c(1, 1)],
  };
  const placements = [kettle];

  it("treats a real prefix as viable", () => {
    assert.equal(isViablePrefix(kettle.path.slice(0, 2), placements, []), true);
  });

  it("treats a reversed prefix as viable", () => {
    const reversed = [...kettle.path].reverse().slice(0, 2);
    assert.equal(isViablePrefix(reversed, placements, []), true);
  });

  it("treats a wrong turn as not viable", () => {
    assert.equal(isViablePrefix([c(0, 0), c(1, 0)], placements, []), false);
  });

  it("stops treating an already-found word as viable", () => {
    assert.equal(
      isViablePrefix(kettle.path.slice(0, 2), placements, ["KETTLE"]),
      false,
    );
  });

  it("treats an empty trace as viable", () => {
    assert.equal(isViablePrefix([], placements, []), true);
  });
});
