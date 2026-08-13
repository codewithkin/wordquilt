import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "react-native-reanimated";

import {
  cycleMotion,
  defaultSettings,
  motionLabel,
  notificationAction,
  shouldReduceMotion,
  type Settings,
} from "@/lib/settings";
import { settingsStore } from "@/lib/settings-store";
import { cancelReminders, scheduleDailyReminder } from "@/lib/notifications";

/**
 * Settings, loaded once and written on every change.
 *
 * Every toggle here does something. A switch that renders its state but changes
 * nothing is worse than no switch at all — it tells the player they are in
 * control when they are not.
 */

interface SettingsValue {
  settings: Settings;
  /** Reduce motion, resolved against the OS setting. */
  reduceMotion: boolean;
  /** What the reduce-motion row shows on the right. */
  motionRowLabel: string;
  toggleSound: () => void;
  toggleHaptics: () => void;
  cycleReduceMotion: () => void;
  toggleNotifications: () => void;
  setRhythm: (rhythm: string) => void;
}

const SettingsContext = createContext<SettingsValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const systemReduced = useReducedMotion();

  useEffect(() => {
    settingsStore.load().then(setSettings);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      void settingsStore.save(next);

      // Notifications are the one setting with an effect outside the app, so
      // the OS schedule is reconciled here rather than left to the screen.
      if ("notifications" in patch || "rhythm" in patch) {
        const action = notificationAction(next);
        if (action.action === "schedule") void scheduleDailyReminder(action.rhythm);
        else void cancelReminders();
      }

      return next;
    });
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({
      settings,
      reduceMotion: shouldReduceMotion(settings, systemReduced),
      motionRowLabel: motionLabel(settings, systemReduced),
      toggleSound: () => update({ sound: !settings.sound }),
      toggleHaptics: () => update({ haptics: !settings.haptics }),
      cycleReduceMotion: () => update({ reduceMotion: cycleMotion(settings.reduceMotion) }),
      toggleNotifications: () => update({ notifications: !settings.notifications }),
      setRhythm: (rhythm: string) => update({ rhythm }),
    }),
    [settings, systemReduced, update],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
