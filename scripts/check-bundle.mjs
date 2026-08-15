#!/usr/bin/env node
/**
 * scripts/check-bundle.mjs — assert the built bundle still carries the design.
 *
 * A bundle can compile perfectly while having lost the entire palette: if the
 * uniwind config stops being picked up, every component falls back to the
 * library's stock theme and the app renders in grey and blue. Everything is
 * internally consistent, nothing errors, and the diff looks fine. This is the
 * single most expensive failure available in this project and it is invisible
 * to code review — so it is asserted against the shipped bytecode.
 *
 *   node scripts/check-bundle.mjs <export-dir>
 */

import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("usage: node scripts/check-bundle.mjs <export-dir>");
  process.exit(2);
}

/** Find the JS/Hermes bundle wherever the exporter put it. */
function findBundles(root) {
  const out = [];
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(hbc|js)$/.test(entry.name)) out.push(full);
    }
  };
  walk(root);
  return out;
}

const bundles = findBundles(dir);
if (bundles.length === 0) {
  console.error(`No bundle found under ${dir}`);
  process.exit(1);
}

const haystack = bundles
  .map((f) => fs.readFileSync(f, "latin1"))
  .join("\n");

/** Colours that must be present, one per ground, both themes. */
const REQUIRED = {
  "field (light)": "#C25A34",
  "field (dark)": "#8A3E27",
  "sheet (light)": "#FBF4E4",
  "sheet (dark)": "#1E1B16",
  "tile (light)": "#FFFDF6",
  "tile (dark)": "#2C2721",
  "sewn (light)": "#F0C982",
  "shade (dark)": "#0E0C09",
};

/**
 * Values that must NOT appear. heroui-native's stock accent is the tell: if it
 * is in the bundle, the library's theme won and ours did not.
 */
const FORBIDDEN = {
  "heroui stock accent": "oklch(0.6204 0.195 253.83)",
};

let failed = false;

for (const [name, hex] of Object.entries(REQUIRED)) {
  // Bundlers may lowercase hex literals, so match case-insensitively.
  const present = haystack.toLowerCase().includes(hex.toLowerCase());
  console.log(`${present ? "ok  " : "MISS"} ${name.padEnd(16)} ${hex}`);
  if (!present) failed = true;
}

for (const [name, value] of Object.entries(FORBIDDEN)) {
  const present = haystack.includes(value);
  console.log(`${present ? "LEAK" : "ok  "} ${name.padEnd(16)} absent as expected`);
  if (present) failed = true;
}

/** The font faces must be referenced by their per-weight family names. */
const FACES = ["Nunito_900Black", "Nunito_800ExtraBold", "Newsreader_500Medium_Italic"];
for (const face of FACES) {
  const present = haystack.includes(face);
  console.log(`${present ? "ok  " : "MISS"} font ${face}`);
  if (!present) failed = true;
}

if (failed) {
  console.error(
    "\nThe built bundle does not carry the WordQuilt design.\n" +
      "This usually means the uniwind config stopped being picked up — the app\n" +
      "would render in the component library's stock palette.",
  );
  process.exit(1);
}
console.log("\nThe bundle carries the design.");
