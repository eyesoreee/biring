export type Role = "owner" | "member";

export type Member = {
  id: string;
  user_id: string;
  nickname: string;
  role: Role;
};

export type Household = {
  name: string;
  currency_code: string;
  invite_code: string;
};

export type HouseholdListItem = {
  id: string;
  name: string;
  currency_code: string;
  members: number;
  month_total: number | null;
};

export type MonthSummary = {
  count: number;
  total: number;
};

export type CategoryTotal = {
  category: string;
  total: number;
};

export type RecentExpense = {
  id: string;
  title: string;
  amount: string;
  category: string;
  spent_at: string;
  spender_id: string;
  spender_nickname: string | null;
};

export type ExpenseListItem = {
  id: string;
  title: string;
  amount: string;
  category: string;
  spent_at: string;
  spender_id: string;
  spender_nickname: string | null;
};

export type EditableExpense = {
  id: string;
  title: string;
  amount: string;
  category: string;
  spent_at: string;
  spender_id: string;
  spender_nickname: string | null;
  note: string | null;
};
