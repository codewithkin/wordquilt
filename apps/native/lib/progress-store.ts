import * as SecureStore from "expo-secure-store";

import { emptyProgress, type Progress } from "./progress";

/**
 * Persistence for progress.
 *
 * Split from `progress.ts` so the rules there stay free of native imports and
 * can be tested by plain `node --test` — the hint refill and the "sets only
 * grow" guarantees are exactly the logic worth testing, and they should not
 * need a simulator to verify.
 */

const KEY = "wq.progress.v1";

export const progressStore = {
  async load(): Promise<Progress> {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      if (!raw) return emptyProgress;
      // Merged over the defaults so a field added in a later version does not
      // come back undefined for an existing player.
      return { ...emptyProgress, ...(JSON.parse(raw) as Partial<Progress>) };
    } catch {
      return emptyProgress;
    }
  },

  async save(progress: Progress): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEY, JSON.stringify(progress));
    } catch {
      // Never interrupt a player over a storage failure mid-puzzle. The square
      // they just sewed is still on screen; it is the next launch that loses
      // it, and there is nothing useful they could do about it now anyway.
    }
  },
};
