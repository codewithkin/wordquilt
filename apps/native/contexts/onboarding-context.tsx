import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { defaultPreferences, storage, type Preferences } from "@/lib/storage";

/**
 * The choices a player makes during onboarding.
 *
 * Held in memory across the nine screens and written once, on arrival at the
 * Shelf. Onboarding has no back control and nothing is skippable, so there is
 * no partial-state to reconcile — either they finish and everything is written,
 * or they relaunch and start again.
 *
 * These are PREFERENCES, not entitlements. Theme choice orders the Shelf and
 * decides which free themes unlock first; it never restricts content. Fabric is
 * cosmetic with zero gameplay effect. Rhythm orders content whether or not the
 * player accepted notifications.
 */

interface OnboardingValue {
  prefs: Preferences;
  toggleTheme: (id: string) => void;
  setFabric: (id: string) => void;
  setRhythm: (id: string) => void;
  setReminders: (on: boolean) => void;
  /** Persist everything and mark onboarding done. Called on Shelf arrival. */
  finish: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences);

  const toggleTheme = useCallback((id: string) => {
    setPrefs((p) => ({
      ...p,
      themes: p.themes.includes(id)
        ? p.themes.filter((t) => t !== id)
        : [...p.themes, id],
    }));
  }, []);

  const setFabric = useCallback((id: string) => {
    setPrefs((p) => ({ ...p, fabric: id }));
  }, []);

  const setRhythm = useCallback((id: string) => {
    setPrefs((p) => ({ ...p, rhythm: id }));
  }, []);

  const setReminders = useCallback((on: boolean) => {
    setPrefs((p) => ({ ...p, reminders: on }));
  }, []);

  const finish = useCallback(async () => {
    await storage.savePreferences(prefs);
    await storage.completeOnboarding();
  }, [prefs]);

  const value = useMemo(
    () => ({ prefs, toggleTheme, setFabric, setRhythm, setReminders, finish }),
    [prefs, toggleTheme, setFabric, setRhythm, setReminders, finish],
  );

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
