#!/usr/bin/env node
/**
 * The vocabulary linter, and a build check for every pack.
 *
 * The handover names vocabulary as the real launch risk: ~3,000 word
 * placements, and the most engaged players are the ones who notice repetition.
 * Hand-checking that does not hold, so the rules are checks.
 *
 *   node packages/generator/bench/vocabulary.mjs
 *
 * Exit 1 if any rule is broken or any pack cannot be built.
 */

import { generatePuzzle, lettersOnly, puzzleSeed, readTheme, DIFFICULTY_RAMP } from "../src/index.ts";
import { breakfast, breakfastTitles } from "../data/breakfast.ts";
import { kitchenThings, kitchenTitles } from "../data/kitchen-things.ts";
import { theGarden, theGardenTitles } from "../data/the-garden.ts";
import { theSea, theSeaTitles } from "../data/the-sea.ts";
import { birds, birdsTitles } from "../data/birds.ts";
import { books, booksTitles } from "../data/books.ts";
import { trains, trainsTitles } from "../data/trains.ts";

const PACKS = [
  { theme: breakfast, titles: breakfastTitles, size: 25, free: true },
  { theme: kitchenThings, titles: kitchenTitles, size: 25, free: true },
  { theme: theGarden, titles: theGardenTitles, size: 30, free: false },
  { theme: theSea, titles: theSeaTitles, size: 30, free: false },
  { theme: birds, titles: birdsTitles, size: 30, free: false },
  { theme: books, titles: booksTitles, size: 30, free: false },
  { theme: trains, titles: trainsTitles, size: 30, free: false },
];

const MIN_LEN = 4, MAX_LEN = 9;
const MIN_PHRASE = 9, MAX_PHRASE = 15;
const pad = (s, n) => String(s).padEnd(n);
let failed = false;
const fail = (msg) => { console.error(`  x ${msg}`); failed = true; };

/* ------------------------------------------------------- vocabulary rules */

console.log("VOCABULARY RULES\n");
console.log(pad("pack", 16) + pad("words", 8) + pad("usable", 8)
  + pad("phrases", 9) + pad("titles", 8) + "notes");

const seenAcrossPacks = new Map();

for (const { theme, titles, size } of PACKS) {
  const words = theme.words;
  const notes = [];

  // Duplicates would let one word be selected twice in a puzzle.
  if (new Set(words).size !== words.length) fail(`${theme.name}: duplicate words in pool`);

  // Length window — the selector's own filter, checked here so a pool is not
  // silently half-unusable.
  const usable = words.filter((w) => w.length >= MIN_LEN && w.length <= MAX_LEN);
  const outOfRange = words.length - usable.length;
  if (outOfRange > 0) notes.push(`${outOfRange} outside ${MIN_LEN}-${MAX_LEN}`);

  // Letters only. An apostrophe or space would never match a traced path.
  for (const w of words) {
    if (!/^[A-Z]+$/.test(w)) fail(`${theme.name}: "${w}" is not plain A-Z`);
  }

  // Pool size, measured against what the spike showed a pack needs.
  const needed = size >= 30 ? 160 : 140;
  if (usable.length < needed) {
    fail(`${theme.name}: ${usable.length} usable words, needs ~${needed} for ${size} puzzles`);
  }

  // Phrase length drives word quality — see D-028.
  for (const p of theme.phrases) {
    const n = lettersOnly(p).length;
    if (n < MIN_PHRASE || n > MAX_PHRASE) {
      notes.push(`phrase "${p}" is ${n} letters`);
    }
  }
  if (theme.phrases.length < 8) fail(`${theme.name}: only ${theme.phrases.length} phrases, needs 8+`);

  // The title bank must outrun the pack, or the generator runs out of
  // non-repeating titles partway through.
  const capacity = titles.frames.length * titles.fillers.length
    + (titles.standalone?.length ?? 0);
  if (capacity <= size) fail(`${theme.name}: ${capacity} titles for ${size} puzzles`);

  // Cross-pack rule from the handover: no word in more than two packs.
  for (const w of usable) {
    const packs = seenAcrossPacks.get(w) ?? [];
    packs.push(theme.name);
    seenAcrossPacks.set(w, packs);
  }

  console.log(
    pad(theme.name, 16) + pad(words.length, 8) + pad(usable.length, 8)
    + pad(theme.phrases.length, 9) + pad(capacity, 8) + notes.join("; "),
  );
}

const overshared = [...seenAcrossPacks.entries()].filter(([, p]) => p.length > 2);
console.log(`\nCross-pack: ${overshared.length} words appear in more than two packs`);
for (const [w, packs] of overshared.slice(0, 10)) {
  fail(`"${w}" is in ${packs.length} packs: ${packs.join(", ")}`);
}

/* ----------------------------------------------------------- build check */

// This mirrors `apps/native/lib/puzzles.ts` exactly — same seeds, same ramp,
// same fallback, same carried title and usage state. It has to: a check that
// builds different boards than the app ships proves nothing about the app.
console.log("\n\nEVERY PACK BUILDS\n");
console.log(pad("pack", 16) + pad("size", 7) + pad("built", 10)
  + pad("distinct", 10) + pad("max uses", 10) + pad("resolves", 10) + "titles");

for (const { theme, titles, size, free } of PACKS) {
  const usage = new Map();
  const usedTitles = new Set();
  let built = 0, resolves = 0;

  for (let i = 0; i < size; i++) {
    const step = Math.min(DIFFICULTY_RAMP.length - 1,
      Math.floor((i / size) * DIFFICULTY_RAMP.length));
    let made = null;
    for (let s = step; s >= 0 && !made; s--) {
      const r = generatePuzzle({
        theme, titles, spec: DIFFICULTY_RAMP[s],
        seed: puzzleSeed(theme.id, i), usedTitles, usage, maxUsesPerWord: 2,
      });
      if (r.ok) made = r.puzzle;
    }
    if (!made) continue;
    built++;
    if (readTheme(made) === lettersOnly(made.theme)) resolves++;
    usedTitles.add(made.obliqueTitle);
    for (const p of made.placements) usage.set(p.word, (usage.get(p.word) ?? 0) + 1);
  }

  const maxUse = Math.max(0, ...usage.values());
  console.log(
    pad(theme.name, 16) + pad(`${size}${free ? " free" : ""}`, 7)
    + pad(`${built}/${size}`, 10) + pad(usage.size, 10)
    + pad(maxUse, 10) + pad(`${resolves}/${built}`, 10) + `${usedTitles.size}/${built}`,
  );

  if (built < size) fail(`${theme.name} built only ${built}/${size}`);
  if (resolves < built) fail(`${theme.name}: ${built - resolves} puzzles do not resolve`);
  if (maxUse > 2) fail(`${theme.name}: a word appears ${maxUse} times`);
  // The oblique title is the one line a player reads before the board. Two
  // puzzles carrying the same one reads as the app repeating itself.
  if (usedTitles.size < built) fail(`${theme.name}: ${built - usedTitles.size} repeated titles`);
}

const freeTotal = PACKS.filter((p) => p.free).reduce((n, p) => n + p.size, 0);
const paidTotal = PACKS.filter((p) => !p.free).reduce((n, p) => n + p.size, 0);
console.log(`\nLibrary: ${freeTotal} free + ${paidTotal} paid = ${freeTotal + paidTotal} puzzles`);

process.exit(failed ? 1 : 0);
