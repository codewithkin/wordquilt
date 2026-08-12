import { fieldHeight as FIELD, screen as S } from "@wordquilt/tokens";
import { cn } from "heroui-native";
import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Seam } from "./seam";

/**
 * The scaffold every screen sits in.
 *
 * All four screen design files draw exactly this, so a screen that does not sit
 * inside it is wrong:
 *
 *   0    -- status bar zone, 54px
 *   54   -- content column, 756px, padding 0 26px
 *   810  -- home indicator zone, 34px
 *   844
 *
 * ── Safe areas ──────────────────────────────────────────────────────────────
 * The design's 54px status zone is a drawn approximation of a notched iPhone.
 * Real devices vary, so the top inset is taken from the OS and the design's 54
 * is used as a FLOOR — that keeps the header off the notch on tall phones
 * without collapsing the band on short ones. Same at the bottom.
 *
 * ── Grounds ─────────────────────────────────────────────────────────────────
 * The page background is always the sheet. The field is a band drawn on top of
 * it, and the seam curves the sheet back over the field's lower edge. Screens
 * with `field="full"` (Reveal, Proposition) have no seam at all — the field IS
 * the screen.
 */

export interface ScreenProps {
  /**
   * Height of the terracotta band. Per-screen in the design, not a fixed pair —
   * see `fieldHeight` in @wordquilt/tokens. `"full"` makes the field the whole
   * screen and removes the seam.
   */
  field?: number | "full";
  /** Rendered inside the field, above the seam. Header, title, blurb. */
  header?: ReactNode;
  /** Rendered in the content column below the seam. */
  children?: ReactNode;
  /** Pinned to the bottom of the content column, above the home indicator. */
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Screen({
  field = FIELD.standard,
  header,
  children,
  footer,
  className,
  contentClassName,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const isFull = field === "full";

  // The design's zones are floors, not absolutes — see above.
  const topInset = Math.max(insets.top, S.statusBarHeight);
  const bottomInset = Math.max(insets.bottom, S.homeIndicatorZone);

  // The drawn field height already includes the design's 54px status zone, so
  // on a device with a deeper inset the band grows by the difference rather
  // than pushing its content down into the seam.
  const fieldPx = isFull ? 0 : (field as number) + (topInset - S.statusBarHeight);

  return (
    <View className={cn("flex-1", isFull ? "bg-field" : "bg-sheet", className)}>
      {!isFull && (
        <View
          className="absolute left-0 right-0 top-0 bg-field"
          style={{ height: fieldPx }}
        />
      )}

      <View style={{ paddingTop: topInset }} className="flex-1">
        {header && (
          <View className="px-[26px]" style={{ zIndex: 2 }}>
            {header}
          </View>
        )}

        {!isFull && <Seam fieldHeight={fieldPx} />}

        <View
          className={cn("flex-1 px-[26px]", contentClassName)}
          style={{ zIndex: 1 }}
        >
          {children}
        </View>

        {footer && (
          <View className="px-[26px]" style={{ paddingBottom: bottomInset, zIndex: 2 }}>
            {footer}
          </View>
        )}

        {!footer && <View style={{ height: bottomInset }} />}
      </View>
    </View>
  );
}
