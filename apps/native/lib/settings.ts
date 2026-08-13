/**
 * Settings — the switches a player can actually change.
 *
 * PURE RULES ONLY, no native imports, so `node --test` can verify them.
 * Persistence lives in `settings-store.ts`.
 *
 * ── Reduce motion is three-state, not two ───────────────────────────────────
 * The Accessibility design says the app's own switch "only overrides" the OS
 * where the OS has an opinion. A plain on/off boolean cannot express that: it
 * would either ignore the system setting or make the app's switch meaningless.
 *
 * So the stored value is `system | on | off`, defaulting to `system`. Someone
 * who has turned reduce-motion on device-wide gets it here without touching
 * anything, and someone who wants it in this app only can still say so.
 *
 * The same shape would suit any future setting that layers over an OS one.
 */

export type MotionPreference = "system" | "on" | "off";

export interface Settings {
  /** Soft, and off in silent mode. */
  sound: boolean;
  /** A small tick when a word locks. */
  haptics: boolean;
  /** Reveals resolve in one step. Layers over the OS setting. */
  reduceMotion: MotionPreference;
  /** One reminder a day. Never about days missed. */
  notifications: boolean;
  /** Which of the four rhythms the reminder fires at. */
  rhythm: string | null;
}

export const defaultSettings: Settings = {
  sound: true,
  haptics: true,
  reduceMotion: "system",
  notifications: false,
  rhythm: null,
};

/**
 * Should motion be reduced right now?
 *
 * `system` defers to the OS. An explicit choice overrides it in both
 * directions — including a player who wants full motion in this app despite
 * having reduced it globally, which is a real preference and not an error.
 */
export function shouldReduceMotion(
  settings: Pick<Settings, "reduceMotion">,
  systemPrefersReduced: boolean,
): boolean {
  switch (settings.reduceMotion) {
    case "on":
      return true;
    case "off":
      return false;
    default:
      return systemPrefersReduced;
  }
}

/** What the Settings row shows on the right for reduce motion. */
export function motionLabel(
  settings: Pick<Settings, "reduceMotion">,
  systemPrefersReduced: boolean,
): string {
  if (settings.reduceMotion === "on") return "On";
  if (settings.reduceMotion === "off") return "Off";
  // Say which way the device is currently leaning, so "Follows your device"
  // is never ambiguous about what is actually happening.
  return systemPrefersReduced ? "Following device · on" : "Following device · off";
}

/** Tapping the row cycles system -> on -> off -> system. */
export function cycleMotion(current: MotionPreference): MotionPreference {
  return current === "system" ? "on" : current === "on" ? "off" : "system";
}

/**
 * Whether a haptic should actually fire.
 *
 * Checked at the call site rather than by muting the device, so turning
 * haptics off silences WordQuilt and nothing else.
 */
export const hapticsEnabled = (settings: Pick<Settings, "haptics">): boolean =>
  settings.haptics;

/**
 * Turning notifications off must also clear what is scheduled — a setting that
 * says "Off" while the OS still fires a reminder tomorrow is a broken promise,
 * and this product's whole position is that it does not nag.
 */
export function notificationAction(
  next: Pick<Settings, "notifications" | "rhythm">,
): { action: "schedule"; rhythm: string } | { action: "cancel" } {
  if (next.notifications && next.rhythm) {
    return { action: "schedule", rhythm: next.rhythm };
  }
  return { action: "cancel" };
}
