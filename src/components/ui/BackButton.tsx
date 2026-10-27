import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export function BackButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      className="active:opacity-60 h-10 w-10 items-center justify-center rounded-full border border-edge bg-surface dark:border-graphite-border dark:bg-graphite-surface"
    >
      <Ionicons name="arrow-back" size={20} color={colors.text} />
    </Pressable>
  );
}
