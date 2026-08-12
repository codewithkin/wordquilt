/**
 * Colour tokens, read out of `designs/extracted/*.txt`.
 *
 * The names here are the DESIGN's names — field, sheet, tile, sewn, ink — not
 * generic background/foreground. That is deliberate: when you audit a built
 * screen against its design file you are comparing like with like, and a
 * `bg-field` in the code maps to a `t.field` in the design with nothing to
 * translate. Renaming these to a generic scale is how screens quietly drift.
 *
 * WordQuilt has THREE grounds, not one, and each carries its own ink and edge:
 *
 *   field   the terracotta band at the top of a screen   ink: fieldInk
 *   sheet   the cream page body below the seam           ink: ink / muted
 *   tile    cards and letter tiles sitting on the sheet  ink: ink
 *
 * Getting a control's ground wrong is invisible in code review and obvious on
 * device, so every component names the ground it expects.
 *
 * Source of truth: designs/extracted. Regenerate with `node designs/extract.mjs`
 * and grep the .txt files before changing anything here.
 */

export type ThemeName = "light" | "dark";

export interface ColorRamp {
  /** Terracotta band behind headers, and the whole Reveal screen. */
  field: string;
  /** Cream type on the field. The only ink legible over terracotta. */
  fieldInk: string;
  /** Hairlines and dashed outlines drawn ON the field. */
  fieldLine: string;
  /** Translucent fill for quiet controls sitting ON the field. */
  fieldFill: string;
  /**
   * The offset edge for controls sitting ON the field. In light mode this is
   * the same ink as everywhere else; in dark mode it is a warm scrim rather
   * than `shade`, because near-black against terracotta reads as a hole.
   */
  fieldEdge: string;

  /** The page body below the seam. */
  sheet: string;
  /** Primary type on sheet and tile. */
  ink: string;
  /** Secondary type. See `mutedStrong` for the accessible variant. */
  muted: string;
  /**
   * The Accessibility design file raises `muted` for its screens (D-005).
   * Kept as a separate token so the high-contrast setting can swap it without
   * touching the default, which is what the core screens actually specify.
   */
  mutedStrong: string;

  /** Cards and letter tiles. */
  tile: string;
  /** 2px border around tiles and cards. */
  line: string;
  /**
   * The hard-offset elevation colour. NOT the same as `ink` in dark mode —
   * dark uses a near-black so cards sit down into the page instead of glowing.
   */
  shade: string;

  /** A sewn quilt square, and a found letter tile. */
  sewn: string;
  /** Second sewn tone, alternated so a quilt does not read as one flat block. */
  sewnAlt: string;

  /** The one colour allowed to shout, on the single action of a screen. */
  accent: string;
  /** Type on top of `accent`. */
  onAccent: string;
  /** Uppercase eyebrow labels. */
  kicker: string;
  /** Warm tint behind quiet informational blocks. */
  wash: string;

  /** Hairline rules and separators between list rows. */
  empty: string;
  /** The dashed thread drawn along a traced word. */
  thread: string;
}

/**
 * Light and dark are separate designs, not inversions — every value was
 * re-picked. Note that `line` is solid ink in light and a translucent cream in
 * dark, and that `shade` moves AWAY from `ink` rather than tracking it.
 */
export const colors: Record<ThemeName, ColorRamp> = {
  light: {
    field: "#C25A34",
    fieldInk: "#FFF6E8",
    fieldLine: "rgba(255,246,232,0.62)",
    fieldFill: "rgba(255,246,232,0.16)",
    fieldEdge: "#241F19",

    sheet: "#FBF4E4",
    ink: "#241F19",
    muted: "#7A6E5C",
    mutedStrong: "#6A5F4E",

    tile: "#FFFDF6",
    line: "#241F19",
    shade: "#241F19",

    sewn: "#F0C982",
    sewnAlt: "#E7B563",

    accent: "#C25A34",
    onAccent: "#FFF6E8",
    kicker: "#9E4227",
    wash: "#F6DCCB",

    empty: "rgba(36,31,25,0.34)",
    thread: "rgba(36,31,25,0.30)",
  },
  dark: {
    field: "#8A3E27",
    fieldInk: "#FCEEDD",
    fieldLine: "rgba(252,238,221,0.55)",
    fieldFill: "rgba(252,238,221,0.12)",
    fieldEdge: "rgba(36,23,16,0.55)",

    sheet: "#1E1B16",
    ink: "#F4EDDF",
    muted: "#A99C89",
    mutedStrong: "#B0A390",

    tile: "#2C2721",
    line: "rgba(244,237,223,0.42)",
    shade: "#0E0C09",

    sewn: "#7A6038",
    sewnAlt: "#8E7141",

    accent: "#E39466",
    onAccent: "#241710",
    kicker: "#E39466",
    wash: "#4A2E22",

    empty: "rgba(244,237,223,0.30)",
    thread: "rgba(244,237,223,0.30)",
  },
};

/**
 * The four free fabric palettes offered in onboarding (Onboarding design,
 * `palettes[]`). Cosmetic only — a fabric choice never touches gameplay.
 */
export const fabricSwatches = {
  terracotta: "#C25A34",
  slate: "#96A3C9",
  sage: "#A9B78D",
  rose: "#C9A2B0",
} as const;

/** Full-screen dim behind sheets and overlays (Alternate States, `scrim`). */
export const scrim = "rgba(24,18,12,0.55)";

/**
 * Rules the palette must keep, asserted by the token test.
 *
 * These pin INTENT rather than values, so they survive a palette revision:
 * a redesign may move every hex and these should still hold.
 */
export const paletteRules = {
  /** Dark mode never uses pure black; light mode never uses pure white. */
  noPureBlackOrWhite: true,
  /**
   * There is no error/destructive colour anywhere in WordQuilt, in either
   * theme. The product never tells a player they got something wrong, so red
   * has no job to do — and a red token existing is how it eventually gets used.
   */
  noErrorColor: true,
  /** `muted` and `ink` must stay visibly distinct — they carry hierarchy. */
  mutedNeverCollapsesIntoInk: true,
} as const;
