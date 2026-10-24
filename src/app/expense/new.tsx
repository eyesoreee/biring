import { useQuery } from "@powersync/react";
import { Redirect, useLocalSearchParams } from "expo-router";

import { AddExpenseForm } from "@/features/household/components/AddExpenseForm";
import { HouseholdProvider } from "@/features/household/HouseholdProvider";
import { EDIT_EXPENSE_SQL } from "@/features/household/sql";
import type { EditableExpense } from "@/features/household/types";

export default function NewExpenseScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    expenseId?: string | string[];
  }>();
  const householdId = Array.isArray(params.id) ? params.id[0] : params.id;
  const expenseId = Array.isArray(params.expenseId)
    ? params.expenseId[0]
    : params.expenseId;
  const { data: expenses, isLoading } = useQuery<EditableExpense>(
    EDIT_EXPENSE_SQL,
    [expenseId ?? "", householdId ?? ""],
  );
  const expense = expenses[0];

  if (!householdId) return <Redirect href="/" />;

  if (expenseId && isLoading) return null;

  if (expenseId && !expense) {
    return (
      <Redirect
        href={{
          pathname: "/household/[id]/expenses",
          params: { id: householdId },
        }}
      />
    );
  }

  return (
    <HouseholdProvider id={householdId}>
      <AddExpenseForm key={expense?.id ?? "new"} expense={expense} />
    </HouseholdProvider>
  );
}
