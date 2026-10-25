import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@powersync/react";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatMoney, monthBounds, MONTHS } from "@/features/household/format";
import { useHousehold } from "@/features/household/HouseholdProvider";
import {
  CATEGORY_TOTALS_SQL,
  MEMBER_TOTALS_SQL,
  MONTH_SUMMARY_SQL,
} from "@/features/household/sql";
import type {
  CategoryTotal,
  MemberTotal,
  MonthSummary,
} from "@/features/household/types";
import { palette } from "@/theme/theme";

export default function SummaryScreen() {
  const { id, household, me } = useHousehold();

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const now = new Date();
  const isCurrentMonth =
    month.getFullYear() === now.getFullYear() &&
    month.getMonth() === now.getMonth();
  const monthLabel = `${MONTHS[month.getMonth()].toUpperCase()} ${month.getFullYear()}`;

  const { monthStart, monthEnd } = monthBounds(month);
  const previousMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
  const previousBounds = monthBounds(previousMonth);

  const { data: summary } = useQuery<MonthSummary>(MONTH_SUMMARY_SQL, [
    id,
    monthStart,
    monthEnd,
  ]);
  const { data: previousSummary } = useQuery<MonthSummary>(MONTH_SUMMARY_SQL, [
    id,
    previousBounds.monthStart,
    previousBounds.monthEnd,
  ]);
  const { data: categories } = useQuery<CategoryTotal>(CATEGORY_TOTALS_SQL, [
    id,
    monthStart,
    monthEnd,
  ]);
  const { data: spenders } = useQuery<MemberTotal>(MEMBER_TOTALS_SQL, [
    id,
    monthStart,
    monthEnd,
  ]);

  const total = summary[0]?.total ?? 0;
  const expenseCount = summary[0]?.count ?? 0;
  const previousTotal = previousSummary[0]?.total ?? 0;
  const currency = household?.currency_code ?? "PHP";
  const previousName = MONTHS[previousMonth.getMonth()];

  const delta = total - previousTotal;
  let comparison: string | null = null;

  if (previousTotal === 0) {
    if (total > 0) comparison = `No expenses in ${previousName}`;
  } else if (Math.abs(delta) < 0.005) {
    comparison = `Same as ${previousName}`;
  } else {
    comparison = `${formatMoney(Math.abs(delta), currency)} ${
      delta > 0 ? "more" : "less"
    } than ${previousName}`;
  }

  const shareOfTotal = (value: number) =>
    total > 0 ? Math.min(100, (value / total) * 100) : 0;

  const changeMonth = (offset: number) => {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-graphite">
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-6 pb-6 pt-2">
          <Text className="font-sans-bold text-4xl text-on-graphite">
            Summary
          </Text>

          <View className="flex-row items-center justify-between">
            <Pressable
              className="h-10 w-10 items-center justify-center active:opacity-60"
              onPress={() => changeMonth(-1)}
            >
              <Ionicons name="chevron-back" size={20} color={palette.silver} />
            </Pressable>

            <Text className="font-sans-semibold text-sm tracking-wider text-on-graphite">
              {monthLabel}
            </Text>

            <Pressable
              className={`h-10 w-10 items-center justify-center ${
                isCurrentMonth ? "opacity-30" : "active:opacity-60"
              }`}
              disabled={isCurrentMonth}
              onPress={() => changeMonth(1)}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={palette.silver}
              />
            </Pressable>
          </View>

          <View className="items-center gap-2">
            <Text
              numberOfLines={1}
              className="w-full text-center font-sans-bold text-4xl text-on-graphite"
            >
              {formatMoney(total, currency)}
            </Text>
            <Text className="text-center font-sans text-sm text-silver">
              {expenseCount} expense{expenseCount === 1 ? "" : "s"} this month
            </Text>
            {previousTotal > 0 ? (
              <Text className="text-center font-sans text-sm text-silver">
                {previousName}: {formatMoney(previousTotal, currency)}
              </Text>
            ) : null}
            {comparison ? (
              <Text className="w-full text-center font-sans text-sm text-silver">
                {comparison}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="grow rounded-t-3xl bg-surface px-6 pb-8 pt-5 dark:bg-graphite-surface">
          <Text className="font-sans-medium text-sm text-muted dark:text-silver">
            {`Recorded totals · ${MONTHS[month.getMonth()]} ${month.getFullYear()}`}
          </Text>

          {total === 0 ? (
            <View className="items-center justify-center gap-3 py-16">
              <View className="h-14 w-14 items-center justify-center rounded-3xl bg-selected dark:bg-selected-dark">
                <Ionicons
                  name="pie-chart-outline"
                  size={28}
                  color={palette.mint}
                />
              </View>
              <Text className="font-sans-semibold text-xl text-graphite dark:text-on-graphite">
                No expenses in {MONTHS[month.getMonth()]}
              </Text>
              <Text className="text-center font-sans text-base text-muted dark:text-silver">
                Tap the + button to add one.
              </Text>
            </View>
          ) : (
            <View className="gap-8 pt-6">
              <View className="gap-4">
                <Text className="font-sans-semibold text-xl text-graphite dark:text-on-graphite">
                  By category
                </Text>

                {categories.map((category) => (
                  <View key={category.category} className="gap-1">
                    <View className="flex-row items-center justify-between gap-3">
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-sans-medium text-base text-graphite dark:text-on-graphite"
                      >
                        {category.category}
                      </Text>
                      <Text className="font-sans-semibold text-base text-graphite dark:text-on-graphite">
                        {formatMoney(category.total, currency)}
                      </Text>
                    </View>
                    <View className="h-2 overflow-hidden rounded-full bg-edge dark:bg-graphite-border">
                      <View
                        className="h-full rounded-full bg-mint"
                        style={{ width: `${shareOfTotal(category.total)}%` }}
                      />
                    </View>
                  </View>
                ))}
              </View>

              <View className="gap-4">
                <Text className="font-sans-semibold text-xl text-graphite dark:text-on-graphite">
                  By member
                </Text>

                {spenders.map((spender) => (
                  <View key={spender.spender_id} className="gap-1">
                    <View className="flex-row items-center justify-between gap-3">
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-sans-medium text-base text-graphite dark:text-on-graphite"
                      >
                        {spender.spender_nickname ?? "Unknown"}
                        {spender.spender_id === me?.user_id ? " (you)" : ""}
                      </Text>
                      <Text className="font-sans-semibold text-base text-graphite dark:text-on-graphite">
                        {formatMoney(spender.total, currency)}
                      </Text>
                    </View>
                    <View className="h-2 overflow-hidden rounded-full bg-edge dark:bg-graphite-border">
                      <View
                        className="h-full rounded-full bg-mint"
                        style={{ width: `${shareOfTotal(spender.total)}%` }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
