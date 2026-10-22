import { useQuery } from "@powersync/react";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useSession } from "@/lib/auth";

const MEMBERS_SQL = `
  SELECT id, user_id, nickname, role FROM household_member
  WHERE household_id = ? AND left_at IS NULL
  ORDER BY role = 'owner' DESC, nickname COLLATE NOCASE`;

const HOUSEHOLD_SQL = `
  SELECT name, currency_code, invite_code FROM household WHERE id = ?`;

export type Member = {
  id: string;
  user_id: string;
  nickname: string;
  role: string;
};

export type Household = {
  name: string;
  currency_code: string;
  invite_code: string;
};

type HouseholdContextValue = {
  id: string;
  household?: Household;
  members: Member[];
  me?: Member;
};

const HouseholdContext = createContext<HouseholdContextValue | null>(null);

export function HouseholdProvider({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const session = useSession();
  const { data: members } = useQuery<Member>(MEMBERS_SQL, [id]);
  const { data: households } = useQuery<Household>(HOUSEHOLD_SQL, [id]);

  const household = households[0];
  const me = members.find((member) => member.user_id === session?.user.id);

  const value = useMemo(
    () => ({ id, household, members, me }),
    [id, household, members, me],
  );

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const value = useContext(HouseholdContext);
  if (!value)
    throw new Error("useHousehold must be used within HouseholdProvider");
  return value;
}
