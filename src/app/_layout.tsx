import "@/global.css";

import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack />
    </ThemeProvider>
  );
}
