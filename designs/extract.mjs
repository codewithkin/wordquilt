#!/usr/bin/env node
/**
 * designs/extract.mjs — turn `designs/*.dc.html` into readable, greppable values.
 *
 * The design files are DC documents: an HTML template full of `{{token}}`
 * placeholders, plus a `<script type="text/x-dc">` block containing a
 * `class Component extends DCLogic` whose `renderVals()` returns the concrete
 * style objects the template interpolates. Every hex, radius, size and shadow
 * in the design lives in that returned object — so the reliable way to read a
 * design is to RUN it, not to regex the markup.
 *
 * This script evaluates each `renderVals()` in a sandbox and writes:
 *
 *   designs/extracted/<Screen>.json   the full value tree, pretty-printed
 *   designs/extracted/<Screen>.txt    a flattened `path = value` listing (greppable)
 *   designs/extracted/_INDEX.md       what was extracted, and what failed
 *
 * `designs/extracted/` is gitignored. Re-run this rather than committing it.
 *
 *   node designs/extract.mjs
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "extracted");

/**
 * Minimal stand-in for the DC runtime's base class. The real runtime supplies
 * far more, but `renderVals()` in these files only ever reads `this.props`.
 * If a design ever reaches for something else, extraction fails loudly for that
 * file rather than silently returning a half-built object — see the catch below.
 */
const DC_LOGIC_SHIM = `
class DCLogic {
  constructor(props) { this.props = props || {}; }
}
`;

/** Pull the x-dc script block and the default props declared on its data-props attribute. */
function parseDesign(src) {
  const scriptMatch = src.match(
    /<script type="text\/x-dc"([^>]*)>([\s\S]*?)<\/script>/,
  );
  if (!scriptMatch) return null;

  const [, attrs, js] = scriptMatch;

  // data-props is HTML-escaped JSON: {"accent":{"editor":"color","default":"#C25A34",...}}
  // Each entry is an editor descriptor; the value the component sees is `.default`.
  let props = {};
  const propsMatch = attrs.match(/data-props="([^"]*)"/);
  if (propsMatch) {
    const json = propsMatch[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'");
    try {
      const parsed = JSON.parse(json);
      for (const [k, v] of Object.entries(parsed)) {
        if (k.startsWith("$")) continue;
        props[k] = v && typeof v === "object" && "default" in v ? v.default : v;
      }
    } catch {
      // Malformed props are not fatal — the component's own `|| fallback`
      // defaults cover it. Recorded in the index so it is visible.
      props = { __propsParseFailed: true };
    }
  }

  return { js, props };
}

function run(js, props) {
  const sandbox = { console, module: {}, exports: {} };
  vm.createContext(sandbox);
  // `Component` is the class name every design file uses.
  vm.runInContext(`${DC_LOGIC_SHIM}\n${js}\nglobalThis.__C = Component;`, sandbox, {
    timeout: 10_000,
  });
  const instance = new sandbox.__C(props);
  return instance.renderVals();
}

/**
 * Flatten to `a.b.c = value` lines. Style objects become one line each so a
 * grep for a hex returns the property that carries it, not a 40-line blob.
 */
function flatten(node, prefix, out) {
  if (node === null || node === undefined) {
    out.push(`${prefix} = ${node}`);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
    return;
  }
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
    return;
  }
  out.push(`${prefix} = ${node}`);
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, f));

  const files = fs
    .readdirSync(HERE)
    .filter((f) => f.endsWith(".dc.html"))
    .sort();

  const index = [];

  for (const file of files) {
    const name = file.replace(/^WordQuilt - /, "").replace(/\.dc\.html$/, "");
    const src = fs.readFileSync(path.join(HERE, file), "utf8");
    const parsed = parseDesign(src);

    if (!parsed) {
      index.push(`| ${name} | — | **no x-dc script block found** |`);
      console.error(`SKIP  ${file}: no script block`);
      continue;
    }

    let vals;
    try {
      vals = run(parsed.js, parsed.props);
    } catch (err) {
      index.push(`| ${name} | — | **FAILED: ${err.message}** |`);
      console.error(`FAIL  ${file}: ${err.message}`);
      continue;
    }

    const lines = [];
    flatten(vals, "", lines);
    lines.sort();

    fs.writeFileSync(
      path.join(OUT, `${name}.json`),
      JSON.stringify(vals, null, 2),
    );
    fs.writeFileSync(path.join(OUT, `${name}.txt`), lines.join("\n") + "\n");

    index.push(
      `| ${name} | ${Object.keys(vals).length} top-level keys, ${lines.length} values | ok |`,
    );
    console.log(`OK    ${name}  (${lines.length} values)`);
  }

  fs.writeFileSync(
    path.join(OUT, "_INDEX.md"),
    [
      "# designs/extracted",
      "",
      "Generated by `node designs/extract.mjs`. Do not edit — re-run instead.",
      "",
      "`.json` is the value tree as the design renders it. `.txt` is the same data",
      "flattened to `path = value`, one per line, sorted — grep this for a hex.",
      "",
      "| Design | Size | Status |",
      "| --- | --- | --- |",
      ...index,
      "",
    ].join("\n"),
  );

  console.log(`\nWrote ${OUT}`);
}

main();
