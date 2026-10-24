import { Redirect, useLocalSearchParams } from "expo-router";

import { AddExpenseForm } from "@/features/household/components/AddExpenseForm";
import { HouseholdProvider } from "@/features/household/HouseholdProvider";

export default function NewExpenseScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const householdId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!householdId) return <Redirect href="/" />;

  return (
    <HouseholdProvider id={householdId}>
      <AddExpenseForm />
    </HouseholdProvider>
  );
}
