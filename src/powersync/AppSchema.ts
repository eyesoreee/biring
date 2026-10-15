import { column, Schema, Table } from "@powersync/react-native";

const household = new Table({
  name: column.text,
  currency_code: column.text,
  created_by: column.text,
  created_at: column.text,
  updated_at: column.text,
  deleted_at: column.text,
  invite_code: column.text,
});

const household_member = new Table(
  {
    household_id: column.text,
    user_id: column.text,
    nickname: column.text,
    role: column.text,
    created_at: column.text,
    updated_at: column.text,
    left_at: column.text,
  },
  { indexes: { by_household: ["household_id"], by_user: ["user_id"] } },
);

const expense = new Table(
  {
    household_id: column.text,
    spender_id: column.text,
    title: column.text,
    amount: column.text,
    category: column.text,
    note: column.text,
    spent_at: column.text,
    updated_at: column.text,
    voided_at: column.text,
    voided_by: column.text,
    voided_reason: column.text,
  },
  { indexes: { by_household: ["household_id", "spent_at"] } },
);

export const AppSchema = new Schema({ household, household_member, expense });

export type Database = (typeof AppSchema)["types"];
export type HouseholdRecord = Database["household"];
export type HouseholdMemberRecord = Database["household_member"];
export type ExpenseRecord = Database["expense"];
