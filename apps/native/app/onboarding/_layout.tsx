import { Stack } from "expo-router";

/**
 * Onboarding: nine screens, one direction.
 *
 * No header, no back control, and no skip — because nothing here is skippable.
 * The player is never asked for anything they have not already been given a
 * reason to give, so there is nothing to escape from.
 *
 * `gestureEnabled: false` matters as much as the missing header: an iOS
 * edge-swipe back would take someone from the Proposition to the Reveal they
 * have already seen, which reads as a bug.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: "fade",
        contentStyle: { backgroundColor: "transparent" },
      }}
    />
  );
}
