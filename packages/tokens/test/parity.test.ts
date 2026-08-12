/**
 * Token parity: packages/tokens/src/*.ts  <->  apps/native/global.css
 *
 * These two files describe the same values and CANNOT import each other — one
 * is TypeScript consumed by components, the other is CSS consumed by the
 * uniwind/Tailwind compiler. Left unchecked they will drift, and the failure
 * mode is silent: both sides stay internally consistent while one of them stops
 * matching the design. This is the check that spans the gap.
 *
 * It also pins a few RULES rather than values — no pure black or white, no
 * error colour, muted never collapses into ink — so that a future palette
 * revision still has to hold the line.
 *
 *   node --test packages/tokens/test/
 *
 * To confirm this test can actually fail, change one hex in either file and
 * re-run. It has been verified to go red on: a changed colour, a changed
 * radius, a missing token, and a blurred shadow.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  colors,
  elevation,
  fabricSwatches,
  fontFamily,
  minBodySize,
  minTouchTarget,
  radius,
  scrim,
  typeRole,
  type ThemeName,
} from "../src/index.ts";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const CSS_PATH = path.join(ROOT, "apps/native/global.css");

/**
 * Comments are stripped BEFORE any parsing. This is not tidiness: a prose
 * comment mentioning a token by name — "a warm scrim, not --wq-shade: ..." —
 * parses as a declaration whose value runs to the next semicolon, swallowing
 * the real declaration that follows it. That bug was live in this file.
 */
const css = fs.readFileSync(CSS_PATH, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/* ----------------------------------------------------------------- parse --- */

/** Grab the body of a `@variant <theme> { ... }` block, brace-matched. */
function variantBlock(source: string, theme: ThemeName, occurrence = 0): string {
  const marker = `@variant ${theme} {`;
  let from = -1;
  for (let i = 0; i <= occurrence; i++) {
    from = source.indexOf(marker, from + 1);
    assert.notEqual(from, -1, `no @variant ${theme} block #${occurrence} in global.css`);
  }
  let depth = 0;
  let i = from + marker.length - 1;
  const start = i + 1;
  do {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") depth--;
    i++;
  } while (depth > 0 && i < source.length);
  return source.slice(start, i - 1);
}

/** `--name: value;` pairs out of a block. */
function declarations(block: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out.set(m[1]!, m[2]!.trim());
  }
  return out;
}

/** The `@theme inline static { ... }` namespace block. */
const themeBlock = (() => {
  const marker = "@theme inline static {";
  const from = css.indexOf(marker);
  assert.notEqual(from, -1, "no @theme inline static block in global.css");
  let depth = 0;
  let i = from + marker.length - 1;
  const start = i + 1;
  do {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") depth--;
    i++;
  } while (depth > 0 && i < css.length);
  return declarations(css.slice(start, i - 1));
})();

/**
 * Normalise a colour for comparison. Case, whitespace and trailing zeros are
 * noise — `rgba(36,31,25,0.30)` and `rgba(36, 31, 25, 0.3)` are one colour, and
 * failing on the difference means any formatter run breaks the build. Numeric
 * canonicalisation still separates 0.3 from 0.34, which is the difference that
 * actually matters.
 */
const norm = (v: string) => {
  const flat = v.toLowerCase().replace(/\s+/g, "");
  const rgba = flat.match(/^rgba?\(([^)]*)\)$/);
  if (!rgba) return flat;
  const parts = rgba[1]!.split(",").map((n) => String(Number(n)));
  return `rgba(${parts.join(",")})`;
};

/** camelCase token name -> --wq-kebab-case CSS variable. */
const cssVar = (key: string) =>
  "--wq-" + key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

/* ------------------------------------------------------------- the tests --- */

describe("colour ramp parity (TS <-> CSS)", () => {
  // The first @variant light/dark pair is the WordQuilt palette; the second
  // pair repoints heroui-native's semantics at it and is checked separately.
  const themes: ThemeName[] = ["light", "dark"];

  for (const theme of themes) {
    const declared = declarations(variantBlock(css, theme, 0));

    it(`${theme}: every TS colour appears in global.css with the same value`, () => {
      for (const [key, value] of Object.entries(colors[theme])) {
        const name = cssVar(key);
        const found = declared.get(name);
        assert.ok(found, `global.css @variant ${theme} is missing ${name}`);
        assert.equal(
          norm(found),
          norm(value),
          `${name} in ${theme}: CSS has ${found}, tokens have ${value}`,
        );
      }
    });

    it(`${theme}: global.css declares no --wq-* colour the tokens do not have`, () => {
      const known = new Set([
        ...Object.keys(colors[theme]).map(cssVar),
        "--wq-scrim", // exported separately from the ramp
      ]);
      for (const name of declared.keys()) {
        assert.ok(known.has(name), `global.css declares ${name}, absent from tokens`);
      }
    });
  }

  it("light and dark declare an identical set of variables", () => {
    // Uniwind enforces this at build time too, but failing here is faster and
    // names the missing token instead of failing the bundle.
    const light = new Set(declarations(variantBlock(css, "light", 0)).keys());
    const dark = new Set(declarations(variantBlock(css, "dark", 0)).keys());
    assert.deepEqual(
      [...light].sort(),
      [...dark].sort(),
      "light and dark must declare the same variables",
    );
  });

  it("scrim matches", () => {
    assert.equal(
      norm(declarations(variantBlock(css, "light", 0)).get("--wq-scrim")!),
      norm(scrim),
    );
  });
});

describe("radius parity", () => {
  it("every radius token exists in CSS with the same px value", () => {
    for (const [key, value] of Object.entries(radius)) {
      const name = "--radius-" + key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
      const found = themeBlock.get(name);
      assert.ok(found, `@theme is missing ${name}`);
      assert.equal(found, `${value}px`, `${name}: CSS ${found}, tokens ${value}px`);
    }
  });
});

describe("elevation parity", () => {
  it("every elevation level exists as a shadow token with the right offset", () => {
    for (const [key, offset] of Object.entries(elevation)) {
      const onSheet = themeBlock.get(`--shadow-${key}`);
      assert.ok(onSheet, `@theme is missing --shadow-${key}`);
      assert.equal(
        norm(onSheet),
        norm(`0 ${offset}px 0 var(--wq-shade)`),
        `--shadow-${key} must be a hard offset in the shade colour`,
      );
    }
  });

  it("the on-field shadow variants use the field edge, not the shade", () => {
    for (const key of ["chip", "tile", "card"] as const) {
      const found = themeBlock.get(`--shadow-${key}-on-field`);
      assert.ok(found, `@theme is missing --shadow-${key}-on-field`);
      assert.equal(
        norm(found),
        norm(`0 ${elevation[key]}px 0 var(--wq-field-edge)`),
        "controls on the terracotta field take the field's edge colour",
      );
    }
  });

  it("no shadow token is ever blurred or spread", () => {
    // The design has exactly one elevation language: `0 Npx 0 <ink>`. A blur or
    // spread radius anywhere means someone reached for a generic drop shadow.
    for (const [name, value] of themeBlock) {
      if (!name.startsWith("--shadow-")) continue;
      // Drop the colour, leaving the length components: `0 5px 0`.
      const lengths = value.replace(/var\([^)]*\)|#[0-9a-f]+|rgba?\([^)]*\)/gi, "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      assert.equal(
        lengths.length,
        3,
        `${name} = "${value}" has ${lengths.length} length components; expected 3 (x, y, blur)`,
      );
      const isZero = (v: string) => /^0(px)?$/.test(v);
      assert.ok(isZero(lengths[0]!), `${name}: horizontal offset must be 0, got ${lengths[0]}`);
      assert.ok(
        isZero(lengths[2]!),
        `${name}: blur must be 0 — this design has no blurred shadows, got ${lengths[2]}`,
      );
      assert.match(
        lengths[1]!,
        /^\d+px$/,
        `${name}: vertical offset must be a positive px value, got ${lengths[1]}`,
      );
    }
  });

  it("the wq-* composites emit a plain box-shadow, not Tailwind's var chain", () => {
    // Tailwind's `shadow-*` utilities compile to a composed
    // `var(--tw-inset-shadow), var(--tw-ring-shadow), ...` chain. React Native's
    // boxShadow parser takes a simple string, so the composites spell the
    // shadow out literally — that is the whole reason they exist. If someone
    // rewrites them with @apply, this catches it.
    for (const m of css.matchAll(/@utility\s+(wq-[\w-]+)\s*\{([^}]*)\}/g)) {
      const [, name, body] = m;
      const shadow = body!.match(/box-shadow:\s*([^;]+);/);
      if (!shadow) continue;
      assert.ok(
        !shadow[1]!.includes("--tw-"),
        `@utility ${name} must not depend on Tailwind's --tw-shadow chain`,
      );
      assert.match(
        shadow[1]!.trim(),
        /^0 \d+px 0 var\(--wq-(shade|field-edge)\)$/,
        `@utility ${name} box-shadow "${shadow[1]}" is not a hard offset edge`,
      );
    }
  });
});

describe("typography parity", () => {
  it("every font family token exists in CSS with the same face name", () => {
    for (const [key, value] of Object.entries(fontFamily)) {
      const name = "--font-" + key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
      const found = themeBlock.get(name);
      assert.ok(found, `@theme is missing ${name}`);
      assert.equal(found.replace(/["']/g, ""), value, `${name} mismatch`);
    }
  });

  it("every type role exists in CSS with the same size and spacing", () => {
    for (const [key, role] of Object.entries(typeRole)) {
      const base = "--text-" + key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
      const size = themeBlock.get(base);
      assert.ok(size, `@theme is missing ${base}`);
      assert.equal(size, `${role.size}px`, `${base}: CSS ${size}, tokens ${role.size}px`);

      if ("lineHeight" in role && role.lineHeight !== undefined) {
        assert.equal(
          themeBlock.get(`${base}--line-height`),
          String(role.lineHeight),
          `${base}--line-height mismatch`,
        );
      }
      if ("letterSpacing" in role && role.letterSpacing !== undefined) {
        assert.equal(
          themeBlock.get(`${base}--letter-spacing`),
          `${role.letterSpacing}em`,
          `${base}--letter-spacing mismatch`,
        );
      }
    }
  });

  it("no type role name collides with a colour name", () => {
    // Tailwind v4 resolves `text-<name>` against --text-* (font size) BEFORE
    // --color-* (text colour). Defining both under one name silently deletes
    // the colour utility — the class still compiles, it just stops setting a
    // colour, which is invisible until a screen renders in the wrong ink.
    const sizeNames = [...themeBlock.keys()]
      .filter((n) => n.startsWith("--text-") && !n.includes("--line-height") && !n.includes("--letter-spacing"))
      .map((n) => n.slice("--text-".length));
    const colorNames = [...themeBlock.keys()]
      .filter((n) => n.startsWith("--color-"))
      .map((n) => n.slice("--color-".length));
    const collisions = sizeNames.filter((n) => colorNames.includes(n));
    assert.deepEqual(
      collisions,
      [],
      `these names are defined as BOTH a font size and a colour: ${collisions.join(", ")}`,
    );
  });

  it("no type token carries a numeric font-weight", () => {
    // React Native does not synthesise weights for custom families. The family
    // IS the weight here; a `font-weight` token would invite the bug back.
    for (const name of themeBlock.keys()) {
      assert.ok(
        !name.startsWith("--font-weight"),
        `${name}: weights are encoded in the family name, never as a weight`,
      );
    }
  });
});

describe("fabric swatches", () => {
  it("all four free palettes exist in CSS", () => {
    for (const [key, value] of Object.entries(fabricSwatches)) {
      const found = themeBlock.get(`--color-fabric-${key}`);
      assert.ok(found, `@theme is missing --color-fabric-${key}`);
      assert.equal(norm(found), norm(value));
    }
  });
});

describe("palette rules that must survive a redesign", () => {
  const hexes = (theme: ThemeName) =>
    Object.values(colors[theme]).filter((v) => v.startsWith("#"));

  it("no pure black and no pure white, in either theme", () => {
    for (const theme of ["light", "dark"] as ThemeName[]) {
      for (const hex of hexes(theme)) {
        const h = hex.toLowerCase();
        assert.notEqual(h, "#000000", `${theme} uses pure black`);
        assert.notEqual(h, "#ffffff", `${theme} uses pure white`);
      }
    }
  });

  it("no error, danger or destructive colour is defined anywhere", () => {
    // WordQuilt never tells a player they got something wrong (constraint 4:
    // no punitive language, no red badges). A red token existing is how it
    // eventually gets used, so the rule is that it must not exist at all.
    const banned = /error|danger|destructive|invalid|warning|fail/i;
    for (const key of Object.keys(colors.light)) {
      assert.ok(!banned.test(key), `token "${key}" names a failure state`);
    }
    for (const name of themeBlock.keys()) {
      assert.ok(!banned.test(name), `CSS token "${name}" names a failure state`);
    }
  });

  it("muted never collapses into ink", () => {
    for (const theme of ["light", "dark"] as ThemeName[]) {
      const { ink, muted, mutedStrong } = colors[theme];
      assert.notEqual(muted, ink, `${theme}: muted equals ink, hierarchy is gone`);
      assert.notEqual(mutedStrong, ink, `${theme}: mutedStrong equals ink`);
    }
  });

  it("the dark elevation ink is darker than the dark page, not lighter", () => {
    // If `shade` tracked `ink` in dark mode every card would glow instead of
    // sit. This is the single easiest dark-mode mistake in this design.
    const lum = (hex: string) => {
      const h = hex.replace("#", "");
      const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
      const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!);
    };
    assert.ok(
      lum(colors.dark.shade) < lum(colors.dark.sheet),
      "dark shade must be darker than the dark sheet",
    );
    assert.ok(
      lum(colors.dark.shade) < lum(colors.dark.ink),
      "dark shade must not track dark ink",
    );
  });
});

describe("hard product constraints expressed as tokens", () => {
  it("the minimum touch target is 44px and no control is shorter", () => {
    assert.equal(minTouchTarget, 44);
  });

  it("body copy never goes below 15px", () => {
    assert.equal(minBodySize, 15);
    assert.ok(
      typeRole.body.size >= minBodySize,
      "the body role is below the body-copy floor",
    );
  });
});
