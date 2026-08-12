/**
 * Spacing and screen scaffolding.
 *
 * The design lays everything out with flex + `gap` — never margins between
 * siblings, never whitespace as spacing. Where the design does use a fixed
 * vertical gap it inserts an explicit spacer div of that height, so those are
 * gaps too, not margins.
 *
 * Every value here was read from the design templates. Nothing is rounded onto
 * a scale: the design does not use one, and snapping 9px word-chip gaps to 8
 * visibly re-flows the chip rows.
 */

/** Gap values, in px. */
export const space = {
  hair: 1,
  xxs: 3,
  xs: 4,
  sm: 6,
  md: 8,
  /** Between wrapped word slots on the Puzzle screen. */
  chipGap: 9,
  lg: 10,
  /** Between the Hint button and its label column. Also the list-row gap. */
  row: 14,
  xl: 16,
  xxl: 18,
  xxxl: 20,
  /** Between the word slots and the top of the grid. */
  gridTop: 44,
} as const;

/** Paddings that recur as a pair, kept whole so they cannot drift apart. */
export const padding = {
  /** A list row: 16 vertical, 18 horizontal. */
  listRow: { vertical: 16, horizontal: 18 },
  /** A header chip or word slot. */
  chip: { vertical: 0, horizontal: 14 },
  /** A found-word chip, which runs slightly wider. */
  wordChip: { vertical: 0, horizontal: 15 },
  /** The primary button. */
  button: { vertical: 0, horizontal: 28 },
  /** The primary button on Puzzle and Reveal. */
  buttonLg: { vertical: 0, horizontal: 36 },
  /** A price pill on a store row. */
  pricePill: { vertical: 10, horizontal: 16 },
} as const;

/**
 * The phone frame every screen is drawn in. All four screen design files use
 * exactly this scaffold, so a screen that does not sit inside it is wrong.
 *
 *   0 ──────────────── status bar, 54px, padding 0 30px 8px
 *   54 ─────────────── content column, 756px, padding 0 26px
 *   810 ────────────── home indicator zone, 34px
 *   844
 */
export const screen = {
  width: 390,
  height: 844,
  statusBarHeight: 54,
  statusBarPadding: { horizontal: 30, bottom: 8 },
  /** Height of the content column between status bar and home indicator. */
  contentHeight: 756,
  /** Horizontal inset from the screen edge to content. */
  contentInset: 26,
  homeIndicatorZone: 34,
} as const;

/**
 * The Puzzle screen reserves the space between the grid and the hint row and
 * leaves it EMPTY in the default state, so hint feedback appearing never moves
 * anything (constraint 7: zero interruption budget on the Puzzle screen).
 *
 * It is a fixed 32px gap followed by a flex spacer — the feedback renders into
 * that region. Treat 32 as the floor, not the whole reservation.
 */
export const reservedHintBandMin = 32;
