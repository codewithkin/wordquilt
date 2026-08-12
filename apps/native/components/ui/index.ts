/**
 * WordQuilt UI primitives.
 *
 * These cover the recipes that recur across screens. They are NOT a substitute
 * for reading the design file — build every screen from
 * `designs/extracted/<Screen>.txt`, and when a screen needs something these do
 * not cover, take the values from the design rather than bending the nearest
 * primitive into shape.
 */

export { Button, RoundButton, type ButtonProps, type RoundButtonProps } from "./button";
export { Chip, WordSlot, type ChipProps, type WordSlotProps } from "./chip";
export {
  LetterTile,
  threadTransition,
  type LetterTileProps,
  type LetterTileState,
} from "./letter-tile";
export { Card, Pill, Rule, type SurfaceProps } from "./surface";
export { Text, textRoleClasses, type TextProps, type TextRole } from "./text";
