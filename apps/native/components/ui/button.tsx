import { elevation } from "@wordquilt/tokens";
import { cn } from "heroui-native";
import { MotiView } from "moti";
import { useState } from "react";
import { Pressable, type PressableProps } from "react-native";

import { useMotion, duration } from "@/lib/motion";

import { Text } from "./text";

/**
 * The primary action.
 *
 * One per screen. The accent is the only colour allowed to shout, and it shouts
 * on exactly the single action the player can take — so a screen with two
 * accent buttons is a design bug, not a layout choice.
 *
 * Two sizes, both straight from the designs:
 *   default  h56, radius 18, padding 0 28, 19px  — Shelf, Store, Settings
 *   lg       h64, radius 20, padding 0 36, 20px  — Puzzle and Reveal
 *
 * ── The press gesture ───────────────────────────────────────────────────────
 * The control sits DOWN onto its own offset edge — it travels by exactly its
 * edge depth (5px), so at full press the edge is gone and the button is flat on
 * the page. That is the same material gesture as the elevation itself. An
 * opacity fade instead reads as a web button and loses the material.
 *
 * The shadow shrinks in step with the travel, otherwise the button appears to
 * slide down the page rather than compress into it.
 */

export interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  size?: "default" | "lg";
  className?: string;
}

export function Button({
  label,
  size = "default",
  className,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const motion = useMotion();
  const depth = elevation.card;

  return (
    <MotiView
      animate={{
        translateY: pressed && !disabled ? depth : 0,
        opacity: disabled ? 0.5 : 1,
      }}
      transition={motion.timing(duration.press)}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPressIn={(e) => {
          setPressed(true);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          setPressed(false);
          onPressOut?.(e);
        }}
        // The shadow collapses as the button travels, so it compresses into the
        // page instead of sliding down it.
        style={pressed && !disabled ? { boxShadow: "0 0 0 transparent" } : undefined}
        className={cn(
          size === "lg" ? "wq-button-lg" : "wq-button",
          "flex-row items-center justify-center",
          className,
        )}
        {...props}
      >
        <Text variant={size === "lg" ? "buttonLg" : "button"}>{label}</Text>
      </Pressable>
    </MotiView>
  );
}

/**
 * A circular icon button, 46×46.
 *
 * Two grounds, and they are NOT interchangeable:
 *   field    translucent fill, cream hairline, NO lift — it sits in the band
 *   sheet    solid tile, ink border, 3px offset edge — it lifts off the sheet
 *
 * Using the field variant on the sheet gives you an invisible button.
 *
 * The field variant has no edge to sit down onto, so it dims on press instead
 * of travelling — the only place in the app where opacity is the press
 * feedback, because there is no material to compress.
 */
export interface RoundButtonProps extends PressableProps {
  ground?: "field" | "sheet";
  className?: string;
}

export function RoundButton({
  ground = "field",
  className,
  children,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: RoundButtonProps) {
  const [pressed, setPressed] = useState(false);
  const motion = useMotion();
  const onSheet = ground === "sheet";

  return (
    <MotiView
      animate={{
        translateY: onSheet && pressed && !disabled ? elevation.chip : 0,
        opacity: disabled ? 0.5 : !onSheet && pressed ? 0.7 : 1,
      }}
      transition={motion.timing(duration.press)}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPressIn={(e) => {
          setPressed(true);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          setPressed(false);
          onPressOut?.(e);
        }}
        style={
          onSheet && pressed && !disabled ? { boxShadow: "0 0 0 transparent" } : undefined
        }
        className={cn(
          onSheet ? "wq-round" : "wq-round-on-field",
          "items-center justify-center",
          className,
        )}
        {...props}
      >
        {children}
      </Pressable>
    </MotiView>
  );
}
