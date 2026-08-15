import * as SecureStore from "expo-secure-store";

import { defaultSettings, type Settings } from "./settings";

/**
 * Persistence for settings. Split from `settings.ts` so the rules there stay
 * free of native imports and can be tested by plain `node --test`.
 */

const KEY = "wq.settings.v1";

export const settingsStore = {
  async load(): Promise<Settings> {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      if (!raw) return defaultSettings;
      // Merged over the defaults so a setting added later is never undefined
      // for an existing player.
      return { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) };
    } catch {
      return defaultSettings;
    }
  },

  async save(settings: Settings): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEY, JSON.stringify(settings));
    } catch {
      // Never interrupt a player over a storage failure. The worst case is a
      // toggle that does not survive a relaunch.
    }
  },
};
