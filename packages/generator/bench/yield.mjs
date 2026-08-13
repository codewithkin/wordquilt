#!/usr/bin/env node
/**
 * The generator spike. Answers, with numbers rather than impressions:
 *
 *   1. What success rate does each grid size get?
 *   2. Can a ~200-word pool yield 50 distinct puzzles for one pack?
 *   3. What does enforcing "no word repeats inside a pack" actually cost?
 *   4. How does phrase length trade off against word quality?
 *
 *   node packages/generator/bench/yield.mjs
 */

import { generatePuzzle, lettersOnly, readTheme } from "../src/index.ts";
import { kitchenThings, kitchenTitles } from "../data/kitchen-things.ts";

const SPECS = [
  { rows: 6, cols: 6, wordCount: 5 },
  { rows: 7, cols: 7, wordCount: 7 },
  { rows: 8, cols: 8, wordCount: 8 },
  { rows: 8, cols: 8, wordCount: 9 },
  { rows: 9, cols: 9, wordCount: 10 },
];

const TRIALS = 200;
const pad = (s, n) => String(s).padEnd(n);
const pct = (a, b) => `${((a / b) * 100).toFixed(1)}%`;

console.log(`Pool: "${kitchenThings.name}" — ${kitchenThings.words.length} words, `
  + `${kitchenThings.phrases.length} phrases\n`);

/* ---------------------------------------------------------- 1. per grid --- */

console.log("1. SUCCESS RATE BY GRID SIZE  (independent puzzles, fresh pool each time)\n");
console.log(pad("grid", 12) + pad("words", 7) + pad("success", 10)
  + pad("avg word len", 14) + pad("resolves", 10) + "median attempts");

const gridStats = [];
for (const spec of SPECS) {
  let ok = 0, resolves = 0, letters = 0, words = 0;
  const attempts = [];
  for (let seed = 0; seed < TRIALS; seed++) {
    const r = generatePuzzle({ theme: kitchenThings, titles: kitchenTitles, spec, seed });
    if (!r.ok) continue;
    ok++;
    attempts.push(r.attempts);
    words += r.puzzle.placements.length;
    letters += r.puzzle.placements.reduce((n, p) => n + p.word.length, 0);
    if (readTheme(r.puzzle) === lettersOnly(r.puzzle.theme)) resolves++;
  }
  attempts.sort((a, b) => a - b);
  const median = attempts[Math.floor(attempts.length / 2)] ?? 0;
  gridStats.push({ spec, ok });
  console.log(
    pad(`${spec.rows}x${spec.cols}`, 12) +
    pad(spec.wordCount, 7) +
    pad(pct(ok, TRIALS), 10) +
    pad(ok ? (letters / words).toFixed(1) : "—", 14) +
    pad(ok ? pct(resolves, ok) : "—", 10) +
    median,
  );
}

/* ------------------------------------------------- 2 & 3. a whole pack --- */

console.log("\n\n2. A WHOLE PACK  (walking the difficulty ramp, one seed per puzzle)\n");

function buildPack(size, { noRepeat, maxUses = 2 }) {
  const usedWords = new Set();
  const usedTitles = new Set();
  const usage = new Map();
  let built = 0;
  const failures = [];

  for (let i = 0; i < size; i++) {
    const step = Math.min(SPECS.length - 1, Math.floor((i / size) * SPECS.length));
    let made = null;

    // Same fallback the app uses: drop down the ramp rather than fail outright.
    for (let s = step; s >= 0 && !made; s--) {
      const r = generatePuzzle({
        theme: kitchenThings,
        titles: kitchenTitles,
        spec: SPECS[s],
        seed: i * 7919 + s,
        usedWords: noRepeat ? usedWords : undefined,
        usedTitles,
        usage,
        maxUsesPerWord: maxUses,
      });
      if (r.ok) made = r.puzzle;
    }

    if (!made) { failures.push(i); continue; }
    built++;
    usedTitles.add(made.obliqueTitle);
    for (const p of made.placements) {
      usedWords.add(p.word);
      usage.set(p.word, (usage.get(p.word) ?? 0) + 1);
    }
  }
  return { built, failures, usage, distinctWords: usage.size };
}

for (const size of [30, 50]) {
  for (const noRepeat of [false, true]) {
    const r = buildPack(size, { noRepeat });
    const maxUse = Math.max(0, ...r.usage.values());
    console.log(
      `${pad(`${size} puzzles`, 13)} ${pad(noRepeat ? "no repeats" : "repeats ok", 13)} ` +
      `built ${pad(`${r.built}/${size}`, 8)} ` +
      `distinct words ${pad(r.distinctWords, 6)} ` +
      `max uses of one word ${maxUse}`,
    );
  }
}

/* -------------------------------------------- 4. phrase length tradeoff --- */

console.log("\n\n3. PHRASE LENGTH vs WORD QUALITY  (8x8, 8 words, 64 cells)\n");
console.log(pad("phrase letters", 16) + pad("cells for words", 17)
  + pad("avg word len", 14) + "success");

for (const phrase of kitchenThings.phrases) {
  const n = lettersOnly(phrase).length;
  const spec = { rows: 8, cols: 8, wordCount: 8 };
  let ok = 0, letters = 0, words = 0;
  for (let seed = 0; seed < 60; seed++) {
    const r = generatePuzzle({ theme: kitchenThings, titles: kitchenTitles, spec, seed, phrase });
    if (!r.ok) continue;
    ok++;
    words += r.puzzle.placements.length;
    letters += r.puzzle.placements.reduce((a, p) => a + p.word.length, 0);
  }
  console.log(
    pad(`${n}  "${phrase.slice(0, 18)}"`, 16 + 8) +
    pad(64 - n, 9) +
    pad(ok ? (letters / words).toFixed(1) : "—", 14) +
    pct(ok, 60),
  );
}

/* ------------------------------------------- 5. how big must a pool be? --- */

console.log("\n\n4. POOL SIZE NEEDED  (max 2 uses per word, full ramp)\n");
console.log(pad("pool", 8) + pad("30 puzzles", 14) + "50 puzzles");

const full = kitchenThings.words;
for (const size of [80, 120, 160, 187]) {
  const pool = full.slice(0, size);
  const row = [];
  for (const packSize of [30, 50]) {
    const usage = new Map();
    const usedTitles = new Set();
    let built = 0;
    for (let i = 0; i < packSize; i++) {
      const step = Math.min(SPECS.length - 1, Math.floor((i / packSize) * SPECS.length));
      let made = null;
      for (let s = step; s >= 0 && !made; s--) {
        const r = generatePuzzle({
          theme: { ...kitchenThings, words: pool },
          titles: kitchenTitles,
          spec: SPECS[s],
          seed: i * 7919 + s,
          usedTitles,
          usage,
          maxUsesPerWord: 2,
        });
        if (r.ok) made = r.puzzle;
      }
      if (!made) continue;
      built++;
      usedTitles.add(made.obliqueTitle);
      for (const p of made.placements) usage.set(p.word, (usage.get(p.word) ?? 0) + 1);
    }
    row.push(`${built}/${packSize} (${pct(built, packSize)})`);
  }
  console.log(pad(size, 8) + pad(row[0], 14) + row[1]);
}

console.log("\nTitle bank capacity check:");
const cap = kitchenTitles.frames.length * kitchenTitles.fillers.length
  + (kitchenTitles.standalone?.length ?? 0);
console.log(`  ${cap} distinct oblique titles — needs to exceed the pack size.`);
