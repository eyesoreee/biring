import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@powersync/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Sheet } from "@/components/ui/Sheet";
import {
  formatExpenseDate,
  formatMoney,
  fromSqlTimestamp,
  monthBounds,
  MONTHS,
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

  const now = new Date();
  const isCurrentMonth =
    month.getFullYear() === now.getFullYear() &&
    month.getMonth() === now.getMonth();
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
          { key: null, label: "All Categories" },
          ...categories.map((category) => ({ key: category, label: category })),
        ];
  const selectedFilter =
    openSheet === "spender" ? spenderFilter : categoryFilter;
  const spenderFilterLabel =
    members.find((member) => member.user_id === spenderFilter)?.nickname ??
    "Everyone";

  const changeMonth = (offset: number) => {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

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
        <Text className="font-sans-bold text-4xl text-graphite dark:text-on-graphite">
          Expenses
        </Text>

        <View className="flex-row items-center justify-between rounded-2xl border border-edge bg-surface px-2 py-1 dark:border-graphite-border dark:bg-graphite-surface">
          <Pressable
            className="active:opacity-60 h-10 w-10 items-center justify-center"
            onPress={() => changeMonth(-1)}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
          </Pressable>

          <Text className="font-sans-semibold text-lg text-graphite dark:text-on-graphite">
            {MONTHS[month.getMonth()]} {month.getFullYear()}
          </Text>

          <Pressable
            accessibilityState={{ disabled: isCurrentMonth }}
            className={`h-10 w-10 items-center justify-center ${
              isCurrentMonth ? "opacity-30" : "active:opacity-60"
            }`}
            disabled={isCurrentMonth}
            onPress={() => changeMonth(1)}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isCurrentMonth ? colors.placeholder : colors.textMuted}
            />
          </Pressable>
        </View>

        <View className="flex-row items-end justify-between">
          <Text className="font-sans text-base text-muted dark:text-silver">
            {filtered.length} expense{filtered.length === 1 ? "" : "s"}
          </Text>
          <Text className="font-sans-bold text-2xl text-graphite dark:text-on-graphite">
            {formatMoney(total, currency)}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <Pressable
            className="active:opacity-70 h-12 flex-1 flex-row items-center gap-2 rounded-2xl border border-edge bg-surface px-4 dark:border-graphite-border dark:bg-graphite-surface"
            onPress={() => setOpenSheet("category")}
          >
            <Text
              className="flex-1 font-sans text-base text-graphite dark:text-on-graphite"
              numberOfLines={1}
            >
              {categoryFilter ?? "All Categories"}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
          </Pressable>

          <Pressable
            className="active:opacity-70 h-12 flex-1 flex-row items-center gap-2 rounded-2xl border border-edge bg-surface px-4 dark:border-graphite-border dark:bg-graphite-surface"
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
          <View className="items-center justify-center gap-3 py-16">
            <View className="h-14 w-14 items-center justify-center rounded-3xl bg-selected dark:bg-selected-dark">
              <Ionicons name="receipt-outline" size={28} color={colors.mint} />
            </View>
            <Text className="font-sans-semibold text-xl text-graphite dark:text-on-graphite">
              {expenses.length === 0
                ? "No expenses this month"
                : "No matching expenses"}
            </Text>
            <Text className="text-center font-sans text-base text-muted dark:text-silver">
              {expenses.length === 0
                ? "Tap the + button to add one."
                : "Try another category or spender."}
            </Text>
          </View>
        ) : (
          <View className="gap-5">
            {groups.map((group) => (
              <View key={group.date} className="gap-2">
                <Text className="font-sans-medium text-sm text-muted dark:text-silver">
                  {group.date}
                </Text>

                <View className="overflow-hidden rounded-2xl border border-edge bg-surface dark:border-graphite-border dark:bg-graphite-surface">
                  {group.expenses.map((expense, index) => {
                    const editable = canEdit(expense);

                    return (
                      <Pressable
                        key={expense.id}
                        className={`flex-row items-start gap-3 px-4 py-3 ${
                          index < group.expenses.length - 1
                            ? "border-b border-edge dark:border-graphite-border"
                            : ""
                        } ${editable ? "active:opacity-80" : ""}`}
                        disabled={!editable}
                        onPress={() => openEditor(expense)}
                      >
                        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-selected dark:bg-selected-dark">
                          <Text className="font-sans-semibold text-base text-mint">
                            {expense.category.charAt(0).toUpperCase() || "?"}
                          </Text>
                        </View>

                        <View className="flex-1 gap-0.5">
                          <Text
                            className="font-sans-semibold text-lg text-graphite dark:text-on-graphite"
                            numberOfLines={1}
                          >
                            {expense.title}
                          </Text>
                          <Text
                            className="font-sans text-sm text-muted dark:text-silver"
                            numberOfLines={1}
                          >
                            {expense.category} ·{" "}
                            {expense.spender_nickname ?? "Unknown"}
                          </Text>
                        </View>

                        <Text className="font-sans-semibold text-base text-graphite dark:text-on-graphite">
                          {formatMoney(Number(expense.amount), currency)}
                        </Text>
                      </Pressable>
                    );
                  })}
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
