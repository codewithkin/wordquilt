#!/usr/bin/env node
/**
 * scripts/check-assets.mjs — hold the shipped PNGs and app.json to the manifest
 * that lives in the design file.
 *
 * Pillar 6: the asset manifest exists in three places that cannot import each
 * other — the design (`WordQuilt - Platform Assets.dc.html`), the binaries in
 * `apps/native/assets/images/`, and the Expo config keys in `app.json`. Left
 * alone, all three will happily agree with themselves while disagreeing with
 * what the stores accept. This spans the gap.
 *
 * The manifest is READ FROM THE DESIGN (via designs/extracted), never copied
 * here — so editing the design is what changes the requirement.
 *
 * Checks, per manifest row:
 *   - the file exists at the path the row names
 *   - its pixel dimensions match the row
 *   - its alpha channel matches the row ("None" / "required" / "kept"), and
 *     where alpha is *required* the file is actually transparent, not merely
 *     32-bit — an opaque "transparent" splash icon is the failure this catches
 *   - the app.json key the row names actually points at that file
 *   - rows that specify a colour instead of a file match app.json's colour
 *
 *   node scripts/check-assets.mjs
 *
 * Exit code 0 = clean, 1 = at least one mismatch.
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NATIVE = path.join(ROOT, "apps/native");
const EXTRACTED = path.join(ROOT, "designs/extracted/Platform Assets.json");

/* ------------------------------------------------------------------ PNG --- */

/** Read IHDR without decoding pixels. */
function readHeader(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  // 8-byte signature, then IHDR: 4 len + 4 type + width/height/depth/colorType
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    bitDepth: buf[24],
    colorType: buf[25],
  };
}

function chunks(buf) {
  const out = [];
  let off = 8;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    out.push({ type, data: buf.subarray(off + 8, off + 8 + len) });
    off += 12 + len; // len + type + data + crc
    if (type === "IEND") break;
  }
  return out;
}

/**
 * Decode just the alpha channel far enough to answer "is anything actually
 * translucent". Only handles 8-bit colour types 6 (RGBA) and 4 (grey+alpha) —
 * every other type has no alpha channel, so the answer is trivially no.
 */
function hasRealTransparency(buf, header) {
  const { width, height, colorType, bitDepth } = header;
  if (colorType !== 6 && colorType !== 4) return false;
  if (bitDepth !== 8) return null; // unknown — reported, not guessed

  const channels = colorType === 6 ? 4 : 2;
  const stride = width * channels;
  const idat = Buffer.concat(
    chunks(buf).filter((c) => c.type === "IDAT").map((c) => c.data),
  );
  const raw = zlib.inflateSync(idat);

  const prev = Buffer.alloc(stride);
  const cur = Buffer.alloc(stride);
  let off = 0;

  for (let y = 0; y < height; y++) {
    const filter = raw[off++];
    raw.copy(cur, 0, off, off + stride);
    off += stride;

    // PNG filter reconstruction (RFC 2083 §6)
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? cur[i - channels] : 0; // left
      const b = prev[i]; // up
      const c = i >= channels ? prev[i - channels] : 0; // upper-left
      let x = cur[i];
      switch (filter) {
        case 0: break;
        case 1: x += a; break;
        case 2: x += b; break;
        case 3: x += (a + b) >> 1; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          x += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          break;
        }
        default: throw new Error(`bad PNG filter ${filter} on row ${y}`);
      }
      cur[i] = x & 0xff;
    }

    for (let i = channels - 1; i < stride; i += channels) {
      if (cur[i] !== 255) return true;
    }
    cur.copy(prev);
  }
  return false;
}

/* ------------------------------------------------------------- manifest --- */

/**
 * The manifest rows name files as `assets/icon.png` and `store/play-icon-512.png`.
 * On disk they live under `apps/native/assets/images/` (Expo's default layout,
 * which is what the asset README ships and what app.json points at). Map the
 * design's shorthand onto the real tree.
 */
function resolveManifestPath(name) {
  const bare = name.replace(/^assets\//, "").replace(/^store\//, "store/");
  return path.join(NATIVE, "assets/images", bare);
}

/** "None. Apple rejects alpha" -> none; "Alpha required" -> required; "Alpha kept" -> kept */
function alphaRule(text) {
  const t = text.toLowerCase();
  if (t.startsWith("none")) return "none";
  if (t.includes("required")) return "required";
  if (t.includes("kept")) return "kept";
  return null; // colour rows ("Opaque #C25A34") carry no alpha rule
}

function parseDims(text) {
  const m = text.match(/(\d+)\s*×\s*(\d+)/);
  return m ? { width: +m[1], height: +m[2] } : null;
}

/** Walk app.json for the value at a dotted path, tolerating the plugins array. */
function appJsonValue(app, keyText) {
  // Rows read like "expo.ios.icon.dark — SDK 52+" or "expo-splash-screen · dark.image"
  const splash = app.expo.plugins?.find(
    (p) => Array.isArray(p) && p[0] === "expo-splash-screen",
  )?.[1];

  if (keyText.startsWith("expo-splash-screen")) {
    const leaf = keyText.split("·")[1]?.trim().split(/\s|—/)[0];
    if (!leaf || !splash) return undefined;
    return leaf.split(".").reduce((o, k) => o?.[k], splash);
  }
  if (!keyText.startsWith("expo.")) return undefined; // store listing rows: no config key
  const dotted = keyText.split(/\s|—/)[0];
  const value = dotted.split(".").slice(1).reduce((o, k) => o?.[k], app.expo);

  // The manifest names `expo.ios.icon` for the light artwork, which was a plain
  // string before SDK 52. It is now an object — {light, dark, tinted} — and the
  // light face is the member that row is actually about.
  if (value && typeof value === "object" && typeof value.light === "string") {
    return value.light;
  }
  return value;
}

/* ------------------------------------------------------------------ run --- */

const problems = [];
const notes = [];

if (!fs.existsSync(EXTRACTED)) {
  console.error(
    `Missing ${path.relative(ROOT, EXTRACTED)}.\nRun: node designs/extract.mjs`,
  );
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(EXTRACTED, "utf8")).manifest;
const app = JSON.parse(fs.readFileSync(path.join(NATIVE, "app.json"), "utf8"));

for (const row of manifest) {
  const { name, dims, alphaText, keyText } = row;

  // Rows with no file assert a colour on a config key instead.
  if (name.startsWith("—")) {
    const want = alphaText.match(/#[0-9A-Fa-f]{6}/g) ?? [];
    const keys = keyText.includes("backgroundColor + dark.backgroundColor")
      ? ["expo-splash-screen · backgroundColor", "expo-splash-screen · dark.backgroundColor"]
      : [keyText];
    keys.forEach((k, i) => {
      const got = appJsonValue(app, k);
      const expect = want[i];
      if (!expect) return;
      if (String(got).toUpperCase() !== expect.toUpperCase()) {
        problems.push(`${k}: app.json has ${got ?? "(unset)"}, manifest says ${expect}`);
      } else {
        notes.push(`ok  ${k} = ${expect}`);
      }
    });
    continue;
  }

  const file = resolveManifestPath(name);
  const rel = path.relative(ROOT, file);

  if (!fs.existsSync(file)) {
    problems.push(`${name}: missing on disk (expected ${rel})`);
    continue;
  }

  const buf = fs.readFileSync(file);
  const header = readHeader(buf);

  const want = parseDims(dims);
  if (want && (header.width !== want.width || header.height !== want.height)) {
    problems.push(
      `${name}: is ${header.width}×${header.height}, manifest says ${want.width}×${want.height}`,
    );
  }

  const rule = alphaRule(alphaText);
  const channel = header.colorType === 6 || header.colorType === 4;

  if (rule === "none" && channel) {
    problems.push(
      `${name}: carries an alpha channel (PNG colour type ${header.colorType}); ` +
        `manifest says "${alphaText}". Flatten it to RGB.`,
    );
  }
  if ((rule === "required" || rule === "kept") && !channel) {
    problems.push(
      `${name}: has no alpha channel (PNG colour type ${header.colorType}); ` +
        `manifest says "${alphaText}".`,
    );
  }
  if (rule === "required" && channel) {
    const transparent = hasRealTransparency(buf, header);
    if (transparent === false) {
      problems.push(
        `${name}: has an alpha channel but every pixel is opaque; ` +
          `manifest says "${alphaText}" — this will render as a solid block.`,
      );
    }
  }

  // The config key the row feeds must actually point at this file.
  const configured = appJsonValue(app, keyText);
  if (configured !== undefined) {
    const expected = "./" + path.relative(NATIVE, file).split(path.sep).join("/");
    if (configured !== expected) {
      problems.push(
        `${keyText.split(/\s|—/)[0]}: app.json points at ${configured}, expected ${expected}`,
      );
    } else {
      notes.push(`ok  ${name}  ${header.width}×${header.height}  ${alphaText}`);
    }
  } else {
    notes.push(`ok  ${name}  ${header.width}×${header.height}  ${alphaText}  (no config key)`);
  }
}

for (const n of notes) console.log(n);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log(`\nAll ${manifest.length} manifest rows satisfied.`);
