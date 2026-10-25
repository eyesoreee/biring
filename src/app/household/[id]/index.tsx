import { Ionicons } from "@expo/vector-icons";
import { useQuery, useStatus } from "@powersync/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  formatMoney,
  monthBounds,
  MONTHS,
  parseSpentAt,
} from "@/features/household/format";
import { useHousehold } from "@/features/household/HouseholdProvider";
import {
  CATEGORY_TOTALS_SQL,
  MONTH_SUMMARY_SQL,
  RECENT_EXPENSES_SQL,
} from "@/features/household/sql";
import type {
  CategoryTotal,
  MonthSummary,
  RecentExpense,
} from "@/features/household/types";
import { palette } from "@/theme/theme";

type ExpenseGroup = {
  key: string;
  label: string;
  expenses: RecentExpense[];
};

function groupByDay(expenses: RecentExpense[]) {
  return expenses.reduce<ExpenseGroup[]>((groups, expense) => {
    const date = parseSpentAt(expense.spent_at);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const last = groups[groups.length - 1];

    if (last?.key === key) {
      last.expenses.push(expense);
    } else {
      groups.push({
        key,
        label: `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`,
        expenses: [expense],
      });
    }

    return groups;
  }, []);
}

export default function HomeScreen() {
  const router = useRouter();
  const { id, household, members, me } = useHousehold();
  const { hasSynced } = useStatus();

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
  const { data: recent } = useQuery<RecentExpense>(RECENT_EXPENSES_SQL, [
    id,
    monthStart,
    monthEnd,
  ]);

  const expenseCount = summary[0]?.count ?? 0;
  const total = summary[0]?.total ?? 0;
  const previousTotal = previousSummary[0]?.total ?? 0;
  const currency = household?.currency_code ?? "PHP";
  const groups = groupByDay(recent);

  const delta = total - previousTotal;
  const previousName = MONTHS[previousMonth.getMonth()];
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

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-graphite">
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-6 pb-6 pt-2">
          <Pressable
            onPress={() => router.navigate("/")}
            className="flex-row items-center gap-2.5 active:opacity-70"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-selected-dark">
              <Ionicons name="home" size={18} color={palette.mint} />
            </View>
            <Text
              numberOfLines={1}
              className="shrink font-sans-semibold text-xl text-on-graphite"
            >
              {household?.name ?? "Household"}
            </Text>
            <Ionicons name="chevron-down" size={18} color={palette.silver} />
          </Pressable>

          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
              className="h-10 w-10 items-center justify-center active:opacity-60"
            >
              <Ionicons name="chevron-back" size={20} color={palette.silver} />
            </Pressable>

            <Text className="font-sans-semibold text-sm tracking-wider text-on-graphite">
              {monthLabel}
            </Text>

            <Pressable
              onPress={() => {
                if (!isCurrentMonth)
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  );
              }}
              disabled={isCurrentMonth}
              className={`h-10 w-10 items-center justify-center ${
                isCurrentMonth ? "opacity-30" : "active:opacity-60"
              }`}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={palette.silver}
              />
            </Pressable>
          </View>

          <View className="items-center gap-2">
            <Text className="font-sans-medium text-sm text-silver">
              Total expenses
            </Text>
            <Text
              numberOfLines={1}
              className="w-full text-center font-sans-bold text-4xl text-on-graphite"
            >
              {formatMoney(total, currency)}
            </Text>
            <View className="w-full items-center gap-1">
              <Text className="text-center font-sans text-sm text-silver">
                {`${expenseCount} ${
                  expenseCount === 1 ? "expense" : "expenses"
                } · ${members.length} ${
                  members.length === 1 ? "member" : "members"
                }`}
              </Text>
              {comparison ? (
                <Text className="w-full text-center font-sans text-sm text-silver">
                  {comparison}
                </Text>
              ) : null}
            </View>
          </View>

          {categories.length > 0 ? (
            <View className="flex-row gap-5">
              {categories.slice(0, 2).map((category) => {
                const share =
                  total > 0 ? Math.min(100, (category.total / total) * 100) : 0;

                return (
                  <View key={category.category} className="flex-1 gap-1">
                    <Text
                      numberOfLines={1}
                      className="font-sans-medium text-sm text-silver"
                    >
                      {category.category}
                    </Text>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      className="font-sans-semibold text-xl text-on-graphite"
                    >
                      {formatMoney(category.total, currency)}
                    </Text>
                    <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-graphite-border">
                      <View
                        className="h-full rounded-full bg-mint"
                        style={{ width: `${share}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>

        <View className="grow rounded-t-3xl bg-surface px-6 pb-8 pt-5 dark:bg-graphite-surface">
          <Text className="font-sans-semibold text-xl text-graphite dark:text-on-graphite">
            Recent expenses
          </Text>

          {groups.length > 0 ? (
            <View className="mt-4 gap-5">
              {groups.map((group) => (
                <View key={group.key} className="gap-1">
                  <Text className="font-sans-medium text-sm text-muted dark:text-silver">
                    {group.label}
                  </Text>

                  {group.expenses.map((expense) => {
                    const isMe = expense.spender_id === me?.user_id;
                    const spender = expense.spender_nickname
                      ? `${expense.spender_nickname}${isMe ? " (you)" : ""}`
                      : null;
                    const meta = [expense.category, spender]
                      .filter(Boolean)
                      .join(" · ");

                    return (
                      <View
                        key={expense.id}
                        className="flex-row items-center gap-3 border-b border-edge py-3 dark:border-graphite-border"
                      >
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-selected dark:bg-selected-dark">
                          <Ionicons
                            name="receipt-outline"
                            size={18}
                            color={palette.mint}
                          />
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

                        <Text className="font-sans-semibold text-base text-graphite dark:text-on-graphite">
                          {formatMoney(Number(expense.amount), currency)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : hasSynced ? (
            <View className="grow items-center justify-center py-10">
              <Text className="text-center font-sans text-base text-muted dark:text-silver">
                No expenses in {MONTHS[month.getMonth()]}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
