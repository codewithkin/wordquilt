/**
 * Typography.
 *
 * TWO faces, each with a fixed job:
 *   Newsreader (italic)  every title, oblique hint and theme reveal. The voice.
 *   Nunito               all UI, body, labels, letters on the grid. The workhorse.
 *
 * IBM Plex Sans appears in the design files as caption/monospace chrome for the
 * design canvas itself. It is NOT part of the app and is deliberately absent here.
 *
 * ── The trap ────────────────────────────────────────────────────────────────
 * React Native does NOT synthesise font weights for custom families. Setting
 * `fontFamily: "Nunito"` with `fontWeight: "800"` silently renders regular
 * Nunito on Android and a faked bold on iOS — it looks almost right, which is
 * why it survives review. Each weight must be loaded and named as its OWN
 * family. So there is no `fontWeight` in these tokens at all: the family IS the
 * weight. Anything that reaches for `fontWeight` is a bug.
 */

/** Family names exactly as @expo-google-fonts exports them. */
export const fontFamily = {
  /** Newsreader 500 italic — page titles, oblique hints, the theme reveal. */
  displayItalic: "Newsreader_500Medium_Italic",
  /** Newsreader 600 italic — the heaviest display cut, used sparingly. */
  displayItalicStrong: "Newsreader_600SemiBold_Italic",

  uiMedium: "Nunito_500Medium",
  /** Body copy and secondary meta. */
  uiSemibold: "Nunito_600SemiBold",
  uiBold: "Nunito_700Bold",
  /** The default UI weight in this design — list titles, chips, letters. */
  uiExtrabold: "Nunito_800ExtraBold",
  /** Buttons and uppercase labels. The loudest cut. */
  uiBlack: "Nunito_900Black",
} as const;

export type FontFamilyName = keyof typeof fontFamily;

export interface TypeRole {
  family: (typeof fontFamily)[FontFamilyName];
  size: number;
  /** Unitless multiplier, as the design states it. */
  lineHeight?: number;
  /** In em, as the design states it. Convert at the call site if needed. */
  letterSpacing?: number;
  uppercase?: boolean;
}

/**
 * Named roles, not a size ramp. A role carries its family, size and spacing
 * together because in this design they always travel together — a 15px Nunito
 * 600 at 1.5 is "body" everywhere it appears, and a 15px Nunito 800 uppercase
 * at 0.1em is always the breadcrumb.
 */
export const typeRole = {
  /** The theme phrase on the Reveal screen. The largest type in the app. */
  themeReveal: { family: fontFamily.displayItalic, size: 42, lineHeight: 1.14 },
  /** Screen titles on the field. */
  pageTitle: { family: fontFamily.displayItalic, size: 36, lineHeight: 1.06 },
  /** The oblique hint shown during play ("Something's brewing"). */
  oblique: { family: fontFamily.displayItalic, size: 31, lineHeight: 1.18 },

  /** A letter on the puzzle grid. */
  letter: { family: fontFamily.uiExtrabold, size: 21, letterSpacing: 0.01 },

  /** Primary button on Puzzle and Reveal. */
  buttonLg: { family: fontFamily.uiBlack, size: 20 },
  /** Primary button everywhere else. */
  button: { family: fontFamily.uiBlack, size: 19 },

  /** List row titles, hint counts. */
  listTitle: { family: fontFamily.uiExtrabold, size: 17 },

  /** Body copy and blurbs. */
  body: { family: fontFamily.uiSemibold, size: 15, lineHeight: 1.5 },
  /** The uppercase breadcrumb on the field. */
  crumb: {
    family: fontFamily.uiExtrabold,
    size: 15,
    letterSpacing: 0.1,
    uppercase: true,
  },

  /**
   * Hint feedback in the reserved band under the puzzle grid. Centred, and the
   * band holds its 32px height whether or not there is anything in it, so the
   * grid never moves (constraint 7).
   */
  hintBand: { family: fontFamily.uiExtrabold, size: 15 },

  /** Secondary meta under a list title. */
  meta: { family: fontFamily.uiSemibold, size: 14, lineHeight: 1.4 },
  /** Header chips. */
  chip: { family: fontFamily.uiExtrabold, size: 14 },
  /** A found word in its slot. */
  wordChip: { family: fontFamily.uiBlack, size: 14, letterSpacing: 0.08 },

  /**
   * The uppercase label introducing a group — "TODAY", "YOUR PACKS".
   *
   * This is also what the design calls a kicker in-app (`dailyKicker`,
   * `offerKicker`): same 12px / 900 / 0.16em, differing only in colour, which
   * is a separate axis. There is a distinct 13px / 0.18em kicker in the design
   * files but it appears ONLY in the website and the design-canvas chrome,
   * neither of which is in launch scope — so it is deliberately absent here.
   * Its absence also keeps `text-kicker` from colliding with the kicker colour.
   */
  sectionLabel: {
    family: fontFamily.uiBlack,
    size: 12,
    letterSpacing: 0.16,
    uppercase: true,
  },
} as const satisfies Record<string, TypeRole>;

export type TypeRoleName = keyof typeof typeRole;

/**
 * The smallest body copy the design permits, in px. From the design brief:
 * never below 15px for body copy. Labels and chips may go smaller because they
 * are short, uppercase and heavily tracked.
 */
export const minBodySize = 15;
