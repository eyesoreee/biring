import { Pressable, Text, View } from "react-native";

export type HouseholdRowProps = {
  name: string;
  members: number;
  month: string;
  total: string;
  divider?: boolean;
  onPress: () => void;
};

export function HouseholdRow({
  name,
  members,
  month,
  total,
  divider,
  onPress,
}: HouseholdRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`active:opacity-70 flex-row items-center gap-3 py-4 ${
        divider ? "border-b border-edge dark:border-graphite-border" : ""
      }`}
    >
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-selected dark:bg-selected-dark">
        <Text className="font-sans-semibold text-lg text-mint-ink dark:text-mint">
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          className="font-sans-semibold text-lg text-graphite dark:text-on-graphite"
        >
          {name}
        </Text>
        <Text
          numberOfLines={1}
          className="font-sans text-sm text-muted dark:text-silver"
        >
          {members} member{members === 1 ? "" : "s"}
        </Text>
      </View>

      <View className="items-end gap-0.5">
        <Text className="font-sans text-xs text-muted dark:text-silver">
          {month}
        </Text>
        <Text
          style={{ fontVariant: ["tabular-nums"] }}
          className="font-sans-semibold text-base text-graphite dark:text-on-graphite"
        >
          {total}
        </Text>
      </View>
    </Pressable>
  );
}
