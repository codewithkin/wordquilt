/**
 * @wordquilt/tokens — the shared value layer.
 *
 * ── Read this before you use it ─────────────────────────────────────────────
 * Tokens are a CONVENIENCE for values the designs share. They are NOT the
 * source of truth and they are allowed to be incomplete. The source of truth
 * for what a screen looks like is `designs/extracted/<Screen>.txt`.
 *
 * Build every screen from its design file, not from this package. If a value
 * you need is not here, read it out of the design and add it here — do not
 * substitute the nearest token that already exists. The precedence ladder is in
 * `systems/00-index.md`.
 *
 * Regenerate the extracted designs with `node designs/extract.mjs`.
 */

// Explicit .ts extensions: Node's native type stripping resolves ESM specifiers
// literally, so the token files can be imported by plain `node` in tests and
// scripts without a build step. Metro and tsc both accept them.
export * from "./color.ts";
export * from "./elevation.ts";
export * from "./grid.ts";
export * from "./radius.ts";
export * from "./space.ts";
export * from "./type.ts";
