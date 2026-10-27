import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export type OnboardingSlideContent = {
  icon: any;
  title: string;
  subtitle: string;
};

export function OnboardingSlide({
  icon,
  title,
  subtitle,
}: OnboardingSlideContent) {
  const { colors } = useTheme();

  return (
    <View className="items-center gap-5">
      <View className="h-20 w-20 items-center justify-center rounded-2xl bg-selected dark:bg-selected-dark">
        <Ionicons name={icon} size={32} color={colors.mint} />
      </View>
      <Text className="text-center font-sans-bold text-3xl text-graphite dark:text-on-graphite">
        {title}
      </Text>
      <Text className="text-center font-sans text-lg text-muted dark:text-silver">
        {subtitle}
      </Text>
    </View>
  );
}
