import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  body: string;
}) {
  const { colors } = useTheme();

  return (
    <View className="items-center justify-center gap-3 px-6 py-16">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-selected dark:bg-selected-dark">
        <Ionicons name={icon} size={28} color={colors.mint} />
      </View>
      <Text className="text-center font-sans-semibold text-xl text-graphite dark:text-on-graphite">
        {title}
      </Text>
      <Text className="text-center font-sans text-base text-muted dark:text-silver">
        {body}
      </Text>
    </View>
  );
}
