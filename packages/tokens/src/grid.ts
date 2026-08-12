/**
 * Puzzle grid geometry, from the Puzzle & Reveal design (`G` and `build()`).
 *
 * The grid is absolutely positioned, not a flex layout: each cell is placed at
 * `left = col * PITCH + PAD`, `top = row * PITCH`, and every tile carries a
 * small rotation so the board reads as hand-sewn rather than printed. Laying it
 * out with flex + gap loses the rotation overlap and the tiles start clipping
 * each other, so the absolute placement is load-bearing.
 */

export const grid = {
  /** Distance between the top-left corners of adjacent cells. */
  pitch: 46,
  /** The drawn size of a cell. `pitch - cell` = 2px of breathing room. */
  cell: 44,
  /** Left inset of the whole board inside its box. */
  pad: 7,
  /** The SVG viewBox the thread paths are drawn in: `0 0 SIZE SIZE`. */
  svgSize: 320,
  /** Width of the box the board sits in, on a 390px-wide screen. */
  boxWidth: 334,
} as const;

/**
 * The per-tile rotation, in degrees. Deterministic from the cell's position so
 * a given puzzle always looks the same — this is texture, not animation, and a
 * board that reshuffles its tilt on every render reads as a rendering bug.
 *
 * From the design: `(((r * 7 + c) % 5) - 2) * 0.7`, giving -1.4°…+1.4°.
 * Note the literal 7 is the design's 7×7 board, not the row length — it is a
 * hash multiplier, so it stays 7 for every grid size from 6×6 to 9×9.
 */
export const tileTilt = (row: number, col: number): number =>
  (((row * 7 + col) % 5) - 2) * 0.7;

/** Centre point of a cell in SVG coordinates, for drawing the thread. */
export const cellCentre = (row: number, col: number) => ({
  x: col * grid.pitch + grid.cell / 2,
  y: row * grid.pitch + grid.cell / 2,
});

/** Height of the board box for a given number of rows. */
export const boardHeight = (rows: number): number =>
  rows * grid.pitch - (grid.pitch - grid.cell);

/**
 * The seam: the cream sheet does not meet the terracotta field in a straight
 * line — it curves up over it as a wide, shallow ellipse.
 *
 *   left: -8%   width: 116%   borderTopLeft/RightRadius: 50% 74px
 *
 * That is a two-axis (elliptical) border radius. React Native does NOT support
 * elliptical corner radii, so the seam CANNOT be built with borderRadius on a
 * View — it needs an SVG path or a masked shape. This is the single biggest
 * design-to-native gap in the product and is tracked as D-006.
 */
export const seam = {
  /** How far the sheet extends past each edge of the screen. */
  overhangPercent: 8,
  /** Vertical radius of the elliptical curve, in px. */
  curveHeight: 74,
  /**
   * Distance the sheet's top sits above the bottom of the field, in px.
   *
   * 40 in Core Screens, Alternate States and Onboarding — every field height
   * they draw (196, 214, 216, 306) puts the sheet exactly 40px up. The Puzzle &
   * Reveal file alone uses 48 (field 306, sheet top 258). We take 40 as the
   * rule and treat the Puzzle file's 48 as drift from it being the first screen
   * drawn — see D-007. Alternate States draws the same overlay screens at 40.
   */
  overlap: 40,
  /** Border along the top edge of the sheet. */
  borderWidth: 2,
} as const;

/** Where the sheet's top edge sits, given the screen's field height. */
export const seamTop = (fieldHeightPx: number): number =>
  fieldHeightPx - seam.overlap;

/**
 * Field (terracotta band) height is per-screen, not a fixed pair — the design
 * sizes the band to its content. These are the heights actually drawn.
 */
export const fieldHeight = {
  /** Notification-permission screens. */
  compact: 196,
  /** Rating prompt. */
  short: 214,
  /** Store, Dailies. */
  medium: 216,
  /** Shelf, Puzzle, Pack — the standard header band. */
  standard: 306,
  /** Reveal — the field is the whole screen, and there is no sheet. */
  full: 844,
} as const;
