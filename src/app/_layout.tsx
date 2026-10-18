import "@/global.css";
import "@azure/core-asynciterator-polyfill";

import { PowerSyncContext } from "@powersync/react";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Stack,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";

import { powersync } from "@/powersync/system";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "PublicSans-Regular": require("../../assets/fonts/PublicSans-Regular.otf"),
    "PublicSans-Medium": require("../../assets/fonts/PublicSans-Medium.otf"),
    "PublicSans-SemiBold": require("../../assets/fonts/PublicSans-SemiBold.otf"),
    "PublicSans-Bold": require("../../assets/fonts/PublicSans-Bold.otf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { scheme, colors } = useTheme();

  const navigationTheme = useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        border: colors.border,
        card: colors.background,
        primary: colors.mint,
        text: colors.text,
      },
    };
  }, [scheme, colors]);

  return (
    <PowerSyncContext.Provider value={powersync}>
      <NavigationThemeProvider value={navigationTheme}>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerShown: false,
          }}
        >
          <Stack.Screen name="auth" options={{ animation: "ios_from_right" }} />
        </Stack>
      </NavigationThemeProvider>
    </PowerSyncContext.Provider>
  );
}
