/**
 * @wordquilt/generator — puzzle generation.
 *
 * The order is fixed: select a word set hitting the EXACT letter total, then
 * pack it along snaking paths, then fill whatever cells are left with the theme
 * phrase in reading order. Packing first and hoping the leftovers come out
 * right does not work — the arithmetic is the binding constraint.
 *
 * Everything is seeded and deterministic. `Math.random()` in this package is a
 * bug: a puzzle must regenerate identically on every device, or on-device
 * progress and the never-repeat rule both stop working.
 */

export * from "./generate.ts";
export * from "./pack.ts";
export * from "./rng.ts";
export * from "./select.ts";
export * from "./titles.ts";
export * from "./types.ts";
