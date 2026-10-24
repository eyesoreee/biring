import { powersync } from "@/powersync/system";

import { toSqlTimestamp } from "./format";

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export type ExpenseInput = {
  title: string;
  amount: string;
  category: string;
  note?: string | null;
  spentAt?: Date;
};

export function normalizeAmountInput(value: string) {
  let next = value.replace(/[^\d.,]/g, "");

  if (next.includes(".")) {
    next = next.replace(/,/g, "");
  } else if (next.split(",").length === 2) {
    next = next.replace(",", ".");
  } else {
    next = next.replace(/,/g, "");
  }

  if (next.startsWith(".")) next = `0${next}`;

  const [whole, ...decimalParts] = next.split(".");
  if (decimalParts.length === 0) return whole;

  return `${whole}.${decimalParts.join("").slice(0, 2)}`;
}

export function isValidAmount(amount: string) {
  const value = amount.trim();
  const parsed = Number(value);
  return AMOUNT_PATTERN.test(value) && Number.isFinite(parsed) && parsed > 0;
}

export async function addExpense(
  householdId: string,
  userId: string,
  input: ExpenseInput,
) {
  const title = input.title.trim();
  const category = input.category.trim();
  const amount = input.amount.trim();
  const spentAt = input.spentAt ?? new Date();

  if (!householdId) throw new Error("Household is missing");
  if (!userId) throw new Error("You need to be a household member to save");
  if (!title) throw new Error("Title is required");
  if (!category) throw new Error("Category is required");
  if (!isValidAmount(amount)) {
    throw new Error("Amount must be greater than zero");
  }
  if (Number.isNaN(spentAt.getTime())) throw new Error("Date is invalid");

  await powersync.execute(
    `INSERT INTO expense (id, household_id, spender_id, title, amount, category, note, spent_at)
     VALUES (uuid(), ?, ?, ?, ?, ?, ?, ?)`,
    [
      householdId,
      userId,
      title,
      amount,
      category,
      input.note?.trim() || null,
      toSqlTimestamp(spentAt),
    ],
  );
}
