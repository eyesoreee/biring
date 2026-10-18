import Storage from "expo-sqlite/kv-store";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Appearance, useColorScheme } from "react-native";

import {
  themeColors,
  type AppColorScheme,
  type ThemeColors,
  type ThemePreference,
} from "./theme";

const STORAGE_KEY = "biring.theme-preference";

type ThemeContextValue = {
  scheme: AppColorScheme;
  colors: ThemeColors;
  isDark: boolean;
  toggleDark: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    Storage.getItem(STORAGE_KEY)
      .catch(() => null)
      .then((stored) => {
        if (stored === "light" || stored === "dark") setPreference(stored);
      });
  }, []);

  const scheme: AppColorScheme =
    preference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : preference;

  useEffect(() => {
    Appearance.setColorScheme(
      preference === "system" ? "unspecified" : preference,
    );
  }, [preference]);

  const toggleDark = () => {
    const next: ThemePreference = scheme === "dark" ? "light" : "dark";
    setPreference(next);
    Storage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  return (
    <ThemeContext.Provider
      value={{
        scheme,
        colors: themeColors[scheme],
        isDark: scheme === "dark",
        toggleDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within a ThemeProvider");
  return value;
}
