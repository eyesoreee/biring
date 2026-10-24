import "@/global.css";
import "@azure/core-asynciterator-polyfill";

import { PowerSyncContext } from "@powersync/react";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Stack,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";

import { AuthProvider, useSession } from "@/lib/auth";
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
  if (!loaded && !error) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { scheme, colors } = useTheme();
  const segments = useSegments();
  const session = useSession();

  const onDashboard =
    segments[0] === "household" &&
    segments.length === 2 &&
    segments[1] === "[id]";

  useEffect(() => {
    if (session !== undefined) SplashScreen.hideAsync();
  }, [session]);

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

  if (session === undefined) return null;

  return (
    <PowerSyncContext.Provider value={powersync}>
      <NavigationThemeProvider value={navigationTheme}>
        <StatusBar
          style={scheme === "dark" || onDashboard ? "light" : "dark"}
        />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerShown: false,
          }}
        >
          <Stack.Protected guard={!session}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen
              name="auth"
              options={{ animation: "ios_from_right" }}
            />
          </Stack.Protected>

          <Stack.Protected guard={!!session}>
            <Stack.Screen name="index" />
            <Stack.Screen
              name="household/create"
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="household/join"
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="household/[id]" />
          </Stack.Protected>
        </Stack>
      </NavigationThemeProvider>
    </PowerSyncContext.Provider>
  );
}
