/**
 * Elevation — the single most load-bearing thing in this design system.
 *
 * WordQuilt has ONE elevation language: a hard, un-blurred offset edge below
 * the element, in the ink colour, with no spread and no opacity fade. It reads
 * as material thickness — a stitched patch lying on cloth. There is not one
 * blurred shadow anywhere in the seven design files; a census of every
 * `boxShadow` in `designs/extracted` returns only:
 *
 *   0 3px 0 <edge>   0 4px 0 <edge>   0 5px 0 <edge>   0 6px 0 <edge>
 *
 * plus `0 0 0 1px` hairlines that belong to the design-file device frames, not
 * to the app. Introducing a soft shadow anywhere breaks the whole surface.
 *
 * The edge colour is NOT `ink`. It is `shade` for anything on the sheet, and
 * `fieldEdge` for anything on the terracotta field. In dark mode those diverge
 * sharply — see color.ts.
 */

/** Offset in px. The name is the role, the number is the design's value. */
export const elevation = {
  /** Chips, word slots, the price pill, the round ink button. */
  chip: 3,
  /** Letter tiles and the footer pills. */
  tile: 4,
  /** Cards and the primary button — the tallest thing that lifts. */
  card: 5,
  /** Reserved: used by full-bleed sheets in the design chrome and website. */
  sheet: 6,
} as const;

export type ElevationName = keyof typeof elevation;

/**
 * Build the CSS box-shadow string. React Native 0.76+ accepts `boxShadow` as a
 * style prop and uniwind passes the string straight through (it only appends
 * `px` to bare numbers), so the same string works on native and web.
 */
export const offsetEdge = (level: ElevationName, color: string): string =>
  `0 ${elevation[level]}px 0 ${color}`;

/**
 * Every element that lifts also carries a 2px border in the same edge colour.
 * The border and the offset are one gesture; an offset without its border
 * reads as a drop shadow and loses the material.
 */
export const borderWidth = 2;

/**
 * The dashed thread drawn along a traced word (Puzzle design, `paths[].style`).
 * Not elevation, but it shares the "drawn with a real tool" language.
 */
export const thread = {
  width: 5,
  /** SVG stroke-dasharray. */
  dash: [9, 8] as const,
  cap: "round",
  join: "round",
} as const;
