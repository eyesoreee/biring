import { Ionicons } from "@expo/vector-icons";
import { useQuery, useStatus } from "@powersync/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExpenseRow } from "@/features/household/components/ExpenseRow";
import { MonthSwitcher } from "@/features/household/components/MonthSwitcher";
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

  const canEdit = (expense: RecentExpense) =>
    me?.role === "owner" || expense.spender_id === me?.user_id;

  const openEditor = (expense: RecentExpense) => {
    router.push({
      pathname: "/expense/new",
      params: { id, expenseId: expense.id },
    });
  };

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
          <PageHeader
            title={household?.name ?? "Household"}
            tone="dark"
            trailing={
              <Ionicons name="chevron-down" size={22} color={palette.silver} />
            }
            accessibilityLabel="Switch household"
            onPress={() => router.navigate("/")}
          />

          <MonthSwitcher month={month} onChange={setMonth} tone="dark" />

          <View className="items-center gap-2">
            <Text className="font-sans-medium text-sm text-silver">
              Total expenses
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ fontVariant: ["tabular-nums"] }}
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
                      style={{ fontVariant: ["tabular-nums"] }}
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
              {groups.map((group, groupIndex) => (
                <View key={group.key} className="gap-1">
                  <Text className="font-sans-medium text-sm text-muted dark:text-silver">
                    {group.label}
                  </Text>

                  {group.expenses.map((expense, expenseIndex) => {
                    const isLast =
                      groupIndex === groups.length - 1 &&
                      expenseIndex === group.expenses.length - 1;

                    return (
                      <ExpenseRow
                        key={expense.id}
                        currency={currency}
                        divider={!isLast}
                        expense={expense}
                        meId={me?.user_id}
                        onPress={
                          canEdit(expense) ? () => openEditor(expense) : undefined
                        }
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          ) : hasSynced ? (
            <EmptyState
              icon="receipt-outline"
              title={`No expenses in ${MONTHS[month.getMonth()]}`}
              body="Tap the + button to add one."
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
