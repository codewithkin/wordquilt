import {
  Newsreader_500Medium_Italic,
  Newsreader_600SemiBold_Italic,
} from "@expo-google-fonts/newsreader";
import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";

/**
 * Every font face the app uses, keyed by the family name components reference.
 *
 * ── Why one entry per weight ────────────────────────────────────────────────
 * React Native does NOT synthesise weights for custom families. Loading a
 * single "Nunito" and asking for `fontWeight: 800` renders the regular cut on
 * Android and a faked, badly-spaced bold on iOS — it looks close enough to
 * survive review and wrong on device. So each weight is a separate loaded
 * face whose KEY IS ITS FAMILY NAME, and nothing in the app ever sets
 * `fontWeight`.
 *
 * The keys here must match `fontFamily` in @wordquilt/tokens exactly. The
 * token parity test asserts that, because a typo here fails silently: RN falls
 * back to the system face rather than erroring.
 *
 * Only the cuts the design actually uses are loaded — each face is bundled
 * into the app, so loading the full families would cost real megabytes for
 * weights no screen references.
 */
export const appFonts = {
  // Display — titles, oblique hints, the theme reveal. Italic only.
  Newsreader_500Medium_Italic,
  Newsreader_600SemiBold_Italic,

  // UI — everything else.
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} as const;
