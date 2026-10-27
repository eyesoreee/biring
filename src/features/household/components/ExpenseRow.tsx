import { Pressable, Text, View } from "react-native";

import { formatMoney } from "../format";
import type { ExpenseListItem } from "../types";

export function ExpenseRow({
  expense,
  currency,
  meId,
  divider,
  onPress,
}: {
  expense: ExpenseListItem;
  currency: string;
  meId?: string;
  divider?: boolean;
  onPress?: () => void;
}) {
  const isMe = expense.spender_id === meId;
  const spender = expense.spender_nickname
    ? `${expense.spender_nickname}${isMe ? " (you)" : ""}`
    : null;
  const meta = [expense.category, spender].filter(Boolean).join(" · ");

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      className={`flex-row items-center gap-3 py-3 ${
        divider ? "border-b border-edge dark:border-graphite-border" : ""
      } ${onPress ? "active:opacity-70" : ""}`}
      disabled={!onPress}
      onPress={onPress}
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-selected dark:bg-selected-dark">
        <Text className="font-sans-semibold text-base text-mint-ink dark:text-mint">
          {expense.category.charAt(0).toUpperCase() || "?"}
        </Text>
      </View>

      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          className="font-sans-semibold text-base text-graphite dark:text-on-graphite"
        >
          {expense.title}
        </Text>
        {meta ? (
          <Text
            numberOfLines={1}
            className="font-sans text-sm text-muted dark:text-silver"
          >
            {meta}
          </Text>
        ) : null}
      </View>

      <Text
        numberOfLines={1}
        style={{ fontVariant: ["tabular-nums"] }}
        className="font-sans-semibold text-base text-graphite dark:text-on-graphite"
      >
        {formatMoney(Number(expense.amount), currency)}
      </Text>
    </Pressable>
  );
}
