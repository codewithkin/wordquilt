import "@/global.css";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppThemeProvider } from "@/contexts/app-theme-context";
import { appFonts } from "@/lib/fonts";

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

// Hold the terracotta splash until the faces are in memory. Without this the
// first frame renders in the system font and visibly re-flows a moment later —
// and this design leans hard enough on Newsreader and Nunito that the swap
// reads as a broken app rather than a font loading.
SplashScreen.preventAutoHideAsync();

function StackLayout() {
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ title: "Modal", presentation: "modal" }} />
    </Stack>
  );
}

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts(appFonts);

  useEffect(() => {
    // Hide on error too. A missing face is a visual bug, not a reason to leave
    // the player staring at a splash screen forever.
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppThemeProvider>
          <HeroUINativeProvider>
            <StackLayout />
          </HeroUINativeProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
