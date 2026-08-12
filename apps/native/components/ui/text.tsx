import { cn } from "heroui-native";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

/**
 * Typography by ROLE, never by size.
 *
 * Every string in the app picks a role — `pageTitle`, `body`, `meta` — and the
 * role carries its family, size, line-height and tracking together, because in
 * this design those always travel together. `<Text style={{fontSize: 15}}>` is
 * always a bug: it will pick up the system face and lose the tracking.
 *
 * Roles set type only, NOT colour. Colour depends on which ground the text sits
 * on — the same `body` role is `text-ink` on the sheet and `text-field-ink` on
 * the terracotta band — so the caller states the ground. Defaults below are the
 * common case; override with a `text-*` class where the ground differs.
 *
 * Class strings are written out in full rather than composed, because uniwind
 * extracts class names statically at build time — a template-built className
 * produces no styles at all.
 */
const ROLE = {
  /** The theme phrase on the Reveal screen. Sits on the field. */
  themeReveal: "font-display-italic text-theme-reveal text-field-ink text-center",
  /** Screen title on the field. */
  pageTitle: "font-display-italic text-page-title text-field-ink",
  /** The oblique hint shown during play. Sits on the field. */
  oblique: "font-display-italic text-oblique text-field-ink text-center",

  /** A letter on the puzzle grid. Colour is set per tile state. */
  letter: "font-ui-extrabold text-letter",

  /** Primary button label on Puzzle and Reveal. */
  buttonLg: "font-ui-black text-button-lg text-on-accent",
  /** Primary button label elsewhere. */
  button: "font-ui-black text-button text-on-accent",

  /** List row titles and hint counts. */
  listTitle: "font-ui-extrabold text-list-title text-ink",

  /** Body copy on the sheet. */
  body: "font-ui-semibold text-body text-ink",
  /** Body copy on the terracotta field. */
  bodyOnField: "font-ui-semibold text-body text-field-ink",
  /** The uppercase breadcrumb on the field. */
  crumb: "font-ui-extrabold text-crumb uppercase text-field-ink",
  /** Hint feedback in the reserved band under the grid. */
  hintBand: "font-ui-extrabold text-hint-band text-center",

  /** Secondary meta under a list title. */
  meta: "font-ui-semibold text-meta text-muted",
  /** Header chip label. Sits on the field. */
  chip: "font-ui-extrabold text-chip text-field-ink",
  /** A found word in its slot. */
  wordChip: "font-ui-black text-word-chip",

  /** Uppercase label introducing a group. Also the in-app "kicker". */
  sectionLabel: "font-ui-black text-section-label uppercase text-muted",
} as const;

export type TextRole = keyof typeof ROLE;

/**
 * Note the prop is `variant`, not `role`.
 *
 * React Native's own TextProps already has a `role` — the ARIA role used by
 * screen readers. Declaring ours on top of it narrowed the union to the empty
 * intersection and made every call site a type error. Since WordQuilt has real
 * accessibility work ahead (VoiceOver traversal of the grid is a designed
 * screen), RN's `role` stays available and ours got renamed.
 */
export interface TextProps extends RNTextProps {
  variant?: TextRole;
  className?: string;
}

export function Text({ variant = "body", className, ...props }: TextProps) {
  return <RNText className={cn(ROLE[variant], className)} {...props} />;
}

export { ROLE as textRoleClasses };
