/**
 * Corner radii, named by the thing they belong to rather than by a t-shirt
 * size. The design does not use a geometric radius scale — a letter tile is
 * 15px and a card is 22px because each was drawn at that size, and rounding
 * them onto a shared ramp visibly changes both.
 *
 * Values from `designs/extracted` (`borderRadius` census).
 */
export const radius = {
  /** A cell in the quilt-patch motif — nearly square, just off a hard corner. */
  patch: 1,
  /** The battery glyph and other tiny chrome. */
  xs: 3,
  /** Small inline swatches. */
  sm: 4,
  /** A letter tile on the puzzle grid. The signature radius of the product. */
  tile: 15,
  /** Footer pills and quiet secondary controls. */
  control: 16,
  /** The primary button. */
  button: 18,
  /** The primary button on the Puzzle and Reveal screens, which runs larger. */
  buttonLg: 20,
  /** Cards, pack rows, list containers. */
  card: 22,
  /** The device frame. Only used by full-screen mock surfaces. */
  frame: 44,
  /** Chips, word slots, round buttons — anything fully round-ended. */
  pill: 999,
} as const;

export type RadiusName = keyof typeof radius;

/**
 * Control heights. Nothing interactive is shorter than 44px — that floor is a
 * hard rule from the design brief, not a suggestion, and the audit checks it.
 */
export const controlHeight = {
  /** Header chips and word slots. Non-interactive, so 36 is allowed. */
  chip: 36,
  /** A letter tile, and the minimum touch target anywhere in the app. */
  tile: 44,
  /** Circular header buttons (back, hint, settings). */
  round: 46,
  /** Footer pills. */
  pill: 50,
  /** The primary button. */
  button: 56,
  /** The primary button on Puzzle and Reveal. */
  buttonLg: 64,
  /** A row in a list — minHeight, so it grows with a two-line subtitle. */
  listRow: 66,
} as const;

/** The smallest touch target the design permits, anywhere, in px. */
export const minTouchTarget = 44;
