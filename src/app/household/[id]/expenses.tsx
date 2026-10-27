import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@powersync/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Sheet } from "@/components/ui/Sheet";
import { ExpenseRow } from "@/features/household/components/ExpenseRow";
import { MonthSwitcher } from "@/features/household/components/MonthSwitcher";
import {
  formatExpenseDate,
  formatMoney,
  fromSqlTimestamp,
  monthBounds,
} from "@/features/household/format";
import { useHousehold } from "@/features/household/HouseholdProvider";
import { EXPENSES_SQL } from "@/features/household/sql";
import type { ExpenseListItem } from "@/features/household/types";
import { useTheme } from "@/theme/ThemeProvider";

export default function ExpensesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id, household, members, me } = useHousehold();
  const [month, setMonth] = useState(() => new Date());
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [spenderFilter, setSpenderFilter] = useState<string | null>(null);
  const [openSheet, setOpenSheet] = useState<"category" | "spender" | null>(
    null,
  );

  const { monthStart, monthEnd } = monthBounds(month);
  const { data: expenses } = useQuery<ExpenseListItem>(EXPENSES_SQL, [
    id,
    monthStart,
    monthEnd,
  ]);

  const currency = household?.currency_code ?? "PHP";

  const categories = [
    ...new Set(expenses.map((expense) => expense.category)),
  ].sort((a, b) => a.localeCompare(b));
  const filtered = expenses.filter(
    (expense) =>
      (!categoryFilter || expense.category === categoryFilter) &&
      (!spenderFilter || expense.spender_id === spenderFilter),
  );
  const total = filtered.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  const groups: { date: string; expenses: ExpenseListItem[] }[] = [];
  for (const expense of filtered) {
    const date = formatExpenseDate(fromSqlTimestamp(expense.spent_at));
    const group = groups[groups.length - 1];
    if (group?.date === date) group.expenses.push(expense);
    else groups.push({ date, expenses: [expense] });
  }

  const filterOptions: { key: string | null; label: string }[] =
    openSheet === "spender"
      ? [
          { key: null, label: "Everyone" },
          ...members.map((member) => ({
            key: member.user_id,
            label: member.nickname,
          })),
        ]
      : [
          { key: null, label: "All categories" },
          ...categories.map((category) => ({ key: category, label: category })),
        ];
  const selectedFilter =
    openSheet === "spender" ? spenderFilter : categoryFilter;
  const spenderFilterLabel =
    members.find((member) => member.user_id === spenderFilter)?.nickname ??
    "Everyone";

  const chooseFilter = (key: string | null) => {
    if (openSheet === "spender") setSpenderFilter(key);
    else setCategoryFilter(key);
    setOpenSheet(null);
  };

  const canEdit = (expense: ExpenseListItem) =>
    me?.role === "owner" || expense.spender_id === me?.user_id;

  const openEditor = (expense: ExpenseListItem) => {
    router.push({
      pathname: "/expense/new",
      params: { id, expenseId: expense.id },
    });
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas dark:bg-graphite">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-6 pb-10 pt-2"
      >
        <PageHeader title="Expenses" />

        <MonthSwitcher month={month} onChange={setMonth} />

        <View className="flex-row items-end justify-between">
          <Text className="font-sans text-base text-muted dark:text-silver">
            {filtered.length} expense{filtered.length === 1 ? "" : "s"}
          </Text>
          <Text
            style={{ fontVariant: ["tabular-nums"] }}
            className="font-sans-bold text-2xl text-graphite dark:text-on-graphite"
          >
            {formatMoney(total, currency)}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <Pressable
            className={`active:opacity-70 h-12 flex-1 flex-row items-center gap-2 rounded-2xl border px-4 ${
              categoryFilter !== null
                ? "border-mint-ink bg-selected dark:border-mint dark:bg-selected-dark"
                : "border-edge bg-surface dark:border-graphite-border dark:bg-graphite-surface"
            }`}
            accessibilityRole="button"
            accessibilityLabel={`Category, ${categoryFilter ?? "All categories"}`}
            onPress={() => setOpenSheet("category")}
          >
            <Text
              className="flex-1 font-sans text-base text-graphite dark:text-on-graphite"
              numberOfLines={1}
            >
              {categoryFilter ?? "Category"}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
          </Pressable>

          <Pressable
            className={`active:opacity-70 h-12 flex-1 flex-row items-center gap-2 rounded-2xl border px-4 ${
              spenderFilter !== null
                ? "border-mint-ink bg-selected dark:border-mint dark:bg-selected-dark"
                : "border-edge bg-surface dark:border-graphite-border dark:bg-graphite-surface"
            }`}
            accessibilityRole="button"
            accessibilityLabel={`Spender, ${spenderFilterLabel}`}
            onPress={() => setOpenSheet("spender")}
          >
            <Text
              className="flex-1 font-sans text-base text-graphite dark:text-on-graphite"
              numberOfLines={1}
            >
              {spenderFilterLabel}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
          </Pressable>
        </View>

        {filtered.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title={
              expenses.length === 0
                ? "No expenses this month"
                : "No matching expenses"
            }
            body={
              expenses.length === 0
                ? "Tap the + button to add one."
                : "Try another category or spender."
            }
          />
        ) : (
          <View className="gap-5">
            {groups.map((group) => (
              <View key={group.date} className="gap-2">
                <Text className="font-sans-medium text-sm text-muted dark:text-silver">
                  {group.date}
                </Text>

                <View className="overflow-hidden rounded-2xl border border-edge bg-surface dark:border-graphite-border dark:bg-graphite-surface">
                  {group.expenses.map((expense, index) => (
                    <View key={expense.id} className="px-4">
                      <ExpenseRow
                        currency={currency}
                        divider={index < group.expenses.length - 1}
                        expense={expense}
                        meId={me?.user_id}
                        onPress={
                          canEdit(expense)
                            ? () => openEditor(expense)
                            : undefined
                        }
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Sheet visible={openSheet !== null} onClose={() => setOpenSheet(null)}>
        <Text className="font-sans-semibold text-2xl text-graphite dark:text-on-graphite">
          {openSheet === "spender" ? "Filter by spender" : "Filter by category"}
        </Text>
        <ScrollView
          className="max-h-80"
          contentContainerClassName="gap-1"
          showsVerticalScrollIndicator={false}
        >
          {filterOptions.map((option) => (
            <Pressable
              key={option.key ?? "all"}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedFilter === option.key }}
              className={`active:opacity-70 flex-row items-center justify-between rounded-xl px-3 py-3 ${
                selectedFilter === option.key
                  ? "bg-selected dark:bg-selected-dark"
                  : ""
              }`}
              onPress={() => chooseFilter(option.key)}
            >
              <Text className="font-sans text-lg text-graphite dark:text-on-graphite">
                {option.label}
              </Text>
              {selectedFilter === option.key ? (
                <Ionicons name="checkmark" size={20} color={colors.mint} />
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      </Sheet>
    </SafeAreaView>
  );
}
