import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { palette } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";

import { MONTHS } from "../format";

export function MonthSwitcher({
  month,
  onChange,
  tone = "light",
}: {
  month: Date;
  onChange: (month: Date) => void;
  tone?: "dark" | "light";
}) {
  const { colors } = useTheme();
  const now = new Date();
  const isCurrentMonth =
    month.getFullYear() === now.getFullYear() &&
    month.getMonth() === now.getMonth();

  const iconColor = tone === "dark" ? palette.silver : colors.textMuted;
  const labelClass =
    tone === "dark"
      ? "text-on-graphite"
      : "text-graphite dark:text-on-graphite";

  const shift = (offset: number) =>
    onChange(new Date(month.getFullYear(), month.getMonth() + offset, 1));

  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        accessibilityLabel="Previous month"
        accessibilityRole="button"
        className="h-12 w-12 items-center justify-center active:opacity-60"
        hitSlop={8}
        onPress={() => shift(-1)}
      >
        <Ionicons name="chevron-back" size={20} color={iconColor} />
      </Pressable>

      <Text
        className={`font-sans-semibold text-sm tracking-wider ${labelClass}`}
      >
        {MONTHS[month.getMonth()].toUpperCase()} {month.getFullYear()}
      </Text>

      <Pressable
        accessibilityLabel="Next month"
        accessibilityRole="button"
        accessibilityState={{ disabled: isCurrentMonth }}
        className={`h-12 w-12 items-center justify-center ${
          isCurrentMonth ? "opacity-30" : "active:opacity-60"
        }`}
        disabled={isCurrentMonth}
        hitSlop={8}
        onPress={() => shift(1)}
      >
        <Ionicons name="chevron-forward" size={20} color={iconColor} />
      </Pressable>
    </View>
  );
}
