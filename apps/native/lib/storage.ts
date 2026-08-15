import * as SecureStore from "expo-secure-store";

/**
 * On-device preferences.
 *
 * Constraint 2: no account, no login, no email capture. Everything a player has
 * lives on their phone and nowhere else. There is no sync, no user id, and
 * nothing here ever leaves the device.
 *
 * That has a consequence the player must be told about rather than discover:
 * uninstalling loses their quilt. Settings has to state it plainly — see the
 * open items in `progress/00-START-HERE.md`.
 *
 * SecureStore rather than a plain file because it is already a dependency and
 * handles the platform differences. None of this is actually secret.
 */

const KEYS = {
  onboardingComplete: "wq.onboarding.complete",
  themes: "wq.prefs.themes",
  fabric: "wq.prefs.fabric",
  rhythm: "wq.prefs.rhythm",
  reminders: "wq.prefs.reminders",
} as const;

async function read(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    // A read failure is not worth interrupting a player over — it degrades to
    // "no preference", which every caller already handles.
    return null;
  }
}

async function write(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Same: never surface a storage error mid-flow. The worst case is that
    // onboarding runs again, which is recoverable and quiet.
  }
}

export interface Preferences {
  /** Theme ids chosen at O5. Orders the Shelf; never restricts content. */
  themes: string[];
  /** Fabric id chosen at O6. Cosmetic only, zero gameplay effect. */
  fabric: string;
  /** Rhythm chosen at O8. Orders content, not just reminders. */
  rhythm: string | null;
  /** Whether the player said yes at O8. */
  reminders: boolean;
}

export const defaultPreferences: Preferences = {
  themes: [],
  fabric: "linen",
  rhythm: null,
  reminders: false,
};

export const storage = {
  /**
   * Written on ARRIVAL at the Shelf, not on leaving the last onboarding screen.
   * A crash before that point resumes onboarding rather than dropping the
   * player into an app they have not been introduced to.
   */
  async isOnboardingComplete(): Promise<boolean> {
    return (await read(KEYS.onboardingComplete)) === "1";
  },

  async completeOnboarding(): Promise<void> {
    await write(KEYS.onboardingComplete, "1");
  },

  async loadPreferences(): Promise<Preferences> {
    const [themes, fabric, rhythm, reminders] = await Promise.all([
      read(KEYS.themes),
      read(KEYS.fabric),
      read(KEYS.rhythm),
      read(KEYS.reminders),
    ]);
    return {
      themes: themes ? (JSON.parse(themes) as string[]) : defaultPreferences.themes,
      fabric: fabric ?? defaultPreferences.fabric,
      rhythm: rhythm ?? defaultPreferences.rhythm,
      reminders: reminders === "1",
    };
  },

  async savePreferences(prefs: Preferences): Promise<void> {
    await Promise.all([
      write(KEYS.themes, JSON.stringify(prefs.themes)),
      write(KEYS.fabric, prefs.fabric),
      write(KEYS.rhythm, prefs.rhythm ?? ""),
      write(KEYS.reminders, prefs.reminders ? "1" : "0"),
    ]);
  },
};
