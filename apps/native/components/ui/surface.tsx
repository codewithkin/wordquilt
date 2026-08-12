import { cn } from "heroui-native";
import { MotiView } from "moti";
import { View, type ViewProps } from "react-native";

import { duration, useMotion } from "@/lib/motion";

/**
 * The lifted surfaces: card, tile, pill.
 *
 * All three share one elevation language — a hard, un-blurred offset edge in
 * the ink colour, plus a 2px border in that same colour. The border and the
 * offset are ONE gesture: an offset without its border reads as a generic drop
 * shadow and the material disappears. That is why these are components rather
 * than a `shadow-card` class people remember to add.
 *
 * The `wq-*` utilities they use emit a plain `box-shadow` string. Tailwind's
 * own `shadow-*` utilities compile to a composed `var(--tw-inset-shadow), ...`
 * chain that React Native's shadow parser is not known to handle — so prefer
 * these components, and see D-004 before reaching for `shadow-*` directly.
 *
 * ── Entry motion ────────────────────────────────────────────────────────────
 * Cards lay down onto the page: a short rise and fade, no slide from offscreen
 * and no bounce. `delay` staggers a list so rows settle in sequence rather than
 * arriving as a block — pass `index * 45` or so.
 *
 * Motion here is material, never decorative. If it reads as "an app being
 * clever" it is wrong for this product.
 */

export interface SurfaceProps extends ViewProps {
  className?: string;
  /** Stagger, in ms, for rows in a list. */
  delay?: number;
  /** Opt out of the entry animation — for a card that is already on screen. */
  animate?: boolean;
}

/** A card, pack row, or list container sitting on the sheet. */
export function Card({
  className,
  delay = 0,
  animate = true,
  children,
  ...props
}: SurfaceProps) {
  const motion = useMotion();

  if (!animate) {
    return (
      <View className={cn("wq-card overflow-hidden", className)} {...props}>
        {children}
      </View>
    );
  }

  return (
    <MotiView
      className={cn("wq-card overflow-hidden", className)}
      from={{ opacity: 0, translateY: motion.reduced ? 0 : 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0 }}
      transition={{ ...motion.timing(duration.enter), delay: motion.reduced ? 0 : delay }}
      {...props}
    >
      {children}
    </MotiView>
  );
}

/** A quiet footer pill on the sheet. */
export function Pill({
  className,
  delay = 0,
  animate = true,
  children,
  ...props
}: SurfaceProps) {
  const motion = useMotion();

  if (!animate) {
    return (
      <View
        className={cn("wq-pill flex-row items-center justify-center", className)}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <MotiView
      className={cn("wq-pill flex-row items-center justify-center", className)}
      from={{ opacity: 0, translateY: motion.reduced ? 0 : 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0 }}
      transition={{ ...motion.timing(duration.enter), delay: motion.reduced ? 0 : delay }}
      {...props}
    >
      {children}
    </MotiView>
  );
}

/**
 * The hairline between rows in a list.
 *
 * The design draws separators at 2px in the `empty` colour, not the 1px
 * hairline the platform would give you — at 1px it disappears against the
 * cream sheet. Never animated; a moving separator is noise.
 */
export function Rule({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn("wq-rule", className)} {...props} />;
}
