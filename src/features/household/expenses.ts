import { z } from "zod";

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

function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

export const expenseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give this expense a title")
    .max(80, "Keep the title under 80 characters"),
  amount: z
    .string()
    .trim()
    .refine(
      isValidAmount,
      "Enter an amount greater than zero, with up to two decimals",
    ),
  category: z
    .string()
    .trim()
    .min(1, "Pick a category")
    .max(40, "Keep the category under 40 characters"),
  note: z
    .string()
    .trim()
    .max(300, "Keep the note under 300 characters")
    .optional()
    .nullable(),
  spentAt: z
    .date()
    .default(() => new Date())
    .refine(
      (date) => date.getTime() <= endOfToday(),
      "Pick a date that isn't in the future",
    ),
});

function normalizeExpense(input: ExpenseInput) {
  const result = expenseSchema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0].message);

  return {
    ...result.data,
    note: result.data.note || null,
  };
}

export async function addExpense(
  householdId: string,
  userId: string,
  input: ExpenseInput,
) {
  if (!householdId) throw new Error("Household is missing");
  if (!userId) throw new Error("You need to be a household member to save");

  const { title, amount, category, note, spentAt } = normalizeExpense(input);

  await powersync.execute(
    `INSERT INTO expense (id, household_id, spender_id, title, amount, category, note, spent_at)
     VALUES (uuid(), ?, ?, ?, ?, ?, ?, ?)`,
    [
      householdId,
      userId,
      title,
      amount,
      category,
      note,
      toSqlTimestamp(spentAt),
    ],
  );
}

export async function editExpense(id: string, input: ExpenseInput) {
  if (!id) throw new Error("Expense is missing");

  const { title, amount, category, note, spentAt } = normalizeExpense(input);
  const result = await powersync.execute(
    `UPDATE expense SET title = ?, amount = ?, category = ?, note = ?, spent_at = ?
     WHERE id = ? AND voided_at IS NULL RETURNING id`,
    [title, amount, category, note, toSqlTimestamp(spentAt), id],
  );

  if (!result.rows?.length) {
    throw new Error("This expense is voided or no longer exists");
  }
}

export async function voidExpense(id: string, reason?: string) {
  if (!id) throw new Error("Expense is missing");

  const result = await powersync.execute(
    "UPDATE expense SET voided_at = ?, voided_reason = ? WHERE id = ? AND voided_at IS NULL RETURNING id",
    [toSqlTimestamp(new Date()), reason?.trim() || null, id],
  );

  if (!result.rows?.length) throw new Error("Already voided");
}
