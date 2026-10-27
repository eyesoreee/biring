import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { BackButton } from "./BackButton";

export function PageHeader({
  title,
  subtitle,
  tone = "light",
  back,
  trailing,
  onPress,
  accessibilityLabel,
}: {
  title: string;
  subtitle?: string;
  tone?: "dark" | "light";
  back?: () => void;
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const titleClass =
    tone === "dark"
      ? "text-on-graphite"
      : "text-graphite dark:text-on-graphite";
  const subtitleClass =
    tone === "dark" ? "text-silver" : "text-muted dark:text-silver";

  const content = (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <Text
          numberOfLines={1}
          className={`shrink font-sans-bold text-3xl ${titleClass}`}
        >
          {title}
        </Text>
        {trailing}
      </View>
      {subtitle ? (
        <Text className={`font-sans text-lg ${subtitleClass}`}>{subtitle}</Text>
      ) : null}
    </View>
  );

  return (
    <View className="gap-4">
      {back ? (
        <View className="flex-row">
          <BackButton onPress={back} />
        </View>
      ) : null}

      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? title}
          className="active:opacity-70"
          onPress={onPress}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
    </View>
  );
}
