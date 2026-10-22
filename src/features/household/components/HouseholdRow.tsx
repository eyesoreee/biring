import { Pressable, Text, View } from "react-native";

export type HouseholdRowProps = {
  name: string;
  members: number;
  month: string;
  total: string;
  onPress: () => void;
};

export function HouseholdRow({
  name,
  members,
  month,
  total,
  onPress,
}: HouseholdRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-80 flex-row items-center gap-3 rounded-2xl border border-edge bg-surface px-4 py-4 dark:border-graphite-border dark:bg-graphite-surface"
    >
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-selected dark:bg-selected-dark">
        <Text className="font-sans-semibold text-lg text-mint">
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
        <Text className="font-sans-semibold text-sm text-graphite dark:text-on-graphite">
          {total}
        </Text>
      </View>
    </Pressable>
  );
}
