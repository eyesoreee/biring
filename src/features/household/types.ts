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
