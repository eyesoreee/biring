export type ThemePreference = "system" | "light" | "dark";

export type AppColorScheme = "light" | "dark";

export const palette = {
  mint: "#2dd4a8",
  mintPressed: "#26c299",
  onMint: "#123329",
  danger: "#ef4444",
  graphite: "#17191c",
  graphiteSurface: "#24272b",
  graphiteBorder: "#33373d",
  onGraphite: "#f5f6f7",
  silver: "#a6abb2",
  canvas: "#f5f6f7",
  surface: "#ffffff",
};

export const fonts = {
  regular: "PublicSans-Regular",
  medium: "PublicSans-Medium",
  semibold: "PublicSans-SemiBold",
  bold: "PublicSans-Bold",
};

export type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  placeholder: string;
  border: string;
  mint: string;
  onMint: string;
  danger: string;
};

export const themeColors: Record<AppColorScheme, ThemeColors> = {
  light: {
    background: palette.canvas,
    surface: palette.surface,
    text: palette.graphite,
    textMuted: "#6a7078",
    placeholder: "#9aa0a6",
    border: "#e2e5e8",
    mint: palette.mint,
    onMint: palette.onMint,
    danger: palette.danger,
  },
  dark: {
    background: palette.graphite,
    surface: palette.graphiteSurface,
    text: palette.onGraphite,
    textMuted: palette.silver,
    placeholder: "#7f858d",
    border: palette.graphiteBorder,
    mint: palette.mint,
    onMint: palette.onMint,
    danger: palette.danger,
  },
};
