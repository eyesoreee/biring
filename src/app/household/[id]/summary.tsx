import { useQuery } from "@powersync/react";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { MonthSwitcher } from "@/features/household/components/MonthSwitcher";
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

export default function SummaryScreen() {
  const { id, household, me } = useHousehold();

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-graphite">
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-6 pb-6 pt-2">
          <PageHeader title="Summary" tone="dark" />

          <MonthSwitcher month={month} onChange={setMonth} tone="dark" />

          <View className="items-center gap-2">
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ fontVariant: ["tabular-nums"] }}
              className="w-full text-center font-sans-bold text-4xl text-on-graphite"
            >
              {formatMoney(total, currency)}
            </Text>
            <Text className="text-center font-sans text-sm text-silver">
              {expenseCount} expense{expenseCount === 1 ? "" : "s"} this month
            </Text>
            {comparison ? (
              <Text className="w-full text-center font-sans text-sm text-silver">
                {comparison}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="grow rounded-t-3xl bg-surface px-6 pb-8 pt-6 dark:bg-graphite-surface">
          {total === 0 ? (
            <EmptyState
              icon="pie-chart-outline"
              title={`No expenses in ${MONTHS[month.getMonth()]}`}
              body="Tap the + button to add one."
            />
          ) : (
            <View className="gap-8">
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
                      <Text
                        style={{ fontVariant: ["tabular-nums"] }}
                        className="font-sans-semibold text-base text-graphite dark:text-on-graphite"
                      >
                        {formatMoney(category.total, currency)}
                      </Text>
                    </View>
                    <View className="h-2 overflow-hidden rounded-full bg-edge dark:bg-graphite-border">
                      <View
                        className="h-full rounded-full bg-mint-ink dark:bg-mint"
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
                      <Text
                        style={{ fontVariant: ["tabular-nums"] }}
                        className="font-sans-semibold text-base text-graphite dark:text-on-graphite"
                      >
                        {formatMoney(spender.total, currency)}
                      </Text>
                    </View>
                    <View className="h-2 overflow-hidden rounded-full bg-edge dark:bg-graphite-border">
                      <View
                        className="h-full rounded-full bg-mint-ink dark:bg-mint"
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
